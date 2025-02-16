import UserAvatar from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Delete, Pencil, RefreshCcw } from "lucide-react";
import AddCompanyDialog from "./add-company-dialog";

export default function () {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xl">YourEPR &gt; Companies</span>
      <div className="flex gap-4">
        <AddCompanyDialog />
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
        <UserAvatar />
      </div>
    </div>
  );
}
