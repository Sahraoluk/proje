import React, { useState, useEffect, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  NeighborhoodData, 
  DistrictSummary, 
  LayerType 
} from '../types';
import { 
  ANKARA_DISTRICTS, 
  getLayerColor, 
  getLayerValue,
  findClosestNeighborhood,
  calculateDistanceKm
} from '../data/ankaraData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  GraduationCap, 
  TrainFront, 
  PartyPopper, 
  Coins, 
  Info,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Layers,
  Compass,
  Plus,
  Navigation,
  Eye,
  Crosshair,
  Sliders
} from 'lucide-react';

interface AnkaraMapProps {
  neighborhoods: NeighborhoodData[];
  selectedNeighborhood: NeighborhoodData | null;
  onSelectNeighborhood: (n: NeighborhoodData) => void;
  activeLayer: LayerType;
  onLayerChange: (l: LayerType) => void;
  selectedDistrict: string;
  onSelectDistrict: (d: string) => void;
  onAddToCompare: (n: NeighborhoodData) => void;
}

// Google Maps Dark Mode JSON Styling
const GOOGLE_MAPS_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#030712' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#091322' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#062024' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34d399' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#131e33' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#080e1a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f59e0b' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#151d38' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#0ea5e9' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#021024' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#020b18' }],
  },
];

// Helper component to pan camera when selectedNeighborhood changes
function MapCameraController({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      if ((map.getZoom() || 11) < 13) {
        map.setZoom(13);
      }
    }
  }, [map, target]);
  return null;
}

