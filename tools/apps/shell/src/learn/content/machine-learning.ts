import { buildStack } from "../author/build.js";
import { big, stats } from "../author/ml/big.js";
import { cluster1 } from "../author/ml/cluster1.js";
import { cluster2 } from "../author/ml/cluster2.js";
import { evaluate, viz } from "../author/ml/evaluate.js";
import { classic, nn, tree } from "../author/ml/models.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/ml/practice.js";
import { distance, prep } from "../author/ml/prep.js";
import { text } from "../author/ml/text.js";
import outputs from "./machine-learning.outputs.json";

/**
 * Machine Learning — written by hand from five lecture guides. Every example is written in
 * plain NumPy so that the "Output" panels come from RUNNING the code:
 *
 *     npm run outputs -- machine-learning
 *
 * Re-run it after editing any example, then `npm test`.
 */
const built = buildStack({
  areas: [
    ["big", "The big picture", "Overview"],
    ["stats", "Statistics you need", "Statistics"],
    ["prep", "Preparing data", "Prepare"],
    ["distance", "Distance and similarity", "Distance"],
    ["tree", "Decision trees and ensembles", "Trees"],
    ["classic", "Probability, neighbours and margins", "Classifiers"],
    ["nn", "Neural networks", "Neural nets"],
    ["eval", "Evaluating models honestly", "Evaluate"],
    ["viz", "Seeing and reducing data", "Projection"],
    ["cluster", "Clustering", "Clustering"],
    ["text", "Text mining", "Text"],
  ],
  concepts: { big, stats, prep, distance, tree, classic, nn, eval: evaluate, viz, cluster: [...cluster1, ...cluster2], text },
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
