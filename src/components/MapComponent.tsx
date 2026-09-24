import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
} from 'lucide-react';
import { getCoordinatesForLocation } from '../utils/locationData';

// Fix for default Leaflet marker icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Bhara Hobe Brand Pin Icon using L.divIcon
const customBharaHobeIcon = L.divIcon({
  className: 'bharahobe-custom-marker',
  html: `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.35); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 34px; height: 34px; background: #059669; border: 3px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.193 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -40],
});

interface MapComponentProps {
  position?: [number, number];
  locationName?: string;
  propertyTitle?: string;
  rentAmount?: number | string;
  category?: string;
}

// Map controller for external recenter triggers
function MapController({
  position,
  zoom,
}: {
  position: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, zoom, { animate: true });
    map.invalidateSize();
  }, [position, zoom, map]);

  return null;
}

// Map custom UI controls (Zoom & Recenter)
function MapInternalControls({
  position,
  onRecenter,
}: {
  position: [number, number];
  onRecenter: () => void;
}) {
  const map = useMap();

  return (
    <div className="absolute right-3 bottom-3 z-[1000] flex flex-col gap-1.5 shadow-md">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          map.setView(position, 15, { animate: true });
          onRecenter();
        }}
        className="w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
        title="Reset & Center Pin"
        aria-label="Reset & Center Pin"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function MapComponent({
  position,
  locationName = 'Dhaka, Bangladesh',
  propertyTitle = 'Rental Property',
  rentAmount,
  category,
}: MapComponentProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'humanitarian' | 'topo'>('streets');
  const [zoomLevel] = useState(15);

  // Compute resolved coordinates (use passed coordinates or fallback to geocoding location)
  const resolvedPosition = useMemo<[number, number]>(() => {
    if (
      Array.isArray(position) &&
      position.length === 2 &&
      typeof position[0] === 'number' &&
      !isNaN(position[0]) &&
      typeof position[1] === 'number' &&
      !isNaN(position[1]) &&
      position[0] !== 0 &&
      position[1] !== 0
    ) {
      return position;
    }
    return getCoordinatesForLocation(locationName);
  }, [position, locationName]);

  const [lat, lng] = resolvedPosition;
  const formattedCoords = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

  // Copy coordinates handler
  const handleCopyCoords = () => {
    const text = `${lat}, ${lng}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Google Maps Directions link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  useEffect(() => {
    // Invalidate map size after mount
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => clearTimeout(timer);
  }, [resolvedPosition]);

  // Tile layer URLs
  const tileLayers = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    humanitarian: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by HOT',
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    },
  };

  return (
    <div className="space-y-3">
      {/* Top Map Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Coordinates badge with Copy */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-mono font-medium">{formattedCoords}</span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="ml-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Copy Latitude, Longitude"
          >
            {copiedCoords ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Actions: Map Layer Selector & External Navigation */}
        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                mapLayer === 'streets'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('humanitarian')}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                mapLayer === 'humanitarian'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              High-Detail
            </button>
          </div>

          {/* Open Directions in Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/80 shadow-2xs transition-all active:scale-95"
            title="Open precise location in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-emerald-500 opacity-70" />
          </a>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
        <MapContainer
          center={resolvedPosition}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          dragging={!L.Browser.mobile}
          {...({ tap: !L.Browser.mobile } as any)}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution={tileLayers[mapLayer].attribution}
            url={tileLayers[mapLayer].url}
          />
          <MapController position={resolvedPosition} zoom={zoomLevel} />
          <MapInternalControls position={resolvedPosition} onRecenter={() => {}} />

          <Marker position={resolvedPosition} icon={customBharaHobeIcon}>
            <Popup className="bharahobe-leaflet-popup">
              <div className="p-1 space-y-1.5 min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                    {propertyTitle}
                  </p>
                </div>

                {category && (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {category}
                  </span>
                )}

                <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="line-clamp-1">{locationName}</span>
                </div>

                {rentAmount !== undefined && (
                  <div className="pt-1 border-t border-slate-100 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Rent:</span>
                    <span className="font-bold text-emerald-700">৳{Number(rentAmount).toLocaleString('en-BD')}/mo</span>
                  </div>
                )}

                <div className="pt-1 flex gap-2 text-[10px]">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                  >
                    Google Maps ↗
                  </a>
                  <a
                    href={openStreetMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-700 underline"
                  >
                    OSM ↗
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Location Overlay Badge */}
        <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-white block leading-tight">
                {locationName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Verified Geographic Coordinates
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
