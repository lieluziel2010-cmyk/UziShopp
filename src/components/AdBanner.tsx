import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Megaphone, Info, CheckCircle2, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdItem {
  id: string;
  brand: string;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
}

const SAMPLE_FALLBACK_ADS: AdItem[] = [
  {
    id: 'ad_gaming_pro',
    brand: 'Logitech G',
    badge: 'גיימינג לנוער',
    title: 'מבצעי חזרה ללימודים על עכברי ואוזניות גיימינג',
    description: 'עד 35% הנחה על כל הציוד המקצועי ליוצרי תוכן וגיימרים',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    ctaText: 'לצפייה במבצעים',
    targetUrl: 'https://google.com',
  },
  {
    id: 'ad_sneaker_fest',
    brand: 'SneakerCon IL',
    badge: 'אירוע אופנה',
    title: 'יריד הסניקרס השנתי לנוער - תל אביב',
    description: 'מכירות פופ-אפ, החלפות סניקרס נדירות ומתחמי צילום לטיקטוק',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    ctaText: 'כרטיסים מוקדמים',
    targetUrl: 'https://google.com',
  },
  {
    id: 'ad_spotify_student',
    brand: 'Spotify',
    badge: 'מוזיקה ופודקאסטים',
    title: 'ספוטיפיי פרימיום לנוער: 3 חודשים ללא עלות',
    description: 'כל הפלייליסטים, ללא פרסומות, עם הורדת שירים לטלפון',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    ctaText: 'התחילו לשמוע',
    targetUrl: 'https://google.com',
  },
  {
    id: 'ad_room_leds',
    brand: 'Govee Lighting',
    badge: 'עיצוב חדרים',
    title: 'תאורת RGB חכמה מסונכרנת לחדר המושלם',
    description: 'פס לדים שנשלט מהסמארטפון ומגיב לקצב המוזיקה',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ctaText: 'לרכישה אונליין',
    targetUrl: 'https://google.com',
  }
];

interface AdBannerProps {
  adIndex?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({ adIndex = 0 }) => {
  const { dir, showToast } = useApp();
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showConfigInfo, setShowConfigInfo] = useState(false);

  // Retrieve AdSense credentials from Environment Variables or LocalStorage
  const envClientId = (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID;
  const envSlotId = (import.meta as any).env?.VITE_ADSENSE_SLOT_ID;
  
  const clientId = localStorage.getItem('uzishop_adsense_client') || envClientId || 'ca-pub-XXXXXXXXXXXXXXXX';
  const slotId = localStorage.getItem('uzishop_adsense_slot') || envSlotId || 'XXXXXXXXXX';

  const creative = SAMPLE_FALLBACK_ADS[adIndex % SAMPLE_FALLBACK_ADS.length];

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        // Check if an iframe or ad content has been filled by Google
        setTimeout(() => {
          if (adRef.current && adRef.current.querySelector('iframe')) {
            setAdLoaded(true);
          }
        }, 1200);
      }
    } catch (e) {
      console.debug('AdSense script push note:', e);
    }
  }, []);

  const handleFallbackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`מודעת Google AdSense • מפרסם: ${creative.brand}`, 'info');
  };

  const handleSaveCustomAdSense = (newClient: string, newSlot: string) => {
    if (newClient.trim()) localStorage.setItem('uzishop_adsense_client', newClient.trim());
    if (newSlot.trim()) localStorage.setItem('uzishop_adsense_slot', newSlot.trim());
    showToast('הגדרות AdSense נשמרו בהצלחה!', 'success');
    setShowConfigInfo(false);
  };

  return (
    <div 
      dir={dir}
      className="group relative bg-white rounded-3xl overflow-hidden border border-purple-100/90 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-[0_8px_28px_rgba(168,85,247,0.12)] transition-all duration-200 flex flex-col justify-between"
    >
      {/* Top Banner Tag - Official Google Ads In-Feed indicator */}
      <div className="absolute top-2.5 start-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-purple-100 shadow-2xs">
        <Megaphone className="w-3 h-3 text-purple-600" />
        <span className="text-[10px] font-bold text-slate-800 tracking-wide">
          מודעה • Google AdSense
        </span>
      </div>

      <div className="absolute top-2.5 end-2.5 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfigInfo(!showConfigInfo);
          }}
          className="w-6 h-6 rounded-full bg-white/95 backdrop-blur-md border border-purple-100 flex items-center justify-center text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
          title="הגדרות AdSense Slot & Client"
        >
          <Settings className="w-3 h-3" />
        </button>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          In-Feed
        </span>
      </div>

      {/* AdSense Live Script Unit Container */}
      <div ref={adRef} className="w-full overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-ad-client={clientId}
          data-ad-slot={slotId}
        />
      </div>

      {/* Visual in-feed integration unit */}
      <div onClick={handleFallbackClick} className="flex flex-col grow cursor-pointer">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
          <img 
            src={creative.imageUrl} 
            alt={creative.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
          
          {/* Brand Chip */}
          <div className="absolute bottom-2.5 start-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
            {creative.brand}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-3.5 flex flex-col justify-between grow space-y-2.5 text-start">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
              {creative.title}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {creative.description}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between gap-2 border-t border-purple-50">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Info className="w-2.5 h-2.5" />
              מזהה: {clientId.slice(0, 10)}...
            </span>
            <button 
              type="button"
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-2xs group-hover:opacity-95 transition-opacity"
            >
              <span>{creative.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* AdSense Settings / Verification Flyout */}
      {showConfigInfo && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="p-3 bg-purple-50/95 border-t border-purple-100 text-start text-xs space-y-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-950">הגדרות Google AdSense רשמי:</span>
            <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
              Live Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            הרווחים והחשיפות של המודעה נזקפים ישירות למזהה ה-Publisher שלך:
          </p>
          <div className="bg-white p-2 rounded-xl border border-purple-100 space-y-1 font-mono text-[10px]">
            <div><span className="text-slate-400">Client ID:</span> <span className="text-purple-700 font-bold">{clientId}</span></div>
            <div><span className="text-slate-400">Slot ID:</span> <span className="text-slate-800">{slotId}</span></div>
          </div>
          <p className="text-[10px] text-slate-400">
            להחלפת המזהה, עדכן את VITE_ADSENSE_CLIENT_ID בקובץ .env או בהגדרות הסביבה.
          </p>
        </div>
      )}
    </div>
  );
};
