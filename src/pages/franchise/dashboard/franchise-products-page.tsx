import FranchiseProductsAppBar from "@/components/feature-specific/franchise-products/franchise-products-app-bar";
import FranchiseProductsBody from "@/components/feature-specific/franchise-products/franchise-products-body";


export default function() {
    return <div className="flex flex-col gap-4 p-4">
        <FranchiseProductsAppBar />
        <FranchiseProductsBody />
    </div>
}