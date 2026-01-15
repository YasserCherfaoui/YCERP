import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import CompanyTile from "@/components/feature-specific/company/company-tile";
import IssuesIcon from "@/components/feature-specific/company/issues/issues-icon";
import {
    AlertTriangle,
    Apple,
    Bell,
    Handshake,
    Package,
    PackageX,
    ReceiptText,
    ShoppingCart,
    Store,
    Ticket,
    Truck,
    Undo2,
    Warehouse,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.user.company);
  if (!company) {
    return null;
  }
  return (
    <div className="flex h-screen flex-col gap-10 p-4 justify-center items-center">
      <CompanyTile company={company} />
      <div className="grid grid-cols-3 gap-4">
        {quickMenu.map((item, index) => (
          <WideButton key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

const quickMenu = [
  {
    label: "Franchises",
    icon: Store,
    href: "franchises",
  },
  {
    label: "Inventory",
    icon: Warehouse,
    href: "warehouse",
  },
  {
    label: "Bills",
    icon: ReceiptText,
    href: "bills",
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    href: "sales",
  },
  {
    label: "Orders",
    icon: Package,
    href: "orders",
  },
  {
    label: "Suppliers",
    icon: Handshake,
    href: "suppliers",
  },
  {
    label: "Unkown Returns",
    icon: Undo2,
    href: "unknown-returns",
  },
  {
    label: "Products",
    icon: Apple,
    href: "products",
  },
  {
    label: "Issues",
    icon: IssuesIcon,
    href: "issues",
  },
  {
    label: "Order Tickets",
    icon: Ticket,
    href: "order-tickets",
  },
  {
    label: "Delivery",
    icon: Truck,
    href: "delivery",
  },
  {
    label: "Missing Variants",
    icon: AlertTriangle,
    href: "missing-variants",
  },
  {
    label: "Stock Alerts",
    icon: Bell,
    href: "stock-alerts",
  },
  {
    label: "Broken Items Transfers",
    icon: PackageX,
    href: "broken-items-transfers",
  },
];
