import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Company } from "@/models/data/company.model";
import { LayoutPanelLeft, Store, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  company: Company;
  index: number;
}

export default function ({ company, index }: Props) {
  const navigate = useNavigate();
  return (
    <Card key={index} className="flex flex-col justify-between w-fit p-3 gap-2">
      <CardTitle className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{company.company_name.charAt(0)}</AvatarFallback>
        </Avatar>
        {company.company_name}
      </CardTitle>
      <CardDescription className="w-64">{company.address}</CardDescription>
      <CardContent className="flex flex-col gap-2 items-start pl-0">
        <div className="text-l flex gap-1">
          <Store />
          Franchises: <span className="text-sm">{}</span>
          {company.franchises?.length ?? 0}
        </div>
        <div className="text-l flex gap-1">
          <User />
          Administrators: <span className="text-sm">{}</span>
          {company.administrators?.length ?? 0}
        </div>
      </CardContent>
      <CardFooter className="flex p-1 justify-end">
        <Button onClick={() => navigate(`/company/${company.ID}`)}>
          <LayoutPanelLeft />
          Access Control Panel
        </Button>
      </CardFooter>
    </Card>
  );
}
