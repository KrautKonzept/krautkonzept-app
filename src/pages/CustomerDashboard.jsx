import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CalendarDays, Clock, CheckCircle2, XCircle, PlusCircle, Loader2, LogOut, Coins, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import NewBookingModal from "@/components/customer/NewBookingModal";
import CustomerKanban from "@/components/customer/CustomerKanban";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};
const statusLabels = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  cancelled: "Storniert",
  completed: "Abgeschlossen",
};

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tokenEntries, setTokenEntries] = useState([]);
  const [clientRecord, setClientRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [bookingData, clientData] = await Promise.all([
        base44.entities.Booking.filter({ customer_email: me.email }, "-date"),
        base44.entities.Client.filter({ contact_email: me.email }),
      ]);
      setBookings(bookingData);
      const client = clientData[0] || null;
      setClientRecord(client);
      if (client) {
        const tokens = await base44.entities.TokenEntry.filter({ client: client.name }, "-date");
        setTokenEntries(tokens);
      }
      setLoading(false);
    };
    init().catch(() => base44.auth.redirectToLogin(window.location.pathname));
  }, []);

  const handleBooked = (booking) => {
    setBookings((prev) => [booking, ...prev]);
    setShowModal(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
    </div>
  );

  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.status !== "completed");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mein Konto</h1>
            <p className="text-gray-500 mt-1">Willkommen zurück, <span className="font-medium text-gray-700">{user?.full_name || user?.email}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md shadow-orange-500/20 gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Termin buchen
            </Button>
            <Button variant="outline" size="icon" onClick={() => base44.auth.logout()} title="Abmelden">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-100 pb-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "bookings" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <CalendarDays className="w-4 h-4" /> Termine
          </button>
          <button
            onClick={() => setActiveTab("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "kanban" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <LayoutGrid className="w-4 h-4" /> Meine Aufgaben
          </button>
          <button
            onClick={() => setActiveTab("tokens")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "tokens" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Coins className="w-4 h-4" /> Abrechnung
          </button>
        </div>

        {/* Stats */}
        {activeTab === "bookings" && <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: CalendarDays, label: "Upcoming", value: upcoming.length, color: "text-orange-500" },
            { icon: CheckCircle2, label: "Abgeschlossen", value: bookings.filter(b => b.status === "completed").length, color: "text-green-500" },
            { icon: XCircle, label: "Storniert", value: bookings.filter(b => b.status === "cancelled").length, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>}

        {/* Upcoming Bookings */}
        {activeTab === "bookings" && <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Kommende Termine</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Noch keine bevorstehenden Buchungen.</p>
              <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4 text-orange-500 border-orange-200">Jetzt buchen</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          )}
        </div>}

        {/* Past Bookings */}
        {activeTab === "bookings" && past.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Vergangene Termine</h2>
            <div className="space-y-3">
              {past.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Kunden-Kanban */}
        {activeTab === "kanban" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Aufgaben meines Unternehmens</h2>
            <CustomerKanban clientName={clientRecord?.name} />
          </div>
        )}

        {/* Token-Übersicht */}
        {activeTab === "tokens" && clientRecord && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-800">Meine Token & Abrechnung</h2>
            </div>

            {/* Budget-Fortschritt */}
            {clientRecord.token_budget > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Token-Budget</span>
                  <span className="text-sm font-mono font-semibold text-orange-600">
                    {tokenEntries.reduce((s, e) => s + (e.token_count || 0), 0)} / {clientRecord.token_budget} Tokens
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${Math.min((tokenEntries.reduce((s, e) => s + (e.token_count || 0), 0) / clientRecord.token_budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>Verbraucht: {tokenEntries.reduce((s, e) => s + (e.amount_euro || 0), 0).toFixed(2)} €</span>
                  <span>Offen: {tokenEntries.filter(e => e.status === "offen").reduce((s, e) => s + (e.amount_euro || 0), 0).toFixed(2)} €</span>
                </div>
              </div>
            )}

            {/* Token-Einträge Tabelle */}
            {tokenEntries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                Noch keine Leistungen erfasst.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Datum</th>
                      <th className="px-4 py-3 text-left">Leistung</th>
                      <th className="px-4 py-3 text-right">Tokens</th>
                      <th className="px-4 py-3 text-right">Betrag</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tokenEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{entry.date}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{entry.description || entry.category}</td>
                        <td className="px-4 py-3 text-right font-mono text-orange-600 font-semibold">{entry.token_count || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-800">{(entry.amount_euro || 0).toFixed(2)} €</td>
                        <td className="px-4 py-3 text-center">
                          {entry.status === "abgerechnet"
                            ? <Badge className="bg-green-100 text-green-700">Bezahlt</Badge>
                            : <Badge className="bg-yellow-100 text-yellow-700">Offen</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-xs text-gray-400">{tokenEntries.length} Einträge</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-orange-600">{tokenEntries.reduce((s, e) => s + (e.token_count || 0), 0)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-gray-800">{tokenEntries.reduce((s, e) => s + (e.amount_euro || 0), 0).toFixed(2)} €</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "tokens" && !clientRecord && (
          <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
            Kein Kundenprofil verknüpft. Bitte wende dich an KrautKonzept.
          </div>
        )}
      </div>

      <NewBookingModal isOpen={showModal} onClose={() => setShowModal(false)} user={user} onBooked={handleBooked} />
    </div>
  );
}

function BookingCard({ booking }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        <CalendarDays className="w-5 h-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{booking.service}</div>
        <div className="text-sm text-gray-400 flex items-center gap-3 mt-0.5">
          <span>{booking.date}</span>
          {booking.time_slot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time_slot}</span>}
        </div>
        {booking.notes && <p className="text-xs text-gray-400 mt-1 truncate">{booking.notes}</p>}
      </div>
      <Badge className={statusColors[booking.status]}>{statusLabels[booking.status]}</Badge>
    </motion.div>
  );
}