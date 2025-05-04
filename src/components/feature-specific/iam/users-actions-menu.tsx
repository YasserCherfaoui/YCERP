import DeleteUserDialog from "@/components/feature-specific/iam/delete-user-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/models/data/user.model";
import { MoreHorizontal } from "lucide-react";

interface UsersActionsMenuProps {
  user: User;
}

export default function ( { user }: UsersActionsMenuProps) {
  return (
  <DropdownMenu >
    <DropdownMenuTrigger>
        <Button variant={"ghost"}>
            <MoreHorizontal />
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent id={user.ID.toString()}>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DeleteUserDialog user={user} />
    </DropdownMenuContent>
  </DropdownMenu>
  )
}