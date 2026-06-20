import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/models/data/inventory.model";
import {
    updateInventoryItem,
    UpdateInventoryItemSchema,
} from "@/schemas/inventory-schema";
import { updateCompanyInventoryItem } from "@/services/inventory-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

interface Props {
  inventoryItem: InventoryItem;
  /** When set with onOpenChange, dialog is controlled (e.g. quick-fix from another dialog). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

export default function UpdateInventoryItemDialog({
  inventoryItem,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const form = useForm<UpdateInventoryItemSchema>({
    resolver: zodResolver(updateInventoryItem),
    defaultValues: {
      quantity: inventoryItem.quantity,
    },
  });

  useEffect(() => {
    form.reset({ quantity: inventoryItem.quantity });
  }, [inventoryItem.ID, inventoryItem.quantity, form]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: updateItemMutation } = useMutation({
    mutationFn: (data: UpdateInventoryItemSchema) =>
      updateCompanyInventoryItem(inventoryItem.ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["company-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["franchise-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-total-cost"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory-item-transaction-logs", inventoryItem.ID],
      });
      queryClient.invalidateQueries({ queryKey: ["company-missing-variants"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant={"ghost"}>
            <Edit2 />
          </Button>
        </DialogTrigger>
      )}
      {isControlled && trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <p>
            You are going to update: <b>{inventoryItem.name}</b>
          </p>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={form.handleSubmit(
              (data) => updateItemMutation(data),
              console.error
            )}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
