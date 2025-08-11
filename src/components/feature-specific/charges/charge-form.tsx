// ChargeForm component for creating and editing charges
import { RootState } from "@/app/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CreateChargeData, UpdateChargeData } from "@/features/charges/charges-slice";
import { cn } from "@/lib/utils";
import { Charge } from "@/models/data/charges/charge.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, DollarSign, FileText, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { z } from "zod";

// Form validation schema
const chargeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.enum(["DZD", "EUR", "USD"]),
  type: z.enum([
    "exchange_rate",
    "salary",
    "boxing",
    "shipping",
    "returns",
    "other",
    "advertising",
    "rent_utility",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  date: z.string().min(1, "Date is required"),
  company_id: z.number().min(1, "Company is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  approval_required: z.boolean(),
  attachment_urls: z.array(z.string()).optional(),
});

type ChargeFormData = z.infer<typeof chargeFormSchema>;

interface ChargeFormProps {
  charge?: Charge;
  onSubmit: (data: CreateChargeData | UpdateChargeData) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

const chargeTypeOptions = [
  { value: "exchange_rate", label: "Exchange Rate", description: "Currency conversion costs" },
  { value: "salary", label: "Employee Salary", description: "Staff compensation and benefits" },
  { value: "boxing", label: "Boxing & Packaging", description: "Product packaging costs" },
  { value: "shipping", label: "Shipping", description: "Delivery and logistics costs" },
  { value: "returns", label: "Returns", description: "Customer return processing fees" },
  { value: "other", label: "Other", description: "Miscellaneous business expenses" },
  { value: "advertising", label: "Advertising", description: "Marketing and promotional costs" },
  { value: "rent_utility", label: "Rent & Utilities", description: "Facility and utility costs" },
];

const priorityOptions = [
  { value: "low", label: "Low", color: "text-gray-500" },
  { value: "medium", label: "Medium", color: "text-blue-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "urgent", label: "Urgent", color: "text-red-500" },
];

const currencyOptions = [
  { value: "DZD", label: "Algerian Dinar (DZD)", symbol: "DA" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "US Dollar (USD)", symbol: "$" },
];

export default function ChargeForm({
  charge,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: ChargeFormProps) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }

  const [tags, setTags] = useState<string[]>(charge?.tags || []);
  const [newTag, setNewTag] = useState("");

  const form = useForm<ChargeFormData>({
    resolver: zodResolver(chargeFormSchema),
    defaultValues: {
      title: charge?.title || "",
      description: charge?.description || "",
      amount: charge?.amount || 0,
      currency: charge?.currency || "DZD",
      type: charge?.type || "other",
      priority: charge?.priority || "medium",
      date: charge?.date ? new Date(charge.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      company_id: charge?.company_id || company?.ID || 0,
      reference_number: charge?.reference_number || "",
      notes: charge?.notes || "",
      tags: charge?.tags || [],
      approval_required: charge?.approval_required ?? true,
      attachment_urls: charge?.attachment_urls || [],
    },
  });

  // const watchedType = form.watch("type");
  // const watchedCurrency = form.watch("currency");
  // const watchedPriority = form.watch("priority");

  const handleSubmit = (data: ChargeFormData) => {
    const submitData = {
      ...data,
      tags: tags,
    };
    onSubmit(submitData);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!company) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Company information is required to create charges.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{charge ? "Edit Charge" : "Create New Charge"}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter charge title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., INV-2024-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional reference number for tracking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional details about this charge..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Charge Type and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Charge Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select charge type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chargeTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <span>{option.symbol}</span>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className={cn("font-medium", option.color)}>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information or comments..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Approval Required */}
            <FormField
              control={form.control}
              name="approval_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Approval Required
                    </FormLabel>
                    <FormDescription>
                      This charge will require approval before being processed
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                {loading ? "Saving..." : charge ? "Update Charge" : "Create Charge"}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}