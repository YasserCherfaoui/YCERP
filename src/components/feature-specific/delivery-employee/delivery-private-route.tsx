
import useDelivery from "@/hooks/use-delivery";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const DeliveryPrivateRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, deliveryEmployee } = useDelivery();
  console.log(deliveryEmployee);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/delivery/login" state={{ from: location }} replace />
  );
};

export default DeliveryPrivateRoute;
