import CompanyStatsAppBar from "@/components/feature-specific/company/company-stats/company-stats-app-bar";
import CompanyStatsBody from "@/components/feature-specific/company/company-stats/company-stats-body";

export default function () {
  return (
    <div className="p-4">
      <CompanyStatsAppBar />
      <CompanyStatsBody />
    </div>
  );
}
