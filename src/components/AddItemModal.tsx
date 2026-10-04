import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Upload, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, ItemCondition } from '../types';
import { CATEGORIES, CONDITIONS } from '../data/initialData';
import { uploadImageFile } from '../firebase';
import { compressProductImage } from '../utils/imageCompressor';

export const AddItemModal: React.FC = () => {
  const { 
    isAddItemModalOpen, 
    closeAddItemModal, 
    addItem, 
    updateItem, 
    itemToEdit,
    currentUser,
    items,
    openCheckoutModal,
    dir,
    t
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('ביגוד');
  const [condition, setCondition] = useState<ItemCondition>('כחדש');
  const [size, setSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [promoteImmediately, setPromoteImmediately] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItemsCount = items.filter(i => i.sellerId === currentUser?.id && i.status === 'active').length;
  const isFreeLimitReached = !currentUser?.isVip && activeItemsCount >= 5 && !itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price.toString());
      setCategory(itemToEdit.category);
      setCondition(itemToEdit.condition);
      setSize(itemToEdit.size || '');
      setImageUrl(itemToEdit.imageUrl);
      setPromoteImmediately(itemToEdit.isFeatured);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('ביגוד');
      setCondition('כחדש');
      setSize('');
      setImageUrl('');
      setPromoteImmediately(false);
    }
    setErrorMsg('');
  }, [itemToEdit, isAddItemModalOpen]);

  if (!isAddItemModalOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(t.addModal.errorInvalidFile);
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const compressed = await compressProductImage(file);
      setImageUrl(compressed.dataUrl);
      const downloadUrl = await uploadImageFile(compressed.file, 'items');
      setImageUrl(downloadUrl);
    } catch (err) {
      console.error('Item photo upload error:', err);
      setErrorMsg('שגיאה בהעלאת התמונה. נסה שוב.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg(t.addModal.errorFillTitle);
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg(t.addModal.errorFillPrice);
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg(t.addModal.errorFillImage);
      return;
    }

    if (itemToEdit) {
      await updateItem(itemToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        category,
        condition,
        size: size.trim() || undefined,
        imageUrl: imageUrl.trim(),
        isFeatured: promoteImmediately,
      });
    } else {
      const res = await addItem({
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        category,
        condition,
        size: size.trim() || undefined,
        imageUrl: imageUrl.trim(),
        promoteImmediately,
      });

      if (!res.success && res.reason === 'limit_reached') {
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-0 sm:p-4">
      <div 
        dir={dir}
        className="relative bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto pb-24 text-start border border-purple-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center text-purple-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {itemToEdit ? t.addModal.titleEdit : t.addModal.titleNew}
              </h2>
              <span className="text-[11px] text-purple-600 font-medium">UziShop • מרקטפלייס הנוער</span>
            </div>
          </div>
          <button
            onClick={closeAddItemModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-purple-50 flex items-center justify-center text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free limit notice if reached */}
        {isFreeLimitReached ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 text-purple-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t.addModal.limitReachedTitle}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {t.addModal.limitReachedDesc}
            </p>
            <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
              <button
                onClick={() => {
                  closeAddItemModal();
                  openCheckoutModal('vip_upgrade');
                }}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-bold shadow-md shadow-sky-500/20 cursor-pointer transition-colors"
              >
                {t.addModal.upgradeNowBtn}
              </button>
              <button
                onClick={closeAddItemModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 grow">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Image Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t.addModal.itemPhotoLabel}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-4/3 w-full rounded-3xl border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/20 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                      לחץ להחלפת תמונה
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isUploading ? 'מעלה תמונה...' : 'העלה תמונה מהמכשיר'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        JPG, PNG או WebP עד 10MB
                      </p>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-2 animate-in fade-in duration-150">
                    <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
                    <span className="text-xs font-bold text-white">מקטין ומעלה תמונה במהירות...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t.addModal.titleLabel}
              </label>
              <input
                type="text"
                placeholder={t.addModal.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
              />
            </div>

            {/* Price and Size Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.addModal.priceLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="120"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full ps-7 pe-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
                  />
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₪</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.addModal.sizeLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.addModal.sizePlaceholder}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t.addModal.categoryLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t.addModal.conditionLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`p-2.5 rounded-2xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      condition === cond
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-purple-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t.addModal.descLabel}
              </label>
              <textarea
                rows={3}
                placeholder={t.addModal.descPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 resize-none"
              />
            </div>

            {/* Promote Item Option */}
            <div className="p-4 bg-pink-50/70 rounded-3xl border border-pink-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {t.addModal.promoteCheckboxTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {t.addModal.promoteCheckboxDesc}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={promoteImmediately}
                onChange={(e) => setPromoteImmediately(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded-md cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {itemToEdit ? t.addModal.submitSave : t.addModal.submitPublish}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
