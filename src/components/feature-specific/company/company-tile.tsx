import { Company } from "@/models/data/company.model";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  company: Company;
}

export default function CompanyTile({ company }: Props) {
  return (
    <div className="flex w-full max-w-2xl min-w-0 items-start gap-3 sm:items-center sm:gap-4">
      <div
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-muted text-2xl font-semibold tabular-nums text-muted-foreground sm:size-16 sm:text-3xl"
      >
        {company.company_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            {company.company_name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            asChild
            aria-label="Company settings"
          >
            <Link to={`/company/${company.ID}/settings`}>
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <p className="break-words text-sm text-muted-foreground">{company.address}</p>
      </div>
    </div>
  );
}
