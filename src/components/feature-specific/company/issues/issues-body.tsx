import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueResponse } from "@/models/responses/issue-response.model";
import { getIssues } from "@/services/issue-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import IssuesReplyDialog from "./issues-reply-dialog";
import IssuesTable from "./issues-table";

export default function IssuesBody() {
  // Support both company and moderator routes
  const companyFromCompanyState = useSelector((state: RootState) => state.company.company);
  const companyFromUserState = useSelector((state: RootState) => state.user.company);
  const company = companyFromCompanyState || companyFromUserState;
  
  const { data } = useQuery({
    queryKey: ["issues", company?.ID],
    queryFn: () => getIssues(company?.ID),
    enabled: !!company,
  });
  const [tab, setTab] = useState("unsolved");
  // Dialog state placeholders
  const [replyIssue, setReplyIssue] = useState<IssueResponse | null>(null);

  // Split issues by solved/unsolved
  const issues = data?.data || [];
  const unsolved = issues.filter((issue) => !issue.support_replies || issue.support_replies.length === 0);
  const solved = issues.filter((issue) => issue.support_replies && issue.support_replies.length > 0);

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="unsolved">Unsolved Issues</TabsTrigger>
        <TabsTrigger value="solved">Solved Issues</TabsTrigger>
      </TabsList>
      <TabsContent value="unsolved">
        <IssuesTable
          issues={unsolved}
          actions={(issue) => (
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => setReplyIssue(issue)} title="Reply">
                <FiMessageCircle className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => {/* TODO: handle delete */}} title="Delete">
                <FiTrash2 className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          )}
        />
        <IssuesReplyDialog
          open={!!replyIssue}
          onClose={() => setReplyIssue(null)}
          issue={replyIssue}
          onSubmit={() => setReplyIssue(null)} // TODO: implement API call
        />
      </TabsContent>
      <TabsContent value="solved">
        <IssuesTable
          issues={solved}
          actions={() => (
            <Button size="icon" variant="ghost" onClick={() => {/* TODO: handle delete */}} title="Delete">
              <FiTrash2 className="w-5 h-5 text-red-500" />
            </Button>
          )}
        />
      </TabsContent>
    </Tabs>
  );
} 