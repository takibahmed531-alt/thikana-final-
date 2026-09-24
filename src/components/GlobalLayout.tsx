import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomTab from './BottomTab';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { updateUserLastActive } from '../services/authService';

export default function GlobalLayout() {
  const { user, isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();

  // Event-driven presence: update lastActive only upon initial app mount / authentication
  useEffect(() => {
    if (!user?.uid) return;
    updateUserLastActive(user.uid);
  }, [user?.uid]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200">
      {/* Desktop Top Navbar (hidden on mobile, visible md and up) */}
      <TopNav />

      {/* Main Content Area */}
      {/* pb-20 on mobile ensures bottom fixed tab bar does not overlap content */}
      <main className="flex-1 w-full pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Footer with Legal & Support Links */}
      <Footer />

      {/* Mobile Bottom Tab Bar (visible on mobile, hidden md and up) */}
      <BottomTab />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}
