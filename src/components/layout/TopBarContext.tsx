import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface TopBarMeta {
  eyebrow?: string;
  title?: string;
  extras?: ReactNode;
}

interface TopBarContextValue {
  meta: TopBarMeta;
  setMeta: (meta: TopBarMeta) => void;
}

const TopBarContext = createContext<TopBarContextValue | undefined>(undefined);

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<TopBarMeta>({});
  const value = useMemo(() => ({ meta, setMeta }), [meta]);
  return <TopBarContext.Provider value={value}>{children}</TopBarContext.Provider>;
}

export function useTopBarSlot(meta: TopBarMeta) {
  const ctx = useContext(TopBarContext);
  if (!ctx) {
    throw new Error("useTopBarSlot precisa ser usado dentro do TopBarProvider.");
  }
  const { setMeta } = ctx;
  const stable = useCallback(() => setMeta(meta), [setMeta, meta.eyebrow, meta.title, meta.extras]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    stable();
    return () => setMeta({});
  }, [stable, setMeta]);
}

export function useTopBarMeta() {
  const ctx = useContext(TopBarContext);
  if (!ctx) {
    throw new Error("useTopBarMeta precisa ser usado dentro do TopBarProvider.");
  }
  return ctx.meta;
}
