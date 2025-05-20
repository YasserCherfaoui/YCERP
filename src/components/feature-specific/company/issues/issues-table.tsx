import { DataTable } from "@/components/ui/data-table";
import { IssueResponse } from "@/models/responses/issue-response.model";
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

interface IssuesTableProps {
  issues: IssueResponse[];
  actions: (issue: IssueResponse) => ReactNode;
  searchColumn?: string;
}

export default function IssuesTable({ issues, actions, searchColumn = "phone_number" }: IssuesTableProps) {
  const columns: ColumnDef<IssueResponse>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Full Name" },
    { accessorKey: "phone", header: "Phone", id: "phone_number" },
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => actions(row.original),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={issues}
      searchColumn={searchColumn}
    />
  );
} 