import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import BarcodeScannerDialog from "@/components/feature-specific/packing-check/barcode-scanner-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  PackingCheckProgress,
  PackingExpectedLine,
  PackingLastCheck,
  PackingLookupResponse,
  PackingScanOutcome,
  adjustPackingCheckQuantity,
  completePackingCheck,
  getPackingCheck,
  lookupPackingCheck,
  scanPackingCheck,
  startPackingCheck,
  voidPackingCheckScan,
} from "@/services/woocommerce-service";
import { format } from "date-fns";
import { Camera, Minus, ScanLine, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const SESSION_KEY = "parcel-packing-check";

type ScannerTarget = "tracking" | "variant";

function outcomeLabel(outcome: PackingScanOutcome) {
  switch (outcome) {
    case "unexpected":
      return "Not on this order";
    case "over_quantity":
      return "Too many units";
    case "unknown_qr":
      return "Unknown QR";
    default:
      return outcome;
  }
}

function lastCheckText(last: PackingLastCheck) {
  const when = last.completed_at || last.created_at;
  const formatted = when ? format(new Date(when), "dd MMM yyyy HH:mm") : "";
  return `${last.status} by ${last.user_name || "unknown"}${formatted ? ` · ${formatted}` : ""}`;
}

function lineLabel(line: PackingExpectedLine) {
  return [line.product_name, line.color, line.size]
    .filter((part) => part !== undefined && part !== null && part !== "")
    .join(" · ");
}

export default function PackingCheckPage() {
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  const companyFromStore = useSelector((state: RootState) => state.company.company);
  const userCompany = useSelector((state: RootState) => state.user.company);
  const company = isModerator ? userCompany : companyFromStore;
  const { toast } = useToast();

  const [trackingInput, setTrackingInput] = useState("");
  const [variantInput, setVariantInput] = useState("");
  const [lookup, setLookup] = useState<PackingLookupResponse | null>(null);
  const [progress, setProgress] = useState<PackingCheckProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<ScannerTarget | null>(null);

  const trackingInputRef = useRef(trackingInput);
  const variantInputRef = useRef(variantInput);
  const lookupLockRef = useRef(false);
  const scanLockRef = useRef(false);
  trackingInputRef.current = trackingInput;
  variantInputRef.current = variantInput;

  const applyProgress = useCallback((next: PackingCheckProgress | undefined) => {
    if (!next) {
      return;
    }
    setProgress(next);
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ checkId: next.check.ID, companyId: next.check.company_id })
      );
    } catch {
      /* ignore quota */
    }
  }, []);

  const handleApiError = useCallback(
    (err: unknown, fallback: string) => {
      toast({
        variant: "destructive",
        title: fallback,
        description: err instanceof Error ? err.message : undefined,
      });
    },
    [toast]
  );

  const runLookup = useCallback(
    async (raw: string) => {
      if (!company) {
        return;
      }
      const tracking_number = raw.trim();
      if (!tracking_number || lookupLockRef.current) {
        return;
      }
      lookupLockRef.current = true;
      setBusy(true);
      try {
        const res = await lookupPackingCheck({
          tracking_number,
          company_id: company.ID,
        });
        if (!res.data) {
          throw new Error(res.message || "Order not found");
        }
        setLookup(res.data);
        setProgress(null);
        setTrackingInput(tracking_number);
      } catch (err) {
        setLookup(null);
        handleApiError(err, "Tracking number not found");
      } finally {
        lookupLockRef.current = false;
        setBusy(false);
        setTrackingInput("");
      }
    },
    [company, handleApiError]
  );

  const startCheck = useCallback(async () => {
    if (!company || !lookup) {
      return;
    }
    setBusy(true);
    try {
      const res = await startPackingCheck({
        tracking_number: lookup.order.tracking_number,
        company_id: company.ID,
      });
      applyProgress(res.data);
    } catch (err) {
      handleApiError(err, "Could not start packing check");
    } finally {
      setBusy(false);
    }
  }, [applyProgress, company, handleApiError, lookup]);

  const runVariantScan = useCallback(
    async (raw: string) => {
      if (!company || !progress || progress.check.status !== "in_progress") {
        return;
      }
      const qr_code = raw.trim();
      if (!qr_code || scanLockRef.current) {
        return;
      }
      scanLockRef.current = true;
      setBusy(true);
      setVariantInput("");
      try {
        const res = await scanPackingCheck(progress.check.ID, company.ID, qr_code);
        const next = res.data;
        applyProgress(next);
        const latest = next?.scans?.filter((scan) => !scan.voided_at).slice(-1)[0];
        if (!latest || latest.outcome === "match") {
          toast({
            title: "Match",
            description: latest?.scanned_code || qr_code,
          });
        } else {
          toast({
            variant: "destructive",
            title: outcomeLabel(latest.outcome),
            description: latest.scanned_code,
          });
        }
      } catch (err) {
        handleApiError(err, "Scan failed");
      } finally {
        scanLockRef.current = false;
        setBusy(false);
      }
    },
    [applyProgress, company, handleApiError, progress, toast]
  );

  const resetStation = useCallback(() => {
    setLookup(null);
    setProgress(null);
    setTrackingInput("");
    setVariantInput("");
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!company) {
      return;
    }
    let cancelled = false;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return;
    }
    try {
      const saved = JSON.parse(raw) as { checkId?: number; companyId?: number };
      if (!saved.checkId || saved.companyId !== company.ID) {
        return;
      }
      void getPackingCheck(saved.checkId, company.ID)
        .then((res) => {
          if (cancelled || !res.data) {
            return;
          }
          setProgress(res.data);
          setLookup({
            order: res.data.order,
            lines: res.data.lines,
            last_check: res.data.last_check,
          });
        })
        .catch(() => {
          sessionStorage.removeItem(SESSION_KEY);
        });
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return () => {
      cancelled = true;
    };
  }, [company]);

  useEffect(() => {
    if (progress) {
      return;
    }
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void runLookup(trackingInputRef.current);
      }
    };
    window.addEventListener("keypress", onEnter);
    const timeout = window.setTimeout(() => {
      if (trackingInputRef.current.trim().length > 0) {
        void runLookup(trackingInputRef.current);
      }
    }, 1000);
    return () => {
      window.removeEventListener("keypress", onEnter);
      window.clearTimeout(timeout);
    };
  }, [trackingInput, progress, runLookup]);

  useEffect(() => {
    if (!progress || progress.check.status !== "in_progress") {
      return;
    }
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void runVariantScan(variantInputRef.current);
      }
    };
    window.addEventListener("keypress", onEnter);
    const timeout = window.setTimeout(() => {
      if (variantInputRef.current.trim().length > 0) {
        void runVariantScan(variantInputRef.current);
      }
    }, 1000);
    return () => {
      window.removeEventListener("keypress", onEnter);
      window.clearTimeout(timeout);
    };
  }, [variantInput, progress, runVariantScan]);

  const onCameraScan = useCallback(
    (code: string) => {
      if (scannerTarget === "variant") {
        void runVariantScan(code);
      } else {
        void runLookup(code);
      }
    },
    [runLookup, runVariantScan, scannerTarget]
  );

  if (!company) {
    return <div className="p-4">No company selected</div>;
  }

  const inProgress = progress?.check.status === "in_progress";
  const completed = progress && progress.check.status !== "in_progress";
  const lastCheck = progress?.last_check ?? lookup?.last_check ?? null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4">
        <div className="flex items-center gap-3">
          <AppBarBackButton destination={isModerator ? "Menu" : "Company"} />
          <h1 className="text-xl font-semibold">Packing check</h1>
        </div>

        {!progress ? (
          <>
            <p className="text-sm text-muted-foreground">
              Scan the Yalidine tracking sticker, then scan each product QR.
            </p>
            <div className="flex gap-2">
              <Input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Scan tracking number"
                className="h-14 text-base"
                autoFocus
                disabled={busy}
                inputMode="text"
                autoComplete="off"
              />
              <Button
                type="button"
                className="h-14 w-14 shrink-0"
                variant="outline"
                onClick={() => setScannerTarget("tracking")}
                disabled={busy}
                aria-label="Scan tracking with camera"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </>
        ) : null}

        {lookup && !inProgress ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Order #{lookup.order.number}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {lookup.order.customer_name}
                {lookup.order.customer_phone ? ` · ${lookup.order.customer_phone}` : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastCheck && !completed ? (
                <Alert>
                  <ScanLine className="h-4 w-4" />
                  <AlertTitle>Already checked</AlertTitle>
                  <AlertDescription>{lastCheckText(lastCheck)}</AlertDescription>
                </Alert>
              ) : null}
              <ul className="space-y-2">
                {(progress?.lines ?? lookup.lines).map((line) => (
                  <li
                    key={line.product_variant_id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm font-medium">{lineLabel(line)}</span>
                    <Badge variant="secondary">×{line.expected_qty}</Badge>
                  </li>
                ))}
              </ul>
              {completed ? (
                <CompletedBanner progress={progress!} onNext={resetStation} />
              ) : (
                <Button
                  type="button"
                  className="h-12 w-full text-base"
                  onClick={() => void startCheck()}
                  disabled={busy}
                >
                  {lastCheck ? "Start re-check" : "Start packing check"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}

        {inProgress && progress ? (
          <ScanningStep
            progress={progress}
            variantInput={variantInput}
            setVariantInput={setVariantInput}
            busy={busy}
            lastCheck={lastCheck}
            onOpenCamera={() => setScannerTarget("variant")}
            onAdjust={async (variantId, quantity) => {
              setBusy(true);
              try {
                const res = await adjustPackingCheckQuantity(
                  progress.check.ID,
                  variantId,
                  company.ID,
                  quantity
                );
                applyProgress(res.data);
              } catch (err) {
                handleApiError(err, "Could not update quantity");
              } finally {
                setBusy(false);
              }
            }}
            onVoid={async (scanId) => {
              setBusy(true);
              try {
                const res = await voidPackingCheckScan(
                  progress.check.ID,
                  scanId,
                  company.ID
                );
                applyProgress(res.data);
              } catch (err) {
                handleApiError(err, "Could not remove scan");
              } finally {
                setBusy(false);
              }
            }}
            onComplete={async () => {
              setBusy(true);
              try {
                const res = await completePackingCheck(progress.check.ID, company.ID);
                applyProgress(res.data);
              } catch (err) {
                handleApiError(err, "Could not complete packing check");
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : null}
      </div>

      <BarcodeScannerDialog
        open={scannerTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setScannerTarget(null);
          }
        }}
        onScan={onCameraScan}
        title={scannerTarget === "variant" ? "Scan product QR" : "Scan tracking"}
        description={
          scannerTarget === "variant"
            ? "Scan the product variant QR. USB scanners still work from the keyboard field."
            : "Scan the Yalidine parcel sticker (Code 128 or QR)."
        }
      />
    </div>
  );
}

function CompletedBanner({
  progress,
  onNext,
}: {
  progress: PackingCheckProgress;
  onNext: () => void;
}) {
  const passed = progress.check.status === "passed";
  return (
    <div className="space-y-3">
      <Alert variant={passed ? "default" : "destructive"}>
        <AlertTitle>{passed ? "Parcel passed" : "Parcel failed"}</AlertTitle>
        <AlertDescription>
          {passed
            ? "Every confirmed item was scanned with no extras."
            : "Submit was incomplete or had mismatches. Start a re-check if needed."}
        </AlertDescription>
      </Alert>
      <Button type="button" className="h-12 w-full text-base" onClick={onNext}>
        Scan next parcel
      </Button>
    </div>
  );
}

function ScanningStep({
  progress,
  variantInput,
  setVariantInput,
  busy,
  lastCheck,
  onOpenCamera,
  onAdjust,
  onVoid,
  onComplete,
}: {
  progress: PackingCheckProgress;
  variantInput: string;
  setVariantInput: (value: string) => void;
  busy: boolean;
  lastCheck: PackingLastCheck | null;
  onOpenCamera: () => void;
  onAdjust: (variantId: number, quantity: number) => Promise<void>;
  onVoid: (scanId: number) => Promise<void>;
  onComplete: () => Promise<void>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Order #{progress.order.number}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {progress.order.customer_name}
            {progress.order.tracking_number
              ? ` · ${progress.order.tracking_number}`
              : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {lastCheck ? (
            <p className="text-xs text-muted-foreground">
              Previous check: {lastCheckText(lastCheck)}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Input
              value={variantInput}
              onChange={(e) => setVariantInput(e.target.value)}
              placeholder="Scan product QR"
              className="h-14 text-base"
              autoFocus
              disabled={busy}
              autoComplete="off"
            />
            <Button
              type="button"
              className="h-14 w-14 shrink-0"
              variant="outline"
              onClick={onOpenCamera}
              disabled={busy}
              aria-label="Scan product QR with camera"
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {progress.lines.map((line) => {
          const done = line.remaining === 0;
          return (
            <div
              key={line.product_variant_id}
              className={`flex items-center gap-2 rounded-lg border p-3 ${
                done ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{lineLabel(line)}</p>
                <p className="text-sm text-muted-foreground">
                  {line.scanned_qty}/{line.expected_qty} scanned
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={busy || line.scanned_qty <= 0}
                aria-label="Decrease scanned quantity"
                onClick={() =>
                  void onAdjust(line.product_variant_id, Math.max(0, line.scanned_qty - 1))
                }
              >
                <Minus />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={busy || line.scanned_qty <= 0}
                aria-label="Remove scanned variant"
                onClick={() => void onAdjust(line.product_variant_id, 0)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </div>

      {progress.mismatches.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-destructive">Mismatches</h2>
          {progress.mismatches.map((row) => (
            <div
              key={row.scan_id}
              className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{outcomeLabel(row.outcome)}</p>
                <p className="truncate text-sm text-muted-foreground">{row.scanned_code}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void onVoid(row.scan_id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-auto space-y-2 pt-2">
        {progress.ready_to_pass ? (
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-400">
            All items match. Submit to mark this parcel as passed.
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Submit incomplete or with mismatches to mark as failed.
          </p>
        )}
        <Button
          type="button"
          className="h-12 w-full text-base"
          variant={progress.ready_to_pass ? "default" : "secondary"}
          disabled={busy}
          onClick={() => void onComplete()}
        >
          Complete packing check
        </Button>
      </div>
    </div>
  );
}
