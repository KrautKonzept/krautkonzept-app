import React, { useState } from "react";
import { X, Save, Trash2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import MentionTextarea, { MentionText } from "./MentionTextarea";
import { LabelBadge, CreateLabelModal, loadLabels, saveLabels } from "./LabelManager";

const TEAM = ["Emanuel", "Andrea", "Luc", "Vincent", "Dietrich"];
const PRIORITIES = ["niedrig", "mittel", "hoch", "kritisch"];
const BOARDS = ["sprint", "backlog", "projekte", "wiederkehrend"];
const STATUSES = ["offen", "in_arbeit", "review", "erledigt"];
const COMMON_TAGS = ["CULTIVA", "KrautHub", "KI", "Backoffice", "Marketing", "Compliance"];
const BOARDS_WITH_INTERN = ["sprint", "backlog", "projekte", "wiederkehrend", "intern"];

export default function TaskModal({ task, onClose, onUpdate, onDelete, customLabels: initialLabels = [] }) {
  const [data, setData] = useState(task);
  const [activeTab, setActiveTab] = useState("details");
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [customLabels, setCustomLabels] = useState(initialLabels.length ? initialLabels : loadLabels());

  const handleSave = async () => {
    onUpdate(data);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const notes = data.notes || [];
    setData({
      ...data,
      notes: [
        ...notes,
        {
          id: Math.random().toString(),
          text: newNote,
          created_at: new Date().toISOString(),
        },
      ],
    });
    setNewNote("");
  };

  const handleRemoveNote = (noteId) => {
    setData({
      ...data,
      notes: (data.notes || []).filter((n) => n.id !== noteId),
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setData({
      ...data,
      tags: [...(data.tags || []), newTag],
    });
    setNewTag("");
  };

  const handleRemoveTag = (tag) => {
    setData({
      ...data,
      tags: (data.tags || []).filter((t) => t !== tag),
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtasks = data.subtasks || [];
    setData({
      ...data,
      subtasks: [...subtasks, { id: Math.random().toString(36).slice(2), text: newSubtask, done: false }],
    });
    setNewSubtask("");
  };

  const toggleSubtask = (id) => {
    setData({
      ...data,
      subtasks: (data.subtasks || []).map(s => s.id === id ? { ...s, done: !s.done } : s),
    });
  };

  const removeSubtask = (id) => {
    setData({ ...data, subtasks: (data.subtasks || []).filter(s => s.id !== id) });
  };

  const personInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Task bearbeiten</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200">
          {["details", "subtasks", "notizen", "aktivität"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "details" && "Details"}
              {tab === "subtasks" && `Subtasks${data.subtasks?.length ? ` (${data.subtasks.filter(s=>s.done).length}/${data.subtasks.length})` : ""}`}
              {tab === "notizen" && "Notizen"}
              {tab === "aktivität" && "Aktivität"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                <MentionTextarea
                  value={data.description || ""}
                  onChange={(val) => setData({ ...data, description: val })}
                  placeholder="Detaillierte Beschreibung... (@Name für Erwähnung)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={data.status}
                    onChange={(e) => setData({ ...data, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === "offen" && "Offen"}
                        {s === "in_arbeit" && "In Arbeit"}
                        {s === "review" && "Review"}
                        {s === "erledigt" && "Erledigt"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                  <select
                    value={data.board}
                    onChange={(e) => setData({ ...data, board: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {BOARDS_WITH_INTERN.map((b) => (
                      <option key={b} value={b}>
                        {b === "sprint" && "Sprint"}
                        {b === "backlog" && "Backlog"}
                        {b === "projekte" && "Projekte"}
                        {b === "wiederkehrend" && "Wiederkehrend"}
                        {b === "intern" && "Intern"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorität</label>
                  <select
                    value={data.priority}
                    onChange={(e) => setData({ ...data, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p === "niedrig" && "Niedrig"}
                        {p === "mittel" && "Mittel"}
                        {p === "hoch" && "Hoch"}
                        {p === "kritisch" && "Kritisch"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
                  <select
                    value={data.assigned_to || ""}
                    onChange={(e) => setData({ ...data, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Niemand</option>
                    {TEAM.map((person) => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beteiligte</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {TEAM.filter((p) => p !== data.assigned_to).map((person) => {
                    const selected = (data.collaborators || []).includes(person);
                    return (
                      <button
                        key={person}
                        type="button"
                        onClick={() => {
                          const current = data.collaborators || [];
                          setData({
                            ...data,
                            collaborators: selected
                              ? current.filter((c) => c !== person)
                              : [...current, person],
                          });
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-600 border-gray-300 hover:border-orange-300 hover:text-orange-600"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${selected ? "bg-white/30 text-white" : "bg-gray-200 text-gray-600"}`}>
                          {person[0]}
                        </span>
                        {person}
                      </button>
                    );
                  })}
                </div>
                {(data.collaborators || []).length > 0 && (
                  <p className="text-xs text-gray-400">Beteiligte: {data.collaborators.join(", ")}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum</label>
                <Input
                  type="date"
                  value={data.due_date || ""}
                  onChange={(e) => setData({ ...data, due_date: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Tags/Labels</label>
                  <button
                    type="button"
                    onClick={() => setShowCreateLabel(true)}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Label erstellen
                  </button>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(data.tags || []).map((tag) => {
                    const customLabel = customLabels.find(l => l.name === tag);
                    return customLabel ? (
                      <button key={tag} type="button" onClick={() => handleRemoveTag(tag)} className="group relative">
                        <LabelBadge label={customLabel} />
                        <span className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 bg-red-500 rounded-full items-center justify-center">
                          <X className="w-2 h-2 text-white" />
                        </span>
                      </button>
                    ) : (
                      <Badge key={tag} className="bg-gray-200 text-gray-800 cursor-pointer hover:bg-red-200" onClick={() => handleRemoveTag(tag)}>
                        {tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Tag/Label wählen...</option>
                    {customLabels.filter(l => !data.tags?.includes(l.name)).map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                    {COMMON_TAGS.filter(t => !data.tags?.includes(t) && !customLabels.find(l => l.name === t)).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <Button onClick={handleAddTag} size="sm" className="bg-gray-500 hover:bg-gray-600 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subtasks" && (
            <div className="space-y-3">
              {/* Progress */}
              {(data.subtasks || []).length > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Fortschritt</span>
                    <span>{(data.subtasks || []).filter(s => s.done).length} / {(data.subtasks || []).length}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${((data.subtasks || []).filter(s => s.done).length / (data.subtasks || []).length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add subtask */}
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  placeholder="+ Subtask hinzufügen..."
                  onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                  className="flex-1"
                />
                <Button onClick={handleAddSubtask} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {(data.subtasks || []).map(s => (
                  <div key={s.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => toggleSubtask(s.id)}
                      className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${s.done ? "line-through text-gray-400" : "text-gray-800"}`}>{s.text}</span>
                    <button onClick={() => removeSubtask(s.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notizen" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <MentionTextarea
                  value={newNote}
                  onChange={setNewNote}
                  placeholder="Neue Notiz schreiben... (@Name für Erwähnung)"
                  rows={3}
                />
                <Button
                  onClick={handleAddNote}
                  className="w-full bg-green-500 hover:bg-green-600 text-white gap-1"
                >
                  <Plus className="w-4 h-4" /> Notiz hinzufügen
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(data.notes || []).map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-900"><MentionText text={note.text} /></p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{format(new Date(note.created_at), "dd.MM.yyyy HH:mm")}</span>
                      <button onClick={() => handleRemoveNote(note.id)} className="text-red-500 hover:text-red-700 text-xs">
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "aktivität" && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(data.activity || [])
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0">
                    <div className="text-2xl">📝</div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{item.action}</p>
                      <p className="text-xs text-gray-400">{format(new Date(item.timestamp), "dd.MM.yyyy HH:mm")}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

      {showCreateLabel && (
        <CreateLabelModal
          onClose={() => setShowCreateLabel(false)}
          onCreated={(label) => {
            const updated = loadLabels();
            setCustomLabels(updated);
          }}
        />
      )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Wirklich löschen?")) {
                setDeleting(true);
                onDelete();
              }
            }}
            disabled={deleting}
            className="gap-1"
          >
            <Trash2 className="w-4 h-4" /> Löschen
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              <Save className="w-4 h-4" /> Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}