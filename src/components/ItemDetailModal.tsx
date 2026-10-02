import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  Share2,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ItemDetailModal: React.FC = () => {
  const { 
    selectedItemForDetail, 
    setSelectedItemForDetail, 
    currentUser, 
    users, 
    toggleLikeItem, 
    toggleSold, 
    deleteItem, 
    openAddItemModal, 
    openChatWithSeller, 
    navigateToShop,
    toggleFollowUser,
    openCheckoutModal,
    addToCart,
    dir,
    t
  } = useApp();

  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const seller = users.find(u => u.id === item.sellerId);
  const isOwner = currentUser?.id === item.sellerId;
  const isLiked = currentUser ? (item.likes || []).includes(currentUser.id) : false;
  const isFollowing = currentUser && seller ? (currentUser.following || []).includes(seller.id) : false;
  const isSold = item.status === 'sold';

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(t.itemDetail.confirmDelete)) {
      deleteItem(item.id);
    }
  };

  const handleAddToCart = () => {
    addToCart(item);
  };

  const handleBuyNow = () => {
    addToCart(item);
    openCheckoutModal('cart_checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-0 sm:p-4">
      <div 
        dir={dir}
        className="relative bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto pb-28 text-start border border-purple-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Header with navigation & actions */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-purple-100/70">
          <button
            onClick={() => setSelectedItemForDetail(null)}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors relative cursor-pointer"
              aria-label="שתף פריט"
            >
              <Share2 className="w-4 h-4" />
              {copiedNotification && (
                <span className="absolute -bottom-8 end-0 bg-slate-900 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow whitespace-nowrap">
                  {t.itemDetail.linkCopied}
                </span>
              )}
            </button>
            <button
              onClick={() => toggleLikeItem(item.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                isLiked ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600'
              }`}
              aria-label="אהבתי"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative aspect-4/3 w-full bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`w-full h-full object-cover ${isSold ? 'grayscale-[0.5] opacity-80' : ''}`}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {item.isFeatured && !isSold && (
            <div className="absolute top-3 end-3">
              <span className="bg-pink-50/95 backdrop-blur-md text-pink-700 border border-pink-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-pink-600" />
                <span>{t.itemCard.sponsored}</span>
              </span>
            </div>
          )}

          {isSold && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-slate-900/90 text-white font-bold text-sm px-5 py-2 rounded-full shadow-lg tracking-wider">
                {t.itemCard.sold}
              </span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5">
          {/* Price & Title */}
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-3xl font-extrabold text-purple-900 tabular-nums">
                ₪{item.price}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {item.category}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-950 leading-snug">
              {item.title}
            </h1>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/40 rounded-3xl border border-purple-100 text-center">
            <div className="p-1.5">
              <span className="text-[10px] text-slate-400 font-medium block">{t.itemDetail.condition}</span>
              <span className="text-xs font-bold text-slate-800">{item.condition}</span>
            </div>
            <div className="p-1.5 border-x border-purple-100">
              <span className="text-[10px] text-slate-400 font-medium block">{t.itemDetail.size}</span>
              <span className="text-xs font-bold text-slate-800">{item.size || 'One Size'}</span>
            </div>
            <div className="p-1.5">
              <span className="text-[10px] text-slate-400 font-medium block">{t.itemDetail.category}</span>
              <span className="text-xs font-bold text-slate-800">{item.category}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.itemDetail.descriptionTitle}</h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {item.description || 'אין תיאור נוסף לפריט זה.'}
            </p>
          </div>

          {/* Seller Card */}
          {seller && (
            <div className="p-4 rounded-3xl bg-white border border-purple-100 shadow-2xs flex items-center justify-between">
              <div 
                onClick={() => navigateToShop(seller.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-100 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-900 flex items-center justify-center font-bold text-base border-2 border-purple-100 shadow-2xs">
                    {seller.username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      {seller.shopName}
                    </h4>
                    {seller.isVip && (
                      <span className="flex items-center gap-0.5 text-[10px] text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                        <ShieldCheck className="w-3 h-3 text-purple-600" />
                        <span>VIP</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">@{seller.username}</p>
                  <p className="text-[11px] text-purple-600 font-semibold mt-0.5 tabular-nums">
                    {t.itemDetail.followers.replace('{count}', String(seller.followersCount || 0))}
                  </p>
                </div>
              </div>

              {!isOwner ? (
                <button
                  onClick={() => toggleFollowUser(seller.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                  }`}
                >
                  {isFollowing ? t.itemDetail.following : t.itemDetail.follow}
                </button>
              ) : (
                <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-semibold border border-purple-200">
                  {t.itemDetail.yourShop}
                </span>
              )}
            </div>
          )}

          {/* Seller Management Panel */}
          {isOwner && (
            <div className="p-4 bg-purple-50/40 rounded-3xl border border-purple-100 space-y-3">
              <p className="text-xs font-bold text-slate-700">{t.itemDetail.sellerManagement}</p>
              
              {!item.isFeatured && !isSold && (
                <button
                  onClick={() => openCheckoutModal('promote', item)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.itemDetail.promoteTopFeed}</span>
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => openAddItemModal(item)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-white hover:bg-purple-50 text-slate-800 border border-purple-100 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.itemDetail.edit}</span>
                </button>
                <button
                  onClick={() => toggleSold(item.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-xs font-bold transition-colors border cursor-pointer ${
                    isSold
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-sky-50 text-sky-800 border-sky-300'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isSold ? t.itemDetail.unmarkSold : t.itemDetail.markSold}</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.itemDetail.delete}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating CTA Bar for Buyers */}
        {!isOwner && (
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-purple-100 z-30 max-w-lg mx-auto shadow-lg">
            {isSold ? (
              <button
                disabled
                className="w-full py-3 bg-slate-100 text-slate-400 font-semibold rounded-full text-xs flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>{t.itemDetail.itemSoldCannotChat}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Chat Button */}
                <button
                  onClick={() => seller && openChatWithSeller(seller.id, item.id)}
                  className="p-3 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-full transition-colors cursor-pointer border border-purple-100"
                  title="שוחח עם המוכר"
                  aria-label="שוחח עם המוכר"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>הוסף לסל</span>
                </button>

                {/* Buy Now with Bit / Apple Pay / Card */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 hover:opacity-95 text-white font-bold rounded-full text-xs shadow-md shadow-purple-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>קנה עכשיו</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
