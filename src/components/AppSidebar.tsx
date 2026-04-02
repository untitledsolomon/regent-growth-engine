import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, Users, Megaphone, GitBranch, BarChart3, 
  MessageSquare, Settings, ChevronLeft, ChevronRight 
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "Leads", icon: Users, to: "/leads" },
  { title: "Campaigns", icon: Megaphone, to: "/campaigns" },
  { title: "Pipeline", icon: GitBranch, to: "/pipeline" },
  { title: "Messages", icon: MessageSquare, to: "/messages" },
  { title: "Analytics", icon: BarChart3, to: "/analytics" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">R</span>
            </div>
            <span className="text-sidebar-accent-foreground font-display font-semibold text-lg">Regent</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
