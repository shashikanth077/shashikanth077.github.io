import { py, type DrillDef, type QuestionDef } from "../build.js";
import { SIM, TOOLS } from "./sim.js";

export const questions: QuestionDef[] = [
  ["frame", 1, "What is real-time fraud detection?", "Scoring each transaction as it happens — within tens of milliseconds, inside the payment authorisation — and turning the score into an action (approve, step up, review, decline), using the event plus fast-to-read context about the card, device and merchant."],
  ["frame", 1, "Why is accuracy a poor metric for fraud?", "Fraud is rare (often well under 1 % of payments), so approving everything is more than 99 % accurate and catches nothing. Use recall, precision, PR-AUC, the false-positive ratio and, above all, money saved."],
  ["frame", 1, "Name two costs of a false positive.", "A lost sale, a frustrated or lost customer, support contacts, and reputation damage; plus manual-review time when the case is reviewed. At scale these can exceed the fraud loss itself."],
  ["frame", 2, "What is a typical latency budget and why does p99 matter?", "Roughly tens to ~150 ms for the fraud decision, depending on the network and contract. Customers experience the slow tail: if 1 in 100 requests times out, thousands of customers a day are affected, so design and alert on p99, not the average."],
  ["frame", 1, "Which checks must be real-time and which can be batch?", "The approve/decline decision must be real-time. Burst and ring detection can be near-real-time (seconds to minutes). Model training, graph building, portfolio rescoring and label reconciliation are batch."],
  ["frame", 2, "List four fraud types and a signal for each.", "Card testing (many small payments, many cards, one merchant), card-not-present (new device, address mismatch), account takeover (new device then password reset then large transfer), synthetic identity (shared phone or address across 'people'), money mules (fast in-and-out, many senders)."],
  ["frame", 2, "Why define the cost of each outcome before building a model?", "The threshold and the choice between models are cost decisions. Without agreed numbers for a miss, a false block and a review, you cannot pick an operating point or show the business that the model saves money."],
  ["data", 1, "Which context is most valuable to join to a card transaction?", "The card's own history (typical amounts and merchants, last location), the device's history across cards, the merchant's risk, and block/allow lists — all retrievable by key within a few milliseconds."],
  ["data", 1, "What is a velocity feature and what is a window?", "A count or sum of events for an entity (card, device, IP) in a recent window, e.g. purchases in the last 10 minutes. The window is the time span; sliding windows always end 'now', tumbling windows use fixed blocks."],
  ["data", 2, "Tumbling versus sliding windows for fraud?", "Tumbling windows are cheap but a burst that straddles a boundary is split and looks small. Sliding windows always include the most recent N minutes so they see the whole burst, at the cost of more state."],
  ["data", 1, "Why are 'relative to this card's normal' features stronger than raw amount?", "A 400 purchase is ordinary for some cards and extreme for others. Z-scores, ratios to the card's average or maximum, and novelty flags capture deviation from that card's own behaviour."],
  ["data", 2, "How do you compute impossible travel?", "Haversine distance between the previous and the current transaction locations, divided by the time gap, gives implied speed. Very high speeds indicate two places at once. Handle missing or imprecise locations, VPNs and legitimate travel by feeding it to a model rather than hard-blocking."],
  ["data", 2, "What is training/serving skew and how do you prevent it?", "The model sees feature values in production computed differently from training. Prevent it with a feature store or shared feature code: define each feature once, backfill the offline store for training and serve the same value from the online store."],
  ["data", 2, "What is point-in-time correctness?", "Each training row may only use information that was available at that row's timestamp. Violations (windows that peek forward, joins on the wrong date, whole-dataset aggregates) leak the label and inflate offline metrics."],
  ["data", 2, "Your offline AUC is 0.99 and production is 0.65. What do you check first?", "Leakage and skew: future information in features, labels or joins; feature definitions that differ online; training on mature data but scoring immature; different population in production. Compare each feature's distribution offline versus logged live values."],
  ["data", 2, "Why are fraud labels difficult?", "They arrive late (disputes, chargebacks take weeks), are noisy (friendly fraud, unreported fraud) and biased (declined payments are never labelled). Train on matured periods, clean labels, and keep exploration or analyst-reviewed samples."],
  ["data", 3, "How can a graph help find fraud rings?", "Link cards, devices, emails, addresses and IPs; connected components and neighbourhood features reveal clusters that share infrastructure; contamination by a known-bad node raises suspicion. Cap hub nodes (public Wi-Fi) so they do not link innocent users."],
  ["model", 1, "When do you use rules and when a model?", "Rules for hard policy, legal limits, instant fixes and clear patterns; models for ranking risk across many interacting signals. Production systems layer lists, rules, a model and a policy that turns the score into an action."],
  ["model", 1, "Explain logistic regression for fraud in one minute.", "A weighted sum of the features is passed through a sigmoid to give a probability. Training adjusts weights to minimise log-loss. It is fast, stable and each weight shows a feature's push on risk, so it is a good baseline and easy to explain."],
  ["model", 2, "Why do boosted trees dominate tabular fraud data?", "They fit non-linear effects and feature interactions automatically, handle mixed types and missing values, need little scaling, are very fast to score, and give strong accuracy per unit of effort; neural networks need more data and care on tabular inputs."],
  ["model", 2, "How does class imbalance affect training and how do you handle it?", "The loss is dominated by the majority class. Use class weights or undersampling (and carefully, oversampling), then recalibrate because these methods inflate predicted probabilities; always evaluate on the natural distribution."],
  ["model", 2, "What does 'calibrated' mean and why does it matter?", "Scores behave like probabilities: among cases scored near 0.3, about 30 % are fraud. It enables expected-loss decisions (p × amount), comparing models and stable thresholds. Check with a reliability table; fix with Platt scaling or isotonic regression."],
  ["model", 1, "How do you choose the decision threshold?", "By cost on matured held-out data: sum missed-fraud value, false-block cost and review cost at each threshold and pick the cheapest, subject to capacity and customer-friction limits; revisit it as the base rate and model change, and consider per-segment thresholds."],
  ["model", 2, "Given cost of a miss 80 and a false block 12, what is the break-even probability?", "Block when p × 80 > (1 − p) × 12, i.e. p > 12 / (80 + 12) ≈ 0.13 — for a calibrated model. Uncalibrated scores need the threshold chosen empirically."],
  ["model", 2, "Why add a step-up action?", "It converts uncertain cases: genuine customers pass an extra check in seconds (fewer false declines) while fraudsters usually fail it (fewer misses), at a modest friction cost."],
  ["model", 2, "When would you use unsupervised anomaly detection?", "When labels are scarce or absent (new product, new attack): model normal behaviour and score deviation (z-score, Mahalanobis, isolation forest, autoencoder). Anomalies are unusual, not necessarily fraudulent, so use them to rank, to feed a supervised model or for review queues."],
  ["model", 3, "When are deep models worth it?", "When there is abundant data and hand-built features plateau: sequence models for behavioural rhythm, graph networks for rings, autoencoders for novelty. Run them in near-real-time as features for a fast model and compare on money saved at equal alert rate."],
  ["eval", 1, "Define precision and recall for fraud.", "Recall = frauds caught ÷ all frauds. Precision = frauds among everything blocked ÷ everything blocked. Report both at the deployed threshold, together with the false-positive ratio."],
  ["eval", 2, "Why can ROC AUC mislead on rare fraud?", "It ignores the base rate: a 1 % false-positive rate sounds tiny but at 0.1 % fraud means about ten false blocks per fraud caught. Average precision and cost-based metrics reflect the real burden."],
  ["eval", 2, "A model has 90 % recall and 1 % false-positive rate; fraud is 0.1 % of traffic. What is precision?", "TP rate 0.9 × 0.001 = 0.0009 per transaction; FP 0.01 × 0.999 ≈ 0.00999. Precision = 0.0009 / (0.0009 + 0.00999) ≈ 8 %."],
  ["eval", 1, "How do you split data for a fraud model?", "By time: train on earlier periods, validate on later ones, leave a gap equal to the label delay, and backtest by sliding the window. Random shuffles leak related events, ignore drift and flatter the model."],
  ["eval", 2, "How do you compare two fraud models fairly?", "On the same matured, time-held-out transactions, at equal alert rate or in money terms (value of fraud stopped minus customer and review costs), with confidence intervals or a paired bootstrap, and by segment."],
  ["eval", 2, "What is precision at k and why use it?", "The share of the top k ranked cases that are fraud. It matches fixed reviewer capacity: with 50 reviews a day the question is which 50 cases to show; rank by expected loss (probability × amount) to maximise money found."],
  ["eval", 3, "A test set has 29 fraud cases. Model A catches 25, model B 27. Is B better?", "Not demonstrably: the 95 % Wilson intervals for 25/29 and 27/29 overlap heavily. Use more history, a bootstrap or a paired comparison on the same cases before declaring a winner."],
  ["eval", 2, "Which metrics are available immediately and which only later?", "Immediately: approval and decline rates, alert rate, score distribution, rule hits, latency, queue length. Later: chargebacks, confirmed fraud rate, precision and recall on matured labels (weeks)."],
  ["serve", 1, "Describe the architecture of a real-time fraud system.", "Gateway → decision service → online feature lookup → in-memory model and rules → answer, all synchronous. Asynchronous: decisions to an event stream; a stream processor updates features; a data lake stores history; training builds new models; case management and monitoring consume the stream."],
  ["serve", 2, "What happens if the feature store is slow?", "Short timeouts, then fall back: score with event-only features and conservative rules, mark the decision degraded and alert on the fallback rate. Never let a slow dependency block the payment."],
  ["serve", 2, "Fail open, fail closed or degrade?", "Fail open invites fraud (attackers can trigger outages); fail closed destroys sales. Degrade in layers — previous model, rules, then a conservative policy by amount and trust — and rehearse it."],
  ["serve", 2, "Why partition the stream by card id?", "All events for a card go to one worker in order, so its windows and counters can live in local memory without cross-worker coordination; scale by adding partitions. Hot keys (popular devices) need special handling."],
  ["serve", 2, "How do you handle duplicate and late events?", "Give events unique ids and drop repeats; process by event time with a watermark; send events later than the allowed lateness to a correction path; make state updates idempotent so replay gives the same result."],
  ["serve", 2, "How would you deploy a new fraud model safely?", "Offline backtest, shadow mode (logged, not acted on), champion/challenger on a small slice, canary with automatic rollback on guardrails (approval rate, alert rate, latency, fallback rate), and keep the previous version one click away."],
  ["serve", 2, "What is stored with each decision?", "Event id, score, decision and action, which layer decided and reason codes, feature snapshot, model/rule/threshold versions, latency and degraded flag. It enables audit, disputes, explanation, replay and training data."],
  ["serve", 2, "How do reason codes work for tree models?", "SHAP-style per-feature contributions to the score; map the top few to plain-language reasons for analysts and generic wording for customers. For linear models, contribution = weight × standardised value."],
  ["serve", 3, "Reviewers can't keep up. What do you do?", "Rank by expected loss and cap the queue, narrow the review band, auto-decide low-value overflow, add step-up to resolve cases without humans, add temporary staff, and fix the root cause (a rule or feature flooding the queue)."],
  ["ops", 2, "What is drift and how do you detect it before labels arrive?", "Data drift is a change in input distributions; concept drift is a change in the relation to fraud. Monitor feature and score distributions with PSI or KS tests per segment, approval and alert rates, and rule hits; investigate above about 0.1–0.25 PSI."],
  ["ops", 2, "What is the feedback-loop problem?", "Declined payments never get labels, so a model trained on approved or reviewed data sees a world filtered by its own decisions and its weaknesses stay hidden. Use random exploration slices, analyst samples and adjustment for selection."],
  ["ops", 2, "Why does a fraud model decay and how often do you retrain?", "Fraudsters adapt to what is blocked, seasons and products change the data. Retrain on a schedule (weekly–monthly), when drift or precision triggers, and keep a rapid-response rule lane for new attacks."],
  ["ops", 2, "How do you handle PCI and privacy in a fraud pipeline?", "Tokenise or keyed-hash card numbers, restrict and log access, minimise retention, encrypt in transit and at rest, keep raw card data out of the feature and analytics stores, and involve compliance for automated-decision requirements."],
  ["ops", 3, "How do you check a fraud model for unfair outcomes?", "Compare false-decline rate, step-up rate and recall across segments (region, new vs established customers, age bands) even if protected attributes are not features; investigate gaps, and document mitigations."],
  ["ops", 2, "Estimate instances for 6,000 req/s with 800 req/s per instance.", "At 60 % target utilisation: 6000 / (800 × 0.6) = 12.5 → 13 instances, plus spare capacity (for example 2) to survive a node or zone loss — about 15."],
  ["ops", 1, "What do you build first with a small team?", "Replayable logging of every event and decision, a few rules, then velocity and behaviour features with a logistic baseline validated on a time split; only afterwards boosted trees, streaming features, review tooling, monitoring and advanced models."],
  ["ops", 3, "A model drops from 0.8 to 0.6 average precision next month. Walk through your investigation.", "Check data first (feature pipeline outages, schema changes, missing values, skew), then drift in inputs and scores by segment, then label delay (are recent labels incomplete?), then new attack patterns (cluster the misses), and only then model issues; roll back if guardrails are breached."],
];

