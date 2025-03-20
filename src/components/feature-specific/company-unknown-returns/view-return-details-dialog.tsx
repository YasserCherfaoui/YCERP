import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
} from "@/components/ui/table";
import { Return } from "@/models/data/return.model";
import { Search } from "lucide-react";

interface Props {
  returnModel: Return;
}

export default function ({ returnModel }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Search />
          View Return Details
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Details</DialogTitle>
          <DialogDescription>
            View details for return #{returnModel.ID}
            <br />
            Created at: {new Date(returnModel.CreatedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          <Table className="w-full">
            <TableHeader>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
            </TableHeader>
            <TableBody>
              {returnModel.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{item.product_variant?.qr_code}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">
                    {new Intl.NumberFormat("en-DZ", {
                      style: "currency",
                      currency: "DZD",
                    }).format(item.product_variant?.product?.price ?? 0)}
                  </td>
                  <td className="p-4">
                    {new Intl.NumberFormat("en-DZ", {
                      style: "currency",
                      currency: "DZD",
                    }).format(
                      item.quantity *
                        (item.product_variant?.product?.price ?? 0)
                    )}
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <Card className="mt-4">
          <CardContent>
            <dl className="divide-y">
              {[
                {
                  label: "Cost",
                  value: new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(returnModel.cost),
                },
                {
                  label: "Total",
                  value: new Intl.NumberFormat("en-DZ", {
                    style: "currency",
                    currency: "DZD",
                  }).format(returnModel.total),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2 py-3">
                  <dt className="">{label}</dt>
                  <dd className="font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Close</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
