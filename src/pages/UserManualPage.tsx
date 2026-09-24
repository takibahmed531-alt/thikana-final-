import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  MessageSquare,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Bookmark,
  Camera,
  Filter,
  Eye,
  KeyRound
} from 'lucide-react';

export default function UserManualPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'search' | 'chat' | 'post'>('all');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
          <Compass className="w-3.5 h-3.5" />
          Step-by-Step User Manual
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How to Use Bhara Hobe
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Master the complete rental lifecycle: from smart property searching and safe tenant-landlord messaging to publishing high-visibility listings.
        </p>
      </div>

      {/* Workflow Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Complete Manual
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>1. Search &amp; Filter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>2. Chat Securely</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('post')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'post'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>3. Post Rental Ad</span>
        </button>
      </div>

      {/* Timeline Container */}
      <div className="space-y-16">
        {/* PHASE 1: SEARCH & DISCOVER */}
        {(activeTab === 'all' || activeTab === 'search') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                1
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Searching &amp; Filtering Properties
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Find the ideal home or sublet tailored to your budget, area, and living preferences.
                </p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 dark:border-blue-900/60 space-y-8">
              {/* Step 1.1 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  A
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Filter className="w-4 h-4" />
                    <span>Select Rental Category &amp; Budget Range</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Filter by property type: <strong>Bachelor / Sublet</strong>, <strong>Family Apartment</strong>, <strong>Hostel Seat</strong>, or <strong>Commercial Space</strong>. Use the rent slider to set maximum monthly rates in BDT.
                  </p>
                </div>
              </div>

              {/* Step 1.2 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  B
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Search className="w-4 h-4" />
                    <span>Area Keywords &amp; Quick Ad ID Lookup</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Search by neighborhood name (e.g. <em>Dhanmondi, Bashundhara, Mirpur</em>) or enter a 6-character short Ad ID directly in the search bar to jump straight to a specific listing.
                  </p>
                </div>
              </div>

              {/* Step 1.3 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  C
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Bookmark className="w-4 h-4" />
                    <span>Save Favorites for Side-by-Side Comparison</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Click the bookmark icon on any card to save it to your <strong>Saved Collection</strong>. Access your saved list from the top navigation to compare prices and amenities without re-searching.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PHASE 2: CHAT SECURELY */}
        {(activeTab === 'all' || activeTab === 'chat') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                2
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Communicating &amp; Chatting Securely
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Interact directly with landlords through Bhara Hobe&apos;s encrypted messaging system.
                </p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 dark:border-emerald-900/60 space-y-8">
              {/* Step 2.1 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  A
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Initiate Chat from the Listing Page</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Click <strong>&quot;Chat with Landlord&quot;</strong> on any active listing. This creates an isolated conversation with the property details attached, allowing you to ask questions about move-in dates and utility bills.
                  </p>
                </div>
              </div>

              {/* Step 2.2 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  B
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Schedule an In-Person Property Inspection</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Coordinate a physical viewing time. Always inspect water pressure, natural ventilation, electrical sockets, security guards, and neighborhood surroundings in broad daylight.
                  </p>
                </div>
              </div>

              {/* Golden Safety Box */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>CRITICAL SAFETY RULE: Zero Advance Booking Transfers</span>
                </div>
                <p className="leading-relaxed">
                  Never send booking deposits or advance rents via bKash, Nagad, or bank wire before visiting the property in person and verifying the landlord&apos;s physical presence and legitimate tenancy contract.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PHASE 3: POST A PROPERTY LISTING */}
        {(activeTab === 'all' || activeTab === 'post') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base">
                3
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Posting &amp; Managing Rental Ads
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Step-by-step instructions for landlords and hosts to list and rent rooms quickly.
                </p>
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-purple-200 dark:border-purple-900/60 space-y-8">
              {/* Step 3.1 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  A
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Account &amp; Ensure Verified Status</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    To safeguard tenants from fake listings, landlords must have a verified email address. If unverified, visit your Profile page and click the verification dispatch banner before posting.
                  </p>
                </div>
              </div>

              {/* Step 3.2 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  B
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <Building className="w-4 h-4" />
                    <span>Fill Property Specifics &amp; Amenities</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Provide title, rental price (BDT), detailed area address, gender preferences (Any, Male, or Female), and toggle amenities such as Generator, Lift, Gas Supply, WiFi, and Balcony.
                  </p>
                </div>
              </div>

              {/* Step 3.3 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  C
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <Camera className="w-4 h-4" />
                    <span>Upload Authentic Photos &amp; Publish</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Upload multiple bright photos of bedrooms, washrooms, and kitchen. Once published, your listing receives an instant short Ad ID and appears at the top of the search directory!
                  </p>
                </div>
              </div>

              {/* Step 3.4 */}
              <div className="relative">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-slate-50 dark:ring-slate-950">
                  D
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Manage Status (Available vs. Rented)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Once you finalize a tenant, toggle the listing status to <strong>&quot;Rented&quot;</strong> in your Profile to pause new messages while keeping your listing history intact.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Pro Tips Box */}
      <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2">
          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Bhara Hobe Pro Tips for Faster Results</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span>Landlords who list complete utility breakdown receive 60% fewer repetitive inquiries.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span>Tenants with verified profiles receive faster responses from premium landlords.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span>Always confirm notice periods and security deposit refund terms in writing.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
            <span>Use the search alert feature to receive updates when matching flats are listed.</span>
          </li>
        </ul>
      </div>

      {/* Action Footer */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Ready to put this guide into practice?
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Explore Properties
          </Link>
          <Link
            to="/post-ad"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Post an Ad Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
