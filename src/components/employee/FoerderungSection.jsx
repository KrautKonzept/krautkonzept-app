import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";

const FOERDERUNGEN = [
  {
    key: "kfw_startgeld",
    label: "KfW StartGeld",
    betrag: "130.000 €",
    betragRaw: 130000,
    optionen: ["Offen", "Hausbank kontaktiert", "Antrag gestellt", "Bewilligt"],
  },
  {
    key: "ki_foerderung_gehaelter",
    label: "KI-Förderung Gehälter",
    betrag: "50.000 €",
    betragRaw: 50000,
    optionen: ["Offen", "Beantragt", "Bewilligt"],
  },
  {
    key: "it_foerderung_citas",
    label: "IT-Förderung CITAS",
    betrag: null,
    optionen: ["Offen", "Prüfung", "Beantragt"],
  },
  {
    key: "spendenantrag_dachverband",
    label: "Spendenantrag Dachverband",
    betrag: null,
    optionen: ["Offen", "Eingereicht", "Bewilligt", "Abgelehnt"],
  },
];

const STATUS_COLORS = {
  "Offen": "bg-gray-100 text-gray-600",
  "Hausbank kontaktiert": "bg-blue-100 text-blue-700",
  "Antrag gestellt": "bg-orange-100 text-orange-700",
  "Bewilligt": "bg-green-100 text-green-700",
  "Beantragt": "bg-orange-100 text-orange-700",
  "Prüfung": "bg-yellow-100 text-yellow-700",
  "Eingereicht": "bg-blue-100 text-blue-700",
  "Abgelehnt": "bg-red-100 text-red-700",
};

export default function FoerderungSection() {
  const [statuses, setStatuses] = useState({});
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "foerderung_statuses" }).then(results => {
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
        key: "foerderung_statuses",
        enabled_pages: newStatuses,
      });
      setSettingsId(created.id);
    }
    setSaving(null);
  };

  const allOpen = FOERDERUNGEN.every(f => !statuses[f.key] || statuses[f.key] === "Offen");
  const gesamtvolumen = FOERDERUNGEN.reduce((sum, f) => sum + (f.betragRaw || 0), 0);

  return (
    <div className={`rounded-2xl border-2 p-5 ${allOpen ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className={`w-5 h-5 ${allOpen ? "text-orange-500" : "text-gray-400"}`} />
        <h3 className={`font-semibold text-base ${allOpen ? "text-orange-700" : "text-gray-800"}`}>
          Förderung & Finanzierung
        </h3>
        <span className="ml-auto text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-0.5 rounded-full">
          Potenzial: <span className="font-bold text-gray-800">{gesamtvolumen.toLocaleString("de-DE")} €</span>
        </span>
        {allOpen && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
            Handlungsbedarf
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {FOERDERUNGEN.map(f => {
          const current = statuses[f.key] || "Offen";
          return (
            <div key={f.key} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-gray-800">{f.label}</div>
                {f.betrag && <div className="text-xs text-gray-400 mt-0.5">{f.betrag}</div>}
              </div>
              <div className="flex items-center gap-2">
                {saving === f.key && (
                  <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin" />
                )}
                <select
                  value={current}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className={`text-xs font-semibold rounded-lg px-3 py-1.5 border-0 outline-none cursor-pointer ${STATUS_COLORS[current] || "bg-gray-100 text-gray-600"}`}
                >
                  {f.optionen.map(opt => (
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