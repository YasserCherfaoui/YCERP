import type { AdsSQLEvidence } from "@/models/data/ads-intelligence/chat.model";
import { ChevronDown, Database } from "lucide-react";

interface Props {
  evidence: AdsSQLEvidence;
}

export default function SqlEvidence({ evidence }: Props) {
  const columns = evidence.rows[0] ? Object.keys(evidence.rows[0]) : [];
  const preview = evidence.rows.slice(0, 20);

  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <Database className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">Query behind this answer</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          {evidence.row_count} {evidence.row_count === 1 ? "row" : "rows"}
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
        </span>
      </summary>
      <div className="space-y-3 border-t px-3 py-3">
        <pre className="overflow-x-auto rounded-md bg-muted/70 p-3 font-mono text-[12px] leading-6 text-foreground">
          {evidence.sql}
        </pre>
        {preview.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-muted/80">
                <tr>
                  {columns.map((key) => (
                    <th key={key} className="whitespace-nowrap px-2.5 py-2 font-medium text-muted-foreground">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t even:bg-muted/30">
                    {columns.map((key) => (
                      <td key={key} className="px-2.5 py-2 align-top leading-5 tabular-nums">
                        {formatCell(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {evidence.row_count > preview.length && (
          <p className="text-xs text-muted-foreground">
            Showing {preview.length} of {evidence.row_count} rows.
          </p>
        )}
      </div>
    </details>
  );
}

function formatCell(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 2 }).format(value);
  }
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value) && Math.abs(Number(value)) >= 1000) {
    return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 2 }).format(Number(value));
  }
  return String(value);
}
