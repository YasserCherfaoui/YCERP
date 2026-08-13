import { Company } from "@/models/data/company.model";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  company: Company;
}

export default function ({ company }: Props) {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gray-500 text-center text-3xl text-white sm:h-20 sm:w-20 sm:text-5xl">
        {company.company_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-lg sm:text-xl">{company.company_name}</span>
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
