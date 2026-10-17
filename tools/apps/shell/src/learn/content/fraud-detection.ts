import { buildStack } from "../author/build.js";
import { data } from "../author/fraud/data.js";
import { evaluate } from "../author/fraud/evaluate.js";
import { frame } from "../author/fraud/frame.js";
import { model } from "../author/fraud/model.js";
import { ops } from "../author/fraud/ops.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/fraud/practice.js";
import { serve } from "../author/fraud/serve.js";
import outputs from "./fraud-detection.outputs.json";

/**
 * Real-time fraud detection — the first Real-world project scenario of the AI Atlas.
 * Hand-authored. The examples are plain Python/NumPy on a seeded transaction simulator
 * (author/fraud/sim.ts), so the "Output" panels come from RUNNING the code:
 *   npm run outputs -- fraud-detection
 * The live lab (visuals/FraudLab.tsx) is a synthetic stream; its logic is tested by npm test.
 */
const built = buildStack({
  areas: [
    ["frame", "Frame the problem", "The problem"],
    ["data", "Data and features", "Data"],
    ["model", "Models and decisions", "Models"],
    ["eval", "Evaluation", "Evaluate"],
    ["serve", "Real-time serving", "Serving"],
    ["ops", "Operating it in production", "Operations"],
  ],
  concepts: { frame, data, model, eval: evaluate, serve, ops },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
  outputs: outputs as Record<string, string>,
});

export const content = built.content;
export const visuals = built.visuals;
