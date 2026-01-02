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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Franchise } from "@/models/data/franchise.model";
import { deleteFranchise, getFranchiseAdministratorToken } from "@/services/franchise-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, Copy, Inspect, Key, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FranchiseInsights from "./franchise-insights";
import MakeBillDialog from "./make-bill-dialog";

interface Props {
  franchise: Franchise;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export default function ({ franchise, dateRange }: Props) {
  const [open, setOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  // Check if user is admin (not moderator)
  const isModerator = pathname.includes("moderator");
  const isAdmin = !isModerator;
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

  const { mutate: getTokenMutation, isPending: isTokenLoading } = useMutation({
    mutationFn: getFranchiseAdministratorToken,
    onSuccess: (data) => {
      setGeneratedToken(data.data.token);
      toast({
        title: "Success",
        description: "Token retrieved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      toast({
        title: "Copied",
        description: "Token copied to clipboard",
      });
    }
  };

  const handleGetToken = () => {
    getTokenMutation(franchise.ID);
  };

  const handleTokenDialogOpenChange = (newOpen: boolean) => {
    setTokenDialogOpen(newOpen);
    if (!newOpen) {
      // Reset token when dialog closes
      setGeneratedToken(null);
    }
  };
  return (
    <Card className="p-4 flex flex-col gap-2">
      <CardTitle className="text-lg sm:text-xl flex justify-between items-center gap-2">
        <span className="truncate flex-1">{franchise.name}</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={"ghost"} className="text-red-500 flex-shrink-0">
              <Trash2 className="h-4 w-4" />
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
        
        {/* Admin-only insights */}
        {isAdmin && dateRange && dateRange.from && dateRange.to && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Insights</h4>
            <FranchiseInsights 
              franchiseId={franchise.ID} 
              dateRange={dateRange}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end p-0 gap-2">
        {isAdmin && (
          <Dialog open={tokenDialogOpen} onOpenChange={handleTokenDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Key className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Get Token</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Franchise Administrator Token</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Get the JWT token for the administrator of{" "}
                  <span className="font-semibold">{franchise.name}</span>
                  {franchise.franchise_administrators?.[0] && (
                    <> ({franchise.franchise_administrators[0].full_name})</>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!generatedToken ? (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Click the button below to retrieve the authentication token for this franchise administrator.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">JWT Token</label>
                    <div className="flex gap-2">
                      <Input
                        value={generatedToken}
                        readOnly
                        className="font-mono text-xs flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopyToken}
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Token expires in 30 days. Copy and save this token securely.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => handleTokenDialogOpenChange(false)} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {generatedToken ? "Close" : "Cancel"}
                </Button>
                {!generatedToken && (
                  <Button
                    disabled={isTokenLoading}
                    onClick={handleGetToken}
                    className="w-full sm:w-auto"
                  >
                    {isTokenLoading ? "Loading..." : "Get Token"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <MakeBillDialog franchise={franchise} />
        <Button 
          onClick={()=> navigate(franchise.ID.toString())}
          size="sm"
          className="flex-shrink-0"
        >
          <Inspect className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Consult</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
