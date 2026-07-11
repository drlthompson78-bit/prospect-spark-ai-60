import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Search, Users, Download, MapPin, LogOut, Menu, X, ShieldCheck, Zap } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sourcing", label: "Sourcing", icon: Search },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/exports", label: "Exports", icon: Download },
  { to: "/regions", label: "Regio's", icon: MapPin },
  { to: "/assistant-test", label: "Assistant Test", icon: ShieldCheck },
  { to: "/assistant-action", label: "Assistant Action", icon: Zap },
];


export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-12 flex items-center justify-between px-3 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-b border-[hsl(var(--sidebar-border))]">
        <button onClick={() => setOpen(v => !v)} aria-label="Menu" className="p-2">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="text-xs font-mono tracking-wider text-[hsl(var(--sidebar-primary))]">PROSPECT OS</div>
        <div className="w-9" />
      </header>

      {/* Backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-screen md:h-auto w-60 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="text-sm font-mono tracking-wider text-[hsl(var(--sidebar-primary))]">PROSPECT OS</div>
          <div className="text-xs text-[hsl(var(--sidebar-foreground))]/60 mt-0.5">Scan Prospect Platform</div>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))] border-l-2 border-[hsl(var(--sidebar-primary))]"
                    : "hover:bg-[hsl(var(--sidebar-accent))]/60"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] text-xs">
          <div className="truncate mb-2 opacity-70">{user?.email}</div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
            onClick={async () => { await signOut(); navigate("/login"); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Uitloggen
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto pt-12 md:pt-0 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
