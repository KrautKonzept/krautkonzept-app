import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Save, DollarSign, Clock, User } from "lucide-react";

const TEAM = ["Emanuel", "Andrea", "Luc", "Dietrich", "Vincent"];
import { motion } from "framer-motion";

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    token_price_euro: 25,
    minutes_per_token: 15,
    company_name: "KrautKonzept",
    company_email: "hallo@krautkonzept.de",
    company_address: "Vaterstetten/Fraunberg, Bayern",
    owner_name: "Emanuel Burghard",
    contact_person: "Emanuel",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openForderungen, setOpenForderungen] = useState(0);

  useEffect(() => {
    loadSettings();
    loadOpenForderungen();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base44.entities.CompanySettings.list();
      if (data.length > 0) {
        setSettings({ ...settings, ...data[0] });
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadOpenForderungen = async () => {
    try {
      const tokens = await base44.entities.TokenEntry.filter({ status: "offen" });
      const total = tokens.reduce((sum, t) => sum + (t.amount_euro || 0), 0);
      setOpenForderungen(total);
    } catch {}
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.CompanySettings.list();
      if (existing.length > 0) {
        await base44.entities.CompanySettings.update(existing[0].id, settings);
      } else {
        await base44.entities.CompanySettings.create(settings);
      }
      setTimeout(() => setSaving(false), 1000);
    } catch {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Open Invoices Alert */}
      <Card className="p-6 bg-red-50 border border-red-200">
        <h3 className="font-semibold text-red-900 mb-1">Offene Forderungen</h3>
        <p className="text-3xl font-bold text-red-600">{openForderungen.toFixed(2)}€</p>
        <p className="text-xs text-red-700 mt-2">Noch ausstehende Zahlungen von Kunden</p>
      </Card>

      {/* Settings */}
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Firmendaten & Token-Einstellungen</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              Token-Preis
            </h3>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Preis pro Token (€)</label>
              <Input
                type="number"
                value={settings.token_price_euro}
                onChange={(e) => handleChange("token_price_euro", Number(e.target.value))}
                className="font-mono text-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Minuten pro Token
            </h3>
            <div>
              <label className="block text-xs text-gray-600 mb-2">Minuten</label>
              <Input
                type="number"
                value={settings.minutes_per_token}
                onChange={(e) => handleChange("minutes_per_token", Number(e.target.value))}
                className="font-mono text-lg"
              />
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Firmendaten</h3>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Unternehmername</label>
            <Input
              value={settings.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Unternehmeremail</label>
            <Input
              type="email"
              value={settings.company_email}
              onChange={(e) => handleChange("company_email", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Adresse</label>
            <Input
              value={settings.company_address}
              onChange={(e) => handleChange("company_address", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2">Name des Eigentümers / Geschäftsführers</label>
            <Input
              value={settings.owner_name}
              onChange={(e) => handleChange("owner_name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" /> Zuständiger Ansprechpartner (öffentlich)
            </label>
            <select
              value={settings.contact_person || "Emanuel"}
              onChange={(e) => handleChange("contact_person", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {TEAM.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Wird im Buchungsformular als Standard-Ansprechpartner angezeigt.</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}