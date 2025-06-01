import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl, FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Qualification } from "@/models/data/qualification.model";
import { getQualifications } from "@/services/qualification-service";
import { addOrderHistory } from "@/services/woocommerce-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  order_id: z.number(),
  status: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  qualification_id: z.number().optional().nullable(),
});

export type AddOrderHistoryRequest = z.infer<typeof schema>;

export default function AddOrderHistoryDialog({
  open,
  setOpen,
  orderId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderId: number;
}) {
  const form = useForm<AddOrderHistoryRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      order_id: orderId,
      status: "",
      date: new Date().toISOString(),
      qualification_id: null,
    },
  });
  const { data: qualifications } = useQuery({
    queryKey: ["qualifications"],
    queryFn: () => getQualifications(),
  });
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const { mutate: addOrderHistoryMutation, isPending: addOrderHistoryLoading } = useMutation({
    mutationFn: (values: AddOrderHistoryRequest) => addOrderHistory(values),
    onSuccess: () => {
      toast({
        title: "Order history added successfully",
        description: "The order history has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

    },
    onError: (error) => {
      toast({
        title: "Failed to add order history",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });
  function onSubmit(values: AddOrderHistoryRequest) {
    // For now, just log the values
    addOrderHistoryMutation(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Order History</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new order history.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualification_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => field.onChange(Number(value))}>
                      <FormItem>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a qualification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {qualifications?.data?.filter((q: Qualification) => q.parent_id === null && q.is_order_history).map((qualification) => (
                            <SelectItem
                              key={qualification.ID}
                              value={qualification.ID.toString()}
                            >
                              {qualification.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </FormItem>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Status" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={addOrderHistoryLoading}>Add {addOrderHistoryLoading && <Loader2 className="w-4 h-4 ml-2" />}</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
