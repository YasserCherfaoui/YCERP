import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BillItem } from "@/models/data/bill.model";
import {
  CreateSupplierBillSchema,
  createSupplierBillSchema,
} from "@/schemas/supplier";
import { getCompanyInventory } from "@/services/inventory-service";
import { createSupplierBill } from "@/services/supplier-service";
import { processBarcodeSupplier } from "@/utils/process-barcode-supplier";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppleIcon, Barcode, PackagePlus, Scan } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MakeSupplierBillTile from "./make-supplier-bill-tile";

interface Props {
  supplierID: number;
}
export default function ({ supplierID }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  let company = useSelector((state: RootState) => state.company.company);
  const user = useSelector((state: RootState) => state.user.user);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const admin = useSelector((state: RootState) => state.auth.user);
  const [billItems, setBillItems] = useState<Array<BillItem>>([]);
  const { toast } = useToast();
  const form = useForm<CreateSupplierBillSchema>({
    resolver: zodResolver(createSupplierBillSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      supplier_id: supplierID,
      administrator_id: admin?.ID,
      user_id: user?.ID,
      items: [],
      total: 0,
    },
  });
  const { mutate: createSupplierBillMutation, isPending } = useMutation({
    mutationFn: createSupplierBill,
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Bill Created",
        description: "Bill was created successfully",
      });
      form.reset();
      setBillItems([]);
    },
    onError: () => {
      toast({
        title: "Error creating bill",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    enabled: !!company,
    queryFn: () => getCompanyInventory(company?.ID ?? 0),
  });

  const onSaveClicked = (data: CreateSupplierBillSchema) => {
    createSupplierBillMutation({
      ...data,
      items: billItems.map((billItem) => ({
        product_variant_id: billItem.product_variant_id,
        quantity: billItem.quantity,
      })),
      paid: data.paid,
      total: billItems
        .map((b) => b.price)
        .reduce((prev, curr) => prev + curr, 0),
    });
  };
  const barcodes: string[] =
    inventory?.data?.items.map((item) => item.product_variant?.qr_code ?? "") ??
    [];
  const myProcessBarcode = () =>
    processBarcodeSupplier({
      inventory: inventory!,
      input,
      billItems,
      setBillItems,
      toast,
      setInput,
      barcodes,
    });

  useEffect(() => {
    let timeout;

    const handleKeyPress = (e: any) => {
      console.log(e.key);
      // Prevent default form submission on Enter
      if (e.key === "Enter") {
        e.preventDefault();
        myProcessBarcode();
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    // Barcode scanners typically send data quickly, so we use a timeout
    // to determine when the full barcode has been entered
    timeout = setTimeout(() => {
      if (input.length > 0) {
        myProcessBarcode();
      }
    }, 1000); // Adjust timeout based on your scanner's speed

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(timeout);
    };
  }, [input]);

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"outline"}>
          <PackagePlus />
          Entry Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <PackagePlus />
            Entry Bill
          </DialogTitle>
          <DialogDescription>
            Make a new entry bill for a supplier.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p className="flex gap-2 items-center">
            <Scan />
            <Barcode /> Scan the Barcode
          </p>

          <p className="flex gap-2 items-center">
            <AppleIcon /> Loaded Products: {inventory?.data?.items.length}{" "}
          </p>
          <div className="h-4" />

          <Form {...form}>
            <FormField
              name="paid"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid (DZD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The amount paid by the company to the supplier.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <div className="h-4" />
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Scan barcode..."
            className="w-full"
            autoFocus
          />
          <ScrollArea>
            <ul className="flex flex-col gap-2 p-2 max-h-72">
              {billItems.map((billItem) => (
                <MakeSupplierBillTile
                  key={billItem.product_variant_id}
                  billItem={billItem}
                  billItems={billItems}
                  setBillItems={setBillItems}
                  items={inventory?.data?.items ?? []}
                />
              ))}
            </ul>
          </ScrollArea>
          <div className="flex text-xl text-white justify-end">
            Total:{" "}
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(billItems.reduce((prev, curr) => prev + curr.price, 0))}
          </div>
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSaveClicked, console.error)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
