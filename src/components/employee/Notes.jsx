import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Edit2, Save, X, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const TEAM_EMAILS = [
  { name: "Emanuel", email: "info@krautkonzept.de" },
  { name: "Andrea", email: "andrea@krautkonzept.de" },
  { name: "Luc", email: "luc@krautkonzept.de" },
  { name: "Vincent", email: "vincent@krautkonzept.de" },
  { name: "Dietrich", email: "dietrich@krautkonzept.de" },
];

function TeamMessages({ user }) {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ to_email: "", body: "" });
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.InternalMessage.filter({ to_email: user.email }, "-created_date", 30);
    setInbox(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!form.to_email || !form.body.trim()) return;
    setSending(true);
    await base44.entities.InternalMessage.create({
      from_email: user.email,
      to_email: form.to_email,
      subject: "Team-Nachricht",
      body: form.body,
      read: false,
    });
    setForm({ to_email: "", body: "" });
    setSending(false);
  };

  const markRead = async (msg) => {
    if (!msg.read) {
      await base44.entities.InternalMessage.update(msg.id, { read: true });
      setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
    setSelected(msg);
  };

  const getName = (email) => TEAM_EMAILS.find(t => t.email === email)?.name || email?.split("@")[0];
  const formatDate = (ts) => ts ? new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  const unread = inbox.filter(m => !m.read).length;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900">Team-Nachrichten</h2>
        {unread > 0 && <Badge className="bg-red-500 text-white">{unread} neu</Badge>}
      </div>

      {/* Send form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 space-y-3">
        <p className="text-sm font-medium text-gray-700">Nachricht senden</p>
        <div className="flex gap-3">
          <Select value={form.to_email} onValueChange={v => setForm(f => ({ ...f, to_email: v }))}>
            <SelectTrigger className="w-48 flex-shrink-0">
              <SelectValue placeholder="An wen?" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_EMAILS.filter(t => t.email !== user?.email).map(t => (
                <SelectItem key={t.email} value={t.email}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Nachricht..."
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !form.to_email || !form.body.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Senden
          </Button>
        </div>
      </div>

      {/* Selected message detail */}
      {selected && (
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 mb-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-gray-500">Von {getName(selected.from_email)} · {formatDate(selected.created_date)}</p>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.body}</p>
        </div>
      )}

      {/* Inbox */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
      ) : inbox.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-white">
          <Inbox className="w-7 h-7 mx-auto mb-2 text-gray-200" />
          Keine Nachrichten
        </div>
      ) : (
        <div className="space-y-2">
          {inbox.map(msg => (
            <div key={msg.id} onClick={() => markRead(msg)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer hover:border-orange-200 transition-all ${
                !msg.read ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!msg.read ? "bg-orange-500" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${!msg.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{msg.body}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(msg.created_date)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Von {getName(msg.from_email)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  useEffect(() => {
    base44.entities.Note.filter({ created_by: user?.email }, "-created_date", 100)
      .then(data => {
        setNotes(data);
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    const note = await base44.entities.Note.create({
      title: formData.title,
      content: formData.content,
      created_at: new Date().toISOString().split('T')[0],
    });
    setNotes([note, ...notes]);
    setFormData({ title: "", content: "" });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Note.delete(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleSave = async (id) => {
    const note = notes.find(n => n.id === id);
    await base44.entities.Note.update(id, { title: note.title, content: note.content });
    setEditingId(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notizen</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          Neue Notiz
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-md"
        >
          <Input placeholder="Titel..." value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mb-3" />
          <Textarea placeholder="Notiz-Text..." value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} className="mb-3 resize-none" />
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">Speichern</Button>
            <Button onClick={() => setShowForm(false)} variant="outline">Abbrechen</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id} className="p-4 border border-gray-200">
            {editingId === note.id ? (
              <div className="space-y-3">
                <Input value={note.title}
                  onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n))}
                  className="font-semibold" />
                <Textarea value={note.content}
                  onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, content: e.target.value } : n))}
                  rows={3} className="resize-none" />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(note.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                    <Save className="w-3 h-3" /> Speichern
                  </Button>
                  <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
                    <X className="w-3 h-3" /> Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(note.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-orange-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{note.content}</p>
                <p className="text-xs text-gray-400">{note.created_at}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      {notes.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Notizen vorhanden</p>
        </div>
      )}

      {/* Team Messages Section */}
      <TeamMessages user={user} />
    </div>
  );
}