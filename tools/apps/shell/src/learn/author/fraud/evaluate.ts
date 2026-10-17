import { bars, compare, lanes, layers, par } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { SIM, TOOLS } from "./sim.js";

/* Evaluation: confusion matrix, ROC vs PR, money, time splits, alert capacity, uncertainty, KPIs. */

export const evaluate: ConceptDef[] = [
  {
    t: "Confusion matrix, precision and recall",
    lv: 1,
    s: `Every decision lands in one of four boxes: {{true positive}} (fraud, blocked), {{false positive}} (good, blocked), {{false negative}} (fraud, missed) and {{true negative}} (good, approved). From them: {{recall = TP / (TP + FN)}} — the share of fraud caught; {{precision = TP / (TP + FP)}} — the share of blocks that were really fraud; the {{F1 score}} is their harmonic mean (it punishes a weak side). Recall alone can be gamed by blocking everything; precision alone by blocking almost nothing. Fraud teams also quote the {{false-positive ratio}} (good customers blocked per fraud caught): a ratio of 10 means ten genuine customers are disturbed for each fraud stopped. Move the counts to see the trade.`,
    r: `Always report recall and precision together at the operating threshold you actually deploy.`,
    i: `Out of 10,000 payments a model catches 40 of 60 frauds and wrongly blocks 10 good ones. Compute precision and recall.`,
    c: py`
tp, fp, fn, tn = 40, 10, 20, 9930
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print("precision:", round(precision, 3))
print("recall   :", round(recall, 3))
print("F1       :", round(f1, 3))
print("good customers blocked per fraud caught:", round(fp / tp, 2))`,
    v: bars(
      "Precision and recall pull against each other: catching more fraud usually blocks more good customers.",
      [["precision", "tp/(tp+fp)"], ["recall", "tp/(tp+fn)"], ["F1", "2*tp/(2*tp+fp+fn)"]],
      {
        percent: true,
        params: [par("tp", "fraud caught (TP)", 5, 100, 5, 40), par("fp", "good customers blocked (FP)", 0, 200, 5, 10), par("fn", "fraud missed (FN)", 0, 100, 5, 20)],
        readout: ["TP {tp} · FP {fp} · FN {fn} → precision {round(100*tp/(tp+fp))}%, recall {round(100*tp/(tp+fn))}%"],
        steps: [["The example: 40 caught, 10 false blocks, 20 missed.", { tp: 40, fp: 10, fn: 20 }], ["Block more aggressively: recall rises, precision falls.", { tp: 55, fp: 80, fn: 5 }], ["Block timidly: precision is high, but half the fraud passes.", { tp: 30, fp: 0, fn: 30 }]],
      },
    ),
  },
  {
    t: "ROC AUC vs precision–recall: why rare classes need PR",
    lv: 2,
    s: `{{ROC AUC}} is the chance that a random fraud scores higher than a random good payment; it is blind to how rare fraud is, so it can look near-perfect (0.98 in the run below) while the precision you can actually achieve is far lower (0.74 average precision against a 0.014 baseline). The reason: with 999 good payments per fraud, even a {{1 % false-positive rate}} floods the alert queue with ten good payments for every fraud. {{Average precision}} (area under the precision–recall curve) looks at precision directly and has a baseline equal to the fraud rate, so it tells the truth about rare classes. Use ROC AUC to compare rankings quickly, PR-based metrics and money to decide. The calculator shows how precision collapses when fraud is rare even at an impressive true- and false-positive rate.`,
    r: `A model with a 99 % true-positive rate and a 1 % false-positive rate sounds great; at 0.1 % fraud, about 9 of every 10 blocks are good customers.`,
    i: `Why can ROC AUC be misleading for fraud, and what would you report instead?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut])
p, yt = predict(Z[cut:], w, b), y[cut:]
print("fraud rate in test:", round(float(yt.mean()), 4))
print("ROC AUC          :", round(roc_auc(yt, p), 3))
print("average precision:", round(average_precision(yt, p), 3), "(a random model would score", round(float(yt.mean()), 3), ")")`,
    v: bars(
      "Same strong detector, different fraud rates: precision falls as fraud gets rarer even though recall and the false-positive rate stay put.",
      [["recall (true-positive rate)", "tpr"], ["false-positive rate", "fpr"], ["precision", "tpr*pi/(tpr*pi+fpr*(1-pi))"]],
      {
        percent: true,
        params: [par("tpr", "recall", 0.5, 0.99, 0.01, 0.9), par("fpr", "false-positive rate", 0.001, 0.05, 0.001, 0.01), par("pi", "fraud rate", 0.001, 0.1, 0.001, 0.01)],
        readout: ["recall {round(100*tpr)}%, false positives {round(1000*fpr)/10}%, fraud rate {round(1000*pi)/10}% → precision {round(100*tpr*pi/(tpr*pi+fpr*(1-pi)))}%"],
        steps: [["Fraud at 1%: precision about 48%.", { pi: 0.01 }], ["Fraud at 0.1%: the same detector is right only about 8% of the time.", { pi: 0.001 }], ["Cut false positives to 0.1% and it recovers to roughly half.", { fpr: 0.001 }]],
      },
    ),
  },
  {
    t: "Measure in money, not just metrics",
    lv: 1,
    s: `Two models can have the same AUC and very different value. Evaluate a policy by replaying matured, held-out transactions and adding up the {{cost}}: the amount of every fraud that got through, a fixed cost for each wrongly blocked customer, the cost of each review. Compare against {{do nothing}} (all fraud gets through) and against the {{current system}}. The result — "net savings per million payments at this alert rate" — is what the business understands and what lets you choose between models, thresholds and rules. Use the real amounts: one 2,000 fraud matters more than twenty 10 ones, so weight the metrics by value too.`,
    r: `Report net savings with a confidence interval, the alert rate, and the review hours needed — together.`,
    i: `Model A catches more fraud cases; model B catches more fraud dollars. Which do you ship?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p, yt = predict(Z[cut:], w, b), y[cut:]
amount = np.expm1(X[cut:, 0])                      # real purchase amounts of the test period
BLOCK_COST = 12.0                                  # lost sale + support per wrongly blocked customer
def cost(block):
    missed = amount[(yt == 1) & ~block].sum()
    return missed + BLOCK_COST * (block & (yt == 0)).sum()
print("do nothing   :", round(float(cost(np.zeros(len(yt), bool)))))
print("block >= 0.5 :", round(float(cost(p >= 0.5))))
print("block >= 0.8 :", round(float(cost(p >= 0.8))))
print("block >= 0.95:", round(float(cost(p >= 0.95))))`,
    v: compare(
      "Same fraud caught, different money: weigh by amount, count the customer cost, and compare with doing nothing.",
      ["Do nothing", "Model, threshold A", "Model, threshold B"],
      [
        ["Fraud missed (value)", "all of it", "some", "a little more"],
        ["Good customers blocked", "0", "a few", "fewer"],
        ["Reviews", "0", "some", "fewer"],
        ["Total cost", "highest", "lower", "lowest — the one to ship"],
      ],
      2,
    ),
  },
  {
    t: "Time-ordered validation and backtesting",
    lv: 2,
    s: `In production the model always predicts the {{future}} from the {{past}}, so validate the same way: train on an earlier period, test on a later one; then slide the window forward and repeat (a {{backtest}}). A random shuffle mixes yesterday's and tomorrow's data, can leak information (the same fraud burst, the same card or device on both sides) and ignores drift, so it flatters the model. Also keep a {{gap}} between training end and test start equal to the label delay, otherwise the newest training rows have missing fraud labels. A further trap on small data: with only a few dozen frauds even a correct split is {{noisy}} — the code prints random-split scores for five seeds to show how much they wobble.`,
    r: `Report the backtest as a series (week by week), not a single number: it shows trend, seasonality and drift at a glance.`,
    i: `Why does random cross-validation overstate a fraud model, and how do you set up a time-based backtest?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
n = len(y)
scores = []
for seed in range(5):                              # five different random 70/30 splits
    idx = np.random.default_rng(seed).permutation(n)
    tr, te = idx[: int(n * 0.7)], idx[int(n * 0.7):]
    mu, sd = X[tr].mean(0), X[tr].std(0) + 1e-9
    Z = (X - mu) / sd
    w, b = fit_logreg(Z[tr], y[tr])
    scores.append(round(average_precision(y[te], predict(Z[te], w, b)), 3))
print("random splits, average precision:", scores)
cut = int(n * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut])
print("time split, average precision   :", round(average_precision(y[cut:], predict(Z[cut:], w, b)), 3))`,
    v: lanes(
      "Train on the past, leave a gap for labels to arrive, test on the future, then slide forward.",
      12,
      {
        "Backtest 1": [[0, 5, "train", "g"], [5, 1, "gap", "w"], [6, 2, "test", "i"]],
        "Backtest 2": [[1, 5, "train", "g"], [6, 1, "gap", "w"], [7, 2, "test", "i"]],
        "Backtest 3": [[2, 5, "train", "g"], [7, 1, "gap", "w"], [8, 2, "test", "i"]],
        "Backtest 4": [[3, 5, "train", "g"], [8, 1, "gap", "w"], [9, 2, "test", "i"]],
      },
      [[0, "Each row is one experiment on a time axis."], [5, "The gap lets labels mature before the test period."], [8, "Sliding the window shows whether quality is stable, improving or decaying."]],
    ),
  },
  {
    t: "Alert budgets: precision at k and reviewer capacity",
    lv: 2,
    s: `Analysts can review only so many cases a day, so the question is not "what is the best threshold?" but "{{given capacity for k reviews, which k cases should they see?}}". Rank the day's flagged transactions by risk (or by expected loss, score × amount) and measure {{precision at k}}: of the top k, how many were fraud? The review queue is a {{budgeted resource}}: the right threshold moves with the volume of the day, and a good system fills the queue with the most valuable cases first. Ranking by expected loss beats ranking by score when amounts vary widely, because a 90 % risk on a 5 payment is worth less attention than a 40 % risk on 5,000.`,
    r: `Set an alert budget per analyst-hour, rank by expected loss, and track precision at k and time-to-decision as service levels.`,
    i: `You can review only 50 cases a day. How do you decide which 50, and how do you measure the process?`,
    c: py`
import numpy as np
rng = np.random.default_rng(3)
n = 2000
fraud = rng.random(n) < 0.02
score = np.where(fraud, rng.beta(5, 2, n), rng.beta(1, 8, n))      # frauds score high on average
amount = np.where(fraud, rng.lognormal(5, 0.6, n), rng.lognormal(3.4, 0.8, n))
for name, key in (("by score", score), ("by score x amount", score * amount)):
    top = np.argsort(-key)[:30]
    print(f"{name:<18} precision@30 = {fraud[top].mean():.2f} | fraud value in queue = {amount[top][fraud[top]].sum():.0f}")`,
    v: compare(
      "With limited capacity, rank by expected loss: the same 30 reviews catch more money.",
      ["Rank by score", "Rank by expected loss (score × amount)"],
      [
        ["Puts first", "the riskiest cases", "the cases where risk × value is biggest"],
        ["Strength", "Catches more cases", "Catches more money"],
        ["Weakness", "Spends reviews on small amounts", "Needs reliable probabilities (calibration)"],
      ],
      1,
    ),
  },
  {
    t: "How sure are you? Few frauds, wide uncertainty",
    lv: 2,
    s: `A fraud test set often holds only a few dozen cases, so any metric computed from it is a {{noisy estimate}}. "We caught 25 of 29 frauds" is 86 % recall, but the plausible range is wide. The {{Wilson interval}} gives a stable 95 % range for a proportion: {{centre = (p + z²/2n) / (1 + z²/n)}}, {{half-width = z·√(p(1−p)/n + z²/4n²) / (1 + z²/n)}} with z = 1.96. With 29 cases the range runs from about 69 % to 95 %. Two models whose recalls differ by a few points are probably {{indistinguishable}} on that data. Use more history, bootstrap resampling, or paired comparisons on the same transactions before claiming a win.`,
    r: `Put an interval on every headline number and only call a difference real if the intervals (or a paired test) separate.`,
    i: `Model A catches 25 of 29 frauds and model B 27 of 29. Is B better?`,
    c: py`
import numpy as np

def wilson(successes, n, z=1.96):
    p = successes / n
    centre = (p + z * z / (2 * n)) / (1 + z * z / n)
    half = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return centre - half, centre + half

for caught, total in [(25, 29), (27, 29), (250, 290), (2500, 2900)]:
    lo, hi = wilson(caught, total)
    print(f"{caught}/{total}: recall {caught / total:.2f}, 95% interval {lo:.2f} - {hi:.2f}")`,
    v: bars(
      "More confirmed fraud cases narrow the range; with a few dozen, large gaps in recall can be chance.",
      [["lower bound", "100*((r+1.96*1.96/(2*n))/(1+1.96*1.96/n)-1.96*sqrt(r*(1-r)/n+1.96*1.96/(4*n*n))/(1+1.96*1.96/n))"], ["observed recall", "100*r"], ["upper bound", "100*((r+1.96*1.96/(2*n))/(1+1.96*1.96/n)+1.96*sqrt(r*(1-r)/n+1.96*1.96/(4*n*n))/(1+1.96*1.96/n))"]],
      {
        max: 100,
        params: [par("r", "observed recall", 0.5, 0.99, 0.01, 0.86), par("n", "confirmed fraud cases in test set", 10, 2000, 10, 30)],
        readout: ["recall {round(100*r)}% on {n} cases"],
        steps: [["30 cases: a wide range.", { n: 30 }], ["300 cases: much tighter.", { n: 300 }], ["2,000 cases: the estimate is solid.", { n: 2000 }]],
      },
    ),
  },
  {
    t: "The metrics a fraud team watches",
    lv: 1,
    s: `A dashboard for a live fraud system mixes business, model and operations numbers. {{Business}}: fraud loss in basis points of sales, approval rate, false-decline rate, chargeback rate, customer complaints. {{Model}}: alert rate, precision and recall on matured labels, score distribution, calibration, feature drift. {{Operations}}: review queue length and age, time to decision, decision latency (p50/p95/p99), timeouts and fallbacks, error rate. Watch {{rates and distributions}}, not just totals: a sudden shift in the share of declines, or in the average score, is often the first sign of an attack, a broken feature or a bad release — hours before chargebacks arrive.`,
    r: `Alert on sudden changes in approval rate and score distribution by segment; they are your earliest warning because true labels lag by weeks.`,
    i: `Which fraud metrics are available immediately and which only weeks later? What do you watch in the meantime?`,
    v: layers(
      "Business, model and operations views tell different stories: watch all three, and trust the leading indicators while labels are still maturing.",
      ["Business|fraud loss in basis points, approval rate, false-decline rate, chargebacks, complaints|b", "Model|alert rate, precision and recall on matured labels, score and feature drift, calibration|i", "Operations|latency p50/p95/p99, timeouts, fallback rate, review queue length and age, errors|w", "Leading signals|approval-rate shifts, score distribution, rule hit counts — visible within minutes|g"],
    ),
  },
];
