"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxItem {
  value: string
  label: string
}

export interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  label?: string
  className?: string
  searchPlaceholder?: string
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select an item",
  emptyMessage = "No item found.",
  label,
  className,
  searchPlaceholder = "Search...",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  const [search, setSearch] = React.useState("");

  // Filter items by label or value
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.value.toLowerCase().includes(lower)
    );
  }, [items, search]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}> 
              {value
                ? items.find((item) => item.value === value)?.label
                : placeholder}
            </span>
            <ChevronsUpDown
              size={16}
              strokeWidth={2}
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      size={16}
                      strokeWidth={2}
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 