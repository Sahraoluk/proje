export type LayerType = 
  | 'livability' 
  | 'safety' 
  | 'education' 
  | 'transport' 
  | 'entertainment' 
  | 'economy';

export interface ScoreBreakdown {
  score: number; // 0 - 100
  details: string;
  subFactors?: { [key: string]: number };
}

export interface NeighborhoodData {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  x: number; // SVG map coordinate percentage (0-100)
  y: number; // SVG map coordinate percentage (0-100)
  population: number;
  averageRent: number; // TL
  incomeLevel: 'Çok Yüksek' | 'Yüksek' | 'Orta-Üst' | 'Orta' | 'Orta-Düşük' | 'Düşük';
  
  // Specific requested scores (0-100)
  livabilityScore: number;
  safetyScore: number;      // 100 = safest, 0 = highest crime
  crimeRateCategory: 'Çok Düşük' | 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
  crimeIncidentsPer1k: number;
  
  educationScore: number;
  transportScore: number;
  entertainmentScore: number;
  economyScore: number;

  // Transit specifics
  nearestMetroStation?: string;
  metroLines?: string[]; // e.g. ["M1", "M2", "A1", "Başkentray"]
  dailyTransitUsage: string;

  // Detailed Analysis & Verdict
  verdictTitle: string;
  verdictBadge: 'Mükemmel' | 'Çok İyi' | 'Orta' | 'Riskli' | 'Tavsiye Edilmez';
  verdictSummary: string; // The detailed text answer for "orda yaşanabilir mi?"
  educationDetail: string;
  transportDetail: string;
  entertainmentDetail: string;
  safetyDetail: string;

  // Fun & Creative profile
  vibe: string;
  funFact: string;
  idealFor: string[];
  pros: string[];
  cons: string[];
  provinceCoordinates?: { x: number; y: number }; // Percentage position on the official Ankara province map image
}

export interface DistrictSummary {
  id: string;
  name: string;
  plate: string;
  numberIndex?: number; // (1) to (8) from the official map legend
  centerCoordinates: { x: number; y: number };
  provinceCoordinates: { x: number; y: number }; // (0-100% on the uploaded Ankara_districts map)
  svgPath: string; // Vector polygon path for the map
  colorTheme: string;
  neighborhoodsCount: number;
  averageLivability: number;
  averageSafety: number;
  averageTransport: number;
  averageEducation: number;
  averageEntertainment: number;
  summary: string;
}

export interface HistoricalSafetyPoint {
  year: number;
  index: number; // The user's Statbase chart points (20.6 up to 46.2 then ~39.5)
  description?: string;
}

export interface EgoTransportItem {
  type: string;
  passengers: number;
  percentage: number;
  category: 'Şehir İçi Raylı' | 'EGO Otobüs' | 'Özel Toplu Taşıma' | 'Çevre İlçe Hatları' | 'Diğer';
}

export interface CustomDatasetRow {
  name: string;
  district?: string;
  livabilityScore?: number;
  safetyScore?: number;
  crimeRate?: string;
  educationScore?: number;
  transportScore?: number;
  entertainmentScore?: number;
  notes?: string;
}
