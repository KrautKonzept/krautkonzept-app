import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Clock, Loader2, CheckCircle2, XCircle, User, Plus, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};
const statusLabels = { pending: "Ausstehend", confirmed: "Bestätigt", cancelled: "Storniert", completed: "Abgeschlossen" };

const generateJitsiLink = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `https://meet.jit.si/Krautkonzept-${code}`;
};

export default function BookingsList({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newParticipants, setNewParticipants] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Booking.list("-date", 100).then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jitsiLink = generateJitsiLink();
      const participants = newParticipants.split(",").map((p) => p.trim()).filter(Boolean);

      const booking = await base44.entities.Booking.create({
        customer_name: newTitle,
        service: `Jitsi Meeting: ${newTitle}`,
        date: newDate,
        time_slot: newTime,
        notes: jitsiLink,
        status: "confirmed",
      });

      // Send emails to participants
      for (const participant of participants) {
        await base44.integrations.Core.SendEmail({
          to: participant,
          subject: `Einladung: ${newTitle}`,
          body: `Hallo,\n\ndu bist eingeladen zu einem Termin.\n\nThema: ${newTitle}\nDatum: ${newDate}\nUhrzeit: ${newTime} Uhr\nJitsi-Link: ${jitsiLink}\n\nBis bald!\nKrautKonzept Team`,
        });
      }

      setBookings((prev) => [booking, ...prev]);
      setNewTitle("");
      setNewDate("");
      setNewTime("10:00");
      setNewParticipants("");
      setShowNewForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Termine & Buchungen</h2>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Neuer Termin
        </Button>
      </div>

      {/* New Meeting Form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Jitsi-Meeting erstellen</h3>
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="z.B. Team Meeting"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit *</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teilnehmer (Emails, komma-getrennt) *</label>
                <input
                  type="text"
                  required
                  value={newParticipants}
                  onChange={(e) => setNewParticipants(e.target.value)}
                  placeholder="max@example.de, anna@example.de"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {saving ? "Wird erstellt..." : "Erstellen & Einladungen senden"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewForm(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "pending", label: "Ausstehend" },
          { value: "confirmed", label: "Bestätigt" },
          { value: "all", label: "Alle" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value ? "bg-orange-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f.value ? "bg-orange-400" : "bg-gray-100 text-gray-500"}`}>
              {filter === f.value || f.value === "all" ? bookings.filter(b => f.value === "all" || b.status === f.value).length : bookings.filter(b => b.status === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <CalendarDays className="w-8 h-8 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Keine Buchungen gefunden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">{booking.service}</span>
                    <Badge className={statusColors[booking.status]}>{statusLabels[booking.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.customer_name || booking.customer_email}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{booking.date}</span>
                    {booking.time_slot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time_slot} Uhr</span>}
                  </div>
                  {booking.notes && <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-2">{booking.notes}</p>}
                </div>
                {booking.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => updateStatus(booking.id, "confirmed")} className="bg-green-500 hover:bg-green-600 text-white h-8 gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "cancelled")} className="h-8 text-red-500 border-red-200 hover:bg-red-50 gap-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Absagen
                    </Button>
                  </div>
                )}
                {booking.status === "confirmed" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "completed")} className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50">
                    Abschließen
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}