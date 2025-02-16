import useAuth from "@/hooks/use-auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";


export default function () {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/dashboard" state={{ from: location }} replace /> : <Outlet />

}