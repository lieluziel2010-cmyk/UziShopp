import React from 'react';
import { Heart, Sparkles, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Item } from '../types';
import { useApp } from '../context/AppContext';

interface ItemCardProps {
  item: Item;
  onSelect?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect }) => {
  const { 
    users, 
    currentUser, 
    toggleLikeItem, 
    setSelectedItemForDetail, 
    navigateToShop,
    openCheckoutModal,
    addToCart,
    t
  } = useApp();
  
  const seller = users.find(u => u.id === item.sellerId);
  const isLiked = currentUser ? (item.likes || []).includes(currentUser.id) : false;
  const isOwner = currentUser?.id === item.sellerId;
  const isSold = item.status === 'sold';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedItemForDetail(item);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeItem(item.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSold) {
      addToCart(item);
    }
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (seller) {
      navigateToShop(seller.id);
    }
  };

  const handlePromoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCheckoutModal('promote', item);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col ${
        item.isFeatured 
          ? 'border-pink-300 shadow-[0_6px_20px_rgba(244,63,94,0.12)]' 
          : 'border-purple-100/90 shadow-[0_4px_16px_rgba(168,85,247,0.06)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)]'
      }`}
    >
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${
            isSold ? 'grayscale-[0.5] opacity-75' : ''
          }`}
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Promoted / Featured Badge with Sparkles */}
        {item.isFeatured && !isSold && (
          <div className="absolute top-2.5 end-2.5 z-10">
            <span className="bg-pink-50/95 backdrop-blur-md text-pink-700 border border-pink-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-pink-600" />
              <span>{t.itemCard.sponsored}</span>
            </span>
          </div>
        )}

        {/* Sold Badge */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900/90 text-white font-bold text-xs px-3.5 py-1 rounded-full shadow-md tracking-wider">
              {t.itemCard.sold}
            </span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-2.5 start-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
            isLiked
              ? 'bg-pink-50 text-pink-500'
              : 'bg-white/90 text-slate-600 hover:text-pink-500 hover:bg-white'
          }`}
          aria-label="מועדף"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        {/* Quick Add To Cart button overlay */}
        {!isSold && (
          <button
            onClick={handleAddToCartClick}
            className="absolute bottom-2.5 start-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-purple-600 text-slate-700 hover:text-white backdrop-blur-md flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            title="הוסף לסל"
            aria-label="הוסף לסל"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Condition label */}
        <div className="absolute bottom-2.5 end-2.5 z-10">
          <span className="text-[10px] font-semibold bg-white/95 backdrop-blur-md text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-purple-50">
            {item.condition}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between text-start">
        <div>
          {/* Price & Category */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-base font-extrabold text-purple-900 tabular-nums">
              ₪{item.price}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-full">
              {item.category}
              {item.size ? ` · ${item.size}` : ''}
            </span>
          </div>

          {/* Item Title */}
          <h3 className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Footer: Seller Info or Promote Trigger */}
        <div className="mt-2.5 pt-2 border-t border-purple-50 flex items-center justify-between text-slate-500">
          <div 
            onClick={handleSellerClick}
            className="flex items-center gap-1.5 min-w-0 hover:text-purple-700 transition-colors cursor-pointer"
          >
            {seller?.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.username}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-purple-100"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-900 flex items-center justify-center font-bold text-[9px] shrink-0 border border-purple-100">
                {seller?.username[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex items-center gap-1 truncate">
              <span className="text-[11px] truncate text-slate-700 font-medium">
                {seller?.shopName || `@${seller?.username || 'user'}`}
              </span>
              {seller?.isVip && (
                <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && !item.isFeatured && !isSold && (
              <button
                onClick={handlePromoteClick}
                className="text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 transition-colors border border-purple-200 cursor-pointer"
                title={t.itemCard.promoteQuick}
              >
                <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                <span>{t.itemCard.promoteQuick}</span>
              </button>
            )}

            {item.likesCount > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5 tabular-nums">
                <Heart className="w-2.5 h-2.5 fill-pink-300 text-pink-300" />
                {item.likesCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
