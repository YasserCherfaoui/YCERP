import RemoveReturnDialog from "@/components/feature-specific/company-unknown-returns/remove-return-dialog";
import ViewReturnDetailsDialog from "@/components/feature-specific/company-unknown-returns/view-return-details-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Return } from "@/models/data/return.model";
import { MoreHorizontal } from "lucide-react";

interface Props {
  returnModel: Return;
}

export default function ({ returnModel }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"ghost"}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() =>
            navigator.clipboard.writeText(returnModel.ID.toString())
          }
        >
          Copy return ID
        </DropdownMenuItem>
        <ViewReturnDetailsDialog returnModel={returnModel} />
        <RemoveReturnDialog returnModel={returnModel} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
