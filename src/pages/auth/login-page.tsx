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
import { loginUser, loginWithPasskey } from "@/services/auth-service";
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
  const [loading, setLoading] = useState<"password" | "passkey" | null>(null);
  const onSubmit = async (data: LoginFormSchema) => {
    setLoading("password");
    try {
      const response = await loginUser(data);
      if (response.data != undefined) {
        toast({
          title: "Access Granted",
          description: "Welcome to your portal.",
        });
        localStorage.setItem("token", response.data.token);
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
      setLoading(null);
    }
    console.log(data);
  };

  const onPasskey = async () => {
    setLoading("passkey");
    try {
      const response = await loginWithPasskey();
      if (response.data != undefined) {
        toast({
          title: "Access Granted",
          description: "Welcome to your portal.",
        });
        localStorage.setItem("token", response.data.token);
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
        title: "Passkey sign-in failed",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Try again, or use your password.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
      <Helmet>
        <title>Login Page</title>
      </Helmet>
      <Card className="w-full max-w-sm">
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
                      <Input type="email" autoComplete="email" placeholder="user@mail.com" {...field} />
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
                        autoComplete="current-password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading !== null} className="w-full">
                {loading === "password" ? "Logging in..." : "Login"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={loading !== null}
                className="w-full"
                onClick={() => void onPasskey()}
              >
                {loading === "passkey" ? "Waiting for passkey..." : "Sign in with a passkey"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
