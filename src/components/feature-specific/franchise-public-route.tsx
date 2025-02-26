import useFranchise from "@/hooks/use-franchise";
import { Navigate, Outlet, useLocation } from "react-router-dom";


export default function () {
    const { isLoading, isAuthenticated } = useFranchise();
    const location = useLocation();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/myFranchise" state={{ from: location }} replace /> : <Outlet />

}