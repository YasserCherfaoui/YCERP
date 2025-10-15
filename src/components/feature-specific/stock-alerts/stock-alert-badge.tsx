import { Badge } from "@/components/ui/badge";
import { AlertType } from "@/models/data/stock-alert.model";

interface StockAlertBadgeProps {
  type: AlertType;
  className?: string;
}

export const StockAlertBadge = ({ type, className }: StockAlertBadgeProps) => {
  const variants: Record<
    AlertType,
    { variant: "destructive" | "default" | "secondary" | "outline"; label: string }
  > = {
    out_of_stock: { variant: "destructive", label: "Out of Stock" },
    low_stock: { variant: "default", label: "Low Stock" },
    reorder_point: { variant: "secondary", label: "Reorder Point" },
    overstock: { variant: "outline", label: "Overstock" },
  };

  const config = variants[type];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

