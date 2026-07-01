import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Search, Users, Download, MapPin, LogOut } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sourcing", label: "Sourcing", icon: Search },
  { to: "/prospects", label: "Prospects", icon: Users },
  { to: "/exports", label: "Exports", icon: Download },
  { to: "/regions", label: "Regio's", icon: MapPin },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col">
        <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="text-sm font-mono tracking-wider text-[hsl(var(--sidebar-primary))]">PROSPECT OS</div>
          <div className="text-xs text-[hsl(var(--sidebar-foreground))]/60 mt-0.5">Scan Prospect Platform</div>
        </div>
        <nav className="flex-1 py-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
