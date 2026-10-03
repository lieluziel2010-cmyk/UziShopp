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
  Layers,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    checkoutState, 
    closeCheckoutModal, 
    completePayment,
    currentUser,
    dir,
    t
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('apple_pay');
  const [phoneNumber, setPhoneNumber] = useState('050-1234567');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Active sheet modal for Apple Pay / Google Pay simulation
  const [activeSheet, setActiveSheet] = useState<'apple_pay' | 'google_pay' | null>(null);

  if (!checkoutState.isOpen) return null;

  const isVip = checkoutState.type === 'vip_upgrade';
  const isShopFeature = checkoutState.type === 'shop_feature';
  
  const price = isVip 
    ? 15 
    : isShopFeature 
    ? 15 
    : 5;

  const title = isVip 
    ? t.checkout.vipTitle 
    : isShopFeature 
    ? t.checkout.shopFeatureTitle 
    : t.checkout.promoteTitle;

  const description = isVip 
    ? 'העלאת פריטים ללא הגבלה + תג מאומת VIP בפרופיל'
    : isShopFeature 
    ? 'חשיפת על בראש האפליקציה למשך שבוע שלם'
    : 'נעיצה במקום הראשון בפיד לחשיפה מקסימלית';

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const handleStartPayment = (method: PaymentMethod = selectedMethod) => {
    if (method === 'apple_pay') {
      setActiveSheet('apple_pay');
      return;
    }
    if (method === 'google_pay') {
      setActiveSheet('google_pay');
      return;
    }
    executePayment(method);
  };

  const executePayment = async (method: PaymentMethod) => {
    setIsProcessing(true);
    setProcessingStep('מתחבר לשער הסליקה UziShop...');

    setTimeout(() => {
      setProcessingStep('הצפנת טוקן מאובטחת 256-Bit (ללא חשיפת פרטים)...');
    }, 600);

    setTimeout(() => {
      setProcessingStep('מאשר שדרוג חד-פעמי ללא דמי מנוי...');
    }, 1200);

    setTimeout(async () => {
      setIsProcessing(false);
      setActiveSheet(null);
      setIsSuccess(true);

      setTimeout(async () => {
        await completePayment(method);
        setIsSuccess(false);
      }, 1200);
    }, 1800);
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
              {isVip ? (
                <ShieldCheck className="w-4 h-4" />
              ) : isShopFeature ? (
                <Store className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <span className="text-[10px] text-purple-600 font-semibold">
                UziShop Payments • סליקה רשמית
              </span>
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
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-in zoom-in">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-950">השדרוג הופעל בהצלחה!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              העסקה נקלטה ב-UziShop Payments ללא דמי מנוי קבועים.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Price & Upgrade Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-sky-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
                <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.2 rounded-md border border-emerald-200 mt-1 inline-block">
                  חד-פעמי • ללא מנוי קבוע
                </span>
              </div>
              <div className="text-end shrink-0">
                <span className="text-xl font-black text-purple-700">₪{price}</span>
              </div>
            </div>

            {/* Privacy & No Subscription Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>ללא דמי מנוי קבועים (₪0)</span>
              </div>
              <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100 text-pink-900 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>אפס חשיפת פרטים אישיים</span>
              </div>
            </div>

            {/* 1-Click Express Buttons: Apple Pay & Google Pay */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                תשלום מהיר ומאובטח בנגיעה אחת:
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/*  Apple Pay Button */}
                <button
                  type="button"
                  onClick={() => handleStartPayment('apple_pay')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-medium rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <span className="text-base font-sans"></span>
                  <span className="font-bold">Pay</span>
                  <span className="text-[10px] text-neutral-300 font-normal">| ₪{price}</span>
                </button>

                {/* Google Pay Button */}
                <button
                  type="button"
                  onClick={() => handleStartPayment('google_pay')}
                  disabled={isProcessing}
                  className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>GPay</span>
                  <span className="text-[10px] text-slate-500 font-normal">| ₪{price}</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-2 text-slate-400 font-medium">או בחר אמצעי נוסף</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('credit_card')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'credit_card'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px] font-bold">אשראי</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bit')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'bit'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white border-purple-100 text-slate-700 hover:bg-purple-50/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px] font-bold">Bit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('paybox')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'paybox'
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : 'bg-white border-purple-100 text-slate-700 hover:bg-sky-50/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-[11px] font-bold">PayBox</span>
              </button>
            </div>

            {/* Credit Card Form Fields */}
            {selectedMethod === 'credit_card' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  executePayment('credit_card');
                }}
                className="space-y-2.5 pt-1"
              >
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                    מספר כרטיס אשראי:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4580 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">
                      תוקף (MM/YY):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">
                      CVV:
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-600 bg-slate-50 font-bold text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xs shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>אשר ושדרג ב-₪{price} (UziShop)</span>
                </button>
              </form>
            )}

            {/* Bit / PayBox form */}
            {(selectedMethod === 'bit' || selectedMethod === 'paybox') && (
              <div className="space-y-2 pt-1 text-xs">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50"
                  placeholder="050-XXXXXXX"
                  required
                />
                <button
                  type="button"
                  onClick={() => executePayment(selectedMethod)}
                  disabled={isProcessing}
                  className={`w-full py-3 text-white font-bold rounded-full text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedMethod === 'bit'
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                      : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'
                  }`}
                >
                  <span>שלח בקשת חיוב ב-{selectedMethod === 'bit' ? 'Bit' : 'PayBox'} (₪{price})</span>
                </button>
              </div>
            )}

            {/* Statement notice */}
            <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>בפירוט יופיע: UziShop Payments</span>
              <span>חיוב חד-פעמי ₪{price}</span>
            </div>

          </div>
        )}
      </div>

      {/* Biometric sheet simulation for Apple Pay / Google Pay */}
      {activeSheet && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div 
            dir="ltr"
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 border border-slate-200 animate-in slide-in-from-bottom duration-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-lg font-bold font-sans">
                {activeSheet === 'apple_pay' ? 'Pay' : 'Google Pay'}
              </span>
              <button
                onClick={() => setActiveSheet(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <div className="text-start space-y-1">
              <span className="text-[10px] text-slate-400 block">MERCHANT</span>
              <span className="text-sm font-bold text-slate-900 block">UziShop Payments (TLV)</span>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                ✓ One-time upgrade • Zero subscription fees
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between font-bold">
              <span>Amount</span>
              <span className="text-purple-700 text-sm">₪{price}</span>
            </div>

            <button
              type="button"
              onClick={() => executePayment(activeSheet)}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
                activeSheet === 'apple_pay'
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {activeSheet === 'apple_pay'
                      ? `Confirm with Face ID / Touch ID (₪${price})`
                      : `Confirm with Google Account (₪${price})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && !activeSheet && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-3 shadow-2xl border border-purple-100">
            <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">מעבד שדרוג ב-UziShop...</h4>
            <p className="text-xs text-slate-500">{processingStep}</p>
          </div>
        </div>
      )}

    </div>
  );
};
