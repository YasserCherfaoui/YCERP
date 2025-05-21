import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SupportReply } from "@/models/data/issue.model";
import { IssueResponse, OrderTicketResponse } from "@/models/responses/issue-response.model";
import { issueReplySchema, IssueReplySchema } from "@/schemas/issue";
import { createIssueReply } from "@/services/issue-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface IssuesReplyDialogProps {
  open: boolean;
  onClose: () => void;
  issue?: IssueResponse | null;
  orderTicket?: OrderTicketResponse | null;
  onSubmit: (data: Omit<SupportReply, "ID" | "CreatedAt" | "UpdatedAt" | "DeletedAt">) => void;
}

export default function IssuesReplyDialog({ open, onClose, issue, orderTicket }: IssuesReplyDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IssueReplySchema>({
    resolver: zodResolver(issueReplySchema),
    defaultValues: {
      reply: "",
      issue_ticket_id: issue?.id ?? null,
      order_ticket_id: orderTicket?.id ?? null,
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: createIssueReplyMutation } = useMutation({
    mutationFn: createIssueReply,
    onSuccess: () => {
      toast({
        title: "Issue reply created",
        description: "Issue reply created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["order-tickets"] });
      onClose();
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const handleDialogClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to Issue</DialogTitle>
        </DialogHeader>
        {issue && (
          <div className="mb-4 text-sm text-muted-foreground">
            <div><b>ID:</b> {issue.id}</div>
            <div><b>Name:</b> {issue.full_name}</div>
            <div><b>Phone:</b> {issue.phone}</div>
            <div><b>Comment:</b> {issue.comment}</div>
            <div><b>Uploads:</b> {issue.issue_ticket_uploads.map((upload) => <a key={upload.id} href={upload.signed_url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">File #{upload.id}</a>)}</div>
          </div>
        )}
        {orderTicket && (
          <div className="mb-4 text-sm text-muted-foreground">
            <div><b>ID:</b> {orderTicket.id}</div>
            <div><b>Name:</b> {orderTicket.full_name}</div>
            <div><b>Phone:</b> {orderTicket.phone}</div>
            <div><b>Comment:</b> {orderTicket.comment}</div>
            <div><b>Uploads:</b> {orderTicket.order_ticket_uploads.map((upload) => <a key={upload.id} href={upload.signed_url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">File #{upload.id}</a>)}</div>
          </div>
        )}
        <form
          onSubmit={handleSubmit((data) => {
            createIssueReplyMutation({
              ...data,
              issue_ticket_id: issue?.id ?? null,
              order_ticket_id: orderTicket?.id ?? null,
            });
            handleDialogClose();
          }, console.error)}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Reply</label>
            <Textarea
              {...register("reply")}
              className="w-full min-h-[80px] border rounded p-2"
              placeholder="Type your reply..."
            />
            {errors.reply && <p className="text-red-500 text-xs mt-1">{errors.reply.message}</p>}
          </div>
          {errors.issue_ticket_id && <p className="text-red-500 text-xs mt-1">{errors.issue_ticket_id.message}</p>}
          {errors.order_ticket_id && <p className="text-red-500 text-xs mt-1">{errors.order_ticket_id.message}</p>}
          {errors.root && <p className="text-red-500 text-xs mt-1">{errors.root.message}</p>}
          <DialogFooter>
            <Button type="submit">Send Reply</Button>
            <Button type="button" variant="ghost" onClick={handleDialogClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 