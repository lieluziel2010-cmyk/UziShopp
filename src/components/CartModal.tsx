import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export const CartModal: React.FC = () => {
  const { 
    isCartOpen, 
    closeCart, 
    cart, 
    cartCount, 
    cartTotal, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    openCheckoutModal,
    dir
  } = useApp();

  if (!isCartOpen) return null;

  const isRtl = dir === 'rtl';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleProceedToCheckout = () => {
    closeCart();
    openCheckoutModal('cart_checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div 
        dir={dir}
        className="fixed inset-y-0 end-0 max-w-full flex pl-10"
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-s border-purple-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-white/95 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4 text-purple-900" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">סל הקניות שלך</h3>
                <p className="text-xs text-slate-500 font-medium">{cartCount} פריטים נבחרו</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  רוקן סל
                </button>
              )}
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                aria-label="סגור סל"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="grow overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">סל הקניות שלך ריק</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  הפיד מלא במציאות של בגדי וינטג׳, סניקרס, גיימינג ואקססוריז במחירים מעולים
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  לגילוי פריטים בפיד
                </button>
              </div>
            ) : (
              cart.map((cartItem) => {
                const item = cartItem.item;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 border border-purple-100/80 shadow-2xs hover:bg-white hover:border-purple-200 transition-all"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-purple-100"
                    />

                    <div className="grow min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-purple-700">
                          ₪{item.price}
                        </span>
                        {item.size && (
                          <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded-md">
                            {item.size}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-purple-100 px-1.5 py-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-purple-600 transition-colors"
                            aria-label="הפחת כמות"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, cartItem.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-purple-600 transition-colors"
                            aria-label="הוסף כמות"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          aria-label="מחק מהסל"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-purple-100 bg-white space-y-3 shadow-lg">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>סכום ביניים</span>
                  <span className="font-semibold text-slate-900">₪{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>הגנת קונה וטיפול מאובטח</span>
                  <span className="font-semibold text-sky-600">חינם</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 text-sm font-bold text-slate-900">
                  <span>סה״כ לתשלום</span>
                  <span className="text-base text-purple-700">₪{cartTotal}</span>
                </div>
              </div>

              {/* Secure Payment Badges */}
              <div className="flex items-center justify-center gap-3 py-1.5 px-2 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>תשלום מאובטח עם Bit, פייבוקס, Apple Pay, Google Pay ואשראי</span>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>המשך לתשלום מאובטח</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
