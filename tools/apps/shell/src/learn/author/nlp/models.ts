import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "./util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- nlp`. */

const CORPUS = `
import math
from collections import Counter

import numpy as np

text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
bi = Counter(zip(text, text[1:]))
uni = Counter(text)
V = len(set(text))`;

export const lm: ConceptDef[] = [
  {
    t: "What a language model is",
    lv: 1,
    s: `A {{language model}} assigns a probability to text: how likely is this sentence, or which word comes next? By the chain rule, {{P(w₁ … wₙ) = Π P(wᵢ | w₁ … wᵢ₋₁)}}. Fluent English gets a high probability, word salad a low one. Language models power speech recognition, spelling correction, machine translation, autocomplete and — scaled up — text generation. The difference between systems is only how much of the history they can use and how they estimate the conditional probability.`,
    r: `Everything from n-gram counts to a large transformer answers the same question: what comes next?`,
    i: `Write the chain-rule factorisation of P("i like nlp").`,
    c: py`
p_next = {"<s>": {"i": 1.0}, "i": {"like": 0.67, "love": 0.33}, "like": {"nlp": 0.5, "cats": 0.5}}
sentence = ["<s>", "i", "like", "nlp"]
p = 1.0
for a, b in zip(sentence, sentence[1:]):
    p *= p_next[a][b]
print(round(p, 4))`,
    v: rowflow("A sentence's probability is a product of next-word probabilities.", ["<s>", "i", "like", "nlp", "</s>"], [
      "Start symbol.",
      "P(i | <s>) = 1.00.",
      "P(like | i) = 0.67.",
      "P(nlp | like) = 0.50.",
      "P(</s> | nlp) = 1.00 → total 0.33.",
    ]),
  },
  {
    t: "Bigram models from counts",
    lv: 1,
    s: `The Markov assumption keeps only the last n − 1 words. A bigram model estimates {{P(wᵢ | wᵢ₋₁) = count(wᵢ₋₁ wᵢ) / count(wᵢ₋₁)}}. Corpus: "<s> i like nlp </s>", "<s> i like cats </s>", "<s> i love nlp </s>". "i" occurs 3 times, followed by "like" twice and "love" once: P(like | i) = 2/3, P(love | i) = 1/3. "like" is followed by "nlp" and "cats" once each: P(nlp | like) = 1/2. Longer histories (trigrams …) are sharper but need far more data.`,
    r: `Counts are maximum-likelihood estimates; they give zero to anything unseen, which is why smoothing exists.`,
    i: `Estimate P(like | i) and P(nlp | like) from the three-sentence corpus.`,
    c: py`${CORPUS}
print(bi[("i", "like")], uni["i"], round(bi[("i", "like")] / uni["i"], 3))
print(round(bi[("like", "nlp")] / uni["like"], 3), round(bi[("like", "love")] / uni["like"], 3))`,
    v: cells("Bigram counts after the word 'i' and after 'like'.", table(["history", "next word", "count", "probability"], [["i", "like", "2", "2/3"], ["i", "love", "1", "1/3"], ["like", "nlp", "1", "1/2"], ["like", "cats", "1", "1/2"]]), [
      ["Count each pair, divide by the count of the history word."],
      ["'i' is followed by 'like' in 2 of 3 cases.", [[1, 3, 3]]],
      ["'like' splits evenly between 'nlp' and 'cats'.", [[3, 3, 3], [4, 3, 3]]],
    ]),
  },
  {
    t: "Smoothing: giving unseen n-grams a chance",
    lv: 2,
    s: `A new sentence will contain bigrams never seen in training, and a zero anywhere makes the whole product zero. {{Add-one (Laplace) smoothing}} adds 1 to every count: P(w | h) = (count(h w) + 1) / (count(h) + V). With V = 7: the unseen "like love" gets (0 + 1)/(2 + 7) = 0.111, while "i love" falls from 1/3 to 0.2. Smoothing moves probability mass from seen to unseen events. Better schemes (Kneser–Ney, back-off, interpolation) redistribute it more cleverly.`,
    r: `Add-one is too generous for large vocabularies; Kneser–Ney is the classic strong n-gram smoother.`,
    i: `Compute the add-one probability of the unseen bigram "like love" with V = 7.`,
    c: py`${CORPUS}
p = lambda a, b: (bi[(a, b)] + 1) / (uni[a] + V)
print(V, round(p("like", "love"), 4), round(p("i", "love"), 4), round(p("like", "nlp"), 4))`,
    v: bars("P(next word | 'like') before and after add-one smoothing.", [["nlp (seen once): before", "0.5"], ["nlp: after", "0.2222"], ["love (unseen): before", "0"], ["love: after", "0.1111"]], {
      max: 0.6,
    }),
  },
  {
    t: "Perplexity: how surprised is the model?",
    lv: 2,
    s: `{{Perplexity = P(test text)^(−1/N)}} — the inverse probability, normalised by length — is the standard intrinsic score: lower is better. It is the effective number of equally likely choices the model is hesitating between. Smoothed bigram on "<s> i like nlp </s>": the four step probabilities multiply to 0.00889, so over N = 4 steps the perplexity is 3.26. A model that guessed uniformly over V = 7 words would have perplexity 7. Perplexity equals exp(cross-entropy), linking language modelling to the loss of the neural networks track.`,
    r: `Compare perplexities only on the same test text and the same tokenization.`,
    i: `A model gives probability 1/4 to every word. What is its perplexity?`,
    c: py`${CORPUS}
p = lambda a, b: (bi[(a, b)] + 1) / (uni[a] + V)
s = "<s> i like nlp </s>".split()
probs = [p(a, b) for a, b in zip(s, s[1:])]
prod = float(np.prod(probs))
print([round(x, 3) for x in probs], round(prod, 5), round(prod ** (-1 / len(probs)), 3))
print(round((0.25 ** 6) ** (-1 / 6), 3), round(math.exp(-np.mean(np.log(probs))), 3))`,
    v: plot("Perplexity of a model that gives every word probability p.", {
      x: [0.05, 1], y: [0, 20], labels: ["probability per word p", "perplexity 1/p"],
      params: [par("p", "probability p", 0.05, 1, 0.05, 0.25)],
      readout: ["p = {p} → perplexity = 1/p = {1/p:2}  (choosing between {1/p:1} equally likely words)"],
      steps: [["p = 0.25: like picking among 4 words.", { p: 0.25 }], ["p = 1: no uncertainty.", { p: 1 }]],
    }, [curve("1/x", { c: "accent" }), pt("p", "1/p", { c: "bad" })]),
  },
  {
    t: "Neural language models and the softmax",
    lv: 2,
    s: `A neural language model replaces counting with a network: embed the history, run it through an RNN or transformer, and a final layer produces one logit per vocabulary word; {{softmax}} turns them into P(next word). Training minimises cross-entropy −ln P(true next word), exactly the loss from the neural-networks track. Because embeddings are shared, "I adopted a cat" teaches it about "dog". Logits [3, 2, 1, 0] give probabilities 0.644, 0.237, 0.087, 0.032.`,
    r: `Large vocabularies make the softmax expensive; sub-word tokenization keeps the vocabulary near 30–100 thousand pieces.`,
    i: `Turn the logits [3, 2, 1, 0] into probabilities and compute the loss if the true word has index 1.`,
    c: py`
import numpy as np

z = np.array([3.0, 2.0, 1.0, 0.0])
p = np.exp(z - z.max())
p /= p.sum()
print(p.round(3).tolist(), round(float(-np.log(p[1])), 3))`,
    v: rowflow("One step of a neural language model.", ["history", "embedding", "network", "logits", "softmax", "next word"], [
      "'the cat sat on the'",
      "vectors for each token.",
      "RNN or transformer mixes them.",
      "one score per vocabulary word.",
      "probabilities that sum to 1.",
      "sample or pick the most likely.",
    ]),
  },
  {
    t: "Generating text: temperature, top-k and top-p",
    lv: 2,
    s: `To generate, repeatedly turn the next-word distribution into a choice. {{Greedy}} always takes the maximum (repetitive); {{sampling}} draws from the distribution (varied, sometimes odd). {{Temperature T}} reshapes the logits: softmax(z/T). With z = [3, 2, 1, 0]: T = 0.5 gives [0.865, 0.117, 0.016, 0.002] (almost greedy), T = 1 gives [0.644, 0.237, 0.087, 0.032], T = 2 gives [0.455, 0.276, 0.167, 0.102] (flatter, more random). {{Top-k}} keeps the k best words; {{top-p (nucleus)}} keeps the smallest set whose probabilities add to p (0.644 + 0.237 = 0.881 ≥ 0.85 → two words).`,
    r: `Low temperature for factual answers and code; higher for creative writing. Sampling settings change behaviour as much as the model does.`,
    i: `How many words does top-p = 0.9 keep for the T = 1 distribution above?`,
    c: py`
import numpy as np

z = np.array([3.0, 2.0, 1.0, 0.0])
for T in (0.5, 1.0, 2.0):
    e = np.exp(z / T)
    print(T, (e / e.sum()).round(3).tolist())
p = np.exp(z) / np.exp(z).sum()
cum = np.cumsum(np.sort(p)[::-1])
print(cum.round(3).tolist(), int((cum < 0.9).sum()) + 1)`,
    v: bars("Next-word probabilities for logits [3, 2, 1, 0] at the chosen temperature.", [["word A", "exp(3/T)/(exp(3/T)+exp(2/T)+exp(1/T)+exp(0/T))"], ["word B", "exp(2/T)/(exp(3/T)+exp(2/T)+exp(1/T)+exp(0/T))"], ["word C", "exp(1/T)/(exp(3/T)+exp(2/T)+exp(1/T)+exp(0/T))"], ["word D", "exp(0/T)/(exp(3/T)+exp(2/T)+exp(1/T)+exp(0/T))"]], {
      max: 1,
      params: [par("T", "temperature T", 0.25, 3, 0.25, 1)],
      readout: ["low T sharpens towards the top word, high T flattens towards uniform"],
      steps: [["T = 0.5: nearly greedy.", { T: 0.5 }], ["T = 1: the model's own distribution.", { T: 1 }], ["T = 2: more diverse and riskier.", { T: 2 }]],
    }),
  },
  {
    t: "Evaluating language models and generated text",
    lv: 2,
    s: `Intrinsic: perplexity on held-out text. Extrinsic: does the model help the real task (speech word-error rate, translation quality, answer accuracy)? For generated text: overlap metrics such as {{BLEU}} and {{ROUGE}}, embedding-based scores, task-specific checks (does the code run?), and human or model-based judgement. ROUGE-1 compares unigrams with a reference: candidate "the cat sat on the mat", reference "the cat is on the mat" → 5 words overlap, precision 5/6, recall 5/6. Overlap metrics reward copying and miss paraphrases, so they need human sanity checks.`,
    r: `Report several metrics plus examples; one number never tells whether text is truthful, safe or useful.`,
    i: `Compute ROUGE-1 precision and recall for the candidate and reference above.`,
    c: py`
from collections import Counter

ref = "the cat is on the mat".split()
cand = "the cat sat on the mat".split()
overlap = sum((Counter(ref) & Counter(cand)).values())
p, r = overlap / len(cand), overlap / len(ref)
print(overlap, round(p, 3), round(r, 3), round(2 * p * r / (p + r), 3))`,
    v: compare("Metric families for language and generation.", ["Measures", "Weakness"], [
      ["Perplexity", "how well the model predicts held-out text", "not comparable across tokenizers"],
      ["BLEU / ROUGE", "n-gram overlap with a reference", "misses paraphrase and truth"],
      ["Task accuracy", "does it solve the real problem", "needs labelled data"],
      ["Human / model judges", "fluency, helpfulness, safety", "costly, subjective"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const s2s: ConceptDef[] = [
  {
    t: "Sequence-to-sequence: one sequence in, another out",
    lv: 1,
    s: `Translation, summarisation, paraphrase and dialog map one sequence to another of different length. A {{sequence-to-sequence}} model has an {{encoder}} that reads the source into hidden states and a {{decoder}} that writes the target one token at a time, each step conditioned on the source and on the tokens already produced. During training the decoder is fed the true previous word ({{teacher forcing}}); at test time it feeds back its own output. Squeezing everything into one vector forgets long inputs — the reason for attention.`,
    r: `Source and target lengths differ, so decoding needs an explicit end-of-sequence token.`,
    i: `What is teacher forcing and why is it used?`,
    c: py`
source = "i love cats".split()
target = ["<s>", "j'aime", "les", "chats", "</s>"]
decoder_inputs, decoder_targets = target[:-1], target[1:]
print(list(zip(decoder_inputs, decoder_targets)))`,
    v: cells("Teacher forcing: at each step the decoder sees the true previous word and predicts the next.", [P("decoder input", ["<s>", "j'aime", "les", "chats"]), P("target", ["j'aime", "les", "chats", "</s>"])], [
      ["The target sequence is shifted by one position."],
      ["Input <s> → predict 'j'aime'.", [[0, 0, 0], [1, 0, 0]]],
      ["Input 'les' → predict 'chats', even if an earlier prediction had been wrong.", [[0, 2, 2], [1, 2, 2]]],
    ]),
  },
  {
    t: "Attention: looking back at the source",
    lv: 2,
    s: `{{Attention}} lets the decoder compute, at every output step, a weighted average of all encoder states, with weights from a softmax over match scores between the current decoder state (query) and each source state (key). Scaled dot-product form: softmax(QKᵀ/√d)V. If the scores for "I love cats" are [0.5, 3.0, 1.0] while producing "aime", the weights are [0.07, 0.82, 0.11]: the decoder mostly reads "love". The weights also give a readable alignment between source and target words.`,
    r: `The neural-networks track derives attention numerically; here the point is what it buys translation: no fixed-length bottleneck.`,
    i: `Turn the scores [0.5, 3.0, 1.0] into attention weights.`,
    c: py`
import numpy as np

scores = np.array([0.5, 3.0, 1.0])
w = np.exp(scores - scores.max())
w /= w.sum()
print(w.round(3).tolist(), round(float(w.sum()), 3))`,
    v: bars("Attention weights over the source words while generating 'aime'.", [["I", "exp(0.5)/(exp(0.5)+exp(s)+exp(1))"], ["love", "exp(s)/(exp(0.5)+exp(s)+exp(1))"], ["cats", "exp(1)/(exp(0.5)+exp(s)+exp(1))"]], {
      max: 1,
      params: [par("s", "score of 'love'", 0, 5, 0.5, 3)],
      readout: ["the weights always sum to 1"],
      steps: [["A strong match with 'love'.", { s: 3 }], ["No clear match: attention spreads out.", { s: 0.5 }]],
    }),
  },
  {
    t: "Decoding: greedy versus beam search",
    lv: 2,
    s: `Choosing the best word at every step (greedy) can miss the best sentence. {{Beam search}} keeps the B highest-probability partial sentences at each step. Toy two-step model: first word a 0.5, b 0.4, c 0.1; second word after a is x 0.4; after b is x 0.9. Greedy picks a then x: 0.5 × 0.4 = 0.20. Beam width 2 keeps a and b, then finds "b x" = 0.4 × 0.9 = 0.36, the true best. Larger beams cost more and can prefer short, generic outputs, so a length penalty is common.`,
    r: `Beam search suits translation and speech; open-ended generation usually samples instead.`,
    i: `Why does greedy decoding return a worse sentence than beam search in the example?`,
    c: py`
P1 = {"a": 0.5, "b": 0.4, "c": 0.1}
P2 = {"a": {"x": 0.4, "y": 0.3, "z": 0.3}, "b": {"x": 0.9, "y": 0.05, "z": 0.05}, "c": {"x": 0.5, "y": 0.5, "z": 0.0}}
first = max(P1, key=P1.get)
greedy = P1[first] * max(P2[first].values())
cands = sorted(((P1[a] * P2[a][b], a + b) for a in P1 for b in P2[a]), reverse=True)
print(first, round(greedy, 2), [(round(p, 2), s) for p, s in cands[:3]])`,
    v: compare("Greedy versus beam search on the two-step example.", ["Path", "Probability"], [
      ["Greedy", "a → x", "0.5 × 0.4 = 0.20"],
      ["Beam (width 2)", "b → x", "0.4 × 0.9 = 0.36"],
    ]),
  },
  {
    t: "Machine translation and its evaluation",
    lv: 1,
    s: `Neural machine translation encodes the source and decodes the target with attention; modern systems use transformers trained on millions of sentence pairs, with sub-word tokens. Quality is estimated with {{BLEU}} (n-gram precision against reference translations times a brevity penalty), newer learned metrics, and human ratings of adequacy (meaning preserved) and fluency. Hard cases: idioms, gender and formality, rare languages with little data, and domain terminology — which is why in-domain fine-tuning and glossaries matter.`,
    r: `Always look at examples: a high BLEU can hide a systematically wrong named entity or number.`,
    i: `What two qualities do human evaluators rate in translations?`,
    c: py`
import math
from collections import Counter

cand = "the cat sat on the mat".split()
ref = "the cat is on the mat".split()
clipped = sum((Counter(cand) & Counter(ref)).values())
precision = clipped / len(cand)
bp = 1.0 if len(cand) >= len(ref) else math.exp(1 - len(ref) / len(cand))
print(clipped, round(precision, 3), bp, round(bp * precision, 3))`,
    v: compare("Evaluating a translation.", ["Question", "Typical tool"], [
      ["Adequacy", "is the meaning preserved?", "human rating"],
      ["Fluency", "is it natural in the target language?", "human rating, perplexity"],
      ["Overlap", "how many n-grams match references?", "BLEU, chrF"],
      ["Meaning similarity", "are embeddings close?", "learned metrics"],
    ]),
  },
  {
    t: "Transformers, BERT and GPT",
    lv: 2,
    s: `A {{transformer}} replaces recurrence by stacked self-attention and feed-forward layers, so all positions are processed in parallel. Two flavours dominate. {{Encoder-only}} models (BERT) read the whole sentence with full attention and are pretrained by predicting masked words — excellent for classification, tagging and retrieval. {{Decoder-only}} models (GPT-style) use a causal mask so each position sees only earlier tokens and are pretrained to predict the next word — the basis of generation. Encoder–decoder models (T5, translation systems) combine both.`,
    r: `The causal mask is a lower-triangular matrix: position i may attend to positions 0…i.`,
    i: `What is the difference between BERT-style and GPT-style pretraining?`,
    c: py`
import numpy as np

mask = np.tril(np.ones((4, 4), int))
print(mask.tolist())
scores = np.zeros((4, 4))
scores[mask == 0] = -1e9
w = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)
print(w.round(2).tolist())`,
    v: cells("Causal mask: row = current token, column = token it may look at (1 = allowed).", [P("token 1", ["1", "0", "0", "0"]), P("token 2", ["1", "1", "0", "0"]), P("token 3", ["1", "1", "1", "0"]), P("token 4", ["1", "1", "1", "1"])], [
      ["A decoder may not peek at future words."],
      ["Token 1 sees only itself.", [[0, 0, 0]]],
      ["Token 3 sees tokens 1–3.", [[2, 0, 2]]],
      ["Token 4 sees everything before it.", [[3, 0, 3]]],
    ]),
  },
  {
    t: "Pretraining, fine-tuning and prompting",
    lv: 1,
    s: `Modern NLP has three ways to use a pretrained language model. {{Fine-tuning}} updates (some of) the weights on labelled task data: best accuracy, needs data and compute. {{Feature extraction}} freezes the model and trains a small head on its vectors: cheap. {{Prompting}} adds instructions and examples to the input and changes no weights: zero or few labelled examples, fastest to try, less predictable. Choose by data, latency, cost and privacy; start with prompting or a small baseline and measure before investing in fine-tuning.`,
    r: `A prompt is part of your system: version it, test it on a fixed evaluation set, and re-test when the model changes.`,
    i: `When would you prefer fine-tuning over prompting?`,
    c: py`
options = {
    "prompting": {"labelled examples": 0, "weights changed": False},
    "feature extraction": {"labelled examples": 1000, "weights changed": False},
    "fine-tuning": {"labelled examples": 10000, "weights changed": True},
}
for k, v in options.items():
    print(k, v)`,
    v: compare("Three ways to use a pretrained model.", ["Labelled data", "Weights change?"], [
      ["Prompting", "0–a few examples", "no"],
      ["Feature extraction", "hundreds–thousands", "only a small head"],
      ["Fine-tuning", "thousands+", "yes"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const qa: ConceptDef[] = [
  {
    t: "Question answering: kinds of QA",
    lv: 1,
    s: `{{Extractive QA}}: the answer is a span copied from a given passage ("Where is the Vilnius Gediminas Tower?" → "Vilnius"). {{Open-domain QA}}: first find relevant passages in a large collection, then read them. {{Generative QA}}: a model writes the answer, possibly using retrieved text. {{Knowledge-base QA}} translates the question to a query over structured data. Closed-book models answer from their weights alone and can be fluent yet wrong, so grounded approaches that cite sources are preferred when correctness matters.`,
    r: `Decide up front what to do when the answer is not in the sources: abstaining is a feature.`,
    i: `Contrast extractive and generative question answering.`,
    c: py`
passage = "Vilnius is the capital of Lithuania. It lies on the river Neris."
question = "What is the capital of Lithuania?"
answer = "Vilnius"
start = passage.index(answer)
print(answer, (start, start + len(answer)))`,
    v: compare("Types of question answering.", ["Answer comes from", "Risk"], [
      ["Extractive", "a span of a given passage", "limited to the passage"],
      ["Open-domain", "retrieved passages", "retrieval misses"],
      ["Generative", "text written by a model", "fluent but unfaithful"],
      ["Knowledge base", "a structured query result", "question-to-query errors"],
    ]),
  },
  {
    t: "Extractive QA: predicting the answer span",
    lv: 2,
    s: `A reader model scores every token as a possible {{start}} and {{end}} of the answer; softmax over positions gives P(start = i) and P(end = j). The answer is the span (i ≤ j) with the highest product. Tokens "The tower is in Vilnius": start scores [0.1, 0.2, 3.0, 0.5, 0.1] peak at token 3 (79.8%), end scores [0, 0.1, 0.4, 2.5, 0.3] peak at token 4 (71.1%): best span (2, 3) with probability 0.568 in the 0-indexed toy. Constraints (i ≤ j, maximum length) and a "no answer" option complete the picture.`,
    r: `Reader models are usually pretrained encoders such as BERT with two small linear heads.`,
    i: `How is the best answer span chosen from start and end distributions?`,
    c: py`
import numpy as np

ss = np.array([0.1, 0.2, 3.0, 0.5, 0.1])
es = np.array([0.0, 0.1, 0.4, 2.5, 0.3])
sp, ep = np.exp(ss) / np.exp(ss).sum(), np.exp(es) / np.exp(es).sum()
best = max((sp[i] * ep[j], i, j) for i in range(5) for j in range(i, 5))
print(sp.round(3).tolist(), ep.round(3).tolist())
print(round(float(best[0]), 3), best[1], best[2])`,
    v: bars("Start probability of each token (softmax of the start scores).", [["token 0", "0.044"], ["token 1", "0.049"], ["token 2", "0.798"], ["token 3", "0.066"], ["token 4", "0.044"]], {
      max: 1,
    }),
  },
  {
    t: "Evaluating QA: exact match and token F1",
    lv: 1,
    s: `{{Exact match (EM)}} is 1 only if the predicted answer equals a gold answer after normalising case, punctuation and articles. {{Token F1}} gives partial credit: treat prediction and gold as bags of tokens. Gold "Vilnius", predicted "the city of Vilnius": EM = 0, but they share 1 token, so precision = 1/4, recall = 1/1, F1 = 0.4. Report both; EM is strict, F1 forgives extra words. For generated answers human or model-assisted judgement of correctness and faithfulness is also needed.`,
    r: `Normalisation rules change EM noticeably, so publish them with the result.`,
    i: `Compute EM and token F1 for gold "Vilnius" and prediction "the city of Vilnius".`,
    c: py`
from collections import Counter

gold, pred = "Vilnius".lower().split(), "the city of Vilnius".lower().split()
common = sum((Counter(gold) & Counter(pred)).values())
p, r = common / len(pred), common / len(gold)
print(int(gold == pred), p, r, round(2 * p * r / (p + r), 2))`,
    v: compare("Same answer, two metrics.", ["Exact match", "Token F1"], [
      ["'Vilnius' vs 'Vilnius'", "1", "1.00"],
      ["'Vilnius' vs 'the city of Vilnius'", "0", "0.40"],
      ["'Vilnius' vs 'Kaunas'", "0", "0.00"],
    ]),
  },
  {
    t: "Retrieval-augmented question answering",
    lv: 2,
    s: `Open-domain QA and {{retrieval-augmented generation (RAG)}} split the work: a {{retriever}} (BM25, dense embeddings or both) finds the top-k passages for the question; a {{reader or generator}} answers using only those passages and ideally cites them. This keeps knowledge up to date without retraining, lets you restrict answers to approved documents, and makes mistakes traceable: if the answer is wrong, was retrieval or reading at fault? Evaluate the two stages separately (recall@k of the right passage, then answer correctness given the right passage).`,
    r: `Chunk size, overlap and the number of passages are tuning knobs that matter as much as the model.`,
    i: `If the final answer is wrong, how do you tell whether the retriever or the reader failed?`,
    c: py`
import math
from collections import Counter

docs = ["vilnius is the capital of lithuania", "kaunas is a city in lithuania", "paris is the capital of france"]
q = "capital of lithuania".split()
score = lambda d: sum(1 for w in q if w in d.split())
ranked = sorted(range(len(docs)), key=lambda i: -score(docs[i]))
print([(i, score(docs[i])) for i in ranked])`,
    v: rowflow("Retrieve, then read.", ["Question", "Retriever", "Top-k passages", "Reader / generator", "Answer + source"], [
      "'What is the capital of Lithuania?'",
      "Search the index.",
      "Passages most likely to contain the answer.",
      "Answer using only those passages.",
      "Return the answer with a citation.",
    ]),
  },
  {
    t: "Dialog systems: understanding, state and response",
    lv: 1,
    s: `A task-oriented dialog system (book a table, check an order) is a pipeline. {{Natural-language understanding}} extracts the user's {{intent}} (book_table) and {{slots}} (party size, time) — intent classification plus slot filling with BIO tags. {{Dialog state tracking}} keeps the slots collected so far; the {{policy}} decides the next action (ask for the missing slot, confirm, call the booking API); {{natural-language generation}} writes the reply. Open-domain chatbots use a large language model for the whole loop but still need safety rules, memory and grounding.`,
    r: `Measure task success rate and turns-to-completion, not just whether replies sound fluent.`,
    i: `Name the components of a pipeline dialog system and what each does.`,
    c: py`
state = {"intent": None, "party": None, "time": None}
def update(state, nlu):
    state.update({k: v for k, v in nlu.items() if v is not None})
    missing = [k for k, v in state.items() if v is None]
    return f"Ask for {missing[0]}" if missing else "Book the table"

print(update(state, {"intent": "book_table", "party": 4, "time": None}))
print(update(state, {"intent": None, "party": None, "time": "19:00"}))`,
    v: rowflow("Pipeline of a task-oriented dialog system.", ["User utterance", "Understanding", "State tracking", "Policy", "Response generation"], [
      "'Table for four tonight'",
      "intent = book_table, party = 4",
      "slots so far: party = 4, time missing",
      "ask for the time",
      "'What time would you like?'",
    ]),
  },
  {
    t: "Intent detection and slot filling",
    lv: 2,
    s: `Understanding a command has two sub-tasks solved together. {{Intent detection}} is sentence classification: "Book a table for four at 7" → book_table. {{Slot filling}} is sequence labelling with BIO tags: tokens "for four at 7" → O B-party O B-time. The same encoder can produce both outputs (a joint model), so the intent can help resolve ambiguous slots. Normalisation then turns "four" into 4 and "7" into 19:00. Errors here propagate to every later stage, which is why dialog data is annotated with both layers.`,
    r: `Keep a fallback intent and a confidence threshold: asking a clarifying question beats a confident wrong action.`,
    i: `Label "Book a table for four at 7" with an intent and BIO slot tags.`,
    c: py`
tokens = "Book a table for four at 7".split()
tags = ["O", "O", "O", "O", "B-party", "O", "B-time"]
slots = {t[2:]: w for w, t in zip(tokens, tags) if t.startswith("B-")}
print(slots)`,
    v: cells("Joint intent and slot labelling.", [P("token", ["Book", "a", "table", "for", "four", "at", "7"]), P("slot tag", ["O", "O", "O", "O", "B-party", "O", "B-time"])], [
      ["Sentence-level intent: book_table."],
      ["'four' fills the party-size slot.", [[1, 4, 4]]],
      ["'7' fills the time slot.", [[1, 6, 6]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const now: ConceptDef[] = [
  {
    t: "Large language models and what they change",
    lv: 1,
    s: `{{Large language models}} are transformers with billions of parameters pretrained on enormous text and then aligned with human feedback to follow instructions. One model can classify, extract, summarise, translate and answer, steered by prompts instead of a separate trained system per task. That removes a lot of pipeline engineering but not the need for evaluation: you still need labelled test cases, error analysis, cost and latency budgets, and a plan for wrong or unsafe output.`,
    r: `Treat the LLM as a component with a measurable accuracy on your task, not as an oracle.`,
    i: `Which classic NLP tasks can a single instruction-following LLM cover, and what must you still measure?`,
    c: py`
tasks = ["classify sentiment", "extract entities", "summarise", "translate", "answer questions"]
prompt = "Task: {task}\nText: {text}\nAnswer:"
print(prompt.format(task=tasks[1], text="Obama visited Vilnius"))`,
    v: compare("Classic pipeline versus an LLM.", ["Classic pipeline", "LLM with prompts"], [
      ["Models", "one per task", "one for many tasks"],
      ["Labelled data", "needed to train each", "needed to evaluate"],
      ["Control", "explicit, predictable", "via prompts, less predictable"],
      ["Cost", "cheap to run", "higher per request"],
    ]),
  },
  {
    t: "Hallucination, grounding and evaluation",
    lv: 2,
    s: `A language model optimised to produce plausible text can state falsehoods fluently — {{hallucination}}. Mitigations: ground answers in retrieved or provided sources (RAG) and require citations; constrain output formats; let the model abstain; verify claims with tools; and evaluate with test sets containing unanswerable and adversarial questions. Measure {{faithfulness}} (does the answer follow the sources?) separately from {{helpfulness}}. A fixed regression suite run on every prompt or model change catches silent degradations.`,
    r: `For high-stakes domains keep a human in the loop; the cost of one confident error can exceed the savings.`,
    i: `Give two ways to reduce hallucination and one way to measure it.`,
    c: py`
answers = [("capital of Lithuania?", "Vilnius", True), ("capital of Atlantis?", "Poseidonis", False)]
supported = sum(ok for _, _, ok in answers)
print(supported, "of", len(answers), "answers supported by sources ->", supported / len(answers))`,
    v: compare("Where wrong answers come from and what helps.", ["Cause", "Mitigation"], [
      ["Missing knowledge", "the model never saw the fact", "retrieve sources (RAG)"],
      ["Stale knowledge", "training cut-off", "retrieval over fresh documents"],
      ["Over-eagerness", "answers even when unsure", "allow abstention, confidence checks"],
      ["Reasoning slip", "arithmetic or logic error", "tools and verification"],
    ]),
  },
  {
    t: "Bias, privacy and responsible NLP",
    lv: 2,
    s: `Models learn the statistics of their text, including stereotypes: an analogy test can return "man : doctor :: woman : nurse". Sentiment tools may rate sentences about some dialects or names lower. Text can also leak personal data (names, e-mails, medical details). Responsible practice: document the data and its limits, audit performance across groups, remove or mask personal data before training and logging, get consent, restrict use where errors cause harm, and give users a way to contest decisions. Fairness metrics are choices, not neutral facts — involve the affected people.`,
    r: `Slice every evaluation by language, dialect and demographic group where it is legitimate and lawful to do so.`,
    i: `Describe one way an NLP system can be biased and one check for it.`,
    c: py`
scores = {"group A": [0.91, 0.89, 0.93], "group B": [0.78, 0.8, 0.75]}
means = {g: round(sum(v) / len(v), 3) for g, v in scores.items()}
print(means, round(max(means.values()) - min(means.values()), 3))`,
    v: compare("Risks and checks.", ["Example", "Check"], [
      ["Stereotypes", "biased analogies and associations", "probe sets, counterfactual tests"],
      ["Unequal accuracy", "lower F1 for a dialect", "evaluate per group"],
      ["Privacy leakage", "names and numbers in outputs", "mask data, test for memorisation"],
      ["Misuse", "spam, deception, harassment", "usage policy, rate limits, review"],
    ]),
  },
  {
    t: "Where the field is going",
    lv: 1,
    s: `Active directions: larger and more efficient models (distillation, quantisation, mixtures of experts); long context and retrieval instead of memorisation; multilingual and low-resource languages; multimodal models that read text together with images and speech; tool-using agents that call search, code and APIs; better evaluation (contamination-free benchmarks, model-based judges validated against humans); and attention to safety, privacy and energy use. Results arrive fast, so rely on papers' evaluation sections, reproducibility, and your own test set rather than headlines.`,
    r: `A useful habit: for every new method, ask what data it needs, what it costs to run, and how it fails.`,
    i: `Pick one research direction and explain what problem it addresses.`,
    c: py`
trends = {"efficiency": "smaller, faster models", "retrieval": "grounded answers", "multimodal": "text + image + speech", "agents": "tool use and planning", "evaluation": "trustworthy benchmarks"}
for k, v in trends.items():
    print(f"{k:11s} {v}")`,
    v: compare("Research directions and the problem each addresses.", ["Problem addressed", "Example"], [
      ["Efficiency", "cost and latency of big models", "distillation, quantisation"],
      ["Retrieval", "stale or invented facts", "RAG, long context"],
      ["Multimodality", "language needs the world", "image-text, speech-text models"],
      ["Agents", "answers are not enough", "tool calling, planning"],
    ]),
  },
  {
    t: "Choosing an approach for a real NLP problem",
    lv: 1,
    s: `A decision guide. Need to find documents → BM25 / hybrid search. Need a label from text with plenty of labelled data → TF-IDF + linear model, then a fine-tuned encoder. Need labels with little data → prompting an LLM or few-shot fine-tuning. Need spans (entities, slots) → a token-classification head on a pretrained encoder. Need answers from your documents → retrieval + reader/LLM with citations. Need fluent generation → an LLM with controlled decoding and evaluation. Always: simplest baseline first, a held-out test set, error analysis, monitoring.`,
    r: `Most production wins come from clean data and the right metric, not from the largest model.`,
    i: `Recommend an approach for routing support emails to five teams with 20,000 labelled examples.`,
    c: py`
guide = {
    "find documents": "BM25 / hybrid search",
    "label text, lots of data": "TF-IDF + linear, then fine-tuned encoder",
    "label text, little data": "prompting or few-shot",
    "find spans": "token classification on an encoder",
    "answer from documents": "retrieval + reader with citations",
}
for need, tool in guide.items():
    print(f"{need:26s} -> {tool}")`,
    v: compare("Need → first approach to try.", ["First approach"], [
      ["Find documents", "BM25 or hybrid search"],
      ["Label text, lots of labels", "TF-IDF + linear model"],
      ["Label text, few labels", "prompting a large model"],
      ["Entities or slots", "token classification head"],
      ["Answers from your own documents", "retrieval + reader with citations"],
    ]),
  },
];

void [bars, curve, hline, par, plot, pt, seg, vline, P];
