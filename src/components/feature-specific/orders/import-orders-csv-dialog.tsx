import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, useToast } from "@/hooks/use-toast";
import { createOrdersFromCSV } from "@/services/woocommerce-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";

interface ImportOrdersCSVDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function ImportOrdersCSVDialog({ open, setOpen }: ImportOrdersCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useToast();
  const queryClient = useQueryClient();
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) {
    return null;
  }
  const company_id = company.ID;
  const { mutate: importCSV, isPending } = useMutation({
    mutationFn: (file: File) => createOrdersFromCSV(file, company_id),
    onSuccess: () => {
      toast({
        title: "Orders Imported",
        description: "Orders have been created from the CSV file.",
      });
      setOpen(false);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error importing orders",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      importCSV(file);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setOpen(open);
    if (!open) setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Orders from CSV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={isPending}
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            {file ? file.name : "Choose CSV File"}
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isPending}
            variant="default"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 