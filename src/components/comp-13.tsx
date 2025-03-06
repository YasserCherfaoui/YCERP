import { Input } from "@/components/ui/input";

export default function InputCurrency({
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <Input className="peer ps-6 pe-12" {...props} />

      <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
        DZD
      </span>
    </div>
  );
}
