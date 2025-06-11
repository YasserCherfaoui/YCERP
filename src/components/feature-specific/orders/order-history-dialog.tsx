import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Qualification } from "@/models/data/qualification.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddOrderHistoryDialog from "./add-order-history-dialog";


function HistoryList({ title, histories }: { title: string; histories: { status: string; date: string | Date; ID: number ; qualification?: Qualification}[] }) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ScrollArea className="max-h-40 border rounded p-2">
        {histories && histories.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {histories.map((h) => (
              <li key={h.ID} className="flex justify-between items-center text-sm">
                <span>{h.status || "No status"}</span>
                <span 
                style={{
                  display: h.qualification ? "block" : "none",
                  color:"black",
                  backgroundColor: h.qualification?.color || "gray",
                  padding: "2px 4px",
                  borderRadius: "4px",
                }}
                >{h.qualification?.name || "No qualification"}</span>
                <span className="text-xs text-muted-foreground">{typeof h.date === 'string' ? new Date(h.date).toLocaleString() : h.date.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-muted-foreground">No {title.toLowerCase()}.</div>
        )}
      </ScrollArea>
    </div>
  );
}

export default function OrderHistoryDialog({ order, open, setOpen }: { order: WooOrder; open: boolean; setOpen: (open: boolean) => void; ordersQueryKey?: any[] }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Histories</DialogTitle>
          <DialogDescription>View and manage order history records for this order.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-6 flex-col md:flex-row">
          <HistoryList title="Yalidine Order Histories" histories={order.yalidine_order_histories || []} />
          <HistoryList title="Order Histories" histories={order.order_histories || []} />
        </div>
        <DialogFooter>
          <Button variant="default" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add OrderHistory
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
        <AddOrderHistoryDialog open={addDialogOpen} setOpen={setAddDialogOpen} orderId={order.id} />
      </DialogContent>
    </Dialog>
  );
} 