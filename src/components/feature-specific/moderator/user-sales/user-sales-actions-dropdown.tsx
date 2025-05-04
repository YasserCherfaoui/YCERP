import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sale } from "@/models/data/sale.model";
import { downloadAndPrintPDF } from "@/services/sale-service";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal, Printer } from "lucide-react";
import CreateSaleReturnDialog from "./create-sale-return-dialog";
import CompanyRemoveSaleDialog from "./user-remove-sale-dialog";
import CompanySaleDetailsDialog from "./user-sale-details-dialog";

interface Props {
  sale: Sale;
}

export default function ({ sale }: Props) {
  const { mutate: downloadAndPrintMutation } = useMutation({
    mutationFn: downloadAndPrintPDF,
  });
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
        <CreateSaleReturnDialog sale={sale} />
        <DropdownMenuItem onClick={() => downloadAndPrintMutation(sale.ID)}>
          <Printer />
          Print Receipt
        </DropdownMenuItem>
        <CompanyRemoveSaleDialog sale={sale} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
