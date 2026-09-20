import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { YalidineLabelBatch } from "@/models/data/yalidine-label-batch.model";
import {
  downloadYalidineLabelBatch,
  getPendingYalidineLabelBatches,
  mergeAllYalidineLabelBatches,
} from "@/services/woocommerce-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Files, Loader2, Merge } from "lucide-react";
import { useMemo, useState } from "react";

function statusLabel(status: YalidineLabelBatch["status"]) {
  switch (status) {
    case "pending_upload":
      return "Uploading…";
    case "ready":
      return "Ready";
    case "failed":
      return "Upload failed";
    default:
      return status;
  }
}

function statusVariant(
  status: YalidineLabelBatch["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "pending_upload":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

interface YalidineLabelsDrawerProps {
  companyId: number;
}

export default function YalidineLabelsDrawer({
  companyId,
}: YalidineLabelsDrawerProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["yalidine-label-batches-pending", companyId],
    [companyId]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => getPendingYalidineLabelBatches(companyId),
    enabled: Boolean(companyId),
    refetchInterval: (query) => {
      const batches = query.state.data?.data?.batches ?? [];
      return batches.some((b) => b.status === "pending_upload") ? 3000 : false;
    },
  });

  const batches = data?.data?.batches ?? [];
  const pendingCount = data?.data?.pending_count ?? 0;
  const readyCount = data?.data?.ready_count ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const downloadMutation = useMutation({
    mutationFn: (batchId: number) =>
      downloadYalidineLabelBatch(batchId, companyId),
    onSuccess: () => {
      toast({ title: "Label PDF downloaded" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Download failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const mergeMutation = useMutation({
    mutationFn: () => mergeAllYalidineLabelBatches(companyId),
    onSuccess: () => {
      toast({ title: "Merged labels downloaded" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({
        title: "Merge failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Files className="h-4 w-4" />
          <span className="sm:hidden">Labels</span>
          <span className="hidden sm:inline">Yalidine Labels</span>
          {pendingCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 justify-center px-1.5" variant="default">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pending Yalidine labels</SheetTitle>
          <SheetDescription>
            Export batches waiting to be downloaded. Merge all combines ready
            PDFs into one file.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No undownloaded label batches.
            </p>
          ) : (
            batches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-md border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Batch #{batch.id} · {batch.parcel_count} parcel
                      {batch.parcel_count === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(batch.created_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge variant={statusVariant(batch.status)}>
                    {statusLabel(batch.status)}
                  </Badge>
                </div>
                {batch.tracking_numbers?.length > 0 && (
                  <p className="truncate text-xs text-muted-foreground">
                    {batch.tracking_numbers.slice(0, 4).join(", ")}
                    {batch.tracking_numbers.length > 4
                      ? ` +${batch.tracking_numbers.length - 4}`
                      : ""}
                  </p>
                )}
                {batch.status === "failed" && batch.upload_error && (
                  <p className="text-xs text-destructive">{batch.upload_error}</p>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={
                    batch.status !== "ready" ||
                    downloadMutation.isPending ||
                    mergeMutation.isPending
                  }
                  onClick={() => downloadMutation.mutate(batch.id)}
                >
                  {downloadMutation.isPending &&
                  downloadMutation.variables === batch.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </Button>
              </div>
            ))
          )}
          {isFetching && !isLoading && (
            <p className="text-xs text-muted-foreground">Refreshing…</p>
          )}
        </div>

        <SheetFooter className="mt-4 border-t pt-4">
          <Button
            className="w-full"
            disabled={
              readyCount === 0 ||
              mergeMutation.isPending ||
              downloadMutation.isPending
            }
            onClick={() => mergeMutation.mutate()}
          >
            {mergeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Merge className="h-4 w-4" />
            )}
            Merge all ({readyCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
