import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

/* Twelve digit-five scores: 6 real fives and 6 others (threshold lab). */
const POS = [0.95, 0.88, 0.75, 0.6, 0.4, 0.3];
const NEG = [0.55, 0.35, 0.2, 0.12, 0.08, 0.05];

export const metrics: ConceptDef[] = [
  {
    t: "The confusion matrix: four possible outcomes",
    lv: 1,
    s: `Every prediction has an actual label and a predicted label. With spam as the positive class: {{TP}} spam caught, {{FN}} spam missed (let into the inbox), {{FP}} normal mail wrongly flagged, {{TN}} normal mail kept. "True/false" says whether the prediction was right; "positive/negative" says what was predicted. Eight toy emails: A,E,G are spam caught (TP=3); B,F,H normal kept (TN=3); C spam missed (FN=1); D normal flagged (FP=1). Check the axes: this guide uses rows = actual, columns = predicted; scikit-learn's [0,1] order shows [[TN,FP],[FN,TP]].`,
    r: `Always state which class is "positive" before quoting any metric.`,
    i: `Six of eight emails were classified correctly. List TP, TN, FP and FN for the toy emails.`,
    c: py`
import numpy as np

actual = np.array([1, 0, 1, 0, 1, 0, 1, 0])
pred   = np.array([1, 0, 0, 1, 1, 0, 1, 0])
tp = int(((actual == 1) & (pred == 1)).sum())
tn = int(((actual == 0) & (pred == 0)).sum())
fp = int(((actual == 0) & (pred == 1)).sum())
fn = int(((actual == 1) & (pred == 0)).sum())
print(tp, tn, fp, fn, tp + tn + fp + fn)`,
    v: cells("Rows = actual class, columns = predicted class.", table(["", "predicted spam", "predicted normal"], [["actual spam", "TP = 3", "FN = 1"], ["actual normal", "FP = 1", "TN = 3"]]), [
      ["Four cells: correct alarms, missed spam, false alarms, correct silence."],
      ["TP = 3: emails A, E, G were spam and flagged.", [[1, 1, 1]]],
      ["FN = 1: email C was spam but let through.", [[1, 2, 2]]],
      ["FP = 1: email D was normal but flagged.", [[2, 1, 1]]],
      ["TN = 3: B, F, H were normal and kept.", [[2, 2, 2]]],
    ]),
  },
  {
    t: "Accuracy, and when it lies",
    lv: 1,
    s: `{{Accuracy = (TP + TN) / (TP + TN + FP + FN)}}. In a 100-email audit (20 spam, 80 normal) with TP=16, FN=4, FP=8, TN=72: accuracy = (16+72)/100 = 88%. The trap: with a rare positive class a useless model scores high. If 9 of 9,999 cases are positive and the model predicts "negative" for everything, accuracy is 9,990/9,999 ≈ 99.91% — yet recall is 0/9 = 0%: it finds none of the cases that matter.`,
    r: `Accuracy hides which class fails. Pair it with precision, recall and a confusion matrix whenever classes are imbalanced.`,
    i: `A model predicts "negative" for all 9,999 cases of which 9 are positive. Accuracy and recall?`,
    c: py`
tp, fn, fp, tn = 16, 4, 8, 72
print((tp + tn) / (tp + tn + fp + fn))
tp, fn, fp, tn = 0, 9, 0, 9990
print(round((tp + tn) / (tp + tn + fp + fn), 4), tp / (tp + fn))`,
    v: bars("Same model, two datasets: accuracy looks great on rare positives while recall collapses.", [["accuracy", "(tp+tn)/(tp+tn+fp+fn)"], ["recall", "tp/(tp+fn)"]], {
      max: 1,
      params: [par("tp", "TP", 0, 20, 1, 0), par("fn", "FN", 0, 20, 1, 9), par("fp", "FP", 0, 20, 1, 0), par("tn", "TN", 0, 9990, 10, 9990)],
      readout: ["accuracy = {(tp+tn)/(tp+tn+fp+fn):3}   recall = {tp/(tp+fn):3}"],
      steps: [["Always-negative model on rare positives.", { tp: 0, fn: 9, fp: 0, tn: 9990 }], ["A model that actually finds most positives.", { tp: 8, fn: 1, fp: 3, tn: 9980 }]],
    }),
  },
  {
    t: "Precision, recall and specificity",
    lv: 1,
    s: `Different denominators answer different questions. {{Precision = TP/(TP+FP)}}: of everything flagged, how much was right? {{Recall (sensitivity) = TP/(TP+FN)}}: of all real positives, how many did we find? {{Specificity = TN/(TN+FP)}}; {{false-positive rate = FP/(FP+TN) = 1 − specificity}}. The 100-email audit (TP=16, FP=8, FN=4, TN=72): precision = 16/24 = 0.667, recall = 16/20 = 0.80, specificity = 72/80 = 0.90, FPR = 0.10. FPR is NOT 1 − precision: it divides by all real negatives, not all predicted positives. If TP+FP = 0, precision is undefined.`,
    r: `High recall suits fraud and safety screens where a miss is expensive; high precision suits cases where a false alarm is costly.`,
    i: `From TP=16, FP=8, FN=4, TN=72 compute precision, recall, specificity and FPR.`,
    c: py`
tp, fp, fn, tn = 16, 8, 4, 72
precision = tp / (tp + fp)
recall = tp / (tp + fn)
specificity = tn / (tn + fp)
print(round(precision, 4), recall, specificity, round(1 - specificity, 2))`,
    v: bars("Precision, recall, specificity and F1 from the chosen counts.", [["precision", "tp/(tp+fp+0.0000001)"], ["recall", "tp/(tp+fn+0.0000001)"], ["specificity", "tn/(tn+fp+0.0000001)"], ["F1", "2*tp/(2*tp+fp+fn+0.0000001)"]], {
      max: 1,
      params: [par("tp", "TP", 0, 40, 1, 16), par("fp", "FP", 0, 40, 1, 8), par("fn", "FN", 0, 40, 1, 4), par("tn", "TN", 0, 100, 1, 72)],
      readout: ["precision {tp}/{tp+fp} · recall {tp}/{tp+fn} · specificity {tn}/{tn+fp}"],
      steps: [["The 100-email audit.", { tp: 16, fp: 8, fn: 4, tn: 72 }], ["More false alarms: precision drops, recall unchanged.", { tp: 16, fp: 30, fn: 4, tn: 50 }]],
    }),
  },
  {
    t: "F1: the harmonic mean of precision and recall",
    lv: 2,
    s: `{{F1 = 2PR/(P+R) = 2TP/(2TP + FP + FN)}}. With P = 2/3 and R = 4/5: 2 × (8/15) / (22/15) = 16/22 = 8/11 ≈ 0.7273; the count formula gives 32/(32+8+4) = 0.7273. Why not the plain average? With P = 1 and R = 0.1 the average is 0.55 but F1 ≈ 0.18: the harmonic mean stays near the smaller value, so one good score cannot hide a bad one. F1 ignores TN and treats both error types as equally costly, so it is a summary, not the whole story.`,
    r: `If 2TP + FP + FN = 0 the count formula is undefined; libraries apply a chosen zero-division policy.`,
    i: `Why does F1 use a harmonic rather than an arithmetic mean?`,
    c: py`
p, r = 2 / 3, 4 / 5
print(round(2 * p * r / (p + r), 4), round(32 / 44, 4))
p, r = 1.0, 0.1
print((p + r) / 2, round(2 * p * r / (p + r), 4))`,
    v: plot("F1 against recall for a fixed precision: it sits far below the arithmetic average when the two disagree.", {
      x: [0, 1], y: [0, 1], labels: ["recall", "score"],
      params: [par("p", "precision", 0.05, 1, 0.05, 1)],
      readout: ["at recall 0.1 → average {(p+0.1)/2:3}, F1 {2*p*0.1/(p+0.1):3}"],
      steps: [["Precision 1.0: F1 climbs slowly with recall.", { p: 1 }], ["Precision 0.2: F1 is capped by the weaker score.", { p: 0.2 }]],
    }, [curve("(p+x)/2", { c: "muted", dash: true }), curve("2*p*x/(p+x)", { c: "accent" })]),
  },
  {
    t: "A threshold turns a score into a class",
    lv: 1,
    s: `A model outputs a score; the class comes from a rule: predict positive if score ≥ τ. Lowering τ makes more examples positive: recall cannot fall, false alarms may rise. Raising τ does the opposite. Twelve digit-five scores (six real fives, six others) show it: τ = 0.25 gives TP = 6, FP = 2 (precision 75%, recall 100%); τ = 0.50 gives TP = 4, FP = 1 (80%, 66.7%); τ = 0.70 gives TP = 3, FP = 0 (100%, 50%). Pick τ on validation data and costs, freeze it, then evaluate once on the test set.`,
    r: `The threshold changes the decision, not the model's scores; 0.5 is a default, not a law.`,
    i: `Move τ from 0.25 to 0.70: what happens to precision and recall?`,
    c: py`
import numpy as np

pos = np.array([0.95, 0.88, 0.75, 0.6, 0.4, 0.3])
neg = np.array([0.55, 0.35, 0.2, 0.12, 0.08, 0.05])
for tau in (0.25, 0.5, 0.7):
    tp = int((pos >= tau).sum())
    fp = int((neg >= tau).sum())
    print(tau, tp, fp, round(tp / (tp + fp), 3), round(tp / 6, 3))`,
    v: plot("Number of real fives (green) and others (red) at or above the threshold.", {
      x: [0, 1], y: [0, 7], labels: ["threshold τ", "count at or above τ"],
      params: [par("tau", "threshold τ", 0, 1, 0.01, 0.5)],
      readout: ["τ = {tau}: TP = {" + POS.map((s) => `step(${s}-tau+0.0001)`).join("+") + "}, FP = {" + NEG.map((s) => `step(${s}-tau+0.0001)`).join("+") + "}"],
      steps: [["Lenient τ = 0.25: all fives found, two false alarms.", { tau: 0.25 }], ["τ = 0.50.", { tau: 0.5 }], ["Strict τ = 0.70: no false alarms but half the fives missed.", { tau: 0.7 }]],
    }, [curve(POS.map((s) => `step(${s}-x+0.0001)`).join("+"), { c: "good" }), curve(NEG.map((s) => `step(${s}-x+0.0001)`).join("+"), { c: "bad" }), vline("tau", { c: "accent" })]),
  },
  {
    t: "ROC curve and AUC",
    lv: 2,
    s: `Sweep the threshold from above every score down to below every score. Each τ gives a point (FPR, TPR=recall); joining them is the {{ROC curve}}. A ranking that puts positives above negatives hugs the top-left. {{AUC}} is the area under it — equivalently the probability that a random positive outscores a random negative (ties count ½). Tiny example: scores positive 0.9, negative 0.8, positive 0.7, negative 0.1: 4 pairs; 0.9 beats both negatives (2), 0.7 beats one (1) → AUC = 3/4. 1.0 = perfect ranking, 0.5 = random, below 0.5 = reversed. AUC says nothing about the best threshold or calibration; for rare positives also read precision–recall.`,
    r: `ROC AUC needs both classes present in the evaluated data.`,
    i: `Compute AUC for positives {0.9, 0.7} and negatives {0.8, 0.1}.`,
    c: py`
import numpy as np

pos = np.array([0.9, 0.7])
neg = np.array([0.8, 0.1])
wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
print(wins, wins / (len(pos) * len(neg)))
scores = np.array([0.9, 0.8, 0.7, 0.1])
labels = np.array([1, 0, 1, 0])
for tau in (1.0, 0.85, 0.75, 0.5, 0.05):
    pred = scores >= tau
    print(tau, (pred & (labels == 1)).sum() / 2, (pred & (labels == 0)).sum() / 2)`,
    v: plot("ROC of the four-example ranking; the shaded staircase has area 0.75.", {
      x: [0, 1], y: [0, 1], labels: ["false-positive rate", "true-positive rate"],
    }, [hline("0", { c: "muted" }), seg("0", "0", "1", "1", { c: "muted", dash: true }), seg("0", "0", "0", "0.5", { c: "accent" }), seg("0", "0.5", "0.5", "0.5", { c: "accent" }), seg("0.5", "0.5", "0.5", "1", { c: "accent" }), seg("0.5", "1", "1", "1", { c: "accent" }), pt("0", "0", { c: "warn" }), pt("0", "0.5", { c: "warn" }), pt("0.5", "0.5", { c: "warn" }), pt("0.5", "1", { c: "warn" }), pt("1", "1", { c: "warn" })]),
  },
  {
    t: "Multiclass: confusion matrix, macro, micro and weighted F1",
    lv: 2,
    s: `With ten digits the matrix has ten rows and columns; the diagonal holds correct predictions. A 3-class example (rows actual A,B,C; columns predicted): A [8,1,0], B [2,6,1], C [0,1,7]. Accuracy = (8+6+7)/26 = 80.77%. Treat B as positive and the rest as negative (one-vs-rest): TP=6, FN=2+1=3, FP=1+1=2, TN=15 → precision 75%, recall 66.7%, F1 = 12/17 = 70.59%. Per-class F1: A 84.21%, B 70.59%, C 87.5%. {{Macro F1}} averages them equally (80.77%); {{weighted F1}} weights by support (80.51%); {{micro}} pools all decisions and equals accuracy for single-label problems.`,
    r: `Macro F1 lets a rare class matter as much as a common one; overall accuracy can hide one difficult digit.`,
    i: `From the matrix, compute per-class precision/recall/F1 and the macro F1.`,
    c: py`
import numpy as np

cm = np.array([[8, 1, 0], [2, 6, 1], [0, 1, 7]])
tp = np.diag(cm).astype(float)
precision = tp / cm.sum(axis=0)
recall = tp / cm.sum(axis=1)
f1 = 2 * precision * recall / (precision + recall)
support = cm.sum(axis=1)
print(round(float(tp.sum() / cm.sum()), 4))
print(precision.round(4).tolist(), recall.round(4).tolist(), f1.round(4).tolist())
print(round(float(f1.mean()), 4), round(float((f1 * support).sum() / support.sum()), 4))`,
    v: cells("Actual rows × predicted columns; the diagonal is correct.", table(["actual ↓ / predicted →", "A", "B", "C", "support"], [["A", "8", "1", "0", "9"], ["B", "2", "6", "1", "9"], ["C", "0", "1", "7", "8"]]), [
      ["Correct predictions sit on the diagonal: 8 + 6 + 7 = 21 of 26."],
      ["Row B says: 2 true B's were called A, 6 were right, 1 was called C.", [[2, 1, 4]]],
      ["For class B as positive: TP = 6, FP = 1 + 1 = 2, FN = 2 + 1 = 3.", [[2, 2, 2], [1, 2, 2], [3, 2, 2]]],
    ]),
  },
  {
    t: "Which metric should you use?",
    lv: 1,
    s: `Start from the cost of a miss versus a false alarm. Spam filter: a miss lets spam in, a false alarm hides a useful email → precision and recall, threshold per product need. Fraud alert: missing fraud is costly, but investigators have limited capacity → recall, precision and costs. Digit reader: accuracy, macro F1 and the per-digit confusion matrix. Rare defect detection: recall and precision–recall analysis. There is no universally best metric: state the positive class, class balance, threshold, averaging method and the dataset the score was measured on.`,
    r: `Report enough detail that the number can be reproduced and interpreted.`,
    i: `Which metrics would you emphasise for rare-defect detection, and why not accuracy alone?`,
    c: py`
costs = {"miss": 50.0, "false_alarm": 1.0}
fn, fp = 4, 8
print(fn * costs["miss"] + fp * costs["false_alarm"])
fn, fp = 10, 0
print(fn * costs["miss"] + fp * costs["false_alarm"])`,
    v: compare("Choose the metric from the cost of errors.", ["A miss means…", "A false alarm means…", "Report"], [
      ["Spam filter", "spam in the inbox", "a useful mail hidden", "precision, recall, threshold"],
      ["Fraud alert", "fraud not caught", "a normal payment checked", "recall, precision, cost"],
      ["Digit reader", "a digit misread", "another digit substituted", "accuracy, macro F1, confusion matrix"],
      ["Rare defect", "a faulty item ships", "a good item rejected", "recall, precision–recall"],
    ]),
  },
];

