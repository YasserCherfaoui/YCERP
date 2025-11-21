import { baseUrl } from "@/app/constants";
import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { setCompany } from "@/features/company/company-slice";
import { Company } from "@/models/data/company.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { useEffect, useState } from "react";
import { Outlet, useParams, useLocation, Navigate } from "react-router";
import { useSelector } from "react-redux";

export default function () {
  const params = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    setLoading(true);
    const fetchCompany = async () => {
      const response = await fetch(
        `${baseUrl}/companies/me/${params.companyID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data: APIResponse<Company> = await response.json();

      if (data.data) {
        console.log(data.data);
        dispatch(setCompany(data.data));
      }
      if (data.error) {
        setError(data.error.description);
      }
      setLoading(false);
    };
    fetchCompany();
  }, [params.companyId]);
  
  // Check if user is orders_manager and restrict access to only orders page
  if (user && user.role === "orders_manager") {
    const currentPath = location.pathname;
    const ordersPath = `/company/${params.companyID}/orders`;
    // If trying to access anything other than orders page, redirect to orders
    if (currentPath !== ordersPath && !currentPath.startsWith(ordersPath + "/")) {
      return <Navigate to={ordersPath} replace />;
    }
  }
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return <Outlet />;
}
