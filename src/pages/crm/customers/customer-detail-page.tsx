import { RootState } from "@/app/store";
import CrmBackdrop from "@/components/feature-specific/crm/crm-backdrop";
import CustomerHistoryCard from "@/components/feature-specific/crm/customer-history-card";
import {
  avatarTone,
  customerInitials,
  liquidGlass,
  rateTier,
  tile,
  TileColor,
  tone,
} from "@/components/feature-specific/crm/crm-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Customer, CustomerStats } from "@/models/data/customer.model";
import CreateReviewDialog from "@/pages/crm/reviews/create-review-dialog";
import { getCustomer, updateCustomer } from "@/services/customer-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Banknote,
  Cake,
  CalendarClock,
  CheckCircle2,
  Copy,
  History,
  Mail,
  MapPin,
  MessageSquareQuote,
  Package,
  PackageCheck,
  Pencil,
  PhoneCall,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const money = new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD", maximumFractionDigits: 0 });

function formatDay(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return null;
  return format(date, "d MMM yyyy");
}

function daysUntilBirthday(value: string | Date) {
  const birthday = new Date(value);
  if (Number.isNaN(birthday.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(size, i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")}
        />
      ))}
    </span>
  );
}

function StatTile({
  color,
  icon: Icon,
  label,
  value,
  hint,
  children,
}: {
  color: TileColor;
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-3 py-3 shadow-sm backdrop-blur-md", tile[color].surface)}>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", tile[color].icon)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xl font-semibold leading-none tabular-nums tracking-tight">{value}</span>
        <span className="mt-1 block truncate text-xs font-medium text-current/70">{label}</span>
        {hint && <span className="mt-0.5 block truncate text-[11px] text-current/60">{hint}</span>}
        {children}
      </span>
    </div>
  );
}

