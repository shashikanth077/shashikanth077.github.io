import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "./util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- nlp`. */

const REVIEWS = `
import math
from collections import Counter

import numpy as np

pos = ["great movie", "loved the acting", "great acting loved it"]
neg = ["boring movie", "awful plot", "boring awful acting"]
V = sorted({w for d in pos + neg for w in d.split()})
cp = Counter(w for d in pos for w in d.split())
cn = Counter(w for d in neg for w in d.split())
total_p, total_n = sum(cp.values()), sum(cn.values())`;

export const cls: ConceptDef[] = [
  {
    t: "Text classification: the task and its variants",
    lv: 1,
    s: `{{Text classification}} assigns a label to a text. Variants: {{binary}} (spam / not spam, positive / negative), {{multi-class}} (one of many topics), {{multi-label}} (several tags at once: a news item can be both "sport" and "politics") and ordinal (1–5 stars). {{Sentiment analysis}} is the best-known case: is the opinion positive, negative or neutral? Each variant changes the output layer and the loss: sigmoid + binary cross-entropy, softmax + categorical cross-entropy, independent sigmoids per label.`,
    r: `Define the label scheme with the people who will use it, and measure how often two human annotators agree: that is your ceiling.`,
    i: `Which output activation and loss suit a multi-label problem?`,
    c: py`
import numpy as np

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

z = np.array([2.0, 1.0, -1.0])
print(softmax(z).round(3).tolist(), round(float(softmax(z).sum()), 3))
print((1 / (1 + np.exp(-z))).round(3).tolist())`,
    v: compare("Same text, three classification set-ups.", ["Output", "Loss"], [
      ["Binary (positive / negative)", "one sigmoid probability", "binary cross-entropy"],
      ["Multi-class (one topic)", "softmax over classes, sums to 1", "categorical cross-entropy"],
      ["Multi-label (several tags)", "independent sigmoid per label", "binary cross-entropy per label"],
    ]),
  },
  {
    t: "Naive Bayes for sentiment, by hand",
    lv: 2,
    s: `Naive Bayes picks the class with the largest {{P(class) × Π P(word | class)}}, assuming words are independent given the class. Training set: 3 positive and 3 negative reviews, vocabulary of 9 words, 9 positive and 7 negative word tokens. With Laplace smoothing P(w | c) = (count + 1) / (tokens_c + V). Test "great acting boring": log-score positive −7.167, negative −7.219 → posterior 51.3% positive. The independence assumption is false, yet the classifier is a strong baseline; working in log space avoids underflow.`,
    r: `Smoothing is essential: one unseen word would otherwise zero the whole product.`,
    i: `Why does Naive Bayes use log probabilities and Laplace smoothing?`,
    c: py`${REVIEWS}
test = "great acting boring".split()
lp = math.log(0.5) + sum(math.log((cp[w] + 1) / (total_p + len(V))) for w in test)
ln = math.log(0.5) + sum(math.log((cn[w] + 1) / (total_n + len(V))) for w in test)
print(len(V), total_p, total_n)
print(round(lp, 3), round(ln, 3), round(math.exp(lp) / (math.exp(lp) + math.exp(ln)), 4))`,
    v: bars("Log-score of each class for 'great acting boring' (less negative wins).", [["positive", "7.167"], ["negative", "7.219"]], {
      max: 8,
    }),
  },
  {
    t: "Logistic regression on text features",
    lv: 2,
    s: `Instead of modelling how words are generated, {{logistic regression}} learns weights directly: p(positive) = σ(w·x + b) where x are TF-IDF or count features. Words with positive weights ("great", "loved") push the score up, negative ones ("awful") push it down — so the weights are interpretable. Trained by gradient descent on cross-entropy with L2 regularization to avoid memorising rare words. With the weights learned by the toy model below, "great loved" gets p = 0.98 while "boring awful" gets 0.02.`,
    r: `Inspect the largest weights after training: surprising words reveal leakage or dataset artefacts.`,
    i: `What does a large positive weight on the feature "great" mean?`,
    c: py`
import numpy as np

vocab = ["great", "loved", "boring", "awful", "movie"]
docs = ["great movie", "loved movie", "boring movie", "awful movie", "great loved", "boring awful"]
y = np.array([1, 1, 0, 0, 1, 0])
X = np.array([[d.split().count(w) for w in vocab] for d in docs], float)
w, b = np.zeros(len(vocab)), 0.0
for _ in range(500):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    w -= 0.5 * (X.T @ (p - y) / len(y) + 0.01 * w)
    b -= 0.5 * (p - y).mean()
print({v: round(float(x), 2) for v, x in zip(vocab, w)})
f = lambda s: round(float(1 / (1 + np.exp(-(np.array([s.split().count(v) for v in vocab]) @ w + b)))), 2)
print(f("great loved"), f("boring awful"))`,
    v: bars("Learned weight of each word: positive pushes towards 'positive sentiment'.", [["great", "2.09"], ["loved", "2.09"], ["boring", "-2.09"], ["awful", "-2.09"], ["movie", "0"]], {
      max: 2.5,
    }),
  },
  {
    t: "Evaluating a classifier: precision, recall, F1",
    lv: 1,
    s: `Accuracy hides imbalance, so report per-class numbers. For the positive class: {{precision = TP/(TP+FP)}}, {{recall = TP/(TP+FN)}}, {{F1 = 2PR/(P+R)}}. A sentiment model on 100 reviews gives TP = 40, FP = 10, FN = 20, TN = 30: precision 0.80, recall 0.667, F1 0.727, accuracy 0.70. For several classes average them: {{macro}} (each class equal), {{micro}} (pool all decisions) or {{weighted}} (by class size). Always compare to a trivial baseline such as "predict the majority class".`,
    r: `Pick the metric from the cost of errors: missing a complaint (recall) versus flagging a harmless message (precision).`,
    i: `Compute precision, recall and F1 for TP = 40, FP = 10, FN = 20.`,
    c: py`
tp, fp, fn, tn = 40, 10, 20, 30
p, r = tp / (tp + fp), tp / (tp + fn)
print(round(p, 3), round(r, 3), round(2 * p * r / (p + r), 3), (tp + tn) / (tp + fp + fn + tn))`,
    v: cells("Confusion matrix of the sentiment model (rows = actual).", table(["", "predicted positive", "predicted negative"], [["actual positive", "TP = 40", "FN = 20"], ["actual negative", "FP = 10", "TN = 30"]]), [
      ["100 reviews: 60 positive, 40 negative."],
      ["Precision = 40/50 = 0.80: of 50 flagged positive, 40 are right.", [[1, 1, 1], [2, 1, 1]]],
      ["Recall = 40/60 = 0.667: 20 positive reviews are missed.", [[1, 1, 2]]],
    ]),
  },
  {
    t: "Beyond polarity: aspects, negation and sarcasm",
    lv: 2,
    s: `Real sentiment is harder than counting good and bad words. {{Aspect-based}} analysis scores each target separately: "great food but terrible service" is positive for food and negative for service. {{Negation}} flips polarity ("not good"), a trick bag-of-words misses unless you add bigrams or mark words after "not". {{Sarcasm}} ("Oh great, another delay") needs context and world knowledge. Domain also matters: "unpredictable" is good for a thriller and bad for a car.`,
    r: `Test on a hand-built set of hard cases (negation, sarcasm, comparisons) in addition to the random test split.`,
    i: `Give an example where a word-count sentiment model gives the wrong answer and explain why.`,
    c: py`
lex = {"good": 1, "great": 2, "bad": -1, "awful": -2}
score = lambda s: sum(lex.get(w, 0) for w in s.split())

def with_negation(s):
    total, flip = 0, False
    for w in s.split():
        if w in ("not", "never"):
            flip = True
            continue
        total += -lex.get(w, 0) if flip else lex.get(w, 0)
        flip = False
    return total

print(score("not good"), with_negation("not good"), with_negation("never great"))`,
    v: compare("Cases that break naive sentiment models.", ["Example", "Why it is hard"], [
      ["Negation", "the food was not good", "'good' appears but the meaning flips"],
      ["Aspects", "great food, terrible service", "two opinions in one sentence"],
      ["Sarcasm", "oh great, another delay", "positive words, negative intent"],
      ["Domain shift", "unpredictable plot / brakes", "same word, opposite polarity"],
    ]),
  },
  {
    t: "Building a domain-specific classifier",
    lv: 2,
    s: `A practical recipe for a system such as "route support tickets": (1) define classes and collect examples from the real source; (2) label them carefully — measure annotator agreement; (3) split train / validation / test before looking at anything; (4) start with a TF-IDF + logistic regression baseline; (5) try a fine-tuned pretrained encoder only if the baseline is not enough; (6) inspect errors by hand and fix data first; (7) monitor live accuracy and retrain as language drifts. Most gains come from better data, not from a bigger model.`,
    r: `Annotation guidelines and error analysis are part of the model: write them down.`,
    i: `Why start with a TF-IDF baseline before a neural model?`,
    c: py`
steps = ["define classes", "collect and label", "split", "baseline", "fine-tune if needed", "error analysis", "monitor"]
for i, s in enumerate(steps, 1):
    print(i, s)`,
    v: rowflow("A sensible path from idea to deployed classifier.", ["Define", "Label", "Split", "Baseline", "Improve", "Analyse errors", "Monitor"], [
      "Classes the business actually needs.",
      "Examples with clear guidelines.",
      "Train / validation / test before any peeking.",
      "TF-IDF + logistic regression.",
      "Only if the baseline is not enough.",
      "Read mistakes, fix data.",
      "Watch for language drift.",
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const tag: ConceptDef[] = [
  {
    t: "Part-of-speech tagging",
    lv: 1,
    s: `{{Part-of-speech (POS) tagging}} labels every word with its grammatical class: noun (N), verb (V), determiner (D), adjective (A), preposition (P)… The same word can take different tags: "can" is a verb in "we can go" and a noun in "a can of soup", and "book" is a noun or a verb. A tagger therefore needs context. Tagsets differ (a small universal set of ~17 tags, or the Penn Treebank's 45), and the output feeds parsers, lemmatizers and information extraction.`,
    r: `Modern taggers reach about 97% accuracy on news text; the remaining errors are mostly ambiguous words and unseen domains.`,
    i: `Why can't a tagger simply look each word up in a dictionary?`,
    c: py`
lexicon = {"the": ["D"], "dog": ["N"], "barks": ["V", "N"], "can": ["V", "N"], "book": ["N", "V"]}
sentence = "the dog barks".split()
print([(w, lexicon[w]) for w in sentence])
print(sum(len(lexicon[w]) > 1 for w in lexicon), "of", len(lexicon), "words are ambiguous")`,
    v: cells("A POS-tagged sentence.", [P("word", ["the", "dog", "barks"]), P("tag", ["D", "N", "V"])], [
      ["Each word receives one grammatical tag."],
      ["'the' is a determiner (D).", [[1, 0, 0]]],
      ["'dog' is a noun (N) and 'barks' a verb (V) — though 'barks' could also be a plural noun.", [[1, 1, 2]]],
    ]),
  },
  {
    t: "Hidden Markov models: tags as hidden states",
    lv: 2,
    s: `An {{HMM tagger}} treats the tags as hidden states that generate the words. It needs: {{start probabilities}} π (how likely a tag begins a sentence), {{transition probabilities}} A (tag → next tag, e.g. D → N is likely) and {{emission probabilities}} B (tag → word, e.g. N emits "dog"). The probability of a tagged sentence is π(t₁)B(w₁|t₁) × Π A(tᵢ₋₁→tᵢ) B(wᵢ|tᵢ). For "the dog barks" tagged D N V: 0.6×0.8 × 0.9×0.4 × 0.6×0.3 = 0.0311.`,
    r: `HMMs make the Markov assumption: a tag depends only on the previous tag. That is why richer models (CRFs, neural taggers) beat them.`,
    i: `Compute the joint probability of D N V for "the dog barks" from the tables.`,
    c: py`
import numpy as np

states = ["D", "N", "V"]
pi = np.array([0.6, 0.3, 0.1])
A = np.array([[0.05, 0.9, 0.05], [0.1, 0.3, 0.6], [0.5, 0.3, 0.2]])
B = {"D": {"the": 0.8}, "N": {"dog": 0.4, "barks": 0.05}, "V": {"dog": 0.01, "barks": 0.3}}
p = pi[0] * B["D"]["the"] * A[0, 1] * B["N"]["dog"] * A[1, 2] * B["V"]["barks"]
print(round(float(p), 5))`,
    v: cells("The three probability tables of the toy tagger.", table(["", "→ D", "→ N", "→ V"], [["from D", "0.05", "0.90", "0.05"], ["from N", "0.10", "0.30", "0.60"], ["from V", "0.50", "0.30", "0.20"]]), [
      ["Transition table A: how likely is each tag after the previous one."],
      ["D → N = 0.90: a determiner is almost always followed by a noun.", [[1, 2, 2]]],
      ["N → V = 0.60: a noun is often followed by a verb.", [[2, 3, 3]]],
    ]),
  },
  {
    t: "The Viterbi algorithm: the best tag sequence",
    lv: 2,
    s: `Trying every tag sequence is exponential (3³ = 27 here, 45ⁿ in general). {{Viterbi}} is dynamic programming: for every position and tag keep the probability of the best path ending there, and a back-pointer. δ₁(s) = π(s)·B(s|w₁); δₜ(s) = maxₛ′ δₜ₋₁(s′)·A(s′→s)·B(s|wₜ). For "the dog barks": δ₁ = D 0.48; δ₂ = N 0.1728; δ₃ = V 0.0311. Following the pointers back gives D N V. Cost: O(n × S²) instead of S^n.`,
    r: `Work in log space for long sentences to avoid underflow; the same algorithm decodes CRFs and speech recognisers.`,
    i: `Fill in the Viterbi table for "the dog barks" and read off the best tags.`,
    c: py`
import numpy as np

states = ["D", "N", "V"]
pi = np.array([0.6, 0.3, 0.1])
A = np.array([[0.05, 0.9, 0.05], [0.1, 0.3, 0.6], [0.5, 0.3, 0.2]])
words = ["the", "dog", "barks"]
B = {"D": {"the": 0.8}, "N": {"dog": 0.4, "barks": 0.05}, "V": {"dog": 0.01, "barks": 0.3}}
Bm = np.array([[B[s].get(w, 0.0) for w in words] for s in states])
d = np.zeros((3, 3))
bp = np.zeros((3, 3), int)
d[:, 0] = pi * Bm[:, 0]
for t in range(1, 3):
    for j in range(3):
        c = d[:, t - 1] * A[:, j]
        bp[j, t] = c.argmax()
        d[j, t] = c.max() * Bm[j, t]
path = [int(d[:, -1].argmax())]
for t in (2, 1):
    path.insert(0, int(bp[path[0], t]))
print(d.round(5).tolist())
print([states[i] for i in path])`,
    v: cells("Viterbi table δ (best path probability per tag and position).", table(["", "the", "dog", "barks"], [["D", "0.48", "0", "0"], ["N", "0", "0.1728", "0.00259"], ["V", "0", "0.00024", "0.0311"]]), [
      ["Start: only D can emit 'the', so δ₁(D) = 0.6 × 0.8 = 0.48."],
      ["'dog': N reached from D: 0.48 × 0.9 × 0.4 = 0.1728.", [[2, 2, 2]]],
      ["'barks': V reached from N: 0.1728 × 0.6 × 0.3 = 0.0311, the best final cell.", [[3, 3, 3]]],
    ]),
  },
  {
    t: "Named entity recognition and BIO tags",
    lv: 1,
    s: `{{Named entity recognition (NER)}} finds spans that name people (PER), organisations (ORG), locations (LOC), dates and so on. It is cast as tagging with the {{BIO scheme}}: B-X begins an entity of type X, I-X continues it, O is outside. "Barack Obama visited Vilnius" → B-PER I-PER O B-LOC. An I-tag may only follow a B- or I- tag of the same type, which a decoder can enforce. NER feeds knowledge graphs, search and question answering.`,
    r: `Ambiguity is the hard part: "Washington" can be a person, a city or a state; "Apple" an ORG or a fruit.`,
    i: `Tag "Barack Obama visited Vilnius" with BIO labels.`,
    c: py`
tokens = "Barack Obama visited Vilnius".split()
tags = ["B-PER", "I-PER", "O", "B-LOC"]
spans, start = [], None
for i, t in enumerate(tags + ["O"]):
    if t.startswith("B-") or t == "O":
        if start is not None:
            spans.append((" ".join(tokens[start:i]), tags[start][2:]))
            start = None
        if t.startswith("B-"):
            start = i
print(spans)`,
    v: cells("BIO labelling of a sentence.", [P("token", ["Barack", "Obama", "visited", "Vilnius"]), P("tag", ["B-PER", "I-PER", "O", "B-LOC"])], [
      ["Each token gets exactly one tag."],
      ["B-PER begins a person, I-PER continues it: 'Barack Obama'.", [[1, 0, 1]]],
      ["O means not part of any entity.", [[1, 2, 2]]],
      ["B-LOC starts (and ends) a location: 'Vilnius'.", [[1, 3, 3]]],
    ]),
  },
  {
    t: "Evaluating NER: entity-level F1",
    lv: 2,
    s: `Token accuracy is misleading because most tokens are O. NER is scored at {{entity level}}: a predicted entity counts only if both its span AND type match a gold entity exactly. Gold: [Barack Obama PER][Vilnius LOC]. Predicted: [Obama PER][Vilnius LOC] — the first span is wrong, so TP = 1, FP = 1, FN = 1: precision 0.5, recall 0.5, F1 0.5. Partial-match variants exist but exact match is the standard (CoNLL).`,
    r: `Report F1 per entity type too: a good average can hide a type that never works.`,
    i: `Compute the entity-level precision, recall and F1 for the example.`,
    c: py`
gold = {(0, 2, "PER"), (3, 4, "LOC")}
pred = {(1, 2, "PER"), (3, 4, "LOC")}
tp = len(gold & pred)
p, r = tp / len(pred), tp / len(gold)
print(tp, len(pred) - tp, len(gold) - tp, p, r, 2 * p * r / (p + r))`,
    v: compare("Gold entity (row) versus what the system predicted.", ["Predicted", "Counts as"], [
      ["Barack Obama (PER)", "Obama (PER)", "wrong span → FP and FN"],
      ["Vilnius (LOC)", "Vilnius (LOC)", "exact match → TP"],
    ]),
  },
  {
    t: "Sequence labeling: HMM, CRF and neural taggers",
    lv: 2,
    s: `Tagging, NER, chunking and slot filling are all {{sequence labeling}}: one label per token, with dependencies between neighbouring labels. Three generations: the {{HMM}} models how words are generated (generative, independent features); a {{CRF}} models the probability of the whole tag sequence given the words (discriminative, any features, global normalisation, still decoded with Viterbi); a {{BiLSTM}} or transformer encoder reads the sentence in context, often with a CRF layer on top to forbid illegal tag transitions. Pretrained encoders with a softmax per token are today's default.`,
    r: `A CRF layer still helps when label constraints matter (BIO validity).`,
    i: `What advantage does a CRF have over an HMM tagger?`,
    c: py`
legal = {("O", "B"), ("O", "O"), ("B", "I"), ("B", "O"), ("B", "B"), ("I", "I"), ("I", "O"), ("I", "B")}
def valid(tags):
    prev = "O"
    for t in tags:
        kind = t[0]
        if kind == "I" and prev == "O":
            return False
        prev = kind
    return True

print(valid(["B-PER", "I-PER", "O"]), valid(["O", "I-PER"]))`,
    v: compare("Three generations of sequence labelers.", ["Models", "Features", "Context"], [
      ["HMM", "joint P(words, tags)", "word identity only", "previous tag"],
      ["CRF", "P(tags | words)", "any hand-made features", "previous tag, global"],
      ["BiLSTM / transformer", "P(tag | whole sentence)", "learned", "entire sentence"],
    ]),
  },
];

void [bars, curve, hline, par, plot, pt, seg, vline];
