import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Home,
  Bookmark,
  MessageSquare,
  PlusCircle,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, publicProfile, signInWithGoogle, signOut, loading } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">
              Thikana<span className="text-emerald-600">.</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
              Rental Living
            </span>
          </div>
        </NavLink>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-lg relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, area (e.g. Dhanmondi, Gulshan), or apartment..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </form>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
            <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
              2
            </span>
          </NavLink>

          <NavLink
            to="/post-ad"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Ad</span>
          </NavLink>

          {user ? (
            <div className="flex items-center gap-1.5 ml-1">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-200 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-emerald-600" />
                )}
                <span className="max-w-[100px] truncate text-xs font-semibold">
                  {publicProfile?.displayName || user.displayName || 'Profile'}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 ml-1 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Google Sign In</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
