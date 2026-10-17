import type { ArchKind, ArchNode, StreamVisual } from "../../visuals/types.js";

/** Architecture node: n("id", "Label", "sub", "icon", col, row, "kind", "what it does here"). */
export const n = (id: string, label: string, sub: string, icon: string, x: number, y: number, kind: ArchKind, info: string): ArchNode => ({ id, label, sub, icon, x, y, kind, info });

/** The live fraud stream lab. */
export const stream = (takeaway: string, o: Omit<StreamVisual, "type" | "takeaway">): StreamVisual => ({ type: "stream", takeaway, ...o });

/** Defaults used by every instance of the lab so the numbers stay comparable across concepts. */
export const LAB = { fraudRate: 3, separation: 4, reviewAt: 0.4, declineAt: 0.8, falseDeclineCost: 12, reviewCost: 3 } as const;
