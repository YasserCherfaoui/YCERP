import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models/data/user.model";
import { deleteUser } from "@/services/user-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

interface Props {
  user: User;
}

export default function ({ user }: Props) {
  const company = useSelector((state: RootState) => state.company.company);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: deleteComapnyMutation, isPending } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam", company?.ID ?? 0] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error) => {
      setOpen(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          className="text-red-500"
        >
          <Trash2 />
          Delete User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-bold text-red-500">{user.full_name}</span> ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant={"outline"}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => deleteComapnyMutation(user.ID)}
            variant={"destructive"}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
