import { RootState } from "@/app/store";
import BrokenItemsTransfersPageBody from "@/components/feature-specific/broken-items/broken-items-transfers-page-body";
import { useSelector } from "react-redux";

export default function CompanyBrokenItemsTransfersPage() {
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return null;

  return <BrokenItemsTransfersPageBody companyId={company.ID} />;
}
