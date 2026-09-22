import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById, deletePropertyListing } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  BadgeCheck,
  Bookmark,
  Share2,
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize2,
  Wifi,
  Zap,
  Flame,
  Shield,
  Car,
  Droplets,
  Layers,
  Calendar,
  MessageCircle,
  Lock,
  CheckCircle,
  Building,
  Camera,
  X,
  Send,
  ExternalLink,
  Users,
  User,
  Flag,
  Copy,
  Check,
  Trash2,
  Edit,
} from 'lucide-react';
import MapComponent from '../components/MapComponent';
import NeighborhoodGuide from '../components/NeighborhoodGuide';
import ReportModal from '../components/ReportModal';

// Detailed property dictionary with realistic Dhaka / Chattogram coordinates
const PROPERTY_DETAILS_DATA: Record<string, any> = {
  'prop-1': {
    id: 'prop-1',
    adId: 'TK-123456',
    title: 'Modern 3-BHK Family Flat with Rooftop Garden',
    rentAmount: 36000,
    depositAmount: 72000,
    location: 'Road 9A, Dhanmondi, Dhaka',
    coordinates: [23.7465, 90.376] as [number, number],
    category: 'Family Flat',
    status: 'available',
    genderPreference: 'Any',
    isVerified: true,
    availableFrom: '1st of Next Month',
    floor: '5th Floor (South Facing)',
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    areaSqft: 1650,
    postedTime: '2 hrs ago',
    description: `A thoughtfully designed 3-bedroom, 3-bathroom family apartment situated in the serene residential pocket of Road 9A, Dhanmondi. 
    
    This south-facing unit boasts ample natural cross-ventilation, expansive balconies overlooking tree-lined streets, and direct elevator access to a shared rooftop garden. Ideal for corporate executives and families looking for tranquility with immediate proximity to top schools, healthcare facilities, and Dhanmondi Lake.`,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'High-Speed WiFi Ready', icon: Wifi, available: true },
      { name: '24/7 Generator Backup', icon: Zap, available: true },
      { name: 'Government Gas Line', icon: Flame, available: true },
      { name: '24/7 CCTV & Security Guard', icon: Shield, available: true },
      { name: 'Dedicated Car Parking', icon: Car, available: true },
      { name: 'Dual Passenger Lift', icon: Building, available: true },
      { name: 'Continuous WASA Water', icon: Droplets, available: true },
      { name: 'Community Rooftop', icon: Layers, available: true },
    ],
    landlord: {
      name: 'Engr. Tariqul Islam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      memberSince: 'March 2023',
      responseRate: '98% Response Rate',
      responseTime: 'Replies within 30 mins',
      totalListings: 2,
    },
  },
  'prop-2': {
    id: 'prop-2',
    adId: 'THK-BAN02',
    title: 'Furnished Bachelor Studio with High-Speed WiFi',
    rentAmount: 16500,
    depositAmount: 16500,
    location: 'Block C, Banani, Dhaka',
    coordinates: [23.7937, 90.4043] as [number, number],
    category: 'Bachelor',
    status: 'available',
    genderPreference: 'Male',
    availableSeats: 1,
    isVerified: true,
    availableFrom: 'Immediate',
    floor: '3rd Floor',
    bedrooms: 1,
    bathrooms: 1,
    balconies: 1,
    areaSqft: 520,
    postedTime: '5 hrs ago',
    description: `Modern furnished bachelor studio designed for university students and tech professionals. Features dedicated high-speed optical fiber internet, workstation desk, attached washroom with geyser, and daily meal facilities optional.`,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: [
      { name: 'Dedicated High-Speed WiFi', icon: Wifi, available: true },
      { name: 'Full Power Backup', icon: Zap, available: true },
      { name: 'CCTV Guarded Entrance', icon: Shield, available: true },
      { name: 'WASA Water with Filter', icon: Droplets, available: true },
      { name: 'Elevator Access', icon: Building, available: true },
      { name: 'Weekly Housekeeping', icon: CheckCircle, available: true },
    ],
    landlord: {
      name: 'Tanvir Hossain',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      memberSince: 'January 2024',
      responseRate: '95% Response Rate',
      responseTime: 'Replies within an hour',
      totalListings: 3,
    },
  },
};

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'landlord',
      text: 'Assalamu Alaikum! Thanks for viewing my property. Feel free to ask any questions or request a physical viewing schedule.',
      time: 'Just now',
    },
  ]);

  const [firestoreProperty, setFirestoreProperty] = useState<any>(null);

  useEffect(() => {
    if (id && !PROPERTY_DETAILS_DATA[id]) {
      getPropertyById(id)
        .then((res) => {
          if (res.success && res.property) {
            const p = res.property;
            const imgs =
              p.images && p.images.length > 0
                ? p.images
                : p.imageUrls && p.imageUrls.length > 0
                ? p.imageUrls
                : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'];

            const mappedAmenities = (p.amenities || []).map((name: string) => ({
              name,
              icon: Wifi,
              available: true,
            }));

            setFirestoreProperty({
              id: p.propertyId,
              landlordUid: p.landlordUid,
              adId: p.adId,
              title: p.title,
              rentAmount: p.rentAmount,
              depositAmount: p.rentAmount * 2,
              location: p.location,
              coordinates:
                Array.isArray(p.coordinates) &&
                p.coordinates.length === 2 &&
                typeof p.coordinates[0] === 'number' &&
                typeof p.coordinates[1] === 'number'
                  ? (p.coordinates as [number, number])
                  : [23.7465, 90.376],
              category: p.category,
              status: p.status || 'available',
              genderPreference: p.genderPreference,
              availableSeats: p.availableSeats,
              isVerified: true,
              availableFrom: 'Available Now',
              floor: 'Upper Floor',
              bedrooms: 3,
              bathrooms: 2,
              balconies: 1,
              areaSqft: 1450,
              postedTime: 'Recently posted',
              description: `A newly published rental listing located at ${p.location}. Verified through Thikana real estate portal.`,
              images: imgs,
              amenities:
                mappedAmenities.length > 0
                  ? mappedAmenities
                  : [
                      { name: 'High-Speed WiFi Ready', icon: Wifi, available: true },
                      { name: 'Dual Passenger Lift', icon: Building, available: true },
                      { name: '24/7 CCTV & Security Guard', icon: Shield, available: true },
                    ],
              landlord: {
                name: 'Property Landlord',
                avatar:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                isVerified: true,
                memberSince: '2025',
                responseRate: '100% Response Rate',
                responseTime: 'Replies quickly',
                totalListings: 1,
              },
            });
          }
        })
        .catch(console.warn);
    }
  }, [id]);

  // Fallback to prop-1 if ID is not recognized
  const property = firestoreProperty || (id && PROPERTY_DETAILS_DATA[id]) || PROPERTY_DETAILS_DATA['prop-1'];

  const [copiedAdId, setCopiedAdId] = useState(false);

  // Backward compatibility: If adId is undefined for older dummy data, fall back to a slice of propertyId
  const effectiveAdId =
    property?.adId && property.adId.trim().length > 0
      ? property.adId.trim()
      : property?.id
      ? `THK-${property.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`
      : null;

  const effectiveChatId =
    property?.id === 'prop-2' ? 'c2' : property?.id === 'prop-3' ? 'c3' : 'c1';

  const handleCopyAdId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!effectiveAdId) return;
    navigator.clipboard.writeText(effectiveAdId);
    setCopiedAdId(true);
    setTimeout(() => {
      setCopiedAdId(false);
    }, 2000);
  };

  const formattedRent = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(property.rentAmount);

  const formattedDeposit = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(property.depositAmount || property.rentAmount * 2);

  const handleDeleteProperty = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this listing?');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deletePropertyListing(property.id);
      alert('Property deleted successfully!');
      navigate('/profile');
    } catch (err: any) {
      console.error('Delete Error:', err);
      alert('Failed to delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!chatMessage.trim()) return;

    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'user',
        text: chatMessage.trim(),
        time: 'Just now',
      },
    ]);
    setChatMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Navigation Bar: Back & Action Buttons */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </Link>

        <div className="flex items-center gap-2">
          {user?.uid === property.landlordUid && (
            <>
              <Link
                to={`/post-ad?edit=${property.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors shadow-sm cursor-pointer"
                title="Edit this listing"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Ad</span>
              </Link>

              <button
                type="button"
                onClick={handleDeleteProperty}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                title="Delete this listing"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete Ad'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${
              isSaved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 stroke-emerald-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: property.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50/60 text-slate-500 hover:text-rose-600 hover:border-rose-200 text-sm font-medium transition-colors shadow-sm cursor-pointer"
            title="Report this listing for fraud or violations"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Report Ad</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Task 1: Image Gallery Section                        */}
      {/* Mobile: Horizontal scrollable list                   */}
      {/* Desktop: Modern Grid (One large main, two smaller)   */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        {/* Mobile Horizontal Scrollable Gallery (Visible < lg) */}
        <div className="block lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
            {property.images.map((imgUrl: string, idx: number) => (
              <div
                key={idx}
                className="shrink-0 w-[85vw] sm:w-[70vw] aspect-[16/10] rounded-2xl overflow-hidden snap-center relative border border-slate-200 shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`${property.title} - photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                  {idx + 1} / {property.images.length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Modern Grid Gallery (Visible >= lg) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-[440px]">
          {/* Main Large Image (approx 66% width / 8 cols) */}
          <div className="col-span-8 h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer">
            <img
              src={property.images[selectedImageIndex] || property.images[0]}
              alt={property.title}
              className={`w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out ${
                property.status === 'rented' ? 'grayscale opacity-80' : ''
              }`}
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold">
                {property.category}
              </span>
              {id?.startsWith('prop-') && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/95 text-white text-xs font-bold">
                  DEMO
                </span>
              )}
              {property.status === 'rented' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600/95 backdrop-blur-md text-white text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Rented Out
                </span>
              )}
              {property.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white text-xs font-medium">
                  <BadgeCheck className="w-3.5 h-3.5 text-white" />
                  Verified Listing
                </span>
              )}
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>{property.images.length} High-Res Photos</span>
            </div>
          </div>

          {/* Right Column Stack of Two Smaller Images (approx 33% / 4 cols) */}
          <div className="col-span-4 grid grid-rows-2 gap-4 h-full">
            {property.images.slice(1, 3).map((imgUrl: string, idx: number) => {
              const actualIdx = idx + 1;
              const isSelected = selectedImageIndex === actualIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(actualIdx)}
                  className={`w-full h-full rounded-2xl overflow-hidden border relative group text-left transition-all ${
                    isSelected ? 'ring-2 ring-emerald-600 border-transparent' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Preview thumbnail ${actualIdx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Task 2: Responsive Content Layout                    */}
      {/* Mobile/Tablet: flex-col                              */}
      {/* Desktop: Left Col (~65%), Right Col (~35%)           */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ================================================== */}
        {/* Left Column (approx 65% width)                     */}
        {/* ================================================== */}
        <div className="w-full lg:w-[65%] space-y-8">
          {/* Header & Quick Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                {property.category}
              </span>

              {/* Rent Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                  property.status === 'rented'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    property.status === 'rented' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                {property.status === 'rented' ? 'Rented Out' : 'Available for Rent'}
              </span>

              {/* Gender Preference Badge */}
              {property.genderPreference && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200">
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Gender: <strong className="font-semibold text-slate-900">{property.genderPreference}</strong>
                  </span>
                </span>
              )}

              {/* Available Seats Badge (if defined) */}
              {property.availableSeats !== undefined && property.availableSeats !== null && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                  <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="font-semibold">{property.availableSeats}</strong>{' '}
                    {property.availableSeats === 1 ? 'Seat' : 'Seats'} Available
                  </span>
                </span>
              )}

              {/* Prominently styled Ad ID Badge with Copy action */}
              {effectiveAdId && (
                <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xs border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ad ID:</span>
                  <span className="font-mono font-bold text-amber-300 tracking-wide">{effectiveAdId}</span>
                  <button
                    type="button"
                    onClick={handleCopyAdId}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 active:scale-95"
                    title={copiedAdId ? 'Copied to clipboard!' : 'Copy Ad ID'}
                    aria-label="Copy Ad ID"
                  >
                    {copiedAdId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-sans font-bold text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
                    )}
                  </button>
                </div>
              )}

              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Available: {property.availableFrom}
              </span>
              <span className="text-xs text-slate-400">• Posted {property.postedTime}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug flex-1">
                {property.title}
              </h1>

              {/* Prominent Ad ID Reference Box with Copy near Title */}
              {effectiveAdId && (
                <div className="shrink-0 inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Listing ID</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tracking-wide">{effectiveAdId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAdId}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                    title={copiedAdId ? 'Copied to clipboard!' : 'Copy Listing ID'}
                    aria-label="Copy Listing ID"
                  >
                    {copiedAdId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{property.location}</span>
            </div>

            {/* Mobile Rent Display */}
            <div className="lg:hidden p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-900">৳{formattedRent}</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                Advance: ৳{formattedDeposit}
              </span>
            </div>
          </div>

          {/* Key Spatial Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-y border-slate-200">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <BedDouble className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bedrooms</p>
                <p className="text-sm font-bold text-slate-900">{property.bedrooms} Beds</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Bath className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Bathrooms</p>
                <p className="text-sm font-bold text-slate-900">{property.bathrooms} Baths</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Maximize2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Unit Size</p>
                <p className="text-sm font-bold text-slate-900">{property.areaSqft} sqft</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Floor Level</p>
                <p className="text-sm font-bold text-slate-900 truncate">{property.floor}</p>
              </div>
            </div>
          </div>

          {/* Detailed Property Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">About this Property</h2>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-slate-200">
              {property.description}
            </div>
          </div>

          {/* List of Amenities */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Amenities & Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities.map((amenity: any, idx: number) => {
                const Icon = amenity.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5 hover:border-emerald-200 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-800">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Task 4: Interactive Leaflet Map View             */}
          {/* ------------------------------------------------ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Location & Neighborhood</h2>
                <p className="text-xs text-slate-500">Precise location pin with interactive map navigation</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Leaflet OpenStreetMap
              </span>
            </div>

            <MapComponent
              position={
                Array.isArray(property.coordinates) &&
                property.coordinates.length === 2 &&
                typeof property.coordinates[0] === 'number' &&
                typeof property.coordinates[1] === 'number'
                  ? property.coordinates
                  : [23.7465, 90.376]
              }
              locationName={property.location || 'Dhaka, Bangladesh'}
              propertyTitle={property.title || 'Rental Property'}
            />

            {/* Smart AI Neighborhood Guide */}
            <div className="pt-2">
              <NeighborhoodGuide location={property.location} />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* Right Column (approx 35% width) - Sticky Sidebar   */}
        {/* ================================================== */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 space-y-6">
          {/* Rent & Advance Pricing Card (Desktop) */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-3xl font-black text-slate-900">৳{formattedRent}</span>
                <span className="text-xs font-medium text-slate-500 ml-1.5">/ month</span>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Direct Landlord
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security Advance:</span>
                <span className="font-semibold text-slate-800">৳{formattedDeposit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Service & Gas Charge:</span>
                <span className="font-semibold text-slate-800">Included</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Minimum Lease:</span>
                <span className="font-semibold text-slate-800">6 Months</span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ */}
          {/* Task 3: Landlord Profile & Privacy-First CTA     */}
          {/* ------------------------------------------------ */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Landlord Header */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={property.landlord.avatar}
                  alt={property.landlord.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-sm"
                />
                {property.landlord.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 text-base">{property.landlord.name}</h3>
                  {property.landlord.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500">Property Owner & Host</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span>Verified Identity (NID)</span>
                </div>
              </div>
            </div>

            {/* Landlord Reliability Stats */}
            <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">{property.landlord.responseRate}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{property.landlord.responseTime}</p>
              </div>
              <div className="border-l border-slate-200">
                <p className="text-xs font-bold text-slate-800">{property.landlord.totalListings} Active Listings</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Member since {property.landlord.memberSince}</p>
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Privacy Safeguard:</strong> Phone numbers are kept confidential to prevent spam. Use Thikana's secure in-app messaging to negotiate and schedule physical visits.
              </p>
            </div>

            {/* Primary CTA Button: Chat with Landlord */}
            {user?.uid !== property?.landlordUid ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Quick Chat with Landlord</span>
                </button>

                <Link
                  to={`/messages?chatId=${effectiveChatId}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <span>Open Full Messenger</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Ad</span>
                </button>
              </div>
            ) : (
              <div className="p-6 mt-8 text-center text-sm font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-xl">
                This is your own property listing. You cannot send messages to yourself.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Report & Fraud Detection Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={property.id || id || 'prop-1'}
        targetType="property"
      />

      {/* ---------------------------------------------------- */}
      {/* Privacy-First In-App Chat Modal                      */}
      {/* ---------------------------------------------------- */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[580px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={property.landlord.avatar}
                  alt={property.landlord.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                />
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    {property.landlord.name}
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-emerald-300">Online • Re: {property.title.slice(0, 24)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to={`/messages?chatId=${effectiveChatId}`}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Expand to Full Messenger"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              {[
                'Is this flat still available?',
                'Can I schedule a visit this weekend?',
                'Is the rent slightly negotiable?',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!user}
                  onClick={() => {
                    if (!user) return;
                    setChatMessage(suggestion);
                  }}
                  className={`shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 transition-colors ${
                    !user ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 cursor-pointer'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Guest Sign In Prompt */}
            {!user && (
              <div className="px-3.5 py-2 bg-emerald-50/90 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                <span className="font-medium">Sign in to message this landlord</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={!user}
                placeholder={!user ? 'Please sign in to send messages...' : 'Type your message to the owner...'}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none transition-all border ${
                  !user
                    ? 'bg-slate-100 text-slate-400 placeholder-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-600 border-slate-200'
                }`}
              />
              <button
                type="submit"
                disabled={!user || !chatMessage.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
