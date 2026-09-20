import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductVariant } from "@/models/data/product.model";
import { Commune } from "@/models/responses/yalidine.cache";
import { CreateOrderSchema } from "@/schemas/order";
import { getCompanyInventory } from "@/services/inventory-service";
import { getYalidineCommunes } from "@/services/order-service";
import { confirmWooCommerceOrderFromScratch } from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices, Loader2 } from "lucide-react";
import { useState } from "react";

const DEV_NAMES = [
  "Ahmed Benali",
  "Sara Meziane",
  "Karim Bouzid",
  "Nadia Cherif",
  "Yacine Hamidi",
  "Lina Mansouri",
  "Omar Belkacem",
];

const DEV_PHONES = [
  "0550123456",
  "0661234567",
  "0770084275",
  "0541987654",
  "0790123789",
  "0560789012",
];

const DEV_STREETS = [
  "Rue Didouche Mourad",
  "Cité 1000 Logements",
  "Hai El Badr",
  "Boulevard Mohamed V",
  "Rue Larbi Ben M'hidi",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function isDeliverable(commune: Commune): boolean {
  return Boolean(commune.is_deliverable);
}

async function buildRandomOrder(
  companyId: number,
  variants: ProductVariant[],
  communeCache: Map<string, Commune[]>
): Promise<CreateOrderSchema> {
  if (variants.length === 0) {
    throw new Error("No product variants in inventory to attach to orders");
  }

  let wilaya = pickRandom(cities);
  let communes = communeCache.get(wilaya.key);
  if (!communes) {
    const res = await getYalidineCommunes(Number(wilaya.key));
    communes = (res.data?.data ?? []).filter(isDeliverable);
    communeCache.set(wilaya.key, communes);
  }

  // Fallback to Alger if the random wilaya has no deliverable communes
  if (communes.length === 0) {
    wilaya = cities.find((c) => c.key === "16") ?? wilaya;
    communes = communeCache.get(wilaya.key);
    if (!communes) {
      const res = await getYalidineCommunes(Number(wilaya.key));
      communes = (res.data?.data ?? []).filter(isDeliverable);
      communeCache.set(wilaya.key, communes);
    }
  }
  if (communes.length === 0) {
    throw new Error("No deliverable Yalidine communes available");
  }

  const commune = pickRandom(communes);
  const variant = pickRandom(variants);
  const quantity = Math.floor(Math.random() * 3) + 1;
  const unitPrice = variant.product?.price ?? 0;
  const deliveryFee = 600;
  const itemsTotal = unitPrice * quantity;

  return {
    company_id: companyId,
    shipping: {
      full_name: pickRandom(DEV_NAMES),
      phone_number: pickRandom(DEV_PHONES),
      phone_number_2: "",
      address: `${pickRandom(DEV_STREETS)} n°${Math.floor(Math.random() * 200) + 1}`,
      city: wilaya.label,
      state: wilaya.key,
      wilaya: wilaya.label,
      commune: commune.name,
      comments: "DEV bulk random order",
    },
    order_items: [
      {
        product_id: variant.product_id,
        product_variant_id: variant.ID,
        quantity,
        discount: 0,
      },
    ],
    total: itemsTotal + deliveryFee,
    status: "packing",
    discount: 0,
    shipping_provider: "yalidine",
    delivery_type: "home",
    selected_commune: String(commune.id),
    selected_center: "",
    first_delivery_cost: deliveryFee,
    second_delivery_cost: deliveryFee,
    ship_from_franchise: false,
  };
}

interface CreateRandomOrdersDialogProps {
  companyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRandomOrdersDialog({
  companyId,
  open,
  onOpenChange,
}: CreateRandomOrdersDialogProps) {
  const [count, setCount] = useState(5);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory", companyId],
    queryFn: () => getCompanyInventory(companyId),
    enabled: Boolean(companyId) && open,
  });

  const variants =
    inventoryData?.data?.items
      ?.map((item) => item.product_variant)
      .filter((v): v is NonNullable<typeof v> => Boolean(v)) ?? [];

  const mutation = useMutation({
    mutationFn: async (n: number) => {
      const communeCache = new Map<string, Commune[]>();
      let created = 0;
      setProgress({ done: 0, total: n });
      for (let i = 0; i < n; i++) {
        const payload = await buildRandomOrder(companyId, variants, communeCache);
        await confirmWooCommerceOrderFromScratch(payload);
        created++;
        setProgress({ done: created, total: n });
      }
      return created;
    },
    onSuccess: (created) => {
      toast({
        title: "Random orders created",
        description: `Created ${created} order${created === 1 ? "" : "s"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onOpenChange(false);
      setProgress(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to create random orders",
        description: err.message,
        variant: "destructive",
      });
      setProgress(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handleCreate = () => {
    const n = Math.floor(Number(count));
    if (!Number.isFinite(n) || n < 1 || n > 100) {
      toast({
        title: "Invalid count",
        description: "Enter a number between 1 and 100",
        variant: "destructive",
      });
      return;
    }
    if (variants.length === 0) {
      toast({
        title: "No variants",
        description: "Load inventory with at least one product variant first",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(n);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create random orders</DialogTitle>
          <DialogDescription>
            DEV only. Creates packing orders with random customer, wilaya, and
            inventory variants.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="random-orders-count">Count</Label>
            <Input
              id="random-orders-count"
              type="number"
              min={1}
              max={100}
              value={count}
              disabled={mutation.isPending}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
          {progress && (
            <p className="text-sm text-muted-foreground">
              Creating {progress.done}/{progress.total}…
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={handleCreate}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Dices className="h-4 w-4" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreateRandomOrdersDevButtonProps {
  companyId: number;
}

export default function CreateRandomOrdersDevButton({
  companyId,
}: CreateRandomOrdersDevButtonProps) {
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Dices className="h-4 w-4" />
        <span className="sm:hidden">Random</span>
        <span className="hidden sm:inline">Create random orders</span>
      </Button>
      <CreateRandomOrdersDialog
        companyId={companyId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
