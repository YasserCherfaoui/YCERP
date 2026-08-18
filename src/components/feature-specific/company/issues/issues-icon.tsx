import { RootState } from "@/app/store";
import { getIssues } from "@/services/issue-service";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";

export default function IssuesIcon({ className }: { className?: string }) {
  const company = useSelector((state: RootState) => state.company.company);

  const { data: issues } = useQuery({
    queryKey: ["issues", company?.ID],
    queryFn: () => getIssues(company?.ID),
    enabled: !!company,
  });

  const openCount =
    issues?.data?.filter((issue) => !issue.support_replies.length).length ?? 0;

  return (
    <div className="relative flex items-center justify-center">
      <AlertCircle className={cn("h-8 w-8 sm:h-12 sm:w-12", className)} aria-hidden />
      {openCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {openCount > 99 ? "99+" : openCount}
        </span>
      ) : null}
    </div>
  );
}
