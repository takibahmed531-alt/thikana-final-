import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Users,
  Building2,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Home,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800 text-center space-y-5">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Bhara Hobe • ভাড়া হবে প্ল্যাটফর্ম সম্পর্কে</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Simplifying Rental Living Across{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Bangladesh
            </span>
            .
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Bhara Hobe (ভাড়া হবে) is Bangladesh’s modern, verified, and zero-brokerage rental platform connecting landlords and tenants directly—without unfair middleman fees or misleading listings.
          </p>
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission (আমাদের লক্ষ্য)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To empower renters—families, bachelors, working professionals, and students—with genuine verified properties and direct landlord communication, ensuring no one has to deal with hidden fees or harassment.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision (আমাদের দৃষ্টিভঙ্গি)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To build the most trusted, tech-driven housing ecosystem in Bangladesh covering all 64 districts with digital agreements, verified landlord profiles, and transparent utility billing.
          </p>
        </div>
      </section>

      {/* Why Choose Bhara Hobe */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Why We Built Bhara Hobe
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Addressing common real-world rental challenges in Dhaka, Chattogram, and across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Zero Brokerage</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No media or broker commission. Talk directly with property owners and negotiate transparent rental terms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Verified Listings & IDs</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every property includes unique short IDs, authentic photos, map coordinates, and move-in dates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Bachelor & Sublet Friendly</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated filters for gender preferences (Male/Female/Any), occupation, available seats, and room sublets.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Our Core Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Transparency First:</strong>
              Clear utility terms (bills included vs excluded) and upfront deposit amounts.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Privacy Protected:</strong>
              Secure encrypted in-app messaging keeps your personal contact information confidential.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">64 Districts Coverage:</strong>
              Structured cascading location finder covering all divisions, districts, and thanas.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Instant Search Alerts:</strong>
              Get notified immediately whenever a property matching your exact area budget is listed.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Ready to find your next home or list a vacant unit?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Join thousands of tenants and landlords finding trusted accommodation today on {t('brandName')}.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Browse Listings
          </Link>
          <Link
            to="/post-ad"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all flex items-center gap-2"
          >
            Post Free Rental Ad
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
