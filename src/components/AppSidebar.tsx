import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, Users, Megaphone, GitBranch, BarChart3, 
  MessageSquare, Settings, ChevronLeft, ChevronRight, Plug, X,
  ArrowRightLeft, UserCircle, Plus, Zap
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "Leads", icon: Users, to: "/leads" },
  { title: "Campaigns", icon: Megaphone, to: "/campaigns" },
  { title: "Pipeline", icon: GitBranch, to: "/pipeline" },
  { title: "Messages", icon: MessageSquare, to: "/messages" },
  { title: "Automation", icon: Zap, to: "/automation" },
  { title: "Analytics", icon: BarChart3, to: "/analytics" },
  { title: "Integrations", icon: Plug, to: "/integrations" },
];

export function AppSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">R</span>
            </div>
            <span className="text-sidebar-accent-foreground font-semibold text-lg font-display">Regent</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm font-display">R</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CTA Button */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Button 
            className="w-full gradient-primary text-white rounded-xl gap-2 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            onClick={() => navigate('/leads')}
          >
            <Plus className="w-4 h-4" /> Add Lead
          </Button>
        </div>
      )}
      
      <nav className="flex-1 px-3 pt-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm border-r-2 border-transparent"
            activeClassName="bg-sidebar-accent text-primary font-semibold border-r-2 !border-primary"
            onClick={onCloseMobile}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-0.5">
        <ThemeToggle collapsed={collapsed} />
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
          activeClassName="bg-sidebar-accent text-primary font-semibold"
          onClick={onCloseMobile}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {!collapsed && (
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm w-full">
            <ArrowRightLeft className="w-5 h-5 shrink-0" />
            <span>Switch Agency</span>
          </button>
        )}
      </div>
    </aside>
  );
}
