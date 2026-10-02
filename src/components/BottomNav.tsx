import React from 'react';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadMessagesCount, currentUser, dir, t } = useApp();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; isCenterAction?: boolean }[] = dir === 'rtl' ? [
    {
      id: 'profile',
      label: t.nav.profile,
      icon: (
        <div className="relative">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className={`w-6 h-6 rounded-full object-cover border-2 transition-all ${
                activeTab === 'profile' ? 'border-purple-600 scale-105 shadow-xs' : 'border-transparent'
              }`}
            />
          ) : (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              activeTab === 'profile' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'feed',
      label: t.nav.feed,
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'add',
      label: t.nav.add,
      isCenterAction: true,
      icon: <Plus className="w-6 h-6 text-white stroke-[2.5]" />,
    },
    {
      id: 'chat',
      label: t.nav.chat,
      icon: (
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1.5 -end-2 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'search',
      label: t.nav.search,
      icon: <Search className="w-5 h-5" />,
    },
  ] : [
    {
      id: 'feed',
      label: t.nav.feed,
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'search',
      label: t.nav.search,
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'add',
      label: t.nav.add,
      isCenterAction: true,
      icon: <Plus className="w-6 h-6 text-white stroke-[2.5]" />,
    },
    {
      id: 'chat',
      label: t.nav.chat,
      icon: (
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1.5 -end-2 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'profile',
      label: t.nav.profile,
      icon: (
        <div className="relative">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className={`w-6 h-6 rounded-full object-cover border-2 transition-all ${
                activeTab === 'profile' ? 'border-purple-600 scale-105 shadow-xs' : 'border-transparent'
              }`}
            />
          ) : (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              activeTab === 'profile' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-2">
        <nav
          dir={dir}
          aria-label="Navigation"
          className="bg-white/95 backdrop-blur-xl border border-purple-100 shadow-[0_10px_35px_rgba(168,85,247,0.08)] rounded-full h-16 px-3 flex items-center justify-around"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            if (item.isCenterAction) {
              return (
                <div key={item.id} className="relative -top-4">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-sky-400 hover:opacity-95 active:scale-95 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center text-white cursor-pointer"
                    aria-label={t.nav.add}
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'text-purple-600 font-bold scale-102'
                    : 'text-slate-400 hover:text-purple-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="transition-transform duration-200">
                  {item.icon}
                </div>
                <span className="text-[11px] mt-1 leading-tight tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
