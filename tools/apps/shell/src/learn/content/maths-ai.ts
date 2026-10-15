import { buildStack } from "../author/build.js";
import { act, calc, learn } from "../author/maths-ai/calculus.js";
import { prob, stats } from "../author/maths-ai/data.js";
import { lin, mat, num, vec } from "../author/maths-ai/foundations.js";
import { ml, nn } from "../author/maths-ai/networks.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/maths-ai/practice.js";

/**
 * Maths for AI — written by hand. Each concept carries its own interactive
 * diagram (graphs with sliders, bars, matrix multiplication, traces…).
 * After editing run `npm test`: it checks every formula in every diagram and
 * refreshes maths-ai.stats.json.
 */
const built = buildStack({
  areas: [
    ["num", "Numbers, algebra and notation", "Numbers"],
    ["lin", "Straight lines and slope", "Lines"],
    ["vec", "Vectors", "Vectors"],
    ["mat", "Matrices", "Matrices"],
    ["stats", "Describing data", "Statistics"],
    ["prob", "Probability and information", "Probability"],
    ["calc", "Calculus: change and slope", "Calculus"],
    ["learn", "Learning: loss and gradient descent", "Learning"],
    ["act", "Activations and outputs", "Activations"],
    ["nn", "Putting it together: networks", "Networks"],
    ["ml", "Maths inside ML algorithms", "ML maths"],
  ],
  concepts: { num, lin, vec, mat, stats, prob, calc, learn, act, nn, ml },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
});

export const content = built.content;
export const visuals = built.visuals;
