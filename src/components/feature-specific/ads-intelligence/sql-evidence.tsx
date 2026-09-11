import type { AdsSQLEvidence } from "@/models/data/ads-intelligence/chat.model";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  evidence: AdsSQLEvidence;
}

export default function SqlEvidence({ evidence }: Props) {
  return (
    <Accordion type="single" collapsible className="rounded-md border bg-background/80 text-xs">
      <AccordionItem value="sql" className="border-0">
        <AccordionTrigger className="px-2 py-1.5 text-left text-xs hover:no-underline">
          SQL evidence ({evidence.row_count} rows)
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-2 pb-2">
          <pre className="overflow-x-auto rounded bg-muted p-2 text-[11px] leading-relaxed">
            {evidence.sql}
          </pre>
          {evidence.rows.length > 0 && (
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-[11px]">
                <thead>
                  <tr className="border-b bg-muted/60">
                    {Object.keys(evidence.rows[0]).map((key) => (
                      <th key={key} className="px-2 py-1 text-left font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evidence.rows.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      {Object.keys(evidence.rows[0]).map((key) => (
                        <td key={key} className="px-2 py-1 align-top">
                          {String(row[key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
