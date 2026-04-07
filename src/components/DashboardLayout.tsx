import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "./NotificationCenter";
import { CommandPalette } from "./CommandPalette";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Menu, X } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { workspace } = useWorkspace();

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <AppSidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8 h-14 border-b border-border bg-background/80 backdrop-blur-xl">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <CommandPalette />
          </div>

          {!isSupabaseConfigured && (
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-regent-gold/15 text-xs font-medium" style={{ color: 'hsl(42, 90%, 45%)' }}>
              Demo Mode
            </div>
          )}

          <NotificationCenter />

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">{workspace.name.charAt(0)}</span>
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
