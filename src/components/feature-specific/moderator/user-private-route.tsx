import useUser from "@/hooks/use-user";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useUser();
  console.log(user);

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // Store the current location in sessionStorage before redirecting
        console.log('Storing redirect path:', location.pathname);
        sessionStorage.setItem('moderatorRedirectPath', location.pathname);
        console.log('Redirecting to login...');
        navigate('/moderator/login', { replace: true });
        return;
      }

      // If user is orders_manager, redirect to orders page if not already there
      if (user && user.role === 'orders_manager') {
        const ordersPath = '/moderator/orders';
        const currentPath = location.pathname;
        
        // Only redirect if not already on the orders page
        if (currentPath !== ordersPath && !currentPath.startsWith(ordersPath + '/')) {
          navigate(ordersPath, { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoute;
