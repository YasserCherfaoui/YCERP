import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@/models/data/user.model";
import { ChevronsUpDown } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

interface AssignOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  orderIds: number[];
  onSubmit: (data: { orders_ids: number[]; user_id: number }) => void;
}

export default function AssignOrdersDialog({ open, onClose, users, orderIds, onSubmit }: AssignOrdersDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ UserID: number | null }>({
    defaultValues: { UserID: null },
  });

  const selectedUserId = watch("UserID");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Orders</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <span className="font-medium">Selected Orders:</span> {orderIds.length}
        </div>
        <form
          onSubmit={handleSubmit((data) => {
            if (data.UserID) {
              onSubmit({ orders_ids: orderIds, user_id: data.UserID });
              onClose();
            }
          })}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Select User</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  {selectedUserId
                    ? users.find((u) => u.ID === selectedUserId)?.full_name || "Select user"
                    : "Select user"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full min-w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem
                          key={user.ID}
                          value={user.full_name + " " + user.email}
                          onSelect={() => {
                            setValue("UserID", user.ID);
                            setPopoverOpen(false);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span>{user.full_name} ({user.email})</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.UserID && (
              <div className="text-red-500 text-sm mt-1">Please select a user.</div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!selectedUserId}>Assign</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 