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
import { WooOrder } from "@/models/data/woo-order.model";
import { ChevronsUpDown } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

interface ShuffleOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  orders: WooOrder[];
  onSubmit: (data: { selected_users: number[] }) => void;
}

export default function ShuffleOrdersDialog({ open, onClose, users, orders, onSubmit }: ShuffleOrdersDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ selected_users: number[] }>({
    defaultValues: { selected_users: [] },
  });

  const selectedUsers = watch("selected_users");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleUserToggle = (id: number) => {
    setValue(
      "selected_users",
      selectedUsers.includes(id)
        ? selectedUsers.filter((uid) => uid !== id)
        : [...selectedUsers, id]
    );
  };

  const unassignedCount = orders.filter((o) => !o.taken_by).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shuffle Orders</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <span className="font-medium">Unassigned Orders:</span> {unassignedCount}
        </div>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            onClose();
          })}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Select Users</label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  {selectedUsers.length > 0
                    ? `${selectedUsers.length} user(s) selected`
                    : "Select users"}
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
                          onSelect={() => handleUserToggle(user.ID)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.ID)}
                            readOnly
                            className="accent-primary"
                          />
                          <span>{user.full_name} ({user.email})</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.selected_users && (
              <div className="text-red-500 text-sm mt-1">Please select at least one user.</div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={selectedUsers.length === 0}>Shuffle</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 