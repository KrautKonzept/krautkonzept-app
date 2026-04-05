import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2, Users, Clock, TrendingUp, TrendingDown, Euro, Coins, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import CeoTeamBoards from "./CeoTeamBoards";
import CeoDashboard from "./CeoDashboard";
import CeoAuswertung from "./CeoAuswertung";
import CeoKostenBudget from "./CeoKostenBudget";
import PasswordManager from "./PasswordManager";

const TEAM = [
  { name: "Emanuel", email: "info@krautkonzept.de", role: "CEO" },
  { name: "Andrea", email: "andrea@krautkonzept.de", role: "Marketing & KI" },
  { name: "Dietrich", email: "dietrich@krautkonzept.de", role: "Tech & E-Commerce" },
  { name: "Vincent", email: "vincent@krautkonzept.de", role: "Entwicklung" },
  { name: "Luc", email: "luc@krautkonzept.de", role: "Backoffice & Finanzen" },
];

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

const CEO_TABS = [
  { id: "analyse", label: "Analyse", icon: BarChart2 },
  { id: "boards", label: "Team Boards", icon: LayoutGrid },
  { id: "details", label: "Details & Module", icon: TrendingUp },
  { id: "auswertung", label: "Auswertung", icon: Euro },
  { id: "kosten", label: "Kosten & Budget", icon: TrendingDown },
  { id: "passwords", label: "Zugangsdaten", icon: Users },
];

