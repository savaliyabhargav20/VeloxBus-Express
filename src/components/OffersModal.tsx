import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles, Shield, Gift } from 'lucide-react';
import { PROMO_CODES } from '../data/mockData';

export const OffersModal: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-full border border-amber-500/20">
          <Gift className="w-4 h-4" />
          VeloxBus Exclusive Special Offers
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
          Coupons, Deals & Promo Codes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Apply these coupon codes during checkout to enjoy instant cashbacks and flat discounts on your trip.
        </p>
      </div>

      {/* Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROMO_CODES.map((promo) => (
          <div
            key={promo.code}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-emerald-200 dark:border-emerald-800/80 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {promo.discountType === 'fixed' ? `₹${promo.value} OFF` : `${promo.value}% OFF`}
                </span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-wider font-mono">
                {promo.code}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {promo.description}
              </p>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p>Min Booking Fare: ₹{promo.minBookingValue}</p>
                <p>Valid until: {promo.expiryDate}</p>
              </div>
            </div>

            <button
              onClick={() => handleCopy(promo.code)}
              className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                copiedCode === promo.code
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {copiedCode === promo.code ? (
                <>
                  <Check className="w-4 h-4" />
                  Code Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-600" />
                  Copy Promo Code
                </>
              )}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
