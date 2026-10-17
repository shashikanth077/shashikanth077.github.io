import { area, bars, compare, curve, flow, hline, par, plot, pt, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { SIM, TOOLS } from "./sim.js";

/* Models and decisions: rules, logistic regression, anomaly detection, boosting, imbalance, calibration, thresholds, actions, layering. */

export const model: ConceptDef[] = [
  {
    t: "Rules: fast, clear and brittle",
    lv: 1,
    s: `Every fraud system starts with {{rules}}: "decline if the implied speed exceeds 900 km/h", "review if five purchases happen in ten minutes". Rules are instant, transparent (you can say exactly why a payment was blocked), easy to change the same day a new attack appears, and required for things a model should never decide alone (sanctions lists, hard limits). Their weakness: each rule is a blunt yes/no that ignores context; they multiply into hundreds that overlap and contradict; fraudsters probe them and step just below the threshold; and nobody remembers why rule 217 exists. Measure each rule by the frauds it catches and the good customers it hits, and retire the ones that no longer earn their keep.`,
    r: `Keep a rule registry with an owner, a reason, a date and the live hit and precision numbers; review it every quarter.`,
    i: `What are the strengths and weaknesses of a rules engine compared with a machine-learning model?`,
    c: py`${SIM}
rows = make_data()
X, y = featurize(rows)
speed = np.expm1(X[:, 3])          # implied km/h
amount = np.expm1(X[:, 0])
rules = {
    "3+ purchases in last 10 min": X[:, 2] >= 3,
    "implied speed > 900 km/h": speed > 900,
    "amount > 150": amount > 150,
}
rules["any rule fires"] = rules["3+ purchases in last 10 min"] | rules["implied speed > 900 km/h"] | rules["amount > 150"]
print(f"{'rule':<30}{'flagged':>8}{'fraud hit':>10}{'precision':>10}{'recall':>8}")
for name, hit in rules.items():
    n, tp = int(hit.sum()), int((hit & (y == 1)).sum())
    print(f"{name:<30}{n:>8}{tp:>10}{tp / max(n, 1):>10.2f}{tp / y.sum():>8.2f}")`,
    v: compare(
      "Rules give clarity and speed; models give nuance. Real systems run both.",
      ["Rules", "Model"],
      [
        ["Decision", "Yes / no on one condition", "A score from many signals"],
        ["Explain", "Trivial", "Needs reason codes"],
        ["Change speed", "Minutes", "Retrain and deploy"],
        ["Handles interactions", "Poorly", "Well"],
        ["Typical role", "Hard limits, quick fixes, new attacks", "The main ranking of risk"],
      ],
    ),
  },
  {
    t: "A model from scratch: logistic regression",
    lv: 1,
    s: `The simplest useful model is {{logistic regression}}: a weighted sum of the features, {{z = w₁x₁ + w₂x₂ + … + b}}, squashed to a probability by the sigmoid {{p = 1 / (1 + e^(−z))}}. Training nudges the weights down the slope of the log-loss until predictions match the labels. It is tiny (microseconds to score), stable, and each weight reads as "how much does this feature push the risk up", which makes reason codes easy. The code here builds it with NumPy (the run gives an average precision of about 0.74 and a ROC AUC of 0.98), trains on the first 70 % of the 30 days and tests on the last 30 % — time order, never a random shuffle. Drag the weight and bias to see how the curve and the decision point move.`,
    r: `Always start with a transparent baseline like this. If a complex model cannot clearly beat it on money saved, you have not earned the complexity.`,
    i: `Explain how logistic regression turns features into a fraud probability, and why you standardise the features first.`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)                       # first 70 % of time trains, last 30 % tests
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut])
p = predict(Z[cut:], w, b)
names = ["log_amount", "amount_z", "velocity_10min", "log_speed", "new_category"]
for name, wi in zip(names, w):
    print(f"{name:<16}{wi:>7.2f}")
