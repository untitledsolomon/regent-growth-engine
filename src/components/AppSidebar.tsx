import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, Users, Megaphone, GitBranch, BarChart3, 
  MessageSquare, Settings, ChevronLeft, ChevronRight, Plug, X 
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "Leads", icon: Users, to: "/leads" },
  { title: "Campaigns", icon: Megaphone, to: "/campaigns" },
  { title: "Pipeline", icon: GitBranch, to: "/pipeline" },
  { title: "Messages", icon: MessageSquare, to: "/messages" },
  { title: "Analytics", icon: BarChart3, to: "/analytics" },
  { title: "Integrations", icon: Plug, to: "/integrations" },
];

export function AppSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300`}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm" style={{ fontFamily: 'Space Grotesk' }}>R</span>
            </div>
            <span className="text-sidebar-accent-foreground font-semibold text-lg" style={{ fontFamily: 'Space Grotesk' }}>Regent</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            onClick={onCloseMobile}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <ThemeToggle collapsed={collapsed} />
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          onClick={onCloseMobile}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
