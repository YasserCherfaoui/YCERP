import useSuperFranchise from "@/hooks/use-super-franchise";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function () {
  const location = useLocation();
  const {franchiseID} = useParams();
  const { isAuthenticated, isLoading, user } = useSuperFranchise(Number(franchiseID));
  console.log(user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
