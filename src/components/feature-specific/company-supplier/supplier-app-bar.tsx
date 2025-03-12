import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SupplierResponse } from "@/models/data/supplier.model";
import { useSelector } from "react-redux";

interface Props {
  supplier: SupplierResponse;
}

export default function ({ supplier }: Props) {
  const company = useSelector((state: RootState) => state.company.company);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        {/* ANCHOR: Leading + Title */}
        <div className="flex gap-4">
          <AppBarBackButton destination="Suppliers" />
          <span className="text-2xl">
            {company?.company_name} &gt; Suppliers &gt; {supplier.supplier.name}
          </span>
        </div>
        {/* ANCHOR: ACTION BUTTONS */}
        <div className="flex gap-4"></div>
      </div>
      <div className="flex gap-2">
        <Card className="p-4 flex flex-col gap-3">
          <CardTitle className="text-xl">Paid</CardTitle>
          <CardContent className="text-2xl">
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(supplier.totals.Paid)}
          </CardContent>
        </Card>
        <Card className="p-4 flex flex-col gap-3">
          <CardTitle className="text-xl">Due</CardTitle>
          <CardContent className="text-2xl">
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(supplier.totals.Due)}
          </CardContent>
        </Card>
        <Card className="p-4 flex flex-col gap-3">
          <CardTitle className="text-xl">Total</CardTitle>
          <CardContent className="text-2xl">
            {new Intl.NumberFormat("en-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(supplier.totals.Total)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
