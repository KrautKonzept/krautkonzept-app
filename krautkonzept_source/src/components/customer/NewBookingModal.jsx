import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SERVICES = [
  "Branding & Design",
  "Webentwicklung",
  "App-Entwicklung",
  "Digitale Strategie",
  "Online Marketing",
  "SEO & SEA",
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function NewBookingModal({ isOpen, onClose, user, onBooked }) {
  const [form, setForm] = useState({ service: "", date: "", time_slot: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const booking = await base44.entities.Booking.create({
      ...form,
      customer_email: user.email,
      customer_name: user.full_name || user.email,
      status: "pending",
    });

    // E-Mail an Kunden
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: "Buchungsbestätigung – KrautKonzept",
      body: `Hallo ${user.full_name || user.email},\n\nIhre Buchungsanfrage wurde erfolgreich übermittelt:\n\n• Leistung: ${form.service}\n• Datum: ${form.date}\n• Uhrzeit: ${form.time_slot || "wird noch bestätigt"} Uhr\n\nWir melden uns in Kürze zur Bestätigung.\n\nBeste Grüße,\nIhr KrautKonzept-Team`,
    });

    // E-Mail an Mitarbeiter / Admin
    await base44.integrations.Core.SendEmail({
      to: "info@krautkonzept.de",
      subject: `Neue Buchung: ${form.service}`,
      body: `Neue Buchungsanfrage eingegangen:\n\n• Kunde: ${user.full_name || user.email} (${user.email})\n• Leistung: ${form.service}\n• Datum: ${form.date}\n• Uhrzeit: ${form.time_slot || "–"} Uhr\n• Notizen: ${form.notes || "–"}\n\nBitte im Dashboard bestätigen.`,
    });

    setLoading(false);
    setForm({ service: "", date: "", time_slot: "", notes: "" });
    onBooked(booking);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-7 py-6 flex items-start justify-between">
                <div>
                  <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">Neuer Termin</p>
                  <h3 className="text-white text-xl font-bold">Termin buchen</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div className="space-y-2">
                  <Label>Dienstleistung *</Label>
                  <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })} required>
                    <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                    <SelectContent>
                      {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Datum *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Uhrzeit</Label>
                    <Select value={form.time_slot} onValueChange={(v) => setForm({ ...form, time_slot: v })}>
                      <SelectTrigger><SelectValue placeholder="Wählen" /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t} Uhr</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notizen / Wünsche</Label>
                  <Textarea
                    placeholder="Was möchten Sie besprechen?"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !form.service || !form.date}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarDays className="w-4 h-4 mr-2" />}
                  Termin anfragen
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}