import useUser from "@/hooks/use-user";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useUser();
  console.log(user);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current location in sessionStorage before redirecting
      console.log('Storing redirect path:', location.pathname);
      sessionStorage.setItem('moderatorRedirectPath', location.pathname);
      console.log('Redirecting to login...');
      navigate('/moderator/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoute;
