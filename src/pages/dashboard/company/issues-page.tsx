import AppBarBackButton from "@/components/common/app-bar-back-button";
import { DataTable } from "@/components/ui/data-table";
import { IssueResponse } from "@/models/responses/issue-response.model";
import { getIssues } from "@/services/issue-service";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<IssueResponse>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "full_name", header: "Full Name" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "comment", header: "Comment" },
  {
    accessorKey: "issue_ticket_uploads",
    header: "Uploads",
    cell: ({ row }) => {
      const uploads = row.original.issue_ticket_uploads;
      if (!uploads || uploads.length === 0) return <span>-</span>;
      return (
        <div className="flex flex-wrap gap-2">
          {uploads.map((upload) => (
            <a
              key={upload.id}
              href={upload.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              File #{upload.id}
            </a>
          ))}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export default function IssuesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["issues"],
    queryFn: getIssues,
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <AppBarBackButton destination="Menu" />
        <h1 className="text-2xl font-bold">Company Issues</h1>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Failed to load issues.</div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchColumn="full_name"
        />
      )}
    </div>
  );
}
