import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Coins, FileText, TrendingDown } from "lucide-react";

const STATIC_FORDERUNGEN = [
  { client: "CSC Buds Bunny", token: 24, euro: 600 },
  { client: "CSC Inntal-Raubling", token: 22, euro: 550 },
  { client: "Exotic Kingdom Fulda", token: 24, euro: 600 },
];

const MONATLICHE_KOSTEN = [
  { label: "Andrea Feuchtenberger", betrag: "3.000 €/Monat" },
  { label: "Base44", betrag: "50 $/Monat" },
  { label: "Anthropic API", betrag: "~30 €/Monat" },
];

const gesamtToken = STATIC_FORDERUNGEN.reduce((s, f) => s + f.token, 0);
const gesamtEuro = STATIC_FORDERUNGEN.reduce((s, f) => s + f.euro, 0);

export default function TokenUebersicht() {
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);

  const handleAlleRechnungen = async () => {
    setCreating(true);
    // Mark all open TokenEntries as abgerechnet
    const entries = await base44.entities.TokenEntry.list("-date", 200);
    const offene = entries.filter(e => e.status === "offen");
    await Promise.all(offene.map(e => base44.entities.TokenEntry.update(e.id, { status: "abgerechnet" })));
    setCreating(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Token & Abrechnung Übersicht</h3>
        </div>
        <button
          onClick={handleAlleRechnungen}
          disabled={creating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creating ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          {done ? "✓ Erledigt!" : "Alle Rechnungen erstellen"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Offene Forderungen */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Offene Forderungen</div>
          <div className="space-y-2">
            {STATIC_FORDERUNGEN.map(f => (
              <div key={f.client} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{f.client}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800">{f.euro} €</span>
                  <span className="text-xs text-gray-400 ml-2">({f.token} Token)</span>
                </div>
              </div>
            ))}
          </div>
          {/* Gesamtsumme */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Gesamt sofort fakturierbar</span>
            <span className="text-lg font-bold text-green-600">{gesamtToken} Token = {gesamtEuro.toLocaleString("de-DE")} €</span>
          </div>
        </div>

        {/* Monatliche Kosten */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            <div className="text-xs font-semibold text-gray-400 uppercase">Monatliche Kosten</div>
          </div>
          <div className="space-y-2">
            {MONATLICHE_KOSTEN.map(k => (
              <div key={k.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{k.label}</span>
                <span className="text-sm font-semibold text-red-500">{k.betrag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}