import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Supplier } from "@/models/data/supplier.model";
import { Navigation } from "lucide-react";
import SupplierEntryBillDialog from "./supplier-entry-bill-dialog";
import SupplierRemoveDialog from "./supplier-remove-dialog";

interface Props {
  supplier: Supplier;
}

export default function ({ supplier }: Props) {
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex gap-2 items-center">
            <Avatar>
              <AvatarFallback>
                {supplier.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {supplier.name}
          </div>
          <SupplierRemoveDialog supplier={supplier} />
        </CardTitle>
        <CardDescription>{supplier.address}</CardDescription>
      </CardHeader>

      <CardFooter className="flex gap-2">
        <SupplierEntryBillDialog supplierID={supplier.ID} />
        <Button>
          <Navigation />
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
