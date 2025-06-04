import { ClientStatus } from "@/models/data/client-status.model";
import { DeliveryCompany, DeliveryEmployee } from "@/models/data/delivery.model";
import { Product, ProductVariant } from "@/models/data/product.model";
import { Qualification } from "@/models/data/qualification.model";
import { User } from "./user.model";

export interface WooOrder {
  id: number;
  woo_id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  customer_id: number;
  customer_email: string;
  customer_phone: string;
  billing_name: string;
  billing_address_1: string;
  billing_city: string;
  shipping_name: string;
  shipping_address_1: string;
  shipping_city: string;
  date_created: string | Date;
  date_modified: string | Date;
  payment_method: string;
  payment_method_title: string;
  order_key: string;
  line_items: WooOrderItem[];
  meta_data: WooOrderMeta[];
  shipping_lines: WooOrderShippingLine[];
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date | null;
  taken_by_id?: number | null;
  taken_by?: User | null;
  taken_at?: string | Date | null;
  client_statuses: ClientStatus[];
  order_status?: string;
  confirmed_order_items?: ConfirmedOrderItem[];
  woo_shipping?: WooShipping;
  tracking_number?: string;
  amount?: number;
  final_price?: number;
  order_histories?: OrderHistory[];
  yalidine_order_histories?: YalidineOrderHistory[];
}

export interface YalidineOrderHistory {
  ID: number;
  woo_order_id: number;
  woo_order?: WooOrder;
  status: YalidineStatusType;
  date: string | Date;
  CreatedAt: string | Date;
  UpdatedAt: string | Date;
  DeletedAt?: string | Date | null;
}

export interface OrderHistory {
  ID: number;
  woo_order_id: number;
  woo_order?: WooOrder;
  status: string;
  date: string | Date;
  qualification_id: number;
  qualification?: Qualification;
  CreatedAt: string | Date;
  UpdatedAt: string | Date;
  DeletedAt?: string | Date | null;
}


export interface WooOrderItem {
  id: number;
  order_id: number;
  woo_id: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  total: string;
  product_id: number;
  variation_id: number;
}

export interface WooOrderMeta {
  id: number;
  order_id: number;
  meta_id: number;
  key: string;
  value: string;
}

export interface WooOrderShippingLine {
  id: number;
  order_id: number;
  woo_id: number;
  method_id: string;
  method_title: string;
  total: string;
}

export interface ConfirmedOrderItem {
  id?: number;
  woo_order_id: number;
  product_id: number;
  product?: Product;
  product_variant_id: number;
  product_variant?: ProductVariant;
  quantity: number;
}

export interface WooShipping {
  id?: number;
  woo_order_id: number;
  first_delivery_cost: number;
  second_delivery_cost: number;
  shipping_provider: string;
  delivery_type: string;
  selected_commune: string;
  selected_center: string;
  state_id: string;
  wilaya_name: string;
  commune_name: string;
  delivery_company_id?: number;
  delivery_company?: DeliveryCompany;
  employee_id?: number;
  employee?: DeliveryEmployee;
}

export type YalidineStatusType = 
  | "Pas encore expédié"
  | "A vérifier"
  | "En préparation"
  | "Pas encore ramassé"
  | "Prêt à expédier"
  | "Ramassé"
  | "Bloqué"
  | "Débloqué"
  | "Transfert"
  | "Expédié"
  | "Centre"
  | "En localisation"
  | "Vers Wilaya"
  | "Reçu à Wilaya"
  | "En attente du client"
  | "Prêt pour livreur"
  | "Sorti en livraison"
  | "En attente"
  | "En alerte"
  | "Alerte résolue"
  | "Tentative échouée"
  | "Livré"
  | "Echèc livraison"
  | "Retour vers centre"
  | "Retourné au centre"
  | "Retour transfert"
  | "Retour groupé"
  | "Retour à retirer"
  | "Retour vers vendeur"
  | "Retourné au vendeur"
  | "Echange échoué";

export const YALIDINE_STATUSES: Record<string, YalidineStatusType> = {
  PAS_ENCORE_EXPEDIE: "Pas encore expédié",
  A_VERIFIER: "A vérifier",
  EN_PREPARATION: "En préparation",
  PAS_ENCORE_RAMASSE: "Pas encore ramassé",
  PRET_A_EXPEDIER: "Prêt à expédier",
  RAMASSE: "Ramassé",
  BLOQUE: "Bloqué",
  DEBLOQUE: "Débloqué",
  TRANSFERT: "Transfert",
  EXPEDIE: "Expédié",
  CENTRE: "Centre",
  EN_LOCALISATION: "En localisation",
  VERS_WILAYA: "Vers Wilaya",
  RECU_A_WILAYA: "Reçu à Wilaya",
  EN_ATTENTE_DU_CLIENT: "En attente du client",
  PRET_POUR_LIVREUR: "Prêt pour livreur",
  SORTI_EN_LIVRAISON: "Sorti en livraison",
  EN_ATTENTE: "En attente",
  EN_ALERTE: "En alerte",
  ALERTE_RESOLUE: "Alerte résolue",
  TENTATIVE_ECHOUEE: "Tentative échouée",
  LIVRE: "Livré",
  ECHEC_LIVRAISON: "Echèc livraison",
  RETOUR_VERS_CENTRE: "Retour vers centre",
  RETOURNE_AU_CENTRE: "Retourné au centre",
  RETOUR_TRANSFERT: "Retour transfert",
  RETOUR_GROUPE: "Retour groupé",
  RETOUR_A_RETIRER: "Retour à retirer",
  RETOUR_VERS_VENDEUR: "Retour vers vendeur",
  RETOURNE_AU_VENDEUR: "Retourné au vendeur",
  ECHANGE_ECHOUE: "Echange échoué"
};
