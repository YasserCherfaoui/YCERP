import AppBarBackButton from "@/components/common/app-bar-back-button";

export default function IssuesAppBar() {
  return (
    <div className="flex items-center gap-4 mb-4">
      <AppBarBackButton destination="Menu" />
      <h1 className="text-2xl font-bold">Company Issues</h1>
    </div>
  );
} 