export const drills: DrillDef[] = [
  {
    t: "The 99.5 % model",
    q: "What does this print?",
    code: py`
import numpy as np
y = np.zeros(1000, dtype=int)
y[:5] = 1                          # 5 frauds in 1,000
pred = np.zeros(1000, dtype=int)   # approve everything
print((pred == y).mean(), pred[y == 1].mean())`,
    opts: [["0.995 0.0", true, "995 of 1,000 are correct, and none of the 5 frauds is flagged."], ["1.0 1.0", false, "That would be a perfect model."], ["0.5 0.0", false, "Accuracy counts all 1,000 payments, not 5."]],
    path: ["pred is all zeros, so 995 of 1000 predictions match y.", "Among the 5 frauds the prediction mean is 0."],
    why: "Accuracy rewards the majority class.",
    watch: "Always look at recall and money.",
    remember: "99.5 % accurate, 0 % useful.",
  },
  {
    t: "Precision, recall, F1",
    q: "What does this print?",
    code: py`
tp, fp, fn = 30, 20, 10
precision, recall = tp / (tp + fp), tp / (tp + fn)
print(round(precision, 2), round(recall, 2), round(2 * precision * recall / (precision + recall), 2))`,
    opts: [["0.6 0.75 0.67", true, "30/50 = 0.6, 30/40 = 0.75, harmonic mean 0.667."], ["0.75 0.6 0.67", false, "Precision and recall are swapped."], ["0.6 0.75 0.68", false, "The harmonic mean is 0.667, which rounds to 0.67."]],
    path: ["precision = 30 / (30 + 20) = 0.6.", "recall = 30 / (30 + 10) = 0.75.", "F1 = 2·0.6·0.75 / 1.35 = 0.667."],
    why: "Precision looks at what was blocked, recall at what existed.",
    watch: "Do not mix up the denominators.",
    remember: "Precision: blocked. Recall: all fraud.",
  },
  {
    t: "Break-even probability",
    q: "A miss costs 80 and a false block costs 12. For a calibrated model, what does this print?",
    code: py`
miss, block = 80, 12
print(round(block / (miss + block), 3))`,
    opts: [["0.13", true, "Block when p·80 > (1−p)·12, i.e. p > 12/92 ≈ 0.13."], ["0.87", false, "That is the complement."], ["0.15", false, "12/80 ignores that a block of real fraud also saves the miss."]],
    path: ["Expected cost of approving: p × 80.", "Expected cost of blocking: (1 − p) × 12.", "Equal at p = 12 / (80 + 12) ≈ 0.13."],
    why: "The cheaper error sets the threshold.",
    watch: "This assumes calibrated probabilities.",
    remember: "Threshold ≈ cost of block ÷ (cost of block + cost of miss).",
  },
  {
    t: "Window boundaries",
    q: "What does this print?",
    code: py`
times = [0, 100, 200, 590, 605, 610]
tumbling = [sum(1 for u in times if u // 600 == t // 600 and u <= t) for t in times]
sliding = [sum(1 for u in times if 0 <= t - u <= 600) for t in times]
print(tumbling, sliding)`,
    opts: [["[1, 2, 3, 4, 1, 2] [1, 2, 3, 4, 4, 5]", true, "The tumbling window restarts at 600; the sliding window keeps counting the burst."], ["[1, 2, 3, 4, 5, 6] [1, 2, 3, 4, 4, 5]", false, "The tumbling window resets at the 600 boundary."], ["[1, 2, 3, 4, 1, 2] [1, 2, 3, 4, 1, 2]", false, "The sliding window keeps events for a full 600 seconds."]],
    path: ["Tumbling blocks: 0–599 and 600–1199; events at 605 and 610 start a new block.", "Sliding looks back 600 s from each event: at 605 the event at 0 has just dropped out (4 left), at 610 the count is 5."],
    why: "Fixed blocks cut bursts in half.",
    watch: "Use sliding windows for velocity.",
    remember: "A burst across a boundary hides in tumbling windows.",
  },
  {
    t: "Impossible travel",
    q: "Two purchases are 5,837 km apart and 40 minutes apart. What speed is implied?",
    code: py`
km, minutes = 5837, 40
print(round(km / (minutes / 60)))`,
    opts: [["8756 km/h", true, "5837 ÷ (40/60) = 8,755.5."], ["145 km/h", false, "That divides by minutes, not hours."], ["5837 km/h", false, "The time gap is 40 minutes, not one hour."]],
    path: ["40 minutes = 2/3 of an hour.", "5837 / (2/3) = 8755.5 ≈ 8756."],
    why: "Speed = distance ÷ time with consistent units.",
    watch: "Guard against a zero time gap with a floor.",
    remember: "Convert minutes to hours.",
  },
  {
    t: "Weighted model, honest probability",
    q: "A model trained with fraud weighted 10× outputs 0.5. What does this print?",
    code: py`
p, w = 0.5, 10
print(round(p / (p + w * (1 - p)), 3))`,
    opts: [["0.091", true, "The weighted model inflates odds by w; dividing them out gives 0.5 / (0.5 + 5) ≈ 0.091."], ["0.5", false, "Weighting changes the base rate the model believes in."], ["0.05", false, "That divides the probability, not the odds, by w."]],
    path: ["Odds of the raw score: 0.5/0.5 = 1.", "True odds = 1 / 10 = 0.1.", "Probability = 0.1 / 1.1 ≈ 0.091."],
    why: "Class weights multiply the fraud odds by w.",
    watch: "Calibrate after weighting if you need probabilities.",
    remember: "p_true = p / (p + w(1 − p)).",
  },
  {
    t: "Is the population stable?",
    q: "Reference score-band shares are [0.5, 0.3, 0.2]; today [0.4, 0.3, 0.3]. What does this print?",
    code: py`
import numpy as np
e, a = np.array([0.5, 0.3, 0.2]), np.array([0.4, 0.3, 0.3])
print(round(float(((a - e) * np.log(a / e)).sum()), 3))`,
    opts: [["0.063", true, "(−0.1)·ln0.8 + 0 + 0.1·ln1.5 = 0.0223 + 0.0405."], ["0.2", false, "That is the largest share change, not the PSI."], ["0.0", false, "The distribution did move."]],
    path: ["Band 1: (0.4 − 0.5)·ln(0.4/0.5) = 0.0223.", "Band 2: 0.", "Band 3: (0.3 − 0.2)·ln(0.3/0.2) = 0.0405."],
    why: "PSI sums each band's weighted log-ratio.",
    watch: "Below ~0.1 is usually fine.",
    remember: "Rule of thumb: <0.1 stable, 0.1–0.25 look, >0.25 act.",
  },
  {
    t: "Which case first?",
    q: "Two flagged payments: A has risk 0.9 and amount 5; B has risk 0.4 and amount 5,000. With room for one review, which first by expected loss?",
    code: py`
cases = {"A": (0.9, 5), "B": (0.4, 5000)}
ranked = sorted(cases, key=lambda k: -cases[k][0] * cases[k][1])
print(ranked, [cases[k][0] * cases[k][1] for k in ranked])`,
    opts: [["B first: expected loss 2000 vs 4.5", true, "Expected loss = probability × amount."], ["A first: higher risk", false, "Risk alone ignores the value at stake."], ["Equal priority", false, "Their expected losses differ by a factor of ~400."]],
    path: ["A: 0.9 × 5 = 4.5.", "B: 0.4 × 5000 = 2000.", "Review the larger expected loss first."],
    why: "Capacity should go where the money is.",
    watch: "Needs calibrated probabilities.",
    remember: "Rank by p × amount.",
  },
  {
    t: "Why precision collapses",
    q: "Recall 90 %, false-positive rate 1 %, fraud 0.1 % of traffic. What is precision?",
    code: py`
tpr, fpr, pi = 0.9, 0.01, 0.001
print(round(tpr * pi / (tpr * pi + fpr * (1 - pi)), 3))`,
    opts: [["0.083 (about 8 %)", true, "0.0009 ÷ (0.0009 + 0.00999)."], ["0.9", false, "That is recall."], ["0.99", false, "That is 1 − false-positive rate."]],
    path: ["True positives per transaction: 0.9 × 0.001 = 0.0009.", "False positives: 0.01 × 0.999 = 0.00999.", "Precision = 0.0009 / 0.01089 ≈ 0.083."],
    why: "Good customers outnumber fraud a thousand to one.",
    watch: "Quote precision, not only ROC.",
    remember: "Rare class + small FPR = many false alarms.",
  },
  {
    t: "How unusual is a z of 4?",
    q: "A card's past purchases are 10, 12, 11, 13, 14. What does this print for a purchase of 18?",
    code: py`
import numpy as np
h = np.array([10, 12, 11, 13, 14.0])
print(round(float((18 - h.mean()) / h.std()), 2))`,
    opts: [["4.24", true, "mean 12, spread √2 ≈ 1.414, so (18 − 12)/1.414."], ["6.0", false, "That is the raw difference, not divided by the spread."], ["1.41", false, "That is the spread itself."]],
    path: ["mean = 12; deviations −2, 0, −1, 1, 2; variance = 10/5 = 2.", "std = 1.414.", "z = 6 / 1.414 = 4.24."],
    why: "A z-score counts how many usual spreads away a value is.",
    watch: "Use point-in-time history, not data that includes the purchase.",
    remember: "z = (x − mean) / std.",
  },
  {
    t: "Duplicates",
    q: "What does this print?",
    code: py`
events = ["e1", "e2", "e1", "e3", "e2", "e1"]
seen, processed = set(), []
for e in events:
    if e not in seen:
        seen.add(e)
        processed.append(e)
print(processed, len(events) - len(processed))`,
    opts: [["['e1', 'e2', 'e3'] 3", true, "Three repeats are dropped by the idempotency check."], ["['e1', 'e2', 'e1', 'e3', 'e2', 'e1'] 0", false, "Nothing would be deduplicated."], ["['e1', 'e2', 'e3'] 6", false, "Only 3 events were dropped."]],
    path: ["First e1, e2, e3 are processed.", "The second e1, second e2 and third e1 are duplicates: 3 dropped."],
    why: "At-least-once delivery makes duplicates normal.",
    watch: "Keep the seen-set bounded with expiry.",
    remember: "Idempotency by event id.",
  },
  {
    t: "Which worker?",
    q: "Events are routed with sum(ord(c)) % 3. Which keys land on the same worker?",
    code: py`
for key in ["ab", "ba", "abd"]:
    print(key, sum(map(ord, key)) % 3)`,
    opts: [["ab and ba share a worker; abd is elsewhere", true, "ab → 195 % 3 = 0, ba → 195 % 3 = 0, abd → 295 % 3 = 1."], ["All three share a worker", false, "abd gives 295 % 3 = 1."], ["Each key gets its own worker", false, "Only 3 workers exist and ab/ba collide."]],
    path: ["ab = 97 + 98 = 195, 195 % 3 = 0.", "ba = 98 + 97 = 195, same result.", "abd = 195 + 100 = 295, 295 % 3 = 1."],
    why: "A hash only guarantees that equal keys map to the same partition.",
    watch: "Different keys can collide: partitions hold many keys.",
    remember: "Same key ⇒ same partition.",
  },
  {
    t: "Does the queue keep up?",
    q: "30 cases arrive per hour; each analyst clears 8 per hour; 3 analysts work. How many cases are waiting after 8 hours?",
    code: py`
arrivals, per_analyst, analysts, hours = 30, 8, 3, 8
backlog = max(0, (arrivals - per_analyst * analysts) * hours)
print(backlog)`,
    opts: [["48", true, "Capacity 24/hour against 30 arriving: the backlog grows by 6 an hour, 48 after 8 hours."], ["0", false, "Capacity is below demand."], ["240", false, "That is 8 hours of arrivals (30 × 8) and ignores the work the analysts do."]],
    path: ["Capacity = 3 × 8 = 24 per hour.", "Shortfall = 30 − 24 = 6 per hour.", "After 8 hours: 48."],
    why: "Demand above capacity accumulates.",
    watch: "Backlog age breaks the SLA before length looks scary.",
    remember: "Match the review band to capacity.",
  },
  {
    t: "Instances for the peak",
    q: "Peak 6,000 req/s; one instance handles 800 req/s; target utilisation 60 %. How many instances (before spares)?",
    code: py`
import math
print(math.ceil(6000 / (800 * 0.6)))`,
    opts: [["13", true, "6000 / 480 = 12.5, rounded up."], ["8", false, "That ignores the utilisation target (6000/800 rounded up)."], ["12", false, "Always round capacity up."]],
    path: ["Usable capacity per instance = 800 × 0.6 = 480.", "6000 / 480 = 12.5.", "Round up to 13."],
    why: "Headroom keeps p99 latency low.",
    watch: "Add spares for node and zone failures.",
    remember: "instances = ceil(peak / (capacity × utilisation)).",
  },
];

