import useAuth from "@/hooks/use-auth";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  console.log(user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;
