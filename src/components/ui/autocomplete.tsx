import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

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
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AutocompleteProps<T extends FieldValues, TOption extends Record<string, any>> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  options: TOption[];
  displayField: keyof TOption;
  valueField: keyof TOption;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
};

export default function Autocomplete<T extends FieldValues, TOption extends Record<string, any>>({
  form,
  name,
  label,
  options,
  displayField,
  valueField,
  placeholder,
  emptyMessage = "No options found.",
  className,
  disabled = false,
}: AutocompleteProps<T, TOption>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                    className
                  )}
                >
                  {field.value
                    ? options.find(
                        (option) => String(option[valueField]) === String(field.value)
                      )?.[displayField]
                    : placeholder || `Select ${label.toLowerCase()}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={String(option[valueField])}
                        value={String(option[displayField])}
                        onSelect={() => {
                          form.setValue(name, option[valueField] as PathValue<T, Path<T>>);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(option[valueField]) === String(field.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option[displayField]}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

