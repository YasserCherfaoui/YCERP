import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerAffiliate } from "@/features/auth/affiliate-slice";
import {
  RegisterAffiliateSchema,
  registerAffiliateSchema,
} from "@/schemas/affiliate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export const AffiliateRegisterPage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.affiliate);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegisterAffiliateSchema>({
    resolver: zodResolver(registerAffiliateSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      address: "01 boulevard de la mer",
      city: "Algiers",
      state: "Alger",
      zip: "16000",
      company_id: 2,
    },
  });

  const onSubmit = (values: RegisterAffiliateSchema) => {
    dispatch(registerAffiliate(values))
      .unwrap()
      .then(() => {
        setRegistrationSuccess(true);
      })
      .catch(() => {
        // Error is handled by the slice
      });
  };

  if (registrationSuccess) {
    return (
      <div className="affiliate-theme flex items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm rounded-lg p-6 shadow-sm border-border">
          <CardHeader className="p-0 mb-4 text-center">
            <CardTitle className="text-2xl">Registration Successful</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your account has been created. You can now log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Link to="/affiliate/login" className="w-full">
              <Button className="w-full rounded-md font-semibold">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="affiliate-theme flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md rounded-lg p-6 shadow-sm border-border">
        <CardHeader className="p-0 mb-4 text-center">
          <CardTitle className="text-2xl font-bold">
            Create an Affiliate Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 234 567 890"
                          {...field}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        type="email"
                        {...field}
                        className="rounded-md border-border px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        className="rounded-md border-border px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St"
                          {...field}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 hidden">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={16000}
                          className="rounded-md border-border px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={2}
                        className="rounded-md border-border px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {status === "failed" && error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full rounded-md font-semibold"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Creating account..."
                  : "Create an account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/affiliate/login" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
