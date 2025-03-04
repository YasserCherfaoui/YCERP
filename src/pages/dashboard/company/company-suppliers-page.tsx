import CompanySuppliersAppBar from "@/components/feature-specific/company-suppliers/company-suppliers-app-bar";
import CompanySuppliersBody from "./company-suppliers-body";

export default function () {
  return <div className="p-4 flex flex-col h-screen gap-4">
    <CompanySuppliersAppBar />
    <CompanySuppliersBody />
  </div>;
}
