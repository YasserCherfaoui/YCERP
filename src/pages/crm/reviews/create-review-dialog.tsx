import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreateReviewRequest } from "@/models/data/review.model";
import { createReview } from "@/services/review-service";
import { createReviewSchema } from "@/schemas/review";
import { getCustomer, updateCustomer } from "@/services/customer-service";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerPhone?: string;
  orderId?: number;
}

export default function CreateReviewDialog({
  open,
  onOpenChange,
  customerPhone: propCustomerPhone,
  orderId: propOrderId,
}: CreateReviewDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { companyID } = useParams<{ companyID: string }>();
  const companyId = companyID ? parseInt(companyID, 10) : undefined;
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [followUpCallDate, setFollowUpCallDate] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  // Get customer phone and order ID from props or URL params
  const customerPhone = propCustomerPhone || searchParams.get("customer_phone") || "";
  const orderIdParam = propOrderId || (searchParams.get("order_id") ? parseInt(searchParams.get("order_id")!) : undefined);

  // Fetch customer data to get birthday
  const { data: customerData } = useQuery({
    queryKey: ["customer", customerPhone, companyId],
    queryFn: () => getCustomer(customerPhone, companyId),
    enabled: !!customerPhone && open,
  });

  // Pre-fill birthday when customer data is loaded
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setRating(5);
      setComment("");
      setFollowUpCallDate("");
      setBirthday("");
    }
  }, [open]);

  const createMut = useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: async () => {
      // Update customer birthday if it was changed
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

      queryClient.invalidateQueries({ queryKey: ["customer", customerPhone] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Success",
        description: "Review created successfully",
      });
      onOpenChange(false);
      setRating(5);
      setComment("");
      setFollowUpCallDate("");
      setBirthday("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Customer Phone</Label>
            <Input value={customerPhone} disabled />
          </div>
          {orderIdParam && (
            <div>
              <Label>Order ID</Label>
              <Input value={orderIdParam} disabled />
            </div>
          )}
          <div>
            <Label>Rating</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label>Follow-up Call Date (Optional)</Label>
            <Input
              type="date"
              value={followUpCallDate}
              onChange={(e) => setFollowUpCallDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Customer Birthday (Optional)</Label>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>
              {createMut.isPending ? "Saving..." : "Save Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

