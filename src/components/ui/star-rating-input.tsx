import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value?: number | null;
  onChange: (value: number | undefined) => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = "md",
  className,
}: StarRatingInputProps) {
  const starSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className={cn("flex gap-1", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? undefined : star)}
          className="focus:outline-none rounded"
          aria-label={`Rate ${star} out of ${max}`}
        >
          <Star
            className={cn(
              starSize,
              star <= (value ?? 0)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
