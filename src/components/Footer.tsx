import React from 'react';
import { Bus, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">VeloxBus</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              VeloxBus is a next-generation online bus ticket booking platform offering 10,000+ luxury routes, live GPS bus tracking, and instant refunds.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              256-Bit SSL Encrypted Transactions
            </div>
          </div>

          {/* Popular Routes */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Routes</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer">New York to Boston Bus</li>
              <li className="hover:text-emerald-400 cursor-pointer">New York to Washington DC</li>
              <li className="hover:text-emerald-400 cursor-pointer">Bangalore to Hyderabad Sleeper</li>
              <li className="hover:text-emerald-400 cursor-pointer">Mumbai to Pune Volvo AC</li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Support</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer">24x7 Help Center & Chatbot</li>
              <li className="hover:text-emerald-400 cursor-pointer">Cancellation & Refund Policy</li>
              <li className="hover:text-emerald-400 cursor-pointer">Baggage & Pet Allowances</li>
              <li className="hover:text-emerald-400 cursor-pointer">Operator Partnership Portal</li>
            </ul>
          </div>

          {/* Emergency Line */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Helpline</h4>
            <p className="text-[11px] text-slate-400">24/7 Toll-Free Passenger Helpline:</p>
            <p className="text-sm font-black text-emerald-400">+1 (800) 555-VELOX</p>
            <p className="text-[10px] text-slate-500">Email: support@veloxbus.com</p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} VeloxBus Reservation Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for modern travelers everywhere.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
