import { Company } from "@/models/data/company.model";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  company: Company;
}

export default function ({ company }: Props) {
  return (
    <div className="flex gap-4">
      <div className="text-5xl bg-gray-500 w-20 h-20 rounded-3xl  text-center flex justify-center items-center text-white">
        {company.company_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xl">{company.company_name}</span>
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" asChild aria-label="Company settings">
            <Link to={`/company/${company.ID}/settings`}>
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <span className="text-sm">{company.address}</span>
      </div>
    </div>
  );
}
