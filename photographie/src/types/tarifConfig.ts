export interface TariffFrame {
  id: string;
  name: string;
  priceModifier: number;
}

export interface TariffPaper {
  id: string;
  name: string;
  priceModifier: number;
}

export interface TariffSize {
  id: string;
  name: string;
  dimensions?: { width: number; height: number };
  basePrice: number;
  papers: TariffPaper[];
  frames: TariffFrame[];
}

export interface TariffFinish {
  id: string;
  name: string;
  sizes: TariffSize[];
}

export interface TariffCategory {
  id: string;
  name: string;
  finishes: TariffFinish[];
}

export interface TariffConfig {
  categories: TariffCategory[];
}
