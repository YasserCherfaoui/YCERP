import FranchiseMenu from "@/components/feature-specific/franchise-dashboard/franchise-menu";
import FranchiseAppBar from "@/components/feature-specific/company-franchise/franchise-app-bar";

export default function () {
  return (
    <div className="mx-4 flex min-h-0 flex-col gap-6 py-6 md:mx-10 md:py-8">
      <FranchiseAppBar />
      <div className="flex w-full flex-col items-center gap-8 pb-10">
        <FranchiseMenu />
      </div>
    </div>
  );
}