print("bias", round(float(b), 2))
print("test fraud cases:", int(y[cut:].sum()), "of", len(y) - cut)
print("average precision:", round(average_precision(y[cut:], p), 3))
print("ROC AUC:", round(roc_auc(y[cut:], p), 3))`,
    v: plot(
      "The weight sets how sharply risk rises with the feature; the bias shifts where it crosses the decision threshold.",
      {
        x: [-6, 6],
        y: [0, 1],
        labels: ["feature value (standardised)", "fraud probability"],
        params: [par("w", "weight w", 0.2, 3, 0.1, 1), par("b", "bias b", -4, 2, 0.25, -2), par("th", "decision threshold", 0.05, 0.95, 0.05, 0.5)],
        defs: [["xs", "(ln(th/(1-th))-b)/w"]],
        readout: ["p = sigmoid({w}·x + {b}); it reaches the {th} threshold at x = {xs:2}"],
        steps: [["Weight 1, bias −2: risk crosses 50% at x = 2.", { w: 1, b: -2, th: 0.5 }], ["A stronger weight makes the switch sharper.", { w: 3 }], ["A lower threshold flags earlier (more fraud caught, more false alarms).", { th: 0.2 }]],
      },
      [curve("sigmoid(w*x+b)", { c: "accent" }), hline("th", { c: "warn", dash: true, label: "threshold" }), vline("xs", { c: "bad", dash: true }), pt("xs", "th", { c: "bad" })],
    ),
  },
  {
    t: "Anomaly detection when labels are scarce",
    lv: 2,
    s: `Sometimes there are few or no fraud labels — a new product, a new country, a brand-new attack. {{Anomaly detection}} models "normal" and flags what does not fit. The simplest version scores how many standard deviations a feature is from its mean; a multivariate version uses the {{Mahalanobis distance}}, which accounts for correlated features; {{isolation forests}} and {{autoencoders}} do the same for harder shapes. In the run below, a Mahalanobis score that never sees a label already reaches an average precision of about 0.63. Anomalies are {{unusual}}, not necessarily {{fraudulent}} — a genuine holiday purchase is also rare — so these scores usually feed a ranking or a review queue, or become one more feature of a supervised model. Rarity is easy to quantify: slide k to see how unusual k standard deviations is.`,
    r: `Use anomaly scores for cold start and for catching novel attacks; once labels exist, supervised models outperform them on known patterns.`,
    i: `When would you choose an unsupervised anomaly detector over a supervised classifier for fraud?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
