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

export const NOEST_STATUSES: { value: string; label: string }[] = [
  { value: "picked_up", label: "Collecté" },
  { value: "order_received", label: "Colis reçu" },
  { value: "fdr_activated", label: "Feuille de route activée" },
  { value: "order_redispatched", label: "Colis remis en dispatch" },
  { value: "suspended", label: "Suspendu" },
  { value: "order_delivered", label: "Livré" },
  { value: "exchanged", label: "Échangé" },
  { value: "order_delivery_cancelled", label: "Livraison annulée" },
  { value: "exchanged_cancelled", label: "Échange annulé" },
  { value: "picked_up_cancelled", label: "Collecte annulée" },
  { value: "returned", label: "Retour" },
  { value: "returned_cancelled", label: "Retour annulé" },
  { value: "return_dispatched_to_partenaire", label: "Retour envoyé au partenaire" },
  { value: "return_dispatched_cancelled", label: "Retour envoyé annulé" },
];

const noestStatusLabels = new Map(NOEST_STATUSES.map((status) => [status.value, status.label]));

export function carrierStatusLabel(provider: string | undefined | null, status: string): string {
  if (provider === "noest") {
    return noestStatusLabels.get(status) || status;
  }
  return status;
}
