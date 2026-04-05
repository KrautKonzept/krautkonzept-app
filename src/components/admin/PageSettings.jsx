import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Loader2, Globe, Eye, EyeOff } from "lucide-react";

const DEFAULT_PAGES = [
  { key: "home",        label: "Home",       title: "Startseite",   path: "/",           description: "Die Hauptseite der Website" },
  { key: "about",       label: "Über uns",   title: "Über uns",     path: "/About",      description: "Team und Unternehmensbeschreibung" },
  { key: "services",    label: "Leistungen", title: "Leistungen",   path: "/Services",   description: "Unsere Angebote und Dienstleistungen" },
  { key: "contact",     label: "Kontakt",    title: "Kontakt",      path: "/Contact",    description: "Kontaktformular und Informationen" },
  { key: "impressum",   label: "Impressum",  title: "Impressum",    path: "/Impressum",  description: "Rechtliche Pflichtangaben" },
  { key: "agb",         label: "AGB",        title: "AGB",          path: "/AGB",        description: "Allgemeine Geschäftsbedingungen" },
  { key: "datenschutz", label: "Datenschutz",title: "Datenschutz",  path: "/Datenschutz",description: "Datenschutzerklärung" },
];

export default function PageSettings() {
  const [pages, setPages] = useState(DEFAULT_PAGES);
  const [titles, setTitles] = useState({});
  const [disabled, setDisabled] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "page_settings" }).then(data => {
      if (data.length > 0) {
        const s = data[0];
        setTitles(s.page_titles || {});
        setDisabled(s.disabled_pages || {});
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const data = { key: "page_settings", page_titles: titles, disabled_pages: disabled };
    const existing = await base44.entities.SiteSettings.filter({ key: "page_settings" });
    if (existing.length > 0) {
      await base44.entities.SiteSettings.update(existing[0].id, data);
    } else {
      await base44.entities.SiteSettings.create(data);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Seitensteuerung</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Speichern
        </Button>
      </div>

      <div className="grid gap-3">
        {pages.map((page) => {
          const isDisabled = disabled[page.key];
          const customTitle = titles[page.key] ?? page.title;
          return (
            <Card key={page.key} className={`p-4 border transition-all ${isDisabled ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                {/* Status toggle */}
                <button
                  onClick={() => setDisabled(d => ({ ...d, [page.key]: !d[page.key] }))}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isDisabled ? "bg-gray-100 text-gray-400 hover:bg-gray-200" : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                  title={isDisabled ? "Aktivieren" : "Deaktivieren"}
                >
                  {isDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0">{page.label}</span>
                    <Input
                      value={customTitle}
                      onChange={e => setTitles(t => ({ ...t, [page.key]: e.target.value }))}
                      className="h-8 text-sm flex-1 max-w-xs"
                      placeholder="Seitentitel..."
                    />
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Globe className="w-3.5 h-3.5" />
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{page.path}</code>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-[92px]">{page.description}</p>
                </div>

                {/* Status badge */}
                <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                  isDisabled ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
                }`}>
                  {isDisabled ? "Inaktiv" : "Aktiv"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}