mu = Z[:cut].mean(0)
cov = np.cov(Z[:cut].T) + 1e-6 * np.eye(Z.shape[1])
inv = np.linalg.inv(cov)
d = Z[cut:] - mu
maha = np.sqrt(np.einsum("ij,jk,ik->i", d, inv, d))      # distance from "normal", no labels used
print("average precision (no labels used):", round(average_precision(y[cut:], maha), 3))
print("share of frauds in the top 1 % most unusual:", round(float(y[cut:][np.argsort(-maha)[: len(maha) // 100]].mean()), 2))`,
    v: plot(
      "Far out in the tail is rare — but rare is not the same as fraudulent, which is why anomalies feed ranking rather than final decisions.",
      {
        x: [-4, 4],
        y: [0, 0.5],
        labels: ["standard deviations from normal", "density"],
        params: [par("k", "k standard deviations", 0.5, 4, 0.5, 2)],
        readout: ["Beyond {k} sd on the high side: about 1 in {round(1/(1-ncdf(k,0,1)))} ordinary cases"],
        steps: [["2 sd: about 1 in 44 — far too common to flag on its own.", { k: 2 }], ["3 sd: about 1 in 741.", { k: 3 }], ["4 sd: about 1 in 31,574 — now it is a strong anomaly.", { k: 4 }]],
      },
      [curve("norm(x,0,1)", { c: "info" }), area("norm(x,0,1)", "k", "4", { c: "bad" }), vline("k", { c: "bad", dash: true })],
    ),
  },
  {
    t: "Boosted trees: the workhorse for tabular fraud data",
    lv: 2,
    s: `On rows of mixed numeric and categorical features — exactly fraud data — {{gradient-boosted decision trees}} (XGBoost, LightGBM, CatBoost) are usually the strongest practical model. The idea: build many tiny trees one after another; each new tree is trained to fix the {{errors left by the trees so far}}, and its output is added with a small learning rate. They handle non-linear effects and interactions ("big amount AND new device"), need little feature scaling, cope with missing values, and score in microseconds. The code shows the principle with one-split trees ("stumps") on eight points: after three rounds the predictions move towards the labels.`,
    r: `Gradient boosting is the default production model for card fraud; keep logistic regression as the explainable baseline and for monitoring.`,
    i: `Why do boosted trees often beat neural networks on tabular fraud data, and what is each new tree trained on?`,
    c: py`
import numpy as np
x = np.array([1, 2, 3, 4, 5, 6, 7, 8.0])           # one feature: purchase size
y = np.array([0, 0, 0, 0, 1, 1, 0, 1.0])            # fraud mostly at large sizes
pred = np.full(len(x), y.mean())                    # start from the base rate
learning_rate = 0.5
print("start      ", pred.round(2))
for round_no in (1, 2, 3):
    resid = y - pred                                 # what the model still gets wrong
    best = None
    for thr in (x[:-1] + x[1:]) / 2:                 # try every split point
        left, right = resid[x <= thr], resid[x > thr]
        err = ((left - left.mean()) ** 2).sum() + ((right - right.mean()) ** 2).sum()
        if best is None or err < best[0]:
            best = (err, thr, left.mean(), right.mean())
    _, thr, left_val, right_val = best
    pred = pred + learning_rate * np.where(x <= thr, left_val, right_val)
    print(f"round {round_no} split at {thr:.1f} ->", pred.round(2))`,
    v: compare(
      "For rows of mixed features, boosted trees give the best accuracy per effort; deep models earn their place on sequences, text and graphs.",
      ["Logistic regression", "Boosted trees", "Neural network"],
      [
        ["Tabular accuracy", "Good baseline", "Usually best", "Needs care and data"],
        ["Interactions", "Add by hand", "Found automatically", "Found automatically"],
        ["Speed to score", "Microseconds", "Microseconds – ms", "ms (can be heavier)"],
        ["Explain", "Weights", "Feature importance, SHAP", "Harder"],
        ["Best for", "Baseline, reason codes", "The main production model", "Sequences, graphs, text"],
      ],
      1,
    ),
  },
  {
    t: "Class imbalance: weights, sampling and what they distort",
    lv: 2,
    s: `With 1 fraud in 1,000, a model can score "fine" by almost ignoring the minority. Three remedies: {{class weights}} (count a fraud as w legitimate examples in the loss), {{undersampling}} (train on all frauds plus a random slice of legit), {{oversampling}} (repeat or synthesise frauds, e.g. SMOTE). They help the model {{pay attention}} to fraud, but they also change the {{base rate}} it believes in: a weighted or resampled model outputs inflated probabilities. If you only rank or pick a threshold on validation money, that does not matter; if you need real probabilities (expected-loss maths, mixing with other scores), correct them afterwards. The code trains with weights 1, 10 and 50: ranking quality barely moves, the predicted probabilities do.`,
    r: `Prefer class weights or light undersampling plus calibration; avoid synthetic oversampling unless you have verified it helps on a later time period.`,
    i: `You train with fraud weighted 50×. Why can't you read the output as a probability, and how do you fix it?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
yt = y[cut:]
print(f"{'fraud weight':<14}{'avg precision':>14}{'mean p (fraud)':>16}{'mean p (legit)':>16}")
for weight in (1, 10, 50):
    w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=weight)
    p = predict(Z[cut:], w, b)
    print(f"{weight:<14}{average_precision(yt, p):>14.3f}{p[yt == 1].mean():>16.3f}{p[yt == 0].mean():>16.4f}")`,
    v: bars(
      "A weighted model shouts: its raw score overstates the true probability by about the weight; the correction divides that out.",
      [["raw score from the weighted model", "p"], ["corrected probability", "p/(p+w*(1-p))"]],
      {
        percent: true,
        params: [par("p", "raw score", 0.02, 0.98, 0.02, 0.5), par("w", "fraud weight used in training", 1, 100, 1, 10)],
        readout: ["raw {p} with weight {w} → corrected {round(100*p/(p+w*(1-p)))}% (odds divided by {w})"],
        steps: [["A raw 50% from a model trained with weight 10 really means about 9%.", { p: 0.5, w: 10 }], ["With weight 50 the same raw score means 2%.", { w: 50 }]],
      },
    ),
  },
  {
    t: "Calibration: is a score of 0.3 really 30 %?",
    lv: 2,
    s: `A {{calibrated}} model's scores behave like probabilities: of all transactions it scores near 0.3, about 30 % are fraud. Calibration is what lets you do expected-loss arithmetic ({{p × amount}} against the cost of blocking), compare models, and set thresholds that mean the same thing next month. Check it with a {{reliability table}}: bucket the scores, and compare the average score in each bucket with the actual fraud rate. If they disagree, fix them with {{Platt scaling}} (a small logistic fit on the scores) or {{isotonic regression}}, using held-out data. With very few frauds the buckets are noisy — never trust a bucket with a handful of cases.`,
    r: `Recalibrate on the most recent matured data; fraud base rates move with seasons, campaigns and attacks, and a model's scores drift with them.`,
    i: `What does it mean for a fraud model to be calibrated and how would you check it?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut])
p, yt = predict(Z[cut:], w, b), y[cut:]
edges = [0, 0.01, 0.05, 0.2, 1.0001]
print(f"{'score bucket':<14}{'count':>7}{'mean score':>12}{'actual fraud':>14}")
for lo, hi in zip(edges[:-1], edges[1:]):
    m = (p >= lo) & (p < hi)
    if m.any():
        print(f"{lo:.2f} - {min(hi, 1):.2f}{'':<4}{int(m.sum()):>7}{p[m].mean():>12.3f}{yt[m].mean():>14.3f}")`,
    v: plot(
      "A calibrated model lies on the diagonal; an overconfident one pushes scores to the extremes.",
      {
        x: [0, 1],
        y: [0, 1],
        labels: ["score the model gives", "actual fraud rate"],
        params: [par("k", "over-confidence k (1 = calibrated)", 0.4, 3, 0.1, 1.8)],
        readout: ["At k = {k} a score of 0.8 corresponds to a real rate of about {round(100*0.8^k/(0.8^k+0.2^k))}%"],
        steps: [["Calibrated: score 0.8 means 80%.", { k: 1 }], ["Over-confident (k = 3): a score of 0.8 is really 98%… and 0.3 is really 5%: scores are too extreme.", { k: 3 }]],
      },
      [curve("x", { c: "muted", dash: true, label: "perfect" }), curve("x^k/(x^k+(1-x)^k)", { c: "accent" })],
    ),
  },
  {
    t: "Choosing the threshold by cost",
    lv: 1,
    s: `A model outputs a score; a {{threshold}} turns it into an action. Pick it by {{money}}, not by habit: for each possible threshold compute {{missed fraud × cost of a miss + false alarms × cost of an alarm}} (plus review costs) on matured, held-out data, and choose the cheapest (with a miss costing 80 and a block 12, the run shows the cheapest threshold is a low 0.2 — missing fraud hurts far more than a wrong block). A cheap miss and an expensive customer-block push the threshold up; a costly fraud pushes it down. The optimum also moves when the fraud rate or the model quality changes, so revisit it regularly, and often set {{different thresholds per segment}} (new accounts, high-value baskets, risky merchants). In the graph the legit scores sit around 0 and fraud scores around the separation you choose; drag the threshold to find the cheapest point.`,
    r: `Thresholds are a business setting: log who changed them and why, version them like code, and simulate a change on recent data before applying it.`,
    i: `Your fraud costs 80 per miss and a false block costs 12. Roughly where does the optimal threshold sit relative to the break-even probability?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p, yt = predict(Z[cut:], w, b), y[cut:]
COST_MISS, COST_BLOCK = 80.0, 12.0
best = None
print(f"{'threshold':>9}{'blocked':>9}{'caught':>8}{'false':>7}{'cost':>9}")
for t in (0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95):
    block = p >= t
    caught = int((block & (yt == 1)).sum())
    false_blocks = int((block & (yt == 0)).sum())
    cost = (yt.sum() - caught) * COST_MISS + false_blocks * COST_BLOCK
    best = min(best or (cost, t), (cost, t))
    print(f"{t:>9.2f}{int(block.sum()):>9}{caught:>8}{false_blocks:>7}{cost:>9.0f}")
print("cheapest threshold:", best[1], "cost", round(best[0]))`,
    v: plot(
      "The cheapest threshold balances the two kinds of mistake: slide it and watch the expected cost per 10,000 payments change.",
      {
        x: [-3, 8],
        y: [0, 0.5],
        labels: ["model score (higher = more suspicious)", "density"],
        params: [par("t", "threshold", -1, 6, 0.25, 3), par("d", "model quality (separation)", 1, 6, 0.5, 4), par("bp", "fraud rate (basis points)", 5, 100, 5, 30)],
        defs: [["fpr", "1-ncdf(t,0,1)"], ["tpr", "1-ncdf(t,d,1)"], ["miss", "10000*(bp/10000)*(1-tpr)*80"], ["fa", "10000*(1-bp/10000)*fpr*12"]],
        readout: ["catches {round(100*tpr)}% of fraud, wrongly blocks {round(10000*fpr)/100}% of good payments", "cost per 10,000 payments: missed fraud {round(miss)} + false blocks {round(fa)} = {round(miss+fa)}"],
        steps: [["A low threshold catches almost everything but blocks many good payments.", { t: 0.5 }], ["A high threshold blocks few good payments but misses fraud.", { t: 5.5 }], ["Near the middle the total is lowest.", { t: 3 }]],
      },
      [curve("norm(x,0,1)", { c: "good", label: "good" }), curve("norm(x,d,1)", { c: "bad", label: "fraud" }), vline("t", { c: "warn", dash: true }), area("norm(x,d,1)", "t", "8", { c: "bad" })],
    ),
  },
  {
    t: "More than yes or no: approve, step up, review, decline",
    lv: 1,
    s: `Real systems have more outputs than two. {{Approve}} the clearly good. {{Step up}} the uncertain with an extra check that a genuine customer passes in seconds and a fraudster usually cannot (3-D Secure, a one-time code, a biometric). Send a thin band to {{manual review}} when the payment can wait or is valuable enough. {{Decline}} the clearly bad, and sometimes {{block the card or account}} and call the customer. Each action has its own cost, success rate and customer annoyance, so the middle band between "approve" and "decline" is where good design pays: step-up converts many would-be false declines into approvals, and many would-be frauds into declines. Open the first lab again and widen the review band to feel the trade-off.`,
    r: `Treat friction as a budget: measure step-up pass and abandon rates per segment, and keep review volume within analyst capacity.`,
    i: `Why add a step-up action instead of just approve and decline?`,
    c: py`
def action(score, amount, trusted_device):
    if score >= 0.9:
        return "decline + alert customer"
    if score >= 0.6:
        return "step up (one-time code)"
    if score >= 0.3 and amount > 300:
        return "manual review (hold goods)"
    if score >= 0.3 and not trusted_device:
        return "step up (one-time code)"
    return "approve"

for s, amt, trusted in [(0.05, 20, True), (0.35, 450, True), (0.35, 40, False), (0.7, 80, True), (0.95, 900, False)]:
    print(f"score {s:.2f} amount {amt:>3} trusted={str(trusted):<5} ->", action(s, amt, trusted))`,
    v: compare(
      "Each action trades fraud risk against customer friction and cost; the middle actions rescue the uncertain cases.",
      ["Fraud stopped", "Customer friction", "Cost"],
      [
        ["Approve", "none", "none", "fraud loss if wrong"],
        ["Step up (code, 3-D Secure)", "most fraud fails the check", "seconds; some abandon", "low"],
        ["Manual review", "high (an analyst decides)", "delay", "analyst time"],
        ["Decline", "all of it", "a genuine customer is blocked", "lost sale + trust"],
        ["Block card + contact", "all further misuse", "highest, but warranted", "support call, reissue"],
      ],
    ),
  },
  {
    t: "Layering lists, rules and models",
    lv: 2,
    s: `A production decision is a short pipeline, not one model. {{Allow-lists}} (trusted customers and recurring bills) and {{deny-lists}} (known-bad devices, cards, emails) short-circuit the easy cases. {{Hard rules}} enforce policy and law — sanctions, velocity ceilings, regulatory limits. The {{model score}} ranks everything else. A {{policy layer}} turns the score into an action using thresholds by segment, amount and channel, and applies business overrides ("never decline a card on our VIP list without a call"). Every layer writes a {{reason}} to the decision log, so each outcome can be explained, audited and replayed. Keep the order stable and the layers simple: the model should carry the nuance.`,
    r: `Log (decision, score, which layer decided, feature snapshot, model and rule versions) for every transaction: it powers reason codes, audits, disputes and retraining.`,
    i: `Outline the layers of a production fraud decision and what each one is for.`,
    c: py`
DENY_DEVICES = {"d_bad1"}
ALLOW_CARDS = {"c_vip"}

def decide(txn, score):
    if txn["device"] in DENY_DEVICES:
        return "decline", "deny-list: known bad device"
    if txn["card"] in ALLOW_CARDS and score < 0.9:
        return "approve", "allow-list: trusted customer"
    if txn["amount"] > 5000:
        return "review", "rule: very large amount"
    if score >= 0.8: return "decline", f"model score {score:.2f}"
    if score >= 0.4: return "step up", f"model score {score:.2f}"
    return "approve", f"model score {score:.2f}"

tests = [({"device": "d_bad1", "card": "c1", "amount": 20}, 0.1), ({"device": "d1", "card": "c_vip", "amount": 20}, 0.5),
         ({"device": "d1", "card": "c2", "amount": 9000}, 0.1), ({"device": "d1", "card": "c3", "amount": 90}, 0.55)]
for txn, score in tests:
    print(decide(txn, score))`,
    v: flow(
      "Lists and hard rules settle the clear cases, the model ranks the rest, policy picks the action — and every step writes its reason down.",
      "row",
      ["Event + features|enriched", "Deny / allow lists|known entities|w", "Hard rules|policy · law", "Model score|risk ranking|i", "Policy thresholds|by segment", "Decision + reason|logged|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
      [0, 1, 2, 3, 4],
      ["The enriched event enters the pipeline.", "Known-bad devices are declined at once; trusted customers pass.", "Hard rules enforce limits and regulation regardless of the model.", "The model gives a risk score to everything left.", "A policy layer turns the score into approve, step up, review or decline — then the reason is logged with the decision."],
    ),
  },
  {
    t: "Sequences, graphs and deep learning",
    lv: 3,
    s: `Beyond boosted trees on hand-built features, three deep-learning ideas appear in fraud. {{Sequence models}} (LSTMs, transformers) read a card's last 50 transactions as a sentence and learn "normal rhythm" without hand-made velocity features. {{Graph neural networks}} learn from the entity graph — cards, devices, merchants — to catch rings and mules. {{Autoencoders}} learn to rebuild normal behaviour and flag what they cannot. They can add accuracy when there is a lot of data and fast serving infrastructure, but they cost more to train, score and explain, and are harder to keep stable. Common pattern: run the heavy model in {{near-real-time}}, store its output as a feature, and let the fast tree model read it.`,
    r: `Compare any deep model against the boosted-tree baseline on money saved at equal alert rate, on a later time period, before adopting its cost.`,
    i: `When is a deep model justified for fraud, and how can you use it without hurting latency?`,
    v: compare(
      "Deep models read raw sequences and graphs; use them where hand-made features struggle, and feed their output to the fast model.",
      ["Reads", "Catches", "Cost"],
      [
        ["Boosted trees", "Hand-built features", "Known patterns, bursts, deviations", "Low"],
        ["Sequence model", "A card's last N events", "Changes in rhythm and habit", "Medium: training data, serving"],
        ["Graph network", "The entity graph", "Rings, mules, shared infrastructure", "High: graph store, batch refresh"],
        ["Autoencoder", "Normal behaviour", "Novel, never-seen behaviour", "Medium; many false alarms"],
      ],
    ),
  },
];
