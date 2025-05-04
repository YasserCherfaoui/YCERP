import useUser from "@/hooks/use-user";
import { Navigate, Outlet, useLocation } from "react-router-dom";


export default function () {
    const { isLoading, isAuthenticated } = useUser();
    const location = useLocation();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/moderator/menu" state={{ from: location }} replace /> : <Outlet />

}