export default function CeoFullDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("analyse");
  const [tokenEntries, setTokenEntries] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState(null);
  const [aiUsages, setAiUsages] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.TokenEntry.list("-date", 200),
      base44.entities.TimeEntry.list("-date", 200),
      base44.entities.Task.list("-created_date", 200),
      base44.entities.Client.list("name", 100),
      base44.entities.AiUsage.list("-date", 200),
    ]).then(([tokens, times, taskList, clientList, ai]) => {
      setTokenEntries(tokens);
      setTimeEntries(times);
      setTasks(taskList);
      setClients(clientList);
      setAiUsages(ai);
      setLoading(false);
    });
  }, []);

  // === KPI Berechnungen ===
  const totalRevenue = tokenEntries.reduce((s, e) => s + (e.amount_euro || 0), 0);
  const openRevenue = tokenEntries.filter(e => e.status === "offen").reduce((s, e) => s + (e.amount_euro || 0), 0);
  const totalTokens = tokenEntries.reduce((s, e) => s + (e.token_count || 0), 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekMinutes = timeEntries.filter(e => new Date(e.date) >= weekStart).reduce((s, e) => s + (e.duration_minutes || 0), 0);

  // === Umsatz pro Monat (letzte 6 Monate) ===
  const monthlyRevenue = (() => {
    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("de-DE", { month: "short" });
      months[key] = { label, revenue: 0, tokens: 0 };
    }
    tokenEntries.forEach(e => {
      const key = e.date?.slice(0, 7);
      if (months[key]) {
        months[key].revenue += e.amount_euro || 0;
        months[key].tokens += e.token_count || 0;
      }
    });
    return Object.values(months);
  })();

  // === Team-Statistiken ===
  const memberStats = TEAM.map(member => {
    const myEntries = tokenEntries.filter(e => e.created_by === member.email);
    const revenue = myEntries.reduce((s, e) => s + (e.amount_euro || 0), 0);
    const tokens = myEntries.reduce((s, e) => s + (e.token_count || 0), 0);
    const open = myEntries.filter(e => e.status === "offen").reduce((s, e) => s + (e.amount_euro || 0), 0);
    const myTime = timeEntries.filter(e => e.employee_email === member.email).reduce((s, e) => s + (e.duration_minutes || 0), 0);
    return { ...member, revenue, tokens, open, count: myEntries.length, minutes: myTime };
  });

  // === Kategorie-Verteilung ===
  const categoryData = (() => {
    const cats = {};
    tokenEntries.forEach(e => {
      if (e.category) cats[e.category] = (cats[e.category] || 0) + (e.amount_euro || 0);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  })();

  // === Aufgaben-Stats ===
  const taskStats = {
    offen: tasks.filter(t => t.status === "offen").length,
    in_arbeit: tasks.filter(t => t.status === "in_arbeit").length,
    review: tasks.filter(t => t.status === "review").length,
    erledigt: tasks.filter(t => t.status === "erledigt").length,
  };

  // === Client-Details ===
  const clientStats = clients.map(c => {
    const cEntries = tokenEntries.filter(e => e.client === c.name);
    const revenue = cEntries.reduce((s, e) => s + (e.amount_euro || 0), 0);
    const tokens = cEntries.reduce((s, e) => s + (e.token_count || 0), 0);
    const open = cEntries.filter(e => e.status === "offen").reduce((s, e) => s + (e.amount_euro || 0), 0);
    return { ...c, revenue, tokens, open, entryCount: cEntries.length };
  }).sort((a, b) => b.revenue - a.revenue);

  // === Stunden pro Mitglied diese Woche ===
  const weeklyHours = TEAM.map(m => ({
    name: m.name,
    stunden: parseFloat((timeEntries.filter(e => e.employee_email === m.email && new Date(e.date) >= weekStart).reduce((s, e) => s + (e.duration_minutes || 0), 0) / 60).toFixed(1)),
  }));

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* CEO Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {CEO_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "analyse" && (
        <div className="space-y-6">
          {/* KPI Karten */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Gesamtumsatz", value: `${totalRevenue.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`, icon: Euro, color: "text-green-600", bg: "bg-green-50" },
              { label: "Offen (unbezahlt)", value: `${openRevenue.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Token gesamt", value: totalTokens.toLocaleString(), icon: Coins, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Stunden diese Woche", value: `${Math.round(weekMinutes / 60)}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-gray-400 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Zeile 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Umsatz pro Monat */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Umsatz letzte 6 Monate (€)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRevenue}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v.toFixed(2)} €`} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Token pro Monat */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Token-Verbrauch letzte 6 Monate</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Zeile 2 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Kategorie-Verteilung */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Umsatz nach Kategorie</h3>
              {categoryData.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-10">Keine Daten</div>
              ) : (
                <div className="flex gap-4 items-center">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                        {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} €`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {categoryData.map((cat, i) => (
                      <div key={cat.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 truncate">{cat.name}</span>
                        <span className="font-semibold text-gray-900 ml-auto">{cat.value} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wöchentliche Stunden pro Mitglied */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Stunden diese Woche (Team)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyHours} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <Bar dataKey="stunden" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KI & Tools Übersicht */}
          {(() => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const monthAi = aiUsages.filter(u => u.date?.startsWith(currentMonth));
            const totalAiCost = monthAi.reduce((s, u) => s + (u.cost_euro || 0), 0);
            const aiByTool = ["Claude", "ChatGPT", "Gemini", "Perplexity", "Sonstige"].map(tool => ({
              tool,
              cost: monthAi.filter(u => u.tool === tool).reduce((s, u) => s + (u.cost_euro || 0), 0),
            })).filter(t => t.cost > 0);
            const aiByClient = Object.entries(
              monthAi.filter(u => u.client).reduce((acc, u) => {
                acc[u.client] = (acc[u.client] || 0) + (u.cost_euro || 0);
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]);
            return (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">🤖 KI & Tools — Dieser Monat</h3>
                  <span className="text-xs text-gray-400 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">KI-Kosten können dem Kunden weiterberechnet werden</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-xl font-bold text-orange-600">{totalAiCost.toFixed(2)} €</div>
                    <div className="text-xs text-gray-500 mt-1">Gesamt KI-Kosten (Monat)</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-xl font-bold text-purple-600">{monthAi.reduce((s, u) => s + (u.requests || 0), 0)}</div>
                    <div className="text-xs text-gray-500 mt-1">Anfragen gesamt</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-xl font-bold text-blue-600">{aiByClient.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Kunden mit KI-Kosten</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {aiByTool.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Kosten nach Tool</h4>
                      <div className="space-y-2">
                        {aiByTool.map(t => (
                          <div key={t.tool} className="flex items-center gap-2">
                            <span className="w-20 text-sm text-gray-700">{t.tool}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${totalAiCost > 0 ? (t.cost / totalAiCost) * 100 : 0}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-16 text-right">{t.cost.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiByClient.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Kosten nach Kunde</h4>
                      <div className="space-y-2">
                        {aiByClient.map(([client, cost]) => (
                          <div key={client} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 truncate">{client}</span>
                            <span className="font-semibold text-orange-600 ml-2">{cost.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiByTool.length === 0 && aiByClient.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400 text-sm py-4">Noch keine KI-Kosten für diesen Monat erfasst</div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Aufgaben-Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Aufgaben-Übersicht</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Offen", count: taskStats.offen, color: "bg-gray-100 text-gray-700" },
                { label: "In Arbeit", count: taskStats.in_arbeit, color: "bg-orange-100 text-orange-700" },
                { label: "Review", count: taskStats.review, color: "bg-blue-100 text-blue-700" },
                { label: "Erledigt", count: taskStats.erledigt, color: "bg-green-100 text-green-700" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
                  <div className="text-3xl font-bold">{s.count}</div>
                  <div className="text-xs mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team-Tabelle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> Team-Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left pb-2">Mitglied</th>
                    <th className="text-left pb-2">Rolle</th>
                    <th className="text-right pb-2">Einträge</th>
                    <th className="text-right pb-2">Token</th>
                    <th className="text-right pb-2">Umsatz</th>
                    <th className="text-right pb-2">Offen</th>
                    <th className="text-right pb-2">Stunden ges.</th>
                  </tr>
                </thead>
                <tbody>
                  {memberStats.map(m => (
                    <tr key={m.email} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-800">{m.name}</td>
                      <td className="py-2 text-gray-500 text-xs">{m.role}</td>
                      <td className="py-2 text-right">{m.count}</td>
                      <td className="py-2 text-right font-mono text-purple-600">{m.tokens}</td>
                      <td className="py-2 text-right font-semibold text-green-600">{m.revenue.toLocaleString("de-DE")} €</td>
                      <td className="py-2 text-right text-orange-500">{m.open > 0 ? `${m.open.toLocaleString("de-DE")} €` : "—"}</td>
                      <td className="py-2 text-right text-blue-600">{Math.round(m.minutes / 60)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kunden-Tabelle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top-Kunden nach Umsatz</h3>
            <div className="space-y-2">
              {clientStats.filter(c => c.revenue > 0 || c.entryCount > 0).map(c => (
                <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedClient(expandedClient === c.id ? null : c.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "aktiv" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-purple-600 font-mono">{c.tokens} Token</span>
                      <span className="font-semibold text-green-600">{c.revenue.toLocaleString("de-DE")} €</span>
                      {c.open > 0 && <span className="text-orange-500">{c.open.toLocaleString("de-DE")} € offen</span>}
                      {expandedClient === c.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {expandedClient === c.id && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {c.contact_email && <div><span className="text-xs text-gray-400 block">E-Mail</span>{c.contact_email}</div>}
                      {c.phone && <div><span className="text-xs text-gray-400 block">Telefon</span>{c.phone}</div>}
                      {c.assigned_to && <div><span className="text-xs text-gray-400 block">Berater</span>{c.assigned_to}</div>}
                      <div><span className="text-xs text-gray-400 block">Einträge</span>{c.entryCount}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "boards" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Team Boards</h2>
            <p className="text-gray-500 text-sm">Kanban-Boards aller Mitarbeiter</p>
          </div>
          <CeoTeamBoards />
        </div>
      )}

      {activeTab === "details" && <CeoDashboard />}
      {activeTab === "auswertung" && <CeoAuswertung />}
      {activeTab === "kosten" && <CeoKostenBudget />}
      {activeTab === "passwords" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <PasswordManager />
        </div>
      )}
    </div>
  );
}