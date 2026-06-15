import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { WooOrder } from "@/models/data/woo-order.model";
import {
  getCompanyWooOrderShippingLabelUrl,
  uploadWooOrderShippingLabel,
} from "@/services/franchise-fulfillment-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRef } from "react";

interface ShippingLabelPreviewDialogProps {
  order: WooOrder;
  companyId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShippingLabelPreviewDialog({
  order,
  companyId,
  open,
  onOpenChange,
}: ShippingLabelPreviewDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const labelQuery = useQuery({
    queryKey: ["company-shipping-label-url", order.id, companyId],
    queryFn: () => getCompanyWooOrderShippingLabelUrl(order.id, companyId),
    enabled: open && !!order.has_shipping_label,
    staleTime: 0,
  });

  const signedUrl = labelQuery.data?.data?.signed_url;

  const replaceMutation = useMutation({
    mutationFn: (file: File) =>
      uploadWooOrderShippingLabel(order.id, file, companyId),
    onSuccess: async () => {
      toast({
        title: "Label replaced",
        description: `Shipping label updated for order #${order.number || order.id}.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-franchise-fulfillment-orders"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["company-shipping-label-url", order.id, companyId],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Replace failed",
        description: error.message || "Could not replace shipping label.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>
            Shipping label — order #{order.number || order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[50vh] flex-1 overflow-hidden rounded-md border bg-muted/30">
          {labelQuery.isLoading || replaceMutation.isPending ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : labelQuery.isError ? (
            <div className="flex h-full min-h-[50vh] items-center justify-center p-4 text-center text-sm text-destructive">
              {labelQuery.error instanceof Error
                ? labelQuery.error.message
                : "Failed to load label."}
            </div>
          ) : signedUrl ? (
            <iframe
              title={`Shipping label for order ${order.number || order.id}`}
              src={signedUrl}
              className="h-[60vh] w-full"
            />
          ) : (
            <div className="flex h-full min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
              No preview available.
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) replaceMutation.mutate(file);
            e.target.value = "";
          }}
        />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            disabled={replaceMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {replaceMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
