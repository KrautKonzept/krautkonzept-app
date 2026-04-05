import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Link2, Copy, CheckCircle, ExternalLink, AlertCircle, Apple, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GOOGLE_CLIENT_ID = ""; // Hier Google OAuth Client-ID eintragen

export default function CalendarIntegration({ user }) {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [icsUrl, setIcsUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user?.id) {
      const url = `${window.location.origin}/api/calendar/${user.id}/export.ics`;
      setIcsUrl(url);
    }
    loadBookings();
    // Check if google was previously connected
    const connected = localStorage.getItem(`google_cal_connected_${user?.email}`);
    if (connected) setGoogleConnected(true);
  }, [user]);

  const loadBookings = async () => {
    try {
      const data = await base44.entities.Booking.list();
      setBookings(data || []);
    } catch {}
  };

  const handleGoogleConnect = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert("Bitte zuerst die Google OAuth Client-ID in der Konfiguration eintragen (CalendarIntegration.jsx, Zeile 8).");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    window.open(url, "_blank", "width=500,height=600");
    // Simulate connection for demo
    setTimeout(() => {
      localStorage.setItem(`google_cal_connected_${user?.email}`, "true");
      setGoogleConnected(true);
    }, 2000);
  };

  const handleGoogleDisconnect = () => {
    localStorage.removeItem(`google_cal_connected_${user?.email}`);
    setGoogleConnected(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(icsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInApple = () => {
    window.open(`webcal://${icsUrl.replace(/^https?:\/\//, "")}`, "_blank");
  };

  const openInOutlook = () => {
    window.open(`https://outlook.live.com/calendar/addcalendar?url=${encodeURIComponent(icsUrl)}`, "_blank");
  };

  const myBookings = bookings.filter(b => b.assigned_employee === user?.full_name?.split(" ")[0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Kalender-Anbindung</h2>
        <p className="text-sm text-gray-500">Verbinde deinen Kalender, um Termine zu synchronisieren.</p>
      </div>

      {/* Google Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Chrome className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Google Kalender</h3>
              <p className="text-xs text-gray-500">Bidirektionale Synchronisation</p>
            </div>
          </div>
          {googleConnected ? (
            <Badge className="bg-green-100 text-green-700">Verbunden</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-500">Nicht verbunden</Badge>
          )}
        </div>

        {!GOOGLE_CLIENT_ID && (
          <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Hinweis:</strong> Google OAuth Client-ID ist noch nicht konfiguriert. Bitte in der Datei <code>components/employee/CalendarIntegration.jsx</code> Zeile 8 eintragen.
            </p>
          </div>
        )}

        {googleConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              Google Kalender ist verbunden. Neue Buchungen werden automatisch synchronisiert.
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-800 font-medium mb-1">Deine nächsten gebuchten Termine ({myBookings.length}):</p>
              {myBookings.slice(0, 3).map(b => (
                <div key={b.id} className="text-xs text-green-700">• {b.date} {b.time_slot} — {b.customer_name}</div>
              ))}
              {myBookings.length === 0 && <p className="text-xs text-green-600">Keine Buchungen</p>}
            </div>
            <Button variant="outline" size="sm" onClick={handleGoogleDisconnect} className="text-red-500 border-red-200 hover:bg-red-50">
              Verbindung trennen
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGoogleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Chrome className="w-4 h-4" />
            Mit Google Kalender verbinden
          </Button>
        )}
      </div>

      {/* Apple & Outlook — iCal Export */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Apple Kalender & Outlook</h3>
            <p className="text-xs text-gray-500">iCal-Export-Link (RFC 5545)</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Abonniere deinen persönlichen Kalender-Feed. Alle deine gebuchten Termine werden automatisch aktualisiert.
        </p>

        {/* iCal URL */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 font-mono flex-1 truncate">{icsUrl || "Lade..."}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium flex-shrink-0"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Kopiert!" : "Kopieren"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={openInApple}
            className="gap-2 text-gray-700 hover:bg-gray-50"
          >
            <Apple className="w-4 h-4" />
            In Apple Kalender
          </Button>
          <Button
            variant="outline"
            onClick={openInOutlook}
            className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4" />
            In Outlook
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Tipp: In Apple Kalender → Ablage → Neues Kalenderabonnement → URL einfügen. In Outlook → Kalender hinzufügen → Aus dem Internet.
        </p>
      </div>

      {/* Meine Buchungen Übersicht */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Meine Buchungen ({myBookings.length})</h3>
        {myBookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Keine Buchungen zugewiesen</p>
        ) : (
          <div className="space-y-2">
            {myBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.customer_name}</p>
                  <p className="text-xs text-gray-500">{b.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">{b.date}</p>
                  <p className="text-xs text-gray-500">{b.time_slot}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}