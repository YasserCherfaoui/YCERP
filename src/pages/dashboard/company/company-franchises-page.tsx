import CompanyFranchisesAppBar from "@/components/feature-specific/company-franchises/company-franchises-app-bar";
import CompanyFranchisesTable from "@/components/feature-specific/company-franchises/company-franchises-table";

export default function() {
    return <div className="p-4">
        <CompanyFranchisesAppBar />
        <CompanyFranchisesTable />
    </div>
}