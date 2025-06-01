import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface BulkOperationsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCount: number;
  onDispatch: () => void;
  dispatchLoading: boolean;
  exportLoading: boolean;
  onExport: () => void;
}

export default function BulkOperationsDialog({ open, setOpen, selectedCount, onDispatch, onExport, dispatchLoading, exportLoading }: BulkOperationsDialogProps) {
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
          <Button  onClick={onDispatch} disabled={selectedCount === 0 || dispatchLoading}>Dispatch Orders {dispatchLoading && <Loader2 className="w-4 h-4 ml-2" />}</Button>
          <Button onClick={onExport} variant="secondary" disabled={selectedCount === 0 || exportLoading}>Export Orders {exportLoading && <Loader2 className="w-4 h-4 ml-2" />}</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 