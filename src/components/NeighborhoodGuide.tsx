import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Stethoscope,
  TreePine,
  BusFront,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export interface NeighborhoodInsightsData {
  education: string[];
  healthcare: string[];
  recreation: string[];
  transportation: string[];
}

export interface NeighborhoodGuideProps {
  location?: string;
}

/**
 * NeighborhoodGuide component
 * Displays neighborhood insights for a given location in Dhaka covering
 * Education, Healthcare, Recreation, and Transportation.
 */
export default function NeighborhoodGuide({ location = 'Dhanmondi, Dhaka' }: NeighborhoodGuideProps) {
  const [data, setData] = useState<NeighborhoodInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchNeighborhoodInsights() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/gemini/neighborhood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location }),
        });

        if (response.ok) {
          const parsedData: NeighborhoodInsightsData = await response.json();
          if (
            Array.isArray(parsedData.education) &&
            Array.isArray(parsedData.healthcare) &&
            Array.isArray(parsedData.recreation) &&
            Array.isArray(parsedData.transportation)
          ) {
            if (isMounted) {
              setData(parsedData);
              setLoading(false);
            }
            return;
          }
        }

        throw new Error('Could not retrieve neighborhood insights');
      } catch (err: any) {
        console.warn('NeighborhoodGuide insights notice:', err?.message || err);
        // Fallback default
        if (isMounted) {
          setData({
            education: ['Local Govt. Degree College', 'Reputed High School', 'Primary Education Institute'],
            healthcare: ['General Hospital', 'Local Community Clinic', '24/7 Pharmacy'],
            recreation: ['Community Playground', 'Sector/Block Park', 'Local Walkway'],
            transportation: ['Main Road Bus Stand', 'City Transit Hub', 'Rickshaw/Auto Stand'],
          });
          setLoading(false);
        }
      }
    }

    if (location) {
      fetchNeighborhoodInsights();
    }

    return () => {
      isMounted = false;
    };
  }, [location, reloadKey]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Neighborhood Insights
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold tracking-wide uppercase">
                Area Guide
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Key amenities & connectivity around {location}
            </p>
          </div>
        </div>

        {!loading && (
          <button
            type="button"
            onClick={() => setReloadKey((prev) => prev + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Insights"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Insights Content Container */}
      <div className="min-h-[260px]">
        {/* Modern Pulsing Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse min-h-[240px]">
            {[1, 2, 3, 4].map((skeletonIndex) => (
              <div
                key={skeletonIndex}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 min-h-[200px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{error}</p>
                <p className="text-xs text-amber-700/90 dark:text-amber-400 mt-0.5">
                  Check connection and try refreshing again.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Insights 4-Column Grid: Education, Healthcare, Recreation, Transportation */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Section 1: Education */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Education</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Schools & Universities</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {data.education?.map((school, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{school}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 2: Healthcare */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Healthcare</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Hospitals & Diagnostic</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {data.healthcare?.map((hospital, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{hospital}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 3: Recreation */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recreation</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Parks, Lakes & Fields</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {data.recreation?.map((park, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{park}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 4: Transportation */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
                    <BusFront className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transportation</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Metro, Bus & Transit</p>
                  </div>
                </div>

                <ul className="space-y-2">
                  {data.transportation?.map((transit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{transit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
