"use client";

import { useAppDispatch } from "@/app/hooks";
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
import { login } from "@/features/auth/auth-slice";
import { useToast } from "@/hooks/use-toast";
import { RegisterFormSchema, registerSchema } from "@/schemas/auth";
import { registerUser } from "@/services/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function () {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormSchema) => {
    setLoading(true);
    try {
      const response = await registerUser(data);

      if (response.data != undefined) {
        toast({
          title: "Account Created!",
          content: "Administrator was created successfully!",
      });
        localStorage.setItem("token", response.data.token);
        dispatch(login(response.data.user));
        navigate("/login", { replace: true });
      } else {
        toast({
          title: "Error creating account",
          description:
            "There was an error creating your account. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Helmet>
        <title>Register Page</title>
      </Helmet>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create Your Space</CardTitle>
          <CardDescription>
            Start your journey by creating your administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Insert your actual name on Biometric Identity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@mail.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use a valid email address, because you will be asked to
                      verify it later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Make sure you insert a strong password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button disabled={loading} onClick={form.handleSubmit(onSubmit)}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
