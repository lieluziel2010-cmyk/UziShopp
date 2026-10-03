import React from 'react';
import { Sparkles, Store, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FeaturedShopBanner: React.FC = () => {
  const { 
    featuredShop, 
    navigateToShop, 
    openCheckoutModal, 
    openAuthModal, 
    currentUser, 
    dir, 
    t 
  } = useApp();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Active Featured Shop
  if (featuredShop) {
    return (
      <div 
        dir={dir}
        className="relative bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-[0_6px_20px_rgba(168,85,247,0.06)] text-start overflow-hidden group"
      >
        <div className="relative z-10 space-y-3">
          {/* Top Title Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-3 py-1 bg-pink-50 text-pink-700 font-extrabold text-[11px] rounded-full border border-pink-200 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
                <span>{t.featuredShop.title}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                {t.featuredShop.weeklyPick}
              </span>
            </div>

            {/* Quick promote button if current user isn't this shop */}
            {currentUser?.id !== featuredShop.id && (
              <button
                onClick={() => openCheckoutModal('shop_feature')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 transition-colors shadow-2xs cursor-pointer"
              >
                {t.featuredShop.promoteShopBtn} (₪15)
              </button>
            )}
          </div>

          {/* Shop Profile Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div 
              onClick={() => navigateToShop(featuredShop.id)}
              className="flex items-center gap-3 min-w-0 cursor-pointer group/shop"
            >
              <div className="relative shrink-0">
                {featuredShop.avatar ? (
                  <img
                    src={featuredShop.avatar}
                    alt={featuredShop.shopName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-purple-100 shadow-xs group-hover/shop:scale-102 transition-transform"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-base shadow-xs">
                    {featuredShop.shopName[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {featuredShop.isVip && (
                  <div className="absolute -bottom-1 -end-1 w-4.5 h-4.5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-950 group-hover/shop:text-purple-600 transition-colors truncate">
                    {featuredShop.shopName}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    @{featuredShop.username}
                  </span>
                </div>
                {featuredShop.bio ? (
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-normal">
                    {featuredShop.bio}
                  </p>
                ) : (
                  <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
                    {t.profile.followersCount.replace('{count}', String(featuredShop.followersCount || 0))}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigateToShop(featuredShop.id)}
              className="shrink-0 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <span>{t.featuredShop.visitShop}</span>
              <ArrowIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Promo Banner when no shop is currently featured (encouraging shop owners)
  return (
    <div 
      dir={dir}
      className="relative bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-[0_6px_20px_rgba(168,85,247,0.06)] text-start overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center shrink-0 shadow-xs text-purple-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {t.featuredShop.title}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-snug">
              {t.featuredShop.promoText}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (currentUser) {
              openCheckoutModal('shop_feature');
            } else {
              openAuthModal('register');
            }
          }}
          className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.featuredShop.promoteShopBtn}</span>
        </button>
      </div>
    </div>
  );
};
