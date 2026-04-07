import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUserOrg } from "@/lib/org";

interface OrgContextType {
  orgId: string | null;
  orgName: string | null;
  role: string | null;
  loading: boolean;
}

const OrgContext = createContext<OrgContextType>({
  orgId: null,
  orgName: null,
  role: null,
  loading: true,
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrg().then((data) => {
      if (data) {
        setOrgId(data.org_id);
        setOrgName((data.organisations as any)?.name ?? null);
        setRole(data.role);
      }
      setLoading(false);
    });
  }, []);

  return (
    <OrgContext.Provider value={{ orgId, orgName, role, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);