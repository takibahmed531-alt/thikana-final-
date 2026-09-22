import { Bookmark, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function SavedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-emerald-600" />
            Saved Properties
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Properties and rental units you have bookmarked for quick access.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <Bookmark className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-base font-semibold text-slate-800">No saved properties yet</h2>
          <p className="text-xs text-slate-500">
            Browse through listings on Thikana and click the bookmark icon to keep track of your favorite apartments.
          </p>
        </div>
        <div className="pt-2">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Explore Properties
          </NavLink>
        </div>
      </div>
    </div>
  );
}
