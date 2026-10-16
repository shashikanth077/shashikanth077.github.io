import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* sources and retrieval */
  ["src", 1, "Name four text sources and a typical problem of each.", "Social media (slang, emoji), web pages (boilerplate), PDFs (layout and reading order), transcripts (recognition errors)."],
  ["src", 1, "List the stages of an NLP pipeline.", "Collect → clean → tokenize → represent → model → evaluate → deploy and monitor."],
  ["src", 1, "What is an inverted index?", "A map from each term to the documents (postings list) that contain it, so a query reads only the lists of its own words."],
  ["src", 1, "Define tf and idf and give idf for a word in 1 of 4 documents.", "tf = count / document length; idf = ln(N/df) = ln 4 = 1.386; weight = tf × idf."],
  ["src", 2, "Why cosine similarity instead of the dot product for ranking?", "Cosine ignores vector length, so long documents are not favoured just for containing more words."],
  ["src", 2, "What two problems of TF-IDF does BM25 fix?", "Term-frequency saturation (repeated words add less and less) and document-length normalisation."],
  ["src", 2, "Results [R, N, R, N, N], 3 relevant in total: precision@3, recall@3, reciprocal rank?", "2/3, 2/3 and 1 (the first relevant result is at rank 1)."],
  /* preprocessing */
  ["prep", 1, "Give a cleaning step that helps and one case where it hurts.", "Lowercasing merges 'Cat' and 'cat' but turns 'US' into 'us'; removing '!' cleans text but loses sentiment."],
  ["prep", 1, "Why is whitespace splitting not enough for English?", "Contractions (don't), names (New York), hyphens, abbreviations and punctuation stuck to words need real tokenization rules."],
  ["prep", 1, "Stemming versus lemmatization?", "A stemmer chops suffixes by rule (studies → studi); a lemmatizer uses a dictionary and part of speech (better → good, was → be)."],
  ["prep", 2, "Compute the edit distance between 'kitten' and 'sitting'.", "3: substitute k→s, substitute e→i, insert g."],
  ["prep", 1, "How many bigrams does a sentence of 7 tokens have?", "6 (n − 1 overlapping pairs)."],
  ["prep", 2, "Describe byte-pair encoding.", "Start from characters, repeatedly merge the most frequent adjacent pair into a new symbol until the vocabulary reaches the chosen size; frequent words become single tokens, rare words split into pieces."],
  ["prep", 1, "Why build the vocabulary on the training split only?", "Test-only words are the real unknowns the system must handle; using them would leak information and hide the <UNK> problem."],
  /* representations */
  ["repr", 1, "What is a bag of words and what does it lose?", "A vector of word counts. It loses order and meaning relations: 'dog bites man' equals 'man bites dog', and 'good' and 'great' are unrelated."],
  ["repr", 1, "Why do dense embeddings generalise better than one-hot vectors?", "Similar words get nearby vectors, so what is learned about one word transfers to its neighbours; one-hot vectors of any two words are orthogonal."],
  ["repr", 1, "What range does cosine similarity take?", "−1 to 1: 1 same direction, 0 unrelated (orthogonal), −1 opposite."],
  ["repr", 2, "Skip-gram training pairs for centre 'brown' in 'the quick brown fox jumps', window 2?", "(brown, the), (brown, quick), (brown, fox), (brown, jumps)."],
  ["repr", 2, "What does king − man + woman ≈ queen show, and what are its limits?", "Directions encode relations. It works only roughly, must exclude the query words, and reproduces biases in the training text."],
  ["repr", 2, "Static versus contextual embeddings?", "A static vector is one per word; a contextual one is computed per occurrence from the sentence ('river bank' ≠ 'bank loan')."],
  /* classification */
  ["cls", 1, "Which output and loss for binary, multi-class and multi-label classification?", "Sigmoid + binary cross-entropy; softmax + categorical cross-entropy; independent sigmoids + binary cross-entropy per label."],
  ["cls", 2, "Why do Naive Bayes classifiers use log probabilities and Laplace smoothing?", "Logs avoid underflow from long products; smoothing stops one unseen word from making the whole product zero."],
  ["cls", 1, "TP = 40, FP = 10, FN = 20: precision, recall, F1?", "0.80, 0.667 and 0.727."],
  ["cls", 2, "Why can bag-of-words sentiment fail on 'not good'?", "The word 'good' is counted as positive; without bigrams or negation handling the flip in meaning is lost."],
  ["cls", 2, "What is aspect-based sentiment?", "Scoring opinion per target: 'great food but terrible service' is positive for food, negative for service."],
  ["cls", 1, "Why start with a TF-IDF + logistic regression baseline?", "It is fast, interpretable, hard to beat on small data and tells you whether a heavier model is worth it."],
  /* tagging */
  ["tag", 1, "Why can't POS tagging be a dictionary lookup?", "Many words are ambiguous (can, book, barks); the correct tag depends on context."],
  ["tag", 2, "What three tables define an HMM tagger?", "Start probabilities π, transition probabilities A (tag → next tag) and emission probabilities B (tag → word)."],
  ["tag", 2, "Why does Viterbi use dynamic programming?", "It keeps only the best path to each (position, tag), turning S^n sequences into n × S² steps."],
  ["tag", 1, "BIO-tag 'Barack Obama visited Vilnius'.", "B-PER I-PER O B-LOC."],
  ["tag", 2, "Gold [Barack Obama PER][Vilnius LOC], predicted [Obama PER][Vilnius LOC]: entity-level precision, recall, F1?", "TP = 1, FP = 1, FN = 1 → 0.5, 0.5, 0.5 (a span must match exactly)."],
  ["tag", 2, "HMM versus CRF versus neural tagger?", "HMM is generative with the previous-tag assumption; a CRF is discriminative with arbitrary features and global normalisation; neural taggers learn features from the whole sentence."],
  /* language models */
  ["lm", 1, "State the chain rule for a sentence's probability.", "P(w₁…wₙ) = Π P(wᵢ | w₁…wᵢ₋₁)."],
  ["lm", 1, "Estimate P(like | i) from '<s> i like nlp </s>', '<s> i like cats </s>', '<s> i love nlp </s>'.", "count(i like)/count(i) = 2/3."],
  ["lm", 2, "Add-one smoothing: probability of an unseen bigram 'like love' with V = 7 and count(like) = 2?", "(0 + 1)/(2 + 7) = 0.111."],
  ["lm", 2, "What is perplexity and what is the perplexity of a uniform model over 4 words?", "P(test)^(−1/N) = exp(cross-entropy); the effective number of equally likely choices; 4."],
  ["lm", 2, "Effect of temperature on sampling?", "softmax(z/T): low T sharpens towards the top word (greedy at T → 0), high T flattens towards uniform."],
  ["lm", 2, "Top-k versus top-p sampling?", "Top-k keeps the k most likely words; top-p keeps the smallest set whose probabilities sum to p."],
  ["lm", 2, "Why are BLEU and ROUGE limited?", "They count n-gram overlap with references, so they reward copying and miss valid paraphrases and factual errors."],
  /* seq2seq */
  ["s2s", 1, "What is teacher forcing?", "Feeding the decoder the true previous token during training instead of its own prediction."],
  ["s2s", 2, "What problem does attention solve in seq2seq?", "The fixed-length bottleneck: the decoder can look at all encoder states with learned weights at each step."],
  ["s2s", 2, "Greedy versus beam search?", "Greedy takes the best word each step; beam search keeps the B best partial sentences and can find a higher-probability sentence (0.36 vs 0.20 in the lecture example)."],
  ["s2s", 2, "BERT versus GPT pretraining?", "BERT predicts masked words with full bidirectional attention; GPT predicts the next word with a causal mask."],
  ["s2s", 1, "Fine-tuning versus prompting?", "Fine-tuning updates weights using labelled data; prompting steers a frozen model with instructions and examples."],
  ["s2s", 1, "What do humans rate in machine translation?", "Adequacy (meaning preserved) and fluency (natural target language)."],
  /* QA and dialog */
  ["qa", 1, "Extractive versus generative QA?", "Extractive copies a span from a passage; generative writes an answer that may or may not be supported by sources."],
  ["qa", 2, "How is the answer span chosen?", "Softmax over start scores and over end scores; take the span (i ≤ j) maximising P(start = i) × P(end = j)."],
  ["qa", 1, "Gold 'Vilnius', predicted 'the city of Vilnius': EM and token F1?", "EM = 0; precision 1/4, recall 1, F1 = 0.4."],
  ["qa", 2, "What is RAG and why use it?", "Retrieve relevant passages then generate an answer from them; gives fresh, traceable, restrictable answers without retraining."],
  ["qa", 1, "Components of a task-oriented dialog system?", "Understanding (intent, slots), state tracking, policy, response generation."],
  ["qa", 2, "Label 'Book a table for four at 7' with intent and slot tags.", "Intent book_table; O O O O B-party O B-time."],
  /* now */
  ["now", 1, "Why does an LLM not remove the need for evaluation?", "You still need task-specific test cases, error analysis, cost and latency budgets, and safeguards against wrong or unsafe output."],
  ["now", 2, "Two mitigations for hallucination and one way to measure it?", "Ground answers in retrieved sources with citations; let the model abstain or verify with tools. Measure faithfulness against sources on a fixed test set."],
  ["now", 2, "Give one bias risk in NLP and a check.", "Lower accuracy or stereotyped output for a dialect or group; evaluate by group and with counterfactual probe sentences."],
  ["now", 1, "Recommend an approach for routing support e-mails to five teams with 20,000 labelled examples.", "TF-IDF + logistic regression baseline, then a fine-tuned pretrained encoder if needed; evaluate with macro F1 on a held-out set."],
];

