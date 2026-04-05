import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Search, X, Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY_FORM = { name: "", company: "", contact_email: "", phone: "", address: "", status: "aktiv", assigned_to: "", token_budget: "", open_amount: "" };

const BERATER = [
  { label: "Nico", email: "nico@krautkonzept.de" },
  { label: "Info", email: "info@krautkonzept.de" },
];

function ClientModal({ open, title, initialData, onSave, onClose }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  useEffect(() => { setForm(initialData || EMPTY_FORM); }, [initialData]);
  if (!open) return null;
  const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs text-gray-500">Name *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Kundenname" className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-gray-500">Firma</Label>
            <Input value={form.company || ""} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Firmenname" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">E-Mail</Label>
            <Input type="email" value={form.contact_email || ""} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="kontakt@firma.de" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Telefon</Label>
            <Input value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+49..." className="mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-gray-500">Adresse</Label>
            <Input value={form.address || ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Straße, PLZ Ort" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Status</Label>
            <Select value={form.status} onValueChange={f("status")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aktiv">Aktiv</SelectItem>
                <SelectItem value="inaktiv">Inaktiv</SelectItem>
                <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Berater</Label>
            <Select value={form.assigned_to || ""} onValueChange={f("assigned_to")}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Berater wählen" /></SelectTrigger>
              <SelectContent>
                {BERATER.map(b => <SelectItem key={b.email} value={b.email}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Token-Guthaben</Label>
            <Input type="number" value={form.token_budget || ""} onChange={e => setForm(p => ({ ...p, token_budget: parseFloat(e.target.value) || "" }))} placeholder="0" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Offener Betrag (€)</Label>
            <Input type="number" value={form.open_amount || ""} onChange={e => setForm(p => ({ ...p, open_amount: parseFloat(e.target.value) || "" }))} placeholder="0.00" className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={() => onSave(form)} className="bg-orange-500 hover:bg-orange-600 text-white flex-1" disabled={!form.name}>Speichern</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ client, onConfirm, onClose }) {
  if (!client) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Kunde löschen</h3>
            <p className="text-sm text-gray-500 mt-0.5">Diese Aktion kann nicht rückgängig gemacht werden.</p>
          </div>
        </div>
        <p className="text-gray-700 text-sm mb-6">Kunde <strong>{client.name}</strong> wirklich löschen?</p>
        <div className="flex gap-2">
          <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white flex-1">Löschen</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
        </div>
      </div>
    </div>
  );
}

const statusColor = (s) => s === "aktiv" ? "bg-green-100 text-green-700" : s === "abgeschlossen" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700";
const statusLabel = (s) => s === "aktiv" ? "Aktiv" : s === "abgeschlossen" ? "Abgeschlossen" : "Inaktiv";

export default function CustomerRegistry({ user, isCeo }) {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const data = await base44.entities.Client.list("name", 100);
    setClients(data || []);
    applyFilter(data || [], "", "all");
    setLoading(false);
  };

  const applyFilter = (list, search, status) => {
    let f = list;
    if (!isCeo) f = f.filter(c => c.assigned_to === user?.email);
    if (search) f = f.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.contact_email?.toLowerCase().includes(search.toLowerCase()));
    if (status !== "all") f = f.filter(c => c.status === status);
    setFilteredClients(f);
  };

  const handleAdd = async (form) => {
    const created = await base44.entities.Client.create(form);
    const updated = [created, ...clients];
    setClients(updated);
    applyFilter(updated, searchQuery, filterStatus);
    setShowAddModal(false);
  };

  const handleEdit = async (form) => {
    const updated = await base44.entities.Client.update(editClient.id, form);
    const list = clients.map(c => c.id === editClient.id ? updated : c);
    setClients(list);
    applyFilter(list, searchQuery, filterStatus);
    if (selectedClient?.id === editClient.id) setSelectedClient(updated);
    setEditClient(null);
  };

  const handleDelete = async () => {
    await base44.entities.Client.delete(deleteClient.id);
    const list = clients.filter(c => c.id !== deleteClient.id);
    setClients(list);
    applyFilter(list, searchQuery, filterStatus);
    if (selectedClient?.id === deleteClient.id) setSelectedClient(null);
    setDeleteClient(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <ClientModal open={showAddModal} title="Neuer Kunde" onSave={handleAdd} onClose={() => setShowAddModal(false)} />
      <ClientModal open={!!editClient} title="Kunde bearbeiten" initialData={editClient} onSave={handleEdit} onClose={() => setEditClient(null)} />
      <DeleteConfirm client={deleteClient} onConfirm={handleDelete} onClose={() => setDeleteClient(null)} />

      {selectedClient ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditClient(selectedClient)} className="gap-1">
                <Pencil className="w-3.5 h-3.5" /> Bearbeiten
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteClient(selectedClient)} className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Löschen
              </Button>
              <Button variant="ghost" onClick={() => setSelectedClient(null)} className="gap-1">
                <X className="w-4 h-4" /> Zurück
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {selectedClient.company && <div><p className="text-xs text-gray-500 font-medium mb-1">FIRMA</p><p className="text-gray-900">{selectedClient.company}</p></div>}
              <div><p className="text-xs text-gray-500 font-medium mb-1">E-MAIL</p><p className="text-gray-900">{selectedClient.contact_email || "—"}</p></div>
              <div><p className="text-xs text-gray-500 font-medium mb-1">TELEFON</p><p className="text-gray-900">{selectedClient.phone || "—"}</p></div>
              {selectedClient.address && <div><p className="text-xs text-gray-500 font-medium mb-1">ADRESSE</p><p className="text-gray-900">{selectedClient.address}</p></div>}
              <div><p className="text-xs text-gray-500 font-medium mb-1">STATUS</p><Badge className={statusColor(selectedClient.status)}>{statusLabel(selectedClient.status)}</Badge></div>
              <div><p className="text-xs text-gray-500 font-medium mb-1">ZUGEWIESENER BERATER</p><p className="text-gray-900">{selectedClient.assigned_to || "—"}</p></div>
            </div>
            <div className="space-y-4 border-l border-gray-200 pl-6">
              <div><p className="text-xs text-gray-500 font-medium mb-1">TOKEN-GUTHABEN</p><p className="text-2xl font-bold text-orange-600">{selectedClient.token_budget ?? 0}</p></div>
              <div><p className="text-xs text-gray-500 font-medium mb-1">OFFENER BETRAG</p><p className="text-2xl font-bold text-red-600">{selectedClient.open_amount ?? 0}€</p></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kundenliste</h2>
              <p className="text-gray-500 text-sm mt-1">{filteredClients.length} Kunden</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              <Plus className="w-4 h-4" /> Neuer Kunde
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Nach Name oder E-Mail suchen..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); applyFilter(clients, e.target.value, filterStatus); }} className="pl-10 text-sm" />
            </div>
            <div className="flex gap-2">
              {["all", "aktiv", "inaktiv"].map(s => (
                <Button key={s} onClick={() => { setFilterStatus(s); applyFilter(clients, searchQuery, s); }} variant={filterStatus === s ? "default" : "outline"} className={filterStatus === s ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}>
                  {s === "all" ? "Alle" : s === "aktiv" ? "Aktiv" : "Inaktiv"}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Keine Kunden gefunden</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <div key={client.id} className="p-4 hover:bg-gray-50 transition-all flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {client.contact_email && <span>{client.contact_email}</span>}
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(client.status)}>{statusLabel(client.status)}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedClient(client)} className="gap-1 text-orange-600 hover:bg-orange-50">
                        <Eye className="w-4 h-4" /> Details
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditClient(client)} className="gap-1 text-gray-600 hover:bg-gray-100">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteClient(client)} className="gap-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}