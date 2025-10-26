import useAffiliate from "@/hooks/use-affiliate";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AffiliatePublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useAffiliate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive text-center mt-8">{error}</div>;
  }

return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default AffiliatePublicRoute; 