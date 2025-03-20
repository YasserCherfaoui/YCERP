import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Return } from "@/models/data/return.model";
import { removeCompanyUnknownReturn } from "@/services/return-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  returnModel: Return;
}

export default function ({ returnModel }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: removeReturn, isPending } = useMutation({
    mutationFn: () => removeCompanyUnknownReturn(returnModel.ID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company-unknown-returns"],
      });
      toast({
        title: "Return removed",
        description: "Return removed successfully",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="text-red-600"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Return
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Return</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove return #{returnModel.ID}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            onClick={() => removeReturn()}
            disabled={isPending}
          >
            Remove Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
