import FranchiseSalesAppBar from "@/components/feature-specific/franchise-sales/franchise-sales-app-bar";
import FranchiseSalesBody from "@/components/feature-specific/franchise-sales/franchise-sales-body";


export default function () {
    return <div className="p-4">
        <FranchiseSalesAppBar />
        <FranchiseSalesBody />
    </div>
}