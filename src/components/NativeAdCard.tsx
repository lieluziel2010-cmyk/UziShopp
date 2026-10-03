import React, { useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NativeAdCardProps {
  index: number;
}

const NATIVE_AD_CREATIVES = [
  {
    id: 'ad_skate_drop',
    brand: 'RetroSkate Co.',
    title: 'Drop קולקציית סקייט וינטג׳ חדשה לנוער',
    description: 'סניקרס וקרשים בעיצוב רטרו בלעדי. 15% הנחה לקונים דרך האפליקציה!',
    imageUrl: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=600&q=80',
    ctaText: 'למידע נוסף',
    url: 'https://example.com/retroskate',
  },
  {
    id: 'ad_aesthetic_audio',
    brand: 'PastelSound',
    title: 'אוזניות בלוטות׳ בצבעי פסטל מתוקים',
    description: 'סינון רעשים אקטיבי, סוללה ל-40 שעות וסאונד מדהים לכל הסטייל שלך.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    ctaText: 'למידע נוסף',
    url: 'https://example.com/pastelsound',
  },
  {
    id: 'ad_thrift_eco',
    brand: 'EcoTeen Fashion',
    title: 'סדנת סטיילינג וינטג׳ ומיחזור בגדים',
    description: 'גלה איך לשדרג בגדים יד שנייה בלוק אישי וייחודי. הצטרף לקהילה!',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    ctaText: 'למידע נוסף',
    url: 'https://example.com/ecoteen',
  },
  {
    id: 'ad_gaming_gear',
    brand: 'PixelArcade',
    title: 'מקלדות גיימינג מכאניות בעיצוב מותאם אישית',
    description: 'סוויצ׳ים שקטים, תאורת RGB רכה ומקשים בצבעי תכלת וסגול עדין.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    ctaText: 'למידע נוסף',
    url: 'https://example.com/pixelarcade',
  },
];

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ index }) => {
  const { dir, t, showToast } = useApp();

  const clientId = (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-3323803410489439';
  const slotId = (import.meta as any).env?.VITE_ADSENSE_SLOT_ID || 'XXXXXXXXXX';

  const creative = NATIVE_AD_CREATIVES[Math.floor(index / 7) % NATIVE_AD_CREATIVES.length] || NATIVE_AD_CREATIVES[0];

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // Graceful fallback for ad blocker / dev sandbox
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast(`מעבר לעמוד המפרסם: ${creative.brand}`, 'info');
  };

  return (
    <article
      dir={dir}
      onClick={handleClick}
      className="group relative bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-[0_4px_16px_rgba(168,85,247,0.06)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)] transition-all duration-200 flex flex-col text-start cursor-pointer"
    >
      {/* Google AdSense Integration Container */}
      <div className="hidden" aria-hidden="true">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Ad Image Container matching 4:3 Product Card Aspect Ratio */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={creative.imageUrl}
          alt={creative.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Subtle "חסות" / "Ad" Badge with Info Icon */}
        <div className="absolute top-2.5 end-2.5 z-10">
          <span className="bg-white/95 backdrop-blur-md text-slate-600 border border-purple-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Info className="w-2.5 h-2.5 text-purple-600 shrink-0" />
            <span>{t.ads?.adTag || 'חסות Google'}</span>
          </span>
        </div>

        {/* Brand Chip */}
        <div className="absolute bottom-2.5 start-2.5 z-10">
          <span className="text-[10px] font-bold bg-white/95 backdrop-blur-md text-purple-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-purple-100">
            {creative.brand}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between text-start">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              {t.ads?.adNotice || 'תוכן ממומן'}
            </span>
          </div>

          <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
            {creative.title}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {creative.description}
          </p>
        </div>

        {/* CTA Button matching native card styling */}
        <div className="mt-3 pt-2 border-t border-purple-50">
          <div
            className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border border-purple-200 transition-all active:scale-98 shadow-2xs"
          >
            <span>{t.ads?.learnMore || 'למידע נוסף'}</span>
            <ExternalLink className="w-3 h-3 text-purple-600" />
          </div>
        </div>
      </div>
    </article>
  );
};
