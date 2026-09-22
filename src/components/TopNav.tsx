import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
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
import { useLanguage } from '../context/LanguageContext';

export default function TopNav() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const navigate = useNavigate();
  const { user, publicProfile, openAuthModal, signOut, loading } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  // Sync search input state if the URL's q param updates externally
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:bg-emerald-700 transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white leading-none transition-colors duration-300">
              Thikana<span className="text-emerald-600">.</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 transition-colors duration-300">
              Rental Living
            </span>
          </div>
        </NavLink>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-lg relative"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors duration-300"
          />
        </form>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span>{t('home')}</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>{t('saved')}</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('messages')}</span>
            <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
              2
            </span>
          </NavLink>

          <NavLink
            to="/post-ad"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('postAd')}</span>
          </NavLink>

          {/* Bilingual Language Switcher [ EN / বাং ] */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold tracking-wide transition-colors duration-300 shadow-xs cursor-pointer select-none"
            title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <span
              className={
                language === 'en'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              EN
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-normal">/</span>
            <span
              className={
                language === 'bn'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              বাং
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 ml-1">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 border ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                      : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
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
                  {publicProfile?.displayName || user.displayName || t('profile')}
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors duration-300 cursor-pointer"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-300 shadow-sm shadow-emerald-600/20 ml-1 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t('signIn')}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
