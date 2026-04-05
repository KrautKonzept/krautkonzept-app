import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Coins, TrendingUp, Clock, Calendar, Euro } from "lucide-react";
import FoerderungSection from "./FoerderungSection";
import NotarChecklist from "./NotarChecklist";
import TeamVertraege from "./TeamVertraege";
import TokenUebersicht from "./TokenUebersicht";
import PlattformStatus from "./PlattformStatus";

const TEAM = [
  { name: "Emanuel", email: "info@krautkonzept.de", role: "CEO" },
  { name: "Andrea", email: "andrea@krautkonzept.de", role: "Marketing & KI" },
  { name: "Dietrich", email: "dietrich@krautkonzept.de", role: "Tech & E-Commerce" },
  { name: "Vincent", email: "vincent@krautkonzept.de", role: "Entwicklung" },
  { name: "Luc", email: "luc@krautkonzept.de", role: "Backoffice & Finanzen" },
];

export default function CeoDashboard() {
  const [tokenEntries, setTokenEntries] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TokenEntry.list("-date", 100),
      base44.entities.TimeEntry.list("-date", 100),
      base44.entities.Task.list("-created_date", 100),
    ]).then(([tokens, times, taskList]) => {
      setTokenEntries(tokens);
      setTimeEntries(times);
      setTasks(taskList);
      setLoading(false);
    });
  }, []);

  // Token stats
  const totalRevenue = tokenEntries.reduce((sum, e) => sum + (e.amount_euro || 0), 0);
  const openRevenue = tokenEntries.filter(e => e.status === "offen").reduce((sum, e) => sum + (e.amount_euro || 0), 0);
  const totalTokens = tokenEntries.reduce((sum, e) => sum + (e.token_count || 0), 0);

  // Task stats
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  // Time this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekMinutes = timeEntries
    .filter(e => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  // Per-member token earnings
  const memberStats = TEAM.map(member => {
    const entries = tokenEntries.filter(e => e.created_by === member.email);
    const revenue = entries.reduce((sum, e) => sum + (e.amount_euro || 0), 0);
    const tokens = entries.reduce((sum, e) => sum + (e.token_count || 0), 0);
    const open = entries.filter(e => e.status === "offen").reduce((sum, e) => sum + (e.amount_euro || 0), 0);
    return { ...member, revenue, tokens, open, count: entries.length };
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Sektion 1: Förderung & Finanzierung */}
      <FoerderungSection />
      <NotarChecklist />

      {/* Sektion 2: Team & Verträge */}
      <TeamVertraege />

      {/* Sektion 3: Token & Abrechnung Übersicht */}
      <TokenUebersicht />

      {/* Sektion 4: Plattform-Status */}
      <PlattformStatus />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gesamtumsatz", value: `${totalRevenue.toLocaleString("de-DE")} €`, icon: Euro, color: "text-green-600", bg: "bg-green-50" },
          { label: "Offen (unbezahlt)", value: `${openRevenue.toLocaleString("de-DE")} €`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Token gesamt", value: totalTokens, icon: Coins, color: "text-purple-600", bg: "bg-purple-50" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Umsatz */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" /> Team-Umsatz
          </h3>
          <div className="space-y-3">
            {memberStats.map(m => (
              <div key={m.email} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.role} · {m.count} Einträge</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{m.revenue.toLocaleString("de-DE")} €</div>
                  {m.open > 0 && <div className="text-xs text-orange-500">{m.open.toLocaleString("de-DE")} € offen</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aufgaben Übersicht */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" /> Aufgaben-Status
          </h3>
          <div className="space-y-4">
            {[
              { label: "Offen (Todo)", count: tasksByStatus.todo, color: "bg-gray-200", text: "text-gray-600" },
              { label: "In Bearbeitung", count: tasksByStatus.in_progress, color: "bg-orange-400", text: "text-orange-600" },
              { label: "Erledigt", count: tasksByStatus.done, color: "bg-green-400", text: "text-green-600" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{s.label}</span>
                  <span className={`font-semibold ${s.text}`}>{s.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: tasks.length > 0 ? `${(s.count / tasks.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 text-xs text-gray-400">{tasks.length} Aufgaben gesamt</div>
          </div>

          {/* Letzte Token-Einträge */}
          <h3 className="font-semibold text-gray-900 mt-6 mb-3">Letzte Abrechnungen</h3>
          <div className="space-y-2">
            {tokenEntries.slice(0, 5).map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700">{entry.client}</span>
                  <span className="text-gray-400 ml-2">· {entry.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{entry.token_count} Token</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${entry.status === "offen" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
            {tokenEntries.length === 0 && <div className="text-xs text-gray-400">Keine Einträge</div>}
          </div>
        </div>
      </div>
    </div>
  );
}