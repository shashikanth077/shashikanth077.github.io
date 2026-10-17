import { bars, compare, lanes, par } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { LAB, stream } from "./kit.js";

/* Frame the problem: what is decided, how fast, what mistakes cost, and why accuracy is the wrong yardstick. */

export const frame: ConceptDef[] = [
  {
    t: "Real-time fraud detection in one picture",
    lv: 1,
    s: `When you tap a card, the shop's bank asks the card issuer {{"may I take this payment?"}} and waits. Inside that wait, usually well under a quarter of a second, a fraud system looks at the transaction and everything known about the card, device and merchant, and answers {{approve}}, {{decline}} or {{step up}} (ask for an extra check, or send it to a person). It must be {{fast}} (the customer is standing at the till), {{right}} (a missed fraud costs money; a wrongly blocked customer costs a sale and trust) and {{always available}} (if it is down, payments stop or fraud walks in). That is the whole project: turn a stream of events into a score, turn the score into a decision, measure what it cost, and keep learning as fraudsters adapt. Below, a live feed of transactions: move the two thresholds and watch fraud stopped, good customers blocked and the net money saved change at once.`,
    r: `Everything in this track is built around that loop: stream → features → score → decision → outcome → retrain. The live lab is synthetic (fraud is boosted to a few percent so you can see it; real card fraud is closer to a tenth of a percent).`,
    i: `Describe, end to end, what happens between a customer tapping a card and the system answering approve or decline.`,
    c: py`
def score(txn):
    """A toy risk score in [0, 1]: big amount, far from home, or a gift card."""
    s = 0.02
    if txn["amount"] > 500: s += 0.4
    if txn["country"] != txn["home"]: s += 0.3
    if txn["merchant"] == "gift cards": s += 0.2
    return min(s, 1.0)

def authorize(txn, review_at=0.4, decline_at=0.8):
    s = score(txn)
    if s >= decline_at: return "decline", s
    if s >= review_at: return "review", s
    return "approve", s

for t in [
    {"amount": 25,   "country": "FR", "home": "FR", "merchant": "grocery"},
    {"amount": 700,  "country": "FR", "home": "FR", "merchant": "electronics"},
    {"amount": 900,  "country": "US", "home": "FR", "merchant": "gift cards"},
]:
    print(authorize(t))`,
    v: stream("Two thresholds turn a score into approve / review / decline; the best setting is the cheapest mix of missed fraud, blocked customers and reviews.", { ...LAB }),
  },
  {
    t: "The latency budget",
    lv: 1,
    s: `Card networks expect an answer within a hard time limit, and the issuer's own approval path is only a part of it, so the fraud decision typically gets a budget of roughly {{50–150 ms}} (the exact figure depends on the network and your contract — treat the numbers here as illustrative). Every step spends from it: the network hop, looking up the card's recent behaviour, computing features, running the model, applying rules and policy, writing the decision. {{p99}} matters more than the average: if one request in a hundred takes 400 ms, thousands of customers a day see a timeout. So designs are driven by the slowest step: keep features pre-computed, models small, calls local, and always have a {{fallback}} (simple rules) for when something is slow.`,
    r: `Set a budget per stage, measure p50/p95/p99 of each, and alert on the sum. Never add a remote call to the hot path without a timeout and a fallback.`,
    i: `Your fraud model takes 80 ms at p99 and the total budget is 100 ms. What do you do?`,
    c: py`
budget_ms = 100
stages = {"network + gateway": 8, "feature lookup (cache)": 12, "model scoring": 6, "rules + policy": 3, "decision log (async)": 0}
used = sum(stages.values())
print("used:", used, "ms of", budget_ms)
print("headroom for p99 spikes:", budget_ms - used, "ms")
for name, ms in stages.items():
    print(f"{name:<24}{ms:>3} ms  {'#' * ms}")`,
    v: lanes(
      "The budget is spent in slices; the model is a small slice, data access is the big one — so optimise lookups first.",
      10,
      {
        "Gateway + network": [[0, 1, "8 ms", "p"]],
        "Feature lookup": [[1, 2, "12 ms (cache)", "i"]],
        "Model scoring": [[3, 1, "6 ms", "g"]],
        "Rules + policy": [[4, 1, "3 ms", "g"]],
        "Respond": [[5, 1, "answer sent", "g"]],
        "Spare for p99": [[6, 4, "headroom: timeouts, retries, slow neighbours", "w"]],
      },
      [[0, "The request arrives; the clock is already running."], [1, "Fetching the card's recent history is usually the slowest step: keep it in memory, close to the service."], [3, "A small model scores in a few milliseconds."], [6, "Unspent budget is your safety margin for slow moments — and the place a fallback must fit."]],
    ),
  },
  {
    t: "Types of fraud and their fingerprints",
    lv: 1,
    s: `"Fraud" is several different crimes, each leaving different traces, so one model rarely fits all. {{Card testing}}: thieves try many small payments to see which stolen cards work. {{Card-not-present}} (online) fraud uses stolen card details with no chip or PIN. {{Account takeover}}: a criminal logs in to a real account and changes details. {{Synthetic identity}}: a fake person built from real and invented data, nurtured for months, then "busted out". {{Friendly fraud}}: the real cardholder disputes a purchase they made. {{Money mules}}: accounts used to move stolen money on. Knowing the type tells you which signals to build (velocity for testing, device and login history for takeover, graph links for synthetic identity and mules).`,
    r: `Split performance by fraud type and channel: a model that is excellent on card testing can be blind to takeover, and the overall number hides it.`,
    i: `Why would you track a fraud detection metric separately for card testing and for account takeover?`,
    v: compare(
      "Different crimes, different clues: build features and rules for the type you are fighting.",
      ["What happens", "Tell-tale signal", "Best defence"],
      [
        ["Card testing", "Bots try many tiny payments on stolen cards", "Burst of small amounts, many cards, one merchant or IP", "Velocity limits, bot detection"],
        ["Card-not-present", "Stolen card details used online", "New device, mismatched address, risky merchant", "Device and behaviour features, 3-D Secure"],
        ["Account takeover", "Criminal logs in to a real account", "New device, password reset, changed email, then a big transfer", "Login history, step-up authentication"],
        ["Synthetic identity", "Invented identity built from real pieces", "Thin file, shared phone or address across 'people'", "Identity graph, consortium data"],
        ["Friendly fraud", "Cardholder disputes a real purchase", "Dispute pattern on a customer, delivery proof exists", "Evidence collection, dispute management"],
        ["Money mules", "Accounts relay stolen money", "Fast in-and-out, many senders, new account", "Graph analytics, transaction monitoring"],
      ],
    ),
  },
  {
    t: "What a mistake costs, both ways",
    lv: 1,
    s: `A {{missed fraud}} costs the goods or money, a chargeback fee and the time to handle it. A {{false positive}} — blocking a genuine customer — costs the sale, often the customer for good, and a support call. Both are real money, and the second is usually bigger than people expect because good transactions are 99.9 % of the volume: even a small false-decline rate hits far more customers than fraud ever does. A {{manual review}} costs analyst time. So the goal is never "catch all fraud" but {{minimise total cost}} (or maximise profit) under limits on customer friction and reviewer capacity. Try the sliders: raise recall and watch the fraud loss fall, then raise false declines and watch the bigger bill appear. All amounts here are illustrative.`,
    r: `Agree the cost of each outcome with the business before building anything. The threshold you choose later is just that cost trade-off written as a number.`,
    i: `Why is "catch as much fraud as possible" the wrong objective?`,
    v: bars(
      "Total cost has two sides — fraud that gets through and good customers turned away — so the cheapest policy is rarely the one that blocks the most.",
      [["Fraud that got through (per month)", "fl"], ["Good customers blocked (per month)", "fd"], ["Total", "fl+fd"]],
      {
        max: 130000,
        params: [par("r", "fraud rate (basis points)", 2, 40, 1, 10), par("rec", "fraud caught (recall %)", 30, 99, 1, 80), par("f", "good customers wrongly blocked (%)", 0.05, 1.5, 0.05, 0.3)],
        defs: [["fl", "1000000*(r/10000)*(1-rec/100)*60"], ["fd", "1000000*(1-r/10000)*(f/100)*20"]],
        readout: ["1,000,000 payments a month, average basket 60, each wrongly blocked customer costs 20 on average (illustrative)", "fraud rate {r} bp, {rec}% caught → fraud loss {round(fl)}; {f}% of good customers blocked → {round(fd)}"],
        steps: [["Baseline: 10 bp fraud, 80% caught, 0.3% good customers blocked.", { r: 10, rec: 80, f: 0.3 }], ["Catch 95% of fraud by being strict — but block 0.6% of good customers: the total gets worse.", { rec: 95, f: 0.6 }], ["A better model catches 90% while blocking only 0.15%.", { rec: 90, f: 0.15 }]],
      },
    ),
  },
  {
    t: "Why accuracy is the wrong score",
    lv: 1,
    s: `If only 0.2 % of transactions are fraud, a "model" that approves everything is {{99.8 % accurate}} — and catches nothing. This is the {{accuracy paradox}} of imbalanced problems: the metric rewards the majority class. Use measures that look at the rare class: {{recall}} (of all fraud, how much did we catch?), {{precision}} (of everything we flagged, how much was fraud?), their combination ({{F-score}}, {{PR-AUC}}), and above all {{money}} — the cost of the decisions. Drag the fraud rate: the do-nothing model stays "accurate" while catching zero.`,
    r: `Report recall, precision, alert rate and net savings together; never accuracy alone.`,
    i: `Your fraud model has 99.7 % accuracy. Is that good? What would you ask next?`,
    c: py`
import numpy as np
rng = np.random.default_rng(0)
y = (rng.random(100_000) < 0.002).astype(int)       # 0.2 % fraud
pred = np.zeros_like(y)                              # "approve everything"
accuracy = (pred == y).mean()
recall = (pred[y == 1] == 1).mean() if y.sum() else 0
print("fraud cases:", int(y.sum()))
print("accuracy of approve-all:", round(float(accuracy), 4))
print("recall of approve-all:", float(recall))`,
    v: bars(
      "The 'approve everything' model is nearly perfect by accuracy and useless in practice.",
      [["accuracy of 'approve everything'", "1-r/100"], ["fraud caught (recall)", "0"]],
      { percent: true, params: [par("r", "fraud share of transactions (%)", 0.05, 5, 0.05, 0.2)], readout: ["fraud share {r}% → accuracy {round((1-r/100)*10000)/100}%, recall 0%"], steps: [["0.2% fraud: 99.8% accurate, catches nothing.", { r: 0.2 }], ["Even at 5% fraud the useless model scores 95%.", { r: 5 }]] },
    ),
  },
  {
    t: "Batch, near-real-time and real-time",
    lv: 1,
    s: `Not every check needs to happen inside the payment. {{Real-time}} (milliseconds) is for the approve/decline decision that blocks the payment itself. {{Near-real-time}} (seconds to minutes) watches streams for patterns that do not need to stop the transaction — a burst of cards on one device, a sudden merchant spike — and can freeze an account or alert a team. {{Batch}} (hours to days) retrains models, rebuilds graphs, scores whole portfolios, and reconciles confirmed fraud. Real systems use all three: the expensive, slow analysis in the background produces the fast features and lists the real-time path simply reads.`,
    r: `Push as much work as possible out of the hot path: compute in the background, look up in the foreground.`,
    i: `Which fraud checks must be real-time and which can be near-real-time or batch? Give an example of each.`,
    v: compare(
      "Real-time decides the payment; near-real-time reacts to patterns; batch learns and prepares.",
      ["Real-time", "Near-real-time", "Batch"],
      [
        ["Latency", "milliseconds", "seconds – minutes", "hours – days"],
        ["Job", "Approve / decline this payment", "Detect bursts and rings, freeze accounts", "Train models, build graphs, score portfolios"],
        ["Data", "Pre-computed features + this event", "Windows over the live stream", "Months of history, confirmed labels"],
        ["Failure means", "Payments blocked or fraud passes", "Late reaction", "Stale models"],
      ],
    ),
  },
];
