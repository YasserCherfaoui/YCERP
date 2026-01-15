import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCompanyInventory } from "@/services/inventory-service";
import { getFranchiseInventory } from "@/services/franchise-service";
import { recordBrokenItems } from "@/services/broken-items-service";
import { processBrokenItemBarcode, BrokenItemEntry } from "@/utils/process-broken-item-barcodes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";

interface RecordBrokenItemsDialogProps {
  inventoryId: number;
  isFranchise?: boolean;
}

export default function RecordBrokenItemsDialog({ inventoryId, isFranchise = false }: RecordBrokenItemsDialogProps) {
  const company = useSelector((state: RootState) => state.company.company);
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [brokenItems, setBrokenItems] = useState<Array<BrokenItemEntry>>([]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: isFranchise ? ["franchise-inventory", franchise?.ID] : ["inventory"],
    queryFn: () => {
      if (isFranchise && franchise) {
        return getFranchiseInventory(franchise.ID);
      } else if (company) {
        return getCompanyInventory(company.ID);
      }
      throw new Error("No company or franchise found");
    },
    enabled: !!company || !!franchise,
  });

  const barcodes: string[] =
    inventory?.data?.items.map((item) => item.product_variant?.qr_code ?? "") ?? [];

  const myProcessBarcode = () =>
    processBrokenItemBarcode({
      inventory: inventory!,
      input,
      brokenItems,
      setBrokenItems,
      toast,
      setInput,
      barcodes,
    });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && open) {
        e.preventDefault();
        myProcessBarcode();
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    // Barcode scanners typically send data quickly, so we use a timeout
    timeout = setTimeout(() => {
      if (input.length > 0) {
        myProcessBarcode();
      }
    }, 1000);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [input, open]);

  function handleQuantityChange(event: ChangeEvent<HTMLInputElement>, index: number): void {
    const { value } = event.target;
    const updatedItems = [...brokenItems];
    updatedItems[index].quantity = Number.isNaN(parseInt(value)) ? 0 : parseInt(value);
    setBrokenItems(updatedItems);
  }

  function handleRemoveItem(index: number): void {
    const updatedItems = brokenItems.filter((_, i) => i !== index);
    setBrokenItems(updatedItems);
  }

  const { mutate: recordBrokenItemsMutation, isPending } = useMutation({
    mutationFn: recordBrokenItems,
    onSuccess: (data) => {
      setOpen(false);
      toast({
        title: "Broken Items Recorded",
        description: data.message || "Broken items were recorded successfully",
      });
      setBrokenItems([]);
      setReason("");
      setInput("");
      queryClient.invalidateQueries({
        queryKey: isFranchise ? ["franchise-inventory", franchise?.ID] : ["inventory"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording broken items",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (brokenItems.length === 0) {
      toast({
        title: "No items to record",
        description: "Please scan at least one item",
        variant: "destructive",
      });
      return;
    }

    recordBrokenItemsMutation({
      inventory_id: inventoryId,
      items: brokenItems.map((item) => ({
        qr_code: item.qr_code,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        reason: item.reason,
      })),
      reason: reason || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <AlertCircle className="mr-2 h-4 w-4" />
          Record Broken Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Record Broken Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode-input">Scan QR Code</Label>
            <Input
              id="barcode-input"
              placeholder="Scan or enter QR code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  myProcessBarcode();
                }
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">General Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for broken items..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {brokenItems.length > 0 && (
            <div className="space-y-2">
              <Label>Broken Items List</Label>
              <ScrollArea className="h-[300px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brokenItems.map((item, index) => (
                      <TableRow key={`${item.product_variant_id}-${index}`}>
                        <TableCell className="font-mono">{item.qr_code}</TableCell>
                        <TableCell>{item.product_variant_name || "N/A"}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(e, index)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Item reason..."
                            value={item.reason || ""}
                            onChange={(e) => {
                              const updated = [...brokenItems];
                              updated[index].reason = e.target.value;
                              setBrokenItems(updated);
                            }}
                            className="w-40"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || brokenItems.length === 0}>
            {isPending ? "Recording..." : "Record Broken Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
