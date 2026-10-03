import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MoreVertical, 
  Check, 
  Users, 
  Globe, 
  UserCheck, 
  LogIn, 
  LogOut, 
  ShieldCheck,
  Languages,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types';

export const Navbar: React.FC = () => {
  const { 
    feedType, 
    setFeedType, 
    currentUser, 
    openAuthModal, 
    logout,
    navigateToHomeFeed,
    activeTab,
    language,
    setLanguage,
    cartCount,
    openCart,
    t
  } = useApp();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-purple-100/70 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand Lockup - App icon preserved exactly as requested in pink, purple, and sky */}
        <button
          onClick={navigateToHomeFeed}
          className="flex items-center gap-2.5 group text-start cursor-pointer"
        >
          <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-4 h-4 text-purple-900" />
          </div>
          <div className="flex flex-col text-start">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {t.appName}
              </span>
              {currentUser?.isVip && (
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <span className="text-[10px] text-slate-500 -mt-1 font-medium">
              {t.appTagline}
            </span>
          </div>
        </button>

        {/* Right side controls */}
        <div className="relative flex items-center gap-2">
          
          {/* Cart Button with badge count */}
          <button
            onClick={openCart}
            className="relative h-8.5 px-2.5 rounded-full bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200/70 cursor-pointer shadow-2xs"
            aria-label="סל קניות"
          >
            <ShoppingCart className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">סל</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs -me-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Language Selector Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="h-8.5 px-2.5 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-purple-200 cursor-pointer"
              aria-label="בחר שפה"
            >
              <Languages className="w-3.5 h-3.5 text-purple-600" />
              <span className="uppercase text-[11px] font-bold">{language}</span>
            </button>

            {/* Language Selector Dropdown */}
            {isLangMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangMenuOpen(false)}
                />
                <div className="absolute end-0 mt-2 w-44 bg-white rounded-3xl shadow-xl border border-purple-100 py-2 z-50 text-start animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 border-b border-purple-50 text-[11px] font-bold text-slate-400">
                    Language / שפה
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as LanguageCode);
                        setIsLangMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs flex items-center justify-between text-slate-800 hover:bg-purple-50/60 transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Feed toggle badge for quick switching (Feed tab only) */}
          {activeTab === 'feed' && (
            <button
              onClick={() => setFeedType(feedType === 'regular' ? 'following' : 'regular')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                feedType === 'following'
                  ? 'bg-pink-50 border-pink-200 text-pink-700 font-semibold'
                  : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
              }`}
            >
              {feedType === 'following' ? (
                <>
                  <Users className="w-3.5 h-3.5 text-pink-600" />
                  <span className="hidden sm:inline">{t.feed.following}</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden sm:inline">{t.feed.allOption}</span>
                </>
              )}
            </button>
          )}

          {/* 3 dots menu button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
              aria-label="תפריט"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute end-0 mt-2 w-52 bg-white rounded-3xl shadow-xl border border-purple-100 py-2 z-50 text-start animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 border-b border-purple-50">
                    <p className="text-xs font-semibold text-slate-800">{t.feed.viewMenu}</p>
                    <p className="text-[11px] text-slate-400">{t.feed.viewMenuDesc}</p>
                  </div>

                  <button
                    onClick={() => {
                      setFeedType('regular');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs flex items-center justify-between text-slate-700 hover:bg-purple-50/60 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t.feed.allOption}</span>
                    </span>
                    {feedType === 'regular' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setFeedType('following');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs flex items-center justify-between text-slate-700 hover:bg-purple-50/60 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                      <span>{t.feed.followingOption}</span>
                    </span>
                    {feedType === 'following' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>

                  <div className="border-t border-purple-50 mt-1 pt-1">
                    {currentUser ? (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-3.5 py-2 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.auth.logout}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="w-full px-3.5 py-2 text-xs flex items-center gap-2 text-purple-700 hover:bg-purple-50 font-medium cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-purple-600" />
                        <span>{t.auth.submitLogin}</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