export const AnkaraMap: React.FC<AnkaraMapProps> = ({
  neighborhoods,
  selectedNeighborhood,
  onSelectNeighborhood,
  activeLayer,
  onLayerChange,
  selectedDistrict,
  onSelectDistrict,
  onAddToCompare,
}) => {
  const [mapViewMode, setMapViewMode] = useState<'google' | 'official_png'>('google');
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<NeighborhoodData | null>(null);
  
  // Arbitrary map click state for custom coordinate calculation
  const [arbitraryClick, setArbitraryClick] = useState<{
    lat: number;
    lng: number;
    closest: NeighborhoodData;
    distanceKm: number;
  } | null>(null);

  // InfoWindow pin selection state
  const [activePinWindow, setActivePinWindow] = useState<NeighborhoodData | null>(null);

  // Sync activePinWindow with selectedNeighborhood prop
  useEffect(() => {
    if (selectedNeighborhood) {
      setActivePinWindow(selectedNeighborhood);
    }
  }, [selectedNeighborhood]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Layers metadata
  const layersConfig: { id: LayerType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { 
      id: 'livability', 
      label: 'Yaşanabilirlik', 
      icon: Sparkles, 
      color: 'text-emerald-400', 
      desc: 'Tüm metriklerin ağırlıklı genel konfor skoru' 
    },
    { 
      id: 'safety', 
      label: 'Suç & Güvenlik', 
      icon: ShieldAlert, 
      color: 'text-rose-400', 
      desc: 'Düşük suç, gece emniyeti ve asayiş istikrarı' 
    },
    { 
      id: 'transport', 
      label: 'Ulaşım & EGO', 
      icon: TrainFront, 
      color: 'text-cyan-400', 
      desc: 'Metro, Ankaray, Başkentray ve EGO sefer sıklığı' 
    },
    { 
      id: 'education', 
      label: 'Eğitim & Okul', 
      icon: GraduationCap, 
      color: 'text-indigo-400', 
      desc: 'Üniversite, kolej, kütüphane ve lise başarısı' 
    },
    { 
      id: 'entertainment', 
      label: 'Sosyal & Eğlence', 
      icon: PartyPopper, 
      color: 'text-pink-400', 
      desc: 'Parklar, kafeler, kültür merkezleri ve sahneler' 
    },
    { 
      id: 'economy', 
      label: 'Ekonomi & Refah', 
      icon: Coins, 
      color: 'text-amber-400', 
      desc: 'Ortalama kira seviyesi ve sosyo-ekonomik refah' 
    },
  ];

  // Filtered neighborhoods based on district filter
  const displayedNeighborhoods = useMemo(() => {
    if (selectedDistrict === 'all') return neighborhoods;
    return neighborhoods.filter(n => n.district.toLowerCase() === selectedDistrict.toLowerCase());
  }, [neighborhoods, selectedDistrict]);

  // Handle click on arbitrary map spot
  const handleMapClick = (e: any) => {
    if (!e || !e.detail || !e.detail.latLng) return;
    const clickedCoord = e.detail.latLng;
    const match = findClosestNeighborhood(clickedCoord, neighborhoods);
    if (match) {
      setArbitraryClick({
        lat: clickedCoord.lat,
        lng: clickedCoord.lng,
        closest: match.neighborhood,
        distanceKm: match.distanceKm,
      });
      // Close individual pin popup if open
      setActivePinWindow(null);
    }
  };

  const handleSelectMarker = (n: NeighborhoodData) => {
    onSelectNeighborhood(n);
    setActivePinWindow(n);
    setArbitraryClick(null);
  };

  return (
    <div className="relative w-full rounded-3xl glass-panel neon-border overflow-hidden shadow-2xl flex flex-col">
      
      {/* Top Map Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-950/85 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
            Katman:
          </span>
          {layersConfig.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onLayerChange(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={layer.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher: Live Google Maps Dark vs Official District PNG */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setMapViewMode('google')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mapViewMode === 'google'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Canlı Google Maps (Koyu Tema)</span>
            </button>
            <button
              onClick={() => setMapViewMode('official_png')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mapViewMode === 'official_png'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Resmi İlçe Haritası (25 İlçe)</span>
            </button>
          </div>
        </div>

      </div>

      {/* District Quick Filter Chips Overlay */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          İlçe Odak:
        </span>
        <button
          onClick={() => onSelectDistrict('all')}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedDistrict === 'all'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Tüm Ankara ({neighborhoods.length} Mahalle)
        </button>
        {ANKARA_DISTRICTS.map(district => (
          <button
            key={district.id}
            onClick={() => onSelectDistrict(district.name)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedDistrict.toLowerCase() === district.name.toLowerCase()
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            <span>{district.name}</span>
            <span className="text-[10px] opacity-75 font-mono">
              ({district.averageLivability})
            </span>
          </button>
        ))}
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full h-[580px] sm:h-[680px] bg-[#030712] overflow-hidden">
        
        {/* VIEW 1: Interactive Google Maps Platform */}
        {mapViewMode === 'google' ? (
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={{ lat: 39.9208, lng: 32.8541 }} // Kızılay center
              defaultZoom={12}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              styles={GOOGLE_MAPS_DARK_STYLE}
              onClick={handleMapClick}
              className="w-full h-full"
            >
              <MapCameraController
                target={selectedNeighborhood ? { lat: selectedNeighborhood.lat, lng: selectedNeighborhood.lng } : null}
              />

              {/* Render Neighborhood Advanced Markers */}
              {displayedNeighborhoods.map((n) => {
                const isSelected = selectedNeighborhood?.id === n.id;
                const scoreValue = getLayerValue(activeLayer, n);
                const scoreColor = getLayerColor(activeLayer, scoreValue);
                const isCrimeRisk = n.crimeRateCategory === 'Yüksek' || n.crimeRateCategory === 'Çok Yüksek';

                return (
                  <AdvancedMarker
                    key={n.id}
                    position={{ lat: n.lat, lng: n.lng }}
                    onClick={() => handleSelectMarker(n)}
                    title={`${n.name} (${n.district})`}
                    zIndex={isSelected ? 50 : 10}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      
                      {/* Radar-ping pulse effect for selected neighborhood pin */}
                      {isSelected && (
                        <div 
                          className="absolute -inset-4 rounded-full bg-amber-400/40 radar-ping pointer-events-none" 
                          style={{ minWidth: '46px', minHeight: '46px' }}
                        />
                      )}

                      {/* Asayiş uyarısı yanıp sönen kırmızı halka */}
                      {isCrimeRisk && !isSelected && (
                        <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                      )}

                      {/* Main Pin Badge */}
                      <div 
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono shadow-xl border flex items-center gap-1.5 transition-all transform duration-200 ${
                          isSelected 
                            ? 'scale-115 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 bg-slate-900 border-amber-400 text-amber-300' 
                            : 'bg-slate-950/90 border-slate-700 text-slate-200 group-hover:scale-105 group-hover:border-cyan-400'
                        }`}
                        style={{
                          boxShadow: isSelected 
                            ? '0 0 16px rgba(245, 158, 11, 0.45)' 
                            : `0 0 8px ${scoreColor}40`
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: scoreColor }}
                        />
                        <span className="font-sans font-medium text-[11px] whitespace-nowrap">
                          {n.name.split('&')[0].trim()}
                        </span>
                        <span 
                          className="px-1.5 py-0.2 rounded font-bold text-[10px]"
                          style={{ 
                            backgroundColor: `${scoreColor}25`,
                            color: scoreColor
                          }}
                        >
                          {scoreValue}
                        </span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Marker InfoWindow when a neighborhood pin is clicked */}
              {activePinWindow && (
                <InfoWindow
                  position={{ lat: activePinWindow.lat, lng: activePinWindow.lng }}
                  onCloseClick={() => setActivePinWindow(null)}
                >
                  <div className="text-slate-900 p-1 min-w-[250px] max-w-[310px] space-y-2.5 font-sans">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {activePinWindow.district}
                        </span>
                        <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                          {activePinWindow.name}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        activePinWindow.verdictBadge === 'Mükemmel' ? 'bg-emerald-100 text-emerald-800' :
                        activePinWindow.verdictBadge === 'Çok İyi' ? 'bg-cyan-100 text-cyan-800' :
                        activePinWindow.verdictBadge === 'Orta' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {activePinWindow.verdictBadge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{activePinWindow.vibe}"
                    </p>

                    {/* Scores Matrix Grid */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-100 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Yaşanabilirlik:</span>
                        <span className="font-bold text-emerald-700">{activePinWindow.livabilityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Güvenlik:</span>
                        <span className="font-bold text-rose-700">{activePinWindow.safetyScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ulaşım / Metro:</span>
                        <span className="font-bold text-cyan-700">{activePinWindow.transportScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Eğitim:</span>
                        <span className="font-bold text-indigo-700">{activePinWindow.educationScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {/* Direct Google Maps External Link */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${activePinWindow.lat},${activePinWindow.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                        <span>Google Maps'te Aç</span>
                      </a>
                      <button
                        onClick={() => onSelectNeighborhood(activePinWindow)}
                        className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                      >
                        Detay Raporu
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Arbitrary Map Click InfoWindow */}
              {arbitraryClick && (
                <InfoWindow
                  position={{ lat: arbitraryClick.lat, lng: arbitraryClick.lng }}
                  onCloseClick={() => setArbitraryClick(null)}
                >
                  <div className="text-slate-900 p-1 min-w-[270px] max-w-[320px] space-y-2.5 font-sans">
                    <div className="border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
                        <Crosshair className="w-3 h-3" />
                        <span>Haritada Tıklanan Özel Nokta</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {arbitraryClick.lat.toFixed(4)}° K, {arbitraryClick.lng.toFixed(4)}° D
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">En Yakın Referans:</span>
                        <span className="font-bold text-slate-900">
                          {arbitraryClick.closest.name} ({arbitraryClick.closest.district})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Kuş Uçuşu Mesafe:</span>
                        <span className="font-bold text-cyan-700">{arbitraryClick.distanceKm.toFixed(2)} km</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-100 p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tahmini Yaşam:</span>
                        <span className="font-bold text-emerald-700">{arbitraryClick.closest.livabilityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Güvenlik Skoru:</span>
                        <span className="font-bold text-rose-700">{arbitraryClick.closest.safetyScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Suç Riski:</span>
                        <span className="font-bold text-amber-700">{arbitraryClick.closest.crimeRateCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ulaşım Skoru:</span>
                        <span className="font-bold text-cyan-700">{arbitraryClick.closest.transportScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${arbitraryClick.lat},${arbitraryClick.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                        <span>Google Maps'te Aç</span>
                      </a>
                      <button
                        onClick={() => onSelectNeighborhood(arbitraryClick.closest)}
                        className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                      >
                        Mahalleye Git
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}

            </Map>
          </APIProvider>
        ) : (
          /* VIEW 2: Official Ankara Province District Map Reference */
          <div className="relative w-full h-full bg-[#030712] flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <img
                src="/assets/aistudio/Ankara_districts_f6421333.png"
                alt="Ankara İlçe Haritası"
                className="max-h-[560px] sm:max-h-[640px] w-auto object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
              {/* Overlay district pins */}
              {ANKARA_DISTRICTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectDistrict(d.name);
                    setMapViewMode('google');
                  }}
                  style={{
                    left: `${d.provinceCoordinates.x}%`,
                    top: `${d.provinceCoordinates.y}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-slate-950/85 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 rounded-lg text-[10px] font-bold text-cyan-300 font-mono shadow-lg transition-all hover:scale-110 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Neighborhood Quick Float Card */}
        {selectedNeighborhood && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 glass-panel neon-border-amber p-4 rounded-2xl text-slate-100 shadow-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  {selectedNeighborhood.district} / {selectedNeighborhood.name}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                selectedNeighborhood.verdictBadge === 'Mükemmel' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                selectedNeighborhood.verdictBadge === 'Çok İyi' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                selectedNeighborhood.verdictBadge === 'Orta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {selectedNeighborhood.verdictBadge}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 py-1 text-center font-mono">
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Yaşam</span>
                <span className="text-sm font-bold text-emerald-400">{selectedNeighborhood.livabilityScore}</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Güvenlik</span>
                <span className="text-sm font-bold text-rose-400">{selectedNeighborhood.safetyScore}</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Ulaşım</span>
                <span className="text-sm font-bold text-cyan-400">{selectedNeighborhood.transportScore}</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kira</span>
                <span className="text-xs font-bold text-amber-400">{(selectedNeighborhood.averageRent / 1000).toFixed(0)}k₺</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-1 italic">
              "{selectedNeighborhood.vibe}"
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedNeighborhood.lat},${selectedNeighborhood.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Maps'te Aç</span>
              </a>
              <button
                onClick={() => onAddToCompare(selectedNeighborhood)}
                className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kıyasla</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Legend Floating Helper */}
        <div className="absolute top-4 right-4 z-10 glass-panel px-3 py-2 rounded-xl text-xs space-y-1 hidden md:block">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>90-100: Mükemmel Yaşam</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>70-89: Dengeli / İyi</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>&lt;70: Yüksek Suç / Riskli</span>
          </div>
        </div>

      </div>

    </div>
  );
};
