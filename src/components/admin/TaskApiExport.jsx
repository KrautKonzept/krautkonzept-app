import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Upload, Info, Code2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCHEMA_FIELDS = [
  { field: "id", type: "string", desc: "Eindeutige ID" },
  { field: "title", type: "string", desc: "Aufgabentitel" },
  { field: "description", type: "string", desc: "Beschreibung" },
  { field: "board", type: "string", desc: "sprint | backlog | projekte | wiederkehrend | intern" },
  { field: "status", type: "string", desc: "offen | in_arbeit | review | erledigt | archiviert" },
  { field: "assigned_to", type: "string", desc: "E-Mail oder Name des Zuständigen" },
  { field: "collaborators", type: "array", desc: "Beteiligte Teammitglieder" },
  { field: "tags", type: "array", desc: "Labels / Tags" },
  { field: "due_date", type: "string", desc: "Fälligkeitsdatum (YYYY-MM-DD)" },
  { field: "priority", type: "string", desc: "niedrig | mittel | hoch | kritisch" },
  { field: "notes", type: "array", desc: "Notizen (id, text, created_at)" },
  { field: "subtasks", type: "array", desc: "Teilaufgaben (id, text, done)" },
  { field: "activity", type: "array", desc: "Aktivitätslog (action, timestamp, user)" },
  { field: "created_date", type: "string", desc: "Erstellungsdatum (ISO)" },
];

export default function TaskApiExport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    const tasks = await base44.entities.Task.list("-created_date", 1000);
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `tasks_export_${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const text = await file.text();
    const incoming = JSON.parse(text);
    const existing = await base44.entities.Task.list("-created_date", 1000);
    const existingIds = new Set(existing.map((t) => t.id));

    const toInsert = incoming.filter((t) => !existingIds.has(t.id));
    let created = 0;
    let skipped = incoming.length - toInsert.length;

    for (const task of toInsert) {
      const { id, created_date, updated_date, ...rest } = task;
      await base44.entities.Task.create(rest);
      created++;
    }

    setImportResult({ created, skipped });
    setImporting(false);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Externe Datenschnittstelle</p>
          <p className="text-blue-700">
            Diese Daten können von externen Tools (z.B. Claude AI, Cowork) gelesen und geschrieben werden.
          </p>
          <p className="mt-1 font-mono text-xs bg-blue-100 px-2 py-1 rounded inline-block mt-2">
            Export-URL: /api/tasks
          </p>
        </div>
      </div>

      {/* Export / Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-500" /> Tasks exportieren
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Alle Tasks als JSON-Datei herunterladen.
          </p>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? "Exportiere..." : "JSON herunterladen"}
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-orange-500" /> Tasks importieren
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            JSON hochladen — neue Tasks werden eingefügt, Duplikate (gleiche ID) übersprungen.
          </p>
          <label className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all text-sm font-medium ${importing ? "border-gray-200 text-gray-400" : "border-orange-300 text-orange-600 hover:bg-orange-50"}`}>
            {importing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importiere...</>
            ) : (
              <><Upload className="w-4 h-4" /> JSON-Datei auswählen</>
            )}
            <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
          </label>

          {importResult && (
            <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{importResult.created}</strong> neue Tasks importiert,{" "}
                <strong>{importResult.skipped}</strong> Duplikate übersprungen.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Schema */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-orange-500" /> Task-Datenschema
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Feld</th>
                <th className="text-left py-2 pr-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Typ</th>
                <th className="text-left py-2 text-gray-500 font-medium text-xs uppercase tracking-wide">Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {SCHEMA_FIELDS.map((f) => (
                <tr key={f.field} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs text-orange-600 font-semibold">{f.field}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-blue-600">{f.type}</td>
                  <td className="py-2 text-gray-600 text-xs">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}