import { P, cells, compare, flow, lanes } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { SIM } from "./sim.js";

/* Data and features: the event, a simulator, windows, behaviour features, geography, linking, feature stores, time and labels. */

export const data: ConceptDef[] = [
  {
    t: "The transaction event and what surrounds it",
    lv: 1,
    s: `The raw event is small: {{card id}}, {{amount}}, {{currency}}, {{merchant}} and its category, {{country}} and terminal type, {{time}}, often a {{device id}} and {{IP address}} for online payments. Alone it says little; a fraud system's power comes from {{context}} joined to it in milliseconds: the card's past behaviour (typical amounts, usual merchants, home location), the merchant's own risk (chargeback history, new or old), the device's history across all cards, and lists (known-bad devices, allow-listed customers). The art is deciding which context is worth fetching within the latency budget, and building it so that exactly the same context is available later for training.`,
    r: `Treat the event schema as a contract: version it, validate it at the edge, and never let a field's meaning change silently (a currency or time-zone slip corrupts every feature built on it).`,
    i: `What data would you want to score a card payment, and which of it must be available within 100 ms?`,
    c: py`
event = {
    "event_id": "e_9f12", "card_id": "c_81f2", "amount": 49.90, "currency": "EUR",
    "merchant_id": "m_0042", "mcc": 5812, "country": "FR", "channel": "online",
    "device_id": "d_44a1", "ip": "203.0.113.7", "ts": "2026-10-17T10:02:11Z",
}
required = {"event_id", "card_id", "amount", "currency", "merchant_id", "ts"}
missing = required - event.keys()
print("valid" if not missing else f"missing: {sorted(missing)}")
print("fields:", len(event))`,
    v: cells(
      "A handful of fields, enriched in milliseconds with the card's, device's and merchant's history.",
      [P("field", ["card_id", "amount", "merchant", "country", "device_id", "time"]), P("event", ["c_81f2", "49.90 EUR", "Cafe Lune", "FR", "d_44a1", "10:02:11"])],
      [["The raw event: what the payment network and the shop tell us.", [[1, 0, 5]]], ["Join the card's history: typical amount, usual merchants, last location.", [[1, 0, 0], [1, 1, 1]]], ["Join the device's history: how many different cards has d_44a1 been used with today?", [[1, 4, 4]]], ["Join the merchant's risk: chargeback rate, age, category.", [[1, 2, 2]]]],
    ),
  },
  {
    t: "A simulator you can run: transactions with hidden fraud",
    lv: 1,
    s: `Real card data is private, so this track generates its own. The simulator creates {{150 cards}} over {{30 days}}: each card has a home location, three favourite merchant categories and a steady stream of normal purchases. It also adds {{genuine trips}} (a cardholder really is far from home) and {{14 compromised cards}}, each hit by a burst of high-value purchases — some far away, some near home so the signal is not trivial. Every row carries the true label. Because everything is seeded, the numbers printed by later examples are exact and repeatable, and because genuine odd behaviour overlaps with fraud, no model here reaches a perfect score — just like real life.`,
    r: `A simulator is also how teams test fraud systems safely: replay it through the pipeline, inject new attack patterns, and check detection and latency before real money is on the line.`,
    i: `Why simulate data when you have real transactions? What must a good simulator include?`,
    c: py`${SIM}
rows = make_data()
X, y = featurize(rows)
print("transactions:", len(rows), "| fraud:", int(y.sum()), f"({y.mean() * 100:.2f}%)")
print("feature names: log_amount, amount_z, velocity_10min, log_speed, new_category")
print("mean feature | fraud :", X[y == 1].mean(0).round(2))
print("mean feature | legit :", X[y == 0].mean(0).round(2))`,
    v: compare(
      "Fraud looks different on average — but individual cases overlap with odd-but-genuine behaviour, which is what makes the task hard.",
      ["Genuine", "Genuine trip", "Fraud far away", "Fraud near home"],
      [
        ["Amount", "small, steady", "normal", "high", "high"],
        ["Place", "near home", "far from home", "far from home", "near home"],
        ["Rhythm", "spread over days", "hours apart", "bursts of minutes", "bursts of minutes"],
        ["Hard because", "—", "looks like fraud on distance", "easy", "looks normal on distance"],
      ],
    ),
  },
  {
    t: "Velocity features and time windows",
    lv: 1,
    s: `Fraud is often about {{speed}}: five purchases in three minutes, fifty cards on one device in an hour. {{Velocity features}} count or sum events in a {{window}} ending now. A {{tumbling}} window cuts time into fixed, non-overlapping blocks (00:00–00:10, 00:10–00:20): cheap, but a burst split across a boundary looks small. A {{sliding}} window always covers "the last 10 minutes", so it never misses a burst, but needs more state. A {{session}} window groups events separated by gaps. Typical features: {{count of transactions in 1 min / 10 min / 1 h}}, {{distinct merchants}} in the last hour, {{sum of amounts}} in the last day, each per card, per device and per IP.`,
    r: `Use several window lengths together: short windows catch bursts, long ones define normal. Keep window state small with counters and expiry, not raw event lists.`,
    i: `A burst of five purchases straddles a 10-minute tumbling-window boundary. What does the feature see, and how does a sliding window differ?`,
    c: py`
from collections import deque

def sliding_counts(times, window=600):
    """For each event, how many events (including itself) happened in the last window seconds."""
    q, out = deque(), []
    for t in times:
        q.append(t)
        while q and t - q[0] > window:
            q.popleft()
        out.append(len(q))
    return out

times = [0, 100, 200, 590, 605, 610, 900, 2000]
print("sliding 10 min :", sliding_counts(times))
print("tumbling 10 min:", [sum(1 for u in times if u // 600 == t // 600 and u <= t) for t in times])`,
    v: lanes(
      "A burst that straddles a tumbling-window boundary is cut in two; a sliding window sees it whole.",
      12,
      {
        "Events": [[2, 1, "e1", "p"], [4, 1, "e2", "p"], [5, 1, "e3", "p"], [6, 1, "e4", "p"], [7, 1, "e5", "p"]],
        "Tumbling windows": [[0, 6, "window A: sees 3", "i"], [6, 6, "window B: sees 2", "i"]],
        "Sliding window (now = e5)": [[2, 6, "last 6 ticks: sees 5 events", "w"]],
      },
      [[0, "Five events arrive within six ticks."], [6, "Tumbling: the window boundary falls inside the burst, so each half looks small."], [7, "Sliding: the window ending at the latest event contains the whole burst — velocity 5."]],
    ),
  },
  {
    t: "Behaviour features: how different from this card's normal?",
    lv: 1,
    s: `A 400 purchase is ordinary for one customer and wildly odd for another, so fraud features are mostly {{deviations from the card's own history}}. The {{amount z-score}} {{(amount − mean) / standard deviation}} says how many "usual spreads" away it is. {{Ratios}} work too: amount ÷ the card's largest purchase in 90 days. {{Novelty}} flags: first time at this merchant category, this country, this device, this hour. Compute them from {{past events only}}, keep running means and spreads cheaply (counts, sums, sums of squares), and give new cards a sensible default because they have no history. These "relative to normal" features usually beat raw amounts.`,
    r: `Store per-card running statistics (count, mean, variance) rather than raw history; they update in one step per event and fit in a few bytes.`,
    i: `Why is "amount" a weak fraud feature on its own and "amount compared with this card's usual amounts" a strong one?`,
    c: py`
import numpy as np
history = np.array([20, 25, 30, 22, 28.0])          # this card's past purchases
mean, sd = history.mean(), history.std()
for amount in (27, 60, 400):
    print(f"amount {amount:>3}: z = {(amount - mean) / sd:7.1f}")
print("mean", mean, "| spread", round(float(sd), 2))`,
    v: compare(
      "The same amount can be normal or extreme: judge it against the card's own history.",
      ["Card A (usual 20–30)", "Card B (usual 300–500)"],
      [
        ["Purchase of 400", "extreme: z ≈ 100", "normal: z ≈ 0"],
        ["Purchase of 27", "normal", "tiny — maybe a card test"],
        ["Best feature", "amount ÷ own average", "amount ÷ own average"],
      ],
    ),
  },
  {
    t: "Geography: impossible travel",
    lv: 1,
    s: `Locations give some of the strongest signals. Compute the distance between this transaction and the card's {{previous}} one with the {{haversine}} formula (great-circle distance on a sphere), divide by the time gap, and you get the {{implied speed}}. A coffee in Paris at 10:00 and a purchase in New York 40 minutes later implies thousands of km/h: the card (or its details) is in two places. Other geo features: distance from home, a new country, mismatch between IP country and billing country. Beware legitimate cases — travellers, VPN users, cross-border online shops — which is why these are {{features for a model}}, not blunt rules.`,
    r: `Handle missing or low-precision locations (many online payments have only an IP-derived city); a default of "unknown" is better than a made-up distance.`,
    i: `A card pays in Paris and 40 minutes later in New York. Is that proof of fraud? How would you build the feature?`,
    c: py`
import numpy as np

def haversine_km(lat1, lon1, lat2, lon2):
    p = np.pi / 180
    a = np.sin((lat2 - lat1) * p / 2) ** 2 + np.cos(lat1 * p) * np.cos(lat2 * p) * np.sin((lon2 - lon1) * p / 2) ** 2
    return 12742 * np.arcsin(np.sqrt(a))

paris, new_york = (48.8566, 2.3522), (40.7128, -74.0060)
km = haversine_km(*paris, *new_york)
minutes = 40
print("distance km:", round(float(km), 1))
print("implied speed km/h:", round(float(km / (minutes / 60))))
print("a jet flies about 900 km/h ->", "impossible" if km / (minutes / 60) > 1000 else "possible")`,
    v: flow(
      "Distance and time together give a speed no traveller can reach — a strong sign the details are being used in two places.",
      "row",
      ["Paris|10:00 purchase", "New York|10:40 purchase|w", "Distance|5,837 km", "Implied speed|about 8,756 km/h|b", "Feature|log speed → model"],
      [[0, 1, "same card"], [1, 2, "haversine"], [2, 3, "÷ 40 min"], [3, 4]],
      [0, 1, 2, 3],
      ["Two purchases on the same card, 40 minutes apart.", "The great-circle distance between the two places is about 5,837 km.", "Divide by the 40-minute gap to get the speed needed to be in both places.", "About 8,756 km/h is faster than any airliner — the model receives a large 'speed' feature."],
    ),
  },
  {
    t: "Linking devices, cards and people",
    lv: 2,
    s: `Fraudsters reuse infrastructure: one phone, browser fingerprint, shipping address or IP is shared by many stolen cards or fake accounts. Treat entities as a {{graph}}: nodes are cards, devices, emails, addresses; an edge means "seen together". Features then ask graph questions: {{how many distinct cards has this device used today}}? {{How big is the connected cluster}} this account belongs to, and is any member already known-bad? Connected components (union-find) or a few hops of neighbourhood statistics are cheap enough to pre-compute near-real-time; heavier graph neural networks are usually a batch tool. Linking also needs care: a shared family computer or office Wi-Fi creates innocent links.`,
    r: `Cap hub nodes (a public Wi-Fi IP linked to thousands of people) so they do not poison cluster features.`,
    i: `How would you detect a ring of fake accounts sharing a few devices?`,
    c: py`
# union-find: group cards that share a device
parent = {}
def find(x):
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    parent[find(a)] = find(b)

seen = [("card1", "devA"), ("card2", "devA"), ("card3", "devA"), ("card3", "devB"), ("card4", "devB"), ("card5", "devC")]
for card, dev in seen:
    union(card, dev)
groups = {}
for node in parent:
    groups.setdefault(find(node), []).append(node)
for members in sorted(groups.values(), key=len, reverse=True):
    cards = sorted(m for m in members if m.startswith("card"))
    print(len(cards), "cards linked:", cards)`,
    v: flow(
      "Cards that share devices fall into one cluster; a known-bad member makes the whole cluster suspicious.",
      "row",
      ["card1", "card2", "device A|shared|w", "card3", "device B|shared|w", "card4|known fraud|b"],
      [[0, 2], [1, 2], [3, 2], [3, 4], [5, 4]],
      [0, 1, 2, 3, 4],
      ["card1 used device A.", "card2 used the same device A — one link.", "card3 used device A too: three cards on one device.", "…and card3 also used device B, which bridges to another group.", "card4 is already confirmed fraud and used device B: every card in the cluster now inherits suspicion."],
    ),
  },
  {
    t: "Feature stores: the same feature in training and in production",
    lv: 2,
    s: `The most common silent failure in fraud ML is {{training/serving skew}}: the feature the model learned from is computed one way in a batch notebook and another way in the live service, so the model sees different numbers in production. A {{feature store}} removes it by defining each feature {{once}} and serving it twice: an {{offline store}} (history for training, queried as of any past time) and an {{online store}} (the latest value, read in a few milliseconds by key). Streaming jobs update the online values as events arrive; the same definition backfills the offline history. Whether you buy one or build a small version, the rule is the same: one definition, two read paths.`,
    r: `Log the exact feature values the live model saw with each decision; they are the cheapest, most trustworthy training data for the next model.`,
    i: `What is training/serving skew and how does a feature store prevent it?`,
    v: flow(
      "One feature definition feeds both the offline store (training) and the online store (serving), so the model sees the same numbers it learned from.",
      "row",
      ["Event stream|payments", "Feature job|one definition|i", "Offline store|history for training", "Online store|latest value, ms reads", "Model|training / serving|g"],
      [[0, 1], [1, 2, "append"], [1, 3, "upsert"], [2, 4, "train"], [3, 4, "score"]],
      [0, 1, 2, 3, 4],
      ["Every payment event enters the stream.", "A single feature job computes velocity, z-scores and counters.", "Results are appended to the offline store, so training can ask 'what was the value at 10:02 last Tuesday?'.", "The same results are upserted to the online store for millisecond lookups.", "Training reads one store and serving reads the other — both made by the same code."],
    ),
  },
  {
    t: "Point-in-time correctness and label leakage",
    lv: 2,
    s: `When you build training rows from history, a feature may only use what was known {{at that moment}}. Compute "transactions in the last 10 minutes" with a window that peeks 10 minutes into the {{future}} and the model learns from information it will never have in production: offline scores look brilliant, live performance collapses. This is {{label leakage}} (or temporal leakage) and it is easy to cause with joins on the wrong timestamp, aggregates over the whole dataset, or features updated after the label is known. The defence is a {{point-in-time join}} — for every training row, fetch each feature as of that row's time — plus a time-based validation split.`,
    r: `If an offline metric looks too good to be true, suspect leakage first. Compare the distribution of each feature offline versus in live logs.`,
    i: `Your model scores 0.99 offline and 0.6 in production. What is your first hypothesis?`,
    c: py`
# one card's events (minutes). The last three are fraud.
times = [0, 300, 600, 601, 602, 603]
fraud = [0, 0, 0, 1, 1, 1]

def correct(i):    # only events BEFORE this one, within 10 minutes
    return sum(1 for j in range(i) if times[i] - times[j] <= 10)

def leaky(i):      # peeks at events up to 10 minutes AFTER this one
    return sum(1 for j in range(len(times)) if j != i and abs(times[i] - times[j]) <= 10)

for i, t in enumerate(times):
    print(f"t={t:>3} fraud={fraud[i]} correct={correct(i)} leaky={leaky(i)}")`,
    v: lanes(
      "The leaky feature counts events that happen after the decision — available in the notebook, never in production.",
      8,
      {
        "Events": [[1, 1, "e1", "p"], [4, 1, "e2 (decide here)", "w"], [5, 1, "e3", "p"], [6, 1, "e4", "p"]],
        "Correct feature": [[0, 4, "uses e1 only", "g"]],
        "Leaky feature": [[0, 7, "also sees e3, e4 (the future)", "b"]],
      },
      [[0, "At decision time only the past exists."], [4, "The correct feature stops at the decision point."], [5, "The leaky one keeps going, so burst-after-this-event information leaks into training."]],
    ),
  },
  {
    t: "Labels: late, noisy and biased",
    lv: 2,
    s: `A model needs labels — "was this fraud?" — and they are the weakest part of the data. They arrive {{late}}: a cardholder notices a charge days or weeks later and disputes it, and chargebacks can take a month or more to settle; recent transactions look "legit" simply because nobody has complained yet. They are {{noisy}}: friendly fraud marks real purchases as fraud, and some real fraud is never reported. And they are {{biased}}: if you decline a payment you never learn whether it was fraud. So training data must be built from {{matured}} periods only, noisy labels need review or de-noising, and the feedback loop (see monitoring) needs deliberate exploration. The run shows how few frauds are known a few days after they happen.`,
    r: `Measure label delay per source (customer report, chargeback, analyst decision) and only train on transactions older than the point where most labels have arrived.`,
    i: `Why do the most recent transactions in your training set contain too few frauds, and what should you do about it?`,
    c: py`
import numpy as np
rng = np.random.default_rng(1)
delay_days = rng.gamma(shape=2.0, scale=10.0, size=5000)      # days until a fraud is reported (mean 20)
for day in (1, 7, 14, 30, 60, 90):
    known = (delay_days <= day).mean()
    print(f"{day:>2} days after the fraud: {known * 100:5.1f}% of frauds are labelled")`,
    v: lanes(
      "Labels trail the events: only transactions old enough to have matured give a trustworthy training target.",
      12,
      {
        "Transaction happens": [[0, 1, "fraud", "b"]],
        "Customer notices": [[2, 3, "days to weeks", "w"]],
        "Dispute / chargeback": [[5, 4, "weeks to months", "w"]],
        "Label usable": [[9, 3, "matured → train", "g"]],
      },
      [[0, "A fraudulent payment is approved; in the data it is still just 'not fraud'."], [2, "Some customers notice quickly, many later."], [5, "Chargebacks settle weeks after the payment."], [9, "Only now is the label reliable — train on data this old or older."]],
    ),
  },
];
