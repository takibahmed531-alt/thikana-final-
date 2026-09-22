import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, HelpCircle, Compass, LifeBuoy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Thikana<span className="text-emerald-600">.</span>
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              Trusted Rental Living in Bangladesh
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Link
            to="/faq"
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </Link>
          <Link
            to="/manual"
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>User Manual</span>
          </Link>
          <Link
            to="/privacy"
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/support"
            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Desk</span>
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} Thikana Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
