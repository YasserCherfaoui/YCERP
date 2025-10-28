import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ImportAffiliateOrdersCsvResult, importAffiliateOrdersCsv } from "@/services/affiliate-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileWarning, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AffiliateImportOrdersCSVDialog({ open, setOpen }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportAffiliateOrdersCsvResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: importCsv, isPending } = useMutation({
    mutationFn: async (f: File) => {
      const res = await importAffiliateOrdersCsv(f);
      if (res.status === "success" && res.data) return res.data;
      throw new Error(res.error?.description || res.message || "Import failed");
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "CSV processed", description: `${data.orders_created} orders created, ${data.skipped} skipped.` });
      queryClient.invalidateQueries({ queryKey: ["affiliate-orders"] });
    },
    onError: (err: any) => {
      toast({ title: "Import failed", description: err?.message || String(err), variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = () => {
    if (file) importCsv(file);
  };

  const close = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setFile(null);
      setResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Orders via CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Upload a CSV file with the following 6 columns in order:</p>
          <ol className="list-decimal list-inside text-sm text-muted-foreground">
            <li>Full Name</li>
            <li>Address</li>
            <li>Product Name</li>
            <li>Phone Number</li>
            <li>Price (integer)</li>
            <li>Customer Email</li>
          </ol>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={isPending}>
              <Upload className="h-4 w-4 mr-2" /> {file ? file.name : "Choose CSV File"}
            </Button>
            <Button onClick={handleImport} disabled={!file || isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Import
            </Button>
          </div>

          {result && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <div>Orders created: <b>{result.orders_created}</b></div>
                  <div>Items created: <b>{result.items_created}</b></div>
                  <div>Skipped rows: <b>{result.skipped}</b></div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result?.skipped_rows?.length ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium"><FileWarning className="h-4 w-4 text-amber-500" /> Skipped rows</div>
              <ScrollArea className="h-40 border rounded-md p-2">
                <ul className="space-y-2 text-sm">
                  {result.skipped_rows.map((sr, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      <span className="text-destructive font-medium">{sr.error}:</span> <span className="break-all">{sr.row}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)} disabled={isPending}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


