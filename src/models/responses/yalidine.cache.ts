

export interface ListResponse {
  hasMore: boolean;
  totalData: number;
  data: any[];
  links: {
    self: string;
    before: string | null;
    after: string | null;
  };
}

export interface Parcel {
  tracking: string;
  order_id: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  is_stopdesk: number;
  stopdesk_id: number;
  stopdesk_name: string;
  from_wilaya_id: number;
  from_wilaya_name: string;
  to_commune_id: number;
  to_commune_name: string;
  to_wilaya_id: number;
  to_wilaya_name: string;
  product_list: string;
  price: number;
  do_insurance: boolean;
  declared_value: number;
  delivery_fee: number;
  freeshipping: number;
  import_id: number;
  date_creation: string;
  date_expedition: string | null;
  date_last_status: string;
  last_status: string;
  taxe_percentage: number;
  taxe_from: number;
  taxe_retour: number;
  parcel_type: string;
  parcel_sub_type: string | null;
  has_receipt: boolean | null;
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  has_recouvrement: number;
  current_center_id: number;
  current_center_name: string;
  current_wilaya_id: number;
  current_wilaya_name: string;
  current_commune_id: number;
  current_commune_name: string;
  payment_status: string;
  payment_id: string | null;
  has_exchange: number;
  product_to_collect: string | null;
  label: string;
  pin: string;
  qr_text: string;
}

export interface ParcelListResponse extends ListResponse {
  data: Parcel[];
}

export interface Center {
  center_id: number;
  name: string;
  address: string;
  gps: string;
  commune_id: number;
  commune_name: string;
  wilaya_id: number;
  wilaya_name: string;
}

export interface CenterListResponse extends ListResponse {
  data: Center[];
}

export interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  wilaya_name: string;
  has_stop_desk: number;
  is_deliverable: number;
  delivery_time_parcel: number;
  delivery_time_payment: number;
}

export interface CommuneListResponse extends ListResponse {
  data: Commune[];
}

export interface Wilaya {
  id: number;
  name: string;
  zone: number;
  is_deliverable: number;
}

export interface WilayaListResponse extends ListResponse {
  data: Wilaya[];
}

export interface YalidineCache {
  centers: Record<number, Center[]>;
  communes: Record<number, Commune[]>;
  wilayas: Record<number, Wilaya>;
  last_refreshed: string;
}

export interface CommunePricing {
  commune_id: number;
  commune_name: string;
  express_home: number | null;
  express_desk: number | null;
  economic_home: number | null;
  economic_desk: number | null;
}

export interface PricingResponse {
  from_wilaya_name: string;
  to_wilaya_name: string;
  zone: number;
  retour_fee: number;
  cod_percentage: number;
  insurance_percentage: number;
  oversize_fee: number;
  per_commune: Record<string, CommunePricing>;
}
