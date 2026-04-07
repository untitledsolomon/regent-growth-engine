import { createContext, useContext, useState, ReactNode } from 'react';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  powered_by_visible: boolean;
  role: 'admin' | 'manager' | 'viewer';
}

interface WorkspaceState {
  workspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
}

const defaultWorkspace: Workspace = {
  id: 'ws-demo-001',
  name: 'Regent Agency',
  slug: 'regent',
  primary_color: '#6366f1',
  powered_by_visible: true,
  role: 'admin',
};

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(defaultWorkspace);
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('regent_onboarded') === 'true';
  });

  const handleSetOnboarded = (v: boolean) => {
    setIsOnboarded(v);
    localStorage.setItem('regent_onboarded', String(v));
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, isOnboarded, setIsOnboarded: handleSetOnboarded }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
