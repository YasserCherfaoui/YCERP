import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { SupplierResponse } from "@/models/data/supplier.model";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import RecordPaymentDialog from "./record-payment-dialog";

interface Props {
  supplier: SupplierResponse;
}

export default function ({ supplier }: Props) {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
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
        <div className={`flex gap-4 ${isModerator ? 'hidden' : ''}`}>
          <RecordPaymentDialog supplier={supplier} />
        </div>
      </div>
      <div className={`flex gap-2 ${isModerator ? 'hidden' : ''}`}>
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
