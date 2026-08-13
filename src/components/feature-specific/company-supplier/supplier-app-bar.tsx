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
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const company = isModerator ? userCompany : companyFromStore;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
          <AppBarBackButton destination="Suppliers" />
          <span className="truncate text-lg sm:text-2xl">
            {company?.company_name} &gt; Suppliers &gt; {supplier.supplier.name}
          </span>
        </div>
        <div className={`flex gap-2 sm:gap-4 ${isModerator ? "hidden" : ""}`}>
          <RecordPaymentDialog supplier={supplier} />
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-2 sm:grid-cols-3 ${isModerator ? "hidden" : ""}`}>
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
