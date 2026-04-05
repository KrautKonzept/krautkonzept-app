import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClientCosts({ user, isCeo }) {
  const [clients, setClients] = useState([]);
  const [tokenEntries, setTokenEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Client.list(),
      base44.entities.TokenEntry.list(),
    ]).then(([clientData, tokenData]) => {
      setClients(clientData);
      setTokenEntries(tokenData);
      setLoading(false);
    });
  }, []);

  // Filter clients based on user role
  const visibleClients = isCeo 
    ? clients 
    : clients.filter(c => c.assigned_to === user?.email);

  // Calculate tokens per client
  const getClientTokens = (clientName) => {
    return tokenEntries
      .filter(entry => entry.client === clientName)
      .reduce((sum, entry) => sum + (entry.token_count || 0), 0);
  };

  const getClientRevenue = (clientName) => {
    return tokenEntries
      .filter(entry => entry.client === clientName)
      .reduce((sum, entry) => sum + (entry.amount_euro || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
          <Users className="w-4 h-4 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {isCeo ? "Alle Kunden" : "Meine Kunden"}
        </h2>
      </div>

      {visibleClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Kunden zugewiesen</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {visibleClients.map((client) => {
            const tokens = getClientTokens(client.name);
            const revenue = getClientRevenue(client.name);
            
            return (
              <Card key={client.id} className="p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{client.contact_email}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${
                    client.status === 'aktiv' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {client.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{tokens}</div>
                    <p className="text-xs text-gray-500">Tokens verbucht</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{revenue.toFixed(2)}€</div>
                    <p className="text-xs text-gray-500">Umsatz</p>
                  </div>
                </div>

                {isCeo && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Zugewiesen: <span className="font-medium text-gray-700">{client.assigned_to?.split('@')[0]}</span></p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}