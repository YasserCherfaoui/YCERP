import CrmBackdrop from "@/components/feature-specific/crm/crm-backdrop";
import FranchiseProductsAppBar from "@/components/feature-specific/franchise-products/franchise-products-app-bar";
import FranchiseProductsBody from "@/components/feature-specific/franchise-products/franchise-products-body";
import { useCallback, useState } from "react";

export default function FranchiseProductsPage() {
  const [counts, setCounts] = useState<{
    total: number;
    filtered: number;
    withPhotos: number;
  } | null>(null);

  const handleCountsChange = useCallback(
    (next: { total: number; filtered: number; withPhotos: number }) => {
      setCounts(next);
    },
    []
  );

  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <CrmBackdrop />
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <FranchiseProductsAppBar
          totalCount={counts?.total}
          filteredCount={counts?.filtered}
          withPhotosCount={counts?.withPhotos}
        />
        <FranchiseProductsBody onCountsChange={handleCountsChange} />
      </div>
    </div>
  );
}
