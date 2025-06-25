import useAffiliate from "@/hooks/use-affiliate";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AffiliatePrivateRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAffiliate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive text-center mt-8">{error}</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/affiliate/login" state={{ from: location }} replace />
  );
};

export default AffiliatePrivateRoute; 