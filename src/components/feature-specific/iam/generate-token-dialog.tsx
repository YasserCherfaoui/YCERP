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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models/data/user.model";
import { generateUserToken } from "@/services/user-service";
import { useMutation } from "@tanstack/react-query";
import { Copy, Key } from "lucide-react";
import { useState } from "react";

interface Props {
  user: User;
}

export default function GenerateTokenDialog({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { mutate: generateTokenMutation, isPending } = useMutation({
    mutationFn: generateUserToken,
    onSuccess: (data) => {
      setGeneratedToken(data.data.token);
      toast({
        title: "Success",
        description: "Token generated successfully",
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

  const handleGenerate = () => {
    generateTokenMutation(user.ID);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset token when dialog closes
      setGeneratedToken(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
        >
          <Key className="mr-2 h-4 w-4" />
          Generate Auth Token
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Auth Token</DialogTitle>
          <DialogDescription>
            Generate an authentication token for{" "}
            <span className="font-semibold">{user.full_name}</span> ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!generatedToken ? (
            <div className="text-sm text-muted-foreground">
              Click the button below to generate a new authentication token for this user.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Generated Token</label>
              <div className="flex gap-2">
                <Input
                  value={generatedToken}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToken}
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
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            {generatedToken ? "Close" : "Cancel"}
          </Button>
          {!generatedToken && (
            <Button
              disabled={isPending}
              onClick={handleGenerate}
            >
              {isPending ? "Generating..." : "Generate Token"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}








