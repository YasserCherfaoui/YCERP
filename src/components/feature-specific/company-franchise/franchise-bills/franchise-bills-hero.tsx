import { RootState } from "@/app/store";
import {
  getCompanyFranchisePaymentTotals,
  getSuperFranchiseEntryBills,
  getSuperFranchiseExitBills
} from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import FranchiseBillsSummaryCards from "./franchise-bills-summary-cards";
import FranchiseBillsTabs from "./franchise-bills-tabs/franchise-bills-tabs";

export default function () {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  if (!franchise) return null;
  const { data: exitBills } = useQuery({
    queryKey: ["franchise-exit-bills"],
    queryFn: () => getSuperFranchiseExitBills(franchise.ID),
    enabled: !!franchise,
  });
  const { data: entryBills } = useQuery({
    queryKey: ["franchise-entry-bills"],
    queryFn: () => getSuperFranchiseEntryBills(franchise.ID),
    enabled: !!franchise,
  });
  const { data: paymentTotals } = useQuery({
    queryKey: ["franchise-totals"],
    queryFn: () => getCompanyFranchisePaymentTotals(franchise.ID),
    enabled: !!franchise,
  })
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col gap-4">
      <FranchiseBillsSummaryCards
        exitBills={exitBills}
        entryBills={entryBills}
        paymentTotals={paymentTotals}
      />
      <FranchiseBillsTabs exitBills={exitBills} entryBills={entryBills} />
    </main>
  );
}
