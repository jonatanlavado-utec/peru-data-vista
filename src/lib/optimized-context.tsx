import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type OptimizedContextValue = {
  optimized: boolean;
  setOptimized: (v: boolean) => void;
  toggle: () => void;
};

const OptimizedContext = createContext<OptimizedContextValue | undefined>(undefined);

const STORAGE_KEY = "amazonpe.optimized";

export const OptimizedProvider = ({ children }: { children: ReactNode }) => {
  const [optimized, setOptimized] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(optimized));
    // Expose globally so the api layer (non-React) can read the current flag.
    (window as unknown as { __OPTIMIZED__?: boolean }).__OPTIMIZED__ = optimized;
  }, [optimized]);

  return (
    <OptimizedContext.Provider
      value={{ optimized, setOptimized, toggle: () => setOptimized((v) => !v) }}
    >
      {children}
    </OptimizedContext.Provider>
  );
};

export const useOptimized = () => {
  const ctx = useContext(OptimizedContext);
  if (!ctx) throw new Error("useOptimized must be used within OptimizedProvider");
  return ctx;
};

/** Read current optimized flag from outside React (used by the api layer). */
export const getOptimizedFlag = (): boolean => {
  if (typeof window === "undefined") return true;
  const w = window as unknown as { __OPTIMIZED__?: boolean };
  if (typeof w.__OPTIMIZED__ === "boolean") return w.__OPTIMIZED__;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
};
