"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProductVariant } from "@/models/data/product.model";

interface ProductVariantComboboxProps {
  variants?: ProductVariant[];
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductVariantCombobox({
  variants = [],
  value,
  onChange,
  placeholder = "Select variant...",
  disabled = false,
}: ProductVariantComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Find the selected variant to display its QR code
  const safeVariants = Array.isArray(variants) ? variants.filter(Boolean) : [];
  const selectedVariant = React.useMemo(
    () => safeVariants.find((variant) => variant && variant.ID === value),
    [safeVariants, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
          type="button"
        >
          {selectedVariant ? selectedVariant.qr_code : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search QR code..." />
          <CommandList>
            <CommandEmpty>No variant found.</CommandEmpty>
            <CommandGroup>
              {safeVariants.map((variant) => (
                <CommandItem
                  key={variant.ID}
                  value={variant.qr_code}
                  onSelect={() => {
                    onChange(variant.ID === value ? undefined : variant.ID);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === variant.ID ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {variant.qr_code}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
