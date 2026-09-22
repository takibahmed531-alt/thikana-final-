import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bookmark, MessageSquare, PlusCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToUserConversations } from '../services/chatService';

export default function BottomTab() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [hasMsgs, setHasMsgs] = useState(false);

  // Subscribe to user conversations to show real-time unread/active message indicator
  useEffect(() => {
    if (!user?.uid) {
      setHasMsgs(false);
      return;
    }
    const unsubscribe = subscribeToUserConversations(
      user.uid,
      (convs) => {
        const lastSeen = Number(localStorage.getItem('lastSeenChatTime') || 0);
        const hasNew = convs.some((c) => {
          const time =
            c.updatedAt?.toMillis?.() ||
            (c.updatedAt?.seconds ? c.updatedAt.seconds * 1000 : 0);
          return time > lastSeen;
        });
        setHasMsgs(hasNew);
      },
      console.error
    );
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const navItems = [
    { to: '/', label: t('home'), icon: Home, exact: true },
    { to: '/saved', label: t('saved'), icon: Bookmark, exact: false },
    { to: '/messages', label: t('messages'), icon: MessageSquare, exact: false },
    { to: '/post-ad', label: t('postAd'), icon: PlusCircle, exact: false, highlight: true },
    { to: '/profile', label: t('profile'), icon: User, exact: false },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="flex md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg shadow-slate-900/5 dark:shadow-black/20 safe-bottom transition-colors duration-300"
    >
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => {
                if (item.to === '/messages') {
                  setHasMsgs(false);
                }
              }}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-colors duration-300 ${
                  item.highlight
                    ? isActive
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-full transition-all duration-300 ${
                      item.highlight
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 -mt-2 shadow-sm border border-emerald-200 dark:border-emerald-800 scale-105'
                        : isActive
                        ? 'scale-110'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        item.highlight
                          ? 'w-5 h-5 text-emerald-700 dark:text-emerald-300'
                          : isActive
                          ? 'stroke-[2.25]'
                          : 'stroke-[1.75]'
                      }`}
                    />
                    {item.to === '/messages' && hasMsgs && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    )}
                    {isActive && !item.highlight && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight transition-colors duration-300 ${
                      isActive
                        ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                        : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
