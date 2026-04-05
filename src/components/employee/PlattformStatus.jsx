import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, ExternalLink, AlertTriangle } from "lucide-react";

const PLATFORMS = [
  {
    name: "KrautKonzept Website",
    key: "plattform_krautkonzept",
    url: "https://krautkonzept.de",
    beschreibung: "Hauptwebseite",
  },
  {
    name: "KrautHub",
    key: "plattform_krauthub",
    url: "https://krauthub.de",
    beschreibung: "CSC-Mitgliederplattform",
  },
  {
    name: "Grüne Seiten",
    key: "plattform_grueneseiten",
    url: "https://gruene-seiten.de",
    beschreibung: "CSC-Verzeichnis",
  },
  {
    name: "H4L",
    key: "plattform_h4l",
    url: "https://h4l.de",
    beschreibung: "Health for Life",
  },
  {
    name: "CITAS",
    key: "plattform_citas",
    url: "https://citas.de",
    beschreibung: "IT-Förderplattform",
  },
];

const STATUS_OPTIONS = ["Aktiv", "In Entwicklung", "Geplant", "Wartung", "Offline"];

const STATUS_COLORS = {
  "Aktiv": "bg-green-100 text-green-700",
  "In Entwicklung": "bg-blue-100 text-blue-700",
  "Geplant": "bg-gray-100 text-gray-600",
  "Wartung": "bg-yellow-100 text-yellow-700",
  "Offline": "bg-red-100 text-red-700",
};

export default function PlattformStatus() {
  const [statuses, setStatuses] = useState({});
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "plattform_statuses" }).then(results => {
      if (results.length > 0) {
        setSettingsId(results[0].id);
        setStatuses(results[0].enabled_pages || {});
      }
    });
  }, []);

  const handleChange = async (key, value) => {
    setSaving(key);
    const newStatuses = { ...statuses, [key]: value };
    setStatuses(newStatuses);
    if (settingsId) {
      await base44.entities.SiteSettings.update(settingsId, { enabled_pages: newStatuses });
    } else {
      const created = await base44.entities.SiteSettings.create({
        key: "plattform_statuses",
        enabled_pages: newStatuses,
      });
      setSettingsId(created.id);
    }
    setSaving(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Globe className="w-4 h-4 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Plattform-Status</h3>
        <span className="text-xs text-gray-400 ml-1">Schnellübersicht</span>
      </div>

      {/* Domain-Hinweis Banner */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
        <div className="space-y-1">
          <div className="font-semibold">Domain krautkonzept.de noch nicht verbunden.</div>
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">Schritt 1:</span> Im Base44 Editor oben auf die drei Punkte klicken → <span className="font-semibold">„Custom Domain"</span> auswählen<br />
            <span className="font-semibold">Schritt 2:</span> krautkonzept.de eingeben und speichern<br />
            <span className="font-semibold">Schritt 3:</span> Den angezeigten A-Record in Strato DNS eintragen
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLATFORMS.map(p => {
          const current = statuses[p.key] || "Aktiv";
          return (
            <div key={p.key} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.beschreibung}</div>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  title={p.url}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {saving === p.key && (
                  <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
                <select
                  value={current}
                  onChange={e => handleChange(p.key, e.target.value)}
                  className={`text-xs font-semibold rounded-lg px-2.5 py-1 border-0 outline-none cursor-pointer w-full ${STATUS_COLORS[current] || "bg-gray-100 text-gray-600"}`}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}