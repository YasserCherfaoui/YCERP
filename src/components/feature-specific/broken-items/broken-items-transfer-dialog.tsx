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
import { Checkbox } from "@/components/ui/checkbox";
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
import { BrokenItem } from "@/models/data/broken-item.model";
import { getFranchiseInventory } from "@/services/franchise-service";
import { createTransferRequest } from "@/services/broken-items-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { baseUrl } from "@/app/constants";
import { APIResponse } from "@/models/responses/api-response.model";

export default function BrokenItemsTransferDialog() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory } = useQuery({
    queryKey: ["franchise-inventory", franchise?.ID],
    queryFn: () => getFranchiseInventory(franchise?.ID ?? 0),
    enabled: !!franchise,
  });

  // Fetch broken items for the franchise
  const { data: brokenItemsData, isLoading: isLoadingBrokenItems } = useQuery<APIResponse<BrokenItem[]>>({
    queryKey: ["broken-items", franchise?.ID],
    queryFn: async () => {
      const response = await fetch(
        `${baseUrl}/broken-items?franchise_id=${franchise?.ID}&status=pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch broken items");
      return response.json();
    },
    enabled: !!franchise && open,
  });

  const brokenItems = brokenItemsData?.data || [];

  const handleToggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === brokenItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(brokenItems.map((item) => item.ID)));
    }
  };

  const { mutate: createTransferMutation, isPending } = useMutation({
    mutationFn: createTransferRequest,
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Transfer Request Created",
        description: "Your transfer request has been sent to the company for approval",
      });
      setSelectedItems(new Set());
      setNotes("");
      queryClient.invalidateQueries({
        queryKey: ["broken-items", franchise?.ID],
      });
      queryClient.invalidateQueries({
        queryKey: ["broken-items-transfers"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating transfer request",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one broken item to transfer",
        variant: "destructive",
      });
      return;
    }

    createTransferMutation({
      broken_item_ids: Array.from(selectedItems),
      notes: notes || undefined,
    });
  };

  if (!franchise) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Send to Company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Send Broken Items to Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {isLoadingBrokenItems ? (
            <div className="text-center py-8">Loading broken items...</div>
          ) : brokenItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending broken items found in your inventory
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Broken Items to Transfer</Label>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedItems.size === brokenItems.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <ScrollArea className="h-[400px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.size === brokenItems.length && brokenItems.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Broken Qty</TableHead>
                      <TableHead>Recovered</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brokenItems.map((item) => (
                      <TableRow key={item.ID}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.ID)}
                            onCheckedChange={() => handleToggleItem(item.ID)}
                          />
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.product_variant?.qr_code || "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.product_variant?.name || item.inventory_item?.name || "N/A"}
                        </TableCell>
                        <TableCell>{item.broken_quantity}</TableCell>
                        <TableCell>{item.recovered_quantity}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.reason || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="text-sm text-gray-500">
                Selected: {selectedItems.size} of {brokenItems.length} items
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || selectedItems.size === 0 || brokenItems.length === 0}
          >
            {isPending ? "Creating Request..." : "Create Transfer Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