export const mnist: ConceptDef[] = [
  {
    t: "Train, validation and test sets in numbers",
    lv: 1,
    s: `Practice problems (training), a mock exam (validation) and the final exam (test). The optimiser learns from training data; validation chooses the architecture, learning rate, stopping epoch and threshold; the test set is used once at the end. MNIST: 60,000 development images + 10,000 test images. A 20% validation holdout gives 48,000 train and 12,000 validation images. Hyper-parameters (learning rate, layers, λ) are chosen by you; parameters (weights, biases) are learned. Leakage example: fitting a scaler on all 70,000 images lets test statistics shape training.`,
    r: `Repeatedly tuning to the test set makes the report untrustworthy — it quietly becomes a second validation set.`,
    i: `How many training and validation images are left after a 20% holdout of 60,000?`,
    c: py`
dev, test = 60000, 10000
val = int(dev * 0.2)
train = dev - val
print(train, val, test)`,
    v: bars("MNIST split sizes for the chosen validation fraction.", [["train", "60000*(1-f)"], ["validation", "60000*f"], ["test (held out)", "10000"]], {
      max: 60000,
      params: [par("f", "validation fraction", 0.05, 0.4, 0.05, 0.2)],
      readout: ["train {60000*(1-f)}   validation {60000*f}   test 10000"],
      steps: [["The lecture's 20% holdout: 48,000 / 12,000 / 10,000.", { f: 0.2 }]],
    }),
  },
  {
    t: "From pixels to numbers: normalize and flatten",
    lv: 1,
    s: `A grayscale image has one intensity per pixel; an MNIST image is 28 × 28 = 784 numbers, the label an integer 0–9. Pixel values are 0–255; divide by 255 so they live in 0–1 (0 → 0, 128 → 0.50196, 255 → 1). {{Flatten}} then lays the rows end to end: row 1, row 2, … giving a vector of 784 (64 for an 8×8 toy digit). Flatten changes only the shape, has no trainable parameters, and keeps the order.`,
    r: `Use the same scaling and shapes at training and prediction time. Standard MNIST stores light digits on a dark background.`,
    i: `Normalise the pixel 128 and flatten the 2×3 image [[1,2,3],[4,5,6]].`,
    c: py`
import numpy as np

img = np.array([[1, 2, 3], [4, 5, 6]])
print(img.flatten().tolist(), img.shape, img.flatten().shape)
pixels = np.array([0, 128, 255])
print((pixels / 255).round(5).tolist())
print(28 * 28, 8 * 8)`,
    v: cells("A 2×3 image flattened row by row.", [P("image", ["1", "2", "3"]), P("", ["4", "5", "6"]), P("flat", ["1", "2", "3", "4", "5", "6"])], [
      ["A tiny image with two rows of three pixels."],
      ["Flatten reads row 1 first…", [[0, 0, 2]]],
      ["…then row 2, appended after it.", [[1, 0, 2]]],
      ["The result is a vector of 6 values: nothing learned, only reshaped.", [[2, 0, 5]]],
    ]),
  },
  {
    t: "Shapes through the network",
    lv: 2,
    s: `A dimension is a direction in an array, not a neuron. One raw MNIST image is (28, 28); a batch of 32 is (32, 28, 28); adding a grayscale channel gives (32, 28, 28, 1). Flatten → (32, 784). Dense(100) → (32, 100): 100 learned features. Dense(10) → (32, 10): ten class scores. In Keras the batch size shows as None (variable). Always keep the batch axis first and check shapes before debugging anything else.`,
    r: `Most beginner shape errors are a missing channel axis or flattening the batch axis by mistake.`,
    i: `What is the shape after Flatten for a batch of 32 images of 28×28×1?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x = rng.random((32, 28, 28, 1))
flat = x.reshape(32, -1)
W1, b1 = rng.normal(0, 0.05, (784, 100)), np.zeros(100)
W2, b2 = rng.normal(0, 0.05, (100, 10)), np.zeros(10)
h = 1 / (1 + np.exp(-(flat @ W1 + b1)))
out = h @ W2 + b2
print(x.shape, flat.shape, h.shape, out.shape)`,
    v: compare("Shape of one example and of a batch of 32 at each stage.", ["One example", "Batch of 32"], [
      ["Raw MNIST", "(28, 28)", "(32, 28, 28)"],
      ["Add channel", "(28, 28, 1)", "(32, 28, 28, 1)"],
      ["Flatten", "(784,)", "(32, 784)"],
      ["Dense(100)", "(100,)", "(32, 100)"],
      ["Dense(10)", "(10,)", "(32, 10)"],
    ]),
  },
  {
    t: "Count every trainable parameter",
    lv: 1,
    s: `A Dense layer has {{incoming features × units + units}} parameters (weights plus one bias per unit). Flatten and Input add none. First layer 784 → 100: 78,400 weights + 100 biases = 78,500. Second layer 100 → 10: 1,000 + 10 = 1,010. Total 79,510. The bias belongs to each output neuron — it is not a 785th pixel (the "784 + 1" of the slides is just bookkeeping). Change the hidden width and watch the first layer dominate.`,
    r: `Parameters scale with width × width: doubling a hidden layer more than doubles the cost of the next layer.`,
    i: `Count the parameters of 784 → 100 → 10.`,
    c: py`
def dense(n_in, n_out):
    return n_in * n_out + n_out

a, b = dense(784, 100), dense(100, 10)
print(a, b, a + b)
print(dense(784, 200) + dense(200, 10))`,
    v: bars("Parameters in the two layers for the chosen hidden width.", [["layer 1: 784 → h", "784*h+h"], ["layer 2: h → 10", "h*10+10"]], {
      max: 160000,
      params: [par("h", "hidden units h", 10, 200, 10, 100)],
      readout: ["total = {784*h+h+h*10+10} trainable parameters"],
      steps: [["h = 100: 78,500 + 1,010 = 79,510.", { h: 100 }], ["h = 200: about twice as many.", { h: 200 }]],
    }),
  },
  {
    t: "Compile, fit, evaluate, predict",
    lv: 1,
    s: `Four verbs: {{compile}} chooses the optimiser, loss and metrics (Adam + categorical cross-entropy + accuracy); {{fit}} updates parameters from training batches (batch_size=32, epochs=6); {{evaluate}} reports loss and metrics without training; {{predict}} returns probabilities with shape (N, 10). Batch counts for MNIST: 48,000 / 32 = 1,500 updates per epoch, 9,000 for six epochs (early stopping may reduce this). Evaluating 10,000 test images at batch 32 takes ceil(10,000/32) = 313 batches (312 full + one of 16). Evaluation never updates weights.`,
    r: `An epoch is a pass over the data; a batch is one group inside that pass.`,
    i: `How many weight updates does six epochs of batch-32 training on 48,000 images take?`,
    c: py`
import math

train, batch, epochs = 48000, 32, 6
per_epoch = math.ceil(train / batch)
print(per_epoch, per_epoch * epochs)
print(math.ceil(10000 / 32), 10000 - 312 * 32)`,
    v: compare("What each Keras call does to the weights.", ["Purpose", "Changes weights?"], [
      ["compile", "set optimizer, loss, metrics", "no"],
      ["fit", "learn from training batches", "yes"],
      ["evaluate", "report loss and metrics", "no"],
      ["predict", "output probabilities (N, 10)", "no"],
    ]),
  },
  {
    t: "A softmax classifier from scratch",
    lv: 2,
    s: `A tiny "digit" experiment you can run anywhere: three 5×5 pixel patterns (a vertical bar, a horizontal bar, a plus) with random noise are flattened to 25 inputs and fed to ONE Dense(3) softmax layer trained with categorical cross-entropy and gradient descent. The gradient of cross-entropy with softmax is beautifully simple: {{p − y}}. The code trains on noisy copies, evaluates on fresh noisy copies and prints accuracy and the confusion matrix — the same loop Keras runs for MNIST, just smaller.`,
    r: `The 25-pixel patterns are synthetic and the accuracy reflects this toy task, not MNIST.`,
    i: `Why is the gradient of softmax + cross-entropy with respect to the logits just p − y?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
base = np.zeros((3, 5, 5))
base[0, :, 2] = 1
base[1, 2, :] = 1
base[2, :, 2] = 1
base[2, 2, :] = 1

def make(n):
    y = rng.integers(0, 3, n)
    x = base[y] + rng.normal(0, 0.35, (n, 5, 5))
    return x.reshape(n, -1), y

Xtr, ytr = make(300)
Xte, yte = make(200)
W, b = np.zeros((25, 3)), np.zeros(3)
Y = np.eye(3)[ytr]
for epoch in range(200):
    z = Xtr @ W + b
    p = np.exp(z - z.max(axis=1, keepdims=True))
    p /= p.sum(axis=1, keepdims=True)
    W -= 0.5 * Xtr.T @ (p - Y) / len(Xtr)
    b -= 0.5 * (p - Y).mean(axis=0)
pred = (Xte @ W + b).argmax(axis=1)
cm = np.zeros((3, 3), int)
for a, q in zip(yte, pred):
    cm[a, q] += 1
print(cm.tolist(), round(float((pred == yte).mean()), 3))`,
    v: cells("The three toy digits on a 5×5 grid.", [P("vertical bar", ["·", "·", "█", "·", "·"]), P("horizontal bar", ["·", "·", "·", "·", "·"]), P("plus", ["·", "·", "█", "·", "·"])], [
      ["Each pattern is flattened to 25 inputs and corrupted with noise."],
      ["Softmax over 3 outputs picks the most probable pattern.", [[0, 2, 2]]],
    ]),
  },
  {
    t: "Predicting a brand-new image correctly",
    lv: 2,
    s: `A new PNG must go through EXACTLY the same pipeline as training: convert to grayscale, resize to 28 × 28, match the polarity (MNIST is light digit on dark background — invert a dark-on-white scan), divide by 255, add the channel (and batch) axes, call predict, and read argmax of the 10 probabilities. Typical mistakes: forgetting to scale, feeding (28, 28) instead of (1, 28, 28, 1), or not inverting the colours. Check the output shape (1, 10) and that the probabilities sum to 1.`,
    r: `A confident wrong answer on a hand-drawn digit often means a preprocessing mismatch, not a bad model.`,
    i: `List the preprocessing steps for a scanned digit before calling predict.`,
    c: py`
import numpy as np

rng = np.random.default_rng(1)
scan = 255 - (rng.random((28, 28)) * 60).astype(np.uint8)
scan[:, 13:15] = 20
x = (255 - scan) / 255.0
x = x[None, :, :, None]
print(x.shape, round(float(x.min()), 2), round(float(x.max()), 2))
logits = rng.normal(0, 1, 10)
p = np.exp(logits - logits.max())
p /= p.sum()
print(p.shape, round(float(p.sum()), 3), int(p.argmax()))`,
    v: compare("Training pipeline versus the pipeline a new image needs.", ["Training images", "New scanned image"], [
      ["Colour", "grayscale", "convert to grayscale"],
      ["Size", "28 × 28", "resize to 28 × 28"],
      ["Polarity", "light digit on dark", "invert dark-on-white scans"],
      ["Scale", "÷ 255", "÷ 255 (same)"],
      ["Shape", "(N, 28, 28, 1)", "(1, 28, 28, 1)"],
    ]),
  },
  {
    t: "One complete evaluation story",
    lv: 2,
    s: `Putting it together: split 60,000 development images into 48,000 train and 12,000 validation (stratified, so each digit keeps its share); train with Adam at 0.001, batch 32, up to six epochs with early stopping on validation loss; freeze the choices; evaluate once on the 10,000 test images; then read overall accuracy, the 10 × 10 confusion matrix, per-digit precision/recall/F1 and macro F1. Never quote a number you did not measure, and never tune on the test set. Report which split each number came from.`,
    r: `The workflow code in the lecture needs TensorFlow; the NumPy tracks above reproduce every idea at small scale.`,
    i: `In what order are train, validation and test data used, and which decisions does each support?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
y = rng.integers(0, 10, 60000)
idx = rng.permutation(60000)
val_idx, train_idx = idx[:12000], idx[12000:]
share = lambda a: np.bincount(a, minlength=10) / len(a)
print(len(train_idx), len(val_idx))
print(abs(share(y[train_idx]) - share(y[val_idx])).max() < 0.01)`,
    v: cells("Who sees what, and when.", table(["stage", "data", "decision it supports"], [["fit", "train (48,000)", "weights and biases"], ["tune", "validation (12,000)", "epochs, η, architecture, threshold"], ["report", "test (10,000)", "one final honest score"]]), [
      ["Each dataset has one job."],
      ["Training data adjusts the weights.", [[1, 0, 2]]],
      ["Validation data guides every choice you make.", [[2, 0, 2]]],
      ["Test data is touched once at the very end.", [[3, 0, 2]]],
    ]),
  },
];

void [curve, seg, pt, hline, vline];
