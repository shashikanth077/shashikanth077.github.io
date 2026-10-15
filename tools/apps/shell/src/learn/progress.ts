import { useCallback, useSyncExternalStore } from "react";

/** Per-stack learning progress, persisted in this browser only. */
export interface Progress {
  studied: Record<string, true>;
  known: Record<string, true>;
  solved: Record<string, true>;
}

type Bucket = keyof Progress;
const EMPTY: Progress = { studied: {}, known: {}, solved: {} };
const key = (stack: string) => `toolnest-learn:${stack}`;

const cache = new Map<string, Progress>();
const listeners = new Set<() => void>();

function read(stack: string): Progress {
  const hit = cache.get(stack);
  if (hit) return hit;
  let value = EMPTY;
  try {
    const raw = localStorage.getItem(key(stack));
    if (raw) value = { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    /* storage unavailable or corrupt — start fresh */
  }
  cache.set(stack, value);
  return value;
}

function write(stack: string, next: Progress) {
  cache.set(stack, next);
  try {
    localStorage.setItem(key(stack), JSON.stringify(next));
  } catch {
    /* private mode — progress lasts for this tab only */
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("toolnest-learn:")) {
      cache.delete(e.key.slice("toolnest-learn:".length));
      listeners.forEach((l) => l());
    }
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useProgress(stack: string) {
  const progress = useSyncExternalStore(subscribe, () => read(stack), () => EMPTY);

  const toggle = useCallback(
    (bucket: Bucket, id: string, force?: boolean) => {
      const current = read(stack);
      const set = { ...current[bucket] };
      const on = force ?? !set[id];
      if (on) set[id] = true;
      else delete set[id];
      write(stack, { ...current, [bucket]: set });
    },
    [stack],
  );

  const reset = useCallback(() => write(stack, EMPTY), [stack]);
  return { progress, toggle, reset };
}

/** Number of ids from `ids` that are marked in `bucket`. */
export const countDone = (bucket: Record<string, true>, ids: string[]) => ids.reduce((n, id) => n + (bucket[id] ? 1 : 0), 0);