export const drills: DrillDef[] = [
  {
    t: "Inverse document frequency",
    q: "What does this print?",
    code: py`
import math
print(round(math.log(4 / 1), 3), round(math.log(4 / 3), 3))`,
    opts: [["1.386 0.288", true, "ln 4 for a rare word and ln(4/3) for a common one."], ["4.0 1.333", false, "That is N/df without the logarithm."], ["0.288 1.386", false, "The rare word has the larger idf."]],
    path: ["df = 1 → ln(4/1) = 1.386.", "df = 3 → ln(4/3) = 0.288."],
    why: "Rare words are more informative, so they get larger weights.",
    watch: "Natural log versus log₁₀ changes the numbers.",
    remember: "idf = ln(N/df).",
  },
  {
    t: "Counting bigrams",
    q: "What does this print?",
    code: py`
words = "the cat sat on the mat".split()
print(len(list(zip(words, words[1:]))), len(words))`,
    opts: [["5 6", true, "n tokens give n − 1 bigrams."], ["6 6", false, "Bigrams are overlapping pairs: one fewer than tokens."], ["3 6", false, "The pairs overlap; they are not disjoint."]],
    path: ["6 tokens.", "Pairs: the-cat, cat-sat, sat-on, on-the, the-mat = 5."],
    why: "Each bigram starts at every position except the last.",
    watch: "Add <s> and </s> and the count changes.",
    remember: "n tokens → n − 1 bigrams.",
  },
  {
    t: "Edit distance",
    q: "What does this print?",
    code: py`
def edit(a, b):
    D = [[i + j if i * j == 0 else 0 for j in range(len(b) + 1)] for i in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] != b[j - 1]))
    return D[-1][-1]

print(edit("cat", "cut"), edit("kitten", "sitting"))`,
    opts: [["1 3", true, "One substitution; then k→s, e→i and an insertion."], ["1 2", false, "kitten → sitting needs three edits."], ["2 3", false, "cat → cut is a single substitution."]],
    path: ["cat → cut: a→u, 1 edit.", "kitten → sitting: k→s, e→i, insert g = 3."],
    why: "The table takes the cheapest of insert, delete and substitute.",
    watch: "A substitution costs 1 here; some variants charge 2.",
    remember: "D[i][j] = min(up + 1, left + 1, diagonal + mismatch).",
  },
  {
    t: "Cosine similarity",
    q: "What does this print?",
    code: py`
import numpy as np
a, b = np.array([1.0, 0.0]), np.array([1.0, 1.0])
print(round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 3))`,
    opts: [["0.707", true, "cos 45° = 1/√2."], ["1.0", false, "The vectors are not parallel."], ["0.5", false, "That would be a 60° angle."]],
    path: ["a·b = 1.", "‖a‖ = 1, ‖b‖ = √2.", "1/√2 = 0.707."],
    why: "Cosine is the cosine of the angle between the vectors.",
    watch: "Zero vectors give division by zero.",
    remember: "cos = a·b / (‖a‖‖b‖).",
  },
  {
    t: "Bigram probability",
    q: "What does this print?",
    code: py`
from collections import Counter
text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
bi, uni = Counter(zip(text, text[1:])), Counter(text)
print(round(bi[("i", "like")] / uni["i"], 3), round(bi[("like", "nlp")] / uni["like"], 3))`,
    opts: [["0.667 0.5", true, "2 of 3 'i' are followed by 'like'; 1 of 2 'like' by 'nlp'."], ["0.5 0.667", false, "These are swapped."], ["1.0 1.0", false, "Several continuations exist."]],
    path: ["count(i like) = 2, count(i) = 3.", "count(like nlp) = 1, count(like) = 2."],
    why: "A bigram probability is a ratio of counts.",
    watch: "Divide by the count of the history word, not the total.",
    remember: "P(w | h) = count(h w) / count(h).",
  },
  {
    t: "Add-one smoothing",
    q: "What does this print?",
    code: py`
count_pair, count_hist, V = 0, 2, 7
print(round((count_pair + 1) / (count_hist + V), 3))`,
    opts: [["0.111", true, "1/9."], ["0.0", false, "Smoothing gives unseen events a non-zero probability."], ["0.143", false, "That is 1/V; the history count belongs in the denominator."]],
    path: ["numerator 0 + 1 = 1.", "denominator 2 + 7 = 9.", "1/9 = 0.111."],
    why: "Adding V to the denominator keeps probabilities summing to 1.",
    watch: "V is the vocabulary size.",
    remember: "(count + 1) / (history + V).",
  },
  {
    t: "Perplexity of a uniform model",
    q: "What does this print?",
    code: py`
p = 0.25
print(round((p ** 6) ** (-1 / 6), 3))`,
    opts: [["4.0", true, "Choosing among 4 equally likely words."], ["0.25", false, "That is the probability, not its inverse."], ["6.0", false, "Length does not change the per-word value."]],
    path: ["Six words each with 0.25.", "Perplexity = (0.25⁶)^(−1/6) = 1/0.25 = 4."],
    why: "Perplexity is the effective branching factor.",
    watch: "Lower is better.",
    remember: "Perplexity = exp(cross-entropy).",
  },
  {
    t: "Temperature",
    q: "What does this print?",
    code: py`
import numpy as np
z = np.array([2.0, 0.0])
for T in (1.0, 0.5):
    e = np.exp(z / T)
    print(round(float((e / e.sum())[0]), 3))`,
    opts: [["0.881 0.982", true, "Lower temperature sharpens the distribution."], ["0.881 0.5", false, "Temperature 0.5 does not flatten it."], ["0.5 0.881", false, "These are in the wrong order."]],
    path: ["T = 1: e²/(e² + 1) = 0.881.", "T = 0.5: e⁴/(e⁴ + 1) = 0.982."],
    why: "Dividing logits by a small T exaggerates differences.",
    watch: "T → 0 becomes greedy decoding.",
    remember: "softmax(z / T).",
  },
  {
    t: "ROUGE-1",
    q: "What does this print?",
    code: py`
from collections import Counter
ref = "the cat is on the mat".split()
cand = "the cat sat on the mat".split()
ov = sum((Counter(ref) & Counter(cand)).values())
print(ov, round(ov / len(cand), 3), round(ov / len(ref), 3))`,
    opts: [["5 0.833 0.833", true, "Five shared words out of six on each side."], ["6 1.0 1.0", false, "'sat' and 'is' do not match."], ["4 0.667 0.667", false, "'the' appears twice in both sentences and counts twice."]],
    path: ["Shared (clipped): the ×2, cat, on, mat = 5.", "Precision 5/6, recall 5/6."],
    why: "ROUGE-1 compares clipped unigram counts.",
    watch: "Clip counts, otherwise repeated words are over-credited.",
    remember: "Precision = overlap/candidate, recall = overlap/reference.",
  },
  {
    t: "Token F1 for QA",
    q: "What does this print?",
    code: py`
from collections import Counter
gold, pred = "vilnius".split(), "the city of vilnius".split()
c = sum((Counter(gold) & Counter(pred)).values())
p, r = c / len(pred), c / len(gold)
print(p, r, round(2 * p * r / (p + r), 2))`,
    opts: [["0.25 1.0 0.4", true, "One shared token out of four predicted, one gold."], ["1.0 0.25 0.4", false, "Precision and recall are swapped."], ["0.25 1.0 1.0", false, "F1 is the harmonic mean, not the maximum."]],
    path: ["Shared tokens: 1.", "Precision 1/4, recall 1/1.", "F1 = 2 × 0.25 × 1 / 1.25 = 0.4."],
    why: "Extra words in the prediction lower precision.",
    watch: "Exact match would be 0 here.",
    remember: "F1 gives partial credit.",
  },
  {
    t: "Viterbi step",
    q: "What does this print?",
    code: py`
start, emit_D_the, trans_DN, emit_N_dog = 0.6, 0.8, 0.9, 0.4
d1 = start * emit_D_the
d2 = d1 * trans_DN * emit_N_dog
print(round(d1, 3), round(d2, 4))`,
    opts: [["0.48 0.1728", true, "δ₁(D) = 0.48, then × 0.9 × 0.4."], ["0.48 0.432", false, "The emission of 'dog' (0.4) must also be applied."], ["1.4 0.9", false, "Probabilities multiply along a path."]],
    path: ["δ₁(D) = 0.6 × 0.8 = 0.48.", "δ₂(N) = 0.48 × 0.9 × 0.4 = 0.1728."],
    why: "Each step multiplies a transition and an emission probability.",
    watch: "Use logs for long sentences.",
    remember: "δₜ(s) = max δₜ₋₁(s′) · A · B.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Build a TF-IDF ranker", "Rank four documents for the query 'cat on mat' by cosine similarity.", py`
import math
from collections import Counter

import numpy as np

docs = ["the cat sat on the mat", "the dog sat on the log", "cats and dogs are pets", "the stock market fell sharply"]
toks = [d.split() for d in docs]
vocab = sorted({w for t in toks for w in t})
idf = {w: math.log(len(docs) / sum(w in t for t in toks)) for w in vocab}
vec = lambda t: np.array([Counter(t)[w] / len(t) * idf[w] for w in vocab])
q = vec("cat on mat".split())
sims = [float(vec(t) @ q / (np.linalg.norm(vec(t)) * np.linalg.norm(q) + 1e-12)) for t in toks]
print([round(s, 3) for s in sims], int(np.argmax(sims)) + 1)`],
  ["A word-level bigram generator", "Train a bigram model and print the most likely next word.", py`
from collections import Counter, defaultdict

text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
nxt = defaultdict(Counter)
for a, b in zip(text, text[1:]):
    nxt[a][b] += 1
word = "<s>"
out = []
while word != "</s>":
    word = nxt[word].most_common(1)[0][0]
    out.append(word)
print(" ".join(out))`],
  ["Naive Bayes sentiment from scratch", "Train on six reviews and classify a new one.", py`
import math
from collections import Counter

pos = ["great movie", "loved the acting", "great acting loved it"]
neg = ["boring movie", "awful plot", "boring awful acting"]
V = {w for d in pos + neg for w in d.split()}
cp, cn = Counter(w for d in pos for w in d.split()), Counter(w for d in neg for w in d.split())
def score(text, c):
    return math.log(0.5) + sum(math.log((c[w] + 1) / (sum(c.values()) + len(V))) for w in text.split() if w in V)
for t in ("great acting", "awful plot"):
    print(t, "->", "positive" if score(t, cp) > score(t, cn) else "negative")`],
  ["Byte-pair encoding", "Run three BPE merges.", py`
from collections import Counter

corpus = Counter({"l o w </w>": 5, "l o w e r </w>": 2, "n e w e s t </w>": 6, "w i d e s t </w>": 3})
for _ in range(3):
    pairs = Counter()
    for w, f in corpus.items():
        s = w.split()
        for a, b in zip(s, s[1:]):
            pairs[(a, b)] += f
    best = max(pairs, key=lambda k: (pairs[k], k))
    corpus = Counter({w.replace(" ".join(best), "".join(best)): f for w, f in corpus.items()})
    print(best, pairs[best])`],
  ["Edit-distance spell corrector", "Suggest the closest dictionary word to a typo.", py`
def edit(a, b):
    D = [[i + j if i * j == 0 else 0 for j in range(len(b) + 1)] for i in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] != b[j - 1]))
    return D[-1][-1]

words = ["language", "luggage", "lineage", "message"]
typo = "langauge"
print(sorted((edit(typo, w), w) for w in words)[:2])`],
  ["Entity-level F1", "Score predicted entity spans against gold.", py`
gold = {(0, 2, "PER"), (3, 4, "LOC"), (6, 7, "ORG")}
pred = {(0, 2, "PER"), (3, 4, "ORG"), (6, 7, "ORG")}
tp = len(gold & pred)
p, r = tp / len(pred), tp / len(gold)
print(tp, round(p, 3), round(r, 3), round(2 * p * r / (p + r), 3))`],
  ["Temperature sampling", "Sample 1000 words at two temperatures.", py`
import numpy as np

rng = np.random.default_rng(0)
z = np.array([3.0, 2.0, 1.0, 0.0])
for T in (0.5, 2.0):
    p = np.exp(z / T) / np.exp(z / T).sum()
    draws = rng.choice(4, size=1000, p=p)
    print(T, np.bincount(draws, minlength=4).tolist())`],
  ["Top-p filtering", "Keep the smallest set of words with cumulative probability at least 0.9.", py`
import numpy as np

p = np.array([0.5, 0.25, 0.15, 0.07, 0.03])
order = np.argsort(-p)
cum = np.cumsum(p[order])
keep = order[: int((cum < 0.9).sum()) + 1]
q = np.zeros_like(p)
q[keep] = p[keep] / p[keep].sum()
print(keep.tolist(), q.round(3).tolist())`],
];

