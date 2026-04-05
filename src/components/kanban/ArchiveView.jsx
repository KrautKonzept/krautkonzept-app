import React from "react";
import { ArchiveRestore, User, LayoutGrid, Calendar } from "lucide-react";
import { format } from "date-fns";

const BOARD_LABELS = {
  sprint: "Sprint",
  backlog: "Backlog",
  projekte: "Projekte",
  wiederkehrend: "Wiederkehrend",
  intern: "Intern",
};

export default function ArchiveView({ tasks, onRestore }) {
  const archived = tasks.filter((t) => t.status === "archiviert");

  if (archived.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 mt-4">
        <p className="text-sm">Keine archivierten Tasks.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {archived.map((task) => {
        const archivedAt = task.activity
          ?.slice()
          .reverse()
          .find((a) => a.action === "Archiviert")?.timestamp;

        return (
          <div
            key={task.id}
            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {task.assigned_to && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    {task.assigned_to}
                  </span>
                )}
                {task.board && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <LayoutGrid className="w-3 h-3" />
                    {BOARD_LABELS[task.board] || task.board}
                  </span>
                )}
                {archivedAt && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(archivedAt), "dd.MM.yyyy")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onRestore(task)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all whitespace-nowrap"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
              Wiederherstellen
            </button>
          </div>
        );
      })}
    </div>
  );
}