import { liquidGlass } from "@/components/feature-specific/crm/crm-theme";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Customer } from "@/models/data/customer.model";
import { updateCustomer, UpdateCustomerRequest } from "@/services/customer-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cake, Loader2, Mail, Pencil, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  companyId?: number;
  onSaved?: () => void;
};

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900) return "";
  return date.toISOString().split("T")[0];
}

function initialForm(customer: Customer) {
  return {
    first_name: customer.first_name ?? "",
    last_name: customer.last_name ?? "",
    email: customer.email ?? "",
    birthday: toDateInput(customer.birthday),
  };
}

export default function EditCustomerDialog({ open, onOpenChange, customer, companyId, onSaved }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => initialForm(customer));

  useEffect(() => {
    if (open) setForm(initialForm(customer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const original = initialForm(customer);
  const changes: UpdateCustomerRequest = {};
  if (form.first_name.trim() !== original.first_name.trim()) changes.first_name = form.first_name.trim();
  if (form.last_name.trim() !== original.last_name.trim()) changes.last_name = form.last_name.trim();
  if (form.email.trim() !== original.email.trim()) changes.email = form.email.trim();
  if (form.birthday !== original.birthday) {
    if (form.birthday) changes.birthday = form.birthday;
    else changes.clear_birthday = true;
  }
  const hasChanges = Object.keys(changes).length > 0;

  const saveMut = useMutation({
    mutationFn: () => updateCustomer(customer.phone, changes, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-customers"] });
      toast({ title: "Customer updated", description: "The customer details were saved." });
      onOpenChange(false);
      onSaved?.();
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg sm:p-0", liquidGlass, "bg-white/85 dark:bg-slate-950/85")}
      >
        <DialogHeader className="border-b border-white/40 bg-gradient-to-r from-violet-100/80 via-pink-100/60 to-sky-100/60 px-5 py-4 pr-12 text-left dark:border-white/10 dark:from-violet-500/20 dark:via-pink-500/10 dark:to-sky-500/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25">
              <Pencil className="size-5" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle>Edit customer</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium tabular-nums text-foreground dark:bg-white/10">
                  {customer.phone}
                </span>
                Changes apply to every store and the online shop.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (hasChanges) saveMut.mutate();
          }}
        >
          <div className="space-y-4 overflow-y-auto p-5">
            <section className="space-y-3 rounded-xl border border-white/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                <UserRound className="size-4" />
                Name
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-customer-first-name">First name</Label>
                  <Input
                    id="edit-customer-first-name"
                    autoComplete="off"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-customer-last-name">Last name</Label>
                  <Input
                    id="edit-customer-last-name"
                    autoComplete="off"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-sky-200/70 bg-sky-50/60 p-3 dark:border-sky-400/20 dark:bg-sky-500/10">
                <Label htmlFor="edit-customer-email" className="flex items-center gap-1.5 text-sky-800 dark:text-sky-200">
                  <Mail className="size-3.5" />
                  Email
                </Label>
                <Input
                  id="edit-customer-email"
                  type="email"
                  autoComplete="off"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-white/80 dark:bg-white/10"
                />
              </div>
              <div className="space-y-1.5 rounded-xl border border-pink-200/70 bg-pink-50/60 p-3 dark:border-pink-400/20 dark:bg-pink-500/10">
                <Label htmlFor="edit-customer-birthday" className="flex items-center gap-1.5 text-pink-800 dark:text-pink-200">
                  <Cake className="size-3.5" />
                  Birthday
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="edit-customer-birthday"
                    type="date"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    className="bg-white/80 dark:bg-white/10"
                  />
                  {form.birthday && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label="Clear birthday"
                      onClick={() => setForm({ ...form, birthday: "" })}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>

          <DialogFooter className="border-t border-white/40 px-5 py-3 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!hasChanges || saveMut.isPending}
              className="bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-pink-500"
            >
              {saveMut.isPending ? <Loader2 className="animate-spin" /> : <Pencil />}
              {saveMut.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
