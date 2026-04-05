import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Clock, LayoutGrid, CalendarDays, LogOut, Shield, Coins, Bot, BarChart2, Home, FileText, Users, StickyNote, ChevronDown } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import KanbanBoardNew from "@/components/kanban/KanbanBoardNew";
import TimeTracker from "@/components/employee/TimeTracker";
import BookingsList from "@/components/employee/BookingsList";
import TokenAbrechnung from "@/components/employee/TokenAbrechnung";
import KiAssistent from "@/components/employee/KiAssistent";
import WelcomeModal from "@/components/employee/WelcomeModal";
import Notes from "@/components/employee/Notes";
import CalendarView from "@/components/employee/CalendarView";
import QuickActions from "@/components/employee/QuickActions";
import CustomerRegistry from "@/components/employee/CustomerRegistry";
import BackofficeTab from "@/components/employee/BackofficeTab";
import CeoFullDashboard from "@/components/employee/CeoFullDashboard.jsx";
import KiTools from "@/components/employee/KiTools";
import NotificationBell from "@/components/employee/NotificationBell";
import MyStats from "@/components/employee/MyStats";
import CalendarIntegration from "@/components/employee/CalendarIntegration";

const isCeo = (u) => u?.email === "info@krautkonzept.de" || u?.role === "admin";

const TAB_GROUPS = [
  {
    label: "Arbeit",
    tabs: [
      { id: "start",     label: "Start",       icon: Home },
      { id: "kanban",    label: "Aufgaben",     icon: LayoutGrid },
      { id: "customers", label: "Kunden",       icon: Users },
      { id: "time",      label: "Zeiterfassung",icon: Clock },
      { id: "tokens",    label: "Abrechnung",   icon: Coins },
      { id: "bookings",  label: "Buchungen",    icon: CalendarDays },
    ],
  },
  {
    label: "Tools",
    tabs: [
      { id: "notes",    label: "Notizen",   icon: StickyNote },
      { id: "ki-tools", label: "KI-Tools",  icon: Bot },
      { id: "ki",       label: "Assistent", icon: Bot },
      { id: "kalender", label: "Kalender",  icon: CalendarDays },
    ],
  },
];

function GroupDropdown({ group, activeTab, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = group.tabs.some(t => t.id === activeTab);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeInGroup = group.tabs.find(t => t.id === activeTab);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        {activeInGroup ? (
          <>
            <activeInGroup.icon className="w-3.5 h-3.5" />
            <span>{activeInGroup.label}</span>
          </>
        ) : (
          <span>{group.label}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 min-w-[160px] py-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            {group.label}
          </div>
          {group.tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onSelect(tab.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-orange-50 ${
                activeTab === tab.id ? "text-orange-600 font-medium bg-orange-50" : "text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("start");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then((me) => {
        if (me.role !== "employee" && me.role !== "admin") {
          window.location.href = createPageUrl("Home");
          return;
        }
        setUser(me);
        setLoading(false);
        const today = new Date().toDateString();
        const lastSeen = localStorage.getItem(`welcome_seen_${me.email}`);
        if (lastSeen !== today) {
          setShowWelcome(true);
          localStorage.setItem(`welcome_seen_${me.email}`, today);
        }
      })
      .catch(() => base44.auth.redirectToLogin(window.location.pathname));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
    </div>
  );

  const handleTabClick = (tabId) => {
    if (tabId === "admin") {
      window.location.href = createPageUrl("Admin");
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showWelcome && <WelcomeModal user={user} onClose={() => setShowWelcome(false)} />}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-3 gap-2">
            <div className="flex-shrink-0">
              <h1 className="text-base md:text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{user?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}</p>
            </div>

            {/* Grouped nav */}
            <nav className="flex-1 flex items-center justify-center gap-1">
              {TAB_GROUPS.map(group => (
                <GroupDropdown
                  key={group.label}
                  group={group}
                  activeTab={activeTab}
                  onSelect={handleTabClick}
                />
              ))}

              {/* CEO / Admin — separate, rechts */}
              {isCeo(user) && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <button
                    onClick={() => handleTabClick("ceo")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      activeTab === "ceo" ? "bg-orange-50 text-orange-600 border-orange-200" : "text-orange-500 border-orange-100 hover:bg-orange-50"
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>CEO</span>
                  </button>
                  <button
                    onClick={() => handleTabClick("admin")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border text-orange-500 border-orange-100 hover:bg-orange-50"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </>
              )}
              {!isCeo(user) && user?.role === "admin" && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <button
                    onClick={() => handleTabClick("admin")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border text-orange-500 border-orange-100 hover:bg-orange-50"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-1 flex-shrink-0">
              <NotificationBell user={user} />
              <Button variant="outline" size="icon" onClick={() => base44.auth.logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {activeTab === "start" && (
          <>
            <MyStats user={user} />
            <QuickActions onTabChange={setActiveTab} />
            <KanbanBoardNew user={user} isCeo={isCeo(user)} sprintPreview />
          </>
        )}
        {activeTab === "kanban"    && <KanbanBoardNew user={user} isCeo={isCeo(user)} />}
        {activeTab === "customers" && <CustomerRegistry user={user} isCeo={isCeo(user)} />}
        {activeTab === "time"      && <TimeTracker user={user} />}
        {activeTab === "tokens"    && <TokenAbrechnung user={user} />}
        {activeTab === "notes"     && <Notes user={user} />}
        {activeTab === "bookings"  && <CalendarView />}
        {activeTab === "ki-tools"  && <KiTools user={user} isCeo={isCeo(user)} />}
        {activeTab === "ki"        && <KiAssistent user={user} />}
        {activeTab === "ceo"       && isCeo(user) && <CeoFullDashboard user={user} />}
        {activeTab === "kalender"  && <CalendarIntegration user={user} />}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}