export function carrierLabel(provider?: string | null): string {
  switch (provider) {
    case "noest":
      return "NOEST";
    case "my_companies":
      return "My Delivery Companies";
    case "yalidine":
      return "Yalidine";
    default:
      return provider ? provider : "Yalidine";
  }
}

export function carrierChipClass(provider?: string | null): string {
  switch (provider) {
    case "noest":
      return "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200";
    case "my_companies":
      return "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    case "yalidine":
    default:
      return "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200";
  }
}

// Carrier statuses are shown exactly as the carrier sent them.
export function carrierStatusLabel(_provider: string | undefined | null, status: string): string {
  return status;
}
