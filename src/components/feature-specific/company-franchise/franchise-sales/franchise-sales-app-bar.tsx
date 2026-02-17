import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import FillItemPricesDialog from "@/components/feature-specific/company-franchise/franchise-sales/fill-item-prices-dialog";
import { useSelector } from "react-redux";

export default function() {
    const franchise = useSelector((state:RootState)=> state.franchise.franchise);
    if (!franchise) return;
    return (
        <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2 items-center">
                <AppBarBackButton destination="Dashboard" />
                {franchise.name} &gt; Sales
            </div>
            <FillItemPricesDialog franchiseId={franchise.ID} />
        </div>
    );
}