import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "./NotificationCenter";
import { CommandPalette } from "./CommandPalette";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Menu, Plus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <AppSidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
          <button className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <CommandPalette />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:inline-flex gap-2 rounded-xl text-xs"
              onClick={() => navigate('/campaigns')}
            >
              <Megaphone className="w-3.5 h-3.5" /> New Campaign
            </Button>
            <Button 
              size="sm" 
              className="hidden sm:inline-flex gap-2 rounded-xl gradient-primary text-white text-xs"
              onClick={() => navigate('/leads')}
            >
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </Button>
          </div>

          {!isSupabaseConfigured && (
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-warning/15 text-xs font-medium text-warning">
              Demo Mode
            </div>
          )}

          <NotificationCenter />

          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">{workspace.name.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium hidden sm:block">{workspace.name}</span>
          </div>
        </header>

        <main className="flex-1">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
