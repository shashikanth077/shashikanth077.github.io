import { arrow, bars, cells, compare, curve, flow, par, plot, pt, seg, area } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { eqX, table } from "./data.js";

/* ------------------------------------------------------------------ */
export const prep: ConceptDef[] = [
  {
    t: "A trustworthy table: the preparation checklist",
    lv: 1,
    s: `Cleaning is a modelling decision, not tidying. Before training: define {{X}} and {{y}}, find missing values and duplicates, split off a test set, then fit every preparation step (fill values, encoders, scalers) on the training rows only and apply it to the rest. Typical problems: a missing number (fill with a median learned from training data), duplicate emails from one thread (group them before splitting), mixed units (cents versus euros), fields not known at prediction time, and label errors.`,
    r: `The fill value must come from the training rows. Recomputing it on the test set leaks information.`,
    i: `Name five data problems you check for before training a model.`,
    c: py`
import numpy as np

x = np.array([1, 2, 2, 7])
median = np.median(x)
new = np.array([np.nan, 5])
print(median)
print(np.where(np.isnan(new), median, new).tolist())`,
    v: compare("Problem → typical action.", ["Example", "Action"], [
      ["Missing number", "link count is absent", "fill with a median fitted on training rows; maybe add a 'was missing' flag"],
      ["Missing category", "sender type unknown", "use an explicit Unknown value"],
      ["Duplicates", "one thread appears 50 times", "group related rows before splitting"],
      ["Bad units", "cents mixed with euros", "convert using verified units"],
      ["Future information", "'resolved as spam' used to predict spam", "remove fields unavailable at prediction time"],
      ["Label errors", "two annotators disagree", "write labelling rules, review hard cases"],
    ]),
  },
  {
    t: "Encoding: label, ordinal and one-hot",
    lv: 1,
    s: `Names and ordered quantities are different. If you code Friend = 0, Shop = 1, Unknown = 2, a distance-based model thinks Friend is closer to Shop than to Unknown — an order you invented. {{One-hot}} encoding gives each category its own 0/1 column, so every pair is equally far apart. Use an {{ordinal}} code only for a genuinely ordered level (low, medium, high), remembering that equal gaps are an assumption. Target labels (Normal / Spam) may be coded 0/1; those numbers name classes and are not distances.`,
    r: `Fit the encoder on the training rows and decide what happens with an unseen category — ignore it (all zeros) or raise an error.`,
    i: `Why is coding categories 0, 1, 2 dangerous for kNN?`,
    c: py`
import numpy as np

codes = {"Friend": 0, "Shop": 1, "Unknown": 2}
print(abs(codes["Friend"] - codes["Shop"]), abs(codes["Friend"] - codes["Unknown"]))
one_hot = np.eye(3)
d = lambda a, b: round(float(np.linalg.norm(one_hot[a] - one_hot[b])), 3)
print(d(0, 1), d(0, 2))`,
    v: cells("The same categories as integer codes (false order) and as one-hot rows (all equally different).", table(["sender", "code", "one-hot [Friend, Shop, Unknown]"], [["Friend", "0", "[1, 0, 0]"], ["Shop", "1", "[0, 1, 0]"], ["Unknown", "2", "[0, 0, 1]"]]), [
      ["Three sender types."],
      ["Integer codes: |Friend − Shop| = 1 but |Friend − Unknown| = 2 — an invented ranking.", [[1, 1, 1], [2, 1, 1], [3, 1, 1]]],
      ["One-hot: every pair is √2 ≈ 1.414 apart — no ranking.", [[1, 2, 2], [2, 2, 2], [3, 2, 2]]],
    ]),
  },
  {
    t: "Min–max normalisation",
    lv: 1,
    s: `Min–max scaling squeezes a feature into a fixed range: {{x′ = (x − min) / (max − min)}} gives 0 to 1. To reach any range [a, b] use {{x′ = a + (x − min)(b − a) / (max − min)}}. With training min 2 and max 10, the value 6 becomes (6 − 2)/(10 − 2) = 0.5, or 0 on [−1, 1]. Take min and max from the TRAINING data; later values outside that range will fall outside [0, 1]. A constant feature (max = min) would divide by zero and must be handled.`,
    r: `Exam shortcut: normalise 30 from [10, 50] into [0, 100]: 0 + (30 − 10) × 100 / 40 = 50. Always show the formula, substitute, calculate, then say what it means.`,
    i: `Normalise x = 30, min = 10, max = 50 into [−1, 1].`,
    c: py`
x, lo, hi = 6, 2, 10
print((x - lo) / (hi - lo))
a, b = -1, 1
print(a + (x - lo) * (b - a) / (hi - lo))
print(0 + (30 - 10) * 100 / (50 - 10))`,
    v: plot("The training range 2 to 10 is stretched onto 0 to 1. Drag x.", {
      x: [0, 12], y: [-0.2, 1.2], labels: ["original x", "scaled x′"],
      params: [par("x", "x", 0, 12, 0.5, 6)],
      readout: ["x′ = ({x} − 2) / (10 − 2) = {(x-2)/8:3}   (outside the training range gives values below 0 or above 1)"],
      steps: [["x = 6, the midpoint, becomes 0.5.", { x: 6 }], ["x = 2 (the minimum) becomes 0; x = 10 becomes 1.", { x: 10 }], ["A new value 12 falls outside the training range: x′ = 1.25.", { x: 12 }]],
    }, [curve("(x-2)/8", { c: "accent", from: "2", to: "10" }), curve("(x-2)/8", { c: "muted", dash: true }), pt("x", "(x-2)/8", { c: "bad", label: "{(x-2)/8:2}" })]),
  },
  {
    t: "Standardisation: the z-score",
    lv: 1,
    s: `{{z = (x − μ) / σ}} re-expresses a value as the number of standard deviations from the mean. If the training mean is 4 and σ = 2, then x = 6 gives z = 1. Standardised data has mean 0 and spread 1, but z is not clipped: values can be negative or larger than 1. It is the usual choice for distance- and gradient-based models. Drag z along the bell curve.`,
    r: `Income € 30,000 (mean 20,000, σ 10,000) and orders 6 (mean 4, σ 2) both have z = 1: each is one standard deviation above its mean, so they now count equally.`,
    i: `What does z = −2 mean?`,
    c: py`
import numpy as np

print((6 - 4) / 2)
x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
z = (x - x.mean()) / x.std()
print(x.mean(), x.std(), z[-1], round(float(z.mean()), 6))`,
    v: plot("A bell curve of standardised values; the shaded part is everything below z.", {
      x: [-4, 4], y: [0, 0.5], labels: ["z", "density"],
      params: [par("z", "z", -3, 3, 0.25, 1)],
      readout: ["z = {z}: the value is {z} standard deviation(s) from the mean; density {norm(z,0,1):3}"],
      steps: [["z = 0: exactly the mean.", { z: 0 }], ["z = 1: one standard deviation above (x = 6 when mean = 4, σ = 2).", { z: 1 }], ["z = −2: two standard deviations below — unusual.", { z: -2 }]],
    }, [curve("norm(x,0,1)", { c: "accent" }), area("norm(x,0,1)", "-4", "z", { c: "info" }), pt("z", "norm(z,0,1)", { c: "bad" })]),
  },
  {
    t: "Which models need scaling?",
    lv: 1,
    s: `Scaling matters when a model compares feature values or uses gradients. {{kNN}}, {{SVM}}, {{k-means}}, {{PCA}} and {{neural networks}} are sensitive to scale; {{decision trees}}, forests and boosted trees are not, because they ask one-feature questions and any monotonic rescaling keeps the same order. {{Naive Bayes}} on counts should not be z-scored (it needs non-negative values). When unsure, put the scaler inside a pipeline so it is learned from training folds only.`,
    r: `Scale after the split, with parameters learned from training data. A constant column needs special handling.`,
    i: `Why don't decision trees need feature scaling?`,
    v: compare("Does the model look at distances or gradients?", ["Scaling needed?", "Why"], [
      ["kNN", "yes", "distances between rows"],
      ["SVM (RBF)", "yes", "kernel is distance-based"],
      ["k-means / DBSCAN", "yes", "distance to centres / neighbours"],
      ["PCA", "yes (usually standardise)", "variance depends on units"],
      ["Neural network", "yes", "gradient descent converges faster and fairly"],
      ["Decision tree / forest / boosting", "no", "splits depend only on the order of values"],
    ]),
  },
  {
    t: "Imbalanced data: choosing a remedy",
    lv: 1,
    s: `When one class is rare, accuracy is dominated by the majority and a lazy model looks great. First choose the evaluation goal (rare-class recall? precision?) and compare with the trivial baseline. Then remedies: collect more real minority examples, use {{class weights}} (errors on the rare class cost more), randomly {{oversample}} the minority or {{undersample}} the majority, generate synthetic points with {{SMOTE}}, or move the decision {{threshold}}. None creates information from nothing.`,
    r: `Apply resampling INSIDE each training fold and never to validation or test rows.`,
    i: `Name four ways to deal with imbalanced classes and one risk of each.`,
    c: py`
import numpy as np

y = np.array([0] * 95 + [1] * 5)
counts = np.bincount(y)
weights = len(y) / (len(counts) * counts)
print(counts.tolist(), weights.round(3).tolist())`,
    v: compare("Each option helps in a different way, and each has a catch.", ["How it helps", "What it does not guarantee"], [
      ["More labelled minority examples", "adds genuine coverage", "labels and examples can still be biased"],
      ["Class weights", "errors on the rare class cost more", "does not create new information"],
      ["Random oversampling", "repeats minority rows", "can overfit the repeated records"],
      ["Undersampling", "drops majority rows", "can remove useful examples"],
      ["SMOTE", "interpolates new minority points", "synthetic points may overlap the other class"],
      ["Threshold tuning", "changes the decision rule", "does not improve the underlying ranking"],
    ]),
  },
  {
    t: "SMOTE: a point between two minority neighbours",
    lv: 2,
    s: `SMOTE creates a synthetic minority example by interpolation: pick a minority point A and a nearby minority neighbour B, then {{x_new = A + λ(B − A)}} with 0 ≤ λ ≤ 1. For A = (1, 2), B = (5, 6): B − A = (4, 4); with λ = 0.25 the new point is (1, 2) + 0.25 × (4, 4) = (2, 3). Drag λ: the new point slides along the line from A to B.`,
    r: `Do it only on the training fold. Vanilla SMOTE can create impossible fractional category values, and a synthetic text vector is not a readable message.`,
    i: `Given A = (2, 4), B = (6, 8) and λ = 0.5, what point does SMOTE create?`,
    c: py`
import numpy as np

A = np.array([1.0, 2.0])
B = np.array([5.0, 6.0])
print((B - A).tolist(), (A + 0.25 * (B - A)).tolist())
A2, B2 = np.array([2, 4]), np.array([6, 8])
print((A2 + 0.5 * (B2 - A2)).tolist())`,
    v: plot("The synthetic point always lies on the segment between A and B.", {
      x: eqX(0, 8, 3), y: [0, 8], labels: ["feature 1", "feature 2"],
      params: [par("l", "fraction λ", 0, 1, 0.05, 0.25)],
      readout: ["new point = A + {l}(B − A) = ({1+4*l:2}, {2+4*l:2})"],
      steps: [["λ = 0.25 → (2, 3).", { l: 0.25 }], ["λ = 0.5 → the midpoint (3, 4).", { l: 0.5 }], ["λ = 1 lands on B itself.", { l: 1 }]],
    }, [seg("1", "2", "5", "6", { c: "muted", dash: true }), pt("1", "2", { c: "info", label: "A" }), pt("5", "6", { c: "info", label: "B" }), pt("1+4*l", "2+4*l", { c: "bad", label: "new" })]),
  },
  {
    t: "Outliers: investigate before deleting",
    lv: 1,
    s: `An outlier is an unusually distant observation. It can be a data error (€120,000 typed instead of €12,000), a rare but genuine customer (a business account among households), or an important event (fraud, a promotion). Deleting automatically can throw away the cases you most want to understand. Flag it, look at the original record, compare with domain rules, then correct, cap ({{clip}}), transform (for example {{log}}), keep or model it separately — and document the decision.`,
    r: `A cap or log transform reduces the pull of extreme values on means and on distance-based models without losing the row.`,
    i: `You find a customer spending 10 times the average. What do you do?`,
    c: py`
import numpy as np

spend = np.array([2400, 2800, 2600, 12000, 11000, 120000])
q1, q3 = np.percentile(spend, [25, 75])
cap = q3 + 1.5 * (q3 - q1)
print(spend[spend > cap].tolist(), cap)
print(np.clip(spend, None, cap).max(), round(float(np.log10(spend.max())), 2))`,
    v: flow("A safe workflow keeps the decision traceable.", "row",
      ["Flag|IQR rule, z-score|w", "Inspect|look at the original record|i", "Check rules|domain knowledge|i", "Decide|correct · cap · transform · keep · separate|g", "Document|why, and what changed|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["Read the source row — typo, test account, or real?", "Compare with business rules and units.", "Choose the least destructive fix.", "Record the decision so it can be reviewed."]),
  },
  {
    t: "Preprocessing leakage: fit on training only",
    lv: 2,
    s: `Every learned preparation step (fill value, encoder categories, scaler mean and std, SMOTE neighbours, selected features) must be fitted on the training rows and only APPLIED to validation and test rows. If you fit a scaler on all rows, the test data influences the numbers used to prepare the training data: scores look better than reality. Inside cross-validation this means the whole preparation lives inside each fold.`,
    r: `Pipelines exist to make this mistake impossible. Fitting a scaler before cross-validation is a classic bug.`,
    i: `Why is it wrong to scale the whole dataset before splitting?`,
    c: py`
import numpy as np

train = np.array([10.0, 20.0, 30.0, 40.0])
test = np.array([25.0, 50.0])
print(((test - train.mean()) / train.std()).round(2).tolist())
both = np.concatenate([train, test])
print(((test - both.mean()) / both.std()).round(2).tolist())`,
    v: compare("The same test values, scaled two ways.", ["Correct (train statistics)", "Leaky (all rows)"], [
      ["Mean and std come from", "training rows only", "training + test rows"],
      ["Test value 25 becomes", "0.0", "−0.32"],
      ["Test value 50 becomes", "2.24", "1.6"],
      ["Test score is", "an honest estimate", "optimistic"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const distance: ConceptDef[] = [
  {
    t: "Euclidean distance: straight-line similarity",
    lv: 1,
    s: `Clustering and nearest-neighbour methods need a definition of "near". The straight-line (Euclidean) distance between P and Q is {{d = √[(x_Q − x_P)² + (y_Q − y_P)²]}}. For A = (2, 3) and B = (5, 7): √(3² + 4²) = √25 = 5. Comparing squared distances picks the same nearest point and avoids the square root. Drag Q: the straight line is the Euclidean distance; the dashed corner path is the Manhattan distance.`,
    r: `Distance only means something if the features are on comparable scales and measure what you care about. Never use raw ID numbers as coordinates.`,
    i: `Compute the Euclidean distance between (2, 3) and (5, 7).`,
    c: py`
import numpy as np

pts = {"A": (1, 1), "B": (1, 2), "C": (2, 1), "D": (8, 8)}
euclid = lambda p, q: float(np.hypot(p[0] - q[0], p[1] - q[1]))
print(round(euclid(pts["A"], pts["B"]), 3), round(euclid(pts["B"], pts["C"]), 3), round(euclid(pts["A"], pts["D"]), 3))
print(euclid((2, 3), (5, 7)))`,
    v: plot("Fixed point P = (2, 3) and a movable point Q.", {
      x: eqX(0, 10, 5), y: [0, 10], labels: ["feature 1", "feature 2"],
      params: [par("qx", "Q x", 0, 10, 0.5, 5), par("qy", "Q y", 0, 10, 0.5, 7)],
      readout: ["Euclidean = √(({qx}−2)² + ({qy}−3)²) = {sqrt((qx-2)^2+(qy-3)^2):2}   ·   Manhattan = {abs(qx-2)+abs(qy-3):2}"],
      steps: [["Q = (5, 7): Euclidean 5 (the 3-4-5 triangle), Manhattan 7.", { qx: 5, qy: 7 }], ["Q on the same row: both distances equal 4.", { qx: 6, qy: 3 }], ["Q = (9, 9): offsets 7 and 6 → Euclidean 9.2, Manhattan 13.", { qx: 9, qy: 9 }]],
    }, [seg("2", "3", "qx", "qy", { c: "accent" }), seg("2", "3", "qx", "3", { c: "warn", dash: true }), seg("qx", "3", "qx", "qy", { c: "warn", dash: true }), pt("2", "3", { c: "info", label: "P" }), pt("qx", "qy", { c: "bad", label: "Q" })]),
  },
  {
    t: "Manhattan, Minkowski, Chebyshev and Hamming",
    lv: 2,
    s: `Different questions need different distances. {{Manhattan}} adds the absolute coordinate differences — like walking a street grid. {{Chebyshev}} takes the largest single difference. {{Minkowski}} with power p generalises them (p = 1 Manhattan, p = 2 Euclidean). {{Hamming}} counts mismatching positions and suits categories and strings. {{Cosine}} compares direction rather than size (next lesson). Choose the distance that matches how "similar" is defined in your problem.`,
    r: `Manhattan gives large single-feature gaps less influence than Euclidean, which squares them.`,
    i: `Which distance would you use for two binary strings, and why?`,
    c: py`
import numpy as np

p, q = np.array([1, 2]), np.array([4, 6])
print(float(np.sqrt(((p - q) ** 2).sum())), int(np.abs(p - q).sum()), int(np.abs(p - q).max()))
a, b = "karolin", "kathrin"
print(sum(x != y for x, y in zip(a, b)))`,
    v: compare("Distance between (1, 2) and (4, 6), and when to use each metric.", ["Value", "Use when"], [
      ["Euclidean", "5", "comparable numeric features, round clusters"],
      ["Manhattan", "|3| + |4| = 7", "grid-like movement, outliers should count less"],
      ["Chebyshev", "max(3, 4) = 4", "the worst single feature decides"],
      ["Hamming", "mismatches / positions", "categories, codes, strings"],
      ["Cosine", "angle between vectors", "text vectors, embeddings"],
    ]),
  },
  {
    t: "Cosine similarity: direction, not size",
    lv: 1,
    s: `{{cos(x, y) = (x · y) / (‖x‖ ‖y‖)}} compares the DIRECTION of two vectors and ignores their length. For x = (1, 0) and y = (0.8, 0.6) both have length 1, so the cosine is 1×0.8 + 0×0.6 = 0.8 and the cosine distance (1 − cos) is 0.2. Doubling a vector does not change it. It is ideal for text vectors, where a long document and a short one on the same topic point the same way. Drag the angle and length of the second vector.`,
    r: `A zero vector has no direction and must be handled separately. Similar direction does not guarantee the same meaning: "not" can flip a message.`,
    i: `Why is cosine similarity preferred for comparing documents of different lengths?`,
    c: py`
import numpy as np

x, y = np.array([1.0, 0.0]), np.array([0.8, 0.6])
cos = float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))
print(round(cos, 3), round(1 - cos, 3))
y2 = 3 * y
print(round(float(x @ y2 / (np.linalg.norm(x) * np.linalg.norm(y2))), 3), round(float(np.linalg.norm(x - y2)), 3))`,
    v: plot("Vector a points right. Rotate vector b with the angle; changing its length never changes the cosine.", {
      x: eqX(-3.5, 3.5, 0), y: [-3.5, 3.5], labels: ["", ""],
      params: [par("th", "angle of b (degrees)", 0, 180, 5, 37), par("r", "length of b", 0.5, 1.5, 0.25, 1)],
      readout: ["cosine = cos({th}°) = {cos(th*pi/180):3}   ·   cosine distance = {1-cos(th*pi/180):3}   (length {r} does not matter)"],
      steps: [["37° (the example y = (0.8, 0.6)): cosine 0.8.", { th: 37, r: 1 }], ["Make b 1.5 times longer: the cosine is unchanged.", { th: 37, r: 1.5 }], ["90°: unrelated (cosine 0). 180°: opposite (−1).", { th: 90, r: 1 }]],
    }, [arrow("0", "0", "2", "0", { c: "info", label: "a" }), arrow("0", "0", "2*r*cos(th*pi/180)", "2*r*sin(th*pi/180)", { c: "bad", label: "b" })]),
  },
  {
    t: "Why scaling changes what \"near\" means",
    lv: 1,
    s: `Suppose two customers differ by € 10,000 in income and by 2 in weekly orders. Unscaled, the squared distance is 100,000,000 + 4: income is 99.999996% of it and orders are ignored. Divide income by a scale (or standardise both features) and the balance changes. Choose the transformation on purpose: scaling changes the meaning of distance, it does not guarantee a better answer. Do NOT standardise coordinates that already share one physical unit, such as a map in kilometres.`,
    r: `For a latitude / longitude over large areas use a geographic distance or a map projection, not raw degrees.`,
    i: `Why can one feature dominate a Euclidean distance?`,
    c: py`
import numpy as np

gap = np.array([10000.0, 2.0])
print(round(float((gap ** 2)[0] / (gap ** 2).sum()), 8))
scaled = gap / np.array([5000.0, 1.0])
print(scaled.tolist(), round(float((scaled ** 2)[0] / (scaled ** 2).sum()), 2))`,
    v: bars("Share of the squared distance contributed by each feature (income gap 10,000; orders gap 2).", [["income", "(10000/s)^2/((10000/s)^2+4)"], ["orders", "4/((10000/s)^2+4)"]], {
      percent: true,
      params: [par("s", "income divided by", 1, 10000, 1, 1)],
      readout: ["income gap after dividing: {10000/s:1}   ·   orders gap: 2"],
      steps: [["Unscaled: income decides everything.", { s: 1 }], ["Divide income by 2,000: orders start to count.", { s: 2000 }], ["Divide by 5,000: both gaps equal 2 — a 50/50 balance.", { s: 5000 }]],
    }),
  },
];
