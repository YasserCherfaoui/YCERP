import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VariantLocationStock } from "@/models/data/inventory.model";

interface Props {
  productName?: string;
  color?: string;
  size?: string;
  totalQuantity: number;
  locations: VariantLocationStock[];
}

function locationTypeLabel(locationType: string) {
  if (locationType === "company") return "Company";
  if (locationType === "franchise") return "Franchise";
  return locationType || "Location";
}

export default function VariantLocationsDialog({
  productName,
  color,
  size,
  totalQuantity,
  locations,
}: Props) {
  const variantLabel = [color, size].filter(Boolean).join(" · ");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 font-semibold tabular-nums underline-offset-4 hover:underline"
        >
          {totalQuantity}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{productName || "Product variant"}</DialogTitle>
          {variantLabel ? (
            <DialogDescription>{variantLabel}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No locations have this variant.
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.inventory_id}>
                  <TableCell>{location.name || "Unnamed location"}</TableCell>
                  <TableCell>{locationTypeLabel(location.location_type)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {location.quantity}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right tabular-nums">{totalQuantity}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
