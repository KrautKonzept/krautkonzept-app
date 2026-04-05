import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, Shield, Briefcase, User, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_CONFIG = {
  user: {
    label: "Mitglied",
    description: "Kann Termine buchen & Anfragen stellen",
    icon: User,
    badge: "bg-gray-100 text-gray-600",
    color: "border-gray-200",
  },
  employee: {
    label: "Mitarbeiter",
    description: "Zugang zu Aufgaben, Zeiterfassung & Buchungen",
    icon: Briefcase,
    badge: "bg-blue-100 text-blue-700",
    color: "border-blue-200",
  },
  admin: {
    label: "Admin",
    description: "Voller Zugang inkl. Benutzerverwaltung",
    icon: Shield,
    badge: "bg-orange-100 text-orange-700",
    color: "border-orange-200",
  },
};

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    base44.entities.User.list("-created_date", 100).then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const changeRole = async (userId, newRole) => {
    setUpdating(userId);
    await base44.entities.User.update(userId, { role: newRole });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    setUpdating(null);
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    user: users.filter((u) => u.role === "user" || !u.role).length,
    employee: users.filter((u) => u.role === "employee").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-orange-500" /></div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const Icon = config.icon;
          return (
            <div key={role} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats[role]}</div>
                  <div className="text-sm text-gray-500">{config.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Benutzer suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Alle Benutzer ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((u) => {
            const role = u.role || "user";
            const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
            const Icon = config.icon;
            const isMe = u.id === currentUser?.id;

            return (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(u.full_name || u.email || "?")[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {u.full_name || u.email}
                    </span>
                    {isMe && <Badge className="text-xs bg-orange-50 text-orange-500 border border-orange-200">Ich</Badge>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>

                {/* Role Badge */}
                <Badge className={`text-xs px-2.5 py-0.5 ${config.badge} flex items-center gap-1.5 hidden sm:flex`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </Badge>

                {/* Role Selector */}
                <div className="w-40 flex-shrink-0">
                  {isMe ? (
                    <div className="text-xs text-gray-400 text-right">Eigene Rolle nicht änderbar</div>
                  ) : (
                    <Select
                      value={role}
                      onValueChange={(val) => changeRole(u.id, val)}
                      disabled={updating === u.id}
                    >
                      <SelectTrigger className="h-8 text-xs border-gray-200 bg-white">
                        {updating === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_CONFIG).map(([r, c]) => (
                          <SelectItem key={r} value={r}>
                            <div className="flex items-center gap-2">
                              <c.icon className="w-3.5 h-3.5" />
                              <div>
                                <div className="font-medium text-sm">{c.label}</div>
                                <div className="text-xs text-gray-400">{c.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              Keine Benutzer gefunden
            </div>
          )}
        </div>
      </div>
    </div>
  );
}