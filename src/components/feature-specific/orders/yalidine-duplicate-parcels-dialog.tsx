import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  compareDuplicateYalidineParcels,
  fixDuplicateYalidineParcels,
} from "@/services/woocommerce-service";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderIds: number[];
};

export default function YalidineDuplicateParcelsDialog({
  open,
  setOpen,
  orderIds,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const compareQuery = useQuery({
    queryKey: ["yalidine-duplicate-parcels", orderIds],
    queryFn: () => compareDuplicateYalidineParcels(orderIds),
    enabled: open && orderIds.length > 0,
  });

  const orders = compareQuery.data?.data?.orders ?? [];
  const deletableCount = orders.reduce(
    (n, order) => n + order.parcels.filter((parcel) => parcel.deletable).length,
    0
  );

  const { mutate: deleteExtras, isPending } = useMutation({
    mutationFn: () => fixDuplicateYalidineParcels(orderIds),
    onSuccess: (data) => {
      const deleted = data.data?.deleted?.length ?? 0;
      const failed = data.data?.failed?.length ?? 0;
      toast({
        title: "Duplicate parcels processed",
        description: `Deleted ${deleted}. ${failed} could not be deleted.`,
      });
      setConfirming(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["yalidine-duplicate-parcels"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete duplicate parcels",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setConfirming(false);
        setOpen(next);
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Duplicate Yalidine parcels</DialogTitle>
          <DialogDescription>
            Compares the selected orders with Yalidine. The parcel that matches the stored tracking
            number is kept. Extra parcels can be deleted only while Yalidine still marks them En
            préparation.
          </DialogDescription>
        </DialogHeader>

        {orderIds.length === 0 && (
          <p className="text-sm text-muted-foreground">Select orders in the table first.</p>
        )}
        {compareQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking Yalidine…
          </div>
        )}
        {compareQuery.isError && (
          <p className="text-sm text-destructive">
            {(compareQuery.error as Error).message}
          </p>
        )}
        {!compareQuery.isLoading && !compareQuery.isError && orderIds.length > 0 && orders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            None of the selected orders have more than one Yalidine parcel.
          </p>
        )}
        {orders.length > 0 && (
          <div className="max-h-[420px] overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.flatMap((order) =>
                  order.parcels.map((parcel) => (
                    <TableRow key={`${order.woo_order_id}-${parcel.tracking}`}>
                      <TableCell>
                        {order.order_number || order.woo_order_id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{parcel.tracking}</TableCell>
                      <TableCell>{parcel.last_status || "—"}</TableCell>
                      <TableCell>
                        {parcel.keeper ? (
                          <Badge>Keeper</Badge>
                        ) : parcel.deletable ? (
                          <Badge variant="destructive">Extra, can delete</Badge>
                        ) : (
                          <Badge variant="secondary">Kept in Yalidine</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          {confirming ? (
            <>
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={isPending}>
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={isPending || deletableCount === 0}
                onClick={() => deleteExtras()}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm delete {deletableCount}
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              disabled={deletableCount === 0 || compareQuery.isLoading}
              onClick={() => setConfirming(true)}
            >
              Delete extras
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
