import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_KOSTENSAETZE = [
  { kategorie: "KI-Tools", bezeichnung: "Claude API", kosten_pro_einheit: 0.003, einheit: "pro 1k Tokens", auf_kunde_umlegbar: true },
  { kategorie: "KI-Tools", bezeichnung: "ChatGPT API", kosten_pro_einheit: 0.002, einheit: "pro 1k Tokens", auf_kunde_umlegbar: true },
  { kategorie: "KI-Tools", bezeichnung: "Gemini", kosten_pro_einheit: 0.001, einheit: "pro 1k Tokens", auf_kunde_umlegbar: true },
  { kategorie: "Personal", bezeichnung: "Beratung Emanuel", kosten_pro_einheit: 62.50, einheit: "pro Stunde", auf_kunde_umlegbar: true, mitarbeiter_email: "info@krautkonzept.de" },
  { kategorie: "Personal", bezeichnung: "Beratung Andrea", kosten_pro_einheit: 37.50, einheit: "pro Stunde", auf_kunde_umlegbar: true, mitarbeiter_email: "andrea@krautkonzept.de" },
  { kategorie: "Personal", bezeichnung: "Tech Dietrich", kosten_pro_einheit: 50.00, einheit: "pro Stunde", auf_kunde_umlegbar: true, mitarbeiter_email: "dietrich@krautkonzept.de" },
  { kategorie: "Software", bezeichnung: "Base44", kosten_pro_einheit: 1.63, einheit: "pro Tag", auf_kunde_umlegbar: false },
  { kategorie: "Software", bezeichnung: "Google Workspace", kosten_pro_einheit: 0.20, einheit: "pro Tag", auf_kunde_umlegbar: false },
  { kategorie: "Sonstiges", bezeichnung: "Overhead", kosten_pro_einheit: 5.00, einheit: "pro Stunde", auf_kunde_umlegbar: false },
];

export default function KostensaetzePanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.Kostensatz.list("kategorie", 200).then(data => {
      if (data.length === 0) {
        // Pre-fill with defaults (in-memory only until saved)
        setRows(DEFAULT_KOSTENSAETZE.map((d, i) => ({ ...d, _id: `new_${i}`, _new: true })));
      } else {
        setRows(data.map(d => ({ ...d, _id: d.id })));
      }
      setLoading(false);
    });
  }, []);

  const updateRow = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      _id: `new_${Date.now()}`, _new: true,
      kategorie: "", bezeichnung: "", kosten_pro_einheit: 0, einheit: "pro Stunde", auf_kunde_umlegbar: false
    }]);
  };

  const deleteRow = async (idx) => {
    const row = rows[idx];
    if (!row._new && row.id) {
      await base44.entities.Kostensatz.delete(row.id);
    }
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const row of rows) {
      const payload = {
        kategorie: row.kategorie,
        bezeichnung: row.bezeichnung,
        kosten_pro_einheit: parseFloat(row.kosten_pro_einheit) || 0,
        einheit: row.einheit,
        auf_kunde_umlegbar: !!row.auf_kunde_umlegbar,
        mitarbeiter_email: row.mitarbeiter_email || "",
      };
      if (row._new || !row.id) {
        const created = await base44.entities.Kostensatz.create(payload);
        row.id = created.id;
        row._new = false;
      } else {
        await base44.entities.Kostensatz.update(row.id, payload);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const kategorien = ["KI-Tools", "Personal", "Software", "Sonstiges"];

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Kostensätze</h2>
          <p className="text-sm text-gray-400 mt-0.5">Interne Kostenstruktur für automatische Verrechnung</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addRow} variant="outline" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Neue Zeile
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5" size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Gespeichert!" : "Speichern"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Kategorie", "Bezeichnung", "Kosten/Einheit (€)", "Einheit", "Mitarbeiter-Email", "Auf Kunde umlegbar", ""].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row._id || idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-2 px-2">
                  <select
                    value={row.kategorie}
                    onChange={e => updateRow(idx, "kategorie", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-white"
                  >
                    <option value="">-- wählen --</option>
                    {kategorien.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={row.bezeichnung}
                    onChange={e => updateRow(idx, "bezeichnung", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    placeholder="z.B. Claude API"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    step="0.001"
                    value={row.kosten_pro_einheit}
                    onChange={e => updateRow(idx, "kosten_pro_einheit", e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={row.einheit}
                    onChange={e => updateRow(idx, "einheit", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    placeholder="pro Stunde"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={row.mitarbeiter_email || ""}
                    onChange={e => updateRow(idx, "mitarbeiter_email", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    placeholder="nur für Personal"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={!!row.auf_kunde_umlegbar}
                    onChange={e => updateRow(idx, "auf_kunde_umlegbar", e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                  />
                </td>
                <td className="py-2 px-2">
                  <button onClick={() => deleteRow(idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        💡 Personal-Kostensätze werden anhand der Mitarbeiter-Email automatisch bei der Zeiterfassung zugeordnet.
        KI-Kostensätze werden beim Anhaken eines KI-Tools in der Zeiterfassung verrechnet.
      </p>
    </div>
  );
}