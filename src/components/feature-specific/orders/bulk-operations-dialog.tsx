import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

interface BulkOperationsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCount: number;
  onDispatch: () => void;
  onExport: () => void;
}

export default function BulkOperationsDialog({ open, setOpen, selectedCount, onDispatch, onExport }: BulkOperationsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-lg">Selected Orders: <span className="font-bold">{selectedCount}</span></p>
        </div>
        <DialogFooter>
          <Button onClick={onDispatch} disabled={selectedCount === 0}>Dispatch Orders</Button>
          <Button onClick={onExport} variant="secondary" disabled={selectedCount === 0}>Export Orders</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 