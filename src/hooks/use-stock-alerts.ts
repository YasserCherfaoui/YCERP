import { setActiveAlertsCount, setUnreadCount } from "@/features/alerts/stock-alerts-slice";
import { getActiveAlerts, getUnreadCount } from "@/services/stock-alerts-service";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

interface UseStockAlertsOptions {
  companyId?: number;
  franchiseId?: number;
  enabled?: boolean;
}

export const useStockAlerts = (options: UseStockAlertsOptions = {}) => {
  const dispatch = useDispatch();
  const { companyId, franchiseId, enabled = true } = options;

  // Poll unread count every 30 seconds
  const { data: unreadData } = useQuery({
    queryKey: ["stock-alerts-unread-count"],
    queryFn: async () => {
      const response = await getUnreadCount();
      if (response.data) {
        dispatch(setUnreadCount(response.data.unread_count));
      }
      return response;
    },
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    enabled,
  });

  // Fetch active alerts count
  const { data: activeAlertsData } = useQuery({
    queryKey: ["stock-alerts-active-count", companyId, franchiseId],
    queryFn: async () => {
      const response = await getActiveAlerts({
        company_id: companyId,
        franchise_id: franchiseId,
        limit: 1000, // Get all to count
      });
      if (response.data) {
        dispatch(setActiveAlertsCount(response.data.length));
      }
      return response;
    },
    refetchInterval: 60000, // 60 seconds
    refetchOnWindowFocus: true,
    enabled: enabled && (!!companyId || !!franchiseId),
  });

  return {
    unreadCount: unreadData?.data?.unread_count || 0,
    activeAlertsCount: activeAlertsData?.data?.length || 0,
  };
};

