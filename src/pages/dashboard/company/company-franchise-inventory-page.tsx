import FranchiseInventoryAppBar from "@/components/feature-specific/company-franchise/franchise-inventory/franchise-inventory-app-bar";
import FranchiseInventoryBody from "@/components/feature-specific/company-franchise/franchise-inventory/franchise-inventory-body";
import FranchiseInventoryHero from "@/components/feature-specific/company-franchise/franchise-inventory/franchise-inventory-hero";

export default function () {
    return <div className="p-4">
      <FranchiseInventoryAppBar />
      <FranchiseInventoryHero />
      <FranchiseInventoryBody />
    </div>;
  }
  