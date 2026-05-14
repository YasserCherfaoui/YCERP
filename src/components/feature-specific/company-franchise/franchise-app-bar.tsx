import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 gap-y-4">
      <div className="flex min-w-0 w-full flex-1 flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4">
        <div className="shrink-0">
          <AppBarBackButton destination="Franchises" />
        </div>
        <nav
          className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-2 text-base sm:text-lg"
          aria-label="Franchise location"
        >
          <span className="break-words font-medium leading-snug">{company?.company_name ?? "…"}</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-70" aria-hidden />
          <span className="shrink-0 text-muted-foreground">Franchises</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-70" aria-hidden />
          <span className="break-words font-medium leading-snug text-foreground">
            {franchise?.name ?? "…"}
          </span>
        </nav>
      </div>
    </div>
  );
}
