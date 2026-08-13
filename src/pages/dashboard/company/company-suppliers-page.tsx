import CompanySuppliersAppBar from "@/components/feature-specific/company-suppliers/company-suppliers-app-bar";
import CompanySuppliersBody from "@/components/feature-specific/company-suppliers/company-suppliers-body";

export default function () {
  return <div className="flex min-h-[100dvh] flex-col gap-4 p-4">
    <CompanySuppliersAppBar />
    <CompanySuppliersBody />
  </div>;
}
