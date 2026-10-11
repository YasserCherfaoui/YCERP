import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
      {carriers.map((carrier) => (
        <label
          key={carrier.value}
          htmlFor={`${idPrefix}-${carrier.value}`}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onChange(carrier.value)}
        >
          <RadioGroupItem value={carrier.value} id={`${idPrefix}-${carrier.value}`} />
          <span className={value === carrier.value ? "font-medium" : undefined}>{carrier.label}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
