import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, CheckSquare, Coins, Loader2 } from "lucide-react";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

export default function MyStats({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const userName = user.full_name?.split(" ")[0] || "";
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString().split("T")[0];
      const monthStart = startOfMonth(now).toISOString().split("T")[0];

      const [timeEntries, tasks, tokens] = await Promise.all([
        base44.entities.TimeEntry.filter({ employee_email: user.email }, "-date", 200),
        base44.entities.Task.filter({ assigned_to: userName, status: "erledigt" }, "-updated_date", 200),
        base44.entities.TokenEntry.list("-date", 200),
      ]);

      const weekTime = timeEntries.filter(t => t.date >= weekStart).reduce((s, t) => s + (t.duration_minutes || 0), 0);
      const monthTime = timeEntries.filter(t => t.date >= monthStart).reduce((s, t) => s + (t.duration_minutes || 0), 0);
      const weekTasks = tasks.filter(t => (t.updated_date || t.created_date || "") >= weekStart + "T00:00:00").length;
      const monthTasks = tasks.filter(t => (t.updated_date || t.created_date || "") >= monthStart + "T00:00:00").length;
      const weekTokens = tokens.filter(t => t.date >= weekStart).reduce((s, t) => s + (t.token_count || 0), 0);
      const monthTokens = tokens.filter(t => t.date >= monthStart).reduce((s, t) => s + (t.token_count || 0), 0);

      setStats({ weekTime, monthTime, weekTasks, monthTasks, weekTokens, monthTokens });
    };
    load();
  }, [user]);

  if (!stats) return (
    <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
      <Loader2 className="w-4 h-4 animate-spin" /> Lade Statistiken…
    </div>
  );

  const fmtH = (min) => `${Math.floor(min / 60)}h ${min % 60}m`;

  const items = [
    { icon: Clock, label: "Stunden", week: fmtH(stats.weekTime), month: fmtH(stats.monthTime), color: "text-blue-500" },
    { icon: CheckSquare, label: "Tasks erledigt", week: stats.weekTasks, month: stats.monthTasks, color: "text-green-500" },
    { icon: Coins, label: "Tokens verbucht", week: stats.weekTokens, month: stats.monthTokens, color: "text-orange-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Meine Statistiken</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ icon: Icon, label, week, month, color }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <Icon className={`w-4 h-4 ${color} mb-1.5`} />
            <div className="text-xs text-gray-500 mb-2">{label}</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Woche</span>
                <span className="text-xs font-bold text-gray-800">{week}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Monat</span>
                <span className="text-xs font-bold text-gray-800">{month}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}