import { L, P, area, bars, cells, circle, compare, curve, flow, hline, line, par, plot, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { emailHead, emailRows, eqX, table } from "./data.js";

/* Every code example is RUN by `npm run outputs -- machine-learning`. */

const spamLinks = [3, 4, 4, 5];
const sg = (t: string, lo: number[]) => lo.map((v) => `step(${t}-${v})`).join("+");

/* ------------------------------------------------------------------ */
export const tree: ConceptDef[] = [
  {
    t: "Decision tree: learn useful questions",
    lv: 1,
    s: `A decision tree predicts by following a path of yes/no questions to a leaf. Training chooses the questions: for a numeric feature the candidate thresholds are the midpoints between observed values (between 2 and 3 links: 2.5), and the best one is the split that leaves the purest groups. For our eight emails "links ≤ 2.5?" separates Normal from Spam perfectly. To predict an email with 2 links, answer yes and follow the left branch to Normal — no arithmetic beyond one comparison.`,
    r: `Trees are readable, need no scaling and handle mixed features. They build greedily: the best split at each step, not necessarily the best tree.`,
    i: `How does a decision tree classify a new example, and how does it choose the first question?`,
    c: py`
import numpy as np

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

def gini(labels):
    if len(labels) == 0:
        return 0.0
    p = np.bincount(labels, minlength=2) / len(labels)
    return float(1 - (p ** 2).sum())

values = np.unique(links)
best = None
for t in (values[:-1] + values[1:]) / 2:
    left, right = y[links <= t], y[links > t]
    w = (len(left) * gini(left) + len(right) * gini(right)) / len(y)
    if best is None or w < best[1]:
        best = (float(t), w)
print(best)
print("Spam" if 2 > best[0] else "Normal")`,
    v: flow("The tree learned from the eight emails: one question is enough.", "row",
      ["links ≤ 2.5?|root question|i", "Normal|leaf|g", "Spam|leaf|b"],
      [[0, 1, "yes"], [0, 2, "no"]], [0],
      ["A new email with 2 links: 2 ≤ 2.5 is true, so follow the yes branch to the Normal leaf."]),
  },
  {
    t: "Gini impurity and the best split",
    lv: 1,
    s: `{{Gini(node) = 1 − Σ pᵢ²}} measures how mixed a node is: 0 is pure; 0.5 is a 50/50 split of two classes. A split is scored by the WEIGHTED child Gini, {{Σ (n_child / n_parent) · Gini(child)}}, weighted by row counts. The impurity reduction is parent minus weighted children. The parent has 4 Spam and 4 Normal: Gini = 1 − 0.5² − 0.5² = 0.5. Drag the links threshold and watch the reduction peak at 2.5.`,
    r: `Exam: a node with 6 Spam and 4 Normal has Gini 1 − 0.36 − 0.16 = 0.48. Always write the formula, substitute, calculate, interpret.`,
    i: `Compare the splits "links ≤ 2.5" and "offer present" by Gini reduction.`,
    c: py`
import numpy as np

def gini(y):
    p = np.bincount(y, minlength=2) / len(y)
    return round(float(1 - (p ** 2).sum()), 4)

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
offer = np.array([0, 0, 1, 0, 1, 1, 0, 1])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

def weighted(mask):
    left, right = y[mask], y[~mask]
    return round((len(left) * gini(left) + len(right) * gini(right)) / len(y), 4)

print(gini(y), weighted(links <= 2.5), weighted(offer == 1))
print(gini(np.array([1] * 6 + [0] * 4)))`,
    v: bars("Gini of the parent (0.5), the weighted children and the reduction, for a split at the chosen links threshold.", [["parent Gini", "0.5"], ["weighted children", "W"], ["reduction", "0.5-W"]], {
      max: 0.5,
      params: [par("t", "links ≤ threshold", 0.5, 5.5, 1, 2.5)],
      defs: [
        ["ls", sg("t", spamLinks.slice(0, 1)) + "+2*step(t-4)+step(t-5)"],
        ["ln", "step(t-0)+2*step(t-1)+step(t-2)"],
        ["nl", "ls+ln"],
        ["gl", "1-(ls/max(1,nl))^2-(ln/max(1,nl))^2"],
        ["gr", "1-((4-ls)/max(1,8-nl))^2-((4-ln)/max(1,8-nl))^2"],
        ["W", "(nl*gl+(8-nl)*gr)/8"],
      ],
      readout: ["split links ≤ {t}: left has {nl} emails, right has {8-nl}   ·   weighted Gini {W:3}   ·   reduction {0.5-W:3}"],
      steps: [["Threshold 2.5: both children are pure, reduction 0.5 — the best.", { t: 2.5 }], ["Threshold 1.5: the right child still mixes 4 Spam and 1 Normal: reduction 0.3.", { t: 1.5 }], ["Threshold 0.5: almost no help: reduction 0.07.", { t: 0.5 }]],
    }),
  },
  {
    t: "Entropy and information gain",
    lv: 2,
    s: `Another measure of mixing: {{H(node) = −Σ pᵢ log₂ pᵢ}} in bits. A 50/50 node has H = 1 bit (maximum uncertainty); a pure node has H = 0. {{Information gain = H(parent) − Σ (n_child/n_parent) H(child)}}. The split "links ≤ 2.5" creates pure children, so the gain is the full 1 bit; "offer present" creates 3-to-1 children with H ≈ 0.8113 bits, gain ≈ 0.1887. Drag p.`,
    r: `Gini and entropy usually pick the same split. The convention 0 · log 0 = 0 makes a pure node contribute no uncertainty.`,
    i: `Compute the information gain of a split that produces two pure children from a 50/50 parent.`,
    c: py`
import numpy as np

def entropy(p):
    p = np.array(p)
    p = p[p > 0]
    return float((p * np.log2(1 / p)).sum())

print(entropy([0.5, 0.5]), entropy([1.0]), round(entropy([0.75, 0.25]), 4))
print(round(1 - entropy([0.75, 0.25]), 4))`,
    v: plot("Entropy of a two-class node as the share of Spam changes.", {
      x: [0, 1], y: [0, 1.1], labels: ["p (share of Spam)", "entropy (bits)"],
      params: [par("p", "p", 0.05, 0.95, 0.05, 0.5)],
      readout: ["p = {p}: entropy = {-p*log2(p)-(1-p)*log2(1-p):4} bits"],
      steps: [["p = 0.5: maximum uncertainty, 1 bit.", { p: 0.5 }], ["p = 0.75 (a 3-to-1 node): 0.8113 bits.", { p: 0.75 }], ["p = 0.95: almost pure, low entropy.", { p: 0.95 }]],
    }, [curve("-x*log2(x)-(1-x)*log2(1-x)", { c: "accent", from: "0.001", to: "0.999" }), pt("p", "-p*log2(p)-(1-p)*log2(1-p)", { c: "bad" })]),
  },
  {
    t: "Comparing candidate splits: Gini and gain side by side",
    lv: 2,
    s: `To choose a root, calculate every candidate split and pick the best. Candidate A, "links ≤ 2.5": children 4 Normal and 4 Spam, both pure: weighted Gini 0 (reduction 0.5), gain 1 bit. Candidate B, "offer present": two children each 3-to-1: Gini 0.375 each (reduction 0.125), gain 0.1887 bits. A wins under both criteria. Note: the best root is the best split at that step, not automatically the most causally important feature.`,
    r: `Child weights use row counts, not the number of features. Do not assume Gini and entropy agree on every dataset; calculate.`,
    i: `Which root would a tree pick for the eight emails, and why?`,
    c: py`
import numpy as np

def H(p):
    p = np.array([v for v in p if v > 0])
    return float((p * np.log2(1 / p)).sum())

parent = H([0.5, 0.5])
gain_a = parent - (0.5 * H([1.0]) + 0.5 * H([1.0]))
gain_b = parent - (0.5 * H([0.75, 0.25]) + 0.5 * H([0.75, 0.25]))
print(round(parent, 4), round(gain_a, 4), round(gain_b, 4))`,
    v: cells("The same eight emails, two candidate roots.", table(["candidate", "child Gini", "weighted Gini", "reduction", "info gain"], [["A: links ≤ 2.5", "0 and 0", "0", "0.5", "1 bit"], ["B: offer present", "0.375 and 0.375", "0.375", "0.125", "0.1887 bits"]]), [
      ["Parent: 4 Spam and 4 Normal, Gini 0.5, entropy 1 bit."],
      ["A produces two pure children — everything is explained by one question.", [[1, 0, 4]]],
      ["B leaves each child 3-to-1 mixed — little progress.", [[2, 0, 4]]],
      ["A has the larger reduction and gain, so A becomes the root.", [[1, 3, 4]]],
    ]),
  },
  {
    t: "Tree depth, overfitting and pruning",
    lv: 1,
    s: `An unlimited tree keeps splitting until every training row is classified, memorising noise and rare mistakes — even arbitrary identifiers. Limit it with {{max_depth}}, {{min_samples_leaf}}, or cost-complexity pruning, and compare training with validation scores. As depth grows, training accuracy rises to 1.0 while validation accuracy peaks and then falls. (Illustrative curves; real ones depend on the data.)`,
    r: `Ordinary trees need no scaling, but missing values and categories still need handling.`,
    i: `How do you stop a decision tree from overfitting?`,
    v: plot("Training accuracy keeps climbing; validation accuracy peaks at a moderate depth.", {
      x: [1, 10], y: [0.4, 1.05], labels: ["max depth", "accuracy"],
      params: [par("d", "max_depth", 1, 10, 1, 4)],
      readout: ["depth {d}: training {1-0.4*exp(-0.9*d):2}, validation {0.9-0.4*exp(-0.9*d)-0.002*d^2:2}"],
      steps: [["Depth 1: both accuracies are low (underfit).", { d: 1 }], ["Depth 4: validation accuracy is at its best.", { d: 4 }], ["Depth 10: training near 1.0, validation has dropped (overfit).", { d: 10 }]],
    }, [curve("1-0.4*exp(-0.9*x)", { c: "good", label: "training" }), curve("0.9-0.4*exp(-0.9*x)-0.002*x^2", { c: "bad", label: "validation" }), vline("d", { c: "muted", dash: true })]),
  },
  {
    t: "Random forest: a committee of different trees",
    lv: 2,
    s: `A forest trains many trees, each on a {{bootstrap sample}} (rows drawn with replacement, so some repeat and some are left out) and with only a random subset of features at each split, so the trees differ. For a new email each tree gives a probability; the forest averages them: (0.9 + 0.4 + 0.8) / 3 = 0.7, so at threshold 0.5 it predicts Spam. (Simple majority voting would also say Spam, 2 votes to 1; scikit-learn averages probabilities.) Drag the three probabilities.`,
    r: `Out-of-bag rows (those a tree never saw) give a built-in validation estimate. More trees steady the result but cost time; a forest is less readable than one tree.`,
    i: `How does a random forest reduce variance compared with a single tree?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
probs = np.array([0.9, 0.4, 0.8])
print(round(float(probs.mean()), 2), (probs > 0.5).astype(int).tolist())
fractions = [len(np.unique(rng.integers(0, 8, 8))) / 8 for _ in range(2000)]
print(round(float(np.mean(fractions)), 2))`,
    v: bars("Each tree's P(Spam) and the forest's average.", [["tree 1", "a"], ["tree 2", "b"], ["tree 3", "c"], ["forest (average)", "(a+b+c)/3"]], {
      percent: true,
      params: [par("a", "tree 1", 0, 1, 0.05, 0.9), par("b", "tree 2", 0, 1, 0.05, 0.4), par("c", "tree 3", 0, 1, 0.05, 0.8)],
      readout: ["average P(Spam) = {(a+b+c)/3:2}  →  predict Spam when it is at least 0.5"],
      steps: [["The example: 0.9, 0.4, 0.8 → 0.7 → Spam.", { a: 0.9, b: 0.4, c: 0.8 }], ["One confident tree can be outvoted: 0.9, 0.2, 0.3 → 0.47 → Normal.", { a: 0.9, b: 0.2, c: 0.3 }]],
    }),
  },
  {
    t: "Gradient boosting: add small corrections",
    lv: 2,
    s: `Boosting builds the model in stages. Keep a log-odds score F and convert it with the sigmoid p = 1/(1 + e⁻ᶠ). Start from the base rate: if 40% of emails are Spam, F₀ = ln(0.4/0.6) ≈ −0.4055, p₀ = 0.4. Each new small tree is fitted to the direction that reduces the loss (for logistic loss the signal is y − p) and added with a learning rate η: {{F_new = F_old + η·h(x)}}. With the supplied corrections 0.8 and 0.6 and η = 0.5 the probability climbs 0.40 → 0.4986 → 0.5731 and crosses the 0.5 threshold. Drag the stage.`,
    r: `The corrections 0.8 and 0.6 are teaching values; real trees learn leaf values from gradients. Smaller η needs more trees; depth, η, stages and early stopping interact. AdaBoost, not gradient boosting, "re-weights wrong rows".`,
    i: `How does gradient boosting differ from a random forest?`,
    c: py`
import numpy as np

sigmoid = lambda f: 1 / (1 + np.exp(-f))
F0 = np.log(0.4 / 0.6)
F1 = F0 + 0.5 * 0.8
F2 = F1 + 0.5 * 0.6
for F in (F0, F1, F2):
    print(round(float(F), 4), round(float(sigmoid(F)), 4))`,
    v: bars("Probability of Spam after each boosting stage.", [["P(Spam)", "sigmoid(-0.4054651+eta*(0.8*step(s-0.5)+0.6*step(s-1.5)))"]], {
      params: [par("s", "stage", 0, 2, 1, 0), par("eta", "learning rate η", 0.1, 1, 0.1, 0.5)],
      readout: ["stage {s}: F = {-0.4054651+eta*(0.8*step(s-0.5)+0.6*step(s-1.5)):3}"],
      steps: [["Stage 0: the base rate, 0.40.", { s: 0, eta: 0.5 }], ["Stage 1: add 0.5 × 0.8 → 0.4986, still below 0.5.", { s: 1, eta: 0.5 }], ["Stage 2: add 0.5 × 0.6 → 0.5731, now Spam.", { s: 2, eta: 0.5 }], ["A bigger η = 1 moves faster (and can overfit).", { s: 2, eta: 1 }]],
    }),
  },
  {
    t: "Bagging versus boosting",
    lv: 2,
    s: `Both combine many trees but in opposite ways. A {{random forest}} (bagging) trains trees independently on random samples and averages them: it mainly reduces VARIANCE. {{Gradient boosting}} trains trees one after another, each correcting the current model: it reduces BIAS but can overfit, so it needs a small learning rate, shallow trees and early stopping. Both are strong defaults for tabular data and neither needs feature scaling.`,
    r: `Try a forest first for a robust baseline, then a boosted model when you can tune carefully with cross-validation.`,
    i: `In one sentence: forest versus boosting.`,
    v: compare("Independent committee versus sequential correction.", ["Random forest", "Gradient boosting"], [
      ["Trees are trained", "independently, in parallel", "one after another"],
      ["Each tree sees", "a bootstrap sample + random features", "the errors of the model so far"],
      ["Combines by", "averaging / voting", "adding scaled corrections"],
      ["Mainly reduces", "variance", "bias"],
      ["Main risk", "less interpretable, large models", "overfitting if too many strong stages"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
const knnPts: [string, number, number, number][] = [["N1", 1, 1, 0], ["N2", 2, 1, 0], ["N3", 1, 2, 0], ["S1", 4, 4, 1], ["S2", 5, 4, 1], ["S3", 4, 5, 1]];
const knnDefs: [string, string][] = [
  ...knnPts.map(([, x, y], i) => [`d${i}`, `sqrt((qx-${x})^2+(qy-${y})^2)`] as [string, string]),
  ...knnPts.map((_, i) => [`c${i}`, knnPts.flatMap((__, j) => (j === i ? [] : [`step(d${i}-d${j}-0.0000001)`])).join("+")] as [string, string]),
  ...knnPts.map((_, i) => [`n${i}`, `step(k-c${i})`] as [string, string]),
  ["sv", "n3+n4+n5"],
];

export const classic: ConceptDef[] = [
  {
    t: "Naive Bayes: prior times evidence",
    lv: 1,
    s: `{{P(class | clues) ∝ P(class) × Π P(clue | class)}}. For a new email with offer = yes and links > 2.5 = yes, using Laplace smoothing {{(count + 1)/(rows + 2)}} for each yes/no clue: P(Spam) = 0.5, P(offer | Spam) = 4/6, P(links | Spam) = 5/6, so the Spam score is 0.5 × 4/6 × 5/6 = 10/36; for Normal, 0.5 × 2/6 × 1/6 = 1/36. Normalise: P(Spam | clues) = 10/11 ≈ 0.9091. "Naive" = features are treated as independent given the class. Toggle the clues.`,
    r: `The 90.9% is the model's posterior under its assumptions, not a guarantee that 90.9% of similar emails are spam.`,
    i: `Calculate P(Spam | offer = no, links high = yes) with the table above.`,
    c: py`
n = 4
p_yes = lambda count: (count + 1) / (n + 2)
prior = 0.5
spam = prior * p_yes(3) * p_yes(4)
normal = prior * p_yes(1) * p_yes(0)
print(round(spam, 4), round(normal, 4))
print(round(spam / (spam + normal), 4))
spam2 = prior * (1 - p_yes(3)) * p_yes(4)
normal2 = prior * (1 - p_yes(1)) * p_yes(0)
print(round(spam2 / (spam2 + normal2), 4))`,
    v: bars("Posterior probability for the chosen clues (1 = yes, 0 = no).", [
      ["P(Spam | clues)", "(0.5*(o*4/6+(1-o)*2/6)*(h*5/6+(1-h)*1/6))/((0.5*(o*4/6+(1-o)*2/6)*(h*5/6+(1-h)*1/6))+(0.5*(o*2/6+(1-o)*4/6)*(h*1/6+(1-h)*5/6)))"],
      ["P(Normal | clues)", "(0.5*(o*2/6+(1-o)*4/6)*(h*1/6+(1-h)*5/6))/((0.5*(o*4/6+(1-o)*2/6)*(h*5/6+(1-h)*1/6))+(0.5*(o*2/6+(1-o)*4/6)*(h*1/6+(1-h)*5/6)))"],
    ], {
      percent: true,
      params: [par("o", "offer present? (1 = yes)", 0, 1, 1, 1), par("h", "more than 2.5 links? (1 = yes)", 0, 1, 1, 1)],
      steps: [["Both clues present: 10/11 = 91% Spam.", { o: 1, h: 1 }], ["Offer absent, many links: 5/7 = 71% Spam.", { o: 0, h: 1 }], ["No clues: the Normal evidence wins.", { o: 0, h: 0 }]],
    }),
  },
  {
    t: "Laplace smoothing: no zero probabilities",
    lv: 2,
    s: `If no Normal email in training had many links, P(high links | Normal) = 0/4 = 0, and the whole Normal score — a product — becomes 0 whatever the other clues say. {{Laplace smoothing}} adds α = 1 to every count: (0 + 1)/(4 + 2) = 1/6. It makes unseen combinations possible without changing the model's main shape. For words, the denominator adds α × vocabulary size.`,
    r: `Multiplying many small probabilities underflows; real implementations add log probabilities instead.`,
    i: `Why does Naive Bayes use smoothing?`,
    c: py`
import numpy as np

count, rows = 0, 4
print(count / rows, round((count + 1) / (rows + 2), 4))
probs = np.full(400, 0.01)
print(float(np.prod(probs)), round(float(np.log(probs).sum()), 1))`,
    v: compare("The same Normal-class clue, with and without smoothing.", ["No smoothing", "α = 1"], [
      ["P(high links | Normal)", "0 / 4 = 0", "(0 + 1) / (4 + 2) = 0.167"],
      ["Normal score", "0 — always loses", "small but positive"],
      ["Unseen clue combinations", "impossible", "allowed"],
      ["Long documents", "multiply → underflow", "sum logs instead"],
    ], 1),
  },
  {
    t: "Which Naive Bayes? Bernoulli, multinomial, Gaussian",
    lv: 2,
    s: `Match the likelihood to the feature type. {{Bernoulli}}: yes/no presence ("does 'offer' appear?"). {{Multinomial}}: counts of events such as words. {{Gaussian}}: continuous numbers modelled by a bell curve per class. Multinomial example: spam counts [offer 3, free 2, meeting 0, project 0], Normal [0, 0, 3, 2]; with α = 1 each denominator is 5 + 4 = 9, and for "offer free": Spam 0.5 × 4/9 × 3/9, Normal 0.5 × 1/9 × 1/9 → P(Spam) = 12/13 ≈ 0.9231. Gaussian: density f(x) = exp(−(x−μ)²/2σ²)/(σ√2π); at x = 1 with means 0 and 3, σ = 1 the densities are 0.24197 and 0.05399, so Normal ≈ 0.8176.`,
    r: `Multinomial NB expects non-negative values, so z-scoring its input breaks it. A density is not the probability of one exact value.`,
    i: `Which Naive Bayes variant suits word counts, and which suits a continuous measurement?`,
    c: py`
import numpy as np

vocab = 4
spam_counts, normal_counts = np.array([3, 2, 0, 0]), np.array([0, 0, 3, 2])
p = lambda c, i: (c[i] + 1) / (c.sum() + vocab)
spam = 0.5 * p(spam_counts, 0) * p(spam_counts, 1)
normal = 0.5 * p(normal_counts, 0) * p(normal_counts, 1)
print(round(spam / (spam + normal), 4))
pdf = lambda x, m, s: np.exp(-(x - m) ** 2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi))
fn, fs = pdf(1, 0, 1), pdf(1, 3, 1)
print(round(float(fn), 5), round(float(fs), 5), round(float(fn / (fn + fs)), 4))`,
    v: compare("Choose the likelihood model by feature type.", ["Data assumption", "Example"], [
      ["Bernoulli", "binary presence / absence", "does the word \"offer\" appear?"],
      ["Multinomial", "non-negative event counts", "how often does each word appear?"],
      ["Gaussian", "continuous values, bell curve per class", "message length (standardised)"],
    ]),
  },
  {
    t: "k-nearest neighbours: ask the closest examples",
    lv: 1,
    s: `kNN does no training beyond storing the labelled points. To classify a query it measures the distance to every stored point, takes the {{k}} nearest and lets them vote. With Normal N1 = (1,1), N2 = (2,1), N3 = (1,2), Spam S1 = (4,4), S2 = (5,4), S3 = (4,5) and query Q = (2,2): distances √2, 1, 1 for the Normals and √8, √13, √13 for the Spam points; the three nearest are all Normal. Move the query and change k: rings mark the voters.`,
    r: `Choose k with validation data, not test labels. Scale features first; big-feature scale distorts neighbours.`,
    i: `Classify Q = (2, 2) with k = 3 using the table above.`,
    c: py`
import numpy as np

train = {"N1": (1, 1, "Normal"), "N2": (2, 1, "Normal"), "N3": (1, 2, "Normal"),
         "S1": (4, 4, "Spam"), "S2": (5, 4, "Spam"), "S3": (4, 5, "Spam")}
q = (2, 2)
d = sorted((round(float(np.hypot(x - q[0], y - q[1])), 3), name, label) for name, (x, y, label) in train.items())
print(d[:3])
votes = [label for _, _, label in d[:3]]
print(max(set(votes), key=votes.count))`,
    v: plot("Blue = Normal, red = Spam. The rings mark the k nearest points to the query ✕.", {
      x: eqX(0, 6, 3), y: [0, 6], labels: ["suspicious-word score", "link score"],
      params: [par("qx", "query x", 0, 6, 0.25, 2), par("qy", "query y", 0, 6, 0.25, 2), par("k", "k", 1, 5, 2, 3)],
      defs: knnDefs,
      readout: ["{sv} of the {k} nearest are Spam  →  predict " + "Spam if more than half"],
      steps: [["Q = (2, 2), k = 3: all three nearest are Normal.", { qx: 2, qy: 2, k: 3 }], ["Move Q toward the Spam group: the vote flips.", { qx: 4, qy: 3.5, k: 3 }], ["k = 5 reaches across both groups from the middle.", { qx: 3, qy: 3, k: 5 }]],
    }, [
      ...knnPts.map(([, x, y, c]) => pt(String(x), String(y), { c: c ? "bad" : "info" })),
      ...knnPts.map(([, x, y], i) => circle(String(x), String(y), "0.3", { c: "warn", show: `n${i}-0.5` })),
      pt("qx", "qy", { c: "good", label: "Q" }),
    ]),
  },
  {
    t: "kNN details: k, weights and scaling",
    lv: 2,
    s: `Small k follows noisy neighbours; large k smooths away small groups; an odd k avoids many binary ties (not every tie). Instead of one vote each you can weight neighbours by {{1/d}} so closer ones count more. Example: nearest labels [Normal, Spam, Spam] at distances 1, 2, 2.5: uniform voting says Spam (2 to 1); distance-weighted gives Normal 1.0 versus Spam 0.5 + 0.4 = 0.9 → Normal. The two rules can disagree. Zero-distance matches need special handling, and features must be scaled.`,
    r: `Choose k, the distance and the weighting together with cross-validation. Prediction cost grows with the training set because every query searches all points.`,
    i: `Give an example where uniform and distance-weighted kNN disagree.`,
    c: py`
import numpy as np

labels = ["Normal", "Spam", "Spam"]
d = np.array([1.0, 2.0, 2.5])
uniform = {"Normal": 1, "Spam": 2}
w = 1 / d
weighted = {"Normal": float(w[0]), "Spam": float(w[1] + w[2])}
print(uniform)
print({k: round(v, 2) for k, v in weighted.items()})`,
    v: compare("Three kNN choices that change the answer.", ["Effect", "Rule of thumb"], [
      ["k", "small: noisy; large: blurred", "choose with validation; try odd values"],
      ["Voting", "uniform vs 1/d weights", "weights help when neighbours are very unequal"],
      ["Distance", "Euclidean, Manhattan, cosine …", "must match the meaning of similarity"],
      ["Scaling", "unscaled features dominate", "standardise inside a pipeline"],
    ]),
  },
  {
    t: "SVM: the widest-margin boundary",
    lv: 2,
    s: `A linear SVM separates classes with a line (plane, hyperplane) chosen to have the widest margin. With Normal points (1,1), (2,2) and Spam points (4,4), (5,5) the line x + y = 6 works: {{f(x) = w·x + b}} with w = (0.5, 0.5), b = −3. f > 0 means Spam, f &lt; 0 Normal. The closest points, (2,2) with f = −1 and (4,4) with f = +1, are the {{support vectors}}; each is 1/‖w‖ = 1.414 from the line, so the margin is 2/‖w‖ = 2.828. Move Q: Q = (4,3) scores 0.5 → Spam at distance 0.707. A score is not a probability.`,
    r: `Only the support vectors fix the boundary. Calibrate separately if you need probabilities.`,
    i: `Find the SVM score and distance to the boundary for Q = (4, 3).`,
    c: py`
import numpy as np

w, b = np.array([0.5, 0.5]), -3
f = lambda x: float(w @ np.array(x) + b)
print(f((2, 2)), f((4, 4)), round(float(np.linalg.norm(w)), 4))
print(round(1 / float(np.linalg.norm(w)), 3), round(2 / float(np.linalg.norm(w)), 3))
print(f((4, 3)), round(f((4, 3)) / float(np.linalg.norm(w)), 3))`,
    v: plot("Solid line: boundary. Dashed lines: margin edges through the support vectors.", {
      x: eqX(0, 7, 3.5), y: [0, 7], labels: ["x₁", "x₂"],
      params: [par("qx", "Q x", 0, 7, 0.25, 4), par("qy", "Q y", 0, 7, 0.25, 3)],
      readout: ["score f(Q) = 0.5·{qx} + 0.5·{qy} − 3 = {0.5*qx+0.5*qy-3:2}   ·   distance to the line = {abs(0.5*qx+0.5*qy-3)/0.7071068:3}"],
      steps: [["Q = (4, 3): score 0.5 → Spam side, distance 0.707.", { qx: 4, qy: 3 }], ["Q on the line (3, 3): score 0.", { qx: 3, qy: 3 }], ["Q = (1.5, 1.5): score −1.5, clearly Normal.", { qx: 1.5, qy: 1.5 }]],
    }, [
      line("3", "3", "-1", { c: "accent", label: "f = 0" }), line("2", "2", "-1", { c: "info", dash: true }), line("4", "4", "-1", { c: "bad", dash: true }),
      ...[[1, 1], [2, 2]].map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      ...[[4, 4], [5, 5]].map(([x, y]) => pt(String(x), String(y), { c: "bad" })),
      pt("qx", "qy", { c: "good", label: "Q" }),
    ]),
  },
  {
    t: "Soft margin: the C trade-off and hinge loss",
    lv: 2,
    s: `Real data is rarely perfectly separable. The standard soft-margin objective is {{½‖w‖² + C Σ max(0, 1 − yᵢ f(xᵢ))}}: the first term prefers a wide margin, the second (hinge loss) charges for points inside the margin or on the wrong side. A larger C punishes violations more (narrower margin, risk of overfitting); a smaller C tolerates them (wider margin, more regularised). With ½‖w‖² = 0.25 and one Normal point inside the Spam side with loss 1.5, the objective is 0.25 + 1.5C. Drag the margin y·f(x).`,
    r: `Choose C (and the kernel's γ) by validation after scaling. Training loss alone always prefers a huge C.`,
    i: `What does a large C do in an SVM?`,
    c: py`
import numpy as np

w = np.array([0.5, 0.5]); b = -3.0
X = np.array([[1, 1], [2, 2], [4, 4], [5, 5], [3.5, 3.5]])
y = np.array([-1, -1, 1, 1, -1])
margins = y * (X @ w + b)
hinge = np.maximum(0, 1 - margins)
print(margins.tolist(), hinge.tolist())
for C in (1, 10):
    print(C, 0.5 * float(w @ w) + C * float(hinge.sum()))`,
    v: plot("Hinge loss max(0, 1 − m): zero once the margin m reaches 1, growing as the point crosses the boundary.", {
      x: [-2, 3], y: [0, 3.5], labels: ["margin m = y · f(x)", "loss"],
      params: [par("m", "margin m", -2, 3, 0.25, -0.5)],
      readout: ["m = {m}: hinge loss = {max(0,1-m):2}   (m ≥ 1: outside the margin, no loss)"],
      steps: [["m = −0.5: misclassified, loss 1.5 (the example in the text).", { m: -0.5 }], ["m = 0.5: right side but inside the margin, loss 0.5.", { m: 0.5 }], ["m = 2: comfortable, loss 0.", { m: 2 }]],
    }, [curve("max(0,1-x)", { c: "accent" }), pt("m", "max(0,1-m)", { c: "bad" }), vline("1", { c: "muted", dash: true, label: "margin edge" })]),
  },
  {
    t: "Kernels: curved boundaries from straight lines",
    lv: 2,
    s: `One class in a central disk and another in a surrounding ring cannot be split by a straight line in the original coordinates. Add the feature {{r² = x₁² + x₂²}}: (1, 0) gives 1 and (3, 0) gives 9, so one threshold on r² separates them. A kernel computes similarities in such an implied feature space without listing the new coordinates. The {{RBF}} kernel {{K(x, z) = exp(−γ‖x − z‖²)}}: with ‖x − z‖² = 4 and γ = 0.5, K = e⁻² ≈ 0.1353. Large γ makes influence very local.`,
    r: `Tune C and γ together, after scaling. A kernel does not guarantee better accuracy and costs more to train than a linear model.`,
    i: `What does γ control in an RBF kernel?`,
    c: py`
import numpy as np

print(round(float(np.exp(-0.5 * 4)), 4))
print(1 ** 2 + 0 ** 2, 3 ** 2 + 0 ** 2)
for gamma in (0.1, 1, 10):
    print(gamma, round(float(np.exp(-gamma * 1.0)), 4))`,
    v: plot("Similarity K = exp(−γ d²) falls with distance d; a larger γ falls faster (more local).", {
      x: [0, 4], y: [0, 1.1], labels: ["distance d between two points", "kernel similarity K"],
      params: [par("g", "γ", 0.1, 4, 0.1, 0.5)],
      readout: ["γ = {g}: at d = 2 the similarity is exp(−{g} × 4) = {exp(-g*4):4}"],
      steps: [["γ = 0.5: at d = 2, K = e⁻² ≈ 0.1353.", { g: 0.5 }], ["Small γ = 0.1: broad influence — smooth boundary.", { g: 0.1 }], ["Large γ = 4: only very near points matter — wiggly boundary.", { g: 4 }]],
    }, [curve("exp(-g*x^2)", { c: "accent" }), pt("2", "exp(-g*4)", { c: "bad" })]),
  },
  {
    t: "Logistic regression: score → probability",
    lv: 1,
    s: `Logistic regression computes a linear score {{z = w·x + b}} and turns it into a probability with the sigmoid {{p = 1 / (1 + e⁻ᶻ)}}. If the weight on the word "refund" is 2 and the bias −1, a message containing "refund" has z = −1 + 2 = 1 and p = σ(1) ≈ 0.731. The decision boundary (p = 0.5) is where z = 0, i.e. x = −b/w. Drag w and b: w sets how sharp the transition is, b slides the whole curve.`,
    r: `A strong baseline for text and tabular data. These weights are illustrative; a real model learns them by minimising log loss.`,
    i: `Compute p for z = 1, and say where p = 0.5.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
z = -1 + 2 * 1
print(z, round(float(sigmoid(z)), 3))
print(round(float(sigmoid(0)), 3), round(float(sigmoid(-4)), 3))`,
    v: plot("p(class 1) = sigmoid(w·x + b). The dashed vertical line marks p = 0.5.", {
      x: [0, 10], y: [0, 1.05], labels: ["feature x", "probability of class 1"],
      params: [par("w", "weight w", 0.2, 3, 0.1, 1.5), par("b", "bias b", -12, 0, 0.5, -7.5)],
      readout: ["boundary at x = −b/w = {-b/w:2}"],
      steps: [["w = 1.5, b = −7.5: boundary at 5.", { w: 1.5, b: -7.5 }], ["Larger w: a sharper switch.", { w: 3, b: -15 }], ["More negative b shifts the boundary right.", { w: 1.5, b: -11 }]],
    }, [curve("sigmoid(w*x+b)", { c: "accent" }), hline("0.5", { c: "muted", dash: true }), vline("-b/w", { c: "bad", dash: true })]),
  },
  {
    t: "Comparing the algorithms without slogans",
    lv: 2,
    s: `No algorithm is universally best. Compare what each learns or stores, what to tune and the usual trap — then test them on the same split with the same metric. Quick hypotheses: a text baseline often starts with multinomial Naive Bayes or a linear model; scaled numeric data of moderate size may suit SVM or kNN; tabular data with non-linear thresholds often suits a tree ensemble. These are starting points, not guarantees.`,
    r: `Selection depends on the representation, sample size, class balance, error costs and validation evidence.`,
    i: `Why is there no single best classification algorithm?`,
    v: compare("What each method learns, what you tune, and its classic pitfall.", ["Learns / stores", "Tune", "Pitfall"], [
      ["Decision tree", "thresholds and leaf statistics", "depth, leaf size, pruning", "a deep tree memorises noise"],
      ["Random forest", "many randomised trees", "trees, depth, features per split", "averaged output is not perfectly calibrated"],
      ["Gradient boosting", "sequential additive corrections", "learning rate, stages, depth", "too many strong stages overfit"],
      ["Naive Bayes", "class priors and feature distributions", "variant, smoothing", "dependent features distort posteriors"],
      ["kNN", "the labelled examples", "k, distance, weights", "unscaled features distort neighbours"],
      ["SVM", "boundary and support vectors", "C, kernel, γ", "scores mistaken for probabilities"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
const nnX = [1, 2, 3, 4, 5, 6];
const nnY = [0, 0, 0, 1, 1, 1];
const nnEpochs = [0, 1, 3, 10, 30, 100];
const nnRun = (() => {
  let w = 0;
  let b = 0;
  const lr = 0.5;
  const out: { w: number; b: number; loss: number }[] = [];
  for (let e = 0; e <= 100; e++) {
    const p = nnX.map((x) => 1 / (1 + Math.exp(-(w * x + b))));
    if (nnEpochs.includes(e)) out.push({ w, b, loss: -p.reduce((s, pi, i) => s + ((nnY[i] ?? 0) ? Math.log(pi) : Math.log(1 - pi)), 0) / nnX.length });
    const gw = p.reduce((s, pi, i) => s + (pi - (nnY[i] ?? 0)) * (nnX[i] ?? 0), 0) / nnX.length;
    const gb = p.reduce((s, pi, i) => s + (pi - (nnY[i] ?? 0)), 0) / nnX.length;
    w -= lr * gw;
    b -= lr * gb;
  }
  return out;
})();

export const nn: ConceptDef[] = [
  {
    t: "The artificial neuron",
    lv: 1,
    s: `A neuron is a small calculator: multiply each input by a weight, add a bias, pass the sum through an activation function. {{z = w₁x₁ + w₂x₂ + w₃x₃ + b}}, {{y = f(z)}}. With x = (1, 0.5, 0.8), w = (2, 1, 3), b = −2: z = 2 + 0.5 + 2.4 − 2 = 2.9 and sigmoid(2.9) ≈ 0.948 — a 94.8% urgency probability; at threshold 0.5 the output is Urgent. The bias shifts the activation curve so a neuron can fire even when the weighted inputs start away from zero. Drag the weights.`,
    r: `Training is just choosing w and b so the outputs match the labels. Everything else in a network is many of these neurons arranged in layers.`,
    i: `Compute the neuron output for x = (2, 1), w = (0.4, −0.2), b = 0.1 with a sigmoid.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
x, w, b = np.array([1, 0.5, 0.8]), np.array([2, 1, 3]), -2
z = float(w @ x + b)
print(round(z, 2), round(float(sigmoid(z)), 3))
x2, w2, b2 = np.array([2, 1]), np.array([0.4, -0.2]), 0.1
z2 = float(w2 @ x2 + b2)
print(round(z2, 2), round(float(sigmoid(z2)), 4))`,
    v: bars("Probability of Urgent for inputs x = (1, 0.5, 0.8).", [["p(Urgent)", "sigmoid(w1*1+w2*0.5+w3*0.8+b)"]], {
      params: [par("w1", "w₁ (outage word)", -4, 4, 0.5, 2), par("w2", "w₂ (plan)", -4, 4, 0.5, 1), par("w3", "w₃ (waiting minutes)", -4, 4, 0.5, 3), par("b", "bias b", -4, 4, 0.5, -2)],
      readout: ["z = {w1*1+w2*0.5+w3*0.8+b:2}   →   p = sigmoid(z)"],
      steps: [["The example: z = 2.9, p = 0.948.", { w1: 2, w2: 1, w3: 3, b: -2 }], ["A strongly negative bias suppresses the output.", { w1: 2, w2: 1, w3: 3, b: -4 }], ["Flip the weights: the neuron says Routine.", { w1: -2, w2: -1, w3: -3, b: 0 }]],
    }),
  },
  {
    t: "Activation functions",
    lv: 1,
    s: `The activation f(z) makes the network non-linear. {{Step}}: 0 or 1 (the classic perceptron). {{Sigmoid}}: 1/(1 + e⁻ᶻ), between 0 and 1 — a probability for a binary output. {{tanh}}: between −1 and +1, centred on zero. {{ReLU}}: max(0, z), the usual hidden-layer choice because it is cheap and does not saturate for positive z. Without non-linear activations, stacked layers would collapse to one linear layer. Drag z to read every function at once.`,
    r: `Sigmoid and tanh flatten for large |z|, so gradients vanish; ReLU units can "die" if they stay negative.`,
    i: `Why must hidden layers use a non-linear activation?`,
    c: py`
import numpy as np

z = 1.5
print(int(z > 0), round(float(1 / (1 + np.exp(-z))), 3), round(float(np.tanh(z)), 3), max(0, z))
print(max(0, -1.5), round(float(np.tanh(-1.5)), 3))`,
    v: plot("Four activations on one set of axes.", {
      x: [-4, 4], y: [-1.5, 4], labels: ["z", "f(z)"],
      params: [par("z", "z", -4, 4, 0.5, 1.5)],
      readout: ["z = {z}: step {step(z)} · sigmoid {sigmoid(z):3} · tanh {tanh(z):3} · ReLU {relu(z):2}"],
      steps: [["z = 1.5: sigmoid 0.818, tanh 0.905, ReLU 1.5.", { z: 1.5 }], ["z = −1.5: ReLU is 0; tanh −0.905.", { z: -1.5 }], ["z = 4: sigmoid and tanh have saturated near 1.", { z: 4 }]],
    }, [curve("step(x)", { c: "muted", label: "step" }), curve("sigmoid(x)", { c: "accent", label: "sigmoid" }), curve("tanh(x)", { c: "info", label: "tanh" }), curve("relu(x)", { c: "warn", label: "ReLU" }), vline("z", { c: "muted", dash: true })]),
  },
  {
    t: "Softmax: probabilities for several classes",
    lv: 2,
    s: `For more than two classes the output layer produces one score per class and {{softmax}} turns them into probabilities that sum to 1: {{pᵢ = e^zᵢ / Σⱼ e^zⱼ}}. Scores (2, 1, 0.1) give (0.659, 0.242, 0.099). Raising one score raises that class's share and lowers the others. The largest score always gets the largest probability; softmax just makes the competition explicit. Drag the three scores.`,
    r: `Subtract the maximum score before exponentiating to avoid overflow; the probabilities do not change.`,
    i: `What properties do softmax outputs have?`,
    c: py`
import numpy as np

z = np.array([2.0, 1.0, 0.1])
p = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print(p.round(3).tolist(), round(float(p.sum()), 3))`,
    v: bars("Class probabilities from three scores.", [["class A", "exp(a)/(exp(a)+exp(b)+exp(c))"], ["class B", "exp(b)/(exp(a)+exp(b)+exp(c))"], ["class C", "exp(c)/(exp(a)+exp(b)+exp(c))"]], {
      percent: true,
      params: [par("a", "score A", -2, 4, 0.1, 2), par("b", "score B", -2, 4, 0.1, 1), par("c", "score C", -2, 4, 0.1, 0.1)],
      steps: [["The example: 66% / 24% / 10%.", { a: 2, b: 1, c: 0.1 }], ["Equal scores: equal probabilities.", { a: 1, b: 1, c: 1 }], ["A big score dominates.", { a: 4, b: 1, c: 0 }]],
    }),
  },
  {
    t: "Multilayer perceptron: the forward pass",
    lv: 2,
    s: `An MLP stacks layers: input → hidden layer(s) → output. Each layer multiplies by a weight matrix, adds a bias and applies an activation; the output feeds the next layer. This is the forward pass. Tiny example, 2 inputs → 2 ReLU hidden units → 1 sigmoid output: the hidden pre-activations are (0.75, −0.2); ReLU keeps (0.75, 0); the output score is 0.95 and the probability 0.721. "Deep" learning means many such learned layers.`,
    r: `All weights start random; training adjusts them. Shapes are the main debugging tool: (n_inputs × n_hidden), then (n_hidden × n_outputs).`,
    i: `Trace the forward pass of a 2-2-1 network.`,
    c: py`
import numpy as np

x = np.array([1.0, 0.5])
W1 = np.array([[0.5, -0.4], [0.3, 0.8]])
b1 = np.array([0.1, -0.2])
z1 = x @ W1 + b1
a1 = np.maximum(0, z1)
W2 = np.array([[1.0], [-1.5]])
b2 = np.array([0.2])
z2 = a1 @ W2 + b2
p = 1 / (1 + np.exp(-z2))
print(z1.tolist(), a1.tolist())
print(z2.tolist(), round(float(p[0]), 4))`,
    v: trace("Each line is one layer's matrix product, bias and activation.", py`
import numpy as np

x = np.array([1.0, 0.5])
W1 = np.array([[0.5, -0.4], [0.3, 0.8]])
b1 = np.array([0.1, -0.2])
z1 = x @ W1 + b1
a1 = np.maximum(0, z1)
W2 = np.array([[1.0], [-1.5]])
b2 = np.array([0.2])
z2 = a1 @ W2 + b2
p = 1 / (1 + np.exp(-z2))
print(z1.tolist(), a1.tolist())
print(z2.tolist(), round(float(p[0]), 4))`, [
      [3, { x: "[1.0, 0.5]" }, undefined, "Two input features."],
      [4, { W1: "2×2 weights" }, undefined, "Hidden-layer weights: one column per hidden unit."],
      [6, { z1: "[0.75, −0.2]" }, undefined, "1·0.5 + 0.5·0.3 + 0.1 = 0.75 and 1·(−0.4) + 0.5·0.8 − 0.2 = −0.2."],
      [7, { a1: "[0.75, 0.0]" }, undefined, "ReLU zeroes the negative unit."],
      [10, { z2: "[0.95]" }, undefined, "0.75·1.0 + 0·(−1.5) + 0.2 = 0.95."],
      [11, { p: "[0.7211]" }, undefined, "Sigmoid of 0.95."],
      [12, undefined, "[0.75, -0.2] [0.75, 0.0]"],
      [13, undefined, "[0.95] 0.7211"],
    ]),
  },
  {
    t: "Loss and one gradient step",
    lv: 2,
    s: `Training needs a number that says how wrong the prediction is: the {{loss}}. For one sigmoid output and label y, binary cross-entropy is L = −[y ln p + (1 − y) ln(1 − p)]. {{Backpropagation}} computes how the loss changes with each weight and an optimiser moves the weights downhill. For one sigmoid unit with y = 1 the gradient is (p − y)·x. With x = (2, 1), w = (0.4, −0.2), b = 0.1: z = 0.7, p = 0.6682, gradient (−0.6636, −0.3318); with learning rate 0.1, w_new = (0.4664, −0.1668) and b_new = 0.1332 — the prediction moves toward 1.`,
    r: `This is one output unit, not a whole multilayer network; deeper layers apply the chain rule to pass the error backwards.`,
    i: `Perform one gradient-descent update for a single sigmoid neuron with y = 1.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
x, w, b, y, lr = np.array([2.0, 1.0]), np.array([0.4, -0.2]), 0.1, 1, 0.1
p = sigmoid(w @ x + b)
loss = -(y * np.log(p) + (1 - y) * np.log(1 - p))
grad_w = (p - y) * x
grad_b = p - y
print(round(float(p), 4), round(float(loss), 4))
print(grad_w.round(4).tolist(), round(float(grad_b), 4))
print((w - lr * grad_w).round(4).tolist(), round(float(b - lr * grad_b), 4))
p2 = sigmoid((w - lr * grad_w) @ x + (b - lr * grad_b))
print(round(float(p2), 4))`,
    v: cells("Forward, loss, gradient, update.", [P("x", ["2", "1"]), P("w", ["0.4", "−0.2"]), P("b", ["0.1", ""])], [
      ["Start: x = (2, 1), w = (0.4, −0.2), b = 0.1, target y = 1."],
      ["Forward: z = 0.4·2 − 0.2·1 + 0.1 = 0.7, p = sigmoid(0.7) = 0.6682.", [[0, 0, 1], [1, 0, 1]]],
      ["Gradient: (p − y)·x = (−0.3318·2, −0.3318·1) = (−0.6636, −0.3318).", [[0, 0, 1]]],
      ["Update with η = 0.1: w = (0.4664, −0.1668), b = 0.1332. The new p is higher.", [[1, 0, 1], [2, 0, 0]], [P("x", ["2", "1"]), P("w (new)", ["0.4664", "−0.1668"]), P("b (new)", ["0.1332", ""])]],
    ]),
  },
  {
    t: "The training loop: gradient descent in action",
    lv: 2,
    s: `Training repeats four moves: forward pass → loss → backpropagation → update. Here the smallest possible network (one sigmoid neuron: p = σ(w·x + b)) learns to separate x = 1, 2, 3 (class 0) from x = 4, 5, 6 (class 1) by gradient descent with learning rate 0.5. Drag the epoch: at the start the curve is flat at 0.5; the transition sharpens and moves between 3 and 4 while the loss falls.`,
    r: `Plot the loss every run: a falling curve means learning; a flat or exploding curve points at the learning rate or the data.`,
    i: `Describe one epoch of gradient-descent training.`,
    c: py`
import numpy as np

x = np.array([1, 2, 3, 4, 5, 6], dtype=float)
y = np.array([0, 0, 0, 1, 1, 1], dtype=float)
w = b = 0.0
for epoch in range(101):
    p = 1 / (1 + np.exp(-(w * x + b)))
    if epoch in (0, 1, 3, 10, 30, 100):
        loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
        print(epoch, round(float(w), 3), round(float(b), 3), round(float(loss), 3))
    w -= 0.5 * np.mean((p - y) * x)
    b -= 0.5 * np.mean(p - y)`,
    v: plot("The fitted probability curve after the chosen number of epochs (dots: the six training points).", {
      x: [0, 7], y: [-0.05, 1.05], labels: ["x", "p(class 1)"],
      params: [par("e", "epoch index", 0, nnEpochs.length - 1, 1, 0)],
      readout: [`epoch (0, 1, 3, 10, 30, 100 in order): index {e}`],
      steps: nnEpochs.map((ep, i) => [`After ${ep} epoch${ep === 1 ? "" : "s"}: loss ${(nnRun[i]?.loss ?? 0).toFixed(3)}.`, { e: i }] as [string, Record<string, number>]),
    }, [
      ...nnRun.map((r, i) => curve(`sigmoid(${r.w}*x+(${r.b}))`, { c: "accent", show: `0.5-abs(e-${i})` })),
      ...nnX.map((x, i) => pt(String(x), String(nnY[i] ?? 0), { c: nnY[i] ? "bad" : "info" })),
      hline("0.5", { c: "muted", dash: true }),
    ]),
  },
  {
    t: "Epochs, batches and iterations",
    lv: 1,
    s: `One {{epoch}} is a full pass over the training set. Data are usually processed in {{mini-batches}}; one weight update per batch is an {{iteration}}. With 1,000 examples and a batch size of 100 an epoch has 10 iterations; 5 epochs make 50 updates. Too few epochs underfit; too many overfit, so watch validation loss and stop early when it starts to rise. Normalise inputs first (min–max or z-score), fitting the scaler on the training data only.`,
    r: `Batch size trades speed against noisy-but-useful gradient estimates; the learning rate and batch size interact.`,
    i: `How many weight updates are made in 5 epochs with 1,000 examples and a batch size of 100?`,
    c: py`
n, batch, epochs = 1000, 100, 5
per_epoch = -(-n // batch)
print(per_epoch, per_epoch * epochs)
print(-(-1050 // 100))`,
    v: compare("Three words that are easy to confuse.", ["Meaning", "Example (1,000 rows, batch 100)"], [
      ["Epoch", "one full pass over the training data", "10 iterations"],
      ["Batch", "a group of examples used for one update", "100 rows"],
      ["Iteration", "one weight update", "50 updates in 5 epochs"],
      ["Early stopping", "stop when validation loss rises", "keep the best epoch's weights"],
    ]),
  },
  {
    t: "PNN: classify by local class density (extension)",
    lv: 3,
    s: `A probabilistic neural network is not trained by backpropagation. It stores the labelled examples and estimates each class's density by adding a Gaussian bump around every example; the class with the higher (prior-weighted) density wins. In a 1D illustration with σ = 1, a Normal example at 0, a Spam example at 3 and query x = 1: the unnormalised similarities are e⁻⁰·⁵ ≈ 0.6065 and e⁻² ≈ 0.1353, so Normal gets 0.6065/(0.6065 + 0.1353) ≈ 0.8176. The bandwidth σ sets the smoothness; priors and per-class normalisation must be handled deliberately.`,
    r: `A PNN is a kernel-density classifier, closer to kNN or Naive Bayes in spirit than to an MLP.`,
    i: `How does a PNN differ from a backpropagation-trained MLP?`,
    c: py`
import numpy as np

x = 1.0
normal, spam = np.exp(-0.5 * (x - 0) ** 2), np.exp(-0.5 * (x - 3) ** 2)
print(round(float(normal), 4), round(float(spam), 4), round(float(normal / (normal + spam)), 4))`,
    v: plot("A bump around each stored example; the query sits where the heights decide the class.", {
      x: [-3, 6], y: [0, 1.2], labels: ["x", "similarity"],
      params: [par("q", "query x", -2, 5, 0.25, 1), par("s", "bandwidth σ", 0.5, 2, 0.25, 1)],
      defs: [["pn", "exp(-0.5*((q-0)/s)^2)"], ["ps", "exp(-0.5*((q-3)/s)^2)"]],
      readout: ["Normal {pn:4} vs Spam {ps:4}  →  P(Normal) = {pn/(pn+ps):3}"],
      steps: [["Query 1, σ = 1: P(Normal) = 0.818.", { q: 1, s: 1 }], ["Query halfway (1.5): a tie.", { q: 1.5, s: 1 }], ["A wide σ = 2 blurs the two classes together.", { q: 1, s: 2 }]],
    }, [curve("exp(-0.5*((x-0)/s)^2)", { c: "info", label: "Normal" }), curve("exp(-0.5*((x-3)/s)^2)", { c: "bad", label: "Spam" }), vline("q", { c: "muted", dash: true })]),
  },
];

void [area, emailHead, emailRows, L, seg];
