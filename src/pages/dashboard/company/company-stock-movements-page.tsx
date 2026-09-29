import { RootState } from "@/app/store";
import StockMovementsPageBody from "@/components/feature-specific/stock-movements/stock-movements-page-body";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function CompanyStockMovementsPage() {
  const companyFromAdmin = useSelector((state: RootState) => state.company.company);
  const companyFromUser = useSelector((state: RootState) => state.user.company);
  const { pathname } = useLocation();
  const company = pathname.includes("moderator") ? companyFromUser : companyFromAdmin;

  if (!company) return null;

  return <StockMovementsPageBody companyId={company.ID} companyName={company.company_name} />;
}
