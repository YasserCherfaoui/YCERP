import { baseUrl } from "@/app/constants";
import { Order } from "@/models/data/order.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { getWooCommerceOrder, getWooCommerceOrders } from "@/services/woocommerce-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";


interface OrderEvent {
    order: WooOrder;
    event: "created" | "updated" | "deleted";
}

const useWebSocket = (url: string) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<OrderEvent | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnect = useRef(true);

    const connect = () => {
        try {
            ws.current = new WebSocket(url);
            ws.current.onopen = () => {
                setIsConnected(true);
                console.log("Connected to WebSocket");
            }
            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as OrderEvent;
                    setLastMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            }
            ws.current.onclose = (event) => {
                setIsConnected(false);
                console.log("Disconnected from WebSocket", event);
                if (shouldReconnect.current) {
                    // Try to reconnect after 2 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log("Attempting to reconnect WebSocket...");
                        connect();
                    }, 2000);
                }
            }
            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                // Close the socket to trigger onclose and reconnection
                ws.current?.close();
            }
        } catch (error) {
            console.error("Failed to connect to WebSocket:", error);
            // Try to reconnect after 2 seconds
            if (shouldReconnect.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 2000);
            }
        }
    };

    useEffect(() => {
        shouldReconnect.current = true;
        connect();

        return () => {
            shouldReconnect.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            ws.current?.close();
        };
    }, [url]);

    return { isConnected, lastMessage };
}

export const useOrdersWithRealtime = (
    page = 0,
    status?: string,
    taken_by_id?: number,
    wilaya?: string,
    phone_number?: string,
    yalidine_status?: string,
    employee_id?: number,
    delivery_date?: string,
    confirmed_variant_id?: number,
    company_id?: number
) => {
    const wsUrl = `${baseUrl.startsWith("https") ? "wss" : "ws"}://${baseUrl.replace("https://", "").replace("http://", "")}/woocommerce/ws/orders`;
    const queryClient = useQueryClient();
    const { lastMessage } = useWebSocket(wsUrl);
    // Main orders query
    const ordersQuery = useQuery({
        queryKey: ['orders', page, status, taken_by_id, wilaya, phone_number, yalidine_status, employee_id, delivery_date, confirmed_variant_id],
        queryFn: () => getWooCommerceOrders({
            _page: page,
            status: status,
            taken_by_id: taken_by_id,
            wilaya: wilaya,
            phone_number: phone_number,
            yalidine_status: yalidine_status,
            employee_id: employee_id,
            delivery_date: delivery_date,
            confirmed_variant_id: confirmed_variant_id,
            company_id: company_id,
        }),
    });
    // Handle WebSocket messages
    useEffect(() => {
        if (!lastMessage) return;

        const { event, order } = lastMessage;
        const orderId = order?.id;
        switch (event) {
            case 'created':
                // Add new order to the cache
                if (order) {
                    queryClient.setQueryData(['orders'], (oldOrders: WooOrder[] = []) => {
                        return [order, ...oldOrders];
                    });
                } else {
                    // Refetch if we don't have the full order data
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
                break;

            case 'updated':
                // Update existing order in cache
                if (order) {
                    // Update orders list
                    queryClient.setQueryData(['orders'], (oldOrders: Order[] = []) => {
                        return oldOrders.map(o => o.id === order.id ? order : o);
                    });

                    // Update individual order cache
                    queryClient.setQueryData(['orders', order.id], order);
                } else {
                    // Refetch specific order
                    queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
                break;

            case 'deleted':
                // Remove order from cache
                queryClient.setQueryData(['orders'], (oldOrders: Order[] = []) => {
                    return oldOrders.filter(o => o.id !== orderId);
                });
                queryClient.removeQueries({ queryKey: ['orders', orderId] });
                break;
        }

    }, [lastMessage, queryClient]);

    return {
        orders: ordersQuery.data?.data?.orders || [],
        meta: ordersQuery.data?.data?.meta,
        isLoading: ordersQuery.isLoading,
        error: ordersQuery.error,
        isConnected: true, // You can expose WebSocket connection status if needed
    };
};

// Hook for individual order (for dialog)
export const useOrder = (orderId: number | null) => {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => getWooCommerceOrder(orderId ?? 0),
        enabled: !!orderId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}