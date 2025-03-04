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

interface Props {
  supplier: Supplier;
}

export default function ({ supplier }: Props) {
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              {supplier.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {supplier.name}
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
