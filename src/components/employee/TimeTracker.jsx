import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Square, Clock, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KI_TOOLS_LIST = ["Claude", "ChatGPT", "Gemini", "Perplexity", "Sonstige"];

const TOOLS = [
  "Claude / ChatGPT",
  "Make / n8n",
  "Figma / Canva",
  "Google Workspace",
  "WooCommerce",
  "Base44",
  "Zoom / Jitsi",
  "Slack / WhatsApp",
];

const DIFFICULTIES = ["Einfach", "Mittel", "Komplex", "Kritisch"];

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function SaveModal({ open, durationMinutes, clients, kostensaetze, userEmail, onSave, onClose }) {
  const [form, setForm] = useState({
    description: "",
    project: "",
    difficulty: "",
    tools_used: [],
    tools_other: "",
    duration_minutes: durationMinutes,
    ki_used: false,
    ki_tool: "",
    ki_cost: "",
    ki_weiterberechnen: false,
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, duration_minutes: durationMinutes }));
  }, [durationMinutes]);

  // Auto-calculate KI cost from Kostensätze
  useEffect(() => {
    if (form.ki_used && form.ki_tool) {
      const match = kostensaetze.find(k =>
        k.kategorie === "KI-Tools" &&
        k.bezeichnung.toLowerCase().includes(form.ki_tool.toLowerCase())
      );
      if (match && !form.ki_cost) {
        // Default placeholder – user can override
        setForm(prev => ({ ...prev, ki_cost: "" }));
      }
    }
  }, [form.ki_tool, form.ki_used]);

  // Calculate internal personal cost
  const personalKosten = (() => {
    const ks = kostensaetze.find(k =>
      k.kategorie === "Personal" && k.mitarbeiter_email === userEmail
    );
    if (!ks) return 0;
    return (form.duration_minutes / 60) * ks.kosten_pro_einheit;
  })();

  const overheadKosten = (() => {
    const ks = kostensaetze.find(k => k.kategorie === "Sonstiges" && k.bezeichnung === "Overhead");
    if (!ks) return 0;
    return (form.duration_minutes / 60) * ks.kosten_pro_einheit;
  })();

  const kiKosten = parseFloat(form.ki_cost) || 0;
  const gesamtKosten = personalKosten + overheadKosten + kiKosten;

  if (!open) return null;

  const toggleTool = (tool) => {
    setForm(prev => ({
      ...prev,
      tools_used: prev.tools_used.includes(tool)
        ? prev.tools_used.filter(t => t !== tool)
        : [...prev.tools_used, tool],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Zeit erfassen</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          {/* Beschreibung */}
          <div>
            <Label className="text-xs text-gray-500 font-medium">Beschreibung</Label>
            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Was wurde gemacht?" className="mt-1" />
          </div>

          {/* Klient */}
          <div>
            <Label className="text-xs text-gray-500 font-medium">Klient</Label>
            <Select value={form.project} onValueChange={v => setForm(p => ({ ...p, project: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Klient wählen" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Schwierigkeitsgrad */}
          <div>
            <Label className="text-xs text-gray-500 font-medium">Schwierigkeitsgrad</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    form.difficulty === d
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <Label className="text-xs text-gray-500 font-medium">Genutzte Programme / Tools</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {TOOLS.map(tool => (
                <label key={tool} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.tools_used.includes(tool)}
                    onChange={() => toggleTool(tool)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  {tool}
                </label>
              ))}
            </div>
            <Input
              value={form.tools_other}
              onChange={e => setForm(p => ({ ...p, tools_other: e.target.value }))}
              placeholder="Sonstiges (weitere Tools oder Notizen)"
              className="mt-3"
            />
          </div>

          {/* Dauer */}
          <div>
            <Label className="text-xs text-gray-500 font-medium">Dauer (Minuten)</Label>
            <Input
              type="number"
              value={form.duration_minutes}
              onChange={e => setForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 0 }))}
              className="mt-1 w-32"
            />
          </div>

          {/* KI-Tools */}
          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ki_used}
                onChange={e => setForm(p => ({ ...p, ki_used: e.target.checked }))}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">KI-Tool genutzt?</span>
            </label>
            {form.ki_used && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">Tool</Label>
                    <Select value={form.ki_tool} onValueChange={v => setForm(p => ({ ...p, ki_tool: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Tool wählen" /></SelectTrigger>
                      <SelectContent>{KI_TOOLS_LIST.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Kosten (€)</Label>
                    <Input type="number" step="0.01" value={form.ki_cost} onChange={e => setForm(p => ({ ...p, ki_cost: e.target.value }))} placeholder="0.00" className="mt-1" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ki_weiterberechnen}
                    onChange={e => setForm(p => ({ ...p, ki_weiterberechnen: e.target.checked }))}
                    className="accent-orange-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">KI-Kosten an Kunden weiterberechnen?</span>
                </label>
              </div>
            )}
          </div>

          {/* Kosten-Vorschau */}
          {form.duration_minutes > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs space-y-1">
              <div className="font-semibold text-blue-700 mb-2">Interne Kosten (Vorschau)</div>
              <div className="flex justify-between text-gray-600">
                <span>Personal ({(form.duration_minutes/60).toFixed(2)}h)</span>
                <span>{personalKosten.toFixed(2)} €</span>
              </div>
              {kiKosten > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>KI-Kosten</span>
                  <span>{kiKosten.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Overhead</span>
                <span>{overheadKosten.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-bold text-blue-700 border-t border-blue-200 pt-1 mt-1">
                <span>Gesamt intern</span>
                <span>{gesamtKosten.toFixed(2)} €</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => onSave(form, { personalKosten, kiKosten, overheadKosten, gesamtKosten })} className="bg-orange-500 hover:bg-orange-600 text-white flex-1">Eintrag speichern</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
        </div>
      </div>
    </div>
  );
}

export default function TimeTracker({ user }) {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [kostensaetze, setKostensaetze] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);
  const intervalRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      base44.entities.TimeEntry.filter({ employee_email: user.email }, "-date", 50),
      base44.entities.Client.list("name", 100),
      base44.entities.Kostensatz.list("kategorie", 200),
    ]).then(([entries, clients, ks]) => {
      setEntries(entries);
      setClients(clients);
      setKostensaetze(ks);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const startTimer = () => {
    setStartTime(new Date());
    setElapsed(0);
    setRunning(true);
  };

  const stopTimer = () => {
    setRunning(false);
    const end = new Date();
    const durationMin = Math.max(1, Math.round(elapsed / 60));
    const startStr = startTime.toTimeString().slice(0, 5);
    const endStr = end.toTimeString().slice(0, 5);
    setPendingEntry({ startStr, endStr, durationMin });
    setShowModal(true);
    setElapsed(0);
  };

  const handleSave = async (form, costs) => {
    const { personalKosten, kiKosten, overheadKosten, gesamtKosten } = costs || {};

    const entry = await base44.entities.TimeEntry.create({
      employee_email: user.email,
      date: today,
      start_time: pendingEntry?.startStr || new Date().toTimeString().slice(0, 5),
      end_time: pendingEntry?.endStr || new Date().toTimeString().slice(0, 5),
      duration_minutes: form.duration_minutes,
      description: form.description,
      project: form.project,
      difficulty: form.difficulty,
      tools_used: form.tools_used,
      tools_other: form.tools_other,
      interne_kosten_personal: personalKosten || 0,
      interne_kosten_ki: kiKosten || 0,
      interne_kosten_overhead: overheadKosten || 0,
      interne_kosten_gesamt: gesamtKosten || 0,
    });

    // Token-Automatik
    if (form.project && form.duration_minutes > 0) {
      const tokenCount = Math.ceil(form.duration_minutes / 40);
      const amountEuro = tokenCount * 25;

      await base44.entities.TokenEntry.create({
        client: form.project,
        date: today,
        description: form.description || "Zeiterfassung",
        token_count: tokenCount,
        amount_euro: amountEuro,
        status: "offen",
        category: "Sonstiges",
        source: "Zeiterfassung (automatisch)",
      });

      const clientList = await base44.entities.Client.filter({ name: form.project });
      if (clientList.length > 0) {
        const client = clientList[0];
        const newBudget = Math.max(0, (client.token_budget || 0) - tokenCount);
        await base44.entities.Client.update(client.id, { token_budget: newBudget });
      }

      setEntries(prev => [{ ...entry, _tokens: tokenCount }, ...prev]);
    } else {
      setEntries(prev => [entry, ...prev]);
    }

    // KI-Kosten speichern
    if (form.ki_used && form.ki_tool && parseFloat(form.ki_cost) > 0) {
      await base44.entities.AiUsage.create({
        employee_email: user.email,
        date: today,
        tool: form.ki_tool,
        cost_euro: parseFloat(form.ki_cost),
        client: form.project || "",
        description: form.description || "Zeiterfassung",
        source: "Zeiterfassung",
      });

      // KI-Kosten an Kunden weiterberechnen
      if (form.ki_weiterberechnen && form.project) {
        await base44.entities.TokenEntry.create({
          client: form.project,
          date: today,
          description: `KI-Aufwand (${form.ki_tool}): ${form.description || "Zeiterfassung"}`,
          token_count: 0,
          amount_euro: parseFloat(form.ki_cost),
          status: "offen",
          category: "Sonstiges",
          source: "KI-Aufwand (automatisch)",
        });
      }
    }

    setShowModal(false);
    setPendingEntry(null);
  };

  const deleteEntry = async (id) => {
    await base44.entities.TimeEntry.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const todayEntries = entries.filter(e => e.date === today);
  const todayTotal = todayEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  const formatElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <SaveModal
        open={showModal}
        durationMinutes={pendingEntry?.durationMin || 0}
        clients={clients}
        kostensaetze={kostensaetze}
        userEmail={user.email}
        onSave={handleSave}
        onClose={() => { setShowModal(false); setPendingEntry(null); }}
      />

      {/* Timer */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 text-center">
        <div className="text-5xl font-mono font-bold text-gray-900 mb-6 tracking-tight">
          {formatElapsed()}
        </div>
        {running ? (
          <Button onClick={stopTimer} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl gap-2 font-semibold">
            <Square className="w-4 h-4" /> Stoppen & Erfassen
          </Button>
        ) : (
          <Button onClick={startTimer} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl gap-2 font-semibold">
            <Play className="w-4 h-4" /> Starten
          </Button>
        )}
        {!running && (
          <p className="text-sm text-gray-400 mt-3 cursor-pointer underline" onClick={() => { setPendingEntry(null); setShowModal(true); }}>
            Eintrag manuell hinzufügen
          </p>
        )}
      </div>

      {/* Today Summary */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Heute erfasst</h3>
        <div className="flex items-center gap-2 text-orange-600 font-semibold">
          <Clock className="w-4 h-4" />
          {formatDuration(todayTotal)} gesamt
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>
      ) : (
        <div className="space-y-2">
          {todayEntries.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              Noch keine Einträge für heute.
            </div>
          )}
          {todayEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm">{entry.description || "Kein Titel"}</div>
                <div className="text-xs text-gray-400 flex flex-wrap gap-2 mt-0.5">
                  <span>{entry.start_time} – {entry.end_time}</span>
                  {entry.project && <span>· {entry.project}</span>}
                  {entry.difficulty && <span>· {entry.difficulty}</span>}
                  {entry.tools_used?.length > 0 && <span>· {entry.tools_used.join(", ")}</span>}
                  {entry.interne_kosten_gesamt > 0 && (
                    <span className="text-blue-500">· intern: {entry.interne_kosten_gesamt.toFixed(2)} €</span>
                  )}
                </div>
              </div>
              <div className="text-right mr-2">
                <div className="text-sm font-semibold text-gray-700">{formatDuration(entry.duration_minutes || 0)}</div>
                {(entry._tokens || entry.duration_minutes > 0) && entry.project && (
                  <div className="text-xs text-orange-500 font-medium">= {entry._tokens || Math.ceil((entry.duration_minutes || 0) / 40)} Tokens ✓</div>
                )}
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}