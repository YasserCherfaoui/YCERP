import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import CompanyTile from "@/components/feature-specific/company/company-tile";
import IssuesIcon from "@/components/feature-specific/company/issues/issues-icon";
import OrderTicketsIcon from "@/components/feature-specific/company/order-tickets/order-tickets-icon";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Apple,
  ArrowLeft,
  ChartNoAxesCombined,
  ChartPie,
  FileCheck,
  Handshake,
  Package,
  PackageX,
  ReceiptText,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  UserCog,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function () {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));
  const company = useSelector((state: RootState) => state.company.company);
  
  if (!company) {
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen">
      <div className="flex p-4 justify-between items-center">
        <Button onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          Back to Companies
        </Button>
      </div>
      <div className="flex flex-col gap-10 p-4 justify-center items-center">
        <CompanyTile company={company} />
        <div className="grid grid-cols-4 gap-4">
          {quickMenu.filter((i) => !(i as any).hidden).map((item, index) => (
            <WideButton key={index} item={item} />
          ))}
          <WideButton 
            item={{
              label: "Quick Actions",
              icon: Zap,
              href: "/quick-actions"
            }} 
          />
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          View and manage your affiliate network
        </div>
        <Link
          to={`/company/${company.ID}/affiliate-applications`}
          className="bg-card rounded-lg p-6 hover:bg-accent transition-colors border"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Affiliate Applications</h3>
              <p className="text-sm text-muted-foreground">
                Review and approve affiliate applications
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Manage pending affiliate applications
          </div>
        </Link>
      </div>
    </div>
  );
}

const quickMenu: Array<{ 
  label: string; 
  icon: any; 
  href?: string; 
  onClick?: () => void;
  hidden?: boolean;
}> = [
  {
    label: "Expenses",
    icon: ReceiptText,
    href: "expenses",
  },
  {
    label: "Expense Categories",
    icon: ReceiptText,
    href: "expenses?tab=categories",
    hidden: true,
  },
  {
    label: "Franchises",
    icon: Store,
    href: "franchises",
  },
  {
    label: "Products",
    icon: Apple,
    href: "products",
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
    label: "Suppliers",
    icon: Handshake,
    href: "suppliers",
  },
  {
    label: "Affiliates",
    icon: Users,
    href: "affiliates",
  },
  {
    label: "Unkown Returns",
    icon: Undo2,
    href: "unknown-returns",
  },
  {
    label: "Statistics",
    icon: ChartPie,
    href: "statistics",
  },
  {
    label: "IAM",
    icon: UserCog,
    href: "iam",
  },
  {
    label: "Inventory Analytics",
    icon: ChartNoAxesCombined,
    href: "inventory-analytics",
  },
  {
    label: "Orders",
    icon: Package,
    href: "orders",
  },
  {
    label: "CRM Customers",
    icon: Users,
    href: "crm/customers",
  },
  {
    label: "Daily Deliveries",
    icon: Truck,
    href: "crm/deliveries",
  },
  {
    label: "Issues",
    icon: IssuesIcon,
    href: "issues",
  },
  {
    label: "Order Tickets",
    icon: OrderTicketsIcon,
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
    icon: AlertTriangle,
    href: "stock-alerts",
  },
  {
    label: "Broken Items Transfers",
    icon: PackageX,
    href: "broken-items-transfers",
  },
  // {
  //   label: "Charges",
  //   icon: Calculator,
  //   href: "charges",
  // },
];
