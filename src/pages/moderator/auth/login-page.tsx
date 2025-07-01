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
import { login } from "@/features/auth/user-slice";
import { useToast } from "@/hooks/use-toast";
import { LoginFormSchema, loginSchema } from "@/schemas/auth";
import { loginUser } from "@/services/user-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

export default function () {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/moderator";
  
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
  });
  const { mutate: loginMutation, isPending: loading } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.data?.user == null){
        return
      }
      dispatch(login(data.data?.user));
      localStorage.setItem("token", data.data?.token ?? "")
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });
      // Navigate back to the page user was originally trying to access
      navigate(from, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  })

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
            <form onSubmit={form.handleSubmit((data)=>loginMutation(data))} className="space-y-8">
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
