import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const carriers = [
  { value: "yalidine", label: "Yalidine" },
  { value: "my_companies", label: "My Delivery Companies" },
  { value: "noest", label: "NOEST" },
];

export function CarrierRadioGroup({
  value,
  onChange,
  idPrefix,
}: {
  value: string;
  onChange: (value: string) => void;
  idPrefix: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-2 mt-2">
      {carriers.map((carrier) => {
        const id = `${idPrefix}-${carrier.value}`;
        return (
          <div key={carrier.value} className="flex items-center gap-2">
            <RadioGroupItem value={carrier.value} id={id} />
            <label
              htmlFor={id}
              className={cn("cursor-pointer", value === carrier.value && "font-medium")}
            >
              {carrier.label}
            </label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
