import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLUMNS = [
  { id: "offen", label: "Offen", color: "bg-gray-50", border: "border-gray-200" },
  { id: "in_arbeit", label: "In Arbeit", color: "bg-blue-50", border: "border-blue-200" },
  { id: "review", label: "Review", color: "bg-amber-50", border: "border-amber-200" },
  { id: "erledigt", label: "Erledigt", color: "bg-green-50", border: "border-green-200" },
];

const PRIORITY_DOTS = {
  niedrig: "bg-gray-400",
  mittel: "bg-blue-500",
  hoch: "bg-orange-500",
  kritisch: "bg-red-500",
};

const PRIORITY_COLORS = {
  niedrig: "bg-gray-100 text-gray-500",
  mittel: "bg-blue-100 text-blue-600",
  hoch: "bg-orange-100 text-orange-600",
  kritisch: "bg-red-100 text-red-600",
};

const TEAM_MEMBERS = ["Emanuel", "Andrea", "Luc", "Dietrich", "Vincent"];

export default function CeoTeamBoards() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("Alle");

  useEffect(() => {
    base44.entities.Task.list("-created_date", 200).then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      )
    );
    await base44.entities.Task.update(draggableId, { status: newStatus });
  };

  const getDisplayTasks = () => {
    if (selectedMember === "Alle") {
      return tasks;
    }
    return tasks.filter((t) =>
      t.assigned_to?.toLowerCase().startsWith(selectedMember.toLowerCase())
    );
  };

  const getTasksByMember = () => {
    const byMember = {};
    TEAM_MEMBERS.forEach((member) => {
      byMember[member] = tasks.filter((t) =>
        t.assigned_to?.toLowerCase().startsWith(member.toLowerCase())
      );
    });
    return byMember;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  const displayTasks = getDisplayTasks();
  const tasksByMember = getTasksByMember();

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedMember("Alle")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedMember === "Alle"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle ({tasks.length})
        </button>
        {TEAM_MEMBERS.map((member) => (
          <button
            key={member}
            onClick={() => setSelectedMember(member)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMember === member
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {member} ({tasksByMember[member]?.length || 0})
          </button>
        ))}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = displayTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`${col.color} border ${col.border} rounded-2xl p-4 min-h-[400px] flex flex-col`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-gray-700 text-sm">
                    {col.label}
                  </div>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium shadow-sm">
                    {colTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[20px] flex-1"
                    >
                      {colTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab hover:shadow-md transition-shadow ${
                                snapshot.isDragging
                                  ? "shadow-lg rotate-1 opacity-90"
                                  : ""
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-800 mb-2 leading-snug">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      PRIORITY_DOTS[task.priority]
                                    }`}
                                  />
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                      PRIORITY_COLORS[task.priority]
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                {task.due_date && (
                                  <span className="text-xs text-gray-400 ml-auto">
                                    {task.due_date}
                                  </span>
                                )}
                              </div>
                              {task.assigned_to && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                                    {task.assigned_to[0]?.toUpperCase()}
                                  </div>
                                  <span className="text-xs text-gray-400 truncate">
                                    {task.assigned_to.split("@")[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}