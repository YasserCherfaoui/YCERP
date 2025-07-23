import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import { Apple, BarChart, ReceiptText, ShoppingCart, Warehouse } from "lucide-react";
import { useSelector } from "react-redux";
import FranchiseTile from "./franchise-tile";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <FranchiseTile franchise={franchise} />
      <div className="flex flex-wrap justify-center gap-4 self-center">
        {quickMenu.map((item, index) => (
          <WideButton key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

const quickMenu = [
  {
    label: "Sales",
    icon: ShoppingCart,
    href: "sales",
  },
  {
    label: "Inventory",
    icon: Warehouse,
    href: "inventory",
  },
  {
    label: "Bills",
    icon: ReceiptText,
    href: "bills",
  },
  {
    label: "Products",
    icon: Apple,
    href: "products",
  },
  {
    label: "Statistics",
    icon: BarChart,
    href: "statistics",
  }
];
