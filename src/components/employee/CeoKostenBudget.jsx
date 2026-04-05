import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit2, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Initialdaten ──────────────────────────────────────────────────────────────

const DEFAULT_PERSONAL = [
  { id: 1, name: "Emanuel", rolle: "CEO / Gründer", vertragsart: "Inhaber", stunden: 0, kosten: 0, status: "aktiv" },
  { id: 2, name: "Andrea", rolle: "Marketing & KI", vertragsart: "Festangestellt", stunden: 80, kosten: 3000, status: "aktiv" },
  { id: 3, name: "Luc", rolle: "Backoffice & Finanzen", vertragsart: "Festangestellt", stunden: 40, kosten: 1200, status: "aktiv" },
  { id: 4, name: "Dietrich", rolle: "Tech & E-Commerce", vertragsart: "Freelancer", stunden: 20, kosten: 800, status: "aktiv" },
  { id: 5, name: "Vincent", rolle: "Entwicklung", vertragsart: "Freelancer", stunden: 20, kosten: 600, status: "aktiv" },
  { id: 6, name: "Diddy", rolle: "COO", vertragsart: "Freelancer", stunden: 30, kosten: 900, status: "aktiv" },
];

const DEFAULT_SOFTWARE = [
  { id: 1, tool: "Base44", kategorie: "App-Builder", kosten_monat: 49, jaehrlich: false, naechste_zahlung: "", notiz: "Unsere App-Plattform" },
  { id: 2, tool: "Claude / Anthropic", kategorie: "KI", kosten_monat: 0, jaehrlich: false, naechste_zahlung: "", notiz: "Variabel – je nach Nutzung" },
  { id: 3, tool: "ChatGPT (OpenAI)", kategorie: "KI", kosten_monat: 0, jaehrlich: false, naechste_zahlung: "", notiz: "Variabel – je nach Nutzung" },
  { id: 4, tool: "Make.com", kategorie: "Automation", kosten_monat: 9, jaehrlich: false, naechste_zahlung: "", notiz: "" },
  { id: 5, tool: "Google Workspace", kategorie: "Produktivität", kosten_monat: 12, jaehrlich: false, naechste_zahlung: "", notiz: "Pro Nutzer" },
  { id: 6, tool: "Canva", kategorie: "Design", kosten_monat: 13, jaehrlich: false, naechste_zahlung: "", notiz: "" },
  { id: 7, tool: "Zoom / Jitsi", kategorie: "Kommunikation", kosten_monat: 0, jaehrlich: false, naechste_zahlung: "", notiz: "Jitsi kostenlos" },
];

const STORAGE_KEY_PERSONAL = "kk_kosten_personal";
const STORAGE_KEY_SOFTWARE = "kk_kosten_software";
const STORAGE_KEY_SONSTIGE = "kk_kosten_sonstige";

const loadFromStorage = (key, defaultValue) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
  } catch { return defaultValue; }
};

const saveToStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ─── Inline-Edit-Cell ─────────────────────────────────────────────────────────
function EditCell({ value, onChange, type = "text", options }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:underline hover:text-orange-600 transition-colors"
        onDoubleClick={() => { setDraft(value); setEditing(true); }}
        title="Doppelklick zum Bearbeiten"
      >
        {value === "" || value === null || value === undefined ? <span className="text-gray-300 italic text-xs">—</span> : String(value)}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      {options ? (
        <select
          className="border border-orange-300 rounded px-1 py-0.5 text-xs focus:outline-none"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          className="border border-orange-300 rounded px-1 py-0.5 text-xs w-24 focus:outline-none"
          value={draft}
          onChange={e => setDraft(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
          autoFocus
          onKeyDown={e => {
            if (e.key === "Enter") { onChange(draft); setEditing(false); }
            if (e.key === "Escape") setEditing(false);
          }}
        />
      )}
      <button onClick={() => { onChange(draft); setEditing(false); }} className="text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
      <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
    </span>
  );
}

// ─── Abschnitt-Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, icon, total, color = "text-red-600", bg = "bg-red-50" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </h3>
      <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${bg} ${color}`}>
        {total.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/Mo
      </div>
    </div>
  );
}

// ─── HAUPT-KOMPONENTE ─────────────────────────────────────────────────────────
export default function CeoKostenBudget() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [personal, setPersonal] = useState(() => loadFromStorage(STORAGE_KEY_PERSONAL, DEFAULT_PERSONAL));
  const [software, setSoftware] = useState(() => loadFromStorage(STORAGE_KEY_SOFTWARE, DEFAULT_SOFTWARE));
  const [sonstige, setSonstige] = useState(() => loadFromStorage(STORAGE_KEY_SONSTIGE, []));
  const [aiUsages, setAiUsages] = useState([]);
  const [tokenEntries, setTokenEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const nextId = (arr) => (Math.max(0, ...arr.map(r => r.id || 0)) + 1);

  useEffect(() => {
    Promise.all([
      base44.entities.AiUsage.list("-date", 500),
      base44.entities.TokenEntry.list("-date", 500),
    ]).then(([ai, tokens]) => {
      setAiUsages(ai);
      setTokenEntries(tokens);
      setLoading(false);
    });
  }, []);

  // Persistieren bei Änderungen
  useEffect(() => { saveToStorage(STORAGE_KEY_PERSONAL, personal); }, [personal]);
  useEffect(() => { saveToStorage(STORAGE_KEY_SOFTWARE, software); }, [software]);
  useEffect(() => { saveToStorage(STORAGE_KEY_SONSTIGE, sonstige); }, [sonstige]);

  // ── Kosten-Summen berechnen ──────────────────────────────────────────────
  const personalTotal = personal.filter(p => p.status === "aktiv").reduce((s, p) => s + (p.kosten || 0), 0);
  const softwareTotal = software.reduce((s, sw) => s + (sw.jaehrlich ? (sw.kosten_monat / 12) : (sw.kosten_monat || 0)), 0);

  const monthAiUsages = aiUsages.filter(u => u.date?.startsWith(selectedMonth));
  const prevMonth = (() => {
    const d = new Date(selectedMonth + "-01");
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();
  const prevAiUsages = aiUsages.filter(u => u.date?.startsWith(prevMonth));

  const aiByTool = ["Claude", "ChatGPT", "Gemini", "Perplexity", "Sonstige"].map(tool => ({
    tool,
    kosten: monthAiUsages.filter(u => u.tool === tool).reduce((s, u) => s + (u.cost_euro || 0), 0),
  })).filter(t => t.kosten > 0);
  const aiTotal = monthAiUsages.reduce((s, u) => s + (u.cost_euro || 0), 0);
  const prevAiTotal = prevAiUsages.reduce((s, u) => s + (u.cost_euro || 0), 0);

  const monthSonstige = sonstige.filter(s => s.wiederkehrend || s.datum?.startsWith(selectedMonth));
  const sonstigeTotal = monthSonstige.reduce((s, r) => s + (r.betrag || 0), 0);

  const gesamtKosten = personalTotal + softwareTotal + aiTotal + sonstigeTotal;
  const prevGesamtKosten = personalTotal + softwareTotal + prevAiTotal + sonstigeTotal; // approximation

  // ── Einnahmen ───────────────────────────────────────────────────────────
  const monthIncome = tokenEntries.filter(e => e.date?.startsWith(selectedMonth)).reduce((s, e) => s + (e.amount_euro || 0), 0);
  const prevIncome = tokenEntries.filter(e => e.date?.startsWith(prevMonth)).reduce((s, e) => s + (e.amount_euro || 0), 0);
  const gewinnVerlust = monthIncome - gesamtKosten;

  const changePercent = prevGesamtKosten > 0 ? ((gesamtKosten - prevGesamtKosten) / prevGesamtKosten) * 100 : 0;

  // Größter Kostenpunkt
  const costCategories = [
    { label: "Personal", value: personalTotal },
    { label: "Software", value: softwareTotal },
    { label: "KI-Kosten", value: aiTotal },
    { label: "Sonstige", value: sonstigeTotal },
  ].sort((a, b) => b.value - a.value);

  // ── Hilfsfunktionen ─────────────────────────────────────────────────────
  const updatePersonal = (id, field, val) => setPersonal(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const deletePersonal = (id) => setPersonal(prev => prev.filter(r => r.id !== id));
  const addPersonal = () => setPersonal(prev => [...prev, { id: nextId(prev), name: "Neu", rolle: "", vertragsart: "Freelancer", stunden: 0, kosten: 0, status: "aktiv" }]);

  const updateSoftware = (id, field, val) => setSoftware(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const deleteSoftware = (id) => setSoftware(prev => prev.filter(r => r.id !== id));
  const addSoftware = () => setSoftware(prev => [...prev, { id: nextId(prev), tool: "Neues Tool", kategorie: "Sonstiges", kosten_monat: 0, jaehrlich: false, naechste_zahlung: "", notiz: "" }]);

  const updateSonstige = (id, field, val) => setSonstige(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const deleteSonstige = (id) => setSonstige(prev => prev.filter(r => r.id !== id));
  const addSonstige = () => setSonstige(prev => [...prev, { id: nextId(prev), bezeichnung: "Neue Position", kategorie: "Sonstiges", betrag: 0, datum: selectedMonth + "-01", wiederkehrend: false }]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* ── Monatsfilter ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">💰 Kosten & Budget</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Monat:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* ── ÜBERSICHT KPI-Karten ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Gesamtkosten/Monat</div>
          <div className="text-2xl font-bold text-red-600">{gesamtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
          <div className={`flex items-center gap-1 mt-1 text-xs ${changePercent > 0 ? "text-red-500" : changePercent < 0 ? "text-green-500" : "text-gray-400"}`}>
            {changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : changePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {changePercent !== 0 ? `${Math.abs(changePercent).toFixed(1)}% vs. Vormonat` : "Kein Vormonatswert"}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Hochgerechnet/Jahr</div>
          <div className="text-2xl font-bold text-orange-600">{(gesamtKosten * 12).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €</div>
          <div className="text-xs text-gray-400 mt-1">× 12 Monate</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Größter Kostenpunkt</div>
          <div className="text-xl font-bold text-gray-800">{costCategories[0]?.label || "—"}</div>
          <div className="text-xs text-orange-600 mt-1 font-semibold">{costCategories[0]?.value.toFixed(2)} €</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-xs text-gray-400 mb-1">Kostenpunkte</div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {costCategories.map(c => (
              <div key={c.label} className="text-xs">
                <span className="text-gray-500">{c.label}:</span>
                <span className="font-semibold text-gray-700 ml-1">{c.value.toFixed(0)}€</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EINNAHMEN vs AUSGABEN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Einnahmen vs. Ausgaben — {selectedMonth}</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Einnahmen (Token-Buchungen)</div>
            <div className="text-3xl font-bold text-green-600">{monthIncome.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
            {prevIncome > 0 && (
              <div className="text-xs text-gray-400 mt-1">Vormonat: {prevIncome.toFixed(2)} €</div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Ausgaben gesamt</div>
            <div className="text-3xl font-bold text-red-600">{gesamtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
            <div className="text-xs text-gray-400 mt-1">Personal + Software + KI + Sonstiges</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Ergebnis</div>
            <div className={`text-3xl font-bold ${gewinnVerlust >= 0 ? "text-green-600" : "text-red-600"}`}>
              {gewinnVerlust >= 0 ? "+" : ""}{gewinnVerlust.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${gewinnVerlust >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {gewinnVerlust >= 0 ? "✅ Gewinn" : "⚠️ Verlust"}
            </div>
          </div>
        </div>
        {/* Balkengrafik */}
        <div className="mt-6">
          <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-gray-100">
            {gesamtKosten > 0 && (
              <div className="bg-red-400 rounded-l-full transition-all" style={{ width: `${Math.min(100, (gesamtKosten / Math.max(gesamtKosten, monthIncome)) * 100)}%` }} title="Ausgaben" />
            )}
            {monthIncome > gesamtKosten && (
              <div className="bg-green-400 rounded-r-full flex-1" title="Gewinn" />
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>🔴 Ausgaben</span>
            <span>🟢 Einnahmen</span>
          </div>
        </div>
      </div>

      {/* ── 1. PERSONALKOSTEN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SectionHeader title="Personal-Kosten" icon="👥" total={personalTotal} color="text-blue-700" bg="bg-blue-50" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Rolle</th>
                <th className="text-left pb-2">Vertragsart</th>
                <th className="text-right pb-2">Stunden/Mo</th>
                <th className="text-right pb-2">Kosten/Mo</th>
                <th className="text-left pb-2 pl-4">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {personal.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                  <td className="py-2 font-medium text-gray-800">
                    <EditCell value={p.name} onChange={v => updatePersonal(p.id, "name", v)} />
                  </td>
                  <td className="py-2 text-gray-500">
                    <EditCell value={p.rolle} onChange={v => updatePersonal(p.id, "rolle", v)} />
                  </td>
                  <td className="py-2">
                    <EditCell value={p.vertragsart} onChange={v => updatePersonal(p.id, "vertragsart", v)} options={["Festangestellt", "Freelancer", "Inhaber", "Praktikant", "Werkstudent"]} />
                  </td>
                  <td className="py-2 text-right font-mono">
                    <EditCell value={p.stunden} onChange={v => updatePersonal(p.id, "stunden", parseFloat(v) || 0)} type="number" />
                  </td>
                  <td className="py-2 text-right font-semibold text-blue-700">
                    <EditCell value={p.kosten} onChange={v => updatePersonal(p.id, "kosten", parseFloat(v) || 0)} type="number" />
                    {" €"}
                  </td>
                  <td className="py-2 pl-4">
                    <EditCell value={p.status} onChange={v => updatePersonal(p.id, "status", v)} options={["aktiv", "inaktiv", "pausiert"]} />
                  </td>
                  <td className="py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deletePersonal(p.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="pt-2">
                  <button onClick={addPersonal} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Zeile hinzufügen
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-400">💡 Doppelklick auf eine Zelle zum Bearbeiten</div>
      </div>

      {/* ── 2. SOFTWARE & TOOLS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SectionHeader title="Software & Tools (Abonnements)" icon="🖥️" total={softwareTotal} color="text-purple-700" bg="bg-purple-50" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Tool</th>
                <th className="text-left pb-2">Kategorie</th>
                <th className="text-right pb-2">Kosten/Mo</th>
                <th className="text-center pb-2">Jährlich?</th>
                <th className="text-left pb-2">Nächste Zahlung</th>
                <th className="text-left pb-2">Notiz</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {software.map(sw => (
                <tr key={sw.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                  <td className="py-2 font-medium text-gray-800">
                    <EditCell value={sw.tool} onChange={v => updateSoftware(sw.id, "tool", v)} />
                  </td>
                  <td className="py-2 text-gray-500">
                    <EditCell value={sw.kategorie} onChange={v => updateSoftware(sw.id, "kategorie", v)} options={["KI", "App-Builder", "Automation", "Produktivität", "Design", "Kommunikation", "Marketing", "Sonstiges"]} />
                  </td>
                  <td className="py-2 text-right font-semibold text-purple-700">
                    <EditCell value={sw.kosten_monat} onChange={v => updateSoftware(sw.id, "kosten_monat", parseFloat(v) || 0)} type="number" />
                    {" €"}
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={sw.jaehrlich}
                      onChange={e => updateSoftware(sw.id, "jaehrlich", e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                  </td>
                  <td className="py-2">
                    <EditCell value={sw.naechste_zahlung} onChange={v => updateSoftware(sw.id, "naechste_zahlung", v)} />
                  </td>
                  <td className="py-2 text-gray-400 italic text-xs">
                    <EditCell value={sw.notiz} onChange={v => updateSoftware(sw.id, "notiz", v)} />
                  </td>
                  <td className="py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteSoftware(sw.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="pt-2">
                  <button onClick={addSoftware} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Tool hinzufügen
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── 3. KI-KOSTEN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SectionHeader title="KI-Kosten (aus KI-Erfassung)" icon="🤖" total={aiTotal} color="text-orange-700" bg="bg-orange-50" />
        {monthAiUsages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-6">Keine KI-Kosten für {selectedMonth} erfasst</div>
        ) : (
          <div className="space-y-3">
            {aiByTool.map(t => (
              <div key={t.tool} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium text-gray-700">{t.tool}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full transition-all"
                    style={{ width: `${aiTotal > 0 ? (t.kosten / aiTotal) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-orange-700 w-20 text-right">{t.kosten.toFixed(2)} €</span>
                <span className="text-xs text-gray-400 w-12 text-right">{aiTotal > 0 ? ((t.kosten / aiTotal) * 100).toFixed(0) : 0}%</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Einträge gesamt</span>
                <span className="font-semibold">{monthAiUsages.length} Einträge</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Vormonat ({prevMonth})</span>
                <span className={`font-semibold ${prevAiTotal > 0 ? "text-gray-700" : "text-gray-400"}`}>{prevAiTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. SONSTIGE KOSTEN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SectionHeader title="Sonstige Kosten" icon="📋" total={sonstigeTotal} color="text-gray-700" bg="bg-gray-100" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Bezeichnung</th>
                <th className="text-left pb-2">Kategorie</th>
                <th className="text-right pb-2">Betrag</th>
                <th className="text-left pb-2 pl-4">Datum</th>
                <th className="text-center pb-2">Wiederkehrend</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {sonstige.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 text-xs py-6 italic">Noch keine Einträge — klicke auf "Hinzufügen"</td></tr>
              )}
              {sonstige.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                  <td className="py-2 font-medium text-gray-800">
                    <EditCell value={r.bezeichnung} onChange={v => updateSonstige(r.id, "bezeichnung", v)} />
                  </td>
                  <td className="py-2 text-gray-500">
                    <EditCell value={r.kategorie} onChange={v => updateSonstige(r.id, "kategorie", v)} options={["Miete", "Strom/Gas", "Versicherung", "Verband/Beitrag", "Transport", "Marketing", "Sonstiges"]} />
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-700">
                    <EditCell value={r.betrag} onChange={v => updateSonstige(r.id, "betrag", parseFloat(v) || 0)} type="number" />
                    {" €"}
                  </td>
                  <td className="py-2 pl-4">
                    <EditCell value={r.datum} onChange={v => updateSonstige(r.id, "datum", v)} />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="checkbox"
                      checked={r.wiederkehrend}
                      onChange={e => updateSonstige(r.id, "wiederkehrend", e.target.checked)}
                      className="accent-orange-500 w-4 h-4"
                    />
                  </td>
                  <td className="py-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteSonstige(r.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="pt-2">
                  <button onClick={addSonstige} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Kostenpunkt hinzufügen
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── KOSTENZUSAMMENFASSUNG ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📈 Zusammenfassung</h3>
        <div className="space-y-3">
          {costCategories.map((c, i) => (
            <div key={c.label} className="flex items-center gap-4">
              <div className="w-28 text-sm font-medium text-gray-700">{c.label}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${gesamtKosten > 0 ? (c.value / gesamtKosten) * 100 : 0}%`,
                    background: ["#3b82f6", "#8b5cf6", "#f97316", "#6b7280"][i],
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-24 text-right">{c.value.toFixed(2)} €</span>
              <span className="text-xs text-gray-400 w-10 text-right">{gesamtKosten > 0 ? ((c.value / gesamtKosten) * 100).toFixed(0) : 0}%</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900">Gesamt</span>
            <span className="text-xl font-bold text-red-600">{gesamtKosten.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}