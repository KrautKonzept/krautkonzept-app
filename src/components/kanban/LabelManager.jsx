import React, { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "kanban_custom_labels_v1";

export const LABEL_COLORS = [
  { id: "orange", label: "Orange", bg: "bg-orange-500", text: "text-white", hex: "#f97316" },
  { id: "green", label: "Grün", bg: "bg-green-500", text: "text-white", hex: "#22c55e" },
  { id: "blue", label: "Blau", bg: "bg-blue-500", text: "text-white", hex: "#3b82f6" },
  { id: "red", label: "Rot", bg: "bg-red-500", text: "text-white", hex: "#ef4444" },
  { id: "purple", label: "Lila", bg: "bg-purple-500", text: "text-white", hex: "#a855f7" },
  { id: "yellow", label: "Gelb", bg: "bg-yellow-400", text: "text-gray-900", hex: "#facc15" },
  { id: "gray", label: "Grau", bg: "bg-gray-400", text: "text-white", hex: "#9ca3af" },
  { id: "black", label: "Schwarz", bg: "bg-gray-900", text: "text-white", hex: "#111827" },
];

export function loadLabels() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function saveLabels(labels) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
}

// Small inline badge for a label
export function LabelBadge({ label }) {
  const color = LABEL_COLORS.find(c => c.id === label.color) || LABEL_COLORS[0];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
    >
      {label.name}
    </span>
  );
}

// Modal to create a new label
export function CreateLabelModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("orange");

  const handleCreate = () => {
    if (!name.trim()) return;
    const labels = loadLabels();
    const newLabel = { id: Date.now().toString(), name: name.trim(), color };
    saveLabels([...labels, newLabel]);
    onCreated(newLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Label erstellen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="z.B. Dringend, Bug, Feature..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Farbe</label>
          <div className="flex gap-2 flex-wrap">
            {LABEL_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                title={c.label}
                className={`w-8 h-8 rounded-full ${c.bg} transition-all ${color === c.id ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
              />
            ))}
          </div>
          {name && (
            <div className="mt-3">
              <span className="text-xs text-gray-500 mr-2">Vorschau:</span>
              <LabelBadge label={{ name, color }} />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button size="sm" onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 text-white">Erstellen</Button>
        </div>
      </div>
    </div>
  );
}

// Label management panel (list + delete)
export default function LabelManager({ onClose }) {
  const [labels, setLabels] = useState(loadLabels());
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = (label) => {
    setLabels(loadLabels());
  };

  const handleDelete = (id) => {
    const updated = labels.filter(l => l.id !== id);
    saveLabels(updated);
    setLabels(updated);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[55] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Labels verwalten</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          <Button size="sm" onClick={() => setShowCreate(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-1">
            <Plus className="w-4 h-4" /> Label erstellen
          </Button>

          {labels.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Noch keine Labels erstellt</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {labels.map(label => (
                <div key={label.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <LabelBadge label={label} />
                  <button onClick={() => handleDelete(label.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={onClose}>Schließen</Button>
        </div>
      </div>
      {showCreate && <CreateLabelModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </>
  );
}