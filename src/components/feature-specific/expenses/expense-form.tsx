import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ExpenseCreateSchema,
  ExpenseUpdateSchema,
  expenseSchema,
  expenseUpdateSchema,
} from "@/schemas/expenses/expense";
import { listExpenseCategories } from "@/services/expense-categories-service";

type Mode = "create" | "edit";

interface Props {
  mode: Mode;
  defaultValues?: Partial<ExpenseCreateSchema & ExpenseUpdateSchema> & { company_id: number };
  onSubmit: (values: ExpenseCreateSchema | ExpenseUpdateSchema) => Promise<void> | void;
  submitting?: boolean;
}

export default function ExpenseForm({ mode, defaultValues, onSubmit, submitting }: Props) {
  const schema = mode === "create" ? expenseSchema : expenseUpdateSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: defaultValues?.company_id,
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      category: defaultValues?.category ?? "",
      amount: defaultValues?.amount ?? 0,
      currency: defaultValues?.currency ?? "DZD",
      date: defaultValues?.date ?? "",
      payment_method: defaultValues?.payment_method ?? "cash",
      vendor: defaultValues?.vendor ?? "",
      created_by: (defaultValues as any)?.created_by,
      updated_by: (defaultValues as any)?.updated_by,
    } as any,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => (await listExpenseCategories()).data,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values as any);
  });

  const categoriesEmpty = !categoriesLoading && (!categories || categories.length === 0);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Register required hidden fields so validation receives them */}
        <input type="hidden" {...form.register("company_id", { valueAsNumber: true })} />
        {mode === "create" && (
          <input type="hidden" {...form.register("created_by", { valueAsNumber: true })} />
        )}
        {mode === "edit" && (
          <input type="hidden" {...form.register("updated_by", { valueAsNumber: true })} />
        )}

        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Salaries August" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Category</FormLabel>
          {categoriesLoading && (
            <Input disabled placeholder="Loading categories..." />
          )}
          {!categoriesLoading && categories && categories.length > 0 && (
            <FormField
              name="category"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {categoriesEmpty && (
            <FormDescription>
              No categories found. Please create one in
              <Link className="underline ml-1" to={`/company/${(defaultValues as any)?.company_id}/expenses/categories`}>
                Expense Categories
              </Link>
              .
            </FormDescription>
          )}
        </FormItem>

        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (DZD, smallest unit)</FormLabel>
              <FormControl>
                <Input type="number" value={field.value as any} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="payment_method"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <Input placeholder="cash | bank | other" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="vendor"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={submitting || categoriesEmpty || !form.watch("category")}> 
            {submitting ? "Loading..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
