import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { YalidineParcelLabel } from "@/models/data/yalidine-label-batch.model";
import {
  downloadYalidineParcelLabel,
  getDownloadedYalidineParcelLabels,
  getPendingYalidineParcelLabels,
  mergeYalidineParcelLabels,
} from "@/services/woocommerce-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Download, Files, Loader2, Merge } from "lucide-react";
import { useMemo, useState } from "react";

function statusLabel(status: YalidineParcelLabel["status"]) {
  switch (status) {
    case "pending_upload":
      return "Uploading…";
    case "ready":
      return "Ready";
    case "failed":
      return "Upload failed";
    case "downloaded":
      return "Downloaded";
    default:
      return status;
  }
}

function statusVariant(
  status: YalidineParcelLabel["status"]
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

function formatDateHeading(dateKey: string) {
  if (dateKey === "unknown") return "Unknown date";
  try {
    return format(parseISO(dateKey), "EEEE, dd MMM yyyy");
  } catch {
    return dateKey;
  }
}

interface YalidineLabelsDrawerProps {
  companyId: number;
}

export default function YalidineLabelsDrawer({
  companyId,
}: YalidineLabelsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("pending");
  const [selectedPending, setSelectedPending] = useState<Set<number>>(new Set());
  const [selectedDownloaded, setSelectedDownloaded] = useState<Set<number>>(
    new Set()
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pendingKey = useMemo(
    () => ["yalidine-parcel-labels-pending", companyId],
    [companyId]
  );
  const downloadedKey = useMemo(
    () => ["yalidine-parcel-labels-downloaded", companyId],
    [companyId]
  );

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
  } = useQuery({
    queryKey: pendingKey,
    queryFn: () => getPendingYalidineParcelLabels(companyId),
    enabled: Boolean(companyId),
    refetchInterval: (query) => {
      const labels = query.state.data?.data?.labels ?? [];
      return labels.some((l) => l.status === "pending_upload") ? 3000 : false;
    },
  });

  const {
    data: downloadedData,
    isLoading: downloadedLoading,
  } = useQuery({
    queryKey: downloadedKey,
    queryFn: () => getDownloadedYalidineParcelLabels(companyId),
    enabled: Boolean(companyId) && open && tab === "downloaded",
  });

  const labels = pendingData?.data?.labels ?? [];
  const pendingCount = pendingData?.data?.pending_count ?? 0;
  const readyCount = pendingData?.data?.ready_count ?? 0;
  const groups = downloadedData?.data?.groups ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: pendingKey });
    queryClient.invalidateQueries({ queryKey: downloadedKey });
    setSelectedPending(new Set());
    setSelectedDownloaded(new Set());
  };

  const downloadOneMutation = useMutation({
    mutationFn: (labelId: number) =>
      downloadYalidineParcelLabel(labelId, companyId),
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
    mutationFn: (body: Parameters<typeof mergeYalidineParcelLabels>[1]) =>
      mergeYalidineParcelLabels(companyId, body),
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

  const busy = downloadOneMutation.isPending || mergeMutation.isPending;

  const toggleId = (
    set: Set<number>,
    setter: (s: Set<number>) => void,
    id: number,
    checked: boolean
  ) => {
    const next = new Set(set);
    if (checked) next.add(id);
    else next.delete(id);
    setter(next);
  };

  const readyPendingIds = labels
    .filter((l) => l.status === "ready")
    .map((l) => l.id);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Files className="h-4 w-4" />
          <span className="sm:hidden">Labels</span>
          <span className="hidden sm:inline">Yalidine Labels</span>
          {pendingCount > 0 && (
            <Badge
              className="ml-1 h-5 min-w-5 justify-center px-1.5"
              variant="default"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Yalidine labels</SheetTitle>
          <SheetDescription>
            One PDF page per parcel. Merge combines selected or ready labels into
            a single file.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 ? ` (${pendingCount})` : ""}
            </TabsTrigger>
            <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
          </TabsList>

          <TabsContent
            value="pending"
            className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {pendingLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : labels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No undownloaded labels.
                </p>
              ) : (
                labels.map((label) => (
                  <div
                    key={label.id}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedPending.has(label.id)}
                        disabled={label.status !== "ready" || busy}
                        onCheckedChange={(v) =>
                          toggleId(
                            selectedPending,
                            setSelectedPending,
                            label.id,
                            v === true
                          )
                        }
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {label.tracking_number || `Label #${label.id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Order #{label.woo_order_id} ·{" "}
                              {format(
                                new Date(label.created_at),
                                "dd MMM yyyy HH:mm"
                              )}
                            </p>
                          </div>
                          <Badge variant={statusVariant(label.status)}>
                            {statusLabel(label.status)}
                          </Badge>
                        </div>
                        {label.status === "failed" && label.upload_error && (
                          <p className="mt-1 text-xs text-destructive">
                            {label.upload_error}
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2"
                          disabled={
                            (label.status !== "ready" &&
                              label.status !== "downloaded") ||
                            busy
                          }
                          onClick={() => downloadOneMutation.mutate(label.id)}
                        >
                          {downloadOneMutation.isPending &&
                          downloadOneMutation.variables === label.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {pendingFetching && !pendingLoading && (
                <p className="text-xs text-muted-foreground">Refreshing…</p>
              )}
            </div>

            <SheetFooter className="mt-4 flex-col gap-2 border-t pt-4 sm:flex-col sm:space-x-0">
              <Button
                className="w-full"
                variant="secondary"
                disabled={selectedPending.size === 0 || busy}
                onClick={() =>
                  mergeMutation.mutate({ ids: Array.from(selectedPending) })
                }
              >
                {mergeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Merge className="h-4 w-4" />
                )}
                Merge selected ({selectedPending.size})
              </Button>
              <Button
                className="w-full"
                disabled={readyCount === 0 || busy}
                onClick={() => mergeMutation.mutate({ pending_all: true })}
              >
                {mergeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Merge className="h-4 w-4" />
                )}
                Merge all ready ({readyCount})
              </Button>
              {readyPendingIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={busy}
                  onClick={() => setSelectedPending(new Set(readyPendingIds))}
                >
                  Select all ready
                </Button>
              )}
            </SheetFooter>
          </TabsContent>

          <TabsContent
            value="downloaded"
            className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {downloadedLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No downloaded labels yet.
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.date} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          {formatDateHeading(group.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.count} label{group.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || group.date === "unknown"}
                        onClick={() =>
                          mergeMutation.mutate({
                            downloaded_date: group.date,
                          })
                        }
                      >
                        {mergeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Redownload day
                      </Button>
                    </div>
                    {group.labels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-start gap-2 rounded-md border p-3"
                      >
                        <Checkbox
                          checked={selectedDownloaded.has(label.id)}
                          disabled={busy}
                          onCheckedChange={(v) =>
                            toggleId(
                              selectedDownloaded,
                              setSelectedDownloaded,
                              label.id,
                              v === true
                            )
                          }
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {label.tracking_number || `Label #${label.id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Order #{label.woo_order_id}
                            {label.downloaded_at
                              ? ` · ${format(
                                  new Date(label.downloaded_at),
                                  "HH:mm"
                                )}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <SheetFooter className="mt-4 border-t pt-4">
              <Button
                className="w-full"
                disabled={selectedDownloaded.size === 0 || busy}
                onClick={() =>
                  mergeMutation.mutate({
                    ids: Array.from(selectedDownloaded),
                  })
                }
              >
                {mergeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Merge className="h-4 w-4" />
                )}
                Redownload selected ({selectedDownloaded.size})
              </Button>
            </SheetFooter>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
