// Visual language shared with the Orders desk (company-orders-desk-page).

export const liquidGlass =
  "border border-white/40 bg-white/45 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.16)]";

export const tone = {
  indigo:
    "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-100 dark:hover:bg-indigo-950",
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100 dark:hover:bg-emerald-950",
  violet:
    "border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/70 dark:text-violet-100 dark:hover:bg-violet-950",
  amber:
    "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100 dark:hover:bg-amber-950",
  sky: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-100 dark:hover:bg-sky-950",
  rose: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-100 dark:hover:bg-rose-950",
  pink: "border-pink-300 bg-pink-50 text-pink-800 hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950/70 dark:text-pink-100 dark:hover:bg-pink-950",
};

export const tile = {
  indigo: {
    surface: "border-indigo-200/80 bg-indigo-100/80 text-indigo-950 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50",
    icon: "bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100",
  },
  emerald: {
    surface: "border-emerald-200/80 bg-emerald-100/80 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50",
    icon: "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100",
  },
  amber: {
    surface: "border-amber-200/80 bg-amber-100/85 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50",
    icon: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  },
  rose: {
    surface: "border-rose-200/80 bg-rose-100/80 text-rose-950 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-50",
    icon: "bg-rose-200/80 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100",
  },
  violet: {
    surface: "border-violet-200/80 bg-violet-100/80 text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50",
    icon: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
  },
  sky: {
    surface: "border-sky-200/80 bg-sky-100/80 text-sky-950 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-50",
    icon: "bg-sky-200/80 text-sky-900 dark:bg-sky-400/20 dark:text-sky-100",
  },
  slate: {
    surface: "border-slate-200/80 bg-slate-100/80 text-slate-950 dark:border-slate-400/30 dark:bg-slate-500/20 dark:text-slate-50",
    icon: "bg-slate-200/80 text-slate-800 dark:bg-slate-400/20 dark:text-slate-100",
  },
} as const;

export type TileColor = keyof typeof tile;

export type RateTier = {
  label: string;
  color: TileColor;
  bar: string;
  text: string;
  ring: string;
  chip: string;
};

export function rateTier(rate: number, totalOrders: number): RateTier {
  if (totalOrders === 0)
    return {
      label: "New",
      color: "slate",
      bar: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      ring: "ring-slate-300 dark:ring-slate-600",
      chip: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    };
  if (rate >= 80)
    return {
      label: "Reliable",
      color: "emerald",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      text: "text-emerald-700 dark:text-emerald-300",
      ring: "ring-emerald-400 dark:ring-emerald-500",
      chip: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    };
  if (rate >= 50)
    return {
      label: "Mixed",
      color: "amber",
      bar: "bg-gradient-to-r from-amber-400 to-orange-500",
      text: "text-amber-700 dark:text-amber-300",
      ring: "ring-amber-400 dark:ring-amber-500",
      chip: "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    };
  return {
    label: "Risky",
    color: "rose",
    bar: "bg-gradient-to-r from-rose-400 to-rose-600",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-400 dark:ring-rose-500",
    chip: "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  };
}

const AVATAR_TONES = [
  "bg-gradient-to-br from-sky-200 to-indigo-200 text-indigo-900 dark:from-sky-500/30 dark:to-indigo-500/30 dark:text-indigo-50",
  "bg-gradient-to-br from-violet-200 to-fuchsia-200 text-violet-900 dark:from-violet-500/30 dark:to-fuchsia-500/30 dark:text-violet-50",
  "bg-gradient-to-br from-amber-200 to-orange-200 text-amber-900 dark:from-amber-500/30 dark:to-orange-500/30 dark:text-amber-50",
  "bg-gradient-to-br from-emerald-200 to-teal-200 text-emerald-900 dark:from-emerald-500/30 dark:to-teal-500/30 dark:text-emerald-50",
  "bg-gradient-to-br from-rose-200 to-pink-200 text-rose-900 dark:from-rose-500/30 dark:to-pink-500/30 dark:text-rose-50",
];

export function avatarTone(phone: string) {
  return AVATAR_TONES[Number(phone.slice(-1)) % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

export function customerInitials(firstName?: string, lastName?: string) {
  const letters = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return letters ? letters.toUpperCase() : "#";
}

export const ORDER_STATUS: Record<string, { label: string; chip: string }> = {
  unconfirmed: { label: "Unconfirmed", chip: "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200" },
  packing: { label: "Packing", chip: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  dispaching: { label: "Dispatching", chip: "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200" },
  deliviring: { label: "Delivering", chip: "border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  orphaned: { label: "Orphaned", chip: "border-yellow-200 bg-yellow-100 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200" },
  delivered: { label: "Delivered", chip: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  returning: { label: "Returning", chip: "border-orange-200 bg-orange-100 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200" },
  returned: { label: "Returned", chip: "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200" },
  cancelled: { label: "Cancelled", chip: "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-800 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200" },
  relaunched: { label: "Relaunched", chip: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200" },
};

export function orderStatus(status?: string) {
  return (
    ORDER_STATUS[status ?? ""] ?? {
      label: status || "Unknown",
      chip: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    }
  );
}
