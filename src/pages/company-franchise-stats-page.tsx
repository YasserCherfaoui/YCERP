import CompanyFranchiseStatsAppBar from "@/components/feature-specific/company-franchise/franchise-stats/company-franchise-stats-app-bar";
import CompanyFranchiseStatsBody from "@/components/feature-specific/company-franchise/franchise-stats/company-franchise-stats-body";


export default function() { 
    return <div className="p-4">
        <CompanyFranchiseStatsAppBar />
        <CompanyFranchiseStatsBody />
    </div>
}