import type { VisualMap } from "./types.js";
import { core } from "./redis/core.js";
import { practice } from "./redis/practice.js";

export const visuals: VisualMap = { ...core, ...practice };
