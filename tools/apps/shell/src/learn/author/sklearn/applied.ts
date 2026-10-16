import { L, P, bars, cells, compare, layers, line, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Outputs are hand-derived from tiny exact data (see basics.ts). */

/* ------------------------------------------------------------------ */
const posScores = [0.9, 0.8, 0.6, 0.4];
const negScores = [0.7, 0.5, 0.3, 0.2, 0.1, 0.05];
const atLeast = (s: number) => `step(${s}-t+0.00001)`;

export const evaluate: ConceptDef[] = [
  {
    t: "Accuracy can lie: the baseline",
    lv: 1,
    s: `Accuracy is the share of correct predictions, and with imbalanced classes it is easy to inflate. If only 25% of cases are positive, a "model" that always says negative is right 75% of the time — while finding none of the positives. {{DummyClassifier(strategy="most_frequent")}} builds exactly that baseline; your real model has to beat it, and on a metric that cares about the rare class.`,
    r: `A 99% accurate fraud model that never flags fraud is worthless. Always compare with a dummy baseline.`,
    i: `Your classifier is 95% accurate on data that is 95% one class. Is it good?`,
    c: py`
from sklearn.dummy import DummyClassifier

y = [0] * 9 + [1] * 3
X = [[i] for i in range(12)]
dummy = DummyClassifier(strategy="most_frequent").fit(X, y)
print(dummy.score(X, y))
print(dummy.predict([[100]]).tolist())`,
    o: `0.75
[0]`,
    v: bars("The 'always predict 0' baseline: high accuracy, zero recall for the class that matters.", [["accuracy of always-0", "(100-p)/100"], ["recall of class 1", "0"]], {
      percent: true,
      params: [par("p", "% of cases that are positive", 1, 50, 1, 25)],
      readout: ["with {p}% positives, 'always 0' is {100-p}% accurate and catches none of them"],
      steps: [["25% positives (the code example): 75% accuracy, 0% recall.", { p: 25 }], ["Only 3% positives: 97% accuracy — impressive and useless.", { p: 3 }]],
    }),
  },
  {
    t: "Confusion matrix, precision, recall and F1",
    lv: 1,
    s: `The confusion matrix counts four outcomes: true positives, false positives, false negatives, true negatives. From them: {{precision}} = of the cases I flagged, how many were real? {{recall}} = of the real cases, how many did I find? {{F1}} is their harmonic mean. In scikit-learn rows are the actual classes and columns the predictions: {{confusion_matrix(y_true, y_pred)}}. Drag the mistakes and watch each score react differently.`,
    r: `Choose by cost: missing a disease (false negative) calls for recall; flagging innocent customers (false positive) calls for precision.`,
    i: `Define precision and recall, and say when each matters most.`,
    c: py`
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score

y_true = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
y_pred = [1, 1, 0, 0, 0, 0, 0, 0, 1, 0]
print(confusion_matrix(y_true, y_pred).tolist())
print(accuracy_score(y_true, y_pred), round(precision_score(y_true, y_pred), 3),
      recall_score(y_true, y_pred), round(f1_score(y_true, y_pred), 3))`,
    o: `[[5, 1], [2, 2]]
0.7 0.667 0.5 0.571`,
    v: bars("100 cases: 40 truly positive, 60 truly negative. Drag the misses and false alarms.", [
      ["Accuracy", "(100-fn-fp)/100"], ["Precision", "(40-fn)/((40-fn)+fp)"], ["Recall", "(40-fn)/40"], ["F1", "2*(40-fn)/(2*(40-fn)+fp+fn)"],
    ], {
      percent: true,
      params: [par("fn", "false negatives (missed positives)", 0, 39, 1, 10), par("fp", "false positives (false alarms)", 0, 60, 1, 5)],
      readout: ["TP {40-fn} · FN {fn} · FP {fp} · TN {60-fp}"],
      steps: [["10 misses, 5 false alarms: all four scores look fine.", { fn: 10, fp: 5 }], ["30 misses: recall collapses, precision stays high.", { fn: 30, fp: 5 }], ["40 false alarms: precision drops, recall stays.", { fn: 10, fp: 40 }]],
    }),
  },
  {
    t: "The threshold trades precision for recall",
    lv: 2,
    s: `A classifier outputs scores; a threshold turns them into decisions. Raise it and you flag fewer cases: precision rises, recall falls. Lower it and you catch more real cases but also more false alarms. The right threshold is a business choice, not a modelling one. Below, ten cases with scores are classified at your threshold.`,
    r: `Set the threshold from the costs (a missed fraud case versus a wasted review) and the review capacity of your team.`,
    i: `How do you tune a model for higher recall without retraining it?`,
    c: py`
import numpy as np
from sklearn.metrics import precision_score, recall_score

scores = np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05])
y = np.array([1, 1, 0, 1, 0, 1, 0, 0, 0, 0])
for t in (0.75, 0.55, 0.35):
    pred = (scores >= t).astype(int)
    print(t, round(precision_score(y, pred), 2), round(recall_score(y, pred), 2))`,
    o: `0.75 1.0 0.5
0.55 0.75 0.75
0.35 0.67 1.0`,
    v: bars("4 real positives and 6 negatives, each with a model score. Move the threshold.", [["Precision", "tp/max(1,tp+fp)"], ["Recall", "tp/4"]], {
      percent: true,
      params: [par("t", "threshold", 0.05, 0.95, 0.05, 0.55)],
      defs: [
        ["tp", posScores.map(atLeast).join("+")],
        ["fp", negScores.map(atLeast).join("+")],
      ],
      readout: ["flag scores ≥ {t}:  {tp} true positives, {fp} false positives"],
      steps: [["Threshold 0.75: only sure cases are flagged — perfect precision, half the positives found.", { t: 0.75 }], ["0.55: a balance.", { t: 0.55 }], ["0.35: every positive is found, at the price of two false alarms.", { t: 0.35 }]],
    }),
  },
  {
    t: "Train score versus test score",
    lv: 1,
    s: `Compare the score on the training data with the score on held-out data. Both high: the model generalises. High on train but much lower on test: overfitting — it memorised. Both low: underfitting — the model or the features are too weak. The gap tells you which way to move: simplify and regularise for overfitting, add flexibility or features for underfitting.`,
    r: `Always print both numbers. A single score hides which problem you have.`,
    i: `Train accuracy is 99% and test accuracy is 70%. What do you do?`,
    v: compare("Read the two scores together.", ["Train score", "Test score", "Diagnosis → action"], [
      ["Good fit", "high", "high", "ship it, keep monitoring"],
      ["Overfit", "very high", "much lower", "simpler model, regularise, more data"],
      ["Underfit", "low", "low", "more flexible model, better features"],
      ["Leakage?", "high", "suspiciously perfect", "check for target-derived features and preprocessing on all data"],
    ]),
  },
  {
    t: "Cross-validation",
    lv: 1,
    s: `One train/test split can be lucky or unlucky. {{cross_val_score(model, X, y, cv=5)}} cuts the data into 5 folds, and five times trains on four folds and tests on the fifth, so every row is tested once. You get five scores: their mean is a steadier estimate and their spread shows how much the score depends on the split. For classifiers scikit-learn automatically stratifies the folds.`,
    r: `Cross-validate to compare models and tune settings, then confirm the winner once on the untouched test set.`,
    i: `How does 5-fold cross-validation work, and why is it better than a single split?`,
    c: py`
from sklearn.dummy import DummyClassifier
from sklearn.model_selection import KFold, cross_val_score

for train, test in KFold(3).split(range(6)):
    print(train.tolist(), test.tolist())

y = [0] * 9 + [1] * 3
X = [[i] for i in range(12)]
print(cross_val_score(DummyClassifier(strategy="most_frequent"), X, y, cv=3).tolist())`,
    o: `[2, 3, 4, 5] [0, 1]
[0, 1, 4, 5] [2, 3]
[0, 1, 2, 3] [4, 5]
[0.75, 0.75, 0.75]`,
    v: cells("Each fold takes a turn as the test set (TEST); the rest train the model.", [P("round 1", ["TEST", "train", "train", "train", "train"]), P("round 2", ["train", "TEST", "train", "train", "train"]), P("round 3", ["train", "train", "TEST", "train", "train"]), P("round 4", ["train", "train", "train", "TEST", "train"]), P("round 5", ["train", "train", "train", "train", "TEST"])], [
      ["5 folds → 5 rounds, 5 scores."],
      ["Round 1: fold 1 is held out.", [[0, 0, 0]]],
      ["Round 2: fold 2 is held out, and so on.", [[1, 1, 1]]],
      ["Every fold is tested exactly once; the 5 scores are averaged.", [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]]],
    ]),
  },
  {
    t: "Tuning with GridSearchCV",
    lv: 2,
    s: `Settings you choose before training (hyper-parameters such as {{n_neighbors}} or {{max_depth}}) can be searched automatically. {{GridSearchCV(model, {"n_neighbors": [1, 3, 5]}, cv=3)}} cross-validates every combination, keeps the best ({{best_params_}}, {{best_score_}}) and refits it on all the training data. Search only on the training set, and keep the test set for one final check — otherwise the test score is optimistic.`,
    r: `A grid of 3 values × 4 values × 5 folds is 60 fits; use RandomizedSearchCV when grids get large.`,
    i: `Why is GridSearchCV run on the training set only?`,
    c: py`
from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

X = [[i] for i in [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15]]
y = [0] * 6 + [1] * 6
gs = GridSearchCV(KNeighborsClassifier(), {"n_neighbors": [1, 3, 5]}, cv=3).fit(X, y)
print(len(gs.cv_results_["params"]))
print(gs.cv_results_["params"])
print(gs.best_params_["n_neighbors"] in [1, 3, 5])`,
    o: `3
[{'n_neighbors': 1}, {'n_neighbors': 3}, {'n_neighbors': 5}]
True`,
    v: compare("Three candidates, each scored by cross-validation.", ["n_neighbors = 1", "n_neighbors = 3", "n_neighbors = 5"], [
      ["Fits", "3 (one per fold)", "3", "3"],
      ["Mean CV score", "computed", "computed", "computed"],
      ["Outcome", "the best mean score wins and is refit on all training data", "—", "—"],
    ]),
  },
  {
    t: "Choosing the right metric",
    lv: 2,
    s: `Pick the metric that matches the cost of mistakes. Balanced classes and equal costs: accuracy. Rare positives: precision, recall, F1 or area under the precision-recall curve. Ranking quality: ROC AUC. Regression: MAE for typical error, RMSE when large misses are worse, R² for share of variance explained. Decide before you look at scores, so you do not pick the metric that flatters the model.`,
    r: `State the metric and the baseline together: "recall 0.82 at 0.30 precision versus 0.40 recall for the dummy".`,
    i: `Which metric would you choose for a cancer screening model, and why?`,
    v: compare("Match the metric to the problem.", ["Metric", "Because"], [
      ["Balanced classes, equal costs", "accuracy", "every mistake costs the same"],
      ["Rare class, missing it is costly", "recall (and precision)", "accuracy hides the misses"],
      ["Rare class, false alarms are costly", "precision", "each flag consumes effort"],
      ["Balance of both", "F1", "single number from precision and recall"],
      ["Predicting a number", "MAE / RMSE / R²", "errors in real units"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
type Pt = [number, number];
const kmPts: Pt[] = [[1, 1], [2, 1.5], [1.5, 2.5], [2.5, 2], [8, 8], [9, 8.5], [8.5, 9.5], [9.5, 9]];
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const assign = (pts: Pt[], c: Pt[]) => pts.map((p) => (dist(p, c[0] ?? p) <= dist(p, c[1] ?? p) ? 0 : 1));
const centroid = (pts: Pt[], a: number[], j: number, old: Pt): Pt => {
  const m = pts.filter((_, i) => a[i] === j);
  return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : old;
};
const kmStates: { c: Pt[]; a: number[] }[] = [];
{
  let c: Pt[] = [[1, 1], [2, 2]];
  for (let it = 0; it < 8; it++) {
    const a = assign(kmPts, c);
    kmStates.push({ c, a });
    const next: Pt[] = [centroid(kmPts, a, 0, c[0] ?? [0, 0]), centroid(kmPts, a, 1, c[1] ?? [0, 0])];
    if (next.every((p, j) => dist(p, c[j] ?? p) < 1e-9)) break;
    c = next;
  }
}
const kmLast = kmStates.length - 1;

const elbow = [211.056, 76.542, 2.667, 1.917, 1.167];

/* PCA data: seven points close to a line. */
const pcaPts: Pt[] = [[2, 2.4], [3, 2.7], [4, 4.3], [5, 4.6], [6, 6.5], [7, 6.4], [8, 8.4]];
const pcaMean: Pt = [pcaPts.reduce((s, p) => s + p[0], 0) / 7, pcaPts.reduce((s, p) => s + p[1], 0) / 7];
const pcaVar = (f: (p: Pt) => number) => pcaPts.reduce((s, p) => s + f(p), 0) / 7;
const vxx = pcaVar((p) => (p[0] - pcaMean[0]) ** 2);
const vxy = pcaVar((p) => (p[0] - pcaMean[0]) * (p[1] - pcaMean[1]));
const vyy = pcaVar((p) => (p[1] - pcaMean[1]) ** 2);

export const unsup: ConceptDef[] = [
  {
    t: "K-means: grouping without labels",
    lv: 1,
    s: `Unsupervised learning has no {{y}}: the model looks for structure on its own. {{KMeans(n_clusters=2)}} repeats two moves — assign every point to its nearest centre, then move each centre to the average of its points — until nothing changes. Slide through the steps: the centres start in a poor place and walk to the middle of each group.`,
    r: `Customer segments, grouping similar documents, compressing colours in an image. Scale features first, because k-means uses distance.`,
    i: `Describe the two alternating steps of k-means.`,
    c: py`
import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [1, 1.5], [8, 8], [8.5, 9], [9, 8.5]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print(sorted(np.bincount(km.labels_).tolist()))
print(sorted(km.cluster_centers_[:, 0].round(2).tolist()))
print(round(float(km.inertia_), 2))`,
    o: `[3, 3]
[1.17, 8.5]
1.67`,
    v: plot("Dots are coloured by their nearest centre (orange / green); the large rings are the centres.", {
      x: [0, 11], y: [0, 11], labels: ["feature 1", "feature 2"],
      params: [par("it", "k-means step", 0, kmLast, 1, 0)],
      readout: ["step {it}: assign each point to its nearest centre, then move the centres"],
      steps: kmStates.map((_, i) => [i === 0 ? "Two poor starting centres, both near the lower-left group." : i === kmLast ? "Nothing moves any more: converged." : "Centres move to the average of their points; assignments are redrawn.", { it: i }] as [string, Record<string, number>]),
    }, kmStates.flatMap((s, i) => [
      ...kmPts.map((p, k) => pt(String(p[0]), String(p[1]), { c: s.a[k] === 0 ? "warn" : "good", show: `0.5-abs(it-${i})` })),
      ...s.c.map((p, j) => pt(String(p[0]), String(p[1]), { c: j === 0 ? "warn" : "good", label: `C${j + 1}`, show: `0.5-abs(it-${i})` })),
    ])),
  },
  {
    t: "Choosing k: the elbow method",
    lv: 2,
    s: `{{inertia_}} is the total squared distance from each point to its centre. It always falls as k grows (at k = number of points it reaches 0), so you look for the elbow: the k after which adding clusters barely helps. The data here has three natural groups: the inertia plunges from k = 2 to 3 and then flattens. Pair the elbow with domain sense and a silhouette score.`,
    r: `The elbow is a guide, not a rule. Business meaning ("we can run 3 campaigns") often decides.`,
    i: `Why can't you just pick the k with the lowest inertia?`,
    c: py`
import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [1, 1.5], [8, 8], [8.5, 9], [9, 8.5], [1, 9], [2, 8.5], [1.5, 9.5]])
inertias = [KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_ for k in range(1, 5)]
print(all(a > b for a, b in zip(inertias, inertias[1:])))
print((inertias[1] - inertias[2]) > 5 * (inertias[2] - inertias[3]))`,
    o: `True
True`,
    v: plot("Inertia for k = 1…5 on three-cluster data. The bend at k = 3 is the elbow.", {
      x: [0, 6], y: [0, 230], labels: ["k (number of clusters)", "inertia"],
      params: [par("k", "k", 1, 5, 1, 3)],
      defs: [["val", elbow.map((v, i) => `${v}*step(0.5-abs(k-${i + 1}))`).join("+")]],
      readout: ["k = {k}: inertia {val:1}"],
      steps: [["k = 1: one big cluster, inertia 211.", { k: 1 }], ["k = 2: still large (76.5).", { k: 2 }], ["k = 3: inertia collapses to 2.7 — the elbow.", { k: 3 }], ["k = 5: only slightly lower — extra clusters add little.", { k: 5 }]],
    }, [
      ...elbow.slice(1).map((v, i) => seg(String(i + 1), String(elbow[i]), String(i + 2), String(v), { c: "accent" })),
      ...elbow.map((v, i) => pt(String(i + 1), String(v), { c: "info" })),
      vline("k", { c: "warn", dash: true }),
    ]),
  },
  {
    t: "PCA: fewer columns, most of the information",
    lv: 2,
    s: `{{PCA(n_components=1)}} finds the direction along which the data vary most and projects every point onto it, so two columns become one while keeping as much variation as possible. Drag the angle of the axis: the share of the total variance it captures peaks at the data's long direction (about 45°) and is lowest across it. The ratio is reported as {{explained_variance_ratio_}}.`,
    r: `PCA compresses hundreds of correlated columns, removes noise and lets you plot high-dimensional data in 2D. Scale first.`,
    i: `What does explained_variance_ratio_ tell you?`,
    c: py`
import numpy as np
from sklearn.decomposition import PCA

X = np.array([[1, 2], [2, 4], [3, 6], [4, 8]])
pca = PCA(n_components=1).fit(X)
Z = pca.transform(X)
print(round(float(pca.explained_variance_ratio_[0]), 2))
print(Z.shape)
print(bool(np.allclose(pca.inverse_transform(Z), X)))`,
    o: `1.0
(4, 1)
True`,
    v: plot("Points lie along a diagonal. The line is the axis you project onto; the readout is the variance it keeps.", {
      x: [0, 10], y: [0, 10], labels: ["feature 1", "feature 2"],
      params: [par("th", "axis angle (degrees)", 0, 175, 5, 0)],
      defs: [["v", `${vxx}*cos(th*pi/180)^2+2*${vxy}*sin(th*pi/180)*cos(th*pi/180)+${vyy}*sin(th*pi/180)^2`]],
      readout: [`variance kept = {v:2} of ${(vxx + vyy).toFixed(2)} total  =  {v/${vxx + vyy}*100:1}%`],
      steps: [["Along feature 1 only (0°): about half the variance.", { th: 0 }], ["Along the long direction (45°): nearly all of it — the principal component.", { th: 45 }], ["Across it (135°): almost nothing.", { th: 135 }]],
    }, [
      line(String(pcaMean[0]), String(pcaMean[1]), "tan(th*pi/180)", { c: "accent", label: "axis" }),
      ...pcaPts.map((p) => pt(String(p[0]), String(p[1]), { c: "info" })),
    ]),
  },
  {
    t: "Clustering versus classification",
    lv: 1,
    s: `Classification learns from examples with known answers and predicts the label of new cases. Clustering has no answers: it invents groups from similarity alone, and you must decide what the groups mean. Because there is no right answer to score against, judge clusters by use (are the segments actionable?), stability and internal measures such as inertia or the silhouette score.`,
    r: `Treat cluster labels as hypotheses to check with domain experts, not facts.`,
    i: `What is the main difference between supervised and unsupervised learning?`,
    v: compare("Same data, different questions.", ["Classification (supervised)", "Clustering (unsupervised)"], [
      ["Needs y", "yes — labelled examples", "no"],
      ["Output", "a known label for each new case", "an invented group number"],
      ["Scoring", "accuracy, precision, recall vs true labels", "inertia, silhouette, usefulness"],
      ["Example", "will this customer churn?", "which kinds of customers do we have?"],
      ["scikit-learn", "LogisticRegression, trees, forests", "KMeans, DBSCAN, PCA (reduction)"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const ship: ConceptDef[] = [
  {
    t: "Tuning a Pipeline: step__parameter names",
    lv: 2,
    s: `Inside a Pipeline each step is named, and you reach its settings with the name, two underscores, and the parameter: {{knn__n_neighbors}}. That works in {{set_params}} and as grid keys — the key {{"knn__n_neighbors"}} with a list of values to try. Tuning the whole pipeline inside cross-validation means the scaler is refit on each training fold only — no leakage even during the search.`,
    r: `Tune the pipeline, not the bare model, whenever preprocessing has learned numbers.`,
    i: `How do you grid-search a parameter of a model that is a step inside a Pipeline?`,
    c: py`
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])
print("knn__n_neighbors" in pipe.get_params())
pipe.set_params(knn__n_neighbors=7)
print(pipe.named_steps["knn"].n_neighbors)`,
    o: `True
7`,
    v: compare("step name + two underscores + parameter.", ["Reaches"], [
      ["knn__n_neighbors", "the n_neighbors setting of the step named knn"],
      ["scale__with_mean", "the with_mean setting of the step named scale"],
      ["pipe.set_params(...)", "changes it in place"],
      ["GridSearchCV(pipe, {\"knn__n_neighbors\": [3, 5]})", "searches it with leak-free cross-validation"],
    ]),
  },
  {
    t: "Saving and loading a model with joblib",
    lv: 1,
    s: `A trained model is just a Python object; {{joblib.dump(model, "model.joblib")}} writes it to a file and {{joblib.load("model.joblib")}} brings it back, so a web service can predict without retraining. Save the whole Pipeline so the preprocessing travels with the model. Only load files you trust (they can run code), and load with the same scikit-learn version that saved them.`,
    r: `Record the library versions next to the file; a model saved with one version may not load in another.`,
    i: `What should you save, and what is the security risk of loading a model file?`,
    c: py`
import joblib
from sklearn.linear_model import LinearRegression

model = LinearRegression().fit([[1], [2], [3], [4]], [3, 5, 7, 9])
joblib.dump(model, "model.joblib")
loaded = joblib.load("model.joblib")
print(loaded.predict([[5]]).round(2).tolist())`,
    o: `[11.0]`,
    v: layers("From notebook to service.", [
      "Train|pipe.fit(X_train, y_train) in your notebook|i",
      "Save|joblib.dump(pipe, \"model.joblib\") — scaler, encoder and model together|g",
      "Ship|the file goes to the server beside a pinned requirements file|g",
      "Load|joblib.load(\"model.joblib\") once at start-up|g",
      "Predict|loaded.predict(new_rows) for every request|w",
    ], "notebook → production"),
  },
  {
    t: "Feature importance and what the model learned",
    lv: 2,
    s: `Linear models expose {{coef_}}; tree models expose {{feature_importances_}}, a share per feature that sums to 1. A feature that never helps a split gets 0 — here the constant second column. Importances show what the model used, not what causes the outcome, and they can be split unpredictably among correlated features. {{sklearn.inspection.permutation_importance}} is a more reliable check on test data.`,
    r: `Use importances to find useless columns to drop and to sanity-check that the model uses features you expect, not an ID or a leak.`,
    i: `What do feature importances tell you and what don't they?`,
    c: py`
from sklearn.ensemble import RandomForestClassifier

X = [[1, 5], [2, 5], [3, 5], [10, 5], [11, 5], [12, 5]]
y = [0, 0, 0, 1, 1, 1]
rf = RandomForestClassifier(n_estimators=10, random_state=0).fit(X, y)
print(rf.feature_importances_.round(2).tolist())`,
    o: `[1.0, 0.0]`,
    v: cells("Only the first column can separate the classes; the constant column is never used.", [P("feature", ["x1 (1…12)", "x2 (always 5)"]), L("importance", ["1.0", "0.0"], "pos")], [
      ["Two features; importances sum to 1."],
      ["x1 separates the classes, so it gets all the credit.", [[0, 0, 0], [1, 0, 0]]],
      ["x2 is the same for every row — it can never help a split: 0.0.", [[0, 1, 1], [1, 1, 1]]],
    ]),
  },
  {
    t: "Common errors and what they mean",
    lv: 1,
    s: `Three errors cover most beginner problems. {{NotFittedError}}: you called {{predict}} before {{fit}}. {{ValueError: inconsistent numbers of samples}}: {{X}} and {{y}} have different row counts. {{ValueError: unknown category}}: a one-hot encoder met a value it never saw — fit it on all expected categories or set {{handle_unknown="ignore"}}. Also "Expected 2D array" (reshape X) and NaN errors (impute).`,
    r: `Read the last line of the traceback first; scikit-learn's messages usually name the exact fix.`,
    i: `What causes NotFittedError?`,
    c: py`
from sklearn.exceptions import NotFittedError
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder

try:
    LinearRegression().predict([[1]])
except NotFittedError:
    print("NotFittedError")
try:
    LinearRegression().fit([[1], [2]], [1])
except ValueError:
    print("ValueError: inconsistent lengths")
enc = OneHotEncoder().fit([["a"], ["b"]])
try:
    enc.transform([["c"]])
except ValueError:
    print("unknown category")`,
    o: `NotFittedError
ValueError: inconsistent lengths
unknown category`,
    v: compare("Message → cause → fix.", ["Cause", "Fix"], [
      ["NotFittedError", "predict called before fit", "call fit(X_train, y_train) first"],
      ["Expected 2D array, got 1D", "X is a flat list", "X.reshape(-1, 1) or df[[\"col\"]]"],
      ["inconsistent numbers of samples", "X and y differ in row count", "compare X.shape[0] with len(y)"],
      ["unknown category", "encoder saw a new value", "handle_unknown=\"ignore\""],
      ["Input contains NaN", "missing values reach the model", "SimpleImputer in the pipeline"],
    ]),
  },
  {
    t: "Reproducibility: random_state and versions",
    lv: 1,
    s: `Splits, forests, k-means starts and shuffling all use randomness. Pass {{random_state=42}} (any fixed integer) to each so results repeat — with the same data, code and library versions. Record the scikit-learn version too, because defaults change between releases. When comparing two models, give them the same split and the same seed, otherwise you may just be comparing luck.`,
    r: `"I got 91% yesterday" is useless without the seed. Fix it, log it, and report the score spread over several seeds for fair comparisons.`,
    i: `Why must you set random_state when comparing two models?`,
    c: py`
from sklearn.model_selection import train_test_split

a = train_test_split(range(10), random_state=1)
b = train_test_split(range(10), random_state=1)
print(a == b)`,
    o: `True`,
    v: compare("Where randomness hides.", ["Set it with"], [
      ["train_test_split", "random_state=42"],
      ["RandomForest, trees", "random_state=42"],
      ["KMeans", "random_state=42 (and n_init)"],
      ["cross-validation shuffling", "KFold(shuffle=True, random_state=42)"],
      ["library versions", "pin them: pip freeze > requirements.txt"],
    ]),
  },
  {
    t: "A checklist before you trust a score",
    lv: 1,
    s: `A high score is a claim that needs checking. Was the test set untouched until the end? Was everything learned (scaling, encoding, imputing, feature selection) fitted on training data only? Is there a leaked column derived from the answer? Does the model beat a dumb baseline on the metric that matters? Do train and test scores agree? Is the score stable across folds? If the result looks too good, it usually is.`,
    r: `This list is also your answer to "how do you evaluate a model?" in interviews.`,
    i: `A model scores 99% on its first try. What do you check?`,
    v: layers("Each check removes one way to fool yourself.", [
      "Untouched test set|decisions were made on validation data, the test set looked at once|i",
      "No leakage|scalers, encoders, imputers and selectors fitted on training rows only; use a Pipeline|g",
      "No leaked columns|nothing derived from the target sits in X|g",
      "Beats a baseline|DummyClassifier / mean predictor, on the right metric|w",
      "Stable|cross-validation scores agree; train and test scores are close|w",
    ], "strictest first"),
  },
];
