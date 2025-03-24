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
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  inventoryItem: InventoryItem;
}

export default function ({ inventoryItem }: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<UpdateInventoryItemSchema>({
    resolver: zodResolver(updateInventoryItem),
    defaultValues: {
      quantity: 0,
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: updateItemMutation } = useMutation({
    mutationFn: (data: UpdateInventoryItemSchema) =>
      updateCompanyInventoryItem(inventoryItem.ID, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
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
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Edit2 />
        </Button>
      </DialogTrigger>
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