function SectionTitle({ icon: Icon, color, title, description }: { icon: LucideIcon; color: TileColor; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("flex size-8 items-center justify-center rounded-lg", tile[color].icon)}>
        <Icon className="size-4" />
      </span>
      <div className="space-y-0.5">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { phone, companyID, franchiseId } = useParams<{ phone: string; companyID?: string; franchiseId?: string }>();
  const location = useLocation();
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);

  const isFranchiseRoute = location.pathname.startsWith("/myFranchise");
  const isModerator = location.pathname.startsWith("/moderator");
  const companyId = companyID
    ? parseInt(companyID, 10)
    : isFranchiseRoute
    ? franchise?.company_id
    : (isModerator ? userCompany : companyFromStore)?.ID ?? franchise?.company_id;
  const franchiseIdNum = franchiseId ? parseInt(franchiseId, 10) : (franchise?.ID || undefined);

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [birthday, setBirthday] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["customer", companyId, franchiseIdNum, phone],
    queryFn: () => getCustomer(phone!, companyId, franchiseIdNum),
    enabled: !!phone && !!companyId,
  });

  const updateMut = useMutation({
    mutationFn: (data: { birthday?: string }) => updateCustomer(phone!, data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", companyId, franchiseIdNum, phone] });
      setEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const goBack = () => {
    if (isFranchiseRoute) navigate("/myFranchise/crm/customers");
    else navigate(-1);
  };

  const orderPath = (orderId: number) => {
    if (isFranchiseRoute) return undefined;
    if (isModerator) return `/moderator/orders/${orderId}`;
    return companyId ? `/company/${companyId}/orders/${orderId}` : undefined;
  };

  const customer: Customer | undefined = data?.data?.customer;
  const stats: CustomerStats | undefined = data?.data?.stats;
  if (isLoading) {
    return (
      <div className="relative isolate min-h-full overflow-hidden">
        <CrmBackdrop />
        <div className="relative mx-auto max-w-[1600px] space-y-4 px-4 py-5 sm:px-6 lg:px-8" aria-busy="true">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="relative isolate min-h-full overflow-hidden">
        <CrmBackdrop />
        <div className="relative mx-auto max-w-xl px-4 py-16">
          <Card className={cn("text-center", liquidGlass)}>
            <CardContent className="space-y-4 p-8">
              <p className="text-sm text-muted-foreground">Customer not found.</p>
              <Button type="button" onClick={goBack}>
                <ArrowLeft />
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const name = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();
  const totalOrders = stats?.total_orders ?? customer.total_orders ?? 0;
  const deliveredOrders = stats?.delivered_orders ?? customer.delivered_orders ?? 0;
  const deliveryRate = stats?.delivery_rate ?? customer.delivery_rate ?? 0;
  const tier = rateTier(deliveryRate, totalOrders);
  const otherNames = customer.name_history?.filter((n) => n.trim() && n.trim() !== name) ?? [];
  const birthdayDays = customer.birthday ? daysUntilBirthday(customer.birthday) : null;
  const telHref = `tel:${customer.phone.startsWith("213") ? "+" : ""}${customer.phone}`;
  const reviews = customer.reviews ?? [];
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const timeline = [
    { label: "First order", value: formatDay(stats?.first_order_date), color: "bg-indigo-500" },
    { label: "Last order", value: formatDay(stats?.last_order_date), color: "bg-violet-500" },
    { label: "Last delivered", value: formatDay(stats?.last_delivered_date), color: "bg-emerald-500" },
  ].filter((item) => item.value);

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <CrmBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <header className={cn("flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between", liquidGlass)}>
          <div className="flex min-w-0 items-center gap-4">
            <Button type="button" variant="outline" size="icon" className="shrink-0 bg-background" onClick={goBack} aria-label="Back">
              <ArrowLeft />
            </Button>
            <span
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ring-[3px] ring-offset-2 ring-offset-background",
                avatarTone(customer.phone),
                isFranchiseRoute ? "ring-transparent" : tier.ring
              )}
            >
              {customerInitials(customer.first_name, customer.last_name)}
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{name || "Unnamed customer"}</h1>
                {!isFranchiseRoute && (
                  <Badge variant="outline" className={cn("font-medium", tier.chip)}>
                    {tier.label}
                  </Badge>
                )}
                {customer.franchise && (
                  <Badge variant="outline" className={cn("gap-1 font-medium", tone.sky)}>
                    <Store className="size-3" />
                    {customer.franchise.name}
                  </Badge>
                )}
                {birthdayDays !== null && birthdayDays <= 7 && (
                  <Badge className="gap-1 border-transparent bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <Cake className="size-3" />
                    {birthdayDays === 0 ? "Birthday today" : `Birthday in ${birthdayDays}d`}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1.5 font-medium tabular-nums text-foreground hover:text-sky-700 dark:hover:text-sky-300"
                  onClick={() => {
                    void navigator.clipboard?.writeText(customer.phone);
                    toast({ title: "Phone copied", description: customer.phone });
                  }}
                >
                  {customer.phone}
                  <Copy className="size-3.5 text-sky-600 dark:text-sky-300" />
                </button>
                {customer.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 text-violet-500" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400">
              <a href={telHref}>
                <PhoneCall />
                Call
              </a>
            </Button>
            <Button type="button" variant="outline" className={tone.pink} onClick={() => setEditDialogOpen(true)}>
              <Pencil />
              Edit birthday
            </Button>
            <Button
              type="button"
              variant="outline"
              className={tone.amber}
              onClick={() => setReviewDialogOpen(true)}
            >
              <Star />
              Record review
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Customer statistics">
          {isFranchiseRoute ? (
            <>
              <StatTile color="sky" icon={ShoppingBag} label="Store sales" value={(stats?.total_sales_count ?? 0).toLocaleString()} />
              <StatTile color="emerald" icon={Banknote} label="Store revenue" value={money.format(stats?.total_sales ?? 0)} />
              <StatTile color="indigo" icon={Package} label="Online orders" value={totalOrders.toLocaleString()} />
              <StatTile
                color="amber"
                icon={Star}
                label="Average rating"
                value={reviews.length ? avgRating.toFixed(1) : "—"}
                hint={`${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
              />
            </>
          ) : (
            <>
              <StatTile color="indigo" icon={Package} label="Total orders" value={totalOrders.toLocaleString()} />
              <StatTile color="emerald" icon={PackageCheck} label="Delivered" value={deliveredOrders.toLocaleString()} hint={`${Math.max(0, totalOrders - deliveredOrders).toLocaleString()} not delivered`} />
              <StatTile color={tier.color} icon={TrendingUp} label={`Delivery rate · ${tier.label}`} value={`${deliveryRate.toFixed(1)}%`}>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/60 dark:bg-white/10" aria-hidden>
                  <span className={cn("block h-full rounded-full", tier.bar)} style={{ width: `${Math.min(100, Math.max(0, deliveryRate))}%` }} />
                </span>
              </StatTile>
              <StatTile color="violet" icon={Banknote} label="Average order" value={money.format(stats?.average_order_value ?? 0)} />
            </>
          )}
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <CustomerHistoryCard
              phone={customer.phone}
              companyId={companyId}
              franchiseId={isFranchiseRoute ? franchiseIdNum : undefined}
              defaultTab={isFranchiseRoute ? "sales" : "orders"}
              orderPath={orderPath}
              allowOrderDetails={!isFranchiseRoute}
            />
          </div>

          <div className="space-y-4">
            <Card className={liquidGlass}>
              <CardHeader className="pb-3">
                <SectionTitle icon={UserRound} color="violet" title="Profile" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-pink-200/70 bg-pink-50/70 px-3 py-2.5 dark:border-pink-400/20 dark:bg-pink-500/10">
                  <Cake className="size-4 text-pink-500" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Birthday</div>
                    <div className="text-sm font-medium">
                      {customer.birthday ? format(new Date(customer.birthday), "d MMMM yyyy") : "Not set"}
                    </div>
                  </div>
                  {birthdayDays !== null && birthdayDays <= 30 && (
                    <span className="text-xs font-medium text-pink-700 dark:text-pink-300">
                      {birthdayDays === 0 ? "Today" : `in ${birthdayDays} days`}
                    </span>
                  )}
                </div>

                {timeline.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarClock className="size-3.5 text-indigo-500" />
                      Order timeline
                    </div>
                    <ol className="relative space-y-2 border-l border-dashed border-indigo-200 pl-4 dark:border-indigo-400/30">
                      {timeline.map((item) => (
                        <li key={item.label} className="relative">
                          <span className={cn("absolute -left-[1.3rem] top-1.5 size-2.5 rounded-full ring-2 ring-background", item.color)} />
                          <div className="text-sm font-medium">{item.value}</div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {otherNames.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <History className="size-3.5 text-violet-500" />
                      Also ordered as
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {otherNames.map((n) => (
                        <Badge key={n} variant="outline" className={cn("font-normal", tone.violet)}>
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {customer.address_history && customer.address_history.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="size-3.5 text-rose-500" />
                      Addresses
                    </div>
                    <ul className="space-y-1.5">
                      {[...customer.address_history].reverse().map((addr, idx) => (
                        <li
                          key={`${addr}-${idx}`}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-sm",
                            idx === 0
                              ? "border border-rose-200/70 bg-rose-50/70 dark:border-rose-400/20 dark:bg-rose-500/10"
                              : "text-muted-foreground"
                          )}
                        >
                          {addr}
                          {idx === 0 && <span className="ml-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-300">latest</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={liquidGlass}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <SectionTitle
                  icon={MessageSquareQuote}
                  color="amber"
                  title="Reviews"
                  description={reviews.length ? `${avgRating.toFixed(1)} average · ${reviews.length} total` : undefined}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-300/70 bg-amber-50/50 px-3 py-6 text-center text-sm text-muted-foreground dark:border-amber-400/30 dark:bg-amber-500/5">
                    No reviews yet.
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.ID} className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
                      <div className="flex items-center justify-between gap-2">
                        <Stars rating={review.rating} />
                        <span className="text-xs text-muted-foreground">{formatDay(review.reviewed_at) ?? "—"}</span>
                      </div>
                      {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
                      {review.woo_order_id && (
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          Order #{review.woo_order?.number || review.woo_order_id}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        customerPhone={customer.phone}
        companyId={companyId}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit birthday</DialogTitle>
            <DialogDescription>Used for birthday reminders in the CRM.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-birthday">Birthday</Label>
              <Input
                id="customer-birthday"
                type="date"
                value={birthday || (customer.birthday ? new Date(customer.birthday).toISOString().split("T")[0] : "")}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => updateMut.mutate({ birthday: birthday || undefined })}
              disabled={updateMut.isPending}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
