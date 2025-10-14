import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAffiliate from "@/hooks/use-affiliate";
import { useToast } from "@/hooks/use-toast";
import { getAffiliateProfile, updatePaymentInfo } from "@/services/affiliate-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Building,
    CreditCard,
    FileText,
    Loader2,
    Mail,
    Save,
    User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Payment Info Schema
const paymentInfoSchema = z.object({
  // Bank Transfer Details
  bank_name: z.string().default(""),
  bank_account_number: z.string().default(""),
  bank_address: z.string().default(""),
  iban: z.string().default(""),
  swift_code: z.string().default(""),
  
  // PayPal Details
  paypal_email: z.string().default("").refine((val) => {
    // Only validate email if it's not empty
    return val === "" || z.string().email().safeParse(val).success;
  }, {
    message: "Invalid email format"
  }),
  
  // Check Details
  check_payable_to: z.string().default(""),
});

export type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>;

export default function AffiliateSettingsPage() {
  const { affiliate } = useAffiliate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("bank");

  // Fetch fresh affiliate data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["affiliate-profile"],
    queryFn: getAffiliateProfile,
    enabled: !!affiliate,
  });

  const currentAffiliate = profileData?.data || affiliate;
  const paymentInfo = currentAffiliate?.payment_info;

  console.log('Payment info from API:', paymentInfo); // Debug log

  // Create initial form values
  const getInitialValues = () => {
    const values = {
      bank_name: paymentInfo?.bank_name ?? "",
      bank_account_number: paymentInfo?.bank_account_number ?? "",
      bank_address: paymentInfo?.bank_address ?? "",
      iban: paymentInfo?.iban ?? "",
      swift_code: paymentInfo?.swift_code ?? "",
      paypal_email: paymentInfo?.paypal_email ?? "",
      check_payable_to: paymentInfo?.check_payable_to ?? "",
    };
    console.log('Initial form values:', values); // Debug log
    return values;
  };

  // Form setup
  const form = useForm<PaymentInfoFormData>({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange', // Enable real-time validation
  });

  const { handleSubmit, formState: { isDirty, isSubmitting }, reset, watch } = form;

  // Watch all form values for debugging
  const watchedValues = watch();

  // Reset form when payment info changes
  useEffect(() => {
    if (paymentInfo !== undefined) {
      const newValues = getInitialValues();
      console.log('Resetting form with values:', newValues); // Debug log
      reset(newValues);
    }
  }, [paymentInfo, reset]);

  // Log form registration
  useEffect(() => {
    console.log('Form fields registered:', Object.keys(form.getValues())); // Debug log
  }, [form]);

  // Update mutation
  const updatePaymentMutation = useMutation({
    mutationFn: (data: PaymentInfoFormData) => {
      console.log('Form data before sending:', data); // Debug log
      return updatePaymentInfo(currentAffiliate?.ID || 0, data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Info Updated",
        description: "Your payment information has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["affiliate-profile"] });
      reset(form.getValues()); // Reset dirty state
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payment information.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentInfoFormData) => {
    console.log('Submitting form data:', data); // Debug log
    updatePaymentMutation.mutate(data);
  };

  const handleReset = () => {
    const resetValues = getInitialValues();
    console.log('Manual reset with values:', resetValues); // Debug log
    reset(resetValues);
  };

  if (profileLoading) {
    return (
      <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-lg font-medium">Loading settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-theme min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account information and payment preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card className="rounded-2xl shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {currentAffiliate?.full_name || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {currentAffiliate?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {currentAffiliate?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Company</Label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                    {currentAffiliate?.company?.company_name || "Not assigned"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Address</Label>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {[
                    currentAffiliate?.address,
                    currentAffiliate?.city,
                    currentAffiliate?.state,
                    currentAffiliate?.zip
                  ].filter(Boolean).join(", ") || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Affiliate Slug</Label>
                <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {currentAffiliate?.slug || "Not assigned"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card className="rounded-2xl shadow-md border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure how you'd like to receive your affiliate payments.
              </p>
            </CardHeader>
            <CardContent>
              {/* Debug Section - Remove this in production */}
              <div className="mb-4 p-3 bg-gray-100 rounded-md hidden">
                <h4 className="text-sm font-medium mb-2">Debug - Current Form Values:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(watchedValues, null, 2)}
                </pre>
                <p className="text-xs mt-2 text-gray-600">
                  Form is dirty: {isDirty ? 'Yes' : 'No'}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                      <TabsTrigger value="bank" className="flex items-center gap-1 sm:gap-2">
                        <Building className="h-4 w-4" />
                        <span className="hidden sm:inline">Bank Transfer</span>
                        <span className="sm:hidden">Bank</span>
                      </TabsTrigger>
                      <TabsTrigger value="paypal" className="flex items-center gap-1 sm:gap-2">
                        <Mail className="h-4 w-4" />
                        PayPal
                      </TabsTrigger>
                      <TabsTrigger value="check" className="flex items-center gap-1 sm:gap-2">
                        <FileText className="h-4 w-4" />
                        Check
                      </TabsTrigger>
                    </TabsList>

                    {/* Bank Transfer Tab */}
                    <TabsContent value="bank" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bank_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter bank name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bank_account_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bank_address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Bank Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter bank address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="iban"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IBAN</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter IBAN" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="swift_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SWIFT Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter SWIFT code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* PayPal Tab */}
                    <TabsContent value="paypal" className="space-y-4 mt-6">
                      <FormField
                        control={form.control}
                        name="paypal_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PayPal Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your PayPal email address" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Check Tab */}
                    <TabsContent value="check" className="space-y-4 mt-6">
                      <FormField
                        control={form.control}
                        name="check_payable_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check Payable To</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name for check payments" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>

                  {/* Form Actions */}
                  {isDirty && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">You have unsaved changes</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 