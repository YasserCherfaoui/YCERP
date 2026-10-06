import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
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
          variant="outline"
          size="sm"
          className="h-8 min-w-8 border-border bg-muted/40 px-2 font-medium tabular-nums"
          aria-label={`Available quantity across locations: ${totalQuantity}`}
        >
          {totalQuantity}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>{productName || "Product variant"}</DialogTitle>
          <DialogDescription>
            {variantLabel ? `${variantLabel} · ` : ""}
            On-hand quantity at each location
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border">
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
                  <TableCell className="font-medium">
                    {location.name || "Unnamed location"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={location.location_type === "company" ? "secondary" : "outline"}>
                      {locationTypeLabel(location.location_type)}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      location.quantity === 0 && "text-muted-foreground"
                    )}
                  >
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
