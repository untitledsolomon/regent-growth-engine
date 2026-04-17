import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, Users, Megaphone, GitBranch, BarChart3, 
  MessageSquare, Settings, ChevronLeft, ChevronRight, Plug, X,
  ArrowRightLeft, UserCircle, Plus, Zap, Rocket, BrainCircuit
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/" },
  { title: "Leads", icon: Users, to: "/leads" },
  { title: "Campaigns", icon: Megaphone, to: "/campaigns" },
  { title: "Pipeline", icon: GitBranch, to: "/pipeline" },
  { title: "Analytics", icon: BarChart3, to: "/analytics" },
  { title: "AI Insights", icon: BrainCircuit, to: "/ai-insights" },
];

const secondaryNavItems = [
  { title: "Integrations", icon: Plug, to: "/integrations" },
  { title: "Settings", icon: Settings, to: "/settings" },
  { title: "Profile", icon: UserCircle, to: "/profile" },
];

export function AppSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 py-6`}>
      {/* Logo */}
      <div className="px-6 mb-10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg signature-gradient flex items-center justify-center text-white">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight font-headline">LeadEngine</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-headline">Enterprise Hub</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg signature-gradient flex items-center justify-center text-white mx-auto">
            <Rocket className="w-4 h-4" />
          </div>
        )}
        <div className="flex items-center gap-1">
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all duration-200 hover:translate-x-1 rounded-lg"
            activeClassName="text-indigo-600 dark:text-indigo-400 !font-bold border-r-2 border-indigo-600 !bg-transparent !translate-x-1"
            onClick={onCloseMobile}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <nav className="px-4 space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all duration-200 hover:translate-x-1 rounded-lg"
              activeClassName="text-indigo-600 dark:text-indigo-400 font-bold"
              onClick={onCloseMobile}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </NavLink>
          ))}
          {!collapsed && (
            <button className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all duration-200 hover:translate-x-1 w-full rounded-lg">
              <ArrowRightLeft className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Switch Agency</span>
            </button>
          )}
        </nav>

        {!collapsed && (
          <div className="px-6">
            <Button
              className="w-full py-6 px-4 rounded-xl signature-gradient text-white font-bold text-sm shadow-lg shadow-indigo-200/50 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={() => navigate('/leads')}
            >
              <Rocket className="w-4 h-4" />
              Convert Lead
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
