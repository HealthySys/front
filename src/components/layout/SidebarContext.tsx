import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "healthsys.frontend.sidebar.collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore quota errors
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsedState((value) => !value), []);
  const setCollapsed = useCallback((value: boolean) => setCollapsedState(value), []);

  const value = useMemo(() => ({ collapsed, toggle, setCollapsed }), [collapsed, toggle, setCollapsed]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar precisa ser usado dentro do SidebarProvider.");
  }
  return ctx;
}
