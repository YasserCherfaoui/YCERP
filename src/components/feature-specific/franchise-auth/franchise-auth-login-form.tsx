import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { login } from "@/features/auth/franchise-slice";
import { useToast } from "@/hooks/use-toast";
import { LoginFormSchema, loginSchema } from "@/schemas/auth";
import { loginMyFranchise } from "@/services/franchise-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function () {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutate: loginMutate , isPending } = useMutation({
    mutationFn: loginMyFranchise,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Login successful",
      });
      if (data.data) {
        localStorage.setItem("my-franchise-user-token", data.data.token);
        dispatch(login(data.data.user));
        navigate("/myFranchise/menu");
      } else {
        toast({
          title: "Error",
          description: "Login failed",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="w-[400px] p-4">
      <CardTitle>My Franchise - Login</CardTitle>
      <CardDescription>
        Start monitoring your sales & inventory on your franchise dashboard
      </CardDescription>
      <CardContent>
        <Form {...form}>
          <FormField
            name={"email"}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name={"password"}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant={"outline"}>Request Access</Button>
        <Button disabled={isPending} onClick={form.handleSubmit((data) => loginMutate(data))}>
          <Key />
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
