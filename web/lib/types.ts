export type Governorate = {
  id: number;
  slug: string;
  name_ar: string;
  name_latin: string;
  lat: number;
  lng: number;
};

export type Product = {
  id: number;
  slug: string;
  name_ar: string;
  name_latin: string;
  category: string;
};

export type GovStat = {
  governorate_id: number;
  samples: number;
  min_millimes: number;
  median_millimes: number;
  max_millimes: number;
  last_seen: string;
};

export type PriceReport = {
  id: number;
  governorate_id: number;
  price_millimes: number;
  address: string | null;
  created_at: string;
};

export type ProductPrices = {
  product_slug: string;
  by_governorate: GovStat[];
  recent: PriceReport[];
};

export type PublicReport = {
  governorate_id: number;
  reason: string;
  created_at: string;
};
