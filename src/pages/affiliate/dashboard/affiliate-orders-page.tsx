import AffiliateImportOrdersCSVDialog from "@/components/feature-specific/affiliate/affiliate-import-orders-csv-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AffiliateOrder, AffiliateOrdersResponse, GetAffiliateOrdersParams, getAffiliateOrders } from "@/services/affiliate-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, Loader2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

export default function AffiliateOrdersPage() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<string>("all");
  const [phone, setPhone] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [importOpen, setImportOpen] = useState<boolean>(false);

  const params = useMemo<GetAffiliateOrdersParams>(() => ({
    page,
    limit,
    status: status === "all" ? undefined : status,
    start: start || undefined,
    end: end || undefined,
    phone_number: phone || undefined,
  }), [page, limit, status, start, end, phone]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["affiliate-orders", params],
    queryFn: async () => {
      const res = await getAffiliateOrders(params);
      if (res.status === "success" && res.data) return res.data;
      throw new Error(res.error?.description || res.message || "Failed to fetch orders");
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const orders = (data as AffiliateOrdersResponse | undefined)?.orders ?? [];
  const meta = (data as AffiliateOrdersResponse | undefined)?.meta;

  const handleClearFilters = () => {
    setStatus("all");
    setPhone("");
    setStart("");
    setEnd("");
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["affiliate-orders"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <Button onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="relaunched">Relaunched</SelectItem>
                  <SelectItem value="packing">Packing</SelectItem>
                  <SelectItem value="dispatching">Dispatching</SelectItem>
                  <SelectItem value="dispaching">Dispaching</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2"><CalendarRange className="h-4 w-4" /> Start</label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2"><CalendarRange className="h-4 w-4" /> End</label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => setPage(1)} disabled={isFetching}>Apply</Button>
              <Button variant="ghost" onClick={handleClearFilters} disabled={isFetching}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading orders...
            </div>
          ) : error ? (
            <div className="py-8 text-destructive">{error instanceof Error ? error.message : "Failed to load"}</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o: AffiliateOrder) => (
                    <TableRow key={o.id}>
                      <TableCell>#{o.id}</TableCell>
                      <TableCell>{o.billing_name}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{o.shipping_address1}</TableCell>
                      <TableCell>{new Intl.NumberFormat().format(o.amount)}</TableCell>
                      <TableCell className="capitalize">{o.order_status}</TableCell>
                      <TableCell>{o.date_created ? format(new Date(o.date_created), "yyyy-MM-dd HH:mm") : ""}</TableCell>
                      <TableCell>
                        {o.commission ? `${new Intl.NumberFormat().format(o.commission.amount)} (${o.commission.status})` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {meta?.current_page} of {meta?.total_pages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={isFetching || !meta || !meta.has_previous}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching || !meta || !meta.has_next}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AffiliateImportOrdersCSVDialog open={importOpen} setOpen={setImportOpen} />
    </div>
  );
}


