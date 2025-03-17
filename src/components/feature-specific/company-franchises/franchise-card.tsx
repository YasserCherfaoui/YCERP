import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Franchise } from "@/models/data/franchise.model";
import { deleteFranchise } from "@/services/franchise-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, Inspect, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MakeBillDialog from "./make-bill-dialog";

interface Props {
  franchise: Franchise;
}

export default function ({ franchise }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: deleteFranchiseMutation, isPending } = useMutation({
    mutationFn: deleteFranchise,
    onSuccess: () => {
      toast({
        title: "Franchise Deleted",
        description: "Franchise was deleted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["franchises"],
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error deleting franchise",
        description: "Something went wrong",
        variant: "destructive",
      });
      setOpen(false);
    },
  });
  return (
    <Card className="p-4 flex flex-col gap-2">
      <CardTitle className="text-xl flex justify-between items-center">
        {franchise.name}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={"ghost"} className="text-red-500">
              <Trash2 />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Franchise?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this franchise? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                disabled={isPending}
                variant={"destructive"}
                onClick={() => deleteFranchiseMutation(franchise.ID)}
              >
                Delete
              </Button>
              <Button variant={"outline"} onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardTitle>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <span className="flex gap-2 font-bold">
            <CircleUserRound />
            Administrator
          </span>
          {franchise.franchise_administrators[0].full_name}
        </div>
        <div className="flex flex-col">
          <span className="flex gap-2 font-bold">
            <MapPin />
            Address
          </span>
          {franchise.city}, {franchise.state}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-0 gap-2">
        <MakeBillDialog franchise={franchise} />
        <Button onClick={()=> navigate(franchise.ID.toString())}>
          <Inspect />
          Consult
        </Button>
      </CardFooter>
    </Card>
  );
}
