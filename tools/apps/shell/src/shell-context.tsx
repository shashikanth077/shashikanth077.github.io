import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  SHELL_CONTRACT_VERSION,
  type ShellContextValue,
  type ThemeName,
  type ToastKind,
} from "@devtools/shell-contract";
import type { RootState } from "./store.js";

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) throw new Error("useShell must be called inside <ShellProvider>");
  return value;
}

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_MS = 3200;

/** Resolves the "system" preference into a concrete theme, and tracks OS changes. */
function useResolvedTheme(): ThemeName {
  const preference = useSelector((s: RootState) => s.preferences.theme);
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved: ThemeName = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Stamp the root so the CSS token overrides in tokens.css take effect.
  useEffect(() => {
    document.documentElement.dataset["theme"] = resolved;
  }, [resolved]);

  return resolved;
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const theme = useResolvedTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, kind }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  const value = useMemo<ShellContextValue>(
    () => ({
      navigate: (path: string) => navigate(path),
      toast,
      theme,
      contractVersion: SHELL_CONTRACT_VERSION,
    }),
    [navigate, toast, theme],
  );

  return (
    <ShellContext.Provider value={value}>
      {children}
      <div className="shell-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`shell-toast shell-toast--${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ShellContext.Provider>
  );
}
