import { getIssues } from "@/services/issue-service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";



export default function IssuesIcon() {
    const {data: issues} = useQuery({
        queryKey: ["issues"],
        queryFn: () => getIssues(),
    }); 
  return <div className="flex items-center justify-center relative">
    <AlertCircle size={48} />
    <div className="rounded-full bg-red-500 text-white p-2 w-6 h-6 flex items-center justify-center text-sm font-bold absolute -top-2 -right-2">{issues?.data?.filter((issue) => !issue.support_replies.length).length}</div>
  </div>;
}
