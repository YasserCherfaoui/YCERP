import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import WideButton from "@/components/common/wide-button";
import { SendWhatsAppDialog } from "@/components/feature-specific/admin/send-whatsapp-dialog";
import CompanyTile from "@/components/feature-specific/company/company-tile";
import IssuesIcon from "@/components/feature-specific/company/issues/issues-icon";
import OrderTicketsIcon from "@/components/feature-specific/company/order-tickets/order-tickets-icon";
import {
  AlertTriangle,
  Apple,
  Bell,
  ChartNoAxesCombined,
  ChartPie,
  Contact,
  FileCheck,
  Handshake,
  List,
  MapPinned,
  MessageSquare,
  Package,
  PackageCheck,
  PackageX,
  ReceiptText,
  RotateCcw,
  Settings2,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  UserCog,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

type MenuItem = {
  label: string;
  icon: LucideIcon | ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function CompanyControlPanelPage() {
  const company = useSelector((state: RootState) => state.company.company);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  if (!company) {
    return null;
  }

  const menuSections: MenuSection[] = [
    {
      title: "Operations",
      items: [
        { label: "Sales", icon: ShoppingCart, href: "sales" },
        { label: "Inventory", icon: Warehouse, href: "warehouse" },
        { label: "Bills", icon: ReceiptText, href: "bills" },
        { label: "Products", icon: Apple, href: "products" },
        { label: "Orders", icon: Package, href: "orders" },
        { label: "Suppliers", icon: Handshake, href: "suppliers" },
      ],
    },
    {
      title: "Network",
      items: [
        { label: "Franchises", icon: Store, href: "franchises" },
        { label: "Franchise fulfillment", icon: PackageCheck, href: "franchise-fulfillment" },
        { label: "Pickup requests", icon: Truck, href: "pickup-requests" },
        { label: "Affiliates", icon: Users, href: "affiliates" },
        {
          label: "Affiliate applications",
          icon: FileCheck,
          href: `/company/${company.ID}/affiliate-applications`,
        },
        { label: "Customers", icon: Contact, href: "crm/customers" },
      ],
    },
    {
      title: "Stock",
      items: [
        { label: "Missing variants", icon: AlertTriangle, href: "missing-variants" },
        { label: "Stock alerts", icon: Bell, href: "stock-alerts" },
        { label: "Unknown returns", icon: Undo2, href: "unknown-returns" },
        { label: "Broken items transfers", icon: PackageX, href: "broken-items-transfers" },
        { label: "Declared quantities", icon: RotateCcw, href: "broken-items-declarations" },
      ],
    },
    {
      title: "Delivery & web",
      items: [
        { label: "Delivery", icon: MapPinned, href: "delivery" },
        { label: "Web order refund", icon: RotateCcw, href: "woo-refund" },
        { label: "Web order line items", icon: List, href: "woo-line-items" },
      ],
    },
    {
      title: "Finance",
      items: [
        { label: "Expenses", icon: ReceiptText, href: "expenses" },
        { label: "Statistics", icon: ChartPie, href: "statistics" },
        { label: "Inventory analytics", icon: ChartNoAxesCombined, href: "inventory-analytics" },
      ],
    },
    {
      title: "Support & admin",
      items: [
        { label: "Issues", icon: IssuesIcon, href: "issues" },
        { label: "Order tickets", icon: OrderTicketsIcon, href: "order-tickets" },
        { label: "IAM", icon: UserCog, href: "iam" },
        { label: "Quick actions", icon: Zap, href: "/quick-actions" },
        {
          label: "Send WhatsApp",
          icon: MessageSquare,
          onClick: () => setWhatsappDialogOpen(true),
        },
        { label: "WhatsApp settings", icon: Settings2, href: "whatsapp-settings" },
      ],
    },
  ];

  return (
    <>
      <SendWhatsAppDialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen} />
      <main className="mx-auto w-full max-w-5xl px-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <AppBarBackButton destination="Companies" />
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          <header className="flex flex-col items-start gap-2">
            <CompanyTile company={company} />
            <p className="max-w-xl text-sm text-muted-foreground">
              Inventory, franchises, orders, and support for this company.
            </p>
          </header>

          {menuSections.map((section) => (
            <section key={section.title} className="space-y-2 sm:space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {section.items.map((item) => (
                  <WideButton key={item.label} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
