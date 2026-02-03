export interface PriceStats {
  avg: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
}

export interface FlexibilityData {
  peakAvg: number;
  offPeakAvg: number;
  spreadEurPerMWh: number;
  hourlyProfile: number[];
}

export interface CarbonData {
  recordCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  carbonStats: {
    avg: number;
    min: number;
    max: number;
    current: number;
    stdDev?: number;
  };
  hourlyProfile?: number[];
  peakVsOffPeak?: {
    peakAvg: number;
    offPeakAvg: number;
    difference: number;
  };
  shiftSavings: {
    [key: number]: number;
  };
  yearlyTrend: {
    [year: string]: number;
  };
  generationMix?: {
    gas: number;
    coal: number;
    nuclear: number;
    wind: number;
    solar: number;
    hydro: number;
    biomass: number;
    imports: number;
    other: number;
  };
  dataSource: string;
}

export interface CountryData {
  name: string;
  iso3: string;
  iso2: string;
  recordCount: number;
  priceStats: PriceStats;
  flexibility: FlexibilityData;
  yearlyAverage: {
    [year: string]: number;
  };
  hasDetailedCarbon: boolean;
  hasCarbonData: boolean;
  carbonData?: CarbonData;
}

export interface EuropeanData {
  [country: string]: CountryData;
}

export interface FlexibilityCalculation {
  demandGWh: number;
  shiftHours: number;
  economicSavingsEur: number;
  co2AvoiddedTonnes: number | null;
  treesEquivalent: number | null;
}
