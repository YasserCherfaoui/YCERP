import { RootState } from "@/app/store";
import WooRefundPage from "@/components/feature-specific/woo-refund/woo-refund-page";
import { useSelector } from "react-redux";

export default function FranchiseWooRefundPage() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return null;

  return (
    <WooRefundPage
      scope="franchise"
      defaultFranchiseId={franchise.ID}
      backLabel="Menu"
      title="Web order refund"
    />
  );
}
