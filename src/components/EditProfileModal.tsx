import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Upload, User, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadImageFile } from '../firebase';

export const EditProfileModal: React.FC = () => {
  const { 
    currentUser, 
    isEditProfileModalOpen, 
    closeEditProfileModal, 
    updateProfile,
    dir 
  } = useApp();

  const [shopName, setShopName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setShopName(currentUser.shopName || '');
      setUsername(currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
    }
    setErrorMsg('');
  }, [currentUser, isEditProfileModalOpen]);

  if (!isEditProfileModalOpen || !currentUser) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('יש לבחור קובץ תמונה תקין');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const url = await uploadImageFile(file, 'avatars');
      setAvatar(url);
    } catch {
      setErrorMsg('שגיאה בהעלאת התמונה');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setErrorMsg('יש להזין שם חנות');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('יש להזין שם משתמש');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    const res = await updateProfile({
      shopName: shopName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
    });
    setIsSaving(false);

    if (res.success) {
      closeEditProfileModal();
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const initialLetter = (username || currentUser.username || 'U')[0]?.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
      <div 
        dir={dir}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-start p-6 border border-purple-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                עריכת פרופיל וחנות
              </h2>
              <span className="text-[11px] text-purple-600 font-medium">UziShop • התאמה אישית</span>
            </div>
          </div>
          <button
            onClick={closeEditProfileModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Avatar Section - Choice to be with or without profile picture */}
          <div className="p-4 bg-purple-50/40 rounded-3xl border border-purple-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                תמונת פרופיל
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                avatar 
                  ? 'bg-purple-100 text-purple-700 border-purple-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {avatar ? 'מוגדרת תמונה אישית' : '✓ מוגדר: ללא תמונת פרופיל'}
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Toggle buttons: Without photo vs Upload from device */}
            <div className="flex items-center gap-2 p-1 bg-white rounded-full border border-purple-100">
              <button
                type="button"
                onClick={handleRemovePhoto}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !avatar
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ללא תמונת פרופיל</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatar
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'מעלה...' : avatar ? 'תמונה מהמכשיר ✓' : 'העלה מהמכשיר'}</span>
              </button>
            </div>

            {/* Visual Preview */}
            <div className="flex items-center gap-3.5 pt-1">
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={() => fileInputRef.current?.click()}
                title="לחץ להעלאת תמונה מהמכשיר"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-300 shadow-md group-hover:opacity-85 transition-opacity"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 flex items-center justify-center font-bold text-purple-900 text-xl border-2 border-purple-200 shadow-sm">
                    {initialLetter}
                  </div>
                )}

                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Upload className="w-4 h-4" />
                </div>
              </div>

              <div className="text-start flex-1 min-w-0">
                {avatar ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">
                      תמונה אישית נבחרה
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-[11px] text-purple-700 hover:text-purple-800 font-bold bg-white px-2.5 py-1 rounded-full border border-purple-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        החלף תמונה
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>הסר (היה ללא תמונה)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      מוגדר ללא תמונת פרופיל
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      הפרופיל שלך יוצג עם עיגול מעוצב באות הראשונה של שמך ({initialLetter}) ללא תמונה אישית.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              שם החנות
            </label>
            <input
              type="text"
              required
              placeholder="לדוגמה: החנות של דניאל"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-medium"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              שם משתמש (כינוי)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="daniel_cool"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full ps-8 pe-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-medium"
              />
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              אודות החנות (ביוגרפיה)
            </label>
            <textarea
              rows={3}
              placeholder="ספר על החנות שלך, סגנון הפריטים, איסוף וכו'..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'שומר שינויים...' : 'שמור שינויים'}</span>
            </button>

            <button
              type="button"
              onClick={closeEditProfileModal}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs transition-colors cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
