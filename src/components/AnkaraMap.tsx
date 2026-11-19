import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Pane,
  Popup,
  Tooltip,
  useMapEvents,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  NeighborhoodData,
  LayerType,
  PoiCategory,
  PoiItem,
  TravelEstimate,
} from '../types';
import {
  ANKARA_RAIL_LINES,
  ANKARA_POI_FALLBACKS,
  POI_CATEGORY_META,
  ReferencePoint,
  calculateDistanceKm,
  estimateFallbackTravelMinutes,
  getLayerValue,
  getScoreColor,
  isDangerousNeighborhood,
} from '../data/ankaraData';
import { Legend } from './Legend';
import {
  AlertTriangle,
  FileText,
  Scale,
  TrainFront,
  Navigation,
  MapPin,
  Car,
  Hospital,
  BookOpen,
  Trees,
  Shield,
  PawPrint,
  ChevronDown,
  ChevronUp,
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
  referencePoint?: ReferencePoint | null;
  travelTimes?: Record<string, TravelEstimate>;
}

const AnkaraBounds = { minLat: 38.7, maxLat: 40.75, minLng: 30.85, maxLng: 34.05 };

function MapCameraController({ target }: { target: NeighborhoodData | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && typeof target.lat === 'number' && typeof target.lng === 'number') {
      map.flyTo([target.lat, target.lng], 14, { duration: 0.9 });
    }
  }, [target, map]);
  return null;
}

