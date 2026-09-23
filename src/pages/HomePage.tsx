import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Sparkles,
  Building,
  SlidersHorizontal,
  MapPin,
  Loader2,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import PropertyCard, { PropertyItem } from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';
import { createSearchAlert } from '../services/alertService';
import { useAuth } from '../context/AuthContext';
import { PropertyListing } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Dummy dataset of 8 realistic rental listings in Bangladesh
const INITIAL_PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-1',
    adId: 'TK-123456',
    title: 'Modern 3-BHK Family Flat with Rooftop Garden',
    rentAmount: 36000,
    location: 'Road 9A, Dhanmondi, Dhaka',
    category: 'Family Flat',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1650,
    postedTime: '2 hrs ago',
    genderPreference: 'Any',
    status: 'available',
  },
  {
    id: 'prop-2',
    adId: 'TK-204512',
    title: 'Furnished Bachelor Studio with High-Speed WiFi',
    rentAmount: 16500,
    location: 'Block C, Banani, Dhaka',
    category: 'Bachelor',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 520,
    postedTime: '5 hrs ago',
    genderPreference: 'Male',
    status: 'available',
  },
  {
    id: 'prop-3',
    adId: 'TK-308921',
    title: 'Executive Master Bedroom Sublet for Female Executive',
    rentAmount: 12000,
    location: 'Sector 7, Uttara, Dhaka',
    category: 'Sublet',
    isVerified: false,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 340,
    postedTime: '1 day ago',
    genderPreference: 'Female',
    status: 'available',
  },
  {
    id: 'prop-4',
    adId: 'TK-410293',
    title: 'Spacious 4-BHK Luxury South-Facing Flat',
    rentAmount: 52000,
    location: 'Mirpur DOHS, Dhaka',
    category: 'Family Flat',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 2200,
    postedTime: '1 day ago',
    status: 'available',
  },
  {
    id: 'prop-5',
    adId: 'TK-512944',
    title: 'Single Seat in University Student Mess with Meal Facility',
    rentAmount: 5500,
    location: 'Block D, Bashundhara R/A, Dhaka',
    category: 'Mess',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 180,
    postedTime: '2 days ago',
    genderPreference: 'Male',
    availableSeats: 2,
    status: 'available',
  },
  {
    id: 'prop-6',
    adId: 'TK-619842',
    title: 'Cozy 2-BHK Apartment near GEC Circle',
    rentAmount: 24000,
    location: 'Nasirabad, GEC Circle, Chattogram',
    category: 'Family Flat',
    isVerified: false,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    postedTime: '3 days ago',
    status: 'rented',
  },
  {
    id: 'prop-7',
    adId: 'TK-724185',
    title: 'Quiet Bachelor Suite near Zindabazar Hub',
    rentAmount: 11500,
    location: 'Kumarpara, Zindabazar, Sylhet',
    category: 'Bachelor',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 400,
    postedTime: '4 days ago',
    genderPreference: 'Male',
    status: 'available',
  },
  {
    id: 'prop-8',
    adId: 'TK-831950',
    title: 'Single Room Sublet with Attached Balcony',
    rentAmount: 9500,
    location: 'Japan Garden City, Mohammadpur, Dhaka',
    category: 'Sublet',
    isVerified: true,
    isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 280,
    postedTime: '5 days ago',
    genderPreference: 'Female',
    status: 'rented',
  },
];

const CATEGORIES = ['All', 'Family Flat', 'Bachelor', 'Sublet', 'Mess'];

function mapListingToPropertyItem(p: PropertyListing): PropertyItem {
  let cat = 'Family Flat';
  const rawCat = (p.category as string || '').toLowerCase();
  if (rawCat === 'bachelor_sublet' || rawCat === 'bachelor') cat = 'Bachelor';
  else if (rawCat === 'hostel' || rawCat === 'mess') cat = 'Mess';
  else if (rawCat === 'commercial') cat = 'Commercial';
  else if (rawCat === 'sublet') cat = 'Sublet';
  else if (rawCat === 'apartment' || rawCat === 'family_unit' || rawCat === 'house' || rawCat === 'family flat') cat = 'Family Flat';

  const firstImg =
    (p.images && p.images.length > 0 && p.images[0]) ||
    (p.imageUrls && p.imageUrls.length > 0 && p.imageUrls[0]) ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

  return {
    id: p.propertyId,
    adId: p.adId,
    title: p.title,
    rentAmount: p.rentAmount,
    location: p.location,
    category: cat,
    isVerified: true,
    imageUrl: firstImg,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaSqft: p.areaSqft,
    postedTime: 'Just now',
    genderPreference: p.genderPreference,
    occupationPreference: p.occupationPreference,
    minAge: p.minAge,
    maxAge: p.maxAge,
    availableSeats: p.availableSeats,
    status: p.status || 'available',
    coordinates: p.coordinates,
  };
}

