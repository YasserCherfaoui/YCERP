import { RootState } from "@/app/store";
import WideButton from "@/components/common/wide-button";
import { Apple, ReceiptText, ShoppingCart, Warehouse } from "lucide-react";
import { useSelector } from "react-redux";
import FranchiseTile from "./franchise-tile";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return;
  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4">
      <FranchiseTile franchise={franchise} />
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
];
