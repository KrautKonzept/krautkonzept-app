import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Mail, Pencil, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { value: "admin", label: "CEO/Admin" },
  { value: "employee", label: "Mitarbeiter (allgemein)" },
  { value: "community_marketing", label: "Community & Marketing" },
  { value: "backoffice", label: "Backoffice" },
  { value: "tech", label: "Tech" },
  { value: "development", label: "Entwicklung" },
  { value: "freelancer", label: "Freelancer" },
];

const ROLE_LABELS = Object.fromEntries(ROLES.map(r => [r.value, r.label]));

function EditModal({ emp, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: emp.full_name?.split(" ")[0] || "",
    last_name:  emp.full_name?.split(" ").slice(1).join(" ") || "",
    email:      emp.email || "",
    role:       emp.role || "development",
    hourly_rate: emp.hourly_rate || "",
  });
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const full_name = `${form.first_name} ${form.last_name}`.trim();
    await base44.entities.User.update(emp.id, {
      role: form.role,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : undefined,
    });
    setSaving(false);
    setSaved(true);
    onSaved({ ...emp, role: form.role, hourly_rate: form.hourly_rate, full_name });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResend = async () => {
    setResending(true);
    await base44.users.inviteUser(form.email, form.role);
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Mitarbeiter bearbeiten</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Vorname</label>
            <Input
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              placeholder="Vorname"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nachname</label>
            <Input
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              placeholder="Nachname"
              className="text-sm"
            />
          </div>
        </div>

        {/* E-Mail (readonly) */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">E-Mail-Adresse</label>
          <Input value={form.email} readOnly className="text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>

        {/* Rolle */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Rolle / Funktion</label>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Kostensatz */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Kostensatz (€/Stunde)</label>
          <Input
            type="number"
            value={form.hourly_rate}
            onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
            placeholder="z.B. 45"
            className="text-sm"
            min="0"
            step="0.5"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            onClick={handleSave}
            disabled={saving}
            className={`w-full gap-2 text-white transition-all ${saved ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? "Gespeichert ✓" : saving ? "Speichern..." : "Speichern"}
          </Button>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending}
            className={`w-full gap-2 transition-all ${resent ? "text-green-600 border-green-300" : "text-gray-600"}`}
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {resent ? "Einladung gesendet ✓" : resending ? "Wird gesendet..." : "Einladung erneut senden"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeInvitation() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "development" });

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    const users = await base44.entities.User.list();
    setEmployees(users || []);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!formData.email || !formData.name) return;
    setInviting(true);
    await base44.users.inviteUser(formData.email, formData.role);
    setEmployees(prev => [...prev, {
      id: `pending-${Date.now()}`,
      full_name: formData.name,
      email: formData.email,
      role: formData.role,
    }]);
    setFormData({ name: "", email: "", role: "development" });
    setShowForm(false);
    setInviting(false);
  };

  const handleSaved = (updated) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingEmp(updated);
  };

  const statusBadge = (user) => {
    if (user.role === "admin" || user.role === "employee") return { color: "bg-green-100 text-green-700", text: "Aktiv" };
    if (user.id?.startsWith("pending-")) return { color: "bg-yellow-100 text-yellow-700", text: "Eingeladen" };
    return { color: "bg-blue-100 text-blue-700", text: "Eingeladen" };
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editingEmp && (
        <EditModal
          emp={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Invite Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Neuen Mitarbeiter einladen</h3>
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="text-sm"
          />
          <Input
            type="email"
            placeholder="E-Mail"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="text-sm"
          />
          <select
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div className="flex gap-2">
            <Button
              onClick={handleInvite}
              disabled={inviting}
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1 gap-1"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {inviting ? "Wird gesendet..." : "Einladung senden"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Mitarbeiter-Übersicht</h3>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              <Plus className="w-4 h-4" /> Einladen
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {employees.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">Keine Mitarbeiter</p>
          ) : (
            employees.map(emp => {
              const status = statusBadge(emp);
              return (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900">{emp.full_name || emp.email}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                    {emp.role && <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[emp.role] || emp.role}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={status.color}>{status.text}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingEmp(emp)}
                      className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}