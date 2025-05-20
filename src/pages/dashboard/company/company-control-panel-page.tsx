import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import CompanyTile from "@/components/feature-specific/company/company-tile";
import IssuesIcon from "@/components/feature-specific/company/issues/issues-icon";
import { Button } from "@/components/ui/button";
import {
  Apple,
  ArrowLeft,
  ChartNoAxesCombined,
  ChartPie,
  Handshake,
  Package,
  ReceiptText,
  ShoppingCart,
  Store,
  Undo2,
  UserCog,
  Warehouse,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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
          {quickMenu.map((item, index) => (
            <WideButton key={index} item={item} />
          ))}
        </div>
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
    label: "Issues",
    icon: IssuesIcon,
    href: "issues",
  },
];
