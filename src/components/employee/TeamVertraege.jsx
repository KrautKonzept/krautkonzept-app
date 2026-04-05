import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, AlertTriangle } from "lucide-react";

const TEAM = [
  {
    name: "Emanuel",
    email: "info@krautkonzept.de",
    role: "CEO / Gründer",
    kosten: "–",
    tokenInfo: "100% Einzelunternehmen, strategisch",
    statusKey: "vertrag_emanuel",
    defaultStatus: "Aktiv",
  },
  {
    name: "Andrea",
    email: "andrea@krautkonzept.de",
    role: "Marketing & KI",
    kosten: "3.000 €/Monat",
    tokenInfo: "Aktiv, variabel",
    statusKey: "vertrag_andrea",
    defaultStatus: "Aktiv",
  },
  {
    name: "Dietrich",
    email: "dietrich@krautkonzept.de",
    role: "Tech & WooCommerce",
    kosten: "~30 €/Monat",
    tokenInfo: "30% unter 40€/Std = 1,5 Token",
    statusKey: "vertrag_dietrich",
    defaultStatus: "Offen",
  },
  {
    name: "Vincent",
    email: "vincent@krautkonzept.de",
    role: "Entwicklung",
    kosten: "variabel",
    tokenInfo: "Aktiv, variabel – je Auftrag, Start-Badge, direkt Link",
    statusKey: "vertrag_vincent",
    defaultStatus: "Aktiv",
  },
  {
    name: "Luc",
    email: "luc@krautkonzept.de",
    role: "Backoffice & Finanzen",
    kosten: "20€/Std",
    tokenInfo: "20€/Std = 1,25 Token",
    statusKey: "vertrag_luc",
    defaultStatus: "Aktiv",
  },
];

const STATUS_COLORS = {
  "Offen": "bg-orange-100 text-orange-700",
  "Unterschrieben": "bg-blue-100 text-blue-700",
  "Aktiv": "bg-green-100 text-green-700",
};

export default function TeamVertraege() {
  const [statuses, setStatuses] = useState({});
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "team_vertraege_statuses" }).then(results => {
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
        key: "team_vertraege_statuses",
        enabled_pages: newStatuses,
      });
      setSettingsId(created.id);
    }
    setSaving(null);
  };

  const getStatus = (member) => statuses[member.statusKey] ?? member.defaultStatus;

  const offeneVertraege = TEAM.filter(m => getStatus(m) === "Offen").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Team & Verträge</h3>
        {offeneVertraege > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {offeneVertraege} Vertrag{offeneVertraege > 1 ? "e" : ""} offen!
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4">Name / Rolle</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4 hidden md:table-cell">Kosten</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3 pr-4 hidden lg:table-cell">Token-Info</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3">Vertragsstatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {TEAM.map(member => {
              const current = getStatus(member);
              const isOffen = current === "Offen";
              return (
                <tr key={member.email}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-800">{member.name}</div>
                      {isOffen && member.statusKey === "vertrag_dietrich" && (
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Vertrag offen!</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{member.role}</div>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="text-xs text-gray-600 font-medium">{member.kosten}</span>
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">{member.tokenInfo}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {saving === member.statusKey && (
                        <div className="w-3 h-3 border border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      )}
                      <select
                        value={current}
                        onChange={e => handleChange(member.statusKey, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-3 py-1.5 border-0 outline-none cursor-pointer ${STATUS_COLORS[current] || "bg-gray-100 text-gray-600"}`}
                      >
                        {["Offen", "Unterschrieben", "Aktiv"].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}