export const codeLab: [title: string, brief: string, code: string][] = [
  [
    "Streaming velocity features, with no leakage",
    "Compute 'purchases in the last 10 minutes per card' as events arrive, using only past events, then check the burst cards stand out.",
    py`${SIM}
from collections import defaultdict, deque

rows = make_data()
window = defaultdict(deque)                        # card -> recent event times
vel, labels = [], []
for (t, card, amt, cat, la, lo, fraud) in rows:    # rows are already in time order
    q = window[card]
    while q and t - q[0] > 600:
        q.popleft()
    vel.append(len(q))                             # count BEFORE adding this event: point-in-time safe
    labels.append(fraud)
    q.append(t)
vel, labels = np.array(vel), np.array(labels)
print("max velocity among frauds :", int(vel[labels == 1].max()))
print("share of frauds with velocity >= 2 :", round(float((vel[labels == 1] >= 2).mean()), 2))
print("share of genuine with velocity >= 2:", round(float((vel[labels == 0] >= 2).mean()), 3))`,
  ],
  [
    "Pick thresholds per amount band",
    "Train the baseline, then choose a different threshold for small and large payments by minimising cost in each band.",
    py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p, yt = predict(Z[cut:], w, b), y[cut:]
amount = np.expm1(X[cut:, 0])
BLOCK_COST = 12.0
for name, mask in (("under 60", amount < 60), ("60 and over", amount >= 60)):
    best = None
    for t in np.arange(0.1, 1.0, 0.05):
        block = (p >= t) & mask
        miss_cost = amount[(yt == 1) & mask & ~block].sum()
        cost = miss_cost + BLOCK_COST * (block & (yt == 0)).sum()
        best = min(best or (cost, t), (cost, t))
    print(f"{name:<12} best threshold {best[1]:.2f}  cost {best[0]:.0f}  (fraud cases: {int(((yt == 1) & mask).sum())})")`,
  ],
  [
    "A drift monitor with PSI",
    "Compare the model's score distribution in the first and second half of the test period and report the PSI.",
    py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.5)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p = predict(Z[cut:], w, b)
first, second = p[: len(p) // 2], p[len(p) // 2:]
edges = [0, 0.02, 0.1, 0.5, 1.0001]
def shares(s):
    h = np.histogram(s, bins=edges)[0] / len(s)
    return np.clip(h, 1e-4, None)
e, a = shares(first), shares(second)
print("reference shares:", e.round(3))
print("later shares    :", a.round(3))
print("PSI:", round(float(((a - e) * np.log(a / e)).sum()), 3))`,
  ],
  [
    "A deduplicating, watermark-aware processor",
    "Process a messy event stream: drop duplicates, track the watermark and route events that are too late.",
    py`
events = [("e1", 100), ("e2", 160), ("e1", 100), ("e3", 150), ("e4", 400), ("e5", 120), ("e6", 410)]
LATENESS, seen, watermark = 60, set(), 0
processed, late, dupes = [], [], []
for eid, ts in events:
    if eid in seen:
        dupes.append(eid); continue
    seen.add(eid)
    if ts < watermark - LATENESS:
        late.append(eid)
    else:
        processed.append(eid)
    watermark = max(watermark, ts)
print("processed:", processed)
print("duplicates:", dupes)
print("too late  :", late)`,
  ],
  [
    "Layered decision with reasons",
    "Combine lists, a hard rule, the model score and thresholds into one function that always returns a reason.",
    py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p = predict(Z[cut:], w, b)
amount = np.expm1(X[cut:, 0])
def decide(i):
    if amount[i] > 2000:
        return "review", "hard rule: amount over 2000"
    if p[i] >= 0.9:
        return "decline", f"model score {p[i]:.2f}"
    if p[i] >= 0.5:
        return "step up", f"model score {p[i]:.2f}"
    return "approve", f"model score {p[i]:.2f}"
counts = {}
for i in range(len(p)):
    action, why = decide(i)
    counts[action] = counts.get(action, 0) + 1
print(counts)
top = int(np.argmax(p))
print("most suspicious:", decide(top), "| actually fraud:", bool(y[cut + top]))`,
  ],
  [
    "Weekly backtest",
    "Slide a training window across the 30 days and report average precision on the following week — a drift picture in a table.",
    py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
t = np.array([r[0] for r in rows]) / 86400            # day number of every transaction
print(f"{'train days':<12}{'test days':<12}{'frauds':>7}{'avg precision':>15}")
for start in (0, 3, 6, 9):
    tr = (t >= start) & (t < start + 14)
    te = (t >= start + 15) & (t < start + 22)            # one-day gap, then a week
    if y[te].sum() < 3 or y[tr].sum() < 3:
        print(f"{start}-{start + 14:<9}{start + 15}-{start + 22:<7}{int(y[te].sum()):>7}{'(too few frauds)':>15}")
        continue
    mu, sd = X[tr].mean(0), X[tr].std(0) + 1e-9
    w, b = fit_logreg((X[tr] - mu) / sd, y[tr], pos_weight=10)
    ap = average_precision(y[te], predict((X[te] - mu) / sd, w, b))
    print(f"{start}-{start + 14:<9}{start + 15}-{start + 22:<7}{int(y[te].sum()):>7}{ap:>15.3f}")`,
  ],
  [
    "Reason codes for the top alerts",
    "Print the three strongest reasons for each of the five most suspicious test payments.",
    py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p = predict(Z[cut:], w, b)
reasons = ["unusually large purchase", "amount far above this card's normal", "many purchases in minutes", "far from the previous purchase (fast)", "first time at this merchant type"]
for i in np.argsort(-p)[:5]:
    contrib = Z[cut + i] * w
    top = ", ".join(reasons[j] for j in np.argsort(-contrib)[:2])
    print(f"score {p[i]:.2f} fraud={bool(y[cut + i])!s:<5} because: {top}")`,
  ],
];

export const glance: [string, string][] = [
  ["Decision loop", "stream → features → score → policy → decision → outcome → retrain"],
  ["Latency", "tens of ms total; design for p99; fall back instead of waiting"],
  ["Recall / precision", "TP ÷ all fraud / TP ÷ all blocked; report both"],
  ["Break-even p", "cost of block ÷ (cost of block + cost of miss)"],
  ["Class weights", "raw p inflates odds by w: p_true = p / (p + w(1 − p))"],
  ["PSI", "Σ (a − e)·ln(a / e): < 0.1 ok, 0.1–0.25 look, > 0.25 act"],
  ["Expected loss", "p × amount — rank review queues by it"],
  ["Validation", "split by time, gap = label delay, backtest by sliding"],
  ["Rare precision", "tpr·π ÷ (tpr·π + fpr·(1 − π))"],
  ["Capacity", "instances = ceil(peak ÷ (rate × utilisation)) + spares"],
];

export const lists: [string, string[]][] = [
  ["Features to build first", ["Transactions per card in 1 min / 10 min / 1 h (sliding)", "Amount ÷ card's average and max", "Distance and implied speed from the previous transaction", "New merchant category / country / device for this card", "Distinct cards per device and per IP today", "Merchant chargeback rate and age"]],
  ["What to log with every decision", ["Event id, time, card token, amount, merchant", "Score, action, reason codes, deciding layer", "Feature snapshot as seen by the model", "Model, rule and threshold versions", "Latency and degraded flag", "Later: label and its source and delay"]],
  ["Go-live checklist", ["Backtest on matured, time-split data with intervals", "Shadow mode with latency and missing-feature checks", "Thresholds chosen by cost and signed off", "Fallback and degraded policy tested", "Canary with automatic rollback", "Drift, approval-rate and queue alerts on"]],
  ["Interview scenarios", ["Design a real-time card fraud system", "Your model's precision halves next month", "Cut false declines by 20 % without more fraud", "Black Friday traffic ×5", "Label delay is 45 days — how do you train?", "Explain a decline to a customer"]],
];

export const materials: [string, [string, string][]][] = [
  ["Standards and regulation", [
    ["PCI Security Standards Council", "https://www.pcisecuritystandards.org/"],
    ["EU PSD2 and strong customer authentication (European Banking Authority)", "https://www.eba.europa.eu/"],
    ["GDPR overview (European Commission)", "https://commission.europa.eu/law/law-topic/data-protection_en"],
  ]],
  ["Building blocks", [
    ["Apache Kafka documentation", "https://kafka.apache.org/documentation/"],
    ["Apache Flink: stateful stream processing", "https://flink.apache.org/"],
    ["XGBoost documentation", "https://xgboost.readthedocs.io/"],
    ["SHAP: explaining model predictions", "https://shap.readthedocs.io/"],
  ]],
  ["Related tracks in this Atlas", [
    ["Machine learning", "/tools/ai/machine-learning"],
    ["Neural networks", "/tools/ai/neural-networks"],
    ["Cloud Lab: streaming and AWS building blocks", "/tools/cloud/aws"],
  ]],
];
