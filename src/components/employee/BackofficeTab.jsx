import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Pencil, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function BackofficeTab({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("invoices");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Invoice.list("-date", 100).catch(() => []),
      base44.entities.Client.list("name", 100).catch(() => []),
      base44.entities.TokenEntry.list("-date", 100).catch(() => []),
    ]).then(([inv, cli, tok]) => {
      setInvoices(inv);
      setClients(cli);
      setTokens(tok);
      setDocuments([
        { id: "1", title: "Gründungspaket", date: "2025-03-01", status: "abgeschlossen" },
        { id: "2", title: "Compliance Guide", date: "2025-03-05", status: "in_progress" },
      ]);
      setLoading(false);
    });
  }, []);

  const updateInvoice = async () => {
    if (editingId) {
      await base44.entities.Invoice.update(editingId, editData);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === editingId ? { ...inv, ...editData } : inv))
      );
      setEditingId(null);
    }
  };

  const createInvoice = async () => {
    if (!editData.customer_name || !editData.amount) return;
    const newInvoice = await base44.entities.Invoice.create({
      ...editData,
      date: editData.date || new Date().toISOString().split("T")[0],
    });
    setInvoices((prev) => [newInvoice, ...prev]);
    setEditData({});
    setAddingNew(false);
  };

  const statusColor = (status) => {
    const colors = {
      offen: "bg-red-100 text-red-700",
      bezahlt: "bg-green-100 text-green-700",
      ausstehend: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {[
          { id: "invoices", label: "Rechnungen" },
          { id: "documents", label: "Dokumente" },
          { id: "clients", label: "Kunden-Kontakte" },
          { id: "tokens", label: "Token-Buchungen" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeSubTab === tab.id
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rechnungen */}
      {activeSubTab === "invoices" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Rechnungen verwalten</h3>
            {!addingNew && (
              <Button
                size="sm"
                onClick={() => {
                  setAddingNew(true);
                  setEditData({ status: "offen" });
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-1"
              >
                <Plus className="w-4 h-4" /> Neue Rechnung
              </Button>
            )}
          </div>

          {addingNew && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 border border-gray-200">
              <Input
                placeholder="Kundenname"
                value={editData.customer_name || ""}
                onChange={(e) =>
                  setEditData({ ...editData, customer_name: e.target.value })
                }
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Betrag (€)"
                value={editData.amount || ""}
                onChange={(e) =>
                  setEditData({ ...editData, amount: parseFloat(e.target.value) })
                }
                className="text-sm"
              />
              <Input
                type="date"
                value={editData.date || ""}
                onChange={(e) =>
                  setEditData({ ...editData, date: e.target.value })
                }
                className="text-sm"
              />
              <select
                value={editData.status || "offen"}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="offen">Offen</option>
                <option value="ausstehend">Ausstehend</option>
                <option value="bezahlt">Bezahlt</option>
              </select>
              <Input
                placeholder="Notizen"
                value={editData.notes || ""}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={createInvoice}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="w-4 h-4" /> Speichern
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAddingNew(false);
                    setEditData({});
                  }}
                >
                  <X className="w-4 h-4" /> Abbrechen
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Keine Rechnungen vorhanden
              </p>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  {editingId === invoice.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editData.customer_name}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            customer_name: e.target.value,
                          })
                        }
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={updateInvoice}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Speichern
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {invoice.date} • {invoice.amount}€
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(invoice.id);
                            setEditData(invoice);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dokumente */}
      {activeSubTab === "documents" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Dokumente-Übersicht</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-900">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.date}</p>
                </div>
                <Badge
                  className={
                    doc.status === "abgeschlossen"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }
                >
                  {doc.status === "abgeschlossen"
                    ? "Fertig"
                    : "In Arbeit"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kunden-Kontakte */}
      {activeSubTab === "clients" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Kunden-Kontakte</h3>
          <div className="space-y-2">
            {clients.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Keine Kunden vorhanden
              </p>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    {client.contact_email && (
                      <p className="text-xs text-gray-500">{client.contact_email}</p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Token-Buchungen */}
      {activeSubTab === "tokens" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Token-Buchungen</h3>
          <div className="space-y-2">
            {tokens.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Keine Token-Buchungen vorhanden
              </p>
            ) : (
              tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{token.client}</p>
                    <p className="text-xs text-gray-500">
                      {token.category} • {token.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {token.token_count} Tokens
                    </p>
                    <p className="text-xs text-gray-500">{token.amount_euro}€</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}