import { L, P, bars, cells, compare, curve, flow, line, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "./data.js";

/* Every code example is RUN by `npm run outputs -- machine-learning`. */

const scores: [string, number, number][] = [["A", 0.9, 1], ["B", 0.8, 0], ["C", 0.7, 1], ["D", 0.6, 0], ["E", 0.4, 1], ["F", 0.3, 0], ["G", 0.2, 0], ["H", 0.1, 0]];
const atLeast = (s: number) => `step(${s}-t+0.00001)`;
const posS = scores.filter(([, , y]) => y === 1).map(([, s]) => s);
const negS = scores.filter(([, , y]) => y === 0).map(([, s]) => s);

/* ROC and precision–recall points, one per distinct score threshold (descending). */
const thresholds = [...new Set(scores.map(([, s]) => s))].sort((a, b) => b - a);
const rocPts: [number, number][] = [[0, 0], ...thresholds.map((t) => [scores.filter(([, s, y]) => s >= t && y === 0).length / negS.length, scores.filter(([, s, y]) => s >= t && y === 1).length / posS.length] as [number, number])];
const prPts: [number, number][] = thresholds.map((t) => {
  const tp = scores.filter(([, s, y]) => s >= t && y === 1).length;
  const fp = scores.filter(([, s, y]) => s >= t && y === 0).length;
  return [tp / posS.length, tp / (tp + fp)] as [number, number];
});

/* ------------------------------------------------------------------ */
export const evaluate: ConceptDef[] = [
  {
    t: "Train, validation and test: three jobs",
    lv: 1,
    s: `Each split has one job. The {{training}} data estimates the model's parameters. The {{validation}} data (usually via cross-validation) guides choices — depth, k, C, the threshold. The {{test}} data estimates the performance of the FINAL selected workflow and is used once. Example: 100 labelled emails, 40 Spam and 60 Normal. A stratified 80/20 split gives 80 development emails (32 Spam, 48 Normal) and 20 test emails (8 Spam, 12 Normal). Tuning on the test set, even a little, makes the final score optimistic.`,
    r: `A holdout split is not "bad": its reliability depends on sample size and on whether the split mimics future use. Repeated customers need group splits; forecasting needs time splits.`,
    i: `What is each of the training, validation and test sets used for?`,
    c: py`
spam, normal, test_share = 40, 60, 0.2
test_spam, test_normal = int(spam * test_share), int(normal * test_share)
print(spam + normal - test_spam - test_normal, test_spam + test_normal)
print(spam - test_spam, normal - test_normal, test_spam, test_normal)`,
    v: cells("100 emails: fit and choose on 80, report once on 20.", [P("all 100", ["40 Spam", "60 Normal"]), P("development 80", ["32 Spam", "48 Normal"]), P("test 20", ["8 Spam", "12 Normal"])], [
      ["100 labelled emails, 40% Spam."],
      ["Reserve 20% for the final test, stratified so the class mix is the same.", [[2, 0, 1]]],
      ["The 80 development emails do all the fitting and choosing (via cross-validation).", [[1, 0, 1]]],
      ["Refit the selected pipeline on the 80, evaluate ONCE on the 20.", [[2, 0, 1]]],
    ]),
  },
  {
    t: "K-fold, stratified K-fold and leave-one-out",
    lv: 1,
    s: `K-fold rotates a held-out fold: five-fold on the 80 development emails holds out 16 and trains on 64 each run, five runs, and averages the scores. Stratified K-fold keeps the class proportions in each fold (not equal class sizes!). {{Leave-one-out}} holds out one row each run: 80 runs; leave-p-out tries every p-subset: C(80, 2) = 3,160 runs. Suppose the five macro-F1 scores are 0.70, 0.75, 0.80, 0.75, 0.70: the mean is 0.74; also look at their spread. With very few minority rows, a fold may miss a class.`,
    r: `Compare candidates on the SAME folds. Use group-aware folds for repeated customers and time-aware folds for forecasting; cross-validation does not fix a wrong split.`,
    i: `How many model fits does 5-fold cross-validation need, and how many does leave-one-out need for 80 rows?`,
    c: py`
import math
import numpy as np

n = 80
print(n - n // 5, n // 5, math.comb(n, 2))
scores = np.array([0.70, 0.75, 0.80, 0.75, 0.70])
print(round(float(scores.mean()), 2), round(float(scores.std()), 3))`,
    v: cells("Five-fold: each fold is the validation set exactly once.", [P("run 1", ["VAL", "train", "train", "train", "train"]), P("run 2", ["train", "VAL", "train", "train", "train"]), P("run 3", ["train", "train", "VAL", "train", "train"]), P("run 4", ["train", "train", "train", "VAL", "train"]), P("run 5", ["train", "train", "train", "train", "VAL"])], [
      ["80 rows → 5 folds of 16 rows."],
      ["Run 1: validate on fold 1, train on the other 64.", [[0, 0, 0]]],
      ["Run 2 … run 5: the held-out fold rotates.", [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]]],
      ["Average the five validation scores (0.74 in the example) and note the spread.", [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]]],
    ]),
  },
  {
    t: "The confusion matrix: read the mistakes first",
    lv: 1,
    s: `Fix the positive class and the axes before reading anything. Here Spam is positive; rows are actual, columns predicted. Of 100 emails (20 Spam, 80 Normal) the filter catches 16 Spam, misses 4 and wrongly blocks 8 Normal: {{TP = 16}}, {{FN = 4}}, {{FP = 8}}, {{TN = 72}}. Accuracy = (TP + TN) / total = 88/100 = 0.88. Rebuild the cells from a sentence: true positives, then caught, the rest are missed; false alarms come from the Normal class; the remainder are true negatives.`,
    r: `Exercise: 18 of 20 Spam caught and 6 of 80 Normal blocked gives TP = 18, FN = 2, FP = 6, TN = 74 (sum 100).`,
    i: `Rebuild the confusion matrix from "18 of 20 spam caught, 6 of 80 normal blocked".`,
    c: py`
import numpy as np

spam_total, normal_total, caught, blocked = 20, 80, 16, 8
tp, fn = caught, spam_total - caught
fp, tn = blocked, normal_total - blocked
print(np.array([[tp, fn], [fp, tn]]).tolist(), (tp + tn) / (tp + tn + fp + fn))`,
    v: cells("Rows are what the email really is; columns are what the filter said.", table(["actual ↓ / predicted →", "Spam", "Normal"], [["Spam", "TP = 16", "FN = 4"], ["Normal", "FP = 8", "TN = 72"]]), [
      ["The Spam class is the positive class."],
      ["TP: real Spam, flagged Spam (16). TN: real Normal, passed (72).", [[1, 1, 1], [2, 2, 2]]],
      ["FN: real Spam that slipped through (4). FP: Normal wrongly blocked (8).", [[1, 2, 2], [2, 1, 1]]],
      ["Accuracy = (16 + 72) / 100 = 0.88 — but see the next lessons for what it hides.", [[1, 1, 1], [2, 2, 2]]],
    ]),
  },
  {
    t: "Precision, recall, specificity and F1",
    lv: 1,
    s: `The denominators answer different questions. {{Precision}} = TP/(TP + FP): of the emails flagged Spam, how many are Spam? 16/24 = 0.667. {{Recall}} (sensitivity) = TP/(TP + FN): of all real Spam, how many were caught? 16/20 = 0.80. {{Specificity}} = TN/(TN + FP): of all Normal, how many passed? 72/80 = 0.90. {{F1}} = 2TP/(2TP + FP + FN) = 32/44 = 0.727, the harmonic mean of precision and recall — it punishes imbalance: P = 1 and R = 0.1 give F1 = 0.18, not 0.55. Drag the caught Spam and false alarms.`,
    r: `F1 ignores true negatives. If a denominator is zero the metric is undefined; software may return 0 by convention.`,
    i: `Given TP = 16, FP = 8, FN = 4, TN = 72: compute precision, recall, specificity and F1.`,
    c: py`
tp, fp, fn, tn = 16, 8, 4, 72
precision, recall = tp / (tp + fp), tp / (tp + fn)
print(round(precision, 4), recall, tn / (tn + fp))
print(round(2 * precision * recall / (precision + recall), 4), round(2 * tp / (2 * tp + fp + fn), 4))
print(round(2 * 1 * 0.1 / (1 + 0.1), 4))`,
    v: bars("20 real Spam, 80 real Normal. Drag how many Spam are caught and how many Normal are wrongly flagged.", [
      ["Accuracy", "(tp+80-fp)/100"], ["Precision", "tp/max(1,tp+fp)"], ["Recall", "tp/20"], ["Specificity", "(80-fp)/80"], ["F1", "2*tp/max(1,2*tp+fp+(20-tp))"],
    ], {
      percent: true,
      params: [par("tp", "Spam caught (TP)", 0, 20, 1, 16), par("fp", "Normal wrongly flagged (FP)", 0, 80, 1, 8)],
      readout: ["TP {tp} · FN {20-tp} · FP {fp} · TN {80-fp}"],
      steps: [["The example: accuracy 0.88, precision 0.667, recall 0.8, F1 0.727.", { tp: 16, fp: 8 }], ["Catch almost nothing but flag nothing wrongly: accuracy still high, recall tiny.", { tp: 2, fp: 0 }], ["Flag everything: recall 1, precision and specificity poor.", { tp: 20, fp: 80 }]],
    }),
  },
  {
    t: "Macro, weighted and micro averages",
    lv: 2,
    s: `Calculate each class's metrics first, then average. Using the same 100-email matrix and evaluating Normal as its own positive class (TP = 72, FP = 4, FN = 8, support 80): Spam F1 = 0.7273 (support 20), Normal F1 = 0.9231. {{Macro}} averages the classes equally: F1 = 0.8252. {{Weighted}} weights by support: (20×0.7273 + 80×0.9231)/100 = 0.8839. {{Micro}} adds the counts across classes first; for single-label multiclass it equals accuracy. Weighted recall = accuracy = 0.88; macro recall (balanced accuracy) = 0.85.`,
    r: `"Macro accuracy" and "weighted accuracy" have several definitions in courses. State the formula you use: macro recall is not the same as an average of one-vs-rest accuracies. Macro F1 is not the F1 of macro precision and macro recall.`,
    i: `Compute macro and weighted F1 for classes with F1 0.7273 (support 20) and 0.9231 (support 80).`,
    c: py`
import numpy as np

f1 = np.array([32 / 44, 144 / 156])
support = np.array([20, 80])
recall = np.array([16 / 20, 72 / 80])
print(f1.round(4).tolist(), round(float(f1.mean()), 4), round(float((f1 * support).sum() / support.sum()), 4))
print(round(float(recall.mean()), 2), round(float((recall * support).sum() / support.sum()), 2))`,
    v: cells("The two averages give different stories when the classes are unequal.", table(["class", "support", "precision", "recall", "F1"], [["Spam", "20", "0.6667", "0.8", "0.7273"], ["Normal", "80", "0.9474", "0.9", "0.9231"], ["macro", "—", "—", "0.85", "0.8252"], ["weighted", "—", "—", "0.88", "0.8839"]]), [
      ["Per-class scores first."],
      ["Macro treats each class equally: (0.7273 + 0.9231) / 2 = 0.8252.", [[3, 4, 4]]],
      ["Weighted lets the large Normal class dominate: 0.8839. Weighted recall = overall accuracy = 0.88.", [[4, 3, 4]]],
    ]),
  },
  {
    t: "Thresholds: make the decision rule visible",
    lv: 2,
    s: `A model returns scores; a threshold turns them into decisions: predict Spam when p ≥ threshold. Lowering the threshold finds more Spam and flags more Normal. Eight scored emails (A 0.9 Spam, B 0.8 Normal, C 0.7 Spam, D 0.6 Normal, E 0.4 Spam, F 0.3, G 0.2, H 0.1 Normal). At 0.5: TP 2, FP 2, FN 1, TN 3 → precision 0.5, recall 0.667, F1 0.571. At 0.7: TP 2, FP 1 → P = R = F1 = 0.667. At 0.8: TP 1, FP 1, FN 2 → precision falls to 0.5, so raising the threshold does NOT guarantee higher precision. Drag it.`,
    r: `Choose the threshold from validation predictions and the cost of each mistake; then evaluate that frozen rule on the test set.`,
    i: `At threshold 0.5 compute TP, FP, FN, TN for the eight scores above.`,
    c: py`
import numpy as np

p = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
for t in (0.5, 0.7, 0.8):
    pred = p >= t
    tp, fp = int((pred & (y == 1)).sum()), int((pred & (y == 0)).sum())
    fn, tn = int(((~pred) & (y == 1)).sum()), int(((~pred) & (y == 0)).sum())
    print(t, tp, fp, fn, tn, round(tp / (tp + fp), 4), round(tp / (tp + fn), 4), round(2 * tp / (2 * tp + fp + fn), 4))`,
    v: bars("Precision, recall, F1 and accuracy of the eight scored emails at the chosen threshold.", [["Precision", "tp/max(1,tp+fp)"], ["Recall", "tp/3"], ["F1", "2*tp/max(1,2*tp+fp+(3-tp))"], ["Accuracy", "(tp+(5-fp))/8"]], {
      percent: true,
      params: [par("t", "threshold", 0.05, 0.95, 0.05, 0.5)],
      defs: [["tp", posS.map(atLeast).join("+")], ["fp", negS.map(atLeast).join("+")]],
      readout: ["flag p ≥ {t}: TP {tp} · FP {fp} · FN {3-tp} · TN {5-fp}"],
      steps: [["Threshold 0.5: precision 0.5, recall 0.667.", { t: 0.5 }], ["0.7: precision = recall = 0.667.", { t: 0.7 }], ["0.8: precision drops back to 0.5 although the bar is higher.", { t: 0.8 }]],
    }),
  },
  {
    t: "ROC curve and AUC: ranking quality",
    lv: 2,
    s: `Sweep the threshold and plot the {{true-positive rate}} TPR = TP/(TP + FN) (recall) against the {{false-positive rate}} FPR = FP/(FP + TN) = 1 − specificity: that is the ROC curve. The area under it, AUC, equals the fraction of positive–negative score PAIRS in which the positive ranks higher (ties count half). Here, positives 0.9, 0.7, 0.4 and negatives 0.8, 0.6, 0.3, 0.2, 0.1 give 15 pairs; the positives beat 5, 4 and 3 negatives: 12/15 = 0.8. This is NOT 80% accuracy: at threshold 0.5 the accuracy is (2 + 3)/8 = 0.625.`,
    r: `AUC 1 is perfect ranking, 0.5 is chance, below 0.5 is possible. It says nothing about calibration: a model can rank well and still be overconfident.`,
    i: `Compute the ROC-AUC from positive scores [0.9, 0.7, 0.4] and negative scores [0.8, 0.6, 0.3, 0.2, 0.1].`,
    c: py`
import numpy as np

pos = np.array([0.9, 0.7, 0.4])
neg = np.array([0.8, 0.6, 0.3, 0.2, 0.1])
wins = (pos[:, None] > neg[None, :]).sum() + 0.5 * (pos[:, None] == neg[None, :]).sum()
print(int(wins), pos.size * neg.size, round(float(wins / (pos.size * neg.size)), 3))
print((2 + 3) / 8)`,
    v: plot("ROC curve of the eight scored emails; the dot is the point for the chosen threshold; the diagonal is chance.", {
      x: [0, 1], y: [0, 1.05], labels: ["false-positive rate", "true-positive rate (recall)"],
      params: [par("t", "threshold", 0.05, 0.95, 0.05, 0.5)],
      defs: [["tp", posS.map(atLeast).join("+")], ["fp", negS.map(atLeast).join("+")]],
      readout: ["threshold {t}: TPR = {tp}/3 = {tp/3:2}, FPR = {fp}/5 = {fp/5:2}   ·   AUC = 12/15 = 0.8"],
      steps: [["Threshold 0.5: TPR 0.67, FPR 0.4.", { t: 0.5 }], ["A strict threshold 0.85: nothing wrong flagged, but little caught.", { t: 0.85 }], ["A lax threshold 0.05: everything flagged — the top-right corner.", { t: 0.05 }]],
    }, [
      line("0", "0", "1", { c: "muted", dash: true }),
      ...rocPts.slice(1).map(([x, y], i) => seg(String(rocPts[i]?.[0]), String(rocPts[i]?.[1]), String(x), String(y), { c: "accent" })),
      pt("fp/5", "tp/3", { c: "bad" }),
    ]),
  },
  {
    t: "Precision–recall curve and average precision",
    lv: 2,
    s: `When positives are rare, ROC can look flattering because the many negatives keep FPR small. A {{precision–recall curve}} plots precision against recall as the threshold moves and focuses on the quality of the alerts. {{Average precision}} summarises it as Σ (Rₙ − Rₙ₋₁) Pₙ. For the eight scores, the recall steps are 1/3 each, at precisions 1, 2/3 and 0.6, so AP = (1 + 0.667 + 0.6)/3 = 0.7556. AP is not identical to every trapezoidal PR-area definition.`,
    r: `Use PR curves for fraud, defects and any rare-event alerting; compare to the base rate (3/8 = 0.375 here) rather than to 0.5.`,
    i: `Why prefer a precision–recall curve to ROC for a very rare positive class?`,
    c: py`
import numpy as np

p = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
ap, prev_recall = 0.0, 0.0
for t in sorted(set(p), reverse=True):
    pred = p >= t
    tp = int((pred & (y == 1)).sum())
    precision, recall = tp / pred.sum(), tp / y.sum()
    ap += (recall - prev_recall) * precision
    prev_recall = recall
print(round(ap, 4))`,
    v: plot("Precision–recall points at each threshold (dashed: the base rate of 0.375).", {
      x: [0, 1.05], y: [0, 1.1], labels: ["recall", "precision"],
      params: [par("t", "threshold", 0.05, 0.95, 0.05, 0.5)],
      defs: [["tp", posS.map(atLeast).join("+")], ["fp", negS.map(atLeast).join("+")]],
      readout: ["threshold {t}: recall {tp/3:2}, precision {tp/max(1,tp+fp):2}   ·   average precision = 0.7556"],
      steps: [["Threshold 0.5.", { t: 0.5 }], ["A strict threshold: high precision, low recall.", { t: 0.85 }]],
    }, [
      line("0", "0.375", "0", { c: "muted", dash: true }),
      ...prPts.slice(1).map(([x, y], i) => seg(String(prPts[i]?.[0]), String(prPts[i]?.[1]), String(x), String(y), { c: "accent" })),
      ...prPts.map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      pt("tp/3", "tp/max(1,tp+fp)", { c: "bad" }),
    ]),
  },
  {
    t: "Log loss: reward honest probabilities",
    lv: 2,
    s: `Hard decisions hide how confident the model was. {{Log loss}} per row is −[y ln p + (1 − y) ln(1 − p)]: only the probability given to the TRUE class matters, and a confident wrong answer is very expensive. A true Spam scored 0.8 costs −ln 0.8 = 0.2231; scored 0.1 it costs −ln 0.1 = 2.3026. Four examples (0.8, 0.1 for y = 1; 0.2, 0.9 for y = 0) average (0.2231 + 2.3026 + 0.2231 + 2.3026)/4 ≈ 1.2629. Lower is better; implementations clip probabilities to avoid ln 0.`,
    r: `For multiclass, use −ln(probability assigned to the true class), with the columns in the right class order.`,
    i: `Compute the log loss of a true-Spam email predicted at 0.1.`,
    c: py`
import numpy as np

y = np.array([1, 1, 0, 0])
p = np.array([0.8, 0.1, 0.2, 0.9])
row = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print(row.round(4).tolist(), round(float(row.mean()), 4))`,
    v: plot("Loss for a true-Spam email as a function of the probability the model gave to Spam.", {
      x: [0, 1], y: [0, 5], labels: ["predicted P(Spam)", "loss"],
      params: [par("p", "predicted P(Spam)", 0.02, 0.98, 0.02, 0.8)],
      readout: ["true Spam: loss = −ln({p}) = {-ln(p):3}   ·   true Normal: loss = −ln(1 − {p}) = {-ln(1-p):3}"],
      steps: [["Confident and right (0.8): 0.223.", { p: 0.8 }], ["Confident and wrong (0.1): 2.303.", { p: 0.1 }], ["A hedge (0.5) costs 0.693 either way.", { p: 0.5 }]],
    }, [curve("-ln(x)", { c: "info", label: "true Spam", from: "0.01", to: "0.99" }), curve("-ln(1-x)", { c: "warn", label: "true Normal", from: "0.01", to: "0.99" }), pt("p", "-ln(p)", { c: "bad" }), vline("p", { c: "muted", dash: true })]),
  },
  {
    t: "Scores, probabilities and calibration",
    lv: 2,
    s: `A model's output is not automatically a trustworthy probability. An SVM returns a signed distance to the boundary (−0.8 is not a negative probability). A random forest averages tree probabilities; Naive Bayes posteriors can be over-confident when features are dependent; logistic regression is often reasonably calibrated. {{Calibration}} checks whether "70%" really means 70% of such cases are positive, and can be fixed with a separate calibration step. Rank quality (AUC) and calibration are different properties.`,
    r: `Return a probability to users only when it is supported and validated; otherwise return a class and an explanation.`,
    i: `Is an SVM decision score of −0.8 a probability?`,
    v: compare("What each model's number means.", ["Output", "Safe to read as a probability?"], [
      ["Logistic regression", "sigmoid of a linear score", "often roughly calibrated"],
      ["Naive Bayes", "posterior under independence", "often over-confident"],
      ["Random forest", "average of tree probabilities", "useful ranking; calibrate if needed"],
      ["SVM", "signed distance to the boundary", "no — needs a calibration step"],
      ["kNN", "share of neighbours per class", "coarse; depends on k"],
    ]),
  },
  {
    t: "Grid search: compare settings fairly",
    lv: 2,
    s: `{{Hyper-parameters}} (k, depth, C) are chosen before training; {{parameters}} (tree thresholds, SVM weights) are learned. Grid search tries every combination with the same cross-validation folds. For kNN with k ∈ {1, 3, 5} and weights ∈ {uniform, distance}: 6 candidates × 5 folds = 30 validation fits, plus one final refit of the winner. Select by mean validation macro F1 — k = 3 with distance weights (0.82) — then evaluate once on the test set. A 0.01 difference is not automatically meaningful: look at fold variation and cost.`,
    r: `Do not report the best cross-validation score as an untouched test score. When many rounds of decisions reuse the same validation data, nested cross-validation estimates the whole tuning procedure.`,
    i: `How many fits does a 3 × 2 grid with 5-fold cross-validation need?`,
    c: py`
from itertools import product

grid = {"k": [1, 3, 5], "weights": ["uniform", "distance"]}
combos = list(product(*grid.values()))
print(len(combos), len(combos) * 5)
cv_scores = dict(zip(combos, [0.72, 0.72, 0.80, 0.82, 0.79, 0.81]))
print(max(cv_scores, key=cv_scores.get))`,
    v: cells("Illustrative mean validation macro-F1 for each candidate (not measured on the eight-email table).", table(["candidate", "k = 1", "k = 3", "k = 5"], [["uniform", "0.72", "0.80", "0.79"], ["distance", "0.72", "0.82", "0.81"]]), [
      ["Six candidates, every one scored on the same five folds."],
      ["The best mean validation score is k = 3 with distance weights: 0.82.", [[2, 2, 2]]],
      ["Refit that setting on all development rows and test once on the held-out data.", [[2, 2, 2]]],
    ]),
  },
  {
    t: "Nested validation and selection bias",
    lv: 3,
    s: `Every time you look at a score and make a choice, a little of that data leaks into the model. If you try 500 settings and keep the best cross-validation score, that best score is biased upward. {{Nested cross-validation}} uses an inner loop to choose settings and an outer loop to score the whole procedure: the outer score is an honest estimate of what the tuning recipe delivers. The simplest safe habit is a locked test set that decides nothing.`,
    r: `The more you tune, the less you can trust the best validation number. Report the test score of the frozen pipeline.`,
    i: `Why is the best cross-validation score over many settings optimistic?`,
    v: flow("Inner loop chooses; outer loop judges the recipe.", "row",
      ["Outer split|hold out a fold|i", "Inner CV|choose settings on the rest|w", "Refit|best settings on all rest|g", "Outer score|judge on the held-out fold|g"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["Cross-validation on the remaining data picks hyper-parameters.", "The winner is refit on all of the remaining data.", "It is scored on the outer fold; repeat for every outer fold and average."]),
  },
  {
    t: "Regression metrics: MAE, MSE, RMSE, R²",
    lv: 1,
    s: `For a numeric target, compare predictions with the truth in the target's own units. {{MAE}} = mean |error|; {{MSE}} = mean error² (punishes large misses); {{RMSE}} = √MSE; {{R²}} = 1 − Σerror² / Σ(y − ȳ)², the share of variance explained (1 perfect, 0 no better than predicting the mean, negative worse). For truths 3, 5, 7 and predictions 2.5, 5, 8: errors −0.5, 0, +1 → MAE 0.5, MSE 0.4167, RMSE 0.6455, R² = 1 − 1.25/8 = 0.84375.`,
    r: `Report an error in real units next to R² so non-technical readers can judge it.`,
    i: `Which metric penalises a few large errors more: MAE or RMSE?`,
    c: py`
import numpy as np

y = np.array([3.0, 5.0, 7.0])
pred = np.array([2.5, 5.0, 8.0])
err = pred - y
mse = float((err ** 2).mean())
r2 = 1 - float((err ** 2).sum() / ((y - y.mean()) ** 2).sum())
print(round(float(np.abs(err).mean()), 4), round(mse, 4), round(mse ** 0.5, 4), round(r2, 4))`,
    v: compare("Errors are −0.5, 0, +1.", ["Formula", "Value here"], [
      ["MAE", "mean of |error|", "0.5"],
      ["MSE", "mean of error²", "0.4167"],
      ["RMSE", "√MSE", "0.6455"],
      ["R²", "1 − Σerror² / Σ(y − ȳ)²", "1 − 1.25 / 8 = 0.8438"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
type Pt = [number, number];
const sm: Pt[] = [[2.4, 2], [2.8, 3], [2.6, 2], [12, 12], [11, 10], [12.5, 13], [5, 5], [5.2, 6]];
const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const smMean: Pt = [avg(sm.map((p) => p[0])), avg(sm.map((p) => p[1]))];
const covOf = (pts: Pt[], m: Pt) => ({
  a: avg(pts.map((p) => (p[0] - m[0]) ** 2)),
  b: avg(pts.map((p) => (p[0] - m[0]) * (p[1] - m[1]))),
  c: avg(pts.map((p) => (p[1] - m[1]) ** 2)),
});
const smCov = covOf(sm, smMean);
const smBest = (0.5 * Math.atan2(2 * smCov.b, smCov.a - smCov.c) * 180) / Math.PI;

const ldaA: Pt[] = [[1, 2.2], [2, 3.2], [3, 3.8], [4, 5]];
const ldaB: Pt[] = [[1, 0.3], [2, 0.8], [3, 2.3], [4, 2.7]];
const mA: Pt = [avg(ldaA.map((p) => p[0])), avg(ldaA.map((p) => p[1]))];
const mB: Pt = [avg(ldaB.map((p) => p[0])), avg(ldaB.map((p) => p[1]))];
const wA = covOf(ldaA, mA);
const wB = covOf(ldaB, mB);
const sw = { a: 4 * (wA.a + wB.a), b: 4 * (wA.b + wB.b), c: 4 * (wA.c + wB.c) };
const dm: Pt = [mA[0] - mB[0], mA[1] - mB[1]];

export const viz: ConceptDef[] = [
  {
    t: "Seeing the data: the visualisation menu",
    lv: 1,
    s: `A graph helps you ask better questions. A {{scatter plot}} shows two features at a time; a {{scatter matrix}} shows every pair (crowded with many columns); {{parallel coordinates}} give each feature a vertical axis and each row a line; {{RadViz}} and symbols pull points toward feature anchors. Projections such as PCA make new coordinates so many features fit in 2D. A scatter of supermarket customers (annual spend in thousands of euros against visits per month) already suggests three groups — but it hides household size and online orders, so try several views.`,
    r: `A diagonal trend means two features move together; clustering asks whether points form useful groups. They are related but different questions.`,
    i: `Why is a single scatter plot not enough to claim there are three customer segments?`,
    v: plot("Each dot is a customer: occasional, regular and high-value online shoppers.", {
      x: [0, 14], y: [0, 15], labels: ["annual spend (thousand €)", "visits per month"],
    }, [
      ...sm.slice(0, 3).map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      ...sm.slice(6).map(([x, y]) => pt(String(x), String(y), { c: "warn" })),
      ...sm.slice(3, 6).map(([x, y]) => pt(String(x), String(y), { c: "good" })),
    ]),
  },
  {
    t: "The curse of dimensionality",
    lv: 2,
    s: `With many features, "near" and "far" lose contrast. Pick a random query point and 200 random points in d dimensions: in 2D the farthest is many times farther than the nearest; in 1,000 dimensions the nearest and the farthest are almost the same distance, so distance-based methods (kNN, k-means, DBSCAN) struggle. Also the data needed to cover the space grows exponentially. Remedies: select or engineer fewer features, reduce dimensions (PCA), or use a distance suited to the data (cosine for text). The output panel shows the nearest/farthest ratio for several d.`,
    r: `Adding features is not free: irrelevant ones add noise to every distance.`,
    i: `Why does kNN deteriorate in very high dimensions?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    pts = rng.random((200, d))
    q = rng.random(d)
    dist = np.linalg.norm(pts - q, axis=1)
    print(d, round(float(dist.min() / dist.max()), 3))`,
    v: compare("What happens as the number of features grows.", ["Low dimension (2)", "High dimension (1000)"], [
      ["Nearest vs farthest point", "very different distances", "almost the same distance"],
      ["Distance-based methods", "work well", "lose discrimination"],
      ["Data needed to cover the space", "modest", "enormous"],
      ["Remedy", "—", "fewer features, PCA, a better distance"],
    ], 0),
  },
  {
    t: "PCA, step by step",
    lv: 2,
    s: `Principal component analysis finds perpendicular directions of maximum variance. Steps: (1) centre each feature by subtracting its mean; (2) usually standardise when units differ; (3) compute the covariance matrix; (4) find its eigenvectors and eigenvalues; (5) sort the directions by eigenvalue; (6) project each row onto the first two: {{z = X·w}}. The explained-variance ratio of a component is its eigenvalue divided by the sum of all eigenvalues. PCA is unsupervised: it creates coordinates, not labels.`,
    r: `PCA components are mixtures of the original features: inspect the loadings and report the explained variance. A 2D picture can hide information.`,
    i: `List the steps of PCA and say what an eigenvalue represents.`,
    c: py`
import numpy as np

X = np.array([[2.4, 2], [2.8, 3], [2.6, 2], [12, 12], [11, 10], [12.5, 13], [5, 5], [5.2, 6]])
Xc = X - X.mean(axis=0)
cov = np.cov(Xc.T, bias=True)
values, vectors = np.linalg.eigh(cov)
order = values.argsort()[::-1]
values, vectors = values[order], vectors[:, order]
print(values.round(3).tolist(), (values / values.sum()).round(3).tolist())
print(vectors[:, 0].round(3).tolist(), (Xc @ vectors[:, 0]).shape)`,
    v: flow("From a table to a projection.", "row",
      ["Centre|subtract each mean|i", "Standardise|if units differ|w", "Covariance|how features vary together|g", "Eigen-decomposition|directions + variances|g", "Sort|largest eigenvalue first|g", "Project|z = X · w|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]], undefined,
      ["Put features on a comparable scale when units differ.", "Compute the covariance matrix.", "Eigenvectors are the new axes; eigenvalues their variances.", "The first axis keeps the most variance.", "Multiply the centred data by the chosen axes."]),
  },
  {
    t: "PCA geometry: the direction of most variance",
    lv: 2,
    s: `Projecting onto an axis keeps the variation along it and discards the variation across it. For the eight supermarket customers the points lie along a diagonal, so an axis near ${smBest.toFixed(0)}° keeps almost all the variance while the perpendicular axis keeps almost none. Projection example: after centring, a point x = (2, 2) on the unit direction u = (1/√2, 1/√2) projects to z = x·u = 4/√2 ≈ 2.828. Drag the angle of the axis.`,
    r: `Coordinates are linear mixtures, so a high-variance axis may be driven by one large-unit feature. Standardise first when features have different units.`,
    i: `What fraction of the variance does a projection axis keep, and how is the best axis found?`,
    c: py`
import numpy as np

x = np.array([2.0, 2.0])
u = np.array([1.0, 1.0]) / np.sqrt(2)
print(round(float(x @ u), 3), round(4 / float(np.sqrt(2)), 3))`,
    v: plot("The line is the projection axis; the readout is the share of the total variance it keeps.", {
      x: [0, 14], y: [0, 15], labels: ["annual spend (thousand €)", "visits per month"],
      params: [par("th", "axis angle (degrees)", 0, 175, 5, 0)],
      defs: [["v", `${smCov.a}*cos(th*pi/180)^2+2*${smCov.b}*sin(th*pi/180)*cos(th*pi/180)+${smCov.c}*sin(th*pi/180)^2`]],
      readout: [`variance kept = {v:2} of ${(smCov.a + smCov.c).toFixed(2)}  =  {v/${smCov.a + smCov.c}*100:1}%`],
      steps: [["Along feature 1 (0°): keeps only part of the variance.", { th: 0 }], ["Near the data's long direction (45°): nearly all of it.", { th: 45 }], ["Across it (135°): almost nothing.", { th: 135 }]],
    }, [line(String(smMean[0]), String(smMean[1]), "tan(th*pi/180)", { c: "accent", label: "axis" }), ...sm.map(([x, y]) => pt(String(x), String(y), { c: "info" }))]),
  },
  {
    t: "LDA versus PCA: supervised direction finding",
    lv: 2,
    s: `PCA ignores labels and finds the direction of greatest overall variance. {{Linear discriminant analysis}} uses the class labels: it looks for the direction that best SEPARATES the classes — a large distance between the class means relative to the spread within each class (the Fisher ratio). The two can disagree. Here both classes stretch along the diagonal, so PCA picks the diagonal (about 55°), but the classes are offset vertically, so LDA picks a direction across the diagonal (about 130°). Drag the angle.`,
    r: `LDA needs labels and is at most (classes − 1) dimensional. It is not the same method as latent Dirichlet allocation, which is a topic model.`,
    i: `Why can PCA fail to separate two classes that LDA separates?`,
    c: py`
import numpy as np

A = np.array([[1, 2.2], [2, 3.2], [3, 3.8], [4, 5.0]])
B = np.array([[1, 0.3], [2, 0.8], [3, 2.3], [4, 2.7]])
Sw = np.cov(A.T, bias=True) * 4 + np.cov(B.T, bias=True) * 4
d = A.mean(axis=0) - B.mean(axis=0)
w = np.linalg.solve(Sw, d)
print(d.round(3).tolist(), (w / np.linalg.norm(w)).round(3).tolist())`,
    v: plot("Blue and red classes lie along the diagonal but are offset vertically. The readout is the Fisher separation of the chosen axis.", {
      x: [0, 6], y: [-1, 7], labels: ["x₁", "x₂"],
      params: [par("th", "axis angle (degrees)", 0, 175, 5, 55)],
      defs: [["J", `(${dm[0]}*cos(th*pi/180)+${dm[1]}*sin(th*pi/180))^2/(${sw.a}*cos(th*pi/180)^2+2*${sw.b}*sin(th*pi/180)*cos(th*pi/180)+${sw.c}*sin(th*pi/180)^2)`]],
      readout: ["class separation (between ÷ within) along this axis = {J:2}"],
      steps: [["55°: the long direction (what PCA picks) mixes the classes: separation only 0.16.", { th: 55 }], ["130°: across the diagonal (what LDA picks): separation about 13.", { th: 130 }]],
    }, [
      line("2.5", "2.5", "tan(th*pi/180)", { c: "accent", label: "axis" }),
      ...ldaA.map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      ...ldaB.map(([x, y]) => pt(String(x), String(y), { c: "bad" })),
    ]),
  },
  {
    t: "MDS, ISOMAP, LLE, t-SNE and UMAP",
    lv: 2,
    s: `{{MDS}} places points in 2D so that pairwise distances match the original ones as well as possible. {{ISOMAP}} preserves distances measured along the data's curved surface (manifold); {{LLE}} preserves each point's relationship to its local neighbours. {{t-SNE}} and {{UMAP}} are modern non-linear maps that keep local neighbourhoods and are excellent for exploring clusters. The cautions are the same for all: visual islands are not proof of clusters, global distances and cluster sizes can be distorted, and the picture depends on parameters.`,
    r: `Use PCA for a reproducible overview and a non-linear map to inspect neighbourhoods; run clustering on the real features, not on 2D coordinates alone.`,
    i: `Can you trust the distance between two islands in a t-SNE plot?`,
    v: compare("What each projection tries to preserve.", ["Preserves", "Caution"], [
      ["PCA", "directions of largest variance (linear)", "may hide structure that is not linear"],
      ["LDA", "class separation (needs labels)", "supervised, not for exploration without labels"],
      ["MDS", "pairwise distances", "all pairs: expensive; stress can remain high"],
      ["ISOMAP", "distances along the manifold", "sensitive to the neighbour graph"],
      ["LLE", "local neighbour relations", "can distort global shape"],
      ["t-SNE / UMAP", "local neighbourhoods", "cluster sizes and gaps are not reliable measurements"],
    ]),
  },
  {
    t: "SVD and latent semantic analysis",
    lv: 3,
    s: `The {{singular value decomposition}} writes a matrix as a product of rotations and a diagonal matrix of singular values. Keeping only the largest few gives the best low-rank approximation. {{TruncatedSVD}} (also called LSA for text) does this to a sparse TF–IDF matrix WITHOUT centring it — which is why it works on sparse data where PCA would make the matrix dense. The squared singular values measure how much each component "explains". Treat the reduced space as a view that helps similarity and clustering, not as a perfect map of meaning.`,
    r: `Reduce a TF–IDF matrix to 100–300 components before clustering text, then check that the groups still make sense.`,
    i: `Why is TruncatedSVD used for sparse text matrices instead of PCA?`,
    c: py`
import numpy as np

A = np.array([[3.0, 0.0], [0.0, 2.0], [0.0, 0.0]])
U, s, Vt = np.linalg.svd(A)
print(s.round(3).tolist(), round(float(s[0] ** 2 / (s ** 2).sum()), 3))
A1 = s[0] * np.outer(U[:, 0], Vt[0])
print(A1.round(3).tolist())`,
    v: compare("Two ways to reduce dimensions.", ["PCA", "TruncatedSVD / LSA"], [
      ["Centres the data first", "yes", "no — keeps sparsity"],
      ["Typical input", "dense numeric table", "sparse TF–IDF matrix"],
      ["Output", "coordinates of maximum variance", "latent 'topic-like' coordinates"],
      ["Choose how many", "explained-variance ratio", "explained variance and downstream results"],
    ]),
  },
];

void [L, vline];
