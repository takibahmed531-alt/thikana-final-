import { useState, useMemo, useEffect } from 'react';
import { Search, X, Sparkles, Building, SlidersHorizontal, MapPin } from 'lucide-react';
import PropertyCard, { PropertyItem } from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';
import { PropertyListing } from '../types';

// Dummy dataset of 8 realistic rental listings in Bangladesh
const INITIAL_PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-1',
    title: 'Modern 3-BHK Family Flat with Rooftop Garden',
    rentAmount: 36000,
    location: 'Road 9A, Dhanmondi, Dhaka',
    category: 'Family Flat',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1650,
    postedTime: '2 hrs ago',
  },
  {
    id: 'prop-2',
    title: 'Furnished Bachelor Studio with High-Speed WiFi',
    rentAmount: 16500,
    location: 'Block C, Banani, Dhaka',
    category: 'Bachelor',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 520,
    postedTime: '5 hrs ago',
  },
  {
    id: 'prop-3',
    title: 'Executive Master Bedroom Sublet for Female Executive',
    rentAmount: 12000,
    location: 'Sector 7, Uttara, Dhaka',
    category: 'Sublet',
    isVerified: false,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 340,
    postedTime: '1 day ago',
  },
  {
    id: 'prop-4',
    title: 'Spacious 4-BHK Luxury South-Facing Flat',
    rentAmount: 52000,
    location: 'Mirpur DOHS, Dhaka',
    category: 'Family Flat',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 2200,
    postedTime: '1 day ago',
  },
  {
    id: 'prop-5',
    title: 'Single Seat in University Student Mess with Meal Facility',
    rentAmount: 5500,
    location: 'Block D, Bashundhara R/A, Dhaka',
    category: 'Mess',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 180,
    postedTime: '2 days ago',
  },
  {
    id: 'prop-6',
    title: 'Cozy 2-BHK Apartment near GEC Circle',
    rentAmount: 24000,
    location: 'Nasirabad, GEC Circle, Chattogram',
    category: 'Family Flat',
    isVerified: false,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    postedTime: '3 days ago',
  },
  {
    id: 'prop-7',
    title: 'Quiet Bachelor Suite near Zindabazar Hub',
    rentAmount: 11500,
    location: 'Kumarpara, Zindabazar, Sylhet',
    category: 'Bachelor',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 400,
    postedTime: '4 days ago',
  },
  {
    id: 'prop-8',
    title: 'Single Room Sublet with Attached Balcony',
    rentAmount: 9500,
    location: 'Japan Garden City, Mohammadpur, Dhaka',
    category: 'Sublet',
    isVerified: true,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 280,
    postedTime: '5 days ago',
  },
];

const CATEGORIES = ['All', 'Family Flat', 'Bachelor', 'Sublet', 'Mess'];

export default function HomePage() {
  const [searchArea, setSearchArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [liveProperties, setLiveProperties] = useState<PropertyItem[]>([]);

  useEffect(() => {
    async function loadFirestoreProperties() {
      try {
        const res = await getProperties({ pageSize: 20 });
        if (res.success && res.properties.length > 0) {
          const mapped: PropertyItem[] = res.properties.map((p: PropertyListing) => {
            let cat = 'Family Flat';
            if (p.category === 'bachelor_sublet') cat = 'Bachelor';
            else if (p.category === 'hostel') cat = 'Mess';
            else if (p.category === 'commercial') cat = 'Commercial';

            const firstImg =
              (p.images && p.images.length > 0 && p.images[0]) ||
              (p.imageUrls && p.imageUrls.length > 0 && p.imageUrls[0]) ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

            return {
              id: p.propertyId,
              title: p.title,
              rentAmount: p.rentAmount,
              location: p.location,
              category: cat,
              isVerified: true,
              imageUrl: firstImg,
              bedrooms: 3,
              bathrooms: 2,
              areaSqft: 1400,
              postedTime: 'Just now',
            };
          });
          setLiveProperties(mapped);
        }
      } catch (err) {
        console.warn('Could not load dynamic listings from Firestore:', err);
      }
    }

    loadFirestoreProperties();
  }, []);

  // Filter properties dynamically by search area and active category
  const filteredProperties = useMemo(() => {
    const allProps = [...liveProperties, ...INITIAL_PROPERTIES];
    return allProps.filter((prop) => {
      // Category match
      const categoryMatch =
        selectedCategory === 'All' ||
        prop.category.toLowerCase() === selectedCategory.toLowerCase();

      // Area / Location search match
      const searchMatch =
        !searchArea.trim() ||
        prop.location.toLowerCase().includes(searchArea.trim().toLowerCase()) ||
        prop.title.toLowerCase().includes(searchArea.trim().toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [searchArea, selectedCategory, liveProperties]);

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
            <span>Discover Verified Homes in Bangladesh</span>
          </div>

          {/* Welcoming Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Find your next rental home with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Thikana
            </span>
            .
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Search verified family apartments, bachelor pads, and sublets across Dhaka, Chattogram, and Sylhet with total privacy protection.
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
                placeholder="Search by area (e.g., Dhanmondi, Banani, Uttara, Mirpur)..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white/95 text-slate-900 placeholder-slate-400 rounded-2xl text-sm sm:text-base font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all border border-white/20"
              />

              {searchArea ? (
                <button
                  type="button"
                  onClick={() => setSearchArea('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Clear area search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Search className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-300">
              <span className="text-slate-400 font-medium">Popular areas:</span>
              {['Dhanmondi', 'Banani', 'Uttara', 'Mirpur', 'Bashundhara'].map((area) => (
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Explore by Category</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          /* Empty Search Fallback State */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Building className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No properties found</h3>
              <p className="text-xs text-slate-500">
                No listings matched "{searchArea || selectedCategory}". Try searching another area or clear your filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchArea('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
