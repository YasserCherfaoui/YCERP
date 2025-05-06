import { RootState } from "@/app/store";
import MakeBillTile from "@/components/feature-specific/company-franchises/make-bill-tile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BillItem, ExitBill } from "@/models/data/bill.model";
import { CreateEntryBillSchema, createEntryBillSchema } from "@/schemas/bill";
import {
  createFranchiseEntryBill,
  getFranchiseInventory,
} from "@/services/franchise-service";
import { processBarcode } from "@/utils/process-barcode";
import {
  validateExtraEntryExitBill,
  validateMissingEntryExitBill,
} from "@/utils/validate-entry-exit-bill";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppleIcon, Barcode, PackageCheck, Scan } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import FranchiseExtraEntryBillDialog from "./franchise-extra-entry-bill-dialog";
import FranchiseMissingEntryBillDialog from "./franchise-missing-entry-bill-dialog";

interface Props {
  bill: ExitBill;
}

export default function ({ bill }: Props) {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  const [open, setOpen] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [missingItems, setMissingItems] = useState<BillItem[]>([]);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraItems, setExtraItems] = useState<BillItem[]>([]);
  const [input, setInput] = useState("");
  const [billItems, setBillItems] = useState<Array<BillItem>>([]);
  const { toast } = useToast();
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getFranchiseInventory(franchise.ID),
    enabled: !!franchise,
  });
  const queryClient = useQueryClient();
  const { mutate: createEntryBillMutation, isPending } = useMutation({
    mutationFn: createFranchiseEntryBill,
    onSuccess: () => {
      toast({
        title: "Entry Bill Created",
        description: "Entry Bill was created successfully",
      });
      setOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      queryClient.invalidateQueries({
        queryKey: ["franchise-entry-bills"],
      });
      queryClient.invalidateQueries({
        queryKey: ["franchise-exit-bills"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating entry bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateEntryBillSchema>({
    resolver: zodResolver(createEntryBillSchema),
    defaultValues: {
      exit_bill_id: bill.ID,
      bill_items: [],
      missing_items: [],
      extra_items: [],
      broken_items: [],
    },
  });
  //! ENTRY BILL SHOULD ACCEPT ONLY BARCODES
  //! OF BILL'S VARAINTS
  const barcodes: string[] =
    bill.bill_items.map((item) => item.product_variant?.qr_code ?? "") ?? [];
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
        <Button variant={"ghost"} className="text-blue-500 pl-2">
          <PackageCheck />
          Make Entry Bill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <PackageCheck /> Make Entry Bill
          </DialogTitle>
          <div className="flex flex-col gap-2">
            <span>Please confirm the reception of the items in the bill.</span>
            <span className="flex gap-2 items-center">
              <Scan />
              <Barcode /> Scan the Barcode
            </span>

            <span className="flex gap-2 items-center">
              <AppleIcon /> Loaded Products: {bill.bill_items.length}{" "}
            </span>

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
          </div>
        </DialogHeader>
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
            onClick={() => {
              form.setValue(
                "bill_items",
                billItems.map((item) => ({
                  product_variant_id: item.product_variant_id,
                  quantity: item.quantity,
                }))
              );

              let a = validateMissingEntryExitBill({
                entryItems: billItems,
                exitItems: bill.bill_items,
              });
              if (a.length > 0) {
                setMissingItems(a);
                setMissingOpen(true);
              }

              let b = validateExtraEntryExitBill({
                entryItems: billItems,
                exitItems: bill.bill_items,
              });
              if (b.length > 0) {
                setExtraItems(b);
                setExtraOpen(true);
                form.setValue(
                  "extra_items",
                  b.map((item) => ({
                    product_variant_id: item.product_variant_id,
                    quantity: item.quantity,
                  }))
                );
              }
              if (a.length === 0 && b.length === 0) {
                createEntryBillMutation(form.getValues());
              }
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
      <FranchiseMissingEntryBillDialog
        missingItems={missingItems}
        open={missingOpen}
        primaryForm={form}
        setOpen={setMissingOpen}
        setPrimaryFormOpen={setOpen}
        submitMutation={createEntryBillMutation}
      />
      <FranchiseExtraEntryBillDialog
        extraItems={extraItems}
        open={extraOpen}
        setOpen={setExtraOpen}
        setPrimaryFormOpen={setOpen}
        primaryForm={form}
        submitMutation={
          extraItems.length > 0 && missingItems.length == 0
            ? createEntryBillMutation
            : undefined
        }
      />
    </Dialog>
  );
}
