import FranchisePickupRequestsAppBar from "@/components/feature-specific/franchise-pickup/franchise-pickup-requests-app-bar";
import FranchisePickupRequestsBody from "@/components/feature-specific/franchise-pickup/franchise-pickup-requests-body";

export default function FranchisePickupRequestsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-3 pb-[max(2rem,env(safe-area-inset-bottom))] sm:space-y-6 sm:p-6">
      <FranchisePickupRequestsAppBar />
      <FranchisePickupRequestsBody />
    </div>
  );
}
