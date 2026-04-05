import React, { useState, useEffect } from "react";
import {
  Home, CheckSquare, Clock, Users, Receipt, MessageSquare, Video,
  FolderOpen, Link, Package, Shield, Settings, Bell, Search,
  TrendingUp, TrendingDown, UserPlus, Plus, ChevronRight,
  Leaf, ArrowUpRight, Circle
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
};

const formatDate = () =>
  new Date().toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV = [
  { icon: Home, label: "Launchpad", active: true },
  { icon: CheckSquare, label: "Aufgaben", badge: 5 },
  { icon: Clock, label: "Zeiterfassung" },
  { section: "KUNDEN" },
  { icon: Users, label: "CRM" },
  { icon: Receipt, label: "Abrechnung" },
  { section: "KOMMUNIKATION" },
  { icon: MessageSquare, label: "Nachrichten", badge: 3 },
  { icon: Video, label: "Meetings" },
  { icon: FolderOpen, label: "Dokumente" },
  { section: "PLATTFORM" },
  { icon: Link, label: "KrautLink" },
  { icon: Package, label: "KrautHub" },
  { section: "ADMIN" },
  { icon: Shield, label: "Team" },
  { icon: Settings, label: "Einstellungen" },
];

function Sidebar() {
  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-30"
      style={{ width: 224, background: "#0a3d2e" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 flex-shrink-0">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#1d9e75" }}>
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight font-sans">
          <span className="text-white">Kraut</span>
          <span style={{ color: "#1d9e75" }}>Desk</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {NAV.map((item, i) => {
          if (item.section) return (
            <div key={i} className="px-2 pt-4 pb-1">
              <span className="text-[10px] font-semibold tracking-widest" style={{ color: "#4a7c6a" }}>
                {item.section}
              </span>
            </div>
          );
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group"
              style={
                item.active
                  ? { background: "#1d9e75", color: "#fff" }
                  : { color: "#a8c5ba" }
              }
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = "rgba(29,158,117,0.12)"; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  style={{ background: item.active ? "rgba(255,255,255,0.25)" : "#1d9e75", color: "#fff" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Pill */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "#1d9e75", color: "#fff" }}>
            EB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Emanuel Burghard</p>
            <p className="text-[10px] truncate" style={{ color: "#4a7c6a" }}>Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Timer Widget ─────────────────────────────────────────────────────────────
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <button
      onClick={() => setRunning(r => !r)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      style={{ background: "#e8f5f0", color: "#0a3d2e" }}
      title={running ? "Stop" : "Start"}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${running ? "animate-pulse" : ""}`}
        style={{ background: running ? "#1d9e75" : "#9ca3af" }} />
      <span className="font-mono text-sm tracking-wider">{fmt(seconds)}</span>
    </button>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 bg-white border-b border-gray-100"
      style={{ left: 224, height: 52 }}>
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Suchen oder cmd+K drücken…</span>
        </div>
      </div>

      {/* Timer center */}
      <div className="flex-1 flex justify-center">
        <Timer />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "#1d9e75", color: "#fff" }}>
          EB
        </div>
      </div>
    </header>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, color, progress }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</span>
        <ArrowUpRight className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#1d9e75" }} />
        </div>
      )}
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE = [
  { time: "09:00", title: "Team-Standup", badge: "Meeting", badgeColor: "#dbeafe", badgeText: "#1d4ed8" },
  { time: "10:30", title: "KrautLink API Review", badge: "Aufgabe", badgeColor: "#ffedd5", badgeText: "#c2410c" },
  { time: "14:00", title: "CSC Inntal-Raubling Call", badge: "Kunde", badgeColor: "#dcfce7", badgeText: "#15803d" },
  { time: "16:00", title: "KrautDesk Founding Build", badge: "Projekt", badgeColor: "#f3e8ff", badgeText: "#7e22ce" },
];

function TimelineCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Mein heutiger Tag</h3>
        <span className="text-xs text-gray-400">{formatDate()}</span>
      </div>
      <div className="px-5 py-3 space-y-0">
        {TIMELINE.map((item, i) => (
          <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 w-10 flex-shrink-0 pt-0.5 font-mono">{item.time}</span>
            <div className="w-px h-full min-h-[20px] self-stretch mx-1 flex-shrink-0" style={{ background: "#e5e7eb" }} />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-800 flex-1">{item.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: item.badgeColor, color: item.badgeText }}>
                {item.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sprint Board ─────────────────────────────────────────────────────────────
const SPRINT = {
  Todo: ["KrautHub Onboarding", "Preisseite Update", "Token-Export CSV"],
  "In Progress": ["KrautDesk Launchpad", "CRM Filterlogik"],
  Done: ["Jitsi Integration", "Invoice #042"],
};

function SprintBoard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Sprint Board</h3>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {Object.entries(SPRINT).map(([col, tasks]) => (
          <div key={col} className="space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{col}</p>
            {tasks.map((t, i) => (
              <div key={i} className="text-xs px-2.5 py-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-100 leading-snug">
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
const ACTIVITIES = [
  { dot: "#22c55e", text: "Buds Bunny — Rechnung #042 erstellt", time: "vor 2h" },
  { dot: "#3b82f6", text: "Andrea hat Task 'Social Media Plan' abgeschlossen", time: "vor 3h" },
  { dot: "#f97316", text: "CSC Inntal — Token-Stand: 3 verbleibend", time: "vor 5h" },
  { dot: "#ef4444", text: "Rechnung #038 — Mahnstufe 1 ausgelöst", time: "vor 1 Tag" },
  { dot: "#22c55e", text: "Exotic Kingdom — 10 Tokens gekauft", time: "vor 2 Tagen" },
];

function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Letzte Aktivitäten</h3>
      </div>
      <div className="px-5 py-2 divide-y divide-gray-50">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3 py-3">
            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: a.dot }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 leading-snug">{a.text}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions() {
  const genJitsi = () => {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    window.open(`https://meet.jit.si/KrautDesk-${rand}`, "_blank");
  };

  const ACTIONS = [
    { icon: Receipt, label: "Neue Rechnung", onClick: () => {} },
    { icon: UserPlus, label: "Kunde anlegen", onClick: () => {} },
    { icon: Video, label: "Meeting starten", onClick: () => {} },
    { icon: Link, label: "Jitsi-Link", onClick: genJitsi },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Schnellzugriff</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {ACTIONS.map(({ icon: Icon, label, onClick }, i) => (
          <button key={i} onClick={onClick}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 text-xs font-medium text-gray-700 hover:border-green-200 hover:bg-green-50 transition-all text-left"
            style={{ "--tw-border-opacity": 1 }}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1d9e75" }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Mandanten Tabelle ────────────────────────────────────────────────────────
const MANDANTEN = [
  { org: "KrautKonzept", plan: "Pro", mrr: "1.750 €", activity: "Gerade eben" },
  { org: "Buds Bunny", plan: "Starter", mrr: "450 €", activity: "vor 2h" },
  { org: "CSC Inntal-Raubling", plan: "Free", mrr: "0 €", activity: "vor 5h" },
];

function MandantenTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Mandanten-Übersicht</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e8f5f0", color: "#0a3d2e" }}>
          Super Admin
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            {["Organisation", "Plan", "Status", "MRR", "Letzte Aktivität"].map(h => (
              <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MANDANTEN.map((m, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-gray-900">{m.org}</td>
              <td className="px-5 py-3.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{m.plan}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-green-600 font-medium">Aktiv</span>
                </span>
              </td>
              <td className="px-5 py-3.5 font-semibold text-gray-900">{m.mrr}</td>
              <td className="px-5 py-3.5 text-gray-400">{m.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KrautDesk() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono&display=swap');
        * { font-family: 'DM Sans', sans-serif; }`}
      </style>

      <Sidebar />
      <Topbar />

      {/* Content Area */}
      <main className="overflow-y-auto" style={{ marginLeft: 224, marginTop: 52, minHeight: "calc(100vh - 52px)", padding: "32px 32px 48px" }}>

        {/* Greeting */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, Emanuel.</h1>
            <p className="text-sm text-gray-400 mt-1">{formatDate()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#1d9e75" }}>
              <Plus className="w-4 h-4" />
              Neue Aufgabe
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all hover:bg-green-50"
              style={{ borderColor: "#1d9e75", color: "#0a3d2e" }}>
              <Clock className="w-4 h-4" />
              Zeit erfassen
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Offene Rechnungen" value="1.750 €" sub="3 Kunden ausstehend" color="#f97316" />
          <KpiCard title="Aktive Projekte" value="7" sub="2 fällig diese Woche" color="#3b82f6" />
          <KpiCard title="Team-Auslastung" value="68%" sub="3 von 5 Mitgliedern aktiv" color="#1d9e75" progress={68} />
          <KpiCard title="Token-Umsatz (MTD)" value="825 €" sub="33 Tokens verbraucht" color="#1d9e75" />
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Left 60% */}
          <div className="lg:col-span-3 space-y-4">
            <TimelineCard />
            <SprintBoard />
          </div>
          {/* Right 40% */}
          <div className="lg:col-span-2 space-y-4">
            <ActivityFeed />
            <QuickActions />
          </div>
        </div>

        {/* Mandanten */}
        <MandantenTable />
      </main>
    </div>
  );
}