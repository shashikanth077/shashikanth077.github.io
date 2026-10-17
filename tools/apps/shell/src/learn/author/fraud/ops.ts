import { bars, compare, lanes, layers, par } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Operations: drift, feedback loops, adaptation, privacy and compliance, capacity, the full blueprint. */

export const ops: ConceptDef[] = [
  {
    t: "Drift: when the world moves under the model",
    lv: 2,
    s: `A fraud model is trained on yesterday's world and judged in tomorrow's. {{Data drift}} means the inputs change (a new payment method, a holiday, a shop's marketing campaign); {{concept drift}} means the link between inputs and fraud changes (attackers switch tactics). Since true labels lag by weeks, watch the inputs and the scores now: the {{Population Stability Index}} compares today's distribution of a feature or the score with a reference period, bin by bin: {{PSI = Σ (actual% − expected%) × ln(actual% / expected%)}}. A common rule of thumb reads below 0.1 as stable, 0.1–0.25 as worth investigating and above 0.25 as a significant shift. Drift is a signal to look, not proof that the model is wrong — a campaign can shift traffic harmlessly.`,
    r: `Compute PSI daily for the score and the top features, by segment, and route alerts to a person who knows the business calendar.`,
    i: `Labels take a month to arrive. How do you know the model has degraded before they do?`,
    c: py`
import numpy as np

def psi(expected, actual):
    e, a = np.array(expected, float), np.array(actual, float)
    return float(((a - e) * np.log(a / e)).sum())

reference = [0.50, 0.30, 0.20]              # share of transactions in three score bands last month
calm      = [0.48, 0.31, 0.21]
shifted   = [0.40, 0.30, 0.30]
broken    = [0.20, 0.30, 0.50]
for name, today in (("calm", calm), ("shifted", shifted), ("broken", broken)):
    print(f"{name:<8} PSI = {psi(reference, today):.3f}")`,
    v: bars(
      "Move traffic from the low-score band to the high-score band and watch the stability index climb past the warning lines.",
      [["PSI (0.1 = look, 0.25 = act)", "-s*ln((0.5-s)/0.5)+s*ln((0.2+s)/0.2)"]],
      {
        max: 0.6,
        params: [par("s", "share moved from low to high band", 0, 0.3, 0.01, 0.1)],
        readout: ["{round(100*s)}% of traffic moved from the low to the high score band → PSI {round(1000*(-s*ln((0.5-s)/0.5)+s*ln((0.2+s)/0.2)))/1000}"],
        steps: [["No shift: PSI 0.", { s: 0 }], ["10% moved: about 0.06 — fine.", { s: 0.1 }], ["20% moved: about 0.24 — right at the action line.", { s: 0.2 }]],
      },
    ),
  },
  {
    t: "Feedback loops and selection bias",
    lv: 2,
    s: `You only learn the truth about transactions you {{let through}} (a chargeback arrives) or {{reviewed}} (an analyst decides). A declined payment gives no label: you never learn whether it was fraud. Train only on labelled data and the model sees a world filtered by its own past decisions: the frauds it already catches vanish from the data, it appears to {{work perfectly}}, and its weaknesses stay invisible. This is a {{feedback loop}} with {{selection bias}}. Countermeasures: keep a small {{random exploration}} slice (approve a few would-be declines under strict value limits), use analyst-reviewed and challenged samples, track the apparent fraud rate separately from the true one, and use techniques that weight examples by how likely they were to be observed.`,
    r: `Budget a small, deliberate "cost of learning": a fraction of a basis point of exploration protects the model from decaying silently.`,
    i: `Why can a model trained only on approved transactions look better than it is?`,
    c: py`
n, fraud = 1000, 30                       # 3 % fraud
declined_fraud, declined_good = 25, 5     # the model declines 30 payments, 25 of them genuinely fraud
labelled = n - (declined_fraud + declined_good)          # only approved payments ever get a chargeback label
fraud_seen = fraud - declined_fraud
print("true fraud rate        :", fraud / n)
print("fraud rate in the data :", round(fraud_seen / labelled, 4), f"({fraud_seen} cases in {labelled} labelled)")
print("fraud the model already stops is invisible in training:", declined_fraud)`,
    v: compare(
      "The data a model learns from is shaped by its own past decisions — unless you deliberately look at what it would have blocked.",
      ["What really happens", "What the training data shows"],
      [
        ["Fraud the model declined", "Stopped — real fraud", "Invisible: no label"],
        ["Genuine customers declined", "Lost sales", "Invisible: no label"],
        ["Fraud the model approved", "Loss", "Visible (chargeback)"],
        ["Result", "A model that blocks well", "Looks like fraud is rare and the model is perfect"],
      ],
    ),
  },
  {
    t: "Adversaries adapt: retraining and the arms race",
    lv: 2,
    s: `Fraudsters are an adaptive opponent: once a pattern is blocked, they probe, learn the thresholds and change tactics — smaller amounts, different merchants, slower bursts, new devices. So a fraud model's accuracy {{decays}} unless it is refreshed, and the pattern is a sawtooth: performance drops as attacks evolve, then recovers after a retrain or a new rule. Strategies: {{scheduled retraining}} (weekly or monthly) on the latest matured data; {{triggered retraining}} when drift or a precision drop is detected; {{fast rules}} to plug a hole within hours; and {{online learning}} for features such as counters. Do not publish your thresholds, randomise some decisions (e.g. step-up probability) to make probing harder, and keep human analysts looking for what the model cannot see.`,
    r: `Combine a slow, careful model refresh with a fast "rapid response" lane for new attacks, and track time-to-detect and time-to-mitigate for every new pattern.`,
    i: `Why does a fraud model lose accuracy over time even if the code never changes, and how do you counter it?`,
    v: lanes(
      "Detection quality saws down as attackers adapt and back up as rules and retrained models respond.",
      12,
      {
        "Attack pattern A": [[0, 4, "works → blocked by model v1", "b"]],
        "Attack pattern B (new)": [[4, 4, "slips through for a while", "b"]],
        "Rapid-response rule": [[5, 2, "hot-fix", "w"]],
        "Model v2 (retrained)": [[8, 4, "learns pattern B", "g"]],
      },
      [[0, "Model v1 does well against what it was trained on."], [4, "Fraudsters change tactics: a new pattern B is not in the training data."], [5, "A rule stops the bleeding within hours."], [8, "A retrained model absorbs the new pattern properly — until the next change."]],
    ),
  },
  {
    t: "Privacy, regulation and fairness",
    lv: 2,
    s: `Fraud systems handle sensitive data, so design for it. {{Data minimisation}}: use only what you need, {{tokenise or hash}} card numbers and identifiers so analysts and models see tokens, not raw values. {{PCI DSS}} governs how card data is stored, processed and accessed. Privacy law (for example the GDPR in Europe) limits what you may collect, how long you keep it and may give people rights around {{automated decisions}} — keep humans able to review, and be able to explain a decision. In the EU, {{PSD2}} requires strong customer authentication for most electronic payments, with exemptions that depend on a transaction's risk level, which ties directly to your scoring. Finally, test for {{unfair outcomes}}: error rates that differ by region, age group or new-versus-old customers can be both unethical and illegal, even when no protected attribute is a feature.`,
    r: `Involve legal and compliance early; log access to personal data; review fairness metrics (false-decline rate by segment) on the same dashboard as fraud loss.`,
    i: `What privacy and compliance constraints shape the design of a fraud detection system?`,
    c: py`
import hmac, hashlib
SECRET = b"rotate-me-and-keep-in-a-vault"          # in production: from a secrets manager, never in code

def token(card_number: str) -> str:
    """Keyed hash: stable for joins and features, useless without the key, not reversible."""
    return hmac.new(SECRET, card_number.encode(), hashlib.sha256).hexdigest()[:16]

print(token("4111111111111111"))
print(token("4111111111111111") == token("4111111111111111"))
print(token("4111111111111112"))`,
    v: compare(
      "Collect less, protect what you keep, explain decisions, and check that mistakes are spread fairly.",
      ["Practice"],
      [
        ["Card data", "PCI DSS scope: tokenise, restrict access, encrypt"],
        ["Personal data", "Minimise, set retention limits, log every access"],
        ["Automated decisions", "Human review path and explanations (reason codes)"],
        ["Payments rules (EU)", "PSD2 strong customer authentication; risk-based exemptions"],
        ["Fairness", "Compare false-decline and recall by segment; investigate gaps"],
      ],
    ),
  },
  {
    t: "Scale and cost: how many instances for peak traffic?",
    lv: 2,
    s: `Traffic is bursty — Black Friday can be several times a normal day — and the system must be sized for the {{peak}}, not the average. A rough capacity estimate: {{instances = peak requests per second ÷ (capacity of one instance × target utilisation)}}, rounded up, plus spare capacity so losing a node or a zone does not tip the service over. Keep utilisation well below 100 % (a common target is 50–60 %) because latency rises sharply as a server approaches saturation, and the p99 is what customers feel. Run load tests with realistic bursts, scale the feature store and the stream partitions with the same traffic, and watch the cost per million decisions as a first-class metric.`,
    r: `Autoscale on request rate and latency, pre-scale for known events, and keep enough partitions that you can add workers without re-keying.`,
    i: `Estimate the number of decision-service instances for 6,000 requests per second if one instance handles 800.`,
    c: py`
import math
peak_rps, per_instance_rps, target_utilisation, spare = 6000, 800, 0.6, 2
needed = math.ceil(peak_rps / (per_instance_rps * target_utilisation))
print("instances at 60% utilisation:", needed)
print("with 2 spare (lose a zone safely):", needed + spare)
print("instances if run at 100% (no headroom):", math.ceil(peak_rps / per_instance_rps))`,
    v: bars(
      "Headroom costs instances but buys low and stable tail latency — plan for the peak, not the average.",
      [["instances needed (incl. 2 spare)", "-floor(-(rps/(cap*u)))+2"]],
      {
        max: 60,
        params: [par("rps", "peak requests per second", 500, 20000, 500, 6000), par("cap", "capacity of one instance (req/s)", 200, 2000, 100, 800), par("u", "target utilisation", 0.3, 0.9, 0.05, 0.6)],
        readout: ["{rps} req/s ÷ ({cap} × {u}) → {-floor(-(rps/(cap*u)))} instances + 2 spare"],
        steps: [["6,000 req/s at 60% utilisation: 13 instances + 2 spare.", { rps: 6000, cap: 800, u: 0.6 }], ["Running hotter (90%) saves instances but risks the tail latency.", { u: 0.9 }], ["Black Friday triples the peak.", { rps: 18000, u: 0.6 }]],
      },
    ),
  },
  {
    t: "The full blueprint: build it in this order",
    lv: 1,
    s: `You do not build all of this at once. A sensible path, each step paying for itself: {{1.}} log every transaction and decision with enough detail to replay it, and start with a handful of {{rules}}; {{2.}} add behaviour and velocity {{features}} and a {{logistic regression}} baseline, validated on a time split; {{3.}} move to {{boosted trees}}, add {{calibration}} and choose thresholds by {{cost}}; {{4.}} build the {{streaming}} pipeline and feature store for fresh features and low latency; {{5.}} add {{step-up}}, a {{review queue}} and a feedback path for labels; {{6.}} add {{monitoring}}, drift alerts, shadow deployments and a retraining routine; {{7.}} only then consider graph and deep models. At each step measure money saved against the previous step.`,
    r: `The most valuable early investment is not a model: it is clean logging and a replayable decision history. Everything later depends on it.`,
    i: `You have six months and a small team. What do you build first, and how do you know each step was worth it?`,
    v: layers(
      "Build in layers, each justified by money saved; the foundation is trustworthy data and logging.",
      ["7 · Graph and deep models|rings, mules, sequences — only when simpler models plateau", "6 · Monitoring and retraining|drift alerts, shadow mode, canary, scheduled refresh", "5 · Step-up, review queue, feedback|better labels, fewer false declines", "4 · Streaming features and low latency|feature store, partitioned state, fallbacks", "3 · Boosted trees, calibration, cost thresholds|the main production model", "2 · Features and a logistic baseline|point-in-time, time-split validation", "1 · Logging and a few rules|replayable history first|g"],
      "build from the bottom",
    ),
  },
];
