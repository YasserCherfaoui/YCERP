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
import DeleteCompanyDialog from "./delete-company-dialog";

interface Props {
  company: Company;
  index: number;
}

export default function ({ company, index }: Props) {
  const navigate = useNavigate();
  return (
    <Card className="flex w-full flex-col justify-between gap-2 p-3">
      <CardTitle className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="shrink-0">
            <AvatarFallback>{company.company_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{company.company_name}</span>
        </div>
        <DeleteCompanyDialog company={company} />
      </CardTitle>
      <CardDescription className="w-full">{company.address}</CardDescription>
      <CardContent className="flex flex-col items-start gap-2 pl-0">
        <div className="text-l flex gap-1">
          <Store className="h-5 w-5 shrink-0" />
          Franchises: <span className="text-sm">{}</span>
          {company.franchises?.length ?? 0}
        </div>
        <div className="text-l flex gap-1">
          <User className="h-5 w-5 shrink-0" />
          Administrators: <span className="text-sm">{}</span>
          {company.administrators?.length ?? 0}
        </div>
      </CardContent>
      <CardFooter className="flex p-1 sm:justify-end">
        <Button className="w-full sm:w-auto" onClick={() => navigate(`/company/${company.ID}`)}>
          <LayoutPanelLeft />
          Access Control Panel
        </Button>
      </CardFooter>
    </Card>
  );
}
