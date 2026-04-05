import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Loader2, Flag, X, Pencil, Check, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "bg-gray-50", border: "border-gray-200" },
  { id: "in_progress", label: "In Arbeit", color: "bg-blue-50", border: "border-blue-200" },
  { id: "review", label: "Review", color: "bg-amber-50", border: "border-amber-200" },
  { id: "done", label: "Erledigt", color: "bg-green-50", border: "border-green-200" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

const PRIORITY_DOTS = {
  low: "bg-gray-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export default function KanbanBoard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [boardName, setBoardName] = useState("Mein Board");
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    base44.entities.Task.list("-created_date", 100).then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    setTasks((prev) => prev.map((t) => t.id === draggableId ? { ...t, status: newStatus } : t));
    await base44.entities.Task.update(draggableId, { status: newStatus });
  };

  const addTask = async (status) => {
    if (!newTitle.trim()) return;
    const task = await base44.entities.Task.create({
      title: newTitle,
      status,
      priority: "medium",
      assigned_to: user.email,
    });
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
    setAddingTo(null);
  };

  const saveBoardName = () => {
    if (tempName.trim()) setBoardName(tempName.trim());
    setEditingBoardName(false);
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div>
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-orange-600" />
          </div>
          {editingBoardName ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveBoardName(); if (e.key === "Escape") setEditingBoardName(false); }}
                className="h-8 text-lg font-bold w-48"
              />
              <button onClick={saveBoardName} className="text-green-600 hover:text-green-700">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingBoardName(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{boardName}</h2>
              <button
                onClick={() => { setTempName(boardName); setEditingBoardName(true); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{totalTasks} Aufgaben</span>
          <span className="text-green-600 font-medium">{doneTasks} erledigt</span>
          {totalTasks > 0 && (
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className={`${col.color} border ${col.border} rounded-2xl p-4 min-h-[400px] flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-gray-700 text-sm">{col.label}</div>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium shadow-sm">{colTasks.length}</span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[20px] flex-1">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab hover:shadow-md transition-shadow ${snapshot.isDragging ? "shadow-lg rotate-1 opacity-90" : ""}`}
                            >
                              <p className="text-sm font-medium text-gray-800 mb-2 leading-snug">{task.title}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`} />
                                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                {task.due_date && (
                                  <span className="text-xs text-gray-400 ml-auto">{task.due_date}</span>
                                )}
                              </div>
                              {task.assigned_to && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                                    {task.assigned_to[0]?.toUpperCase()}
                                  </div>
                                  <span className="text-xs text-gray-400 truncate">{task.assigned_to.split("@")[0]}</span>
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

                {addingTo === col.id ? (
                  <div className="mt-3 space-y-2">
                    <Input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addTask(col.id); if (e.key === "Escape") setAddingTo(null); }}
                      placeholder="Aufgabentitel..."
                      className="text-sm bg-white"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addTask(col.id)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-7 flex-1">Hinzufügen</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="h-7 w-7 p-0"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTo(col.id); setNewTitle(""); }}
                    className="mt-3 w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 py-2 transition-colors rounded-lg hover:bg-white/60"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aufgabe hinzufügen
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}