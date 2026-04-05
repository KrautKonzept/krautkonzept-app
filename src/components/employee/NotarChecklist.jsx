import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Square, FileText, ExternalLink } from "lucide-react";

const CHECKLIST_ITEMS = [
  { key: "mitarbeiter_aufnahme", label: "Mitarbeiter-Aufnahme" },
  { key: "holding_ug_gruendung", label: "Holding UG Gründung" },
  { key: "ueberarbeitung", label: "Überarbeitung" },
];

export default function NotarChecklist() {
  const [checked, setChecked] = useState({});
  const [settingsId, setSettingsId] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "notar_checklist" }).then(results => {
      if (results.length > 0) {
        setSettingsId(results[0].id);
        setChecked(results[0].enabled_pages || {});
      }
    });
  }, []);

  const toggle = async (key) => {
    const newChecked = { ...checked, [key]: !checked[key] };
    setChecked(newChecked);
    if (settingsId) {
      await base44.entities.SiteSettings.update(settingsId, { enabled_pages: newChecked });
    } else {
      const created = await base44.entities.SiteSettings.create({
        key: "notar_checklist",
        enabled_pages: newChecked,
      });
      setSettingsId(created.id);
    }
  };

  const allDone = CHECKLIST_ITEMS.every(i => checked[i.key]);
  const doneCount = CHECKLIST_ITEMS.filter(i => checked[i.key]).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Notar beauftragen</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {doneCount}/{CHECKLIST_ITEMS.length}
          </span>
        </div>
        <a
          href="mailto:notar@example.com?subject=Beauftragung%20Notar&body=Guten%20Tag%2C%0A%0Awir%20m%C3%B6chten%20Sie%20beauftragen%20f%C3%BCr%3A%0A-%20Mitarbeiter-Aufnahme%0A-%20Holding%20UG%20Gr%C3%BCndung%0A-%20%C3%9Cberarbeitung"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            allDone
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Notar beauftragen
        </a>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            {checked[item.key]
              ? <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
              : <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
            }
            <span className={`text-sm font-medium ${checked[item.key] ? "line-through text-gray-400" : "text-gray-700"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {allDone && (
        <div className="mt-3 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
          ✓ Alle Punkte geprüft — bereit zur Beauftragung
        </div>
      )}
    </div>
  );
}