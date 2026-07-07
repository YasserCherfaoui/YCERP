import { RootState } from "@/app/store";
import BrokenItemsDeclarationsPageBody from "@/components/feature-specific/broken-items/broken-items-declarations-page-body";
import { useSelector } from "react-redux";

export default function ModeratorBrokenItemsDeclarationsPage() {
  const company = useSelector((state: RootState) => state.user.company);

  if (!company) return null;

  return <BrokenItemsDeclarationsPageBody companyId={company.ID} />;
}
