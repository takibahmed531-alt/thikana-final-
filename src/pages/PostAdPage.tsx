import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createProperty } from '../services/propertyService';
import { PropertyCategory } from '../types';

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

export default function PostAdPage() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('apartment');
  const [location, setLocation] = useState('');
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

      const res = await createProperty(
        {
          title: title.trim(),
          rentAmount: Number(rentAmount),
          category,
          location: location.trim(),
          amenities: selectedAmenities,
          images: imagePreviews.length === 0 ? defaultImages : [],
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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-600" />
          Post a Rental Listing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Directly synced with Firestore database with schema validation and landlord ownership rules.
        </p>
      </div>

      {!user ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign in to Post Your Property</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            To prevent spam and maintain verified listings across Dhaka, landlords must authenticate
            with Google before posting ads.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-sm transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Sign In with Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern 3-BHK Apartment with Balcony in Dhanmondi"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Specific Location / Area *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Road 9A, Dhanmondi, Dhaka"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
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
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
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

          {/* Image Upload */}
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
