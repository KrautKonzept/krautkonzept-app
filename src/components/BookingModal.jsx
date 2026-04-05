import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const CATEGORIES = {
  "Marketing & Community": {
    label: "Marketing & Community",
    packages: [
      { name: "SEO Analyse", tokens: 3, price: 75 },
      { name: "Content Strategie Session", tokens: 5, price: 125 },
      { name: "Brand Audit", tokens: 8, price: 200 },
    ],
    consultants: ["Andrea", "Emanuel"],
    emails: { Andrea: "andrea@krautkonzept.de", Emanuel: "info@krautkonzept.de" }
  },
  "Strategie & Wachstum": {
    label: "Strategie & Wachstum",
    packages: [
      { name: "Erstgespräch", tokens: 0, price: 0 },
      { name: "Strategie Session", tokens: 6, price: 150 },
      { name: "Wachstums-Workshop", tokens: 15, price: 375 },
    ],
    consultants: ["Emanuel"],
    emails: { Emanuel: "info@krautkonzept.de" }
  },
  "Digitale Infrastruktur": {
    label: "Digitale Infrastruktur",
    packages: [
      { name: "Tech-Check", tokens: 4, price: 100 },
      { name: "Shop-Optimierung", tokens: 9, price: 225 },
      { name: "Automation Setup", tokens: 20, price: 500 },
    ],
    consultants: ["Dietrich", "Emanuel"],
    emails: { Dietrich: "dietrich@krautkonzept.de", Emanuel: "info@krautkonzept.de" }
  },
  "KI-Integration": {
    label: "KI-Integration",
    packages: [
      { name: "KI-Potenzialanalyse", tokens: 5, price: 125 },
      { name: "KI-Implementierung Basis", tokens: 15, price: 375 },
    ],
    consultants: ["Luc", "Emanuel"],
    emails: { Luc: "luc@krautkonzept.de", Emanuel: "info@krautkonzept.de" }
  },
  "CSC-Beratung": {
    label: "CSC-Beratung",
    packages: [
      { name: "Erstberatung CSC", tokens: 2, price: 50 },
      { name: "Compliance Check", tokens: 6, price: 150 },
      { name: "Laufende Beratung/Monat", tokens: 8, price: 200 },
    ],
    consultants: ["Emanuel", "Dietrich"],
    emails: { Emanuel: "info@krautkonzept.de", Dietrich: "dietrich@krautkonzept.de" }
  },
};

const WORKING_HOURS = { start: 8, end: 20 };

const getAvailableTimeSlots = (date) => {
  const slots = [];
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
};

const isWorkday = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Mo-Fr
};

