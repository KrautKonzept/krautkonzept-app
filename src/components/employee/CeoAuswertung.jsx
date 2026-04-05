import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

function downloadCSV(data, filename, headers) {
  const rows = data.map(row => headers.map(h => `"${(row[h.key] ?? "").toString().replace(/"/g, '""')}"`).join(";"));
  const csv = [headers.map(h => h.label).join(";"), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CeoAuswertung() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [tokenEntries, setTokenEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = getMonthOptions();
  const currentMonth = monthOptions[0].value;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [tokenFilterMonth, setTokenFilterMonth] = useState(currentMonth);
  const [tokenFilterClient, setTokenFilterClient] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.TimeEntry.list("-date", 500),
      base44.entities.TokenEntry.list("-date", 500),
      base44.entities.Client.list("name", 100),
    ]).then(([times, tokens, clientList]) => {
      setTimeEntries(times);
      setTokenEntries(tokens);
      setClients(clientList);
      setLoading(false);
    });
  }, []);

  const calcMarge = (e) => {
    const tokens = Math.ceil((e.duration_minutes || 0) / 40);
    const erloese = tokens * 25;
    const kosten = e.interne_kosten_gesamt || 0;
    const marge = erloese - kosten;
    const margePercent = erloese > 0 ? (marge / erloese) * 100 : 0;
    return { erloese, kosten, marge, margePercent };
  };

  // Filtered time entries
  const filteredTime = timeEntries.filter(e => {
    const monthMatch = !selectedMonth || e.date?.startsWith(selectedMonth);
    const empMatch = filterEmployee === "all" || e.employee_email === filterEmployee;
    const clientMatch = filterClient === "all" || e.project === filterClient;
    return monthMatch && empMatch && clientMatch;
  });

  // Filtered token entries
  const filteredTokens = tokenEntries.filter(e => {
    const monthMatch = !tokenFilterMonth || e.date?.startsWith(tokenFilterMonth);
    const clientMatch = tokenFilterClient === "all" || e.client === tokenFilterClient;
    return monthMatch && clientMatch;
  });

  // Monthly KPIs (current selected month for time, current month for summary)
  const monthTimeEntries = timeEntries.filter(e => e.date?.startsWith(selectedMonth));
  const totalMinutes = monthTimeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const monthTokenEntries = tokenEntries.filter(e => e.date?.startsWith(selectedMonth));
  const totalTokens = monthTokenEntries.reduce((s, e) => s + (e.token_count || 0), 0);
  const totalRevenue = monthTokenEntries.reduce((s, e) => s + (e.amount_euro || 0), 0);
  const openForderungen = clients.reduce((s, c) => s + (c.open_amount || 0), 0);

  // Unique employees and clients for filters
  const employees = [...new Set(timeEntries.map(e => e.employee_email).filter(Boolean))];
  const clientNames = [...new Set(timeEntries.map(e => e.project).filter(Boolean))];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Monatliche KPIs */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Monatsübersicht</h2>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Erfasste Stunden", value: formatDuration(totalMinutes), color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Token verbucht", value: totalTokens, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Umsatz (Tokens × 25€)", value: `${totalRevenue.toLocaleString("de-DE")} €`, color: "text-green-600", bg: "bg-green-50" },
            { label: "Offene Forderungen", value: `${openForderungen.toLocaleString("de-DE")} €`, color: "text-orange-600", bg: "bg-orange-50" },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zeit-Register */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-900">Zeit-Register</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Mitarbeiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                {employees.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Kunde" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kunden</SelectItem>
                {clientNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={() => downloadCSV(
                filteredTime.map(e => ({
                  date: e.date, employee: e.employee_email, client: e.project || "",
                  description: e.description || "", duration: formatDuration(e.duration_minutes || 0),
                  difficulty: e.difficulty || "", tools: (e.tools_used || []).join(", "),
                  tokens: Math.ceil((e.duration_minutes || 0) / 40),
                  amount: `${Math.ceil((e.duration_minutes || 0) / 40) * 25} €`
                })),
                "zeit-register.csv",
                [
                  { key: "date", label: "Datum" }, { key: "employee", label: "Mitarbeiter" },
                  { key: "client", label: "Kunde" }, { key: "description", label: "Tätigkeit" },
                  { key: "duration", label: "Dauer" }, { key: "difficulty", label: "Schwierigkeit" },
                  { key: "tools", label: "Tools" }, { key: "tokens", label: "Tokens" }, { key: "amount", label: "Betrag" }
                ]
              )}
            >
              <Download className="w-3 h-3" /> CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Mitarbeiter", "Kunde", "Tätigkeit", "Dauer", "Tokens", "Erlös", "Int. Kosten", "Marge", "Marge %"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTime.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-gray-400">Keine Einträge</td></tr>
              )}
              {filteredTime.map(e => {
                const tokens = Math.ceil((e.duration_minutes || 0) / 40);
                const { erloese, kosten, marge, margePercent } = calcMarge(e);
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-700">{e.date}</td>
                    <td className="py-2 px-2 text-gray-600">{e.employee_email?.split("@")[0]}</td>
                    <td className="py-2 px-2 text-gray-700">{e.project || "—"}</td>
                    <td className="py-2 px-2 text-gray-600 max-w-[140px] truncate">{e.description || "—"}</td>
                    <td className="py-2 px-2 text-gray-700">{formatDuration(e.duration_minutes || 0)}</td>
                    <td className="py-2 px-2 font-semibold text-orange-600">{tokens}</td>
                    <td className="py-2 px-2 font-semibold text-green-600">{erloese.toLocaleString("de-DE")} €</td>
                    <td className="py-2 px-2 text-blue-600">{kosten > 0 ? `${kosten.toFixed(2)} €` : "—"}</td>
                    <td className={`py-2 px-2 font-semibold ${marge >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {kosten > 0 ? `${marge.toFixed(2)} €` : "—"}
                    </td>
                    <td className={`py-2 px-2 text-xs font-semibold ${margePercent >= 50 ? "text-green-600" : margePercent >= 20 ? "text-yellow-600" : "text-red-500"}`}>
                      {kosten > 0 ? `${margePercent.toFixed(0)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-2 px-2 text-gray-400 text-xs">{filteredTime.length} Einträge</td>
                <td className="py-2 px-2 font-bold text-gray-800">{formatDuration(filteredTime.reduce((s, e) => s + (e.duration_minutes || 0), 0))}</td>
                <td className="py-2 px-2 font-bold text-orange-600">{filteredTime.reduce((s, e) => s + Math.ceil((e.duration_minutes || 0) / 40), 0)}</td>
                <td className="py-2 px-2 font-bold text-green-600">{(filteredTime.reduce((s, e) => s + Math.ceil((e.duration_minutes || 0) / 40) * 25, 0)).toLocaleString("de-DE")} €</td>
                <td className="py-2 px-2 font-bold text-blue-600">{filteredTime.reduce((s, e) => s + (e.interne_kosten_gesamt || 0), 0).toFixed(2)} €</td>
                <td className="py-2 px-2 font-bold text-green-600">
                  {(filteredTime.reduce((s, e) => s + calcMarge(e).marge, 0)).toFixed(2)} €
                </td>
                <td className="py-2 px-2 font-bold text-gray-600">
                  {(() => {
                    const totalErloes = filteredTime.reduce((s, e) => s + calcMarge(e).erloese, 0);
                    const totalMarge = filteredTime.reduce((s, e) => s + calcMarge(e).marge, 0);
                    return totalErloes > 0 ? `${((totalMarge / totalErloes) * 100).toFixed(0)}%` : "—";
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Token-Register */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-900">Token-Register</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={tokenFilterMonth} onValueChange={setTokenFilterMonth}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Monate</SelectItem>
                {monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tokenFilterClient} onValueChange={setTokenFilterClient}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Kunde" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kunden</SelectItem>
                {[...new Set(tokenEntries.map(e => e.client).filter(Boolean))].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={() => downloadCSV(
                filteredTokens.map(e => ({
                  date: e.date, client: e.client || "", employee: e.created_by || "",
                  description: e.description || "", tokens: e.token_count || 0,
                  amount: `${e.amount_euro || 0} €`, source: e.source || "manuell", status: e.status
                })),
                "token-register.csv",
                [
                  { key: "date", label: "Datum" }, { key: "client", label: "Kunde" },
                  { key: "employee", label: "Mitarbeiter" }, { key: "description", label: "Beschreibung" },
                  { key: "tokens", label: "Tokens" }, { key: "amount", label: "Betrag" },
                  { key: "source", label: "Quelle" }, { key: "status", label: "Status" }
                ]
              )}
            >
              <Download className="w-3 h-3" /> CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Datum", "Kunde", "Mitarbeiter", "Beschreibung", "Tokens", "Betrag", "Quelle", "Status"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTokens.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Keine Einträge</td></tr>
              )}
              {filteredTokens.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-700">{e.date}</td>
                  <td className="py-2 px-2 font-medium text-gray-800">{e.client}</td>
                  <td className="py-2 px-2 text-gray-500">{e.created_by?.split("@")[0] || "—"}</td>
                  <td className="py-2 px-2 text-gray-600 max-w-[200px] truncate">{e.description || "—"}</td>
                  <td className="py-2 px-2 font-semibold text-orange-600">{e.token_count || 0}</td>
                  <td className="py-2 px-2 font-semibold text-green-600">{(e.amount_euro || 0).toLocaleString("de-DE")} €</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${e.source === "Zeiterfassung (automatisch)" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                      {e.source === "Zeiterfassung (automatisch)" ? "automatisch" : "manuell"}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${e.status === "offen" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td colSpan={4} className="py-2 px-2 font-semibold text-gray-700">Gesamt ({filteredTokens.length} Einträge)</td>
                <td className="py-2 px-2 font-bold text-orange-600">{filteredTokens.reduce((s, e) => s + (e.token_count || 0), 0)}</td>
                <td className="py-2 px-2 font-bold text-green-600">{filteredTokens.reduce((s, e) => s + (e.amount_euro || 0), 0).toLocaleString("de-DE")} €</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}