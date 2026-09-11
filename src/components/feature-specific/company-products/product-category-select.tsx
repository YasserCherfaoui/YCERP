import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listProductCategories } from "@/services/product-service";
import { useQuery } from "@tanstack/react-query";

interface ProductCategorySelectProps {
  companyId: number;
  value?: number | null;
  onChange: (value: number | null) => void;
}

export function ProductCategorySelect({
  companyId,
  value,
  onChange,
}: ProductCategorySelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["product-categories", companyId],
    queryFn: () => listProductCategories(companyId),
    enabled: !!companyId,
  });
  const categories = data?.data ?? [];

  return (
    <Select
      value={value ? String(value) : "none"}
      onValueChange={(next) => onChange(next === "none" ? null : Number(next))}
      disabled={isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder="Uncategorized" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Uncategorized</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.ID} value={String(category.ID)}>
            {category.name}
            {!category.is_active ? " (inactive)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