export default function HomePage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchArea, setSearchArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState('Any');
  const [filterOccupation, setFilterOccupation] = useState('Any');
  const [filterMinRent, setFilterMinRent] = useState('');
  const [filterMaxRent, setFilterMaxRent] = useState('');
  const [liveProperties, setLiveProperties] = useState<PropertyItem[]>([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Check if there is a q parameter in the URL and set the searchArea state to that value automatically on page load
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchArea(q);
    }
  }, [searchParams]);

  // Authentication & Smart Search Alert state
  const { user, signInWithGoogle } = useAuth();
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'auth';
    text: string;
  } | null>(null);

  const handleCreateAlert = async () => {
    if (!user) {
      setAlertMessage({
        type: 'auth',
        text: 'Please sign in to save this smart alert and get notified when homes match your search.',
      });
      return;
    }

    setAlertSubmitting(true);
    setAlertMessage(null);

    try {
      const area = searchArea.trim() || 'All areas';
      const category = selectedCategory || 'All';
      await createSearchAlert(user.uid, area, category, {
        userEmail: user.email || '',
      });
      setAlertMessage({
        type: 'success',
        text: `Alert saved! We will send email notifications to ${user.email || 'your account'} when properties in "${area}" (${category}) become available.`,
      });
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setAlertMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 5000);
    } catch (err: any) {
      setAlertMessage({
        type: 'error',
        text: err?.message || 'Failed to set search alert. Please try again.',
      });
    } finally {
      setAlertSubmitting(false);
    }
  };

  useEffect(() => {
    async function loadInitialProperties() {
      try {
        const res = await getProperties({ pageSize: 6 });
        if (res.success && res.properties) {
          const mapped = res.properties.map(mapListingToPropertyItem);
          setLiveProperties(mapped);
          setLastVisibleDoc(res.lastDoc);
          setHasMore(res.hasMore);
        }
      } catch (err) {
        console.warn('Could not load dynamic listings from Firestore:', err);
      }
    }

    loadInitialProperties();
  }, []);

  const handleLoadMore = async () => {
    if (!lastVisibleDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getProperties({ pageSize: 6 }, lastVisibleDoc);
      if (res.success && res.properties) {
        const mapped = res.properties.map(mapListingToPropertyItem);
        setLiveProperties((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNew = mapped.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNew];
        });
        setLastVisibleDoc(res.lastDoc);
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Error loading more properties:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter properties dynamically by search area and active category
  const filteredProperties = useMemo(() => {
    const allProps = [...liveProperties, ...INITIAL_PROPERTIES];
    const query = searchArea.trim();
    const lowerQuery = query.toLowerCase();

    // Check if searchArea starts with 'TK-' or matches an adId pattern (e.g. TK-, THK-, ID: TK-, or XX-XXXX)
    const isAdIdSearch =
      lowerQuery.startsWith('tk-') ||
      lowerQuery.startsWith('thk-') ||
      lowerQuery.startsWith('id:') ||
      /^(tk|thk)[-_]?[a-z0-9]+/i.test(lowerQuery) ||
      /^[a-z]{2,4}-\d{3,}/i.test(lowerQuery);

    return allProps.filter((prop) => {
      // Category match
      const categoryMatch =
        selectedCategory === 'All' ||
        prop.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search match
      let searchMatch = true;
      if (query) {
        if (isAdIdSearch) {
          const cleanedSearch = lowerQuery.replace(/^id:\s*/i, '').trim();
          const adIdLower = (prop.adId || '').toLowerCase();

          // Backward compatibility fallback for older items without adId
          const fallbackAdId = prop.id
            ? `tk-${prop.id.replace(/[^a-z0-9]/g, '').slice(0, 6)}`.toLowerCase()
            : '';

          searchMatch =
            (adIdLower.length > 0 && (adIdLower === cleanedSearch || adIdLower.includes(cleanedSearch))) ||
            (fallbackAdId.length > 0 && (fallbackAdId === cleanedSearch || fallbackAdId.includes(cleanedSearch)));
        } else {
          // If the search string is not an ID, continue to filter by location and title as it currently does
          searchMatch =
            prop.location.toLowerCase().includes(lowerQuery) ||
            prop.title.toLowerCase().includes(lowerQuery);
        }
      }

      const genderMatch = filterGender === 'Any' || prop.genderPreference === filterGender;
      const occupationMatch =
        filterOccupation === 'Any' ||
        prop.occupationPreference === filterOccupation ||
        prop.occupationPreference === 'Any' ||
        !prop.occupationPreference;
      const minBudgetMatch = !filterMinRent || prop.rentAmount >= Number(filterMinRent);
      const maxBudgetMatch = !filterMaxRent || prop.rentAmount <= Number(filterMaxRent);

      return categoryMatch && searchMatch && genderMatch && occupationMatch && minBudgetMatch && maxBudgetMatch;
    });
  }, [searchArea, selectedCategory, liveProperties, filterGender, filterOccupation, filterMinRent, filterMaxRent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* ---------------------------------------------------- */}
      {/* Task 2: Hero Section with Search Bar                */}
      {/* ---------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Welcoming Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {t('heroTitleStart')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Thikana
            </span>
            .
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Search Input Field (to search by area) */}
          <div className="pt-2 max-w-2xl">
            <div className="relative flex items-center shadow-lg">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>

              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                placeholder={t('homeSearchPlaceholder')}
                className="w-full pl-12 pr-32 py-3.5 sm:py-4 bg-white/95 text-slate-900 placeholder-slate-400 rounded-2xl text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all border border-white/20"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchArea && (
                  <button
                    type="button"
                    onClick={() => setSearchArea('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Clear area search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  className="p-2 rounded-xl border bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm transition-all cursor-pointer"
                  title="Search"
                  onClick={(e) => {
                    e.preventDefault();
                    (document.activeElement as HTMLElement)?.blur();
                  }}
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showFilters || filterGender !== 'Any' || filterOccupation !== 'Any' || filterMinRent || filterMaxRent
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                  title="Toggle Advanced Filters"
                  aria-label="Toggle Advanced Filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conditionally Rendered Advanced Filter Panel */}
            {showFilters && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Gender Preference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                    Gender Preference
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full bg-white/95 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  >
                    <option value="Any">Any Gender</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>

                {/* Occupation Preference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                    Occupation Preference
                  </label>
                  <select
                    value={filterOccupation}
                    onChange={(e) => setFilterOccupation(e.target.value)}
                    className="w-full bg-white/95 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                  >
                    <option value="Any">Any Occupation</option>
                    <option value="Student">Student</option>
                    <option value="Job Holder">Job Holder</option>
                  </select>
                </div>

                {/* Min Rent */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                    Min Rent (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min BDT (e.g. 5000)"
                    value={filterMinRent}
                    onChange={(e) => setFilterMinRent(e.target.value)}
                    className="w-full bg-white/95 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder-slate-400"
                  />
                </div>

                {/* Max Rent */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">
                    Max Rent (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max BDT (e.g. 35000)"
                    value={filterMaxRent}
                    onChange={(e) => setFilterMaxRent(e.target.value)}
                    className="w-full bg-white/95 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">{t('popularAreas')}</span>
              {['Dhanmondi', 'Mohammadpur', 'Mirpur', 'Uttara', 'Banani', 'Badda', 'Farmgate'].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSearchArea(area)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    searchArea.toLowerCase() === area.toLowerCase()
                      ? 'bg-emerald-500 text-white font-semibold'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Task 3: Horizontal Scrollable Category Tabs          */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t('exploreCategory')}</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>

        {/* Scrollable Container */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* Task 4: Responsive Property Grid                     */}
      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3/4 cols     */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-6">
        {filteredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>

            {/* Load More Properties Button */}
            {hasMore && (
              <div className="flex justify-center pt-4 pb-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm hover:shadow transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>Loading more properties...</span>
                    </>
                  ) : (
                    <span>Load More Properties</span>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty Search Fallback State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-md mx-auto space-y-5 shadow-sm transition-colors duration-300">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
              <Building className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No properties found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No listings matched "{searchArea || selectedCategory}". Try searching another area or clear your filters.
              </p>
            </div>

            {/* Alert Notification Feedback Message */}
            {alertMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 text-left transition-all ${
                  alertMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : alertMessage.type === 'auth'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {alertMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : alertMessage.type === 'auth' ? (
                  <Bell className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="leading-relaxed">{alertMessage.text}</p>
                  {alertMessage.type === 'auth' && (
                    <button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="inline-block font-semibold text-emerald-700 dark:text-emerald-400 underline hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      Sign In with Google
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchArea('');
                  setSelectedCategory('All');
                  setAlertMessage(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>

              {/* Task 3: Secondary Button 'Notify Me When Available' with Bell icon */}
              <button
                type="button"
                onClick={handleCreateAlert}
                disabled={alertSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-75"
              >
                {alertSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Alert...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify Me When Available</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
