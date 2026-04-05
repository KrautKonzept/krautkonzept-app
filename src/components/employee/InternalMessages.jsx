import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Inbox, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TEAM_EMAILS = [
  { name: "Emanuel", email: "info@krautkonzept.de" },
  { name: "Andrea", email: "andrea@krautkonzept.de" },
  { name: "Luc", email: "luc@krautkonzept.de" },
  { name: "Vincent", email: "vincent@krautkonzept.de" },
  { name: "Dietrich", email: "dietrich@krautkonzept.de" },
];

export default function InternalMessages({ user }) {
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [view, setView] = useState("inbox"); // inbox | sent | new
  const [form, setForm] = useState({ to_email: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    setLoading(true);
    const [inboxData, sentData] = await Promise.all([
      base44.entities.InternalMessage.filter({ to_email: user.email }, "-created_date", 50),
      base44.entities.InternalMessage.filter({ from_email: user.email }, "-created_date", 50),
    ]);
    setInbox(inboxData);
    setSent(sentData);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!form.to_email || !form.subject || !form.body) return;
    setSending(true);
    await base44.entities.InternalMessage.create({
      from_email: user.email,
      to_email: form.to_email,
      subject: form.subject,
      body: form.body,
      read: false,
    });
    setForm({ to_email: "", subject: "", body: "" });
    setSending(false);
    await loadMessages();
    setView("sent");
  };

  const markRead = async (msg) => {
    if (!msg.read) await base44.entities.InternalMessage.update(msg.id, { read: true });
    setSelected(msg);
    setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
  };

  const unread = inbox.filter(m => !m.read).length;

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const getTeamName = (email) => TEAM_EMAILS.find(t => t.email === email)?.name || email?.split("@")[0] || email;

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Nachrichten</h2>
        <Button onClick={() => { setView("new"); setSelected(null); }} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" /> Neue Nachricht
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: "inbox", label: "Posteingang", count: unread },
          { id: "sent", label: "Gesendet" },
          { id: "new", label: "Schreiben" },
        ].map(t => (
          <button key={t.id} onClick={() => { setView(t.id); setSelected(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === t.id ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.label}
            {t.count > 0 && <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">{t.count}</Badge>}
          </button>
        ))}
      </div>

      {/* Detail View */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{selected.subject}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Von {getTeamName(selected.from_email)} · {formatDate(selected.created_date)}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.body}</p>
        </div>
      )}

      {/* New Message */}
      {view === "new" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">An *</label>
            <Select value={form.to_email} onValueChange={v => setForm(f => ({ ...f, to_email: v }))}>
              <SelectTrigger><SelectValue placeholder="Mitarbeiter wählen" /></SelectTrigger>
              <SelectContent>
                {TEAM_EMAILS.filter(t => t.email !== user.email).map(t => (
                  <SelectItem key={t.email} value={t.email}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Betreff *</label>
            <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Betreff..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Nachricht *</label>
            <Textarea rows={5} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Deine Nachricht..." />
          </div>
          <Button onClick={handleSend} disabled={sending || !form.to_email || !form.subject || !form.body}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 w-full">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Senden
          </Button>
        </div>
      )}

      {/* Inbox */}
      {view === "inbox" && (
        <div className="space-y-2">
          {inbox.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              Keine Nachrichten im Posteingang
            </div>
          ) : inbox.map(msg => (
            <div key={msg.id} onClick={() => markRead(msg)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all hover:border-orange-200 ${
                !msg.read ? "bg-orange-50 border-orange-100 font-semibold" : "bg-white border-gray-100"
              }`}
            >
              {!msg.read && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />}
              {msg.read && <div className="w-2 h-2 mt-1.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-800 truncate">{msg.subject}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(msg.created_date)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Von {getTeamName(msg.from_email)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sent */}
      {view === "sent" && (
        <div className="space-y-2">
          {sent.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">Keine gesendeten Nachrichten</div>
          ) : sent.map(msg => (
            <div key={msg.id} onClick={() => setSelected(msg)}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-orange-200 transition-all"
            >
              <Send className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-800 truncate">{msg.subject}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(msg.created_date)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">An {getTeamName(msg.to_email)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}