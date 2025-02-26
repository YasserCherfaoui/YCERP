import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { getMyCompanyFranchises } from "@/services/franchise-service";
import { useQuery } from "@tanstack/react-query";
import { CircleUserRound, Inspect, MapPin } from "lucide-react";
import { useSelector } from "react-redux";
import MakeBillDialog from "./make-bill-dialog";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const { data } = useQuery({
    enabled: !!company,
    queryKey: ["franchises"],
    queryFn: () => getMyCompanyFranchises(company?.ID ?? 0),
  });

  return (
    <div className="flex gap-2 p-4">
      {data?.data?.map((franchise, index) => (
        <Card key={index} className="p-4 flex flex-col gap-2">
          <CardTitle className="text-xl">{franchise.name}</CardTitle>
          <CardContent className="p-0">
            <div className="flex flex-col">
              <span className="flex gap-2 font-bold">
                <CircleUserRound />
                Administrator
              </span>
              {franchise.franchise_administrators[0].full_name}
            </div>
            <div className="flex flex-col">
              <span className="flex gap-2 font-bold">
                <MapPin />
                Address
              </span>
              {franchise.city}, {franchise.state}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-0 gap-2">
           <MakeBillDialog franchise={franchise} />
            <Button>
              <Inspect />
              Consult
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
