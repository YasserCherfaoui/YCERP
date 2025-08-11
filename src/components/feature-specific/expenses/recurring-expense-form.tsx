import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RecurringExpenseCreateSchema, RecurringExpenseUpdateSchema, recurringExpenseCreateSchema, recurringExpenseUpdateSchema } from "@/schemas/expenses/recurring-expense";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  defaultValues?: Partial<RecurringExpenseCreateSchema & RecurringExpenseUpdateSchema> & { company_id: number };
  onSubmit: (values: RecurringExpenseCreateSchema | RecurringExpenseUpdateSchema) => Promise<void> | void;
  submitting?: boolean;
}

export default function RecurringExpenseForm({ mode, defaultValues, onSubmit, submitting }: Props) {
  const schema = mode === "create" ? recurringExpenseCreateSchema : recurringExpenseUpdateSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: defaultValues?.company_id,
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      category: defaultValues?.category || "",
      amount: defaultValues?.amount || 0,
      currency: defaultValues?.currency || "DZD",
      payment_method: defaultValues?.payment_method || "bank",
      vendor: defaultValues?.vendor || "",
      day_of_month: defaultValues?.day_of_month || 1,
      start_month: defaultValues?.start_month || "",
      end_month: (defaultValues?.end_month as any) || null,
      created_by: (defaultValues as any)?.created_by,
      updated_by: (defaultValues as any)?.updated_by,
    } as any,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values as any);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === "create" && (
        <input type="hidden" value={(form.getValues() as any).company_id} />
      )}
      <div>
        <Label>Title</Label>
        <Input {...form.register("title")} />
      </div>
      <div>
        <Label>Category</Label>
        <Input placeholder="e.g., salaries, rent" {...form.register("category")} />
      </div>
      <div>
        <Label>Amount (DZD, smallest unit)</Label>
        <Input type="number" {...form.register("amount", { valueAsNumber: true })} />
      </div>
      <div>
        <Label>Payment Method</Label>
        <Input placeholder="cash | bank | other" {...form.register("payment_method")} />
      </div>
      <div>
        <Label>Day of Month</Label>
        <Input type="number" min={1} max={28} {...form.register("day_of_month", { valueAsNumber: true })} />
      </div>
      <div>
        <Label>Start Month</Label>
        <Input type="date" {...form.register("start_month")} />
      </div>
      <div>
        <Label>End Month</Label>
        <Input type="date" {...form.register("end_month")} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea rows={3} {...form.register("description")} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>{mode === "create" ? "Create" : "Save"}</Button>
      </div>
    </form>
  );
}


