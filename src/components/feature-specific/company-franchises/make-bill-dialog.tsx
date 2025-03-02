import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BillItem } from "@/models/data/bill.model";
import { Franchise } from "@/models/data/franchise.model";
import { CreateExitBillSchema, createExitBillSchema } from "@/schemas/bill";
import { createExitBill } from "@/services/bill-service";
import { getCompanyInventory } from "@/services/inventory-service";
import { processBarcode } from "@/utils/process-barcode";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppleIcon, Barcode, ReceiptText, Scan } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import MakeBillTile from "./make-bill-tile";

interface Props {
  franchise: Franchise;
}

export default function ({ franchise }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const company = useSelector((state: RootState) => state.company.company);
  const [billItems, setBillItems] = useState<Array<BillItem>>([]);
  const { toast } = useToast();
  const form = useForm<CreateExitBillSchema>({
    resolver: zodResolver(createExitBillSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      franchise_id: franchise.ID,
      bill_items: [],
    },
  });
  const { mutate: createExitBillMutation, isPending } = useMutation({
    mutationFn: createExitBill,
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


  const handleCreateExitBill = (data: CreateExitBillSchema) => {
    createExitBillMutation({
      ...data,
      bill_items: billItems.map((billItem) => ({
        product_variant_id: billItem.product_variant_id,
        quantity: billItem.quantity,
      })),
    });
  };
  const barcodes:string[] =
  inventory?.data?.items.map((item) => item.product_variant?.qr_code ?? "") ?? [];
  const myProcessBarcode = () =>
    processBarcode({
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
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <ReceiptText />
          Make bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="flex gap-2 items-center">
          <ReceiptText />
          Make bill on <span className="text-green-400">{franchise.name}</span>
        </DialogTitle>
        <DialogDescription>
          <p className="flex gap-2 items-center">
            <Scan />
            <Barcode /> Scan the Barcode
          </p>

          <p className="flex gap-2 items-center">
            <AppleIcon /> Loaded Products: {inventory?.data?.items.length}{" "}
          </p>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Scan barcode..."
            className="w-full"
            autoFocus
          />
          <div>
            <ul className="flex flex-col gap-2 p-2">
              {billItems.map((billItem) => (
                <MakeBillTile
                  key={billItem.product_variant_id}
                  billItem={billItem}
                  billItems={billItems}
                  setBillItems={setBillItems}
                  items={inventory?.data?.items ?? []}
                />
              ))}
            </ul>
          </div>
          <div className="flex text-xl text-white justify-end">
            Total:{" "}
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(billItems.reduce((prev, curr) => prev + curr.price, 0))}
          </div>
          <Form {...form}>
            <FormField
              name="company_id"
              control={form.control}
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              setBillItems([]);
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(handleCreateExitBill)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
