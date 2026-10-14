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