export const glance: [string, string][] = [
  ["Retrieval", "idf = ln(N/df) · tf-idf = tf × idf · cosine = q·d / (‖q‖‖d‖) · precision@k, recall@k, RR = 1/rank"],
  ["Text cleaning", "lowercase · strip markup · normalise · tokenize · (stop words) · stem or lemmatize · vocabulary with <UNK>, <PAD>"],
  ["Edit distance", "D[i][j] = min(D[i−1][j]+1, D[i][j−1]+1, D[i−1][j−1] + [aᵢ ≠ bⱼ])"],
  ["N-grams", "n tokens → n − n′ + 1 n′-grams · P(w | h) = count(h w) / count(h) · add-one (count+1)/(count(h)+V)"],
  ["Embeddings", "cos(a, b) = a·b/(‖a‖‖b‖) · skip-gram: centre → context · king − man + woman ≈ queen"],
  ["Naive Bayes", "argmax log P(c) + Σ log P(w | c) with P(w | c) = (count + 1)/(tokens_c + V)"],
  ["Metrics", "precision TP/(TP+FP) · recall TP/(TP+FN) · F1 = 2PR/(P+R) · entity-level exact span + type"],
  ["HMM / Viterbi", "P = π B Π A B · δ₁ = π·B · δₜ(s) = max δₜ₋₁(s′)·A·B · cost O(n·S²)"],
  ["Language model", "P(w₁…wₙ) = Π P(wᵢ | history) · perplexity = P^(−1/N) = exp(cross-entropy)"],
  ["Decoding", "softmax(z/T) · top-k · top-p · beam width B · teacher forcing during training"],
  ["QA metrics", "EM = exact equality after normalising · token F1 · retrieval recall@k"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable NLP work", ["Look at 100 raw examples before building anything", "Split by document or user before any preprocessing", "Fit vocabularies and scalers on the training split only", "Beat a trivial baseline on the metric that matters", "Read the errors by hand and fix data first", "Version prompts, tokenizers and models together"]],
  ["Before you ship an NLP feature", ["A held-out test set that resembles live text", "Metrics sliced by language, dialect and class", "Behaviour defined for empty, very long and unexpected input", "A fallback when confidence is low", "Logging that masks personal data", "A monitoring plan for drift and a retraining trigger"]],
  ["Explaining your answer in an exam", ["Write the formula, substitute the numbers, calculate, interpret", "State assumptions: tokenization, smoothing, log base", "Name the baseline and the metric", "Say what the result does not show"]],
];

export const materials: [string, [string, string][]][] = [
  ["Free books and courses", [["Speech and Language Processing — Jurafsky and Martin", "https://web.stanford.edu/~jurafsky/slp3/"], ["Introduction to Information Retrieval — Manning, Raghavan, Schütze", "https://nlp.stanford.edu/IR-book/"], ["Stanford CS224N: NLP with Deep Learning", "https://web.stanford.edu/class/cs224n/"]]],
  ["Libraries and documentation", [["Hugging Face course", "https://huggingface.co/learn/nlp-course"], ["spaCy documentation", "https://spacy.io/usage"], ["NLTK book", "https://www.nltk.org/book/"]]],
];
