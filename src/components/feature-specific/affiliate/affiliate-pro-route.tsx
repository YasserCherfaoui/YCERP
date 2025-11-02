import useAffiliate from "@/hooks/use-affiliate";
import { Navigate } from "react-router-dom";

interface AffiliateProRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that only allows Pro affiliates to access the wrapped content
 * Non-Pro affiliates are redirected to the dashboard
 */
export function AffiliateProRoute({ children }: AffiliateProRouteProps) {
  const { affiliate } = useAffiliate();

  if (!affiliate?.is_pro) {
    // Redirect non-Pro affiliates to dashboard
    return <Navigate to="/affiliate" replace />;
  }

  return <>{children}</>;
}

