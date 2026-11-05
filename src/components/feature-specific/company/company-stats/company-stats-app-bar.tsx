import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { useSelector } from "react-redux";

export default function CompanyStatsAppBar() {
  const company = useSelector((state: RootState) => state.company.company);
  return (
    <header className="flex min-w-0 items-start gap-3">
      <AppBarBackButton destination="Menu" />
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{company?.company_name}</p>
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Franchise sold quantities and delivered WooCommerce orders by carrier.
        </p>
      </div>
    </header>
  );
}
