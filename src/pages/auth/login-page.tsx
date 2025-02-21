import { useAppDispatch } from "@/app/hooks";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/auth-slice";
import { useToast } from "@/hooks/use-toast";
import { LoginFormSchema, loginSchema } from "@/schemas/auth";
import { loginUser } from "@/services/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function () {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data: LoginFormSchema) => {
    setLoading(true);
    try {
      const response = await loginUser(data);
      if (response.data != undefined) {
        toast({
          title: "Access Granted",
          description: "Welcome to your portal.",
        });
        localStorage.setItem("authToken", response.data.token);
        dispatch(login(response.data.user));
        navigate("/menu", { replace: true });
      } else {
        toast({
          title: "Error logging in",
          description: "There was an error logging in. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Access Denied",
        variant: "destructive",
        description: "Wrong credentials.",
      });
    } finally {
      setLoading(false);
    }
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Helmet>
        <title>Login Page</title>
      </Helmet>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Portal Login</CardTitle>
          <CardDescription>
            Access to your portal to monitor your acitivity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      Use the email you used to contact us.
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="#"
                        className="text-sm hover:underline underline-offset-4 ml-1"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