function MapClickHandler({
  onLocationClick,
}: {
  onLocationClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface NeighborhoodMarkerProps {
  neighborhood: NeighborhoodData;
  activeLayer: LayerType;
  isSelected: boolean;
  travelEstimate: TravelEstimate | null;
  onSelectNeighborhood: (n: NeighborhoodData) => void;
  onAddToCompare: (n: NeighborhoodData) => void;
}

const NeighborhoodMarker: React.FC<NeighborhoodMarkerProps> = ({
  neighborhood: n,
  activeLayer,
  isSelected,
  travelEstimate,
  onSelectNeighborhood,
  onAddToCompare,
}) => {
  const map = useMap();
  const score = getLayerValue(activeLayer, n);
  const isDangerous = isDangerousNeighborhood(n);
  const fillColor = getScoreColor(score, isDangerous);
  const haloColor = isDangerous ? '#dc2626' : fillColor;

  // Dynamic marker radius proportional to active score
  const baseRadius = Math.max(5.5, Math.min(12, 4.5 + (score / 100) * 6.5));
  const primaryRadius = isSelected ? baseRadius + 3 : baseRadius;
  const haloRadius = isSelected ? baseRadius + 10 : isDangerous ? baseRadius + 9 : baseRadius + 7;

  return (
    <React.Fragment>
      {/* Lower translucent outer halo */}
      <CircleMarker
        center={[n.lat, n.lng]}
        radius={haloRadius}
        interactive={false}
        pathOptions={{
          stroke: false,
          fillColor: haloColor,
          fillOpacity: isSelected ? 0.36 : isDangerous ? 0.28 : 0.22,
        }}
      />

      {/* Upper crisp primary point */}
      <CircleMarker
        center={[n.lat, n.lng]}
        radius={primaryRadius}
        pathOptions={{
          color: '#ffffff',
          weight: isSelected ? 3 : 2,
          fillColor,
          fillOpacity: 0.95,
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} className="cyber-leaflet-tooltip" opacity={1}>
          <div className="min-w-[180px] space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-bold text-xs text-white leading-tight">
                {n.name}
              </span>
              <span
                className="px-1.5 py-0.5 rounded font-mono text-[11px] font-extrabold text-slate-950 shrink-0"
                style={{ backgroundColor: fillColor }}
              >
                {score}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-teal-200/75">
              <span>{n.district}</span>
              <span>Skor: {score}/100</span>
            </div>
            {travelEstimate && (
              <div className="text-[10px] font-mono text-[#f3c1cd] flex items-center gap-2">
                <span>{travelEstimate.distanceKm.toFixed(1)} km</span>
                <span>·</span>
                <span>🚗 {travelEstimate.drivingMinutes} dk</span>
                <span>·</span>
                <span>🚶 {travelEstimate.walkingMinutes} dk</span>
              </div>
            )}
            {isDangerous && (
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/50 text-red-300 text-[10px] font-bold">
                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                <span>Yüksek Risk</span>
              </div>
            )}
          </div>
        </Tooltip>

        <Popup className="cyber-leaflet-popup">
          <div className="min-w-[230px] space-y-2 p-1 text-teal-50">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-200/70">
                  {n.district}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-950"
                  style={{ backgroundColor: fillColor }}
                >
                  {score}/100
                </span>
              </div>
              <p className="font-display font-bold text-sm text-white mt-0.5 leading-snug">
                {n.name}
              </p>
            </div>

            {isDangerous && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Tehlikeli / Yüksek Riskli Bölge</span>
              </div>
            )}

            <div className="space-y-1 text-xs text-teal-100/85 border-t border-teal-900/70 pt-1.5">
              <div className="flex justify-between">
                <span className="text-teal-200/70">Ortalama Kira:</span>
                <span className="font-mono font-semibold text-white">
                  {(n.averageRent ?? 0).toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-200/70">Güvenlik:</span>
                <span className={`font-semibold ${isDangerous ? 'text-red-400' : 'text-emerald-400'}`}>
                  {n.crimeRateCategory} ({n.safetyScore}/100)
                </span>
              </div>
              {travelEstimate && (
                <div className="pt-1 border-t border-teal-900/50 space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-teal-200/70">Kuş Uçuşu Mesafe:</span>
                    <span className="font-mono font-semibold text-[#f3c1cd]">
                      {travelEstimate.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-teal-200/70 flex items-center gap-1">
                      <Car className="w-3 h-3 text-teal-300" />
                      Araç / Yürüyüş:
                    </span>
                    <span className="font-mono font-semibold text-teal-200">
                      ~{travelEstimate.drivingMinutes} dk / ~{travelEstimate.walkingMinutes} dk
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  map.closePopup();
                  onSelectNeighborhood(n);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] hover:brightness-105 text-slate-950 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>Karnesi</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCompare(n);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#0b1f26] hover:bg-[#e8a0b2]/15 text-teal-50 border border-[#e8a0b2]/35 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                <Scale className="w-3 h-3 text-teal-300" />
                <span>Karşılaştır</span>
              </button>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </React.Fragment>
  );
};

export const AnkaraMap: React.FC<AnkaraMapProps> = ({
  neighborhoods,
  selectedNeighborhood,
  onSelectNeighborhood,
  activeLayer,
  onLayerChange,
  onAddToCompare,
  referencePoint,
  travelTimes = {},
}) => {
  const [warning, setWarning] = useState<string | null>(null);
  const [showRailLines, setShowRailLines] = useState<boolean>(false);
  const [poiMenuOpen, setPoiMenuOpen] = useState<boolean>(false);
  const [activePoiCategories, setActivePoiCategories] = useState<PoiCategory[]>([]);
  const [poiDataByCategory, setPoiDataByCategory] = useState<Partial<Record<PoiCategory, PoiItem[]>>>({});

  const togglePoiCategory = async (cat: PoiCategory) => {
    const isCurrentlyActive = activePoiCategories.includes(cat);
    if (isCurrentlyActive) {
      setActivePoiCategories((prev) => prev.filter((c) => c !== cat));
      return;
    }

    setActivePoiCategories((prev) => [...prev, cat]);
    if (!poiDataByCategory[cat]) {
      // Immediately seed curated Ankara POIs so markers render without waiting
      setPoiDataByCategory((prev) => ({
        ...prev,
        [cat]: ANKARA_POI_FALLBACKS[cat],
      }));
      try {
        const res = await axios.get<{ items?: PoiItem[] }>(`/api/pois?category=${cat}`);
        const osmItems = Array.isArray(res.data?.items) ? res.data.items : [];
        if (osmItems.length > 0) {
          // Merge curated POIs with Overpass results (avoid duplicates by approximate coords)
          const merged = [...ANKARA_POI_FALLBACKS[cat]];
          for (const item of osmItems) {
            const existsNear = merged.some(
              (m) =>
                Math.abs(m.lat - item.lat) < 0.002 && Math.abs(m.lng - item.lng) < 0.002
            );
            if (!existsNear) {
              merged.push(item);
            }
          }
          setPoiDataByCategory((prev) => ({
            ...prev,
            [cat]: merged,
          }));
        }
      } catch {
        // Curated POIs already loaded
      }
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (
      lat < AnkaraBounds.minLat ||
      lat > AnkaraBounds.maxLat ||
      lng < AnkaraBounds.minLng ||
      lng > AnkaraBounds.maxLng
    ) {
      setWarning('Burası Ankara değil!');
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    try {
      const res = await axios.get<{ address?: { province?: string; state?: string } }>(
        `/api/geocode/reverse?lat=${lat}&lng=${lng}`
      );
      const region = res.data?.address?.province || res.data?.address?.state;
      if (region && region !== 'Ankara') {
        setWarning(`Burası Ankara değil! (${region})`);
        setTimeout(() => setWarning(null), 3000);
      }
    } catch {
      // Silent ignore if proxy fails transiently
    }
  };

  const layerOptions: { id: LayerType; label: string }[] = [
    { id: 'livability', label: 'Yaşanabilirlik' },
    { id: 'safety', label: 'Güvenlik' },
    { id: 'transport', label: 'Ulaşım' },
    { id: 'education', label: 'Eğitim' },
    { id: 'entertainment', label: 'Sosyal Yaşam' },
    { id: 'economy', label: 'Ekonomi' },
  ];

  const poiOptions: { id: PoiCategory; icon: React.ReactNode }[] = [
    { id: 'hospital', icon: <Hospital className="w-3 h-3" /> },
    { id: 'library', icon: <BookOpen className="w-3 h-3" /> },
    { id: 'park', icon: <Trees className="w-3 h-3" /> },
    { id: 'police', icon: <Shield className="w-3 h-3" /> },
    { id: 'veterinary', icon: <PawPrint className="w-3 h-3" /> },
  ];

  const hasValidReferencePoint = Boolean(referencePoint && referencePoint.id !== 'none');

  const activePoiItems: PoiItem[] = activePoiCategories.flatMap(
    (cat) => poiDataByCategory[cat] || ANKARA_POI_FALLBACKS[cat] || []
  );

  return (
    <div className="relative z-0 isolate w-full h-[610px] rounded-2xl overflow-hidden shadow-2xl border border-[#e8a0b2]/30 bg-[#061317]">
      {/* Floating Left Control Stack: Layer Selector + Rail Lines + POI Layers */}
      <div className="absolute top-3 left-3 z-[500] max-w-[calc(100%-4.75rem)] flex flex-col gap-2">
        <div className="bg-[#0b1f26]/90 backdrop-blur-md border border-[#e8a0b2]/30 p-1.5 rounded-xl flex flex-wrap sm:flex-col gap-1 shadow-xl">
          {layerOptions.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onLayerChange(l.id)}
              className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-all cursor-pointer ${
                activeLayer === l.id
                  ? 'bg-gradient-to-r from-[#f3c1cd] to-[#d8839a] text-slate-950 shadow-sm'
                  : 'bg-[#061317]/80 text-teal-50 hover:bg-[#e8a0b2]/15 border border-teal-900/70'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Rail Lines Toggle */}
        <button
          type="button"
          onClick={() => setShowRailLines((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
            showRailLines
              ? 'bg-[#e8a0b2]/20 text-[#f3c1cd] border-[#e8a0b2]/60'
              : 'bg-[#0b1f26]/90 text-teal-50 border-[#e8a0b2]/30 hover:bg-teal-950/90'
          }`}
        >
          <TrainFront className="w-3.5 h-3.5 text-[#f3c1cd] shrink-0" />
          <span className="truncate">
            {showRailLines ? 'Raylı Hatlar: Açık' : 'Raylı Sistem Hatları'}
          </span>
        </button>

        {showRailLines && (
          <div className="bg-[#0b1f26]/92 backdrop-blur-md border border-teal-900/70 rounded-xl p-2 text-[10px] text-teal-50 space-y-1 shadow-xl max-w-[230px]">
            {ANKARA_RAIL_LINES.map((line) => (
              <div key={line.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: line.color }}
                />
                <span className="truncate text-teal-100/90">{line.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible Environment POI Layers */}
        <div className="bg-[#0b1f26]/92 backdrop-blur-md border border-[#e8a0b2]/30 rounded-xl shadow-xl overflow-hidden max-w-[235px]">
          <button
            type="button"
            onClick={() => setPoiMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold text-teal-50 hover:bg-[#e8a0b2]/10 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#f3c1cd]" />
              <span>Çevre POI Katmanları</span>
              {activePoiCategories.length > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-[#e8a0b2] text-slate-950 text-[10px] font-mono font-bold">
                  {activePoiCategories.length}
                </span>
              )}
            </span>
            {poiMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {poiMenuOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-teal-900/60 flex flex-col gap-1">
              {poiOptions.map(({ id, icon }) => {
                const meta = POI_CATEGORY_META[id];
                const isActive = activePoiCategories.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePoiCategory(id)}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#e8a0b2]/20 text-white border border-[#e8a0b2]/50'
                        : 'bg-[#061317]/75 text-teal-100/80 border border-teal-900/60 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      {icon}
                      <span>{meta.label}</span>
                    </span>
                    <span className="text-[9px] font-mono opacity-80">
                      {isActive ? 'Açık' : 'Kapalı'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[39.9255, 32.8662]}
        zoom={11}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapCameraController target={selectedNeighborhood} />
        <MapClickHandler onLocationClick={handleMapClick} />

        {/* Toggleable Rail Lines placed in a lower pane beneath neighborhood pins */}
        {showRailLines && (
          <Pane name="rail-lines" style={{ zIndex: 350 }}>
            {ANKARA_RAIL_LINES.map((line) => (
              <Polyline
                key={line.id}
                positions={line.coordinates}
                pathOptions={{
                  color: line.color,
                  weight: 3.5,
                  opacity: 0.65,
                  dashArray: line.type === 'Başkentray' ? '6 6' : undefined,
                }}
              >
                <Tooltip sticky className="cyber-leaflet-tooltip">
                  <div className="max-w-[220px] space-y-1">
                    <div className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: line.color }}
                      />
                      <span>{line.name}</span>
                    </div>
                    <p className="text-[10px] text-teal-200/80 leading-snug">{line.stations}</p>
                  </div>
                </Tooltip>
              </Polyline>
            ))}
          </Pane>
        )}

        {/* Toggleable POI Markers Pane */}
        {activePoiItems.length > 0 && (
          <Pane name="poi-markers" style={{ zIndex: 420 }}>
            {activePoiItems.map((poi) => {
              const meta = POI_CATEGORY_META[poi.category];
              return (
                <CircleMarker
                  key={poi.id}
                  center={[poi.lat, poi.lng]}
                  radius={5}
                  pathOptions={{
                    color: '#061317',
                    weight: 1.5,
                    fillColor: meta.color,
                    fillOpacity: 0.92,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -5]} className="cyber-leaflet-tooltip" opacity={1}>
                    <div className="text-[11px] space-y-0.5">
                      <span
                        className="font-mono text-[9px] uppercase font-bold block"
                        style={{ color: meta.color }}
                      >
                        {meta.shortLabel}
                      </span>
                      <span className="font-semibold text-white block">{poi.name}</span>
                      {poi.district && (
                        <span className="text-[10px] text-teal-200/75 block">{poi.district}</span>
                      )}
                    </div>
                  </Tooltip>
                  <Popup className="cyber-leaflet-popup">
                    <div className="min-w-[160px] p-1 text-xs text-teal-50 space-y-1">
                      <span
                        className="text-[10px] font-mono font-bold uppercase block"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <p className="font-bold text-white">{poi.name}</p>
                      {poi.district && (
                        <p className="text-[11px] text-teal-200/75">{poi.district}, Ankara</p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </Pane>
        )}

        {/* Selected Reference Point Pin */}
        {hasValidReferencePoint && referencePoint && (
          <CircleMarker
            center={[referencePoint.lat, referencePoint.lng]}
            radius={9}
            pathOptions={{
              color: '#e8a0b2',
              weight: 3,
              fillColor: '#14b8a6',
              fillOpacity: 0.95,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="cyber-leaflet-tooltip" opacity={1}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Navigation className="w-3.5 h-3.5 text-[#e8a0b2]" />
                <span>Referans Noktanız: {referencePoint.label}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        )}

        {neighborhoods.map((n) => {
          let travelEstimate: TravelEstimate | null = null;
          if (hasValidReferencePoint && referencePoint) {
            if (travelTimes[n.id]) {
              travelEstimate = travelTimes[n.id];
            } else {
              const dist = calculateDistanceKm(referencePoint.lat, referencePoint.lng, n.lat, n.lng);
              travelEstimate = estimateFallbackTravelMinutes(dist);
            }
          }

          return (
            <NeighborhoodMarker
              key={n.id}
              neighborhood={n}
              activeLayer={activeLayer}
              isSelected={selectedNeighborhood?.id === n.id}
              travelEstimate={travelEstimate}
              onSelectNeighborhood={onSelectNeighborhood}
              onAddToCompare={onAddToCompare}
            />
          );
        })}
      </MapContainer>

      <Legend />

      {warning && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-red-950/95 text-red-100 px-4 py-2 rounded-xl border border-red-500 font-bold text-xs shadow-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};
