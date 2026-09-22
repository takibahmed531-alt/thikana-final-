import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  MapPin,
  Navigation,
  Mail,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { createProperty, generateShortAdId } from '../services/propertyService';
import { PropertyCategory, GenderPreference } from '../types';

// Fix for default Leaflet marker icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Thikana Brand Pin Icon using L.divIcon
const customThikanaPin = L.divIcon({
  className: 'thikana-map-pin',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(16, 185, 129, 0.3); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 32px; height: 32px; background: #059669; border: 3px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);">
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

const CATEGORIES: { value: PropertyCategory; label: string }[] = [
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'house', label: 'Full Independent House' },
  { value: 'family_unit', label: 'Family Unit' },
  { value: 'bachelor_sublet', label: 'Bachelor / Sublet Room' },
  { value: 'hostel', label: 'Student / Executive Hostel' },
  { value: 'commercial', label: 'Commercial Space / Office' },
];

const COMMON_AMENITIES = [
  'WiFi',
  'Lift / Elevator',
  '24/7 Generator',
  'CCTV Security',
  'Line Gas',
  'Reserved Car Parking',
  'Security Guard',
  'Waste Disposal',
  'Balcony',
];

// Default map center set to Dhaka
const DHAKA_DEFAULT_COORDINATES: [number, number] = [23.8103, 90.4125];

const DHAKA_NEIGHBORHOODS: { name: string; coords: [number, number] }[] = [
  { name: 'Dhanmondi', coords: [23.7465, 90.376] },
  { name: 'Gulshan 2', coords: [23.7925, 90.4078] },
  { name: 'Banani', coords: [23.7937, 90.4066] },
  { name: 'Uttara', coords: [23.8759, 90.3795] },
  { name: 'Mirpur 10', coords: [23.8069, 90.3687] },
  { name: 'Mohakhali', coords: [23.7776, 90.4054] },
];

// Helper to handle clicks on the Leaflet map and drop pin
function MapClickHandler({
  onSelectCoordinates,
}: {
  onSelectCoordinates: (coords: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      onSelectCoordinates([lat, lng]);
      map.panTo(e.latlng);
    },
  });
  return null;
}

// Helper to ensure Leaflet invalidates and resizes correctly on render
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Helper to smoothly fly map to selected neighborhood
function MapFlyController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 13 ? 13 : map.getZoom(), { duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function PostAdPage() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Evaluate if user is logged in but has an unverified non-phone email address
  const isUnverified = Boolean(
    user && !user.emailVerified && user.email && !user.email.endsWith('@thikana.app')
  );

  const [title, setTitle] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('apartment');
  const [location, setLocation] = useState('');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('Any');
  const [availableSeats, setAvailableSeats] = useState<string>('');
  const [coordinates, setCoordinates] = useState<[number, number]>(DHAKA_DEFAULT_COORDINATES);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'Lift / Elevator', 'CCTV Security']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please sign in before posting a property listing.');
      return;
    }

    if (!title.trim() || !rentAmount || !location.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Default curated high-res placeholder if no custom image was uploaded
      const defaultImages = [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ];

      // Parse availableSeats only when category is bachelor_sublet or hostel
      const isSharedCategory = category === 'bachelor_sublet' || category === 'hostel';
      const parsedSeats =
        isSharedCategory && availableSeats.trim() !== ''
          ? parseInt(availableSeats, 10)
          : undefined;

      const res = await createProperty(
        {
          adId: generateShortAdId(),
          title: title.trim(),
          rentAmount: Number(rentAmount),
          category,
          location: location.trim(),
          amenities: selectedAmenities,
          images: imagePreviews.length === 0 ? defaultImages : [],
          genderPreference,
          ...(parsedSeats !== undefined && !isNaN(parsedSeats) && parsedSeats >= 0
            ? { availableSeats: parsedSeats }
            : {}),
          status: 'available',
          coordinates,
        },
        imageFiles,
        user.uid
      );

      setSuccessMsg('Property listing created and stored in Firestore!');
      setTimeout(() => {
        navigate(`/property/${res.propertyId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error posting property:', err);
      setErrorMsg(err?.message || 'Failed to publish property listing to Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          Landlord Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Post a Property Listing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          List your apartment, house, bachelor sublet, or hostel room across Dhaka with verified security.
        </p>
      </div>

      {!user ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <KeyRound className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-amber-900 mb-1">Authentication Required</h2>
          <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
            To protect renters and ensure landlord verification, you must sign in with Google before publishing listings.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      ) : isUnverified ? (
        /* Email Verification Required Blocker UI */
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-6 sm:p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-950 mb-2">
              Email Verification Required
            </h2>
            <p className="text-sm text-amber-800/90 max-w-lg mx-auto leading-relaxed">
              To prevent spam and ensure trust, landlords must verify their email address before posting ads. Please verify your account to proceed.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Go to Profile to Resend Verification Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern 3-BHK Apartment with South-Facing Balcony"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
            />
          </div>

          {/* Rent and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Monthly Rent (BDT) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="e.g. 35000"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Accommodation Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task 1: Gender Preference & Conditionally Rendered Available Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender Preference Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Gender Preference *
              </label>
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value as GenderPreference)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
              >
                <option value="Any">Any (Family / Open to All)</option>
                <option value="Male">Male (Bachelors / Male Students)</option>
                <option value="Female">Female (Working Women / Female Students)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Specifies eligible tenant demographic for this accommodation.
              </p>
            </div>

            {/* Conditionally Rendered: Available Seats (only for bachelor_sublet or hostel) */}
            {(category === 'bachelor_sublet' || category === 'hostel') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Available Seats / Beds *</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    {category === 'hostel' ? 'Hostel Room' : 'Bachelor Sublet'}
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter number of vacant seats/beds available for rent.
                </p>
              </div>
            )}
          </div>

          {/* Location Area Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Specific Location / Area Name *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Road 9A, Dhanmondi, Dhaka"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
            />
          </div>

          {/* Task 2: Interactive Mini Map using react-leaflet */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Property Map Location (Interactive Pin) *
                </label>
                <p className="text-xs text-slate-500">
                  Click anywhere on the map to drop a pin. Map is centered on Dhaka by default.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-medium self-start sm:self-auto shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</span>
              </div>
            </div>

            {/* Quick Dhaka Neighborhood Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
                <Navigation className="w-3 h-3 text-emerald-600" /> Quick Areas:
              </span>
              {DHAKA_NEIGHBORHOODS.map((area) => (
                <button
                  type="button"
                  key={area.name}
                  onClick={() => setCoordinates(area.coords)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors border cursor-pointer ${
                    coordinates[0] === area.coords[0] && coordinates[1] === area.coords[1]
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
              <MapContainer
                center={coordinates}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizer />
                <MapFlyController center={coordinates} />
                <MapClickHandler onSelectCoordinates={(coords) => setCoordinates(coords)} />
                <Marker position={coordinates} icon={customThikanaPin} />
              </MapContainer>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Available Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Upload & Compression */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Property Photos
            </label>
            <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 block cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Click to upload photos</p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG or WebP. Automatically compressed under 200KB before upload.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Posting as: <strong className="text-slate-700">{user.displayName || user.email}</strong>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish to Thikana'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
