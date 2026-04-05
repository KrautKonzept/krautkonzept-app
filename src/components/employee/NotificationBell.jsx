import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, CheckCheck } from "lucide-react";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")); }
    catch { return new Set(); }
  });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const iv = setInterval(loadNotifications, 30000);
    return () => clearInterval(iv);
  }, [user]);

  // Auto-mark all as read when panel opens
  useEffect(() => {
    if (open && notifications.length > 0) {
      const allIds = new Set(notifications.map(n => n.id));
      setReadIds(allIds);
      localStorage.setItem("notif_read", JSON.stringify([...allIds]));
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadNotifications = async () => {
    const userName = user?.full_name?.split(" ")[0] || "";
    const [tasks, bookings] = await Promise.all([
      base44.entities.Task.filter({ assigned_to: userName }, "-updated_date", 20),
      base44.entities.Booking.list("-created_date", 10),
    ]);

    const notifs = [];
    tasks.slice(0, 5).forEach(t => {
      notifs.push({
        id: `task-${t.id}`,
        text: `Task zugewiesen: "${t.title}"`,
        time: t.updated_date || t.created_date,
        icon: "📋",
      });
    });
    bookings.slice(0, 3).forEach(b => {
      notifs.push({
        id: `booking-${b.id}`,
        text: `Neuer Termin: ${b.service} (${b.customer_name || b.customer_email || ""})`,
        time: b.created_date,
        icon: "📅",
      });
    });
    notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifications(notifs.slice(0, 8));
  };

  const dismiss = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setReadIds(prev => { const s = new Set(prev); s.add(id); localStorage.setItem("notif_read", JSON.stringify([...s])); return s; });
  };

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem("notif_read", JSON.stringify([...allIds]));
    setNotifications([]);
  };

  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 60) return `vor ${diff} Min.`;
    if (diff < 1440) return `vor ${Math.floor(diff / 60)} Std.`;
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Benachrichtigungen"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm">Benachrichtigungen</span>
            {notifications.length > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />
                Alle löschen
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">Keine Benachrichtigungen</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {notifications.map(n => {
                const isRead = readIds.has(n.id);
                return (
                  <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors group relative ${isRead ? "opacity-50" : ""}`}>
                    <div className="flex items-start gap-2.5 pr-6">
                      <span className="text-base mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${isRead ? "text-gray-400" : "text-gray-800"}`}>{n.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.time)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => dismiss(e, n.id)}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                      title="Löschen"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}