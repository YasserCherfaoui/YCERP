import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { InventoryItemTransactionLog } from "@/models/data/inventory.model";
import { History } from "lucide-react";
import { useState } from "react";

interface Props {
  logs: InventoryItemTransactionLog[];
}

export default function ({ logs }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger>
        <Button variant={"ghost"}>
          <History />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit ">
        <DialogHeader>
          <DialogTitle>Transaction Logs</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] ">
          <Table >
            <TableHeader>
              <TableHead>Date</TableHead>
              <TableHead>Qty Before</TableHead>
              <TableHead>Qty Change</TableHead>
              <TableHead>Qty After</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Reference Type</TableHead>
            </TableHeader>
            <TableBody>
              {logs.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()).map((l) => (
                <TableRow key={l.ID}>
                  <TableCell>
                    {new Date(l.CreatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{l.quantity_before}</TableCell>
                  <TableCell>{l.quantity_change}</TableCell>
                  <TableCell>{l.quantity_after}</TableCell>
                  <TableCell>{l.reference_id}</TableCell>
                  <TableCell>{l.reference_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
