import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";

interface ExpensesAppBarProps {
  onOpenCreateExpense: () => void;
}

export default function ExpensesAppBar({ onOpenCreateExpense }: ExpensesAppBarProps) {
  const company = useSelector((state: RootState) => state.company.company);
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <AppBarBackButton destination="Menu" />
        <span className="text-2xl">
          {company?.company_name} &gt; Expenses
        </span>
      </div>
      <div className="flex gap-3 items-center">
        <Button onClick={onOpenCreateExpense}>
          <Plus className="mr-2 h-4 w-4" /> New Expense
        </Button>
      </div>
    </div>
  );
}



