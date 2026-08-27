import React, { useState } from 'react';
import { Bus, Passenger, Booking } from '../types';
import { X, Phone, Mail, Tag, Building, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  bus: Bus | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  bus,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const {
    selectedSeats,
    passengers,
    setPassengers,
    boardingPoint,
    droppingPoint,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    createBooking,
    formatPrice
  } = useBooking();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success?: boolean; message?: string }>({});
  
  const [contactEmail, setContactEmail] = useState(user?.email || 'alex.johnson@example.com');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+1 (555) 234-5678');
  
  const [includeGst, setIncludeGst] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'authorizing' | 'success'>('idle');

  if (!isOpen || !bus) return null;

  const unitPrice = bus.discountPrice || bus.price;
  const baseTotal = selectedSeats.length * unitPrice;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleQuickFillPassenger = (index: number, saved: Passenger) => {
    handlePassengerChange(index, 'name', saved.name);
    handlePassengerChange(index, 'age', saved.age);
    handlePassengerChange(index, 'gender', saved.gender);
  };

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    const res = await applyPromoCode(promoInput);
    setPromoStatus(res);
  };

  const handlePayAndConfirm = async () => {
    // Basic validation
    for (let p of passengers) {
      if (!p.name.trim()) {
        alert(`Please enter full name for Seat ${p.seatNumber}`);
        return;
      }
    }
    if (!contactEmail || !contactPhone) {
      alert('Please enter valid contact email and mobile number for ticket dispatch.');
      return;
    }

    setIsProcessing(true);
    setPaymentStage('authorizing');

    // Step 1: Confirm booking with server
    setTimeout(() => {
      // Step 2: Show green tick mark "Booking Successful"
      setPaymentStage('success');

      // Step 3: Create booking & trigger confirmation
      setTimeout(async () => {
        const newBooking = await createBooking(
          'upi',
          contactEmail,
          contactPhone,
          includeGst ? gstNumber : undefined,
          includeGst ? companyName : undefined
        );
        setIsProcessing(false);
        setPaymentStage('idle');

        if (newBooking) {
          onBookingSuccess(newBooking);
        } else {
          alert('Booking failed. Please try again.');
        }
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative">
        
        {/* Processing & Confirmation Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            {paymentStage === 'success' ? (
              <div className="space-y-4 animate-in zoom-in-90 duration-300 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/30">
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
                    Booking Confirmed & Successful!
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    Booking ID: TXN{Math.floor(100000000 + Math.random() * 900000000)}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                  Reserving seats {selectedSeats.join(', ')} & issuing your confirmed bus ticket...
                </p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 rounded-full animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    Confirming Your Ticket...
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Reserving seats with travel operator
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-1 rounded-full font-medium">
                  Please do not refresh or close this browser window
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
              Confirm Booking & Passenger Details
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              {bus.name} • {selectedSeats.length} Seat(s) selected ({selectedSeats.join(', ')})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white bg-black/10 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Passengers & Contact */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Passenger Forms */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
                <span>Passenger Information</span>
                {user && user.savedPassengers.length > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Quick-select saved profiles below
                  </span>
                )}
              </h3>

              <div className="space-y-4">
                {passengers.map((p, idx) => (
                  <div key={p.seatNumber || idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md">
                        Passenger {idx + 1} (Seat {p.seatNumber})
                      </span>

                      {/* Quick fill pills */}
                      {user && user.savedPassengers.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-slate-400 font-semibold">Autofill:</span>
                          {user.savedPassengers.map((saved, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleQuickFillPassenger(idx, saved)}
                              className="px-2 py-0.5 bg-white dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded font-medium transition-colors"
                            >
                              {saved.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                          placeholder="Full Name as on Govt ID"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Age</label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                          min={1}
                          max={100}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Ticket Dispatch Details (SMS & Email)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GST Tax Invoice Toggle */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Building className="w-4 h-4 text-emerald-600" />
                Add GST & Business Tax Invoice (Optional)
              </label>

              {includeGst && (
                <div className="grid grid-cols-2 gap-2 pt-2 animate-in fade-in">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Registered Name"
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="GST Identification Number"
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Promo Code & Confirmation */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Promo Code Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Tag className="w-4 h-4 text-amber-500" /> Apply Coupon Code
                </p>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-100 dark:bg-emerald-950 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs">
                    <div>
                      <p className="font-extrabold text-emerald-800 dark:text-emerald-200">{appliedPromo.code}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{appliedPromo.description}</p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. VELOX100"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase text-slate-800 dark:text-slate-100"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {promoStatus.message && (
                  <p className={`text-[10px] font-semibold ${promoStatus.success ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {promoStatus.message}
                  </p>
                )}

                <p className="text-[10px] text-slate-400">
                  Tip: Use <strong className="text-emerald-600">VELOX100</strong> for ₹100 off or <strong className="text-emerald-600">SUPERBUS</strong> for 20% off.
                </p>
              </div>

              {/* Fare Summary Breakdown */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Base Fare ({selectedSeats.length} Seats)</span>
                  <span>{formatPrice(baseTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-baseline font-black text-slate-800 dark:text-slate-100">
                  <span className="text-sm">Total Ticket Price:</span>
                  <span className="text-xl text-emerald-600 dark:text-emerald-400">{formatPrice(finalTotal)}</span>
                </div>
              </div>

            </div>

            {/* Confirm Booking Button */}
            <button
              onClick={handlePayAndConfirm}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <CheckCircle className="w-5 h-5" />
              {isProcessing ? 'Confirming Booking...' : `Confirm & Book Ticket (${formatPrice(finalTotal)})`}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
