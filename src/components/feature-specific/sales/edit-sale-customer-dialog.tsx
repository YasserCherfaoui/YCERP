import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/ui/star-rating-input";
import { useToast } from "@/hooks/use-toast";
import { Sale } from "@/models/data/sale.model";
import { updateFranchiseSaleCustomer } from "@/services/franchise-service";
import { updateSaleCustomer } from "@/services/sale-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  sale: Sale;
  /** Use franchise portal API (`/franchise/sales/...`) instead of company API */
  useFranchiseApi?: boolean;
  /** Query key segment for cache invalidation after save */
  salesQueryFranchiseId?: number;
}

export default function EditSaleCustomerDialog({
  sale,
  useFranchiseApi,
  salesQueryFranchiseId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(sale.phone_number ?? "");
  const [rating, setRating] = useState<number | undefined>(
    sale.rating ?? undefined
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setPhone(sale.phone_number ?? "");
      setRating(sale.rating ?? undefined);
    }
  }, [open, sale.phone_number, sale.rating]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        phone_number: phone.trim(),
        rating: rating ?? null,
      };
      if (useFranchiseApi) {
        return updateFranchiseSaleCustomer(sale.ID, payload);
      }
      return updateSaleCustomer(sale.ID, payload);
    },
    onSuccess: () => {
      if (salesQueryFranchiseId != null) {
        queryClient.invalidateQueries({
          queryKey: ["sales", salesQueryFranchiseId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["sales"] });
      }
      toast({
        title: "Customer info updated",
        description: "Phone and rating saved for this sale.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserCircle className="mr-2 h-4 w-4" />
          Customer info
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customer info — S-{sale.ID}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sale-customer-phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sale-customer-phone"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Customer phone"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRatingInput value={rating} onChange={setRating} />
            <p className="text-xs text-muted-foreground">
              Click a star to rate (1–5). Click again to clear.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={() => mutate()}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
