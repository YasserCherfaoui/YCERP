import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import {
  AlertTriangle,
  Apple,
  BarChart3,
  Bell,
  DollarSign,
  Package,
  ReceiptText,
  RotateCcw,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSelector } from "react-redux";
import FranchiseTile from "./franchise-tile";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "Operations",
    items: [
      { label: "Sales", icon: ShoppingCart, href: "sales" },
      { label: "Inventory", icon: Warehouse, href: "inventory" },
      { label: "Bills", icon: ReceiptText, href: "bills" },
      { label: "Products", icon: Apple, href: "products" },
    ],
  },
  {
    title: "Fulfillment",
    items: [
      { label: "Pickup requests", icon: Truck, href: "pickup-requests" },
      { label: "Ship-from store", icon: Package, href: "ship-from-store" },
      { label: "Missing variants", icon: AlertTriangle, href: "missing-variants" },
      { label: "Variant deposits", icon: Wallet, href: "variant-deposits" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Expenses", icon: DollarSign, href: "expenses" },
      { label: "Statistics", icon: BarChart3, href: "statistics" },
      { label: "Web order refund", icon: RotateCcw, href: "woo-refund" },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Stock alerts", icon: Bell, href: "stock-alerts" },
      { label: "Customers", icon: Users, href: "crm/customers" },
    ],
  },
];

export default function FranchiseMenu() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
      <header className="flex flex-col items-center gap-2">
        <FranchiseTile franchise={franchise} />
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Daily operations, stock, and pickup from this location.
        </p>
      </header>

      {menuSections.map((section) => (
        <section key={section.title} className="space-y-2 sm:space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {section.items.map((item) => (
              <WideButton key={item.href} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
