import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle, Circle, Loader2, Clock, ArrowRight, X } from "lucide-react";

const CATEGORIES = ["CSC-Gründung", "Compliance & Recht", "Strategie & Finanzierung", "Marketing", "Sonstiges"];
const MITARBEITER = ["Emanuel", "Andrea", "Luc", "Vincent", "Dietrich", "Diddy"];
const TOKEN_PRICE = 25;

const emptyModal = {
  client: "",
  token_count: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  mitarbeiter: "",
};

function NeueLeistungModal({ open, clients, onClose, onSaved }) {
  const [form, setForm] = useState(emptyModal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyModal);
  }, [open]);

  if (!open) return null;

  const tokens = parseInt(form.token_count) || 0;
  const preis = tokens * TOKEN_PRICE;

  const handleSave = async () => {
    if (!form.client || tokens < 1) return;
    setSaving(true);
    await base44.entities.TokenEntry.create({
      client: form.client,
      category: "Sonstiges",
      token_count: tokens,
      amount_euro: preis,
      date: form.date,
      description: form.description + (form.mitarbeiter ? ` (${form.mitarbeiter})` : ""),
      status: "offen",
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Neue Leistung erfassen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 font-medium">Kunde *</Label>
            <Select value={form.client} onValueChange={v => setForm(f => ({ ...f, client: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Kunde wählen" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-500 font-medium">Anzahl Tokens * (min. 1)</Label>
            <Input
              type="number"
              min="1"
              value={form.token_count}
              onChange={e => setForm(f => ({ ...f, token_count: e.target.value }))}
              placeholder="z.B. 4"
              className="mt-1"
            />
            {tokens > 0 && (
              <div className="mt-1.5 text-sm font-semibold text-orange-600">
                = {preis.toFixed(2)} € (à {TOKEN_PRICE} €/Token)
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-500 font-medium">Beschreibung der Leistung</Label>
            <Input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Was wurde geleistet?"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500 font-medium">Datum</Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500 font-medium">Mitarbeiter</Label>
            <Select value={form.mitarbeiter} onValueChange={v => setForm(f => ({ ...f, mitarbeiter: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Mitarbeiter wählen" /></SelectTrigger>
              <SelectContent>{MITARBEITER.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !form.client || tokens < 1}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Speichern
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
        </div>
      </div>
    </div>
  );
}

export default function TokenAbrechnung() {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimeEntries, setShowTimeEntries] = useState(false);
  const [filterClient, setFilterClient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.TokenEntry.list("-date"),
      base44.entities.Client.list(),
      base44.entities.TimeEntry.list("-date", 100),
      base44.entities.CompanySettings.list(),
    ]).then(([tokenData, clientData, timeData, settingsData]) => {
      setEntries(tokenData);
      setClients(clientData);
      setTimeEntries(timeData);
      setSettings(settingsData[0] || { minutes_per_token: 30, token_price_euro: 25 });
      setLoading(false);
    });
  }, []);

  const loadEntries = async () => {
    const data = await base44.entities.TokenEntry.list("-date");
    setEntries(data);
  };

  const toggleStatus = async (entry) => {
    const newStatus = entry.status === "offen" ? "abgerechnet" : "offen";
    await base44.entities.TokenEntry.update(entry.id, { status: newStatus });
    loadEntries();
  };

  const deleteEntry = async (id) => {
    await base44.entities.TokenEntry.delete(id);
    loadEntries();
  };

  const minutesToTokens = (minutes) => {
    const mpt = settings?.minutes_per_token || 30;
    return Math.round(minutes / mpt);
  };

  const convertTimeEntry = async (te) => {
    setConvertingId(te.id);
    const tokens = minutesToTokens(te.duration_minutes || 0);
    const pricePerToken = settings?.token_price_euro || 25;
    await base44.entities.TokenEntry.create({
      client: te.project || "",
      category: "Sonstiges",
      token_count: tokens,
      amount_euro: tokens * pricePerToken,
      date: te.date,
      description: te.description || `Zeiterfassung ${te.start_time}–${te.end_time}`,
      status: "offen",
    });
    await loadEntries();
    setConvertingId(null);
  };

  const filtered = entries.filter(e =>
    (filterClient === "all" || e.client === filterClient) &&
    (filterStatus === "all" || e.status === filterStatus)
  );

  const totalTokens = filtered.reduce((s, e) => s + (e.token_count || 0), 0);
  const totalEuro = filtered.reduce((s, e) => s + (e.amount_euro || 0), 0);
  const offenEuro = filtered.filter(e => e.status === "offen").reduce((s, e) => s + (e.amount_euro || 0), 0);

  const getClientTokens = (clientName) => entries.filter(e => e.client === clientName).reduce((sum, e) => sum + (e.token_count || 0), 0);
  const getClientRevenue = (clientName) => entries.filter(e => e.client === clientName).reduce((sum, e) => sum + (e.amount_euro || 0), 0);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div className="p-6 space-y-6">
      <NeueLeistungModal
        open={showModal}
        clients={clients}
        onClose={() => setShowModal(false)}
        onSaved={loadEntries}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Token & Abrechnung</h2>
          <p className="text-sm text-gray-500">Alle Token-Einträge pro Klient</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" /> Neue Leistung erfassen
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{totalTokens.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Token gesamt</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalEuro.toFixed(2)} €</div>
          <div className="text-xs text-gray-500 mt-1">Umsatz gesamt</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{offenEuro.toFixed(2)} €</div>
          <div className="text-xs text-gray-500 mt-1">Offen</div>
        </div>
      </div>

      {/* Client Progress Overview */}
      {clients.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Token-Verbrauch pro Kunde</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map(client => {
              const tokens = getClientTokens(client.name);
              const revenue = getClientRevenue(client.name);
              const maxTokens = client.token_budget || 100;
              const percentage = Math.min((tokens / maxTokens) * 100, 100);
              return (
                <div key={client.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{client.name}</h4>
                    <span className="text-xs font-mono font-semibold text-orange-600">{tokens} Tokens</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{revenue.toFixed(2)}€</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zeit → Token Umrechnung */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
          onClick={() => setShowTimeEntries(v => !v)}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Zeiteinträge → Token umrechnen
            <span className="text-xs text-gray-400 font-normal">({settings?.minutes_per_token || 30} Min. = 1 Token, {settings?.token_price_euro || 25} €/Token)</span>
          </div>
          <span className="text-xs text-gray-400">{showTimeEntries ? "▲ einklappen" : "▼ anzeigen"}</span>
        </button>
        {showTimeEntries && (
          <div className="divide-y divide-gray-100">
            {timeEntries.filter(te => te.duration_minutes > 0).length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">Keine Zeiteinträge vorhanden</div>
            ) : timeEntries.filter(te => te.duration_minutes > 0).map(te => {
              const tokens = minutesToTokens(te.duration_minutes);
              const euro = tokens * (settings?.token_price_euro || 25);
              return (
                <div key={te.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{te.description || "Kein Titel"}</div>
                    <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                      <span>{te.date}</span>
                      <span>{te.start_time}–{te.end_time}</span>
                      {te.project && <span>· {te.project}</span>}
                      <span>· {te.duration_minutes} Min.</span>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-sm font-semibold text-purple-600">{tokens} Token</div>
                    <div className="text-xs text-gray-400">{euro.toFixed(2)} €</div>
                  </div>
                  <button
                    onClick={() => convertTimeEntry(te)}
                    disabled={convertingId === te.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-all disabled:opacity-50"
                  >
                    {convertingId === te.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                    Übernehmen
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterClient} onValueChange={setFilterClient}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Alle Klienten" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Klienten</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="offen">Offen</SelectItem>
            <SelectItem value="abgerechnet">Abgerechnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Klient</th>
              <th className="px-4 py-3 text-left">Kategorie</th>
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-right">Token</th>
              <th className="px-4 py-3 text-right">Betrag</th>
              <th className="px-4 py-3 text-left">Beschreibung</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Keine Einträge gefunden</td></tr>
            ) : filtered.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{entry.client}</td>
                <td className="px-4 py-3 text-gray-600">{entry.category}</td>
                <td className="px-4 py-3 text-gray-500">{entry.date}</td>
                <td className="px-4 py-3 text-right font-mono">{(entry.token_count || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono">{(entry.amount_euro || 0).toFixed(2)} €</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{entry.description}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleStatus(entry)} title="Status wechseln">
                    {entry.status === "abgerechnet"
                      ? <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="w-3 h-3" /> Abgerechnet</Badge>
                      : <Badge className="bg-yellow-100 text-yellow-700 gap-1"><Circle className="w-3 h-3" /> Offen</Badge>
                    }
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteEntry(entry.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}