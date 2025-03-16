import FranchiseAppBar from "@/components/feature-specific/company-franchise/franchise-app-bar";
import FranchiseMenu from "@/components/feature-specific/franchise-dashboard/franchise-menu";

export default function () {
  return (
    <div className="flex flex-col m-10">
      <FranchiseAppBar />
      <div className="flex flex-col h-screen items-center justify-center">
        <FranchiseMenu />
      </div>
    </div>
  );
}
