import { compare, lanes, queue, seq } from "../../visuals/kit.js";
import { arch, grp } from "../aws/kit.js";
import { py, type ConceptDef } from "../build.js";
import { n } from "./kit.js";
import { SIM, TOOLS } from "./sim.js";

/* Serving: the streaming architecture, the decision service, state, duplicates, review, explanations, rollout, failure. */

export const serve: ConceptDef[] = [
  {
    t: "The streaming architecture end to end",
    lv: 1,
    s: `Put the pieces together. The {{payments gateway}} sends each authorisation request to a {{decision service}} that fetches the card's current features from a fast {{online feature store}}, scores the in-memory {{model and rules}}, and answers within the budget. Every request and decision is written to an {{event stream}} (Kafka, Kinesis, Pub/Sub). From that stream, a {{stream processor}} keeps the features fresh (velocity counters, running statistics), a {{data lake}} stores history for training, a {{case-management}} tool receives review cases, and {{monitoring}} watches the numbers. A {{training pipeline}} builds the next model from matured data and publishes it to the decision service. Names differ by cloud, but this shape is the same everywhere. Pick a flow and click any box.`,
    r: `The hot path is only: gateway → decision service → feature lookup → score → answer. Everything else is asynchronous and must never be able to slow or break it.`,
    i: `Draw the architecture of a real-time fraud system and explain what is synchronous and what is asynchronous.`,
    v: arch(
      "Keep the synchronous path tiny (lookup, score, answer) and push everything else onto the stream.",
      [6, 3],
      [
        n("gw", "Payments gateway", "authorisation", "💳", 0, 1, "client", "Receives the authorisation request from the card network or the shop's checkout and waits for the decision."),
        n("dec", "Decision service", "hot path", "⚖", 1, 1, "compute", "Stateless service, several copies across zones. Reads features, scores the model, applies rules and policy, returns approve / step-up / review / decline, and emits the decision to the stream."),
        n("feat", "Online features", "key-value, ms", "⚡", 2, 0, "data", "A fast key-value store (in-memory or low-latency NoSQL) holding each card's, device's and merchant's latest velocity counters and statistics."),
        n("mdl", "Model + rules", "in memory", "🧠", 2, 2, "ai", "The current model artefact and rule set, loaded into the decision service's memory so scoring needs no network call."),
        n("stream", "Event stream", "Kafka / Kinesis", "🌊", 3, 1, "int", "Durable, ordered log of events and decisions, partitioned by card id so one card's events stay in order."),
        n("proc", "Stream processor", "windows, state", "🔄", 4, 0, "compute", "Keeps velocity windows and running statistics per card up to date and writes them to the online feature store."),
        n("lake", "Data lake", "history", "🗄", 4, 2, "data", "Cheap, long-term storage of every event, feature snapshot, decision and (later) label — the training set."),
        n("train", "Training pipeline", "batch", "🏋", 5, 2, "ai", "Builds point-in-time training sets from matured labels, trains and validates the next model, registers it."),
        n("case", "Case management", "analysts", "🕵", 5, 0, "client", "Receives review cases, shows evidence and reason codes, and records the analyst's verdict as a label."),
        n("mon", "Monitoring", "dashboards · alerts", "📊", 5, 1, "ops", "Tracks latency, approval rate, score and feature drift, queue age and (when they arrive) precision and recall."),
      ],
      ["gw>dec", "dec>feat", "dec>mdl", "dec>stream", ["stream", "proc", "events"], ["proc", "feat", "update"], "stream>lake", "lake>train", ["train", "mdl", "new model"], "stream>case", "stream>mon"],
      {
        "Score a payment": [
          ["gw", "dec", "The authorisation request arrives; the clock starts."],
          ["dec", "feat", "One key lookup returns the card's and device's current features (a millisecond or two)."],
          ["dec", "mdl", "The in-memory model and rules produce a score and a decision."],
          ["dec", "gw", "The answer goes back to the gateway inside the budget."],
          ["dec", "stream", "The decision, score, features and versions are logged asynchronously — never on the critical path."],
        ],
        "Keep features fresh": [
          ["stream", "proc", "The processor reads the event stream, partitioned by card."],
          ["proc", "feat", "It updates the card's velocity counters and running statistics, so the next lookup sees this payment."],
        ],
        "Learn from outcomes": [
          ["stream", "lake", "Every event and decision lands in the data lake."],
          ["lake", "train", "Weekly, matured labels turn the history into a training set."],
          ["train", "mdl", "A validated model is published and the decision service picks it up — first in shadow."],
          ["stream", "case", "Meanwhile review cases reach analysts, whose verdicts become new labels."],
        ],
      },
      [grp("Hot path (milliseconds)", 0, 1, 3, 2, "region")],
    ),
  },
  {
    t: "The decision service: timeouts and fallbacks",
    lv: 1,
    s: `The decision service is a small, stateless, horizontally scaled service with strict rules: every dependency call has a {{short timeout}} (a few milliseconds), there are {{no unbounded retries}} on the hot path, and each dependency has a {{fallback}}. If the feature store is slow, score with what the event itself contains plus cached defaults, mark the decision {{degraded}}, and lean on rules and conservative step-up. If the model service is unreachable, fall back to the last good model in memory or to rules only. Count every degraded decision: a rising fallback rate is an incident even when customers do not notice. The run shows eight requests where two exceed the 25 ms lookup timeout.`,
    r: `Test fallbacks on purpose (chaos tests): kill the feature store and confirm decisions keep flowing, degraded but safe.`,
    i: `The feature store becomes slow. What should happen to payments in flight, and what should you alert on?`,
    c: py`
TIMEOUT_MS = 25
lookup_ms = [12, 15, 9, 70, 14, 11, 95, 13]            # simulated feature-store latency per request

def decide(i, ms):
    if ms > TIMEOUT_MS:
        return "step up (rules only)", "DEGRADED"      # skip live features, be conservative
    return "model decision", "normal"

degraded = 0
for i, ms in enumerate(lookup_ms, 1):
    decision, mode = decide(i, ms)
    degraded += mode == "DEGRADED"
    print(f"request {i}: lookup {ms:>3} ms -> {decision:<22} [{mode}]")
print("degraded rate:", degraded / len(lookup_ms))`,
    v: seq(
      "A slow dependency never holds the payment hostage: time out, degrade, answer, and record that it happened.",
      ["Gateway", "Decision service", "Feature store", "Rules"],
      [
        [0, 1, "authorise €120", "The request arrives with a 100 ms budget."],
        [1, 2, "get features (timeout 25 ms)", "A short timeout protects the budget."],
        [2, 1, "…no answer in 25 ms", "The store is slow today.", "b"],
        [1, 3, "rules on the event only", "Fall back to rules with conservative thresholds."],
        [3, 1, "step up", "Uncertain, so ask for an extra check instead of risking fraud or a blind decline.", "r"],
        [1, 0, "step up · degraded=true", "The answer still arrives inside the budget; the flag feeds an alert on fallback rate.", "r"],
      ],
    ),
  },
  {
    t: "Partitioning and keyed state",
    lv: 2,
    s: `Velocity features need the {{latest state of one card}}: its counters and recent events. To keep that state fast and correct at thousands of events a second, the stream is {{partitioned by key}} — typically the card id: a hash of the key picks a partition, and each partition is processed by exactly one worker. All events of one card go to the same worker in order, so its windows and counters live in that worker's local memory and no two workers fight over them. Add partitions (and workers) to scale; a {{hot key}} (one device used by thousands of cards) can overload a partition, so use secondary keys or pre-aggregation for those. The run shows the same card always landing on the same partition.`,
    r: `Choose the partition key from the entity whose state you need most (card), and run a second keyed pipeline for other entities (device, merchant) with their own state.`,
    i: `Why partition the event stream by card id, and what problem does a very popular device id cause?`,
    c: py`
import hashlib
PARTITIONS = 4

def partition(key):
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % PARTITIONS    # stable across runs and machines

events = ["card_17", "card_42", "card_17", "card_99", "card_42", "card_17", "card_8", "card_99"]
for key in events:
    print(f"{key:<8} -> partition {partition(key)}")
counts = {}
for key in events:
    counts.setdefault(partition(key), set()).add(key)
print({p: sorted(keys) for p, keys in sorted(counts.items())})`,
    v: compare(
      "The same key always reaches the same worker, which can keep that card's state locally and in order.",
      ["Partition 0", "Partition 1", "Partition 2", "Partition 3"],
      [
        ["Worker", "owns its cards' state", "owns its cards' state", "owns its cards' state", "owns its cards' state"],
        ["Events", "all of card A, in order", "all of card B, in order", "all of card C, in order", "all of card D, in order"],
        ["Scale by", "more partitions + workers", "more partitions + workers", "more partitions + workers", "more partitions + workers"],
        ["Danger", "a hot key overloads one", "…", "…", "…"],
      ],
    ),
  },
  {
    t: "Duplicates, retries and out-of-order events",
    lv: 2,
    s: `Networks retry and streams deliver {{at least once}}, so the same event can arrive twice; events can also arrive {{out of order}}, because different devices and systems are not perfectly in step. Both corrupt features if ignored: a duplicate doubles a velocity count; a late event updates a window that was already used for a decision. Defences: give every event a unique {{event id}} and drop repeats ({{idempotency}}); process by {{event time}} rather than arrival time; use a {{watermark}} — "we accept events up to 60 seconds late" — and route anything later to a separate correction path; make state updates idempotent so replaying the stream gives the same result. The run feeds six events through a deduplicating, watermark-aware processor.`,
    r: `Decide up front whether a late fraud signal should change a decision already made (usually not, but it should still update features and labels).`,
    i: `The same payment event arrives twice and another arrives two minutes late. What breaks, and how do you handle each?`,
    c: py`
events = [("e1", 100), ("e2", 105), ("e1", 100), ("e3", 90), ("e4", 130), ("e5", 20)]   # (event_id, event_time in seconds)
LATENESS = 60
seen, watermark = set(), 0
for event_id, ts in events:
    if event_id in seen:
        print(event_id, "-> duplicate, ignored")
        continue
    seen.add(event_id)
    late = ts < watermark - LATENESS
    watermark = max(watermark, ts)
    print(event_id, "->", "too late: send to the correction path" if late else "processed", f"(event time {ts}, watermark {watermark})")`,
    v: seq(
      "Drop repeats by id, order by event time, and send anything beyond the allowed lateness to a separate path.",
      ["Stream", "Processor", "Feature state", "Correction path"],
      [
        [0, 1, "e1 (t=100)", "First delivery."],
        [1, 2, "count + 1", "Velocity updated."],
        [0, 1, "e1 (t=100) again", "A retry delivers the same event id."],
        [1, 1, "seen e1 → ignore", "Idempotency: the count is not doubled."],
        [0, 1, "e5 (t=20), watermark 130", "Far older than the 60-second lateness allowance."],
        [1, 3, "route e5 for later repair", "It cannot rewrite the past decision, but it can fix history for training.", "b"],
      ],
    ),
  },
  {
    t: "The review queue and case management",
    lv: 1,
    s: `Some payments are worth a human look. They go to a {{review queue}}, usually with a service-level goal ("decide within 15 minutes, or auto-decide"). Analysts see the transaction, the card's recent history, the reason codes and one-click actions (approve, decline, block card, call customer); their verdicts are the {{best labels}} you will get, so capture them in structured form. A queue is a classic capacity problem: when cases arrive faster than analysts clear them, it grows, cases age, and the SLA fails — so set the review band to match capacity, add triage by expected loss, and define what happens to overflow (auto-approve below a value, auto-decline above). Try it: raise the arrival rate or add analysts.`,
    r: `Report queue age and SLA breaches, not just length; a short queue of old cases is the danger.`,
    i: `Reviewers cannot keep up on Black Friday. What are your options, in order?`,
    v: queue(
      "When flagged payments arrive faster than analysts can decide, the queue fills and overflow rules start to decide for you.",
      { producer: "Flagged payments", queue: "Review queue", worker: "Analyst", arrival: 3, service: 0.7, workers: 3, capacity: 18, overflow: "drop" },
    ),
  },
  {
    t: "Explaining a decision: reason codes",
    lv: 2,
    s: `Customers, analysts, auditors and regulators ask "why was this blocked?". {{Reason codes}} answer it: for each decision, record the few features that pushed the score up most. For a linear model the {{contribution}} of a feature is simply {{weight × standardised value}}; for tree models, {{SHAP values}} give the same kind of per-feature push. Map technical features to plain reasons ("unusual amount for this card", "purchase far from the previous one", "many purchases in minutes"), store them with the decision, and show analysts the top three. Reason codes also help engineers: if one code suddenly dominates, a feature may be broken. Never show customers anything that helps a fraudster tune an attack.`,
    r: `Keep two vocabularies: detailed internal reasons for analysts and audits, and short generic wording for customers.`,
    i: `How would you explain to an analyst why the model flagged a payment?`,
    c: py`${SIM}${TOOLS}
rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p = predict(Z[cut:], w, b)
i = int(np.argmax(p))                                   # the most suspicious test transaction
reasons = ["unusually large purchase", "amount far above this card's normal", "many purchases in minutes", "far from the previous purchase (fast)", "first time at this merchant type"]
contrib = Z[cut + i] * w                                # weight x standardised value
print("score:", round(float(p[i]), 3), "| actually fraud:", bool(y[cut + i]))
for j in np.argsort(-contrib)[:3]:
    print(f"  +{contrib[j]:.2f}  {reasons[j]}")`,
    v: compare(
      "Turn each feature's push on the score into a plain reason, and keep the top few with the decision.",
      ["Analyst reason", "Customer wording"],
      [
        ["log_speed high", "Implied travel speed 8,700 km/h", "Unusual location"],
        ["velocity_10min high", "6 purchases in 10 minutes", "Unusual activity"],
        ["amount_z high", "Amount 14× this card's normal", "Unusual amount"],
        ["new_category", "First purchase in this merchant category", "New type of merchant"],
      ],
    ),
  },
  {
    t: "Shadow mode, champion/challenger and safe rollout",
    lv: 2,
    s: `A new model must prove itself on {{live traffic}} before it can decide. The usual ladder: {{offline backtest}} on matured data; {{shadow mode}} — the new model scores every real transaction and its output is logged but not acted on, so you can compare it with the live model and check latency and feature availability; {{champion/challenger}} — a small, random share of traffic is decided by the challenger; then a {{canary}} (5 %, 25 %, 50 %, 100 %) with automatic rollback on guardrail metrics (approval rate, alert rate, latency, fallback rate). Because declined payments yield no labels, a share of traffic is often held back for {{exploration}}. Every step is reversible within minutes.`,
    r: `Version the model, rules and thresholds together, and make "roll back to the previous version" a one-click, rehearsed action.`,
    i: `How do you deploy a new fraud model without risking a spike in fraud or false declines?`,
    v: lanes(
      "Each stage adds exposure only after the previous one passes: backtest, shadow, a small canary, then full traffic.",
      12,
      {
        "Backtest (offline)": [[0, 3, "matured history", "i"]],
        "Shadow (no effect)": [[3, 3, "scores logged only", "p"]],
        "Canary 5 % → 25 %": [[6, 3, "decides a slice", "w"]],
        "Full rollout": [[9, 3, "100 % + rollback ready", "g"]],
      },
      [[0, "Prove it on past data first."], [3, "Shadow: real traffic, zero risk — compare scores, latency and missing features."], [6, "A small share is decided by the new model while guardrail alerts watch for harm."], [9, "Full traffic once every guardrail stays green; the old version stays ready."]],
    ),
  },
  {
    t: "Fail open, fail closed, or degrade?",
    lv: 2,
    s: `Eventually something breaks, and you must decide in advance what a payment does when the fraud system cannot answer. {{Fail open}} approves everything (customers happy, fraudsters invited — a known attack is to trigger an outage); {{fail closed}} declines everything (safe from fraud, catastrophic for sales and trust). The professional answer is {{graceful degradation}}: fall back to progressively simpler layers — the previous model, then rules, then a conservative policy (approve low-value payments from trusted cards, step up or decline the rest) — and alarm loudly. The right setting differs by merchant, amount and risk appetite, so make it an explicit, tested policy rather than an accident of a timeout.`,
    r: `Write the degraded policy down, get the business to sign it, and rehearse it with game days.`,
    i: `Your fraud service is down. Do you approve or decline payments? Explain the trade-off.`,
    v: compare(
      "Neither extreme is right; degrade in steps and make the choice explicit.",
      ["Fail open", "Fail closed", "Degrade gracefully"],
      [
        ["Customers", "Happy", "Furious", "Mostly fine"],
        ["Fraud", "Wide open", "None", "Contained"],
        ["Attack risk", "Attackers cause outages on purpose", "Outage = lost sales", "Limited exposure per layer"],
        ["Verdict", "Only for tiny amounts", "Only for extreme risk", "The default"],
      ],
      2,
    ),
  },
];
