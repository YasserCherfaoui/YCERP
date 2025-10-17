import { RootState } from "@/app/store";
import { getIssues } from "@/services/issue-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";

export default function IssuesIcon() {
    const company = useSelector((state: RootState) => state.company.company);
    
    const {data: issues} = useQuery({
        queryKey: ["issues", company?.ID],
        queryFn: () => getIssues(company?.ID),
        enabled: !!company,
    }); 
  return <div className="flex items-center justify-center relative">
    <AlertCircle size={48} />
    <div className="rounded-full bg-red-500 text-white p-2 w-6 h-6 flex items-center justify-center text-sm font-bold absolute -top-2 -right-2">{issues?.data?.filter((issue) => !issue.support_replies.length).length}</div>
  </div>;
}
