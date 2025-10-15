import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { AlertConfigFormData, AlertConfigSchema } from "@/schemas/stock-alerts";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface StockAlertConfigFormProps {
  defaultValues?: Partial<AlertConfigFormData>;
  onSubmit: (data: AlertConfigFormData) => void | Promise<void>;
  submitting?: boolean;
}

export const StockAlertConfigForm = ({
  defaultValues,
  onSubmit,
  submitting,
}: StockAlertConfigFormProps) => {
  const [emailInput, setEmailInput] = useState("");

  const form = useForm<AlertConfigFormData>({
    resolver: zodResolver(AlertConfigSchema),
    defaultValues: {
      location_type: defaultValues?.location_type || "company",
      location_id: defaultValues?.location_id || 0,
      low_stock_threshold: defaultValues?.low_stock_threshold ?? 10,
      reorder_point: defaultValues?.reorder_point ?? 20,
      overstock_threshold: defaultValues?.overstock_threshold ?? null,
      enable_email_alerts: defaultValues?.enable_email_alerts ?? true,
      enable_in_app_alerts: defaultValues?.enable_in_app_alerts ?? true,
      email_recipients: defaultValues?.email_recipients || [],
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const addEmailRecipient = () => {
    if (!emailInput.trim()) return;

    const currentRecipients = form.getValues("email_recipients");
    if (!currentRecipients.includes(emailInput)) {
      form.setValue("email_recipients", [...currentRecipients, emailInput]);
      setEmailInput("");
    }
  };

  const removeEmailRecipient = (email: string) => {
    const currentRecipients = form.getValues("email_recipients");
    form.setValue(
      "email_recipients",
      currentRecipients.filter((e) => e !== email)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="low_stock_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Threshold</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Alert when inventory falls to or below this quantity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reorder_point"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reorder Point</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Alert when it's time to initiate restocking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overstock_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overstock Threshold (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Alert when inventory exceeds this quantity (leave empty to
                disable)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enable_email_alerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Alerts</FormLabel>
                <FormDescription>
                  Send alert notifications via email
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

        <FormField
          control={form.control}
          name="enable_in_app_alerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">In-App Alerts</FormLabel>
                <FormDescription>
                  Show alert notifications in the application
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

        <FormField
          control={form.control}
          name="email_recipients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Recipients</FormLabel>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmailRecipient();
                    }
                  }}
                />
                <Button type="button" onClick={addEmailRecipient}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeEmailRecipient(email)}
                    />
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Email addresses to notify when alerts are triggered
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Configuration"}
        </Button>
      </form>
    </Form>
  );
};

