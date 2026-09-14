import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

const READER_ID = "packing-check-barcode-reader";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
  title?: string;
  description?: string;
}

export default function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
  title = "Scan barcode",
  description = "Point the camera at a QR code or the parcel sticker. HTTPS is required on phones.",
}: BarcodeScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const onScanRef = useRef(onScan);
  const onOpenChangeRef = useRef(onOpenChange);
  onScanRef.current = onScan;
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (!open) {
      return;
    }
    handledRef.current = false;
    setError(null);
    let cancelled = false;

    const start = async () => {
      const scanner = new Html5Qrcode(READER_ID, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.min(viewfinderWidth - 24, 320),
              height: Math.min(viewfinderHeight - 24, 160),
            }),
          },
          (decodedText) => {
            const code = decodedText.trim();
            if (!code || handledRef.current) {
              return;
            }
            handledRef.current = true;
            onScanRef.current(code);
            onOpenChangeRef.current(false);
          },
          () => undefined
        );
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Could not start the camera";
          setError(message);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void start();
    }, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner
          .stop()
          .catch(() => undefined)
          .finally(() => {
            try {
              scanner.clear();
            } catch {
              /* already cleared */
            }
          });
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-3 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          id={READER_ID}
          className="min-h-[240px] overflow-hidden rounded-md bg-black [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />
        {error ? (
          <p className="text-sm text-destructive">
            {error}. Allow camera access and use HTTPS on a phone. You can still
            type or use a USB scanner.
          </p>
        ) : null}
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
