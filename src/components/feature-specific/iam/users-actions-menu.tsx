import DeleteUserDialog from "@/components/feature-specific/iam/delete-user-dialog";
import GenerateTokenDialog from "@/components/feature-specific/iam/generate-token-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    <GenerateTokenDialog user={user} />
    <DropdownMenuSeparator />
    <DeleteUserDialog user={user} />
    </DropdownMenuContent>
  </DropdownMenu>
  )
}