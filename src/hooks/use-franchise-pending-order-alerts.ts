import {
  buildFranchiseOrdersWebSocketUrl,
  listFranchiseWooOrders,
} from "@/services/franchise-service";
import type { WooOrder } from "@/models/data/woo-order.model";
import { useCallback, useEffect, useRef, useState } from "react";

interface FranchiseOrderPendingEvent {
  event: string;
  data: WooOrder;
}

function isPendingOrder(order: WooOrder | null | undefined): order is WooOrder {
  return !!order && order.id > 0 && order.franchise_order_status === "pending";
}

function orderSortKey(order: WooOrder): number {
  const raw = order.created_at || order.date_created;
  const t = raw ? Date.parse(String(raw)) : NaN;
  return Number.isFinite(t) ? t : order.id;
}

function mergePendingQueue(
  prev: WooOrder[],
  incoming: WooOrder[]
): WooOrder[] {
  const byId = new Map<number, WooOrder>();
  for (const o of prev) {
    if (isPendingOrder(o)) byId.set(o.id, o);
  }
  for (const o of incoming) {
    if (isPendingOrder(o)) byId.set(o.id, o);
  }
  return [...byId.values()].sort((a, b) => {
    const ka = orderSortKey(a);
    const kb = orderSortKey(b);
    if (ka !== kb) return ka - kb;
    return a.id - b.id;
  });
}

async function fetchPendingOrders(): Promise<WooOrder[]> {
  const res = await listFranchiseWooOrders();
  const rows = (res.data ?? []) as WooOrder[];
  return rows.filter(isPendingOrder);
}

/**
 * Keeps a FIFO queue of pending ship-from-store orders for the franchise portal.
 * Catch-up on connect/reconnect + live WS `franchise_order_pending` events.
 */
export function useFranchisePendingOrderAlerts(franchiseId: number | undefined) {
  const [queue, setQueue] = useState<WooOrder[]>([]);
  const shouldReconnect = useRef(true);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const enqueue = useCallback((orders: WooOrder[]) => {
    setQueue((prev) => mergePendingQueue(prev, orders));
  }, []);

  const dismissOrder = useCallback((orderId: number) => {
    setQueue((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const loadCatchUp = useCallback(async () => {
    try {
      const pending = await fetchPendingOrders();
      enqueue(pending);
    } catch (err) {
      console.error("Failed to load pending franchise orders:", err);
    }
  }, [enqueue]);

  useEffect(() => {
    if (!franchiseId || franchiseId <= 0) {
      setQueue([]);
      return;
    }

    shouldReconnect.current = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    const connect = () => {
      const url = buildFranchiseOrdersWebSocketUrl(franchiseId, token);
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          void loadCatchUp();
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as FranchiseOrderPendingEvent;
            if (
              message.event === "franchise_order_pending" &&
              isPendingOrder(message.data)
            ) {
              enqueue([message.data]);
            }
          } catch (err) {
            console.error("Failed to parse franchise order WS message:", err);
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (shouldReconnect.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 2000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error("Failed to open franchise order WebSocket:", err);
        if (shouldReconnect.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 2000);
        }
      }
    };

    // Initial catch-up even before WS opens (covers WS failure).
    void loadCatchUp();
    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [franchiseId, enqueue, loadCatchUp]);

  const current = queue[0] ?? null;

  return { current, queueLength: queue.length, dismissOrder };
}
