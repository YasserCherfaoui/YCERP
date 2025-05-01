import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        {/* ANCHOR: Leading + Title */}
        <div className="flex gap-4">
          <AppBarBackButton destination="Menu" />
          <span className="text-2xl">
            {company?.company_name} &gt; Statistics
          </span>
        </div>
        {/* ANCHOR: ACTION BUTTONS */}
        <div className="flex gap-4"></div>
      </div>
      <div className="flex gap-2">
        <Card>
          <CardTitle>Total Sales</CardTitle>
          <CardContent>{/* {company?.totals.TotalSales} */}</CardContent>
        </Card>
      </div>
    </div>
  );
}
