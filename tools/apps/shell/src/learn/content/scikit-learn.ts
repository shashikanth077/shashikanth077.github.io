import { buildStack } from "../author/build.js";
import { evaluate, ship, unsup } from "../author/sklearn/applied.js";
import { prep, start } from "../author/sklearn/basics.js";
import { classify, regress } from "../author/sklearn/models.js";
import { codeLab, drills, glance, lists, materials, questions } from "../author/sklearn/practice.js";

/**
 * scikit-learn — written by hand. Unlike NumPy, Matplotlib and pandas, the example outputs
 * here are typed by hand (scikit-learn was not installed when the track was authored), so each
 * example uses tiny exact data whose result was derived independently with NumPy.
 * Re-run them with real scikit-learn when it is installed.
 */
const built = buildStack({
  areas: [
    ["start", "The scikit-learn workflow", "Basics"],
    ["prep", "Preparing data", "Prepare"],
    ["regress", "Regression", "Regression"],
    ["classify", "Classification", "Classify"],
    ["eval", "Evaluating models", "Evaluate"],
    ["unsup", "Unsupervised learning", "Unsupervised"],
    ["ship", "Pipelines, pitfalls and shipping", "Ship it"],
  ],
  concepts: { start, prep, regress, classify, eval: evaluate, unsup, ship },
  questions,
  drills,
  codeLab,
  glance,
  lists,
  materials,
});

export const content = built.content;
export const visuals = built.visuals;
