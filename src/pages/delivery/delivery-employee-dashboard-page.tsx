import { RootState } from "@/app/store";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { logout } from "@/features/auth/delivery-slice";
import { useToast } from "@/hooks/use-toast";
import {
    getDeliveryOrders,
    updateOrderStatus,
} from "@/services/delivery-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, LogOut, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function () {
  useEffect(() => {
    document.title = "COSMOS Delivery App";
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const deliveryEmployee = useSelector(
    (state: RootState) => state.delivery.delivery_employee
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/delivery/login");
  };

  if (!deliveryEmployee) {
    return <div>Loading...</div>;
  }
  const queryClient = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["delivery-orders", deliveryEmployee?.ID],
    queryFn: () => getDeliveryOrders(deliveryEmployee?.ID),
  });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { mutate: updateOrderStatusMutation } = useMutation({
    mutationFn: (data: { order_id: number; status: string; reason?: string }) =>
      updateOrderStatus(data.order_id, data.status, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery-orders", deliveryEmployee?.ID],
      });
      toast({
        title: "Order status updated successfully",
        description: "The order status has been updated successfully",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to update order status",
        description: "Failed to update the order status",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col p-4 h-screen">
      <nav className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Good Morning, {deliveryEmployee?.name}
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
      <h1 className="text-2xl font-bold">Delivery Employee Dashboard</h1>
      {orders?.data && orders.data.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {orders.data
            .sort(
              (a, b) =>
                a.woo_shipping?.commune_name?.localeCompare(
                  b.woo_shipping?.commune_name || ""
                ) || 0
            )
            .map((order) => {
              const isToday =
                new Date(
                  order.woo_shipping?.expected_delivery_date ?? ""
                ).toLocaleDateString() == new Date().toLocaleDateString();
              return (
                <AccordionItem key={order.id} value={order.id.toString()}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full">
                      <span
                        className={`py-2 px-4 rounded-md ${
                          order.order_status === "delivered"
                            ? "bg-green-500 text-white"
                            : !isToday
                            ? "bg-yellow-500 text-white"
                            : order.order_status === "cancelled"
                            ? "bg-red-500 text-white"
                            : order.order_status === "no_reply"
                            ? "bg-blue-500 text-white"
                            : "bg-transparent"
                        }`}
                      >
                        {" "}
                        {order.woo_shipping?.commune_name} -{" "}
                        {order.customer_phone}
                      </span>
                      <span className="font-bold text-gray-500">
                        ({isToday ? "Today" : "Tomorrow"})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex gap-2 mb-4">
                      <Button asChild>
                        <a href={`tel:${order.customer_phone}`}>
                          Call Customer
                        </a>
                      </Button>
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Set Client Status</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Set Client Status</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4">
                            {order.order_status !== "delivered" && (
                              <Button
                                variant="outline"
                                className="bg-green-500 text-white"
                                onClick={() => {
                                  if (confirm("Confirm delivery?")) {
                                    updateOrderStatusMutation({
                                      order_id: order.id,
                                      status: "delivered",
                                    });
                                  }
                                }}
                              >
                                <Check />
                                Delivered
                              </Button>
                            )}
                            {isToday && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="bg-yellow-500 text-white"
                                  >
                                    <Clock />
                                    Tomorrow
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Reschedule for Tomorrow
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="reason">
                                        Reason for rescheduling
                                      </Label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Enter reason for rescheduling..."
                                      />
                                    </div>
                                    <Button
                                      onClick={() => {
                                        const reason = (
                                          document.getElementById(
                                            "reason"
                                          ) as HTMLTextAreaElement
                                        ).value;
                                        if (reason.trim()) {
                                          updateOrderStatusMutation({
                                            order_id: order.id,
                                            status: "tomorrow",
                                            reason,
                                          });
                                        } else {
                                          alert(
                                            "Please provide a reason for rescheduling"
                                          );
                                        }
                                      }}
                                    >
                                      Confirm Reschedule
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {order.order_status !== "cancelled" && (
                              <Button
                                variant="outline"
                                className="bg-red-500 text-white"
                                onClick={() => {
                                  if (confirm("Confirm cancellation?")) {
                                    updateOrderStatusMutation({
                                      order_id: order.id,
                                      status: "cancelled",
                                    });
                                  }
                                }}
                              >
                                <X />
                                Cancelled
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="bg-gray-500 text-white"
                              onClick={() => {
                                if (confirm("Confirm no reply?")) {
                                  updateOrderStatusMutation({
                                    order_id: order.id,
                                    status: "no_reply",
                                  });
                                }
                              }}
                            >
                              <MessageCircle />
                              No Reply
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="mb-4 border border-red-200 p-4">
                      Comments: {order.comments}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>QR Code</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.confirmed_order_items?.map((item) => (
                          <TableRow key={item.product_variant?.qr_code}>
                            <TableCell>
                              {item.product_variant?.qr_code}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell>Total</TableCell>
                          <TableCell>{order.final_price}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      )}
    </div>
  );
}
