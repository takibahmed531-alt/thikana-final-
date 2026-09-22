import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Thikana Brand Pin Icon using L.divIcon
const customThikanaIcon = L.divIcon({
  className: 'thikana-custom-marker',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; items-center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(16, 185, 129, 0.25); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 32px; height: 32px; background: #059669; border: 3px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.193 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 36],
  popupAnchor: [0, -36],
});

interface MapComponentProps {
  position?: [number, number];
  locationName?: string;
  propertyTitle?: string;
}

export default function MapComponent({
  position = [23.7465, 90.376], // Default: Dhanmondi, Dhaka
  locationName = 'Road 9A, Dhanmondi, Dhaka',
  propertyTitle = 'Rental Property',
}: MapComponentProps) {
  useEffect(() => {
    // Invalidate map size after rendering to ensure proper tile coverage
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customThikanaIcon}>
          <Popup className="thikana-leaflet-popup">
            <div className="p-1 space-y-1">
              <p className="font-bold text-slate-900 text-xs leading-snug">{propertyTitle}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{locationName}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Location Overlay Badge */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">{locationName}</span>
        </div>
      </div>
    </div>
  );
}
