import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  Share2, 
  ArrowLeft,
  ArrowRight,
  Sparkles, 
  Heart, 
  Package, 
  CheckCircle,
  ShieldCheck,
  LogIn,
  LogOut,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemCard } from './ItemCard';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    selectedUserForProfile, 
    setSelectedUserForProfile, 
    items, 
    toggleFollowUser, 
    openChatWithSeller, 
    openAddItemModal, 
    openEditProfileModal,
    openAuthModal,
    openCheckoutModal,
    logout,
    dir,
    t
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'available' | 'sold' | 'saved'>('available');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (!currentUser && !selectedUserForProfile) {
    return (
      <div dir={dir} className="bg-white rounded-3xl p-8 border border-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.06)] text-center my-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t.profile.loginRequiredTitle}</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {t.profile.loginRequiredDesc}
        </p>
        <button
          onClick={() => openAuthModal('register')}
          className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold shadow-md shadow-purple-600/20 transition-all active:scale-98 cursor-pointer"
        >
          {t.profile.openShopBtn}
        </button>
      </div>
    );
  }

  const profileUser = selectedUserForProfile || currentUser!;
  const isOwner = currentUser?.id === profileUser.id;
  const isFollowing = currentUser ? (currentUser.following || []).includes(profileUser.id) : false;

  const shopItems = items.filter(item => item.sellerId === profileUser.id);
  const availableItems = shopItems.filter(item => item.status === 'active');
  const soldItems = shopItems.filter(item => item.status === 'sold');
  const savedItems = items.filter(item => currentUser && (item.likes || []).includes(currentUser.id));

  const itemsToDisplay = 
    activeTabFilter === 'available'
      ? availableItems
      : activeTabFilter === 'sold'
      ? soldItems
      : savedItems;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div dir={dir} className="space-y-4 pb-24 text-start">
      {/* Top Bar for Profile */}
      <div className="flex items-center justify-between">
        {!isOwner ? (
          <button
            onClick={() => currentUser && setSelectedUserForProfile(currentUser)}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-purple-600 bg-white px-3.5 py-1.5 rounded-full border border-purple-100 transition-colors shadow-2xs font-semibold cursor-pointer"
          >
            <BackIcon className="w-3.5 h-3.5" />
            <span>{t.profile.backToMyShop}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">{t.profile.myShopTitle}</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white border border-purple-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors relative shadow-2xs cursor-pointer"
            aria-label="שתף"
          >
            <Share2 className="w-4 h-4" />
            {copiedNotification && (
              <span className="absolute -bottom-7 end-0 bg-slate-900 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow whitespace-nowrap">
                {t.itemDetail.linkCopied}
              </span>
            )}
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-purple-600 bg-white px-3 py-1.5 rounded-full border border-purple-100 transition-colors font-semibold shadow-2xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">{t.profile.switchUser}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full border border-rose-200 transition-colors font-bold shadow-2xs cursor-pointer"
                title="התנתק מהחשבון"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>התנתק</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-[0_6px_25px_rgba(168,85,247,0.06)] space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className={`relative ${isOwner ? 'cursor-pointer group' : ''}`}
              onClick={isOwner ? openEditProfileModal : undefined}
              title={isOwner ? 'לחץ לעריכת הפרופיל והתמונה' : undefined}
            >
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-100 shadow-xs group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 flex items-center justify-center font-bold text-purple-900 text-xl border-2 border-purple-100 shadow-xs">
                  {profileUser.username[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {isOwner && (
                <div className="absolute -bottom-1 -start-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs border-2 border-white group-hover:scale-110 transition-transform">
                  <Edit3 className="w-2.5 h-2.5" />
                </div>
              )}

              {profileUser.isVip && (
                <div className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-slate-950 leading-tight">
                  {profileUser.shopName}
                </h1>
                {profileUser.isVip && (
                  <span className="flex items-center gap-0.5 text-[10px] text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    <span>VIP</span>
                  </span>
                )}
                {profileUser.isFeaturedShop && (
                  <span className="flex items-center gap-1 text-[10px] text-pink-700 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full font-bold">
                    <Sparkles className="w-3 h-3 text-pink-600" />
                    <span>{t.featuredShop.badge}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                @{profileUser.username}
              </p>
              
              {/* Follower Count */}
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-purple-700 font-bold bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full w-fit tabular-nums">
                <span>{t.profile.followersCount.replace('{count}', String(profileUser.followersCount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Profile */}
          {!isOwner ? (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => toggleFollowUser(profileUser.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  isFollowing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t.itemDetail.following}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.itemDetail.follow}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openChatWithSeller(profileUser.id)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.profile.sendMessageBtn}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <button
                onClick={openEditProfileModal}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border border-purple-200 shadow-2xs transition-all active:scale-98 whitespace-nowrap cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>ערוך פרופיל</span>
              </button>

              <button
                onClick={() => openCheckoutModal('shop_feature')}
                className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.featuredShop.promoteShopBtn}</span>
              </button>

              <button
                onClick={() => openAddItemModal()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-98 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.profile.addItemBtn}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <p className="text-xs text-slate-700 leading-relaxed bg-purple-50/40 p-3.5 rounded-3xl border border-purple-100">
            {profileUser.bio}
          </p>
        )}

        {/* VIP Upgrade Banner for Free Users */}
        {isOwner && !profileUser.isVip && (
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-sky-50 rounded-3xl border border-purple-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {t.profile.vipUpgradeBannerTitle}
                </h4>
                <p className="text-[10px] text-slate-600">
                  {t.profile.vipUpgradeBannerDesc}
                </p>
              </div>
            </div>
            <button
              onClick={() => openCheckoutModal('vip_upgrade')}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold shrink-0 transition-all shadow-sm shadow-sky-500/20 active:scale-98 cursor-pointer"
            >
              {t.profile.upgradeNow}
            </button>
          </div>
        )}

        {/* Dedicated Account & Logout Row for Owner */}
        {isOwner && (
          <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-3">
            <div className="text-start min-w-0">
              <span className="text-xs font-bold text-slate-800 block">הגדרות חשבון</span>
              <span className="text-[10px] text-slate-500 font-mono truncate block">
                {profileUser.email || `@${profileUser.username}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openEditProfileModal}
                className="shrink-0 px-3.5 py-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>ערוך פרופיל</span>
              </button>
              <button
                onClick={logout}
                className="shrink-0 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>התנתק</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for Shop Items */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-full border border-purple-100 shadow-2xs">
        <button
          onClick={() => setActiveTabFilter('available')}
          className={`flex-1 py-2 px-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTabFilter === 'available'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-600'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{t.profile.tabAvailable.replace('{count}', String(availableItems.length))}</span>
        </button>

        <button
          onClick={() => setActiveTabFilter('sold')}
          className={`flex-1 py-2 px-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTabFilter === 'sold'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-600'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.profile.tabSold.replace('{count}', String(soldItems.length))}</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTabFilter('saved')}
            className={`flex-1 py-2 px-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTabFilter === 'saved'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t.profile.tabSaved.replace('{count}', String(savedItems.length))}</span>
          </button>
        )}
      </div>

      {/* Item Grid */}
      {itemsToDisplay.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {itemsToDisplay.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.06)] text-center my-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {activeTabFilter === 'available'
              ? t.profile.emptyAvailable
              : activeTabFilter === 'sold'
              ? t.profile.emptySold
              : t.profile.emptySaved}
          </h3>
          {isOwner && activeTabFilter === 'available' && (
            <button
              onClick={() => openAddItemModal()}
              className="mt-2 py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t.profile.uploadFirstItemBtn}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
