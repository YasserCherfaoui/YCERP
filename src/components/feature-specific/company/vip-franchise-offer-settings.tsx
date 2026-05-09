import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { setCompany } from "@/features/company/company-slice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UpdateCompanySchema, updateCompanySchema } from "@/schemas/company";
import { updateCompany } from "@/services/company-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function VipFranchiseOfferSettings() {
  const company = useSelector((state: RootState) => state.company.company);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const form = useForm<UpdateCompanySchema>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      company_name: "",
      address: "",
      vip_allow_bogo: true,
      vip_allow_pairable: true,
      vip_allow_combinable: true,
    },
  });

  useEffect(() => {
    if (!company) return;
    form.reset({
      company_name: company.company_name,
      address: company.address,
      vip_allow_bogo: company.vip_allow_bogo !== false,
      vip_allow_pairable: company.vip_allow_pairable !== false,
      vip_allow_combinable: company.vip_allow_combinable !== false,
    });
  }, [company, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateCompanySchema) => updateCompany(company!.ID, data),
    onSuccess: (res) => {
      if (res.data) dispatch(setCompany(res.data));
      toast({ title: "Saved", description: "VIP franchise offer settings updated." });
    },
    onError: (e: Error) => {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  if (!company) return null;

  return (
    <Card className="w-full rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">VIP franchise offers</CardTitle>
        <CardDescription>
          When a franchise is marked VIP, you can disable BOGO, pair, and combinable promos company-wide.
          Normal franchises are unaffected.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutate(data))}>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="vip_allow_bogo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Allow BOGO for VIP franchises
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vip_allow_pairable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Allow pair promo for VIP franchises
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vip_allow_combinable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Allow combinable promo for VIP franchises
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" variant="secondary" className="font-medium" disabled={isPending}>
              Save offer settings
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
