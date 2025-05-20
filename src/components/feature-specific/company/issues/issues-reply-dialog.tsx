import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SupportReply } from "@/models/data/issue.model";
import { IssueResponse, OrderTicketResponse } from "@/models/responses/issue-response.model";
import { createIssueReply } from "@/services/issue-service";
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
  const { register, handleSubmit, reset } = useForm<{ reply: string,issue_ticket_id: number, order_ticket_id: number }>({ defaultValues: { reply: "", issue_ticket_id : issue?.id ?? 0, order_ticket_id: orderTicket?.id ?? 0 } });
  const queryClient = useQueryClient();
  const {toast} = useToast();
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
            <div><b>Uploads:</b> {issue.issue_ticket_uploads.map((upload) => <a href={upload.signed_url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">File #{upload.id}</a>)}</div>
          </div>
        )}
        {orderTicket && (
          <div className="mb-4 text-sm text-muted-foreground">
            <div><b>ID:</b> {orderTicket.id}</div>
            <div><b>Name:</b> {orderTicket.full_name}</div>
            <div><b>Phone:</b> {orderTicket.phone}</div>
            <div><b>Comment:</b> {orderTicket.comment}</div>
            <div><b>Uploads:</b> {orderTicket.order_ticket_uploads.map((upload) => <a href={upload.signed_url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">File #{upload.id}</a>)}</div>
          </div>
        )}
        <form
          onSubmit={handleSubmit((data) => {
            createIssueReplyMutation({ ...data, issue_ticket_id: issue?.id ?? 0, order_ticket_id: orderTicket?.id ?? 0 });
            handleDialogClose();
          })}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium">Reply</label>
            <Textarea
              {...register("reply", { required: true })}
              className="w-full min-h-[80px] border rounded p-2"
              placeholder="Type your reply..."
            />
          </div>
          <DialogFooter>
            <Button type="submit">Send Reply</Button>
            <Button type="button" variant="ghost" onClick={handleDialogClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 