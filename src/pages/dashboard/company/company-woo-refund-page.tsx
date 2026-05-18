import { RootState } from "@/app/store";
import WooRefundPage from "@/components/feature-specific/woo-refund/woo-refund-page";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CompanyWooRefundPage() {
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const company = useSelector((state: RootState) =>
    isModerator ? state.user.company : state.company.company
  );

  if (!company) {
    return <div className="p-4">No company selected</div>;
  }

  return (
    <WooRefundPage
      scope="company"
      companyId={company.ID}
      backLabel={isModerator ? "Menu" : "Control panel"}
      title="Web order refund"
    />
  );
}
