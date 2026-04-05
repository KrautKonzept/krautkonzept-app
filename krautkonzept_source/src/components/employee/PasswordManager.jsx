import React, { useState, useEffect } from "react";
import { Plus, Eye, EyeOff, Copy, Trash2, ExternalLink, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ceo_passwords_v1";

export default function PasswordManager() {
  const [entries, setEntries] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [visibleIds, setVisibleIds] = useState(new Set());
  const [form, setForm] = useState({ name: "", url: "", username: "", password: "", note: "" });
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (newEntries) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const handleAdd = () => {
    if (!form.name) return;
    save([...entries, { ...form, id: Date.now().toString() }]);
    setForm({ name: "", url: "", username: "", password: "", note: "" });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    save(entries.filter(e => e.id !== id));
  };

  const toggleVisible = (id) => {
    setVisibleIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Zugangsdaten & Tools</h3>
            <p className="text-xs text-gray-400">Passwörter und Zugänge verwalten</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Zugang hinzufügen
        </Button>
      </div>

      {/* Sicherheitshinweis */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Zugangsdaten werden lokal im Browser gespeichert und sind nur auf diesem Gerät sichtbar. Für produktiven Einsatz empfehlen wir einen dedizierten Passwort-Manager (z.B. 1Password, Bitwarden).</span>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-3">
          <h4 className="font-semibold text-purple-900 text-sm">Neuer Zugang</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Name (z.B. Base44) *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
            />
            <input
              placeholder="URL (z.B. https://base44.com)"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
            />
            <input
              placeholder="Benutzername / E-Mail"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
            />
            <input
              type="password"
              placeholder="Passwort"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
            />
            <input
              placeholder="Notiz (optional)"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white md:col-span-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Abbrechen</Button>
            <Button size="sm" onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700 text-white">Speichern</Button>
          </div>
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Lock className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Zugangsdaten gespeichert</p>
          <p className="text-xs mt-1">Klicke auf "+ Zugang hinzufügen"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-purple-200 transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">{entry.name[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{entry.name}</span>
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-500 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {entry.username && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="truncate">{entry.username}</span>
                        <button onClick={() => copyToClipboard(entry.username, `u_${entry.id}`)} className="hover:text-purple-500 transition-colors flex-shrink-0">
                          <Copy className="w-3 h-3" />
                        </button>
                        {copied === `u_${entry.id}` && <span className="text-green-600">✓</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.password && (
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-mono text-gray-700 min-w-[80px]">
                        {visibleIds.has(entry.id) ? entry.password : "••••••••"}
                      </span>
                      <button onClick={() => toggleVisible(entry.id)} className="text-gray-400 hover:text-purple-500 transition-colors">
                        {visibleIds.has(entry.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => copyToClipboard(entry.password, `p_${entry.id}`)} className="text-gray-400 hover:text-purple-500 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copied === `p_${entry.id}` && <span className="text-xs text-green-600">✓</span>}
                    </div>
                  )}
                  <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {entry.note && (
                <p className="text-xs text-gray-400 mt-1.5 ml-11">{entry.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}