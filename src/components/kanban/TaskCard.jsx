import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Archive } from "lucide-react";

const PRIORITY_CONFIG = {
  niedrig: { color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
  mittel: { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  hoch: { color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  kritisch: { color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

const PERSON_COLORS = {
  "Emanuel": "bg-purple-100 text-purple-700",
  "Andrea": "bg-pink-100 text-pink-700",
  "Luc": "bg-cyan-100 text-cyan-700",
  "Vincent": "bg-green-100 text-green-700",
  "Dietrich": "bg-amber-100 text-amber-700",
};

export default function TaskCard({ task, onClick, onArchive }) {
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.mittel;
  const personName = task.assigned_to?.split("@")[0] || "";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors flex-1">{task.title}</p>
        {onArchive && (
          <button
            onClick={onArchive}
            title="Archivieren"
            className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-gray-300 hover:text-gray-600 rounded transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${priorityConfig.dot}`} />
          <Badge className={`text-xs ${priorityConfig.color}`}>{task.priority}</Badge>
        </div>

        {task.due_date && (
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <Calendar className="w-3 h-3" /> {task.due_date}
          </span>
        )}
      </div>

      {task.subtasks?.length > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length} Subtasks</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {(task.assigned_to || task.collaborators?.length > 0 || task.tags?.length > 0) && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {task.assigned_to && (
            <div
              title={`Zuständig: ${personName}`}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${PERSON_COLORS[personName] || "bg-gray-100 text-gray-700"}`}
            >
              {personName[0]}
            </div>
          )}
          {(task.collaborators || []).map((c) => (
            <div
              key={c}
              title={`Beteiligt: ${c}`}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 border-2 border-white ${PERSON_COLORS[c] || "bg-gray-100 text-gray-700"}`}
            >
              {c[0]}
            </div>
          ))}
          {task.tags?.slice(0, 1).map((tag) => (
            <Badge key={tag} className="text-xs bg-gray-200 text-gray-700 py-0 px-2 ml-1">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}