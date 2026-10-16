import { L, P, area, bars, cells, compare, curve, flow, hline, line, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Outputs are hand-derived from tiny exact data (see basics.ts). */

/* ------------------------------------------------------------------ */
const xs = [1, 2, 3, 4, 5];
const ys = [2.1, 3.9, 6.2, 7.8, 10.1];
const sseFormula = xs.map((x, i) => `(${ys[i]}-(m*${x}+b))^2`).join("+");

const polyX = [1, 2, 3, 4, 5, 6, 7];
const polyY = [1.2, 3.8, 9.5, 16.3, 24.8, 35.5, 49.2];
const polyFits: [string, string][] = [
  ["1", "7.953571428571427*x-11.771428571428562"],
  ["2", "0.9988095238095263*x^2-0.03690476190477935*x+0.21428571428575327"],
  ["3", "0.004305555555551586*x^6-0.1129166666665801*x^5+1.1993055555548287*x^4-6.493749999997045*x^3+19.396388888882843*x^2-24.893333333327394*x+12.099999999997948"],
];

export const regress: ConceptDef[] = [
  {
    t: "Linear regression: the best straight line",
    lv: 1,
    s: `Regression predicts a number. {{LinearRegression}} finds the line {{y = coef × x + intercept}} that makes the total squared distance from the points to the line as small as possible. Those vertical gaps are the residuals; their squares added together are the error being minimised. Drag the slope and intercept yourself and watch the error — the best values are the ones scikit-learn finds.`,
    r: `House prices, delivery times, energy use: a linear model is the baseline every other regression model must beat.`,
    i: `What does ordinary least squares minimise, and what are residuals?`,
    c: py`
from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4], [5]]
y = [2.1, 3.9, 6.2, 7.8, 10.1]
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(round(model.score(X, y), 3))`,
    o: `1.99 0.05
0.997`,
    v: plot("The vertical segments are residuals. The best line makes their squares add up to the least.", {
      x: [0, 6], y: [0, 12], labels: ["x", "y"],
      params: [par("m", "slope", 0, 4, 0.05, 1), par("b", "intercept", -2, 4, 0.05, 1)],
      defs: [["sse", sseFormula]],
      readout: ["y = {m}·x + {b}   →   total squared error = {sse:3}", "scikit-learn's answer: slope 1.99, intercept 0.05, error 0.107"],
      steps: [["A poor guess (slope 1, intercept 1): large residuals.", { m: 1, b: 1 }], ["Slope 2, intercept 0: much closer.", { m: 2, b: 0 }], ["Slope 1.99, intercept 0.05: the least-squares line.", { m: 1.99, b: 0.05 }]],
    }, [
      line("0", "b", "m", { c: "accent", label: "model" }),
      ...xs.map((x, i) => seg(String(x), String(ys[i]), String(x), `m*${x}+b`, { c: "bad", dash: true })),
      ...xs.map((x, i) => pt(String(x), String(ys[i]), { c: "info" })),
    ]),
  },
  {
    t: "Reading coef_ and intercept_",
    lv: 1,
    s: `With several features the model is {{y = c1·x1 + c2·x2 + … + intercept}}. After {{fit}}, {{model.coef_}} holds one number per column of X (in order) and {{model.intercept_}} the constant. A coefficient says how much y changes when that feature rises by one unit with the others held fixed — which makes linear models easy to explain. Here the data follows {{y = 2·x1 + 3·x2 + 1}} exactly.`,
    r: `Coefficients are only comparable if features are on the same scale, and correlated features can split credit unpredictably.`,
    i: `How do you interpret a coefficient of 3.0 on a feature?`,
    c: py`
from sklearn.linear_model import LinearRegression

X = [[1, 0], [0, 1], [1, 1], [2, 1]]
y = [3, 4, 6, 8]
model = LinearRegression().fit(X, y)
print(model.coef_.round(2).tolist(), round(float(model.intercept_), 2))
print(model.predict([[3, 2]]).round(2).tolist())`,
    o: `[2.0, 3.0] 1.0
[13.0]`,
    v: cells("coef_ lines up with the columns of X: first number ↔ first feature.", [P("feature", ["x1", "x2"]), L("coef_", ["2.0", "3.0"], "pos"), P("new row", ["3", "2"])], [
      ["Two features, so two coefficients; the intercept is 1."],
      ["coef_[0] = 2 multiplies x1; coef_[1] = 3 multiplies x2.", [[0, 0, 1], [1, 0, 1]]],
      ["Predict for x1 = 3, x2 = 2: 2·3 + 3·2 + 1 = 13.", [[1, 0, 1], [2, 0, 1]]],
    ]),
  },
  {
    t: "Regression metrics: MAE, MSE, RMSE and R²",
    lv: 1,
    s: `A regression score must say how far off the predictions are. {{mean_absolute_error}} is the average miss in the target's own units. {{mean_squared_error}} squares each miss, punishing big ones; its square root, RMSE, is back in the original units. {{r2_score}} compares your model with always predicting the mean: 1 is perfect, 0 is no better than the mean, below 0 is worse.`,
    r: `Report an error in real units ("off by 0.5 dollars on average") next to R² so non-technical readers can judge it.`,
    i: `What is the difference between MAE and RMSE, and what does an R² of 0 mean?`,
    c: py`
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_true = [3, 5, 7]
y_pred = [2.5, 5, 8]
mae = mean_absolute_error(y_true, y_pred)
mse = mean_squared_error(y_true, y_pred)
print(round(mae, 3), round(mse, 3), round(mse ** 0.5, 3), round(r2_score(y_true, y_pred), 3))`,
    o: `0.5 0.417 0.645 0.844`,
    v: compare("Errors are −0.5, 0 and +1 for the three predictions.", ["Meaning", "Value here"], [
      ["MAE", "average of |error|", "(0.5 + 0 + 1) / 3 = 0.5"],
      ["MSE", "average of error²", "(0.25 + 0 + 1) / 3 = 0.417"],
      ["RMSE", "√MSE, in the target's units", "0.645"],
      ["R²", "1 − error / spread around the mean", "1 − 1.25 / 8 = 0.844"],
    ]),
  },
  {
    t: "PolynomialFeatures: bending the line",
    lv: 2,
    s: `A straight line cannot follow a curve. {{PolynomialFeatures(degree=2)}} adds new columns — {{x²}} here — so that a LINEAR model on {{[1, x, x²]}} can draw a parabola. The model is still linear in its coefficients; only the inputs changed. Higher degrees give more flexible curves, which leads straight to overfitting.`,
    r: `Feature engineering ideas like squares, products and logs let simple models capture non-linear patterns.`,
    i: `How can a linear regression fit a curve?`,
    c: py`
from sklearn.preprocessing import PolynomialFeatures

print(PolynomialFeatures(degree=2).fit_transform([[2], [3]]).tolist())`,
    o: `[[1.0, 2.0, 4.0], [1.0, 3.0, 9.0]]`,
    v: cells("Each x becomes a row [1, x, x²]; the model then fits one coefficient per column.", [P("x", ["2", "3"])], [
      ["Two input values."],
      ["degree=2 expands each into three columns: 1, x and x².", [[0, 0, 1]], [P("x", ["2", "3"]), P("[1, x, x²] for 2", ["1", "2", "4"]), P("[1, x, x²] for 3", ["1", "3", "9"])]],
    ]),
  },
  {
    t: "Underfitting and overfitting",
    lv: 2,
    s: `Too simple a model misses the pattern (underfitting): high error on both training and new data. Too flexible a model memorises the training points, noise included (overfitting): near-zero training error but a worse error on new data. Drag the complexity from a line, to a parabola, to a 6th-degree curve through all seven points and compare the train and test error.`,
    r: `The goal is not the lowest training error; it is the lowest error on data the model has not seen.`,
    i: `A model has 0 training error but a big test error. What happened, and what can you try?`,
    c: py`
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

x_train = np.array([1, 2, 3, 4, 5, 6, 7.0]).reshape(-1, 1)
y_train = np.array([1.2, 3.8, 9.5, 16.3, 24.8, 35.5, 49.2])
x_test = np.array([2.5, 5.5]).reshape(-1, 1)
y_test = np.array([6.0, 30.4])
errors = {}
for degree in (1, 2, 6):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(x_train, y_train)
    errors[degree] = (
        mean_squared_error(y_train, model.predict(x_train)),
        mean_squared_error(y_test, model.predict(x_test)),
    )
print(errors[1][0] > errors[2][0])
print(errors[6][0] < 1e-6)
print(errors[6][1] > errors[2][1])`,
    o: `True
True
True`,
    v: plot("Blue = training points, red = test points. Level 1 = line, 2 = parabola, 3 = 6th-degree curve.", {
      x: [0, 8], y: [-5, 60], labels: ["x", "y"],
      params: [par("lv", "complexity level", 1, 3, 1, 2)],
      defs: [
        ["tr", "12.0681*step(1.5-lv)+0.0967*step(lv-1.5)*step(2.5-lv)"],
        ["te", "3.4688*step(1.5-lv)+0.0817*step(lv-1.5)*step(2.5-lv)+0.2726*step(lv-2.5)"],
      ],
      readout: ["train error {tr:2}   ·   test error {te:2}   (mean squared error)"],
      steps: [
        ["A straight line is too simple: both errors are large (underfit).", { lv: 1 }],
        ["A parabola matches the pattern: both errors are small.", { lv: 2 }],
        ["The 6th-degree curve hits every training point (error 0) but its test error is worse than the parabola's (overfit).", { lv: 3 }],
      ],
    }, [
      ...polyFits.map(([k, f]) => curve(f, { c: "accent", show: `0.5-abs(lv-${k})` })),
      ...polyX.map((x, i) => pt(String(x), String(polyY[i]), { c: "info" })),
      pt("2.5", "6", { c: "bad", label: "test" }), pt("5.5", "30.4", { c: "bad", label: "test" }),
    ]),
  },
  {
    t: "Regularisation: Ridge shrinks coefficients",
    lv: 2,
    s: `Regularisation adds a penalty for big coefficients so the model cannot chase every wiggle. {{Ridge(alpha=1.0)}} is linear regression plus an L2 penalty: the larger {{alpha}}, the more the slope shrinks toward zero. Drag alpha: the line pivots around the centre of the data and flattens. {{Lasso}} (L1 penalty) can push some coefficients exactly to zero, which doubles as feature selection.`,
    r: `With many features or little data, a Ridge model is usually more stable than plain least squares. Tune alpha with cross-validation.`,
    i: `What does the alpha parameter control in Ridge regression?`,
    c: py`
from sklearn.linear_model import LinearRegression, Ridge

X = [[1], [2], [3], [4]]
y = [3, 5, 7, 9]
ols = LinearRegression().fit(X, y)
ridge = Ridge(alpha=1.0).fit(X, y)
print(round(float(ols.coef_[0]), 3), round(float(ridge.coef_[0]), 3))
print(round(float(ridge.intercept_), 3))`,
    o: `2.0 1.667
1.833`,
    v: plot("The data lie exactly on y = 2x + 1. Ridge pulls the slope below 2 as alpha grows.", {
      x: [0, 5], y: [0, 11], labels: ["x", "y"],
      params: [par("a", "alpha", 0, 20, 0.5, 1)],
      readout: ["slope = 10 / (5 + alpha) = {10/(5+a):3}   (alpha 0 gives the true slope 2)"],
      steps: [["alpha = 0: ordinary least squares, slope 2.", { a: 0 }], ["alpha = 1: slope 1.667.", { a: 1 }], ["alpha = 20: the slope is shrunk to 0.4 — heavily regularised.", { a: 20 }]],
    }, [
      line("2.5", "6", "10/(5+a)", { c: "accent", label: "Ridge line" }),
      ...[[1, 3], [2, 5], [3, 7], [4, 9]].map(([x, y]) => pt(String(x), String(y), { c: "info" })),
    ]),
  },
];

/* ------------------------------------------------------------------ */
const knnTrain: [number, number][] = [[1, 0], [2, 0], [2.6, 1], [3, 0], [4, 0], [8, 1], [9, 1], [10, 1], [11, 1]];
function knnPredict(x: number, k: number): number {
  const nearest = knnTrain.map(([p, c]) => [Math.abs(p - x), c] as const).sort((a, b) => a[0] - b[0]).slice(0, k);
  return nearest.filter(([, c]) => c === 1).length * 2 > k ? 1 : 0;
}
function knnRegions(k: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  let start = 0;
  let cls = knnPredict(0, k);
  for (let x = 0.01; x <= 13; x += 0.01) {
    const c = knnPredict(x, k);
    if (c !== cls) {
      out.push([start, x, cls]);
      start = x;
      cls = c;
    }
  }
  out.push([start, 13, cls]);
  return out;
}

const logPts0 = [1, 2, 3, 5.5];
const logPts1 = [4.5, 6, 7, 8];

export const classify: ConceptDef[] = [
  {
    t: "Logistic regression: a probability, then a threshold",
    lv: 1,
    s: `Despite its name, {{LogisticRegression}} classifies. It computes a score from the features, squeezes it through the S-shaped sigmoid to get a probability between 0 and 1, and predicts class 1 when that probability passes a threshold — 0.5 by default. Drag the threshold: a lower one catches more class-1 cases but also raises false alarms.`,
    r: `A fast, explainable first model for yes/no questions: churn, default, spam. Always scale features first.`,
    i: `Why is logistic regression a classifier, and what does changing the threshold do?`,
    c: py`
import numpy as np
from sklearn.linear_model import LogisticRegression

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 0, 1, 1, 1]
clf = LogisticRegression().fit(X, y)
print(clf.predict([[2], [5]]).tolist())
proba = clf.predict_proba([[2], [5]])
print(proba.shape, bool(np.allclose(proba.sum(axis=1), 1)))
print(bool(proba[1, 1] > 0.5))`,
    o: `[0, 1]
(2, 2) True
True`,
    v: plot("Dots at the bottom are class 0, at the top class 1. Dots on the wrong side of the red line are mistakes.", {
      x: [0, 10], y: [-0.1, 1.1], labels: ["feature", "probability of class 1"],
      params: [par("t", "threshold", 0.05, 0.95, 0.05, 0.5)],
      defs: [
        ["xt", "5+ln(t/(1-t))/1.5"],
        ["ok", "step(xt-1)+step(xt-2)+step(xt-3)+step(xt-5.5)+step(4.5-xt)+step(6-xt)+step(7-xt)+step(8-xt)"],
      ],
      readout: ["predict class 1 when probability > {t}  (feature > {xt:2})  →  {ok} of 8 correct"],
      steps: [["Threshold 0.5: the boundary sits at the middle; one point on each side is wrong.", { t: 0.5 }], ["Threshold 0.2: more points called class 1, so class-0 points are wrongly caught.", { t: 0.2 }], ["Threshold 0.8: fewer called class 1, so class-1 points are missed.", { t: 0.8 }]],
    }, [
      curve("sigmoid(1.5*(x-5))", { c: "accent" }),
      hline("t", { c: "muted", dash: true }),
      vline("xt", { c: "bad", label: "boundary" }),
      ...logPts0.flatMap((x) => [pt(String(x), "0", { c: "good", show: `xt-${x}` }), pt(String(x), "0", { c: "bad", show: `${x}-xt` })]),
      ...logPts1.flatMap((x) => [pt(String(x), "1", { c: "good", show: `${x}-xt` }), pt(String(x), "1", { c: "bad", show: `xt-${x}` })]),
    ]),
  },
  {
    t: "predict versus predict_proba",
    lv: 1,
    s: `{{predict}} returns the chosen class labels; {{predict_proba}} returns a probability for each class, one column per class in the order of {{clf.classes_}}, and each row sums to 1. Use probabilities when the cost of mistakes differs: apply your own threshold ({{proba[:, 1] > 0.3}}) instead of the default 0.5, or rank cases from most to least likely.`,
    r: `A fraud team may review every case above 20% probability; the default 50% cut-off would miss most of them.`,
    i: `When would you use predict_proba instead of predict?`,
    c: py`
from sklearn.linear_model import LogisticRegression

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 0, 1, 1, 1]
clf = LogisticRegression().fit(X, y)
print(clf.classes_.tolist())
print(clf.predict_proba([[3.5]]).round(1).tolist())
print(bool((clf.predict(X) == (clf.predict_proba(X)[:, 1] > 0.5)).all()))`,
    o: `[0, 1]
[[0.5, 0.5]]
True`,
    v: compare("Two ways to ask the same model.", ["predict", "predict_proba"], [
      ["Returns", "one class label per row", "one probability per class per row"],
      ["Shape for 2 rows, 2 classes", "(2,)", "(2, 2) — each row sums to 1"],
      ["Threshold", "fixed at 0.5", "you choose it"],
      ["Use for", "final decisions", "ranking, thresholds, calibration checks"],
    ]),
  },
  {
    t: "K-nearest neighbours",
    lv: 1,
    s: `{{KNeighborsClassifier(n_neighbors=k)}} has no real training: it stores the examples and, for a new point, finds the {{k}} closest ones and takes a majority vote. Small k follows every point, noise included; large k smooths. Here one noisy class-1 point sits among class-0 points: at k = 1 it carves out its own island, at k = 3 and 5 the vote ignores it. Drag k.`,
    r: `Simple and strong on small data, but slow on large data and very sensitive to feature scale.`,
    i: `What happens to a KNN model when k is 1, and when k equals the whole dataset?`,
    c: py`
from sklearn.neighbors import KNeighborsClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print(knn.predict([[4], [9]]).tolist())
print(knn.kneighbors([[4]], return_distance=False).tolist())`,
    o: `[0, 1]
[[2, 1, 0]]`,
    v: plot("Strip at the bottom: the class KNN would predict at each position (green = 0, orange = 1).", {
      x: [0, 13], y: [0, 1], labels: ["feature", ""],
      params: [par("k", "k (neighbours)", 1, 5, 2, 3)],
      readout: ["k = {k}: each point is classified by the majority of its {k} nearest training points"],
      steps: [["k = 1: the noisy point at 2.6 creates a small orange island.", { k: 1 }], ["k = 3: the island disappears.", { k: 3 }], ["k = 5: a smooth boundary between the groups.", { k: 5 }]],
    }, [
      ...[1, 3, 5].flatMap((k) => knnRegions(k).map(([a, b, c]) => area("0.12", a.toFixed(2), b.toFixed(2), { c: c ? "warn" : "good", show: `0.5-abs(k-${k})` }))),
      ...knnTrain.map(([x, c]) => pt(String(x), c ? "0.6" : "0.4", { c: c ? "warn" : "good", ...(x === 2.6 ? { label: "noisy" } : {}) })),
    ]),
  },
  {
    t: "KNN needs scaled features",
    lv: 2,
    s: `KNN and other distance-based models compare rows with a straight-line distance. If one feature is in dollars and another in years, the dollars decide everything. Take two people 10 years apart in age and $5,000 apart in income: unscaled, income accounts for essentially all of the distance. Divide income so both differences are comparable and age counts again. Drag the divisor.`,
    r: `Put a StandardScaler in front of KNN, SVM and logistic regression — in a Pipeline so it is fitted on training data only.`,
    i: `Why can an unscaled income column ruin a KNN model?`,
    c: py`
import numpy as np

a = np.array([30.0, 60000.0])
b = np.array([40.0, 60500.0])
c = np.array([31.0, 90000.0])
print(round(float(np.linalg.norm(a - b)), 1), round(float(np.linalg.norm(a - c)), 1))`,
    o: `500.1 30000.0`,
    v: bars("Share of the squared distance contributed by each feature (age gap 10, income gap 5000).", [["age", "100/(100+(5000/s)^2)"], ["income", "(5000/s)^2/(100+(5000/s)^2)"]], {
      percent: true,
      params: [par("s", "income divided by", 1, 5000, 1, 1)],
      readout: ["income gap after dividing: {5000/s:1}  ·  age gap: 10"],
      steps: [["Unscaled: income is ~100% of the distance; age is ignored.", { s: 1 }], ["Divide income by 100: age starts to matter.", { s: 100 }], ["Divide by 500: income gap becomes 10, the same as age — an even 50/50.", { s: 500 }]],
    }),
  },
  {
    t: "Decision trees: a flowchart of questions",
    lv: 1,
    s: `A {{DecisionTreeClassifier}} learns a series of yes/no questions about single features, choosing at each step the split that makes the groups purest. Prediction just follows the questions down to a leaf. In the example data (1, 2, 3 are class 0; 10, 11, 12 class 1) one question — "is x ≤ 6.5?", the midpoint between 3 and 10 — separates everything, so the tree has depth 1. Trees need no scaling and are easy to read, but a deep tree memorises.`,
    r: `Trees handle mixed feature types and interactions and are the building block of forests and boosting.`,
    i: `How does a decision tree choose where to split?`,
    c: py`
from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(tree.get_depth(), tree.tree_.threshold[0])
print(tree.predict([[5], [8]]).tolist())`,
    o: `1 6.5
[0, 1]`,
    v: flow("Prediction is a walk down the questions to a leaf (an illustrative loan tree).", "row",
      ["income ≤ 40k?|root question|i", "credit score ≥ 650?|second question|i", "approve|leaf: class 1|g", "decline|leaf: class 0|b"],
      [[0, 1, "no"], [1, 2, "yes"], [0, 3, "yes"], [1, 3, "no"]], [0, 1, 2],
      ["Start at the root: one feature, one threshold.", "Higher income leads to a second question.", "Good credit score: the leaf says approve."]),
  },
  {
    t: "Tree depth controls overfitting",
    lv: 2,
    s: `An unlimited tree keeps splitting until every training row is classified correctly — including noise — so its training score is 1.0 but its score on new data drops. {{max_depth}}, {{min_samples_leaf}} and {{min_samples_split}} limit growth. On the six points below (the labels have one noisy case) a depth-1 tree gets 5 of 6 right; an unlimited tree gets all 6 by building extra questions for the noise.`,
    r: `Tune max_depth with cross-validation; compare train and test scores to see overfitting directly.`,
    i: `Which tree parameters would you tune to reduce overfitting?`,
    c: py`
from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 1, 0, 1, 1]
shallow = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)
deep = DecisionTreeClassifier(random_state=0).fit(X, y)
print(round(shallow.score(X, y), 2), deep.score(X, y))`,
    o: `0.83 1.0`,
    v: compare("Training accuracy is not the goal.", ["max_depth=1", "no limit"], [
      ["Questions asked", "one", "as many as needed to isolate every point"],
      ["Training accuracy", "0.83", "1.0"],
      ["Treats the noisy point as", "noise", "a rule to memorise"],
      ["On new data", "usually steadier", "usually worse (high variance)"],
    ], 0),
  },
  {
    t: "Random forests: many trees vote",
    lv: 2,
    s: `A {{RandomForestClassifier}} trains many trees, each on a random resample of the rows (and random subsets of features), and combines them by voting. Individual trees overfit in different ways, so their mistakes cancel out. More trees ({{n_estimators}}) rarely hurts. {{feature_importances_}} reports how much each feature helped, summing to 1.`,
    r: `A forest is the usual strong default for tabular data — little tuning, no scaling, resists overfitting.`,
    i: `Why does averaging many overfit trees give a better model than one tree?`,
    c: py`
from sklearn.ensemble import RandomForestClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
rf = RandomForestClassifier(n_estimators=10, random_state=0).fit(X, y)
print(len(rf.estimators_))
print(rf.predict([[4], [9]]).tolist())
print(round(float(rf.feature_importances_.sum()), 2))`,
    o: `10
[0, 1]
1.0`,
    v: cells("Five trees vote on one new case; the majority wins and a single wrong tree is outvoted.", [L("tree votes", ["1", "1", "0", "1", "1"], "pos")], [
      ["Each tree has seen different rows, so each can disagree."],
      ["Four trees say class 1…", [[0, 0, 1], [0, 3, 4]]],
      ["…one tree says class 0 (it overfit to something unusual).", [[0, 2, 2]]],
      ["Majority vote: the forest predicts class 1 — 4 of 5.", [[0, 0, 4]]],
    ]),
  },
];
