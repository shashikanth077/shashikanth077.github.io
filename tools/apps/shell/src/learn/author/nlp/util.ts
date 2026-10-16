import { flow } from "../../visuals/kit.js";

/** A left-to-right flow where every step has a note (the first note is merged into the second). */
export const rowflow = (takeaway: string, nodes: string[], notes: string[]) =>
  flow(takeaway, "row", nodes, nodes.slice(1).map((_, i): [number, number] => [i, i + 1]), nodes.slice(1).map((_, i) => i), [`${notes[0] ?? ""} ${notes[1] ?? ""}`.trim(), ...notes.slice(2)]);
