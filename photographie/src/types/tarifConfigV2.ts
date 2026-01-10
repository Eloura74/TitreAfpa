export interface TariffFormatV2 {
  id: string;
  name: string; // ex: "30x40 cm"
  width?: number;
  height?: number;
  price: number; // Prix final pour ce format sur ce support
}

export interface TariffSupportV2 {
  id: string;
  name: string; // ex: "RC Satiné 230g"
  description?: string;
  technicalSpecs?: {
    weight?: string;
    brand?: string;
    dmax?: string;
    [key: string]: any;
  };
  formats: TariffFormatV2[];
}

export interface TariffProductV2 {
  id: string;
  name: string; // ex: "Argentique sur Lambda"
  description?: string;
  supports: TariffSupportV2[];
}

export interface TariffCategoryV2 {
  id: string;
  name: string; // ex: "Tirage Photo"
  products: TariffProductV2[];
}

export interface TariffConfigV2 {
  categories: TariffCategoryV2[];
}
