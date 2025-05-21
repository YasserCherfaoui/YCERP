import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderTicketResponse } from "@/models/responses/issue-response.model";
import { createIssueReply, getOrderTickets } from "@/services/issue-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FiMessageCircle, FiTrash2 } from "react-icons/fi";
import IssuesReplyDialog from "../issues/issues-reply-dialog";

export default function OrderTicketsBody() {
  const { data } = useQuery({
    queryKey: ["order-tickets"],
    queryFn: getOrderTickets,
  });
  const [tab, setTab] = useState("unsolved");
  const [replyTicket, setReplyTicket] = useState<OrderTicketResponse | null>(null);
  const queryClient = useQueryClient();

  // Split tickets by solved/unsolved
  const tickets = data?.data || [];
  const unsolved = tickets.filter((ticket) => !ticket.support_replies || ticket.support_replies.length === 0);
  const solved = tickets.filter((ticket) => ticket.support_replies && ticket.support_replies.length > 0);

  // Table columns
  const columns: ColumnDef<OrderTicketResponse>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Full Name" },
    { accessorKey: "phone", header: "Phone", id: "phone_number" },
    { accessorKey: "comment", header: "Comment" },
    {
      accessorKey: "order_ticket_uploads",
      header: "Uploads",
      cell: ({ row }) => {
        const uploads = row.original.order_ticket_uploads;
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          {tab === "unsolved" && (
            <Button size="icon" variant="ghost" onClick={() => setReplyTicket(row.original)} title="Reply">
              <FiMessageCircle className="w-5 h-5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => {/* TODO: handle delete */}} title="Delete">
            <FiTrash2 className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Reply dialog logic
  const { mutate: createReply } = useMutation({
    mutationFn: createIssueReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-tickets"] });
      setReplyTicket(null);
    },
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="unsolved">Unsolved Tickets</TabsTrigger>
        <TabsTrigger value="solved">Solved Tickets</TabsTrigger>
      </TabsList>
      <TabsContent value="unsolved">
        <DataTable
          columns={columns}
          data={unsolved}
          searchColumn="phone_number"
        />
        <IssuesReplyDialog
          open={!!replyTicket}
          onClose={() => setReplyTicket(null)}
          orderTicket={replyTicket}
          onSubmit={(data) => createReply({ order_ticket_id: replyTicket?.id ?? null, issue_ticket_id: null, reply: data.reply })}
        />
      </TabsContent>
      <TabsContent value="solved">
        <DataTable
          columns={columns}
          data={solved}
          searchColumn="phone_number"
        />
      </TabsContent>
    </Tabs>
  );
} 