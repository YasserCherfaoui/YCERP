import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, PhoneCall } from "lucide-react";

export default function CustomerPhoneCell({ phone }: { phone: string }) {
  const { toast } = useToast();
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium tabular-nums">{phone}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 text-sky-600 hover:bg-sky-100 hover:text-sky-700 dark:text-sky-300 dark:hover:bg-sky-500/20"
        aria-label={`Copy ${phone}`}
        onClick={() => {
          void navigator.clipboard?.writeText(phone);
          toast({ title: "Phone copied", description: phone });
        }}
      >
        <Copy className="size-3.5" />
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="size-7 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
      >
        <a href={`tel:${phone.startsWith("213") ? "+" : ""}${phone}`} aria-label={`Call ${phone}`}>
          <PhoneCall className="size-3.5" />
        </a>
      </Button>
    </div>
  );
}
