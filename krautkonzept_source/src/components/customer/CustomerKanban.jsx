import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, LayoutGrid, Clock, CheckCircle2, CircleDot, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const COLUMNS = [
  { id: "offen",    label: "Offen",       icon: CircleDot,    color: "border-t-gray-400",   badgeClass: "bg-gray-100 text-gray-600" },
  { id: "in_arbeit",label: "In Arbeit",   icon: Clock,        color: "border-t-blue-400",   badgeClass: "bg-blue-100 text-blue-700" },
  { id: "review",   label: "Review",      icon: Eye,          color: "border-t-yellow-400", badgeClass: "bg-yellow-100 text-yellow-700" },
  { id: "erledigt", label: "Erledigt",    icon: CheckCircle2, color: "border-t-green-400",  badgeClass: "bg-green-100 text-green-700" },
];

const PRIORITY_COLORS = {
  niedrig:  "bg-gray-100 text-gray-500",
  mittel:   "bg-blue-100 text-blue-600",
  hoch:     "bg-orange-100 text-orange-600",
  kritisch: "bg-red-100 text-red-600",
};

const PRIORITY_LABELS = {
  niedrig: "Niedrig", mittel: "Mittel", hoch: "Hoch", kritisch: "Kritisch"
};

export default function CustomerKanban({ clientName }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientName) { setLoading(false); return; }
    base44.entities.Task.filter({ client: clientName })
      .then(data => {
        // exclude archived
        setTasks(data.filter(t => t.status !== "archiviert"));
        setLoading(false);
      });
  }, [clientName]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
    </div>
  );

  if (!clientName) return (
    <div className="text-center py-12 text-gray-400 text-sm">
      Kein Kundenprofil verknüpft. Bitte wende dich an KrautKonzept.
    </div>
  );

  const tasksByStatus = (statusId) => tasks.filter(t => t.status === statusId);
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "erledigt").length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-orange-500" />
              Projektfortschritt
            </span>
            <span className="text-sm font-bold text-orange-600">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>{total} Aufgaben gesamt</span>
            <span>{done} erledigt</span>
            <span>{tasks.filter(t => t.status === "in_arbeit").length} in Arbeit</span>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      {total === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
          <LayoutGrid className="w-8 h-8 mx-auto mb-3 text-gray-200" />
          Noch keine Aufgaben für Ihr Unternehmen.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasksByStatus(col.id);
            const Icon = col.icon;
            return (
              <div key={col.id} className={`bg-white rounded-2xl border-t-4 border border-gray-100 ${col.color}`}>
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">{col.label}</span>
                  </div>
                  <Badge className={`text-xs ${col.badgeClass}`}>{colTasks.length}</Badge>
                </div>
                <div className="p-3 space-y-2 min-h-[80px]">
                  {colTasks.map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {task.priority && (
                          <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                            {PRIORITY_LABELS[task.priority]}
                          </Badge>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{task.due_date}
                          </span>
                        )}
                      </div>
                      {task.subtasks?.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Teilaufgaben</span>
                            <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all"
                              style={{ width: `${task.subtasks.length > 0 ? (task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}