import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Loader2, X, Tag, Archive, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import LabelManager, { loadLabels, LabelBadge } from "./LabelManager";
import ArchiveView from "./ArchiveView";

const BOARDS = [
  { id: "sprint", label: "Sprint" },
  { id: "backlog", label: "Backlog" },
  { id: "projekte", label: "Projekte" },
  { id: "wiederkehrend", label: "Wiederkehrend" },
  { id: "intern", label: "Intern" },
];

const COLUMNS = [
  { id: "offen", label: "Offen" },
  { id: "in_arbeit", label: "In Arbeit" },
  { id: "review", label: "Review" },
  { id: "erledigt", label: "Erledigt" },
];

const TEAM = ["Emanuel", "Andrea", "Luc", "Vincent", "Dietrich"];
const PRIORITIES = ["niedrig", "mittel", "hoch", "kritisch"];

export default function KanbanBoardNew({ user, isCeo }) {
  const [activeBoard, setActiveBoard] = useState("sprint");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterLabel, setFilterLabel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [customLabels, setCustomLabels] = useState(loadLabels());
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await base44.entities.Task.list("-created_date", 200);
      setTasks(data || []);
    } catch {
      setTasks([]);
    }
    setLoading(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (task.status === "archiviert") return false; // always hide archived from board
    if (!isCeo && activeBoard !== "all" && task.board !== activeBoard) return false;
    if (isCeo && activeBoard !== "all" && task.board !== activeBoard) return false;
    if (filterPerson !== "all" && task.assigned_to !== filterPerson) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterLabel !== "all" && !task.tags?.includes(filterLabel)) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleArchiveTask = async (task) => {
    const updated = {
      ...task,
      status: "archiviert",
      activity: [...(task.activity || []), { action: "Archiviert", timestamp: new Date().toISOString(), user: user?.full_name }],
    };
    await base44.entities.Task.update(task.id, updated);
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  };

  const handleRestoreTask = async (task) => {
    const updated = { ...task, status: "erledigt" };
    await base44.entities.Task.update(task.id, { status: "erledigt" });
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  };

  const handleArchiveAllDone = async () => {
    const doneTasks = filteredTasks.filter((t) => t.status === "erledigt" && (activeBoard === "all" || t.board === activeBoard));
    await Promise.all(doneTasks.map((t) => handleArchiveTask(t)));
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const task = tasks.find((t) => t.id === result.draggableId);
    if (!task) return;

    const newStatus = result.destination.droppableId;
    const updated = { ...task, status: newStatus };
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));

    try {
      await base44.entities.Task.update(task.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (status) => {
    if (!newTitle.trim()) return;

    try {
      const newTask = await base44.entities.Task.create({
        title: newTitle,
        status,
        board: activeBoard,
        priority: "mittel",
        assigned_to: user?.email,
        activity: [
          {
            action: `Task erstellt`,
            timestamp: new Date().toISOString(),
            user: user?.full_name,
          },
        ],
      });

      setTasks([newTask, ...tasks]);
      setNewTitle("");
      setAddingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const activity = updatedTask.activity || [];
      const updated = {
        ...updatedTask,
        activity: [
          ...activity,
          {
            action: "Task bearbeitet",
            timestamp: new Date().toISOString(),
            user: user?.full_name,
          },
        ],
      };

      await base44.entities.Task.update(updatedTask.id, updated);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updated : t)));
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await base44.entities.Task.delete(selectedTask.id);
      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  const allLabels = [...customLabels.map(l => l.name), ...Array.from(new Set(tasks.flatMap((t) => t.tags || []).filter(tag => !customLabels.find(l => l.name === tag))))];
  const boardTasks = filteredTasks.filter((t) => (activeBoard === "all" ? true : t.board === activeBoard));
  const archivedCount = tasks.filter((t) => t.status === "archiviert" && (activeBoard === "all" || t.board === activeBoard)).length;

  return (
    <div className="space-y-6">
      {/* Board Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {BOARDS.map((board) => (
          <button
            key={board.id}
            onClick={() => setActiveBoard(board.id)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
              activeBoard === board.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {board.label}
          </button>
        ))}
        {isCeo && (
          <button
            onClick={() => setActiveBoard("all")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
              activeBoard === "all"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Alle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <Input
          placeholder="Nach Titel suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-48"
        />

        {isCeo && (
          <select
            value={filterPerson}
            onChange={(e) => setFilterPerson(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Alle Personen</option>
            {TEAM.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Alle Prioritäten</option>
          <option value="niedrig">Niedrig</option>
          <option value="mittel">Mittel</option>
          <option value="hoch">Hoch</option>
          <option value="kritisch">Kritisch</option>
        </select>

        {allLabels.length > 0 && (
          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Alle Labels</option>
            {allLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowLabelManager(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all whitespace-nowrap"
        >
          <Tag className="w-3.5 h-3.5" /> Labels verwalten
        </button>

        <button
          onClick={() => setShowArchive(!showArchive)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap ${showArchive ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-800"}`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archiv {archivedCount > 0 && `(${archivedCount})`}
          {showArchive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showArchive && (
        <ArchiveView
          tasks={tasks.filter((t) => activeBoard === "all" || t.board === activeBoard)}
          onRestore={handleRestoreTask}
        />
      )}

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = boardTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">{col.label}</h3>
                  <div className="flex items-center gap-2">
                    {col.id === "erledigt" && colTasks.length > 0 && (
                      <button
                        onClick={handleArchiveAllDone}
                        title="Alle erledigten Tasks archivieren"
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Alle archivieren</span>
                      </button>
                    )}
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-600 font-medium">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 flex-1 min-h-[40px] rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-orange-100" : ""
                      }`}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                            >
                              <TaskCard
                                task={task}
                                onArchive={col.id === "erledigt" ? (e) => { e.stopPropagation(); handleArchiveTask(task); } : null}
                              />
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTask(col.id);
                        if (e.key === "Escape") setAddingTo(null);
                      }}
                      placeholder="Aufgabentitel..."
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddTask(col.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs flex-1"
                      >
                        Hinzufügen
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingTo(null)} className="p-0 w-8 h-8">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingTo(col.id);
                      setNewTitle("");
                    }}
                    className="mt-3 w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 py-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Hinzufügen
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          customLabels={customLabels}
        />
      )}

      {/* Label Manager */}
      {showLabelManager && (
        <LabelManager
          onClose={() => {
            setCustomLabels(loadLabels());
            setShowLabelManager(false);
          }}
        />
      )}
    </div>
  );
}