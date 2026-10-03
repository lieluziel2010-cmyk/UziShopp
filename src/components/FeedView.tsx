import React from 'react';
import { Users, Globe, ShoppingBag, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';
import { FeaturedShopBanner } from './FeaturedShopBanner';
import { AdBanner } from './AdBanner';
import { CATEGORIES } from '../data/initialData';
import { Category } from '../types';

export const FeedView: React.FC = () => {
  const { 
    items, 
    feedType, 
    setFeedType, 
    currentUser, 
    selectedCategory, 
    setSelectedCategory,
    openAddItemModal,
    openAuthModal,
    dir,
    t
  } = useApp();

  // Filter items based on feed type (regular vs following)
  const feedFilteredItems = items.filter(item => {
    if (feedType === 'following') {
      if (!currentUser || !currentUser.following) return false;
      return currentUser.following.includes(item.sellerId);
    }
    return true;
  });

  // Filter by category
  const categoryFilteredItems = feedFilteredItems.filter(item => {
    if (selectedCategory === 'הכל') return true;
    return item.category === selectedCategory;
  });

  // Featured items top priority
  const sortedItems = [...categoryFilteredItems].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.createdAt - a.createdAt;
  });

  const featuredItemsCount = sortedItems.filter(i => i.isFeatured && i.status === 'active').length;

  // Harmonious palette: pink, lavender/purple, sky blue, and white (NO green, NO yellow)
  const getCategoryPastelClass = (cat: Category | 'הכל', isSelected: boolean) => {
    if (isSelected) {
      return 'bg-purple-600 text-white shadow-xs border-transparent font-bold';
    }

    switch (cat) {
      case 'ביגוד':
        return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70';
      case 'הנעלה':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70';
      case 'אקססוריז':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      case 'גיימינג':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70';
      case 'אלקטרוניקה':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      case 'חדר ועיצוב':
        return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/70';
      case 'אחר':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/70';
      default:
        return 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50/50';
    }
  };

  return (
    <div dir={dir} className="space-y-4 pb-20">
      {/* Feed Mode Switcher Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white p-1 rounded-full border border-purple-100/80 shadow-2xs">
          <button
            onClick={() => setFeedType('regular')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              feedType === 'regular'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.feed.allShops}</span>
          </button>

          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              feedType === 'following'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{t.feed.following} ({currentUser?.following?.length || 0})</span>
          </button>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-start -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory('הכל')}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0 border cursor-pointer ${getCategoryPastelClass('הכל', selectedCategory === 'הכל')}`}
          >
            {t.categories.all}
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border cursor-pointer ${getCategoryPastelClass(cat, selectedCategory === cat)}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Header Notification */}
      {featuredItemsCount > 0 && feedType === 'regular' && (
        <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50/80 border border-purple-200 py-1.5 px-3 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="font-semibold">{t.feed.sponsoredHeader}</span>
        </div>
      )}

      {/* Featured Shop of the Week Top Banner */}
      {feedType === 'regular' && (
        <FeaturedShopBanner />
      )}

      {/* Grid of Items with In-Feed AdBanner interleaved every ~7 items */}
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {sortedItems.map((item, index) => {
            // Render an In-Feed AdBanner approximately every 7 items
            const shouldShowAd = feedType === 'regular' && (index + 1) % 7 === 0;
            const adIndex = Math.floor((index + 1) / 7) - 1;
            
            return (
              <React.Fragment key={item.id}>
                <ItemCard item={item} />
                {shouldShowAd && (
                  <AdBanner adIndex={adIndex} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        /* Friendly Empty State */
        <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.06)] text-center my-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            {feedType === 'following' ? <Users className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {feedType === 'following' 
                ? t.feed.emptyFollowing 
                : t.feed.emptyMain}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {feedType === 'following'
                ? t.feed.emptyFollowingDesc
                : t.feed.emptyMainDesc}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
            {feedType === 'following' ? (
              <button
                onClick={() => setFeedType('regular')}
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold transition-colors border border-purple-200 cursor-pointer"
              >
                {t.feed.backToMainFeed}
              </button>
            ) : currentUser ? (
              <button
                onClick={() => openAddItemModal()}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.feed.uploadFirstItem}</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('register')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.feed.registerAndSell}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
