import type { VisualMap } from "./types.js";
import { data } from "./nodejs/data.js";
import { ops } from "./nodejs/ops.js";
import { runtime } from "./nodejs/runtime.js";
import { web } from "./nodejs/web.js";

export const visuals: VisualMap = { ...runtime, ...web, ...data, ...ops };
