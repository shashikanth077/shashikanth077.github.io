import { buildStack } from "../author/build.js";
import { ai } from "../author/python-ai/aiwork.js";
import { basics, dicts, lists, tuples } from "../author/python-ai/collections.js";
import { files } from "../author/python-ai/files.js";
import { funcs } from "../author/python-ai/functions.js";
import { oop } from "../author/python-ai/oop.js";
import { codeLab, drills, glance, lists as habitLists, materials, questions } from "../author/python-ai/practice.js";

/**
 * Python for AI — written by hand (not imported from a handbook).
 * Each concept carries its own animated diagram; see learn/author/build.ts.
 * After editing, run `npm test` — it validates the diagrams and refreshes python-ai.stats.json.
 */
const built = buildStack({
  areas: [
    ["basics", "Python basics", "Basics"],
    ["lists", "Lists", "Lists"],
    ["tuples", "Tuples", "Tuples"],
    ["dicts", "Dictionaries", "Dicts"],
    ["funcs", "Functions", "Functions"],
    ["oop", "Classes and objects (OOP)", "OOP"],
    ["files", "File handling", "Files"],
    ["ai", "Python in real AI work", "AI work"],
  ],
  concepts: { basics, lists, tuples, dicts, funcs, oop, files, ai },
  questions,
  drills,
  codeLab,
  glance,
  lists: habitLists,
  materials,
});

export const content = built.content;
export const visuals = built.visuals;
