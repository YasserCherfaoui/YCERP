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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/delivery-slice";
import { loginEmployeeSchema, LoginEmployeeSchema } from "@/schemas/delivery";
import { loginEmployee } from "@/services/delivery-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function DeliveryLoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutate: loginEmployeeMutation, isPending } = useMutation({
    mutationFn: loginEmployee,
    onSuccess: (data) => {
      if (data.data) {
        localStorage.setItem("token", data.data.token);
        dispatch(login(data.data.employee));
        navigate("/delivery", { replace: true });
        toast.success("Login successful");
      } else {
        toast.error(data.message || "An error occurred");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const form = useForm<LoginEmployeeSchema>({
    resolver: zodResolver(loginEmployeeSchema),
  });
  const { handleSubmit } = form;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Delivery Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit((data) => loginEmployeeMutation(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
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
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
