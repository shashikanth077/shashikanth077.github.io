import type { Stack } from "./catalog.js";
import type { Progress } from "./progress.js";
import type { StackContent } from "./types.js";

export type ViewId = "overview" | "learn" | "practice" | "interview" | "updates" | "materials";

export interface LearnCtx {
  stack: Stack;
  data: StackContent;
  progress: Progress;
  toggle: (bucket: keyof Progress, id: string, force?: boolean) => void;
  /** Navigate within the stack workspace; params replace the current query string. */
  go: (view: ViewId, params?: Record<string, string>) => void;
  params: URLSearchParams;
  setParam: (key: string, value: string | null) => void;
}
