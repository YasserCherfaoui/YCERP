import IssuesAppBar from "@/components/feature-specific/company/issues/issues-app-bar";
import IssuesBody from "@/components/feature-specific/company/issues/issues-body";

export default function IssuesPage() {
  return (
    <div className="p-6">
      <IssuesAppBar />
      <IssuesBody />
    </div>
  );
}
