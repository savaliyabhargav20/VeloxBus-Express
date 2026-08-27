import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Wallet, Plus, Trash2, Mail, Phone, ShieldCheck, CreditCard, Save } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { user, updateProfile, addSavedPassenger, deleteSavedPassenger } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [newPassName, setNewPassName] = useState('');
  const [newPassAge, setNewPassAge] = useState(25);
  const [newPassGender, setNewPassGender] = useState<'male' | 'female' | 'other'>('male');

  const [walletAmount, setWalletAmount] = useState(500);
  const [saveStatus, setSaveStatus] = useState('');

  // Saved Payment Methods local state
  const [savedUpiId, setSavedUpiId] = useState('alex@okaxis');
  const [savedCardLast4, setSavedCardLast4] = useState('4242');
  const [savedBank, setSavedBank] = useState('HDFC Bank');
  const [paymentSavedMsg, setPaymentSavedMsg] = useState('');

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    setSaveStatus('Profile updated successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleAddPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassName) return;
    addSavedPassenger({
      name: newPassName,
      age: newPassAge,
      gender: newPassGender,
      seatNumber: ''
    });
    setNewPassName('');
  };

  const handleTopupWallet = () => {
    updateProfile({ walletBalance: user.walletBalance + walletAmount });
    alert(`Successfully added ₹${walletAmount} to your Velox Wallet! New Balance: ₹${(user.walletBalance + walletAmount).toLocaleString('en-IN')}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-7 h-7 text-emerald-600" />
          My Profile & Travel Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage personal contact details, saved passenger profiles, and Velox Wallet balance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Personal Information & Wallet */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Profile Details Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Personal Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>

              {saveStatus && (
                <p className="text-xs text-emerald-600 font-bold animate-in fade-in">{saveStatus}</p>
              )}
            </form>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/20 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Velox Wallet Balance</p>
                <p className="text-3xl font-black">₹{user.walletBalance.toLocaleString('en-IN')}</p>
              </div>
              <Wallet className="w-8 h-8 text-emerald-200" />
            </div>

            <p className="text-xs text-emerald-100">
              Use Velox Wallet for 1-click instant ticket reservations and zero-fee instant refund processing.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => setWalletAmount(Number(e.target.value))}
                className="w-24 bg-white/20 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white font-bold placeholder-white/60 focus:outline-none"
                min={100}
              />
              <button
                onClick={handleTopupWallet}
                className="px-4 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                + Top Up Wallet
              </button>
            </div>
          </div>

          {/* Saved Payment Instruments Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Saved Payment Methods
              </h3>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 font-bold px-2 py-0.5 rounded-full">
                Fast Checkout Active
              </span>
            </div>

            <div className="space-y-3">
              {/* Primary Saved UPI */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    📱 Preferred UPI VPA
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.2 rounded">Default</span>
                </div>
                <input
                  type="text"
                  value={savedUpiId}
                  onChange={(e) => setSavedUpiId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Saved Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    💳 Saved Credit / Debit Card
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Visa Ending in {savedCardLast4}</span>
                </div>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-semibold">
                  •••• •••• •••• {savedCardLast4} (Expires 12/28)
                </p>
              </div>

              {/* Saved NetBanking Bank */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    🏦 Preferred Bank (NetBanking)
                  </span>
                </div>
                <select
                  value={savedBank}
                  onChange={(e) => setSavedBank(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPaymentSavedMsg('Payment preferences updated!');
                  setTimeout(() => setPaymentSavedMsg(''), 3000);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Update Saved Payment Details
              </button>

              {paymentSavedMsg && (
                <p className="text-xs text-emerald-600 font-bold text-center animate-in fade-in">{paymentSavedMsg}</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Saved Passengers */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Saved Passenger Profiles
            </h3>

            {/* List */}
            {user.savedPassengers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No saved passengers yet. Add frequent co-travelers for quick 1-click booking!</p>
            ) : (
              <div className="space-y-2">
                {user.savedPassengers.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{p.age} yrs • {p.gender}</p>
                    </div>
                    <button
                      onClick={() => deleteSavedPassenger(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove Passenger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Passenger Form */}
            <form onSubmit={handleAddPassenger} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Passenger</p>
              
              <input
                type="text"
                value={newPassName}
                onChange={(e) => setNewPassName(e.target.value)}
                placeholder="Passenger Full Name"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={newPassAge}
                  onChange={(e) => setNewPassAge(Number(e.target.value))}
                  placeholder="Age"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                />

                <select
                  value={newPassGender}
                  onChange={(e) => setNewPassGender(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add to Saved List
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
