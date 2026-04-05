import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Shield, Save, CheckSquare, Square, Loader2, LogOut, Users, Settings, Mail, LayoutGrid, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserManagement from "@/components/admin/UserManagement";
import SettingsPanel from "@/components/admin/SettingsPanel";
import EmployeeInvitation from "@/components/admin/EmployeeInvitation";
import KostensaetzePanel from "@/components/admin/KostensaetzePanel";
import PageSettings from "@/components/admin/PageSettings";
import KanbanBoardNew from "@/components/kanban/KanbanBoardNew";
import TaskApiExport from "@/components/admin/TaskApiExport";

const ALL_PAGES = [
  { name: "Home", label: "Startseite" },
  { name: "About", label: "Über uns" },
  { name: "Services", label: "Leistungen" },
  { name: "Contact", label: "Kontakt" },
];

const TABS = [
  { id: "invite", label: "Mitarbeiter einladen", icon: Mail },
  { id: "users", label: "Benutzerverwaltung", icon: Users },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
  { id: "pages", label: "Seitensteuerung", icon: CheckSquare },
  { id: "settings", label: "Firmendaten", icon: Settings },
  { id: "kostensaetze", label: "Kostensätze", icon: Settings },
  { id: "api", label: "API & Export", icon: Database },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [enabledPages, setEnabledPages] = useState(ALL_PAGES.map((p) => p.name));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("invite");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const settings = await base44.entities.SiteSettings.filter({ key: "pages" });
      if (settings.length > 0) {
        setEnabledPages(settings[0].enabled_pages || ALL_PAGES.map((p) => p.name));
      }
      setLoading(false);
    };
    init();
  }, []);

  const togglePage = (pageName) => {
    setEnabledPages((prev) =>
      prev.includes(pageName) ? prev.filter((p) => p !== pageName) : [...prev, pageName]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const existing = await base44.entities.SiteSettings.filter({ key: "pages" });
    if (existing.length > 0) {
      await base44.entities.SiteSettings.update(existing[0].id, { enabled_pages: enabledPages });
    } else {
      await base44.entities.SiteSettings.create({ key: "pages", enabled_pages: enabledPages });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
    </div>
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center max-w-sm">
          <Shield className="w-10 h-10 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kein Zugriff</h2>
          <p className="text-gray-500 text-sm">Diese Seite ist nur für Administratoren zugänglich.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Admin</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Verwaltung</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
              <Button variant="outline" size="sm" onClick={() => base44.auth.logout()} className="gap-2">
                <LogOut className="w-4 h-4" />
                Abmelden
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "invite" && <EmployeeInvitation />}

          {activeTab === "users" && <UserManagement currentUser={user} />}

          {activeTab === "kanban" && <KanbanBoardNew user={user} isCeo={true} />}

          {activeTab === "settings" && <SettingsPanel />}

          {activeTab === "kostensaetze" && <KostensaetzePanel />}

          {activeTab === "pages" && <PageSettings />}

          {activeTab === "api" && <TaskApiExport />}
        </motion.div>
      </div>
    </div>
  );
}