import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "./NotificationCenter";
import { CommandPalette } from "./CommandPalette";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Menu, Search, Bell, HelpCircle, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <AppSidebar onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {/* Top bar */}
        <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl h-16 shrink-0 border-b border-outline-variant/5">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full bg-white dark:bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none shadow-sm"
                placeholder="Search leads, campaigns, or insights..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline transition-colors" onClick={() => navigate('/campaigns')}>New Campaign</button>
              <button className="bg-primary px-4 py-2 rounded-lg text-white font-bold text-sm hover:opacity-80 transition-opacity flex items-center gap-2 shadow-lg shadow-indigo-500/20" onClick={() => navigate('/leads')}>
                <Plus className="w-4 h-4" /> Add Lead
              </button>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
              <button className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Activity className="w-5 h-5" />
              </button>
              <button className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>

              {!isSupabaseConfigured && (
                <div className="hidden xl:flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-600 border border-amber-200 uppercase tracking-tighter">
                  Demo Mode
                </div>
              )}

              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ml-2 border border-outline-variant/20 shadow-sm cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xs uppercase">
                  {workspace.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>

          <footer className="mt-auto px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-outline uppercase tracking-[0.2em] gap-4">
            <span>LeadEngine v4.2.0-stable</span>
            <div className="flex gap-6">
              <a className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Support Hub</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full signature-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
        <Zap className="w-6 h-6 fill-white" />
      </button>
    </div>
  );
}
