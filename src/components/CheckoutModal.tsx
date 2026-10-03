import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Lock, 
  Store, 
  ShoppingBag, 
  Smartphone, 
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    checkoutState, 
    closeCheckoutModal, 
    completePayment,
    cartTotal,
    cartCount,
    currentUser,
    dir,
    t
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bit');
  const [phoneNumber, setPhoneNumber] = useState('050-1234567');
  const [cardNumber, setCardNumber] = useState('4580 •••• •••• 1234');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('789');
  const [cardHolder, setCardHolder] = useState(currentUser?.shopName || 'ישראל ישראלי');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!checkoutState.isOpen) return null;

  const isCart = checkoutState.type === 'cart_checkout';
  const isVip = checkoutState.type === 'vip_upgrade';
  const isShopFeature = checkoutState.type === 'shop_feature';
  
  const price = isCart 
    ? cartTotal 
    : isVip 
    ? 15 
    : isShopFeature 
    ? 15 
    : 5;

  const title = isCart
    ? `תשלום עבור ${cartCount} פריטים בעגלה`
    : isVip 
    ? t.checkout.vipTitle 
    : isShopFeature 
    ? t.checkout.shopFeatureTitle 
    : t.checkout.promoteTitle;

  const description = isCart
    ? 'תשלום מאובטח עם הגנת קונה מלאה ואישור מיידי'
    : isVip 
    ? t.checkout.vipDesc 
    : isShopFeature 
    ? t.checkout.shopFeatureDesc 
    : t.checkout.promoteDesc;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(async () => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(async () => {
        await completePayment(selectedMethod);
        setIsSuccess(false);
      }, 900);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4">
      <div 
        dir={dir}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-start p-5 border border-purple-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center text-purple-900 font-bold shadow-xs">
              {isCart ? (
                <ShoppingBag className="w-4 h-4" />
              ) : isVip ? (
                <ShieldCheck className="w-4 h-4" />
              ) : isShopFeature ? (
                <Store className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <span className="text-[10px] text-purple-600 font-semibold">{t.checkout.securePayment}</span>
            </div>
          </div>

          <button
            onClick={closeCheckoutModal}
            disabled={isProcessing}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-pink-400 via-purple-500 to-sky-400 text-white rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 animate-in zoom-in">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-950">{t.checkout.successTitle}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              העסקה הושלמה בהצלחה. הקבלה ופרטי ההזמנה נשמרו בחשבונך.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="mt-4 space-y-4">
            
            {/* Price Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-sky-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{description}</p>
              </div>
              <div className="text-end shrink-0">
                <span className="text-lg font-extrabold text-purple-700">₪{price}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-2">
                בחר אמצעי תשלום נוח:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Bit */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bit')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedMethod === 'bit'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white border-purple-100/90 text-slate-700 hover:bg-purple-50/50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-bold">Bit (ביט)</span>
                </button>

                {/* PayBox - Solid Sky Blue (תכלת) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('paybox')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedMethod === 'paybox'
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-white border-purple-100/90 text-slate-700 hover:bg-sky-50/50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold">PayBox</span>
                </button>

                {/* Apple / Google Pay - Solid Lilac (לילך) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('apple_pay')}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedMethod === 'apple_pay'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-white border-purple-100/90 text-slate-700 hover:bg-purple-50/50'
                  }`}
                >
                  <span className="text-sm font-bold"> / G Pay</span>
                  <span className="text-[10px] font-semibold opacity-90">מהיר</span>
                </button>
              </div>

              {/* Second row of payment options */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('credit_card')}
                  className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedMethod === 'credit_card'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">כרטיס אשראי</span>
                </button>

                {/* Cash - Solid Pink (ורדרד) */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cash')}
                  className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedMethod === 'cash'
                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                      : 'bg-white border-purple-100 text-slate-700 hover:bg-pink-50/50'
                  }`}
                >
                  <span className="text-xs font-bold">איסוף ומזומן</span>
                </button>
              </div>
            </div>

            {/* Method Details Form */}
            {selectedMethod === 'bit' && (
              <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-950">מספר טלפון לחיוב Bit:</span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">אישור מיידי</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-purple-200 focus:outline-hidden focus:border-purple-600 bg-white"
                  placeholder="05X-XXXXXXX"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  בלחיצה על "שלם עכשיו", תועבר בקשת תשלום ישירות לאפליקציית Bit במכשירך.
                </p>
              </div>
            )}

            {selectedMethod === 'paybox' && (
              <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-950">מספר טלפון ל-PayBox:</span>
                  <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">פייבוקס לנוער</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-sky-200 focus:outline-hidden focus:border-sky-600 bg-white"
                  placeholder="05X-XXXXXXX"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  החיוב יבוצע ישירות מחשבון הפייבוקס המקושר למספר זה.
                </p>
              </div>
            )}

            {selectedMethod === 'apple_pay' && (
              <div className="p-3 rounded-2xl bg-slate-900 text-white text-center space-y-2">
                <p className="text-xs font-medium opacity-90">
                  אישור תשלום בנגיעה אחת עם Touch ID או Face ID
                </p>
                <div className="text-sm font-bold flex items-center justify-center gap-1.5 py-1">
                  <span>תשלום מאובטח עם Apple Pay / Google Pay</span>
                </div>
              </div>
            )}

            {selectedMethod === 'credit_card' && (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    שם בעל הכרטיס
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-purple-100 focus:outline-hidden focus:border-purple-600 bg-slate-50/60"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    {t.checkout.cardNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full py-2 px-3 ps-8 text-xs font-mono rounded-xl border border-purple-100 focus:outline-hidden focus:border-purple-600 bg-slate-50/60"
                      required
                    />
                    <CreditCard className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      {t.checkout.expiry}
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-purple-100 focus:outline-hidden focus:border-purple-600 bg-slate-50/60"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      {t.checkout.cvv}
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-purple-100 focus:outline-hidden focus:border-purple-600 bg-slate-50/60"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'cash' && (
              <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-1 text-xs text-slate-700">
                <span className="font-bold text-pink-900 block">איסוף ותשלום במזומן מול המוכר:</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  הפריט ישוריין עבורך. תוכלו לתאם מקום מפגש בטוח (קניון / בית ספר) דרך הצ׳אט באפליקציה.
                </p>
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-purple-600" />
              <span>הצפנה מקצה לקצה 256-bit SSL</span>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    שלם עכשיו ₪{price}
                  </span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
