import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import {
  createClientStatusSchema,
  CreateClientStatusSchema,
} from "@/schemas/client-status";
import {
  createClientStatus,
  getQualifications,
} from "@/services/qualification-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function AddClientStatusDialog({
  open,
  setOpen,
  orderTicketID,
  queryKey,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderTicketID: number;
  queryKey?: any[];
}) {
  const methods = useForm<CreateClientStatusSchema>({
    resolver: zodResolver(createClientStatusSchema),
    defaultValues: {
      order_ticket_id: orderTicketID,
      qualification_id: undefined,
      sub_qualification_id: null,
      comment: "",
      date: new Date().toISOString(),
    },
  });
  const { watch, reset, setValue } = methods;
  const qualification_id = watch("qualification_id");

  // Update form value when orderTicketID changes or dialog opens
  useEffect(() => {
    if (open && orderTicketID > 0) {
      setValue("order_ticket_id", orderTicketID);
      // Reset form with new values when dialog opens
      reset({
        order_ticket_id: orderTicketID,
        qualification_id: undefined,
        sub_qualification_id: null,
        comment: "",
        date: new Date().toISOString(),
      });
    }
  }, [open, orderTicketID, setValue, reset]);

  // Fetch qualifications
  const { data: qualifications } = useQuery({
    queryKey: ["qualifications"],
    queryFn: getQualifications,
  });

  // Find selected qualification and its children
  const selectedQualification = useMemo(
    () =>
      qualifications?.data?.find(
        (q: Qualification) => q.ID === qualification_id
      ),
    [qualifications, qualification_id]
  );
  const subQualifications = selectedQualification?.children || [];
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mutation for submit
  const { mutate: createClientStatusMutation, isPending } = useMutation({
    mutationFn: createClientStatus,
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        queryClient.invalidateQueries({ queryKey: ["order-tickets"] });
      }
      toast({
        title: "Client status created",
        description: "The client status has been created successfully",
      });
      setOpen(false);
      // Reset form but preserve order_ticket_id
      reset({
        order_ticket_id: orderTicketID,
        qualification_id: undefined,
        sub_qualification_id: null,
        comment: "",
        date: new Date().toISOString(),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client status",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Client Status</DialogTitle>
          <DialogDescription>
            Set the client status and details for this order ticket.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(
              (data) => {
                // Ensure order_ticket_id is set and date is in RFC3339 format
                const payload = {
                  ...data,
                  order_ticket_id: orderTicketID > 0 ? orderTicketID : data.order_ticket_id,
                  date: new Date(data.date).toISOString(),
                };
                createClientStatusMutation(payload);
              },
              console.error
            )}
            className="space-y-4"
          >
            <FormField
              control={methods.control}
              name="qualification_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualifications?.data
                        ?.filter((q: Qualification) => q.parent_id === null && !q.is_order_history)
                        .map((q: Qualification) => (
                          <SelectItem key={q.ID} value={q.ID.toString()}>
                            {q.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {subQualifications.length > 0 && (
              <FormField
                control={methods.control}
                name="sub_qualification_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SubQualification</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subqualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {subQualifications.map((sq: Qualification) => (
                          <SelectItem key={sq.ID} value={sq.ID.toString()}>
                            {sq.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={methods.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter comment..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" variant="ghost" onClick={() => reset()}>
                Clear
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

