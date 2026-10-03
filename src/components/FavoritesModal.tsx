import React from 'react';
import { 
  Heart, 
  X, 
  MessageSquare, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  ShoppingBag,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FavoritesModal: React.FC = () => {
  const { 
    isFavoritesOpen, 
    closeFavorites, 
    items, 
    currentUser, 
    toggleLikeItem, 
    setSelectedItemForDetail, 
    openChatWithSeller, 
    navigateToHomeFeed,
    dir, 
    t 
  } = useApp();

  if (!isFavoritesOpen) return null;

  const isRtl = dir === 'rtl';
  const ArrowBackIcon = isRtl ? ArrowRight : ArrowLeft;

  // Filter items favorited by the current user
  const favoriteItems = items.filter(item => 
    currentUser && (item.likes || []).includes(currentUser.id)
  );

  const handleOpenItem = (item: any) => {
    closeFavorites();
    setSelectedItemForDetail(item);
  };

  const handleChat = (sellerId: string, itemId: string) => {
    closeFavorites();
    openChatWithSeller(sellerId, itemId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeFavorites}
      />

      <div 
        dir={dir}
        className="fixed inset-y-0 end-0 max-w-full flex pl-10"
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-s border-purple-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center shadow-xs">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">המועדפים שלי</h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  {favoriteItems.length} פריטים שאהבת ושמרת
                </span>
              </div>
            </div>

            <button
              onClick={closeFavorites}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-500 hover:text-purple-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Favorite items list or empty state */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favoriteItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 border border-pink-100 flex items-center justify-center shadow-xs">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    עדיין אין לך פריטים במועדפים
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    לחץ על סמל הלב בכל פריט שאהבת בפיד כדי לשמור אותו כאן, להשוות מחירים ולפנות למוכר בקלות!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeFavorites();
                    navigateToHomeFeed();
                  }}
                  className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs shadow-md shadow-purple-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  גלה פריטים בפיד
                </button>
              </div>
            ) : (
              favoriteItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-white rounded-2xl border border-purple-100/90 shadow-2xs hover:border-purple-200 transition-all flex items-center gap-3 group text-start"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onClick={() => handleOpenItem(item)}
                    className="w-16 h-16 rounded-xl object-cover border border-purple-100 shrink-0 bg-slate-100 cursor-pointer group-hover:scale-102 transition-transform"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 
                        onClick={() => handleOpenItem(item)}
                        className="text-xs font-bold text-slate-900 truncate cursor-pointer hover:text-purple-700"
                      >
                        {item.title}
                      </h4>
                      <button
                        onClick={() => toggleLikeItem(item.id)}
                        className="p-1 text-pink-500 hover:text-slate-400 transition-colors cursor-pointer"
                        title="הסר מהמועדפים"
                      >
                        <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-extrabold text-purple-700">₪{item.price}</span>
                      <span>•</span>
                      <span>{item.condition}</span>
                      {item.size && (
                        <>
                          <span>•</span>
                          <span className="bg-slate-100 px-1 py-0.2 rounded text-[10px] text-slate-600 font-medium">
                            {item.size}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-50">
                      <button
                        onClick={() => handleChat(item.sellerId, item.id)}
                        className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>שוחח עם המוכר</span>
                      </button>

                      <button
                        onClick={() => handleOpenItem(item)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-full text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-200/80 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>צפה</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note: Commerce between buyer and seller */}
          {favoriteItems.length > 0 && (
            <div className="p-4 border-t border-purple-100 bg-purple-50/40 text-[11px] text-purple-900 flex items-center justify-between">
              <span>הקנייה מתבצעת ישירות מול המוכר בצ׳אט</span>
              <button
                onClick={() => {
                  closeFavorites();
                  navigateToHomeFeed();
                }}
                className="text-purple-700 font-bold hover:underline cursor-pointer"
              >
                המשך לחפש
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
