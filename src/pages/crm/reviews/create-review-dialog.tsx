import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreateReviewRequest } from "@/models/data/review.model";
import { createReview } from "@/services/review-service";
import { createReviewSchema } from "@/schemas/review";
import { getCustomer, updateCustomer } from "@/services/customer-service";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Cake, CalendarClock, Loader2, MessageSquareQuote, Package, Phone, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerPhone?: string;
  orderId?: number;
  companyId?: number;
}

const RATING_LABELS = [
  { label: "Very bad", text: "text-rose-600 dark:text-rose-300", chip: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-100" },
  { label: "Bad", text: "text-orange-600 dark:text-orange-300", chip: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-100" },
  { label: "Okay", text: "text-amber-600 dark:text-amber-300", chip: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100" },
  { label: "Good", text: "text-lime-700 dark:text-lime-300", chip: "bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-100" },
  { label: "Excellent", text: "text-emerald-600 dark:text-emerald-300", chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100" },
];

export default function CreateReviewDialog({
  open,
  onOpenChange,
  customerPhone: propCustomerPhone,
  orderId: propOrderId,
  companyId: propCompanyId,
}: CreateReviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = propCompanyId ?? (companyID ? parseInt(companyID, 10) : undefined);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [followUpCallDate, setFollowUpCallDate] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  // Get customer phone and order ID from props or URL params
  const customerPhone = propCustomerPhone || searchParams.get("customer_phone") || "";
  const orderIdParam = propOrderId || (searchParams.get("order_id") ? parseInt(searchParams.get("order_id")!) : undefined);

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
        const dateStr = typeof customerBirthday === 'string' 
          ? customerBirthday.split('T')[0]
          : new Date(customerBirthday).toISOString().split('T')[0];
        setBirthday(dateStr);
      }
    }
  }, [customerData, open]);

  useEffect(() => {
    if (!open) {
      setRating(5);
      setHoverRating(null);
      setComment("");
      setFollowUpCallDate("");
      setBirthday("");
    }
  }, [open]);

  const createMut = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: async () => {
      const currentBirthday = customerData?.data?.customer?.birthday;
      const currentBirthdayStr = currentBirthday 
        ? (typeof currentBirthday === 'string' 
          ? currentBirthday.split('T')[0]
          : new Date(currentBirthday).toISOString().split('T')[0])
        : null;
      
      if (birthday && birthday !== currentBirthdayStr) {
        try {
          await updateCustomer(customerPhone, { birthday: birthday || null }, companyId);
        } catch (error) {
          // Log error but don't fail the review creation
          console.error("Failed to update customer birthday:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["customer"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
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
      woo_order_id: orderIdParam || null,
      rating,
      comment,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg gap-0 overflow-hidden p-0 sm:p-0", liquidGlass)}>
        <DialogHeader className="space-y-3 border-b border-white/40 bg-gradient-to-r from-amber-100/80 via-orange-50/60 to-rose-100/60 px-5 py-4 pr-10 text-left dark:border-white/10 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-rose-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
              <MessageSquareQuote className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle>Record review</DialogTitle>
              <DialogDescription>How did the customer feel about their order?</DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 font-medium tabular-nums shadow-sm dark:bg-white/10">
              <Phone className="size-3.5 text-sky-600 dark:text-sky-300" />
              {customerPhone || "No phone"}
              {customerName && <span className="font-normal text-muted-foreground">· {customerName}</span>}
            </span>
            {orderIdParam && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 font-medium shadow-sm dark:bg-white/10">
                <Package className="size-3.5 text-indigo-600 dark:text-indigo-300" />
                Order #{orderIdParam}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
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
            <Label htmlFor="review-comment">Comment</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did the customer say?"
              className="resize-none bg-white/70 focus-visible:ring-amber-400 dark:bg-white/5"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="review-follow-up" className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5 text-violet-500" />
                Follow-up call
              </Label>
              <Input
                id="review-follow-up"
                type="date"
                value={followUpCallDate}
                onChange={(e) => setFollowUpCallDate(e.target.value)}
                className="bg-white/70 focus-visible:ring-violet-400 dark:bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-birthday" className="flex items-center gap-1.5">
                <Cake className="size-3.5 text-pink-500" />
                Birthday
              </Label>
              <Input
                id="review-birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="bg-white/70 focus-visible:ring-pink-400 dark:bg-white/5"
              />
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
            disabled={createMut.isPending}
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
