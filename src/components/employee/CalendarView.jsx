import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function CalendarView() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2)); // March 2026
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    base44.entities.Booking.list("-date", 200).then(data => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDay = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1);
  const firstDay = getFirstDay(currentDate);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const getBookingsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Kalender</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 font-semibold text-gray-900 min-w-48 text-center">
            {currentDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 rounded-lg h-24" />
        ))}
        {days.map((day) => {
          const dayBookings = getBookingsForDay(day);
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-gray-200 rounded-lg p-2 min-h-24 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="font-semibold text-gray-900 mb-1 text-sm">{day}</div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map((booking) => (
                  <motion.div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`text-xs p-1 rounded ${statusColors[booking.status]} cursor-pointer hover:shadow-sm`}
                  >
                    {booking.service}
                  </motion.div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">+{dayBookings.length - 2} mehr</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        >
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedBooking.service}</h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500">Kunde</p>
                <p className="font-semibold text-gray-900">{selectedBooking.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Datum & Uhrzeit</p>
                <p className="font-semibold text-gray-900">{selectedBooking.date} {selectedBooking.time_slot}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${statusColors[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notizen</p>
                  <p className="text-gray-700 text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <Button onClick={() => setSelectedBooking(null)} className="w-full" variant="outline">
              Schließen
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}