export default function BookingModal({ isOpen, onClose, preselectedCategory }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(() => preselectedCategory || "Marketing & Community");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [consultant, setConsultant] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const categoryData = CATEGORIES[category];

  useEffect(() => {
    if (preselectedCategory && preselectedCategory !== category) {
      setCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  useEffect(() => {
    if (categoryData?.consultants?.length > 0) {
      setConsultant(categoryData.consultants[0]);
    }
  }, [category]);

  // Load booked slots for availability check
  useEffect(() => {
    base44.entities.Booking.filter({ assigned_employee: consultant })
      .then(data => setBookedSlots(data || []))
      .catch(() => setBookedSlots([]));
  }, [consultant]);

  const isSlotBooked = (date, time) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookedSlots.some(b => b.date === dateStr && b.time_slot === time && b.status !== "cancelled");
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const getDaysInCalendar = () => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start, end });
    // Offset: Monday=0, ..., Sunday=6
    const firstDay = start.getDay(); // 0=Sun,1=Mon,...,6=Sat
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return { days, offset };
  };

  const isDateDisabled = (date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return isBefore(date, now) || !isWorkday(date);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackage || !consultant || !selectedDate || !selectedTime) return;

    setLoading(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const consultantEmail = categoryData.emails[consultant];

    try {
      await base44.entities.Booking.create({
        customer_name: name,
        customer_email: email,
        service: `${category} - ${selectedPackage.name}`,
        date: formattedDate,
        time_slot: selectedTime,
        status: "pending",
        assigned_employee: consultant,
        notes: message || undefined,
      });

      const priceDisplay = `${selectedPackage.price}€ (${selectedPackage.tokens} Tokens)`;
      const dateDisplay = format(selectedDate, "dd.MM.yyyy", { locale: de });

      await Promise.all([
        base44.integrations.Core.SendEmail({
          to: email,
          subject: "Deine Anfrage bei KrautKonzept",
          body: `Hallo ${name},\n\ndeine Anfrage wurde eingegangen.\nKategorie: ${category}\nPaket: ${selectedPackage.name}\nAnsprechpartner: ${consultant}\nDatum: ${dateDisplay}\nUhrzeit: ${selectedTime} Uhr\nPreis: ${priceDisplay}${message ? `\n\nIhre Nachricht: ${message}` : ""}\n\nWir melden uns bald bei dir!\n\nBeste Grüße\nKrautKonzept Team`,
        }),
        base44.integrations.Core.SendEmail({
          to: consultantEmail,
          subject: `Neue Buchung: ${category}`,
          body: `Neue Buchungsanfrage für Dich:\n\nKunde: ${name}\nE-Mail: ${email}\nKategorie: ${category}\nPaket: ${selectedPackage.name}\nDatum: ${dateDisplay}\nUhrzeit: ${selectedTime}\nPreis: ${priceDisplay}${message ? `\n\nNachricht des Kunden:\n${message}` : ""}`,
        }),
      ]);

      setSuccess(true);
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setCategory("Marketing & Community");
        setSelectedPackage(null);
        setConsultant("Andrea");
        setSelectedDate(null);
        setSelectedTime("");
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { days: daysInMonth, offset } = getDaysInCalendar();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ touchAction: "none" }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col md:max-h-[85vh]">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 md:py-5 flex items-start justify-between flex-shrink-0">
                <div>
                  <h3 className="text-white text-lg md:text-xl font-bold">Termin vereinbaren</h3>
                  <p className="text-orange-100 text-xs md:text-sm mt-1">Mo-Fr 8:00 – 20:00 Uhr</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-orange-100 transition-colors p-2 md:p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Anfrage gesendet!</h4>
                  <p className="text-sm text-gray-600">Du erhältst eine Bestätigungsmail.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 overflow-y-auto flex-1">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Kategorie */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
                      >
                        {Object.keys(CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Paket */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Paket *</label>
                      <select
                        value={selectedPackage?.name || ""}
                        onChange={(e) => {
                          const pkg = categoryData?.packages.find(p => p.name === e.target.value);
                          setSelectedPackage(pkg);
                        }}
                        className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
                      >
                        <option value="">-- Wählen --</option>
                        {categoryData?.packages.map((pkg) => (
                          <option key={pkg.name} value={pkg.name}>
                            {pkg.name} ({pkg.tokens} Tokens, {pkg.price}€)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Berater */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Berater *</label>
                      <select
                        value={consultant}
                        onChange={(e) => setConsultant(e.target.value)}
                        className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
                      >
                        {categoryData?.consultants.map((cons) => (
                          <option key={cons} value={cons}>{cons}</option>
                        ))}
                      </select>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
                        placeholder="Dein Name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">E-Mail *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
                        placeholder="deine@email.de"
                      />
                    </div>
                  </div>

                  {/* Kalender */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">Datum & Uhrzeit *</label>
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      {/* Kalender Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {format(calendarMonth, "MMMM yyyy", { locale: de })}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCalendarMonth(addDays(calendarMonth, -30))}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalendarMonth(addDays(calendarMonth, 30))}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Wochentage */}
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Tage */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {Array.from({ length: offset }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {daysInMonth.map((day) => {
                          const disabled = isDateDisabled(day);
                          const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
                          return (
                            <button
                              key={format(day, "yyyy-MM-dd")}
                              type="button"
                              onClick={() => !disabled && handleDateSelect(day)}
                              disabled={disabled}
                              className={`p-2 text-sm rounded-lg transition-all ${
                                disabled
                                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-orange-500 text-white font-semibold"
                                  : "bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50"
                              }`}
                            >
                              {format(day, "d")}
                            </button>
                          );
                        })}
                      </div>

                      {/* Zeitslots */}
                      {selectedDate && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Verfügbare Zeiten für {format(selectedDate, "dd.MM.yyyy", { locale: de })}:
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {getAvailableTimeSlots(selectedDate).map((slot) => {
                              const booked = isSlotBooked(selectedDate, slot);
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={booked}
                                  onClick={() => !booked && setSelectedTime(slot)}
                                  title={booked ? "Nicht verfügbar" : ""}
                                  className={`p-2 text-xs rounded-lg transition-all ${
                                    booked
                                      ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                                      : selectedTime === slot
                                      ? "bg-orange-500 text-white font-semibold"
                                      : "bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50"
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nachricht */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Ihre Nachricht / Anliegen (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Was möchten Sie besprechen? Gibt es besondere Wünsche oder Infos für uns?"
                      className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Preis Summary */}
                  {selectedPackage && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-gray-600">Gesamtpreis:</p>
                      <p className="text-lg font-bold text-orange-600">{selectedPackage.price}€ ({selectedPackage.tokens} Tokens)</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !selectedPackage || !selectedDate || !selectedTime}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 md:py-2 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px] text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      "Anfrage senden"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}