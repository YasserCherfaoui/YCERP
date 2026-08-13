import UserAvatar from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Delete, Pencil, RefreshCcw } from "lucide-react";
import AddCompanyDialog from "./add-company-dialog";

export default function () {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="truncate text-lg sm:text-xl">YourEPR &gt; Companies</span>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <AddCompanyDialog />
        <div className="hidden items-center gap-2 md:flex md:gap-4">
          <Button variant={"outline"}>
            <Pencil />
            Edit Company
          </Button>
          <Button variant={"destructive"}>
            <Delete />
            Delete Company
          </Button>
          <Button variant={"ghost"}>
            <RefreshCcw />
            Refresh
          </Button>
        </div>
        <UserAvatar />
      </div>
    </div>
  );
}
