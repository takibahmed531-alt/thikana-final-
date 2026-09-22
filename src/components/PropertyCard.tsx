import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Bookmark, BedDouble, Bath, Maximize2, Users, User } from 'lucide-react';

export interface PropertyItem {
  id: string;
  adId?: string;
  title: string;
  rentAmount: number;
  location: string;
  category: string;
  isVerified?: boolean;
  isDemo?: boolean;
  imageUrl: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  postedTime?: string;
  genderPreference?: 'Any' | 'Male' | 'Female' | string;
  availableSeats?: number;
  status?: 'available' | 'rented' | string;
  coordinates?: [number, number];
}

interface PropertyCardProps {
  property: PropertyItem;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
}

export default function PropertyCard({
  property,
  onSaveToggle,
  isSaved = false,
}: PropertyCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [imgError, setImgError] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    if (onSaveToggle) {
      onSaveToggle(property.id);
    }
  };

  const isRented = property.status === 'rented';

  // Backward-compatible Ad ID formatting (e.g., 'ID: TK-123456' or fallback to sliced property ID)
  const rawAdId =
    property.adId && property.adId.trim().length > 0
      ? property.adId.trim()
      : property.id
      ? `TK-${property.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`
      : null;

  const displayAdId = rawAdId
    ? rawAdId.toUpperCase().startsWith('ID:')
      ? rawAdId
      : `ID: ${rawAdId}`
    : null;

  const formattedRent = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(property.rentAmount);

  return (
    <Link
      to={`/property/${property.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col hover:-translate-y-1 block relative"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            imgError || !property.imageUrl
              ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
              : property.imageUrl
          }
          alt={property.title}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            isRented ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Visual Overlay if Rented Out */}
        {isRented && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-600/95 text-white text-xs font-bold uppercase tracking-wider shadow-lg border border-white/30 backdrop-blur-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Rented Out
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Category Pill Tag & Status & Ad ID */}
        <div className="absolute top-3 left-3 right-14 flex items-center gap-1.5 z-20 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[11px] font-semibold text-slate-800 shadow-sm border border-white/40">
            {property.category}
          </span>

          {property.isDemo && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/95 text-white text-[11px] font-bold shadow-sm border border-amber-400">
              DEMO
            </span>
          )}

          {displayAdId && (
            <span
              className="px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md text-[10px] font-mono font-medium text-slate-200 border border-white/20 shadow-sm tracking-wide"
              title={`Property Ad ID: ${property.adId || property.id}`}
            >
              {displayAdId}
            </span>
          )}

          {/* Rented Out Pill Tag */}
          {isRented && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-600/95 backdrop-blur-md text-white text-[11px] font-bold shadow-sm border border-rose-500/40">
              Rented Out
            </span>
          )}

          {/* Verified Badge */}
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-medium shadow-sm border border-emerald-500/40">
              <BadgeCheck className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Bookmark / Save Action Button */}
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            saved
              ? 'bg-emerald-600 text-white shadow-md scale-105'
              : 'bg-black/30 hover:bg-black/50 text-white hover:scale-105'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              saved ? 'fill-white stroke-white' : 'stroke-white'
            }`}
          />
        </button>

        {/* Rent Tag on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between z-20">
          <div className="text-white drop-shadow-sm">
            <span className="text-xl font-bold tracking-tight">৳{formattedRent}</span>
            <span className="text-xs font-medium text-slate-200 ml-1">/ month</span>
          </div>
          {property.postedTime && (
            <span className="text-[11px] text-slate-200/90 drop-shadow-sm">
              {property.postedTime}
            </span>
          )}
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          {/* Location with Pin */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>

        {/* Key Spatial Specs & Rental Demographic Meta */}
        {(property.bedrooms !== undefined ||
          property.bathrooms !== undefined ||
          property.areaSqft !== undefined ||
          property.genderPreference ||
          (property.availableSeats !== undefined && property.availableSeats !== null)) && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-slate-600 text-xs font-medium">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}

            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}

            {property.areaSqft !== undefined && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.areaSqft} sqft</span>
              </div>
            )}

            {/* Gender Preference Indicator */}
            {property.genderPreference && (
              <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-150">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{property.genderPreference}</span>
              </div>
            )}

            {/* Available Seats Indicator */}
            {property.availableSeats !== undefined && property.availableSeats !== null && (
              <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {property.availableSeats} {property.availableSeats === 1 ? 'Seat' : 'Seats'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
