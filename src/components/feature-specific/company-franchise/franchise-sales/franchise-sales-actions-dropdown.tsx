import CreateFranchiseReturnDialog from "@/components/feature-specific/company-franchise/franchise-sales/create-franchise-return-dialog";
import UpdateFranchiseReturnDialog from "@/components/feature-specific/company-franchise/franchise-sales/update-franchise-return-dialog";
import CompanySaleDetailsDialog from "@/components/feature-specific/company-sales/company-sale-details-dialog";
import FranchiseRemoveSaleDialog from "@/components/feature-specific/franchise-sales/franchise-remove-sale-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sale } from "@/models/data/sale.model";
import { MoreHorizontal } from "lucide-react";


interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(sale.ID.toString())}
        >
          Copy sale ID
        </DropdownMenuItem>
        <CompanySaleDetailsDialog sale={sale} />
        {sale.return ? <UpdateFranchiseReturnDialog sale={sale} /> : <CreateFranchiseReturnDialog sale={sale} />}
        <FranchiseRemoveSaleDialog sale={sale} />
      </DropdownMenuContent>

    </DropdownMenu>
  );
}
