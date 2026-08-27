import React, { useState, useEffect } from 'react';
import { Bus, PromoCode } from '../types';
import { ShieldCheck, Bus as BusIcon, DollarSign, Users, Ticket, Plus, Tag, RefreshCw } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { BUS_TYPES } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { formatPrice } = useBooking();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'buses' | 'promos' | 'manifest'>('buses');

  // New bus form state
  const [busName, setBusName] = useState('Velox Metro Express');
  const [operator, setOperator] = useState('VeloxBus Express Lines');
  const [busType, setBusType] = useState('Volvo Multi-Axle AC Sleeper');
  const [source, setSource] = useState('New York');
  const [destination, setDestination] = useState('Boston');
  const [depTime, setDepTime] = useState('10:00');
  const [arrTime, setArrTime] = useState('14:30');
  const [duration, setDuration] = useState('4h 30m');
  const [price, setPrice] = useState(650);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: busName,
        operator,
        busType,
        source,
        destination,
        departureTime: depTime,
        arrivalTime: arrTime,
        duration,
        price,
        rating: 4.8,
        reviewCount: 1,
        totalSeats: 24,
        amenities: ['wifi', 'power', 'water', 'tracking'],
        cancellationPolicy: 'Free cancellation up to 6 hours before departure.',
        boardingPoints: [{ id: 'b1', name: `${source} Central Station`, time: depTime, location: 'Main Platform' }],
        droppingPoints: [{ id: 'd1', name: `${destination} Terminal`, time: arrTime, location: 'Arrival Gate 1' }]
      };

      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(`New bus '${busName}' registered successfully into fleet!`);
        fetchAdminStats();
      }
    } catch (err) {
      alert('Failed to register bus');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            Admin Operations Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-Based Access Control: Manage bus fleets, route schedules, promotional offers, and system revenue analytics.
          </p>
        </div>

        <button
          onClick={fetchAdminStats}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          title="Refresh Operations Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {formatPrice(stats?.totalRevenue || 1240)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">Bookings Count</span>
            <Ticket className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {stats?.totalBookings || 28}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">Active Buses</span>
            <BusIcon className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {stats?.activeBuses || 6} Coaches
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">Fleet Occupancy</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">
            {stats?.occupancyRate || '78%'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('buses')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'buses'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Fleet
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'promos'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Promo Coupons
        </button>
      </div>

      {/* Add New Bus Form */}
      {activeTab === 'buses' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" /> Add New Bus / Route Schedule
          </h3>

          <form onSubmit={handleAddBus} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bus Name</label>
              <input
                type="text"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Operator</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bus Type</label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
              >
                {BUS_TYPES.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Source City</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destination City</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Base Ticket Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Register Bus Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promos View */}
      {activeTab === 'promos' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" /> Active System Coupon Offers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
              <p className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">VELOX100</p>
              <p className="text-slate-600 dark:text-slate-300">Flat ₹100 instant discount on first booking</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">Active • Min Order ₹400</p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
              <p className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">SUPERBUS</p>
              <p className="text-slate-600 dark:text-slate-300">20% off on Volvo Multi-Axle Sleeper buses</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">Active • Min Order ₹500</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
