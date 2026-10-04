import React, { useState, useRef } from 'react';
import { X, Sparkles, AlertCircle, LogIn, UserPlus, Upload, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadImageFile } from '../firebase';
import { compressProfileImage } from '../utils/imageCompressor';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authMode, 
    openAuthModal, 
    loginWithEmail, 
    registerWithEmail,
    loginWithGoogle,
    dir,
    t
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [shopName, setShopName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthModalOpen) return null;

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(t.addModal.errorInvalidFile);
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadStatus('compressing');
    setErrorMsg('');

    try {
      // 1. Fast client-side resize and compression to 400x400 square
      const compressed = await compressProfileImage(file);
      setAvatarUrl(compressed.dataUrl);

      // 2. Upload optimized file
      setPhotoUploadStatus('uploading');
      const downloadUrl = await uploadImageFile(compressed.file, 'avatars');
      setAvatarUrl(downloadUrl);
    } catch (err) {
      console.error('Registration photo upload error:', err);
      setErrorMsg('שגיאה בעיבוד או בהעלאת התמונה. נסה שוב.');
    } finally {
      setIsUploadingPhoto(false);
      setPhotoUploadStatus('idle');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg(t.auth.errorFillAll);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t.auth.errorPasswordLength);
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (!username.trim() || !shopName.trim()) {
          setErrorMsg(t.auth.errorFillAll);
          setIsLoading(false);
          return;
        }

        const res = await registerWithEmail(
          email.trim(),
          password.trim(),
          username.trim(),
          shopName.trim(),
          bio.trim(),
          avatarUrl
        );
        if (!res.success && res.error) {
          setErrorMsg(res.error);
        }
      } else {
        const res = await loginWithEmail(email.trim(), password.trim());
        if (!res.success && res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'הפעולה נכשלה. אנא נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

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
                {authMode === 'register' ? t.auth.registerTitle : t.auth.loginTitle}
              </h2>
              <span className="text-[11px] text-purple-600 font-medium">UziShop • מרקטפלייס הנוער</span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Login / Register */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              openAuthModal('login');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-purple-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.auth.submitLogin}
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              openAuthModal('register');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-purple-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.auth.submitRegister}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Social Sign-In Buttons - Real Firebase Authentication */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl text-xs shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            title="התחבר באמצעות Google"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>המשך באמצעות Google</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">או התחבר עם אימייל וסיסמה</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t.auth.emailLabel}
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t.auth.passwordLabel}
            </label>
            <input
              type="password"
              required
              placeholder="לפחות 6 תווים"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-mono"
            />
          </div>

          {/* Registration specific fields */}
          {authMode === 'register' && (
            <>
              {/* Profile Image Upload (Optional - Can be without profile photo) */}
              <div className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {t.auth.profilePhotoLabel}
                  </label>
                  <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                    אופציונלי • ניתן ללא תמונה
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 border-2 border-purple-200 flex items-center justify-center shrink-0 shadow-xs">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className={`w-full h-full object-cover transition-all ${
                          isUploadingPhoto ? 'opacity-40 blur-[1px]' : ''
                        }`} 
                      />
                    ) : (
                      <span className={`text-purple-900 font-bold text-base ${isUploadingPhoto ? 'opacity-40' : ''}`}>
                        {username ? username[0]?.toUpperCase() : 'U'}
                      </span>
                    )}

                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="py-1.5 px-3 bg-white hover:bg-purple-50 text-purple-700 rounded-full text-xs font-bold transition-colors border border-purple-200 cursor-pointer disabled:opacity-75 shadow-2xs flex items-center gap-1.5"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                            <span>{photoUploadStatus === 'compressing' ? 'מקטין תמונה...' : 'מעלה תמונה...'}</span>
                          </>
                        ) : (
                          <span>{avatarUrl ? 'החלף תמונה' : 'בחר תמונה מהמכשיר'}</span>
                        )}
                      </button>
                      {avatarUrl && !isUploadingPhoto && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                          title="הסר תמונה"
                        >
                          הסר
                        </button>
                      )}
                    </div>
                    {isUploadingPhoto && (
                      <p className="text-[10px] text-purple-700 font-semibold mt-1">
                        מקטין אוטומטית לרזולוציה קלה למניעת השהיות...
                      </p>
                    )}
                  </div>
                </div>

                {!avatarUrl && (
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    ✓ ברירת מחדל: ללא תמונת פרופיל (יוצג סמל מעוצב עם האות הראשונה של שמך)
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.auth.usernameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="maya_style"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full ps-7 pe-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
                  />
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.auth.shopNameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vintage Vibes by Maya"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.auth.bioLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder="בגדי וינטג׳ יד שנייה, סניקרס נדירות וציוד גיימינג..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 resize-none"
                />
              </div>
            </>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading || isUploadingPhoto}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-4"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : authMode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.auth.submitRegister}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.auth.submitLogin}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
