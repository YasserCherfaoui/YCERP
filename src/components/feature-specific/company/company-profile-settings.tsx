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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UpdateCompanySchema, updateCompanySchema } from "@/schemas/company";
import { updateCompany } from "@/services/company-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function CompanyProfileSettings() {
  const company = useSelector((state: RootState) => state.company.company);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const form = useForm<UpdateCompanySchema>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      company_name: "",
      address: "",
      logo: "",
      registration_number: "",
      vat_number: "",
    },
  });

  useEffect(() => {
    if (!company) return;
    form.reset({
      company_name: company.company_name,
      address: company.address,
      logo: company.logo ?? "",
      registration_number: company.registration_number ?? "",
      vat_number: company.vat_number ?? "",
    });
  }, [company, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateCompanySchema) => updateCompany(company!.ID, data),
    onSuccess: (res) => {
      if (res.data) dispatch(setCompany(res.data));
      toast({ title: "Saved", description: "Company profile updated." });
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
        <CardTitle className="text-base">Company profile</CardTitle>
        <CardDescription>Legal identity, branding, and how this company appears in the app.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            mutate({
              company_name: values.company_name,
              address: values.address,
              logo: values.logo,
              registration_number: values.registration_number,
              vat_number: values.vat_number,
            })
          )}
        >
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} className="resize-y min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input type="text" inputMode="url" placeholder="https://…" {...field} />
                  </FormControl>
                  <FormDescription>Link to your logo image; used where the app shows company branding.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration number</FormLabel>
                  <FormControl>
                    <Input placeholder="Commercial register / RC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vat_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT / NIF</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax identification" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" disabled={isPending}>
              Save profile
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
