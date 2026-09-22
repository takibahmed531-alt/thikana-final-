import { NavLink } from 'react-router-dom';
import { Home, Bookmark, MessageSquare, PlusCircle, User } from 'lucide-react';

export default function BottomTab() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/saved', label: 'Saved', icon: Bookmark, exact: false },
    { to: '/messages', label: 'Chat', icon: MessageSquare, exact: false, badge: 2 },
    { to: '/post-ad', label: 'Post Ad', icon: PlusCircle, exact: false, highlight: true },
    { to: '/profile', label: 'Profile', icon: User, exact: false },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="flex md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-lg shadow-slate-900/5 safe-bottom"
    >
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-all ${
                  item.highlight
                    ? isActive
                      ? 'text-emerald-700 font-semibold'
                      : 'text-emerald-600 font-semibold'
                    : isActive
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-full transition-transform ${
                      item.highlight
                        ? 'bg-emerald-100 text-emerald-700 -mt-2 shadow-sm border border-emerald-200 scale-105'
                        : isActive
                        ? 'scale-110'
                        : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        item.highlight
                          ? 'w-5 h-5 text-emerald-700'
                          : isActive
                          ? 'stroke-[2.25]'
                          : 'stroke-[1.75]'
                      }`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {isActive && !item.highlight && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight ${
                      isActive ? 'font-semibold text-emerald-700' : 'font-medium'
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
