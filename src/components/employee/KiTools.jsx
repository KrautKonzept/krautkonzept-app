import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Bot, TrendingUp, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KI_TOOLS = ["Claude", "ChatGPT", "Gemini", "Perplexity", "Sonstige"];

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

function NutzungModal({ open, onClose, onSave, clients }) {
  const [form, setForm] = useState({
    tool: "", model: "", requests: "", cost_euro: "", client: "", description: "",
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">KI-Nutzung erfassen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Tool</Label>
            <Select value={form.tool} onValueChange={v => setForm(p => ({ ...p, tool: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Tool wählen" /></SelectTrigger>
              <SelectContent>{KI_TOOLS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Modell (optional)</Label>
            <Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="z.B. claude-3-5-sonnet" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Anzahl Anfragen</Label>
              <Input type="number" value={form.requests} onChange={e => setForm(p => ({ ...p, requests: e.target.value }))} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Kosten (€)</Label>
              <Input type="number" step="0.01" value={form.cost_euro} onChange={e => setForm(p => ({ ...p, cost_euro: e.target.value }))} placeholder="0.00" className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Kunde (optional)</Label>
            <Select value={form.client} onValueChange={v => setForm(p => ({ ...p, client: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Kunden zuordnen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Kein Kunde</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Projekt / Beschreibung</Label>
            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Wofür?" className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            onClick={() => onSave({ ...form, client: form.client === "_none" ? "" : form.client, requests: parseFloat(form.requests) || 0, cost_euro: parseFloat(form.cost_euro) || 0 })}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
            disabled={!form.tool}
          >Speichern</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
        </div>
      </div>
    </div>
  );
}

export default function KiTools({ user, isCeo }) {
  const [usages, setUsages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState(getMonthOptions()[0].value);
  const monthOptions = getMonthOptions();

  useEffect(() => {
    Promise.all([
      base44.entities.AiUsage.list("-date", 200),
      base44.entities.Client.list("name", 100),
    ]).then(([u, c]) => { setUsages(u); setClients(c); setLoading(false); });
  }, []);

  const handleSave = async (form) => {
    const today = new Date().toISOString().split("T")[0];
    const entry = await base44.entities.AiUsage.create({
      ...form,
      employee_email: user.email,
      date: today,
      source: "manuell",
    });
    setUsages(prev => [entry, ...prev]);
    setShowModal(false);
  };

  const filtered = usages.filter(u => {
    const monthMatch = !filterMonth || u.date?.startsWith(filterMonth);
    const empMatch = isCeo || u.employee_email === user.email;
    return monthMatch && empMatch;
  });

  // Kosten pro Tool
  const costByTool = KI_TOOLS.map(tool => ({
    tool,
    cost: filtered.filter(u => u.tool === tool).reduce((s, u) => s + (u.cost_euro || 0), 0),
    count: filtered.filter(u => u.tool === tool).length,
  })).filter(t => t.count > 0);

  const totalCost = filtered.reduce((s, u) => s + (u.cost_euro || 0), 0);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <NutzungModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSave} clients={clients} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Bot className="w-5 h-5 text-orange-500" /> KI-Tools & Verbrauch</h2>
          <p className="text-sm text-gray-400 mt-0.5">KI-Nutzung erfassen und nach Kunden zuordnen</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
            <Plus className="w-4 h-4" /> KI-Nutzung erfassen
          </Button>
        </div>
      </div>

      {/* KPI Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">{totalCost.toFixed(2)} €</div>
          <div className="text-xs text-gray-400 mt-1">Gesamtkosten (Monat)</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{filtered.reduce((s, u) => s + (u.requests || 0), 0)}</div>
          <div className="text-xs text-gray-400 mt-1">Anfragen gesamt</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
          <div className="text-xs text-gray-400 mt-1">Einträge</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{[...new Set(filtered.map(u => u.client).filter(Boolean))].length}</div>
          <div className="text-xs text-gray-400 mt-1">Kunden mit KI-Kosten</div>
        </div>
      </div>

      {/* Kosten pro Tool */}
      {costByTool.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Kosten nach Tool</h3>
          <div className="space-y-3">
            {costByTool.map(t => (
              <div key={t.tool} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">{t.tool}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full transition-all"
                    style={{ width: `${totalCost > 0 ? (t.cost / totalCost) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-20 text-right">{t.cost.toFixed(2)} €</span>
                <span className="text-xs text-gray-400 w-16 text-right">{t.count} Eintr.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Verbrauchsübersicht</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="text-left pb-2 px-2">Datum</th>
                {isCeo && <th className="text-left pb-2 px-2">Mitarbeiter</th>}
                <th className="text-left pb-2 px-2">Tool</th>
                <th className="text-left pb-2 px-2">Modell</th>
                <th className="text-right pb-2 px-2">Anfragen</th>
                <th className="text-right pb-2 px-2">Kosten</th>
                <th className="text-left pb-2 px-2">Kunde</th>
                <th className="text-left pb-2 px-2">Beschreibung</th>
                <th className="text-left pb-2 px-2">Quelle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-gray-400">Keine Einträge für diesen Monat</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-600">{u.date}</td>
                  {isCeo && <td className="py-2 px-2 text-gray-500 text-xs">{u.employee_email?.split("@")[0]}</td>}
                  <td className="py-2 px-2 font-medium text-gray-800">{u.tool}</td>
                  <td className="py-2 px-2 text-gray-500 text-xs">{u.model || "—"}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{u.requests || "—"}</td>
                  <td className="py-2 px-2 text-right font-semibold text-orange-600">{(u.cost_euro || 0).toFixed(2)} €</td>
                  <td className="py-2 px-2 text-gray-600">{u.client || "—"}</td>
                  <td className="py-2 px-2 text-gray-500 text-xs max-w-[160px] truncate">{u.description || "—"}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.source === "Zeiterfassung" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                      {u.source || "manuell"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={isCeo ? 5 : 4} className="py-2 px-2 text-xs text-gray-500 font-semibold">{filtered.length} Einträge</td>
                  <td className="py-2 px-2 text-right font-bold text-orange-600">{totalCost.toFixed(2)} €</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}