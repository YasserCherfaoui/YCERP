import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AffiliateProBadgeProps {
  isPro: boolean;
  className?: string;
}

export function AffiliateProBadge({ isPro, className }: AffiliateProBadgeProps) {
  if (!isPro) return null;

  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 hover:from-amber-500 hover:to-yellow-600 font-semibold border-amber-300",
        className
      )}
    >
      ⭐ PRO
    </Badge>
  );
}

