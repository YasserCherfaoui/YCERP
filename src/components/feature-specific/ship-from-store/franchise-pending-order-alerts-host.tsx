import FranchisePendingOrderAlertDialog from "@/components/feature-specific/ship-from-store/franchise-pending-order-alert-dialog";
import { useFranchisePendingOrderAlerts } from "@/hooks/use-franchise-pending-order-alerts";
import { RootState } from "@/app/store";
import { useSelector } from "react-redux";

/**
 * App-wide host for franchise ship-from-store pending order alerts.
 * Mount under FranchisePrivateRoute so it runs on every franchise portal page.
 * Only active when the company admin enabled require_order_alert for this franchise.
 */
export default function FranchisePendingOrderAlertsHost() {
  const franchise = useSelector(
    (state: RootState) => state.franchise.franchise
  );
  const enabled = !!franchise?.require_order_alert;
  const { current, queueLength, dismissOrder } =
    useFranchisePendingOrderAlerts(enabled ? franchise?.ID : undefined);

  if (!enabled) {
    return null;
  }

  return (
    <FranchisePendingOrderAlertDialog
      order={current}
      remainingCount={queueLength}
      onAcknowledged={dismissOrder}
    />
  );
}
