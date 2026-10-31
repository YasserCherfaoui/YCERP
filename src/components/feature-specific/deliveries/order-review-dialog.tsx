import { liquidGlass, orderStatus, tile, TileColor } from "@/components/feature-specific/crm/crm-theme";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateReviewRequest } from "@/models/data/review.model";
import { WooOrder } from "@/models/data/woo-order.model";
import { createReviewSchema } from "@/schemas/review";
import { getCustomer, updateCustomer } from "@/services/customer-service";
import { createReview } from "@/services/review-service";
import { getWooCommerceOrder } from "@/services/woocommerce-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Cake,
  CalendarClock,
  CreditCard,
  Frown,
  Info,
  Loader2,
  Meh,
  MessageSquareQuote,
  Package,
  Phone,
  ShoppingCart,
  Smile,
  Star,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface OrderReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  customerPhone: string;
}

const RATING_LABELS = [
  { label: "Very bad", chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-100" },
  { label: "Bad", chip: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-100" },
  { label: "Okay", chip: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100" },
  { label: "Good", chip: "bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-100" },
  { label: "Excellent", chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100" },
];

const SATISFACTION = [
  {
    value: "satisfied",
    label: "Satisfied",
    icon: Smile,
    selected: "border-emerald-500 bg-emerald-500 text-white shadow-sm",
    idle: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
  },
  {
    value: "moderately_satisfied",
    label: "Moderately",
    icon: Meh,
    selected: "border-amber-500 bg-amber-500 text-white shadow-sm",
    idle: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
  },
  {
    value: "unsatisfied",
    label: "Unsatisfied",
    icon: Frown,
    selected: "border-rose-500 bg-rose-500 text-white shadow-sm",
    idle: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
  },
] as const;

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "d MMM yyyy, HH:mm");
};

function Panel({ icon: Icon, color, title, children }: { icon: LucideIcon; color: TileColor; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className={cn("flex size-7 items-center justify-center rounded-lg", tile[color].icon)}>
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function OrderReviewDialog({
  open,
  onOpenChange,
  orderId,
  customerPhone,
}: OrderReviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [satisfactionStatus, setSatisfactionStatus] = useState<string>("");
  const [followUpCallDate, setFollowUpCallDate] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["woo-order", orderId],
    queryFn: () => getWooCommerceOrder(orderId),
    enabled: open && !!orderId,
  });

  const order: WooOrder | undefined = orderData?.data;

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerPhone, companyId],
    queryFn: () => getCustomer(customerPhone, companyId),
    enabled: !!customerPhone && open,
  });
  const customer = customerData?.data?.customer;
  const customerName = customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : "";

  useEffect(() => {
    if (customerData?.data?.customer?.birthday && open) {
      const customerBirthday = customerData.data.customer.birthday;
      if (customerBirthday) {
        const dateStr =
          typeof customerBirthday === "string"
            ? customerBirthday.split("T")[0]
            : new Date(customerBirthday).toISOString().split("T")[0];
        setBirthday(dateStr);
      }
    }
  }, [customerData, open]);

  useEffect(() => {
    if (!open) {
      setRating(5);
      setHoverRating(null);
      setComment("");
      setSatisfactionStatus("");
      setFollowUpCallDate("");
      setBirthday("");
    }
  }, [open]);

  const createMut = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: async () => {
      const currentBirthday = customerData?.data?.customer?.birthday;
      const currentBirthdayStr = currentBirthday
        ? typeof currentBirthday === "string"
          ? currentBirthday.split("T")[0]
          : new Date(currentBirthday).toISOString().split("T")[0]
        : null;

      if (birthday && birthday !== currentBirthdayStr) {
        try {
          await updateCustomer(
            customerPhone,
            { birthday: birthday || null },
            companyId
          );
        } catch (error) {
          console.error("Failed to update customer birthday:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["customer", customerPhone] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["woo-order", orderId] });
      toast({
        title: "Review saved",
        description: customerName ? `Recorded for ${customerName}.` : "Review created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!customerPhone) {
      toast({
        title: "Error",
        description: "Customer phone is required",
        variant: "destructive",
      });
      return;
    }

    const data: CreateReviewRequest = {
      customer_phone: customerPhone,
      woo_order_id: orderId || null,
      rating,
      comment,
      satisfaction_status: satisfactionStatus || null,
      follow_up_call_date: followUpCallDate || null,
    };

    const validation = createReviewSchema.safeParse(data);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    createMut.mutate(data);
  };

  const shown = hoverRating ?? rating;
  const ratingStyle = RATING_LABELS[shown - 1];
  const status = order ? orderStatus(order.order_status) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex max-h-[95vh] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:p-0", liquidGlass, "bg-white/80 dark:bg-slate-950/80")}>
        <DialogHeader className="space-y-3 border-b border-white/40 bg-gradient-to-r from-amber-100/80 via-orange-50/60 to-rose-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-rose-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
              <MessageSquareQuote className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle>Review order #{order?.number || orderId}</DialogTitle>
              <DialogDescription>Check the order, then record how the customer felt about it.</DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 font-medium tabular-nums shadow-sm dark:bg-white/10">
              <Phone className="size-3.5 text-sky-600 dark:text-sky-300" />
              {customerPhone}
              {customerName && <span className="font-normal text-muted-foreground">· {customerName}</span>}
            </span>
            {status && (
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", status.chip)}>
                {status.label}
              </Badge>
            )}
            {order && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 font-semibold tabular-nums text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                {order.final_price || order.total} {order.currency || "DZD"}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-h-0 space-y-4 overflow-y-auto p-5">
            {orderLoading ? (
              <div className="space-y-3" aria-busy="true">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            ) : order ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Status", value: status?.label ?? order.order_status, color: "indigo" as const },
                    { label: "Total", value: `${order.final_price || order.total} ${order.currency || "DZD"}`, color: "emerald" as const },
                    { label: "Tracking", value: order.tracking_number || "—", color: "violet" as const, mono: true },
                    { label: "Created", value: formatDate(order.date_created), color: "sky" as const },
                  ].map((stat) => (
                    <div key={stat.label} className={cn("rounded-xl border p-3", tile[stat.color].surface)}>
                      <div className="text-xs font-medium opacity-70">{stat.label}</div>
                      <div className={cn("mt-1 truncate font-semibold", stat.mono && "font-mono text-sm")}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <Panel icon={Info} color="indigo" title="Order information">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <Field label="Order ID">{order.id}</Field>
                    <Field label="Woo ID">{order.woo_id}</Field>
                    <Field label="Woo status">{order.status}</Field>
                    <Field label="Amount">{order.amount}</Field>
                    <Field label="Payment method">{order.payment_method_title || order.payment_method || "—"}</Field>
                    <Field label="Modified">{formatDate(order.date_modified)}</Field>
                  </div>
                </Panel>

                <Panel icon={User} color="sky" title="Customer">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Field label="Customer ID">{order.customer_id || "—"}</Field>
                    <Field label="Email">{order.customer_email || "—"}</Field>
                    <Field label="Primary phone">{order.customer_phone || "—"}</Field>
                    <Field label="Secondary phone">{order.customer_phone_2 || "—"}</Field>
                  </div>
                </Panel>

                <div className="grid gap-4 md:grid-cols-2">
                  <Panel icon={CreditCard} color="violet" title="Billing address">
                    <div className="space-y-0.5 text-sm">
                      <div className="font-medium">{order.billing_name || "—"}</div>
                      <div className="text-muted-foreground">
                        {[order.billing_address_1, order.billing_city].filter(Boolean).join(", ") || "—"}
                      </div>
                    </div>
                  </Panel>
                  <Panel icon={Truck} color="emerald" title="Shipping address">
                    <div className="space-y-0.5 text-sm">
                      <div className="font-medium">{order.shipping_name || "—"}</div>
                      <div className="text-muted-foreground">
                        {[order.shipping_address_1, order.shipping_city].filter(Boolean).join(", ") || "—"}
                      </div>
                    </div>
                  </Panel>
                </div>

                <Panel icon={ShoppingCart} color="amber" title={`Items (${order.line_items?.length || 0})`}>
                  {(order.line_items ?? []).length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">No items</p>
                  ) : (
                    <div className="space-y-1.5">
                      {order.line_items.map((item, idx) => (
                        <div
                          key={item.id ?? idx}
                          className="flex items-center justify-between gap-3 rounded-lg bg-amber-50/70 px-3 py-2 dark:bg-amber-500/10"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              SKU {item.sku || "N/A"} · Qty {item.quantity}
                            </div>
                          </div>
                          <div className="shrink-0 text-right text-sm tabular-nums">
                            <div className="font-medium">{item.price}</div>
                            <div className="text-xs text-muted-foreground">Total {item.total}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <span className={cn("flex size-11 items-center justify-center rounded-xl", tile.slate.icon)}>
                  <Package className="size-5" />
                </span>
                <p className="text-sm font-medium">Order not found</p>
              </div>
            )}
          </div>

          <div className="min-h-0 space-y-5 overflow-y-auto border-t border-white/40 bg-white/40 p-5 dark:border-white/10 dark:bg-white/[0.03] lg:border-l lg:border-t-0">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHoverRating(null)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="cursor-pointer rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 motion-safe:transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "size-8 motion-safe:transition-colors",
                          star <= shown ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-slate-300 dark:text-slate-600"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ratingStyle.chip)}>
                  {ratingStyle.label}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Satisfaction</Label>
              <div role="radiogroup" aria-label="Customer satisfaction" className="grid grid-cols-3 gap-2">
                {SATISFACTION.map((option) => {
                  const Icon = option.icon;
                  const selected = satisfactionStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSatisfactionStatus(selected ? "" : option.value)}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium motion-safe:transition-colors",
                        selected ? option.selected : option.idle
                      )}
                    >
                      <Icon className="size-5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-review-comment">Comment</Label>
              <Textarea
                id="order-review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did the customer say?"
                className="resize-none bg-white/70 focus-visible:ring-amber-400 dark:bg-white/5"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="order-review-follow-up" className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5 text-violet-500" />
                  Follow-up call
                </Label>
                <Input
                  id="order-review-follow-up"
                  type="date"
                  value={followUpCallDate}
                  onChange={(e) => setFollowUpCallDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="bg-white/70 focus-visible:ring-violet-400 dark:bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-review-birthday" className="flex items-center gap-1.5">
                  <Cake className="size-3.5 text-pink-500" />
                  Birthday
                </Label>
                <Input
                  id="order-review-birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="bg-white/70 focus-visible:ring-pink-400 dark:bg-white/5"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-white/40 px-5 py-3 dark:border-white/10 sm:space-x-0">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createMut.isPending || orderLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400"
          >
            {createMut.isPending ? <Loader2 className="animate-spin" /> : <Star className="fill-white" />}
            {createMut.isPending ? "Saving…" : "Save review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
