import type { Stack } from "./catalog.js";
import type { Progress } from "./progress.js";
import type { StackContent } from "./types.js";
import type { VisualMap } from "./visuals/types.js";

export type ViewId = "overview" | "learn" | "patterns" | "practice" | "interview" | "updates" | "materials";

export interface LearnCtx {
  stack: Stack;
  data: StackContent;
  /** Animated explanations keyed by concept id. */
  visuals: VisualMap;
  progress: Progress;
  toggle: (bucket: keyof Progress, id: string, force?: boolean) => void;
  /** Navigate within the stack workspace; params replace the current query string. */
  go: (view: ViewId, params?: Record<string, string>) => void;
  params: URLSearchParams;
  setParam: (key: string, value: string | null) => void;
}
