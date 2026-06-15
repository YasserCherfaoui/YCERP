const YALIDINE_BORDEREAU_BASE_URL =
  "https://yalidine.app/app/bordereau.php?tracking=";

export function yalidineBordereauUrl(tracking: string): string {
  return `${YALIDINE_BORDEREAU_BASE_URL}${encodeURIComponent(tracking.trim())}`;
}
