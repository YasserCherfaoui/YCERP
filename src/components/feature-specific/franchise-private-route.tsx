import useFranchise from "@/hooks/use-franchise";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function () {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useFranchise();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/myFranchise/login" state={{ from: location }} replace />
  );
}
