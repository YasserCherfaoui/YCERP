import { baseUrl } from "@/app/constants";
import { useAppDispatch } from "@/app/hooks";
import { setCompany } from "@/features/company/company-slice";
import { Company } from "@/models/data/company.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";

export default function () {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return <Outlet />;
}
