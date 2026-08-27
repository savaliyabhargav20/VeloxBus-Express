import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { X, CheckCircle, Download, Share2, MapPin, Calendar, Clock, Ticket, Printer, Mail, Phone, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useBooking } from '../context/BookingContext';
import jsPDF from 'jspdf';

interface TicketConfirmationModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTracker: (busId: string) => void;
  onGoToUpcomingTrips?: () => void;
}

export const TicketConfirmationModal: React.FC<TicketConfirmationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onOpenTracker,
  onGoToUpcomingTrips
}) => {
  const { formatPrice } = useBooking();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shareMsg, setShareMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen && booking) {
      // Trigger confetti animation
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback silently if canvas-confetti environment issue
      }

      // Generate QR Code
      const qrData = `VELOXBUS|PNR:${booking.pnr}|ID:${booking.id}|BUS:${booking.busDetails.busName}|SEATS:${booking.seats.join(',')}|DATE:${booking.journeyDate}`;
      QRCode.toDataURL(qrData, { width: 200, margin: 1 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor: [number, number, number] = [16, 185, 129];
      const darkSlate: [number, number, number] = [15, 23, 42];
      const grayBg: [number, number, number] = [248, 250, 252];
      const grayText: [number, number, number] = [100, 116, 139];

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('VELOXBUS EXPRESS', 14, 16);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL E-TICKET & BOARDING PASS', 14, 23);

      // PNR Badge
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(145, 8, 51, 16, 3, 3, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PNR NUMBER', 150, 13);
      doc.setFontSize(12);
      doc.text(booking.pnr, 150, 20);

      let y = 42;

      // Bus Details Card
      doc.setFillColor(...grayBg);
      doc.roundedRect(14, y, 182, 38, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 38, 3, 3, 'D');

      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(booking.busDetails.busName, 20, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...grayText);
      doc.text(`Operator: ${booking.busDetails.operator}`, 20, y + 18);
      doc.text(`Bus Type: ${booking.busDetails.busType}`, 20, y + 25);
      doc.text(`Booking Ref ID: ${booking.id}`, 20, y + 32);

      // QR Code
      if (qrCodeUrl) {
        doc.addImage(qrCodeUrl, 'PNG', 158, y + 4, 30, 30);
      }

      y += 46;

      // Boarding & Dropping Points
      doc.setFillColor(...grayBg);
      doc.roundedRect(14, y, 88, 36, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 88, 36, 3, 3, 'D');

      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('BOARDING POINT & DEPARTURE', 18, y + 8);

      doc.setTextColor(...darkSlate);
      doc.setFontSize(11);
      doc.text(booking.boardingPoint.name, 18, y + 16);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayText);
      doc.text(doc.splitTextToSize(booking.boardingPoint.location, 80), 18, y + 22);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`Time: ${booking.boardingPoint.time} (${booking.journeyDate})`, 18, y + 31);

      // Dropping Box
      doc.setFillColor(...grayBg);
      doc.roundedRect(108, y, 88, 36, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(108, y, 88, 36, 3, 3, 'D');

      doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('DROPPING POINT & ARRIVAL', 112, y + 8);

      doc.setTextColor(...darkSlate);
      doc.setFontSize(11);
      doc.text(booking.droppingPoint.name, 112, y + 16);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayText);
      doc.text(doc.splitTextToSize(booking.droppingPoint.location, 80), 112, y + 22);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(225, 29, 72);
      doc.text(`Arrival Time: ${booking.droppingPoint.time}`, 112, y + 31);

      y += 44;

      // Passengers Header
      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PASSENGER MANIFEST & SEATS', 14, y);

      y += 6;

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      doc.setFontSize(9);
      doc.setTextColor(...darkSlate);
      doc.text('S.No', 18, y + 5.5);
      doc.text('Passenger Name', 35, y + 5.5);
      doc.text('Age / Gender', 110, y + 5.5);
      doc.text('Seat Number', 160, y + 5.5);

      y += 8;

      booking.passengers.forEach((p, idx) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(14, y, 182, 9, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 9, 196, y + 9);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkSlate);
        doc.text(`${idx + 1}`, 18, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.text(p.name, 35, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(`${p.age} yrs / ${p.gender.toUpperCase()}`, 110, y + 6);

        doc.setFillColor(...primaryColor);
        doc.roundedRect(158, y + 1.5, 22, 6, 1.5, 1.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`Seat ${p.seatNumber}`, 161, y + 5.5);

        y += 9;
      });

      y += 8;

      // Fare Box
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(14, y, 182, 16, 3, 3, 'D');

      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Payment Method: ${booking.paymentMethod.toUpperCase()}`, 20, y + 10.5);

      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.text(`Total Paid: ${formatPrice(booking.finalAmount)}`, 135, y + 10.5);

      y += 24;

      // Instructions
      doc.setTextColor(...darkSlate);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Important Boarding Guidelines:', 14, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...grayText);
      const instructions = [
        '1. Carry a valid Government Photo ID proof along with this e-ticket during boarding.',
        '2. Report at the boarding point at least 15 minutes prior to scheduled departure.',
        '3. For real-time bus location tracking, use the Live GPS feature on VeloxBus.',
        '4. 24x7 Customer Support Helpline: 1800-VELOX-BUS | support@veloxbus.com'
      ];

      instructions.forEach(line => {
        doc.text(line, 14, y);
        y += 5;
      });

      doc.save(`VeloxBus_Ticket_${booking.pnr}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `VeloxBus Ticket - PNR ${booking.pnr}`,
        text: `My bus ticket from ${booking.source} to ${booking.destination} on ${booking.journeyDate}. PNR: ${booking.pnr}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`VeloxBus Ticket PNR: ${booking.pnr}, Journey: ${booking.source} -> ${booking.destination} on ${booking.journeyDate}`);
      setShareMsg('Ticket summary copied to clipboard!');
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:static print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden print:shadow-none print:border-none print:max-w-full">
        
        {/* Top Celebration Bar (Hidden in Print) */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 relative print:hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Booking Confirmed</p>
              <h2 className="text-2xl font-black">Your E-Ticket is Ready!</h2>
              <p className="text-xs text-emerald-100 mt-0.5">Booking ID: {booking.id} • PNR: {booking.pnr}</p>
            </div>
          </div>
        </div>

        {/* E-Ticket Printable Card Body */}
        <div className="p-6 space-y-6">
          
          {/* Ticket Header & QR Code */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Official E-Ticket
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{booking.busDetails.busName}</h3>
              <p className="text-xs text-slate-500 font-semibold">{booking.busDetails.operator} • {booking.busDetails.busType}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">PNR: {booking.pnr}</p>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <img src={qrCodeUrl} alt="Bus Ticket QR Code" className="w-24 h-24 rounded-lg border border-slate-200 shadow-xs" />
                <span className="text-[9px] text-slate-400 font-mono mt-1">Scan for Boarding</span>
              </div>
            )}
          </div>

          {/* Route & Timing Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Boarding Point & Departure</p>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{booking.boardingPoint.name}</p>
              <p className="text-slate-500">{booking.boardingPoint.location}</p>
              <p className="text-emerald-600 font-black mt-1">Time: {booking.boardingPoint.time} ({booking.journeyDate})</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Dropping Point & Arrival</p>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{booking.droppingPoint.name}</p>
              <p className="text-slate-500">{booking.droppingPoint.location}</p>
              <p className="text-rose-500 font-black mt-1">Time: {booking.droppingPoint.time}</p>
            </div>
          </div>

          {/* Passengers & Seat Numbers */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Passenger Manifest
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {booking.passengers.map((p, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({p.age} yrs, {p.gender})</span>
                  </div>
                  <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-md">
                    Seat {p.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fare Summary */}
          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Total Paid ({booking.paymentMethod.toUpperCase()}):</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(booking.finalAmount)}</span>
          </div>

          {/* Action Toolbar (Hidden in Print) */}
          <div className="pt-2 flex flex-wrap gap-2 print:hidden">
            <button
              onClick={() => {
                onClose();
                if (onGoToUpcomingTrips) onGoToUpcomingTrips();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Ticket className="w-4 h-4" />
              View Ticket in Upcoming Trips
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20"
            >
              <Download className="w-4 h-4" />
              Download PDF Ticket
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleShareTicket}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenTracker(booking.busId);
              }}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
            >
              <MapPin className="w-4 h-4 animate-bounce" />
              Track Bus Live GPS
            </button>
          </div>

          {shareMsg && (
            <p className="text-xs text-emerald-600 font-semibold text-center animate-in fade-in">{shareMsg}</p>
          )}

        </div>

      </div>
    </div>
  );
};
