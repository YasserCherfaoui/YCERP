
import useModFranchise from "@/hooks/use-mod-franchise";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function () {
  const location = useLocation();
  const {franchiseID} = useParams();
  const { isAuthenticated, isLoading, user } = useModFranchise(Number(franchiseID));
  console.log(user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/moderator/franchises" state={{ from: location }} replace />
  );
}
