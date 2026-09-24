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
import { bdLocations } from '../utils/locationData';
import { formatTimeAgo } from '../utils/timeUtils';

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
    '';

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
    postedTime: p.createdAt ? formatTimeAgo(p.createdAt) : 'Recently posted',
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
  const { t, translateCategory } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchDivision, setSearchDivision] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
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

  // Check if there is a q parameter in the URL and set searchDivision or searchArea state
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      // Check if q matches a division, otherwise set it to searchArea broadly
      if (Object.keys(bdLocations).includes(q)) {
        setSearchDivision(q);
      } else {
        setSearchArea(q);
      }
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
      const locationText = [searchArea, searchDistrict, searchDivision].filter(Boolean).join(', ') || 'All areas';
      const category = selectedCategory || 'All';
      await createSearchAlert(user.uid, locationText, category, {
        userEmail: user.email || '',
      });
      setAlertMessage({
        type: 'success',
        text: `Alert saved! We will send email notifications to ${user.email || 'your account'} when properties in "${locationText}" (${category}) become available.`,
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
    let isMounted = true;
    async function loadInitialProperties() {
      try {
        const res = await getProperties({ pageSize: 6 });
        if (isMounted && res.success && res.properties) {
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
    return () => {
      isMounted = false;
    };
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

  // Filter properties dynamically by 3-tier location and active category
  const filteredProperties = useMemo(() => {
    const allProps = [...liveProperties];

    return allProps.filter((prop) => {
      // Category match
      const categoryMatch =
        selectedCategory === 'All' ||
        prop.category.toLowerCase() === selectedCategory.toLowerCase();

      // Location match logic
      let locationMatch = true;
      const adLocation = prop.location.toLowerCase();
      
      if (searchDivision) {
        locationMatch = locationMatch && adLocation.includes(searchDivision.toLowerCase());
      }
      if (searchDistrict) {
        locationMatch = locationMatch && adLocation.includes(searchDistrict.toLowerCase());
      }
      if (searchArea) {
        // Allow text search to match either area or title
        locationMatch = locationMatch && (adLocation.includes(searchArea.toLowerCase()) || prop.title.toLowerCase().includes(searchArea.toLowerCase()));
      }

      // Check Ad ID search logic (keep existing fallback functionality but tie it to searchArea input)
      if (searchArea && /^(tk|thk|id:)/i.test(searchArea.trim())) {
          const cleanedSearch = searchArea.trim().toLowerCase().replace(/^id:\s*/i, '');
          const adIdLower = (prop.adId || '').toLowerCase();
          const fallbackAdId = prop.id ? `tk-${prop.id.replace(/[^a-z0-9]/g, '').slice(0, 6)}`.toLowerCase() : '';
          locationMatch = (adIdLower.length > 0 && (adIdLower === cleanedSearch || adIdLower.includes(cleanedSearch))) || 
                          (fallbackAdId.length > 0 && (fallbackAdId === cleanedSearch || fallbackAdId.includes(cleanedSearch)));
      }

      const genderMatch = filterGender === 'Any' || prop.genderPreference === filterGender;
      const occupationMatch =
        filterOccupation === 'Any' ||
        prop.occupationPreference === filterOccupation ||
        prop.occupationPreference === 'Any' ||
        !prop.occupationPreference;
      const minBudgetMatch = !filterMinRent || prop.rentAmount >= Number(filterMinRent);
      const maxBudgetMatch = !filterMaxRent || prop.rentAmount <= Number(filterMaxRent);

      return categoryMatch && locationMatch && genderMatch && occupationMatch && minBudgetMatch && maxBudgetMatch;
    });
  }, [searchDivision, searchDistrict, searchArea, selectedCategory, liveProperties, filterGender, filterOccupation, filterMinRent, filterMaxRent]);

  const handleClearLocation = () => {
    setSearchDivision('');
    setSearchDistrict('');
    setSearchArea('');
  };

  const hasActiveLocationFilter = Boolean(searchDivision || searchDistrict || searchArea);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* ---------------------------------------------------- */}
      {/* Task 2: Hero Section with 3-Tier Location Search Bar */}
      {/* ---------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('heroBadge')}</span>
          </div>

          {/* Welcoming Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {t('heroTitleStart')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {t('brandName')}
            </span>
            .
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {t('brandSlogan')}
          </p>

          {/* Structured 3-Tier Search Box (Division > District > Area / Keyword) */}
          <div className="pt-2 max-w-3xl space-y-2.5">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-xl border border-white/20 text-slate-900">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                {/* 1. Division Selector */}
                <div className="sm:col-span-4 relative">
                  <select
                    value={searchDivision}
                    onChange={(e) => {
                      setSearchDivision(e.target.value);
                      setSearchDistrict('');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-slate-900 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8"
                  >
                    <option value="">All Divisions (সকল বিভাগ)</option>
                    {Object.keys(bdLocations).map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                    ▼
                  </div>
                </div>

                {/* 2. District Selector */}
                <div className="sm:col-span-4 relative">
                  <select
                    value={searchDistrict}
                    disabled={!searchDivision}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-slate-900 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8 disabled:bg-slate-100/50 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {searchDivision ? 'All Districts (সকল জেলা)' : 'Select Division first'}
                    </option>
                    {searchDivision &&
                      bdLocations[searchDivision] &&
                      Object.keys(bdLocations[searchDivision]).map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                    ▼
                  </div>
                </div>

                {/* 3. Area / Keyword / Ad ID Search */}
                <div className="sm:col-span-4 relative flex items-center">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      placeholder="Area, title or Ad ID (e.g. TK-...)"
                      className="w-full pl-8 pr-7 py-2.5 bg-slate-100 hover:bg-slate-200/80 focus:bg-white transition-colors text-slate-900 placeholder-slate-400 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {searchArea && (
                      <button
                        type="button"
                        onClick={() => setSearchArea('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        aria-label="Clear area input"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons row inside search container */}
              <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-200/60 mt-2">
                <div className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                  {hasActiveLocationFilter ? (
                    <span className="font-semibold text-emerald-700">
                      Filtering: {[searchArea, searchDistrict, searchDivision].filter(Boolean).join(' • ')}
                    </span>
                  ) : (
                    <span>Browse properties across Bangladesh</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {hasActiveLocationFilter && (
                    <button
                      type="button"
                      onClick={handleClearLocation}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-medium"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showFilters || filterGender !== 'Any' || filterOccupation !== 'Any' || filterMinRent || filterMaxRent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Toggle Advanced Filters"
                    aria-label="Toggle Advanced Filters"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Conditionally Rendered Advanced Filter Panel */}
            {showFilters && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-150">
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
              {['Dhanmondi', 'Mohammadpur', 'Mirpur', 'Uttara', 'Banani', 'GEC Circle', 'Zindabazar'].map((area) => (
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
                  {translateCategory(cat)}
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
