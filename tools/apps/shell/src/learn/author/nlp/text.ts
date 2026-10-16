import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "./util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- nlp`. */

const DOCS = `
import math
from collections import Counter

import numpy as np

docs = ["the cat sat on the mat", "the dog sat on the log", "cats and dogs are pets", "the stock market fell sharply"]
toks = [d.split() for d in docs]
vocab = sorted({w for t in toks for w in t})
N = len(docs)
df = {w: sum(w in t for t in toks) for w in vocab}
idf = {w: math.log(N / df[w]) for w in vocab}`;

export const src: ConceptDef[] = [
  {
    t: "What NLP is, and where text comes from",
    lv: 1,
    s: `{{Natural language processing}} turns human language into something a program can search, classify, label, translate or generate. Text arrives from many sources: web pages and news, social media, reviews, e-mail, chat and support tickets, documents (PDF, Word), transcribed speech and code. Each source has its own problems — noise and spelling in tweets, boilerplate in web pages, layout in PDFs, recognition errors in transcripts. The first job of any NLP system is therefore to collect, clean and measure the text, not to train a model.`,
    r: `In production most NLP failures are data failures: wrong encoding, duplicated pages, leaked labels, a domain shift between training text and live text.`,
    i: `Name three text sources and one data-quality problem for each.`,
    c: py`
sources = {
    "tweets": "noisy spelling, emoji, hashtags",
    "web pages": "menus, ads and other boilerplate",
    "PDF reports": "broken line order, tables",
    "call transcripts": "speech-recognition errors",
}
for name, issue in sources.items():
    print(f"{name:17s} -> {issue}")`,
    v: compare("Text sources and the trouble each one brings.", ["Typical problem", "First fix"], [
      ["Social media", "slang, emoji, misspellings", "normalise, keep emoji as tokens"],
      ["Web pages", "navigation and ads mixed in", "extract the main content"],
      ["PDF / Word", "layout destroys reading order", "parse structure, then clean"],
      ["Transcribed speech", "no punctuation, recognition errors", "add punctuation, correct names"],
    ]),
  },
  {
    t: "The NLP pipeline from raw text to answer",
    lv: 1,
    s: `A classic system is a chain: {{collect → clean → tokenize → represent → model → evaluate → deploy and monitor}}. Cleaning removes markup and fixes encoding; tokenization cuts text into units; representation turns tokens into numbers (counts, TF-IDF, embeddings); the model classifies, tags, ranks or generates; evaluation uses held-out data and the right metric. Modern systems often replace several middle stages with one pretrained network, but the same stages still exist inside it — and you still have to evaluate.`,
    r: `Keep the pipeline reproducible: the exact cleaning and tokenizer used in training must be applied at prediction time.`,
    i: `List the stages of a text-classification pipeline and say which ones must be fitted on training data only.`,
    c: py`
def clean(text):
    return " ".join(text.lower().split())

def tokenize(text):
    return text.split()

raw = "  The CAT   sat  on the mat "
print(tokenize(clean(raw)))`,
    v: rowflow("Stages of an NLP system.", ["Collect", "Clean", "Tokenize", "Represent", "Model", "Evaluate", "Monitor"], [
      "Gather documents and labels.",
      "Strip markup, fix encoding, normalise.",
      "Cut the text into tokens.",
      "Turn tokens into numbers.",
      "Classify, tag, rank or generate.",
      "Measure on held-out text.",
      "Watch for drift after deployment.",
    ]),
  },
  {
    t: "Information retrieval: the inverted index",
    lv: 1,
    s: `Searching every document for every query is slow. An {{inverted index}} stores, for each term, the list of documents that contain it (a postings list), so a query only touches the lists of its own words. Four toy documents: "cat" → [1], "on" → [1, 2], "mat" → [1]. A query "cat on mat" fetches those three lists and scores the documents that appear in them; documents 3 and 4 are never touched. A Boolean AND is the intersection of lists, OR the union.`,
    r: `Search engines add positions (for phrases), compression and sharding, but the core structure is exactly this dictionary.`,
    i: `Why does an inverted index make search fast?`,
    c: py`${DOCS}
index = {}
for i, t in enumerate(toks, 1):
    for w in set(t):
        index.setdefault(w, []).append(i)
for w in ("cat", "on", "mat", "the"):
    print(w, index[w])
print(sorted(set(index["cat"]) | set(index["on"]) | set(index["mat"])), sorted(set(index["on"]) & set(index["the"])))`,
    v: cells("Postings lists for a few terms (document numbers).", table(["term", "documents"], [["cat", "1"], ["on", "1, 2"], ["mat", "1"], ["the", "1, 2, 4"], ["pets", "3"]]), [
      ["Each term points straight to the documents that contain it."],
      ["A query for 'cat on mat' only reads these three lists.", [[1, 1, 1], [2, 1, 1], [3, 1, 1]]],
      ["'the' appears in most documents, so it tells us little.", [[4, 1, 1]]],
    ]),
  },
  {
    t: "TF-IDF: weigh words by how special they are",
    lv: 1,
    s: `A word is informative if it is frequent in this document but rare across the collection. {{tf}} = count in the document ÷ its length; {{idf = ln(N / df)}} where df is the number of documents containing the word. With N = 4: idf("the") = ln(4/3) = 0.288, idf("on") = ln(4/2) = 0.693, idf("cat") = idf("mat") = ln(4/1) = 1.386. The weight is {{tf × idf}}: rare words get large weights, ubiquitous ones almost none. Variants (smoothing, log-scaled tf) change the numbers but not the idea.`,
    r: `Without idf, stop words like "the" would dominate every comparison.`,
    i: `Compute idf for a word that appears in 1 of 4 documents and in 3 of 4.`,
    c: py`${DOCS}
for w in ("the", "on", "cat", "mat", "sat"):
    print(w, df[w], round(idf[w], 3))
tf = Counter(toks[0])
print({w: round(tf[w] / len(toks[0]) * idf[w], 3) for w in ("the", "cat", "sat", "on", "mat")})`,
    v: bars("idf for the chosen document frequency in a collection of 4 documents.", [["idf = ln(N/df)", "ln(4/df)"]], {
      max: 1.5,
      params: [par("df", "documents containing the word", 1, 4, 1, 1)],
      readout: ["N = 4, df = {df} → idf = ln(4/{df}) = {ln(4/df):3}"],
      steps: [["Appears in one document: highest idf.", { df: 1 }], ["Appears in 3 of 4 ('the'): low idf.", { df: 3 }], ["Appears everywhere: idf 0.", { df: 4 }]],
    }),
  },
  {
    t: "Ranking with cosine similarity",
    lv: 2,
    s: `Represent the query and each document as TF-IDF vectors and rank by {{cosine similarity = q·d / (‖q‖‖d‖)}} — the angle between them, so long documents are not favoured. For the query "cat on mat" the four documents score 0.918, 0.102, 0, 0: document 1 shares all three words (and the rare ones carry the weight), document 2 shares only "on", documents 3 and 4 share nothing. Note that "cat" does not match "cats": a retrieval system without stemming misses it.`,
    r: `Vector search at scale uses approximate nearest-neighbour indexes; dense embeddings replace TF-IDF vectors but the ranking idea is identical.`,
    i: `Why is cosine preferred to the raw dot product for ranking documents?`,
    c: py`${DOCS}
def vec(t, scale=True):
    c = Counter(t)
    return np.array([c[w] / len(t) * idf[w] for w in vocab])

q = vec(["cat", "on", "mat"])
for i, t in enumerate(toks, 1):
    v = vec(t)
    print(i, round(float(v @ q / (np.linalg.norm(v) * np.linalg.norm(q) + 1e-12)), 4))`,
    v: bars("Cosine similarity of each document to the query 'cat on mat'.", [["doc 1: the cat sat on the mat", "0.9176"], ["doc 2: the dog sat on the log", "0.102"], ["doc 3: cats and dogs are pets", "0"], ["doc 4: the stock market fell sharply", "0"]], {
      max: 1,
    }),
  },
  {
    t: "BM25: the ranking function behind most search",
    lv: 2,
    s: `BM25 refines TF-IDF with two fixes: term-frequency saturation (the tenth occurrence matters less than the second) and length normalisation. Per query word: idf × f(k₁+1) / (f + k₁(1 − b + b·|d|/avgdl)), typically k₁ = 1.5, b = 0.75, summed over the query. On the toy collection the scores for "cat on mat" are 2.979, 0.666, 0, 0 — same order as cosine, but with a principled handling of repeated words. Drag f to see the saturation curve: it flattens towards k₁ + 1.`,
    r: `BM25 remains a very strong baseline; hybrid search combines it with dense embeddings.`,
    i: `What two problems of plain TF-IDF does BM25 address?`,
    c: py`${DOCS}
def bm25(q, t, k1=1.5, b=0.75):
    avg = np.mean([len(x) for x in toks])
    s = 0.0
    for w in q:
        f = t.count(w)
        idw = math.log((N - df.get(w, 0) + 0.5) / (df.get(w, 0) + 0.5) + 1)
        s += idw * f * (k1 + 1) / (f + k1 * (1 - b + b * len(t) / avg))
    return s

print([round(float(bm25(["cat", "on", "mat"], t)), 3) for t in toks])`,
    v: plot("Term-frequency part of BM25 against the raw count f (document of average length).", {
      x: [0, 12], y: [0, 3], labels: ["term count f", "tf contribution"],
      params: [par("k", "k₁", 0.5, 3, 0.25, 1.5)],
      readout: ["limit as f grows = k₁ + 1 = {k+1:2}; at f = 3 the value is {3*(k+1)/(3+k):3}"],
      steps: [["k₁ = 1.5: saturates near 2.5.", { k: 1.5 }], ["k₁ = 0.5: saturates almost immediately.", { k: 0.5 }]],
    }, [curve("x*(k+1)/(x+k)", { c: "accent" }), hline("k+1", { c: "muted", dash: true }), pt("3", "3*(k+1)/(3+k)", { c: "warn" })]),
  },
  {
    t: "Evaluating retrieval: precision, recall and rank metrics",
    lv: 2,
    s: `Given a ranked list and known relevant documents, {{precision@k}} is the fraction of the top k that are relevant and {{recall@k}} the fraction of all relevant ones found. Ranking-aware: {{reciprocal rank = 1 / rank of the first relevant}} and, averaged over queries, MRR. Example: results [R, N, R, N, N] with 3 relevant documents in total: precision@3 = 2/3, recall@3 = 2/3, reciprocal rank = 1. If the first relevant result were at rank 4, the reciprocal rank would be 0.25.`,
    r: `Choose k by how many results a user actually reads; MRR suits "find the one answer" tasks.`,
    i: `Compute precision@3, recall@3 and the reciprocal rank for [R, N, R, N, N] with 3 relevant documents.`,
    c: py`
ranked = ["R", "N", "R", "N", "N"]
total_relevant = 3
k = 3
hits = ranked[:k].count("R")
print(round(hits / k, 3), round(hits / total_relevant, 3), 1 / (ranked.index("R") + 1))
print(1 / (["N", "N", "N", "R"].index("R") + 1))`,
    v: cells("A ranked result list: R = relevant, N = not relevant.", [P("rank", ["1", "2", "3", "4", "5"]), P("result", ["R", "N", "R", "N", "N"]), P("precision@k", ["1.00", "0.50", "0.67", "0.50", "0.40"])], [
      ["Five results for one query; three relevant documents exist in total."],
      ["Rank 1 is relevant: reciprocal rank = 1.", [[1, 0, 0]]],
      ["Top 3 contain 2 relevant: precision@3 = 2/3 and recall@3 = 2/3.", [[1, 0, 2], [2, 2, 2]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const prep: ConceptDef[] = [
  {
    t: "Cleaning and normalising text",
    lv: 1,
    s: `Cleaning decides what counts as "the same" text. Typical steps: fix encoding (UTF-8), strip HTML and URLs, lowercase, normalise Unicode and whitespace, expand or keep contractions, optionally remove punctuation and numbers. Each step trades information for consistency: lowercasing merges "Apple" the company with "apple" the fruit; removing "!" can erase sentiment. Apply the same recipe to training and live text, and decide per task rather than by habit.`,
    r: `Keep the raw text next to the cleaned text so you can audit mistakes later.`,
    i: `Give one cleaning step that helps and one situation where it hurts.`,
    c: py`
import re

raw = "Visit <b>https://x.io</b> NOW!!  It's GREAT :-)"
text = re.sub(r"<[^>]+>", " ", raw)
text = re.sub(r"https?://\S+", "<URL>", text)
text = re.sub(r"\s+", " ", text).strip().lower()
print(text)`,
    v: compare("Each cleaning step helps one task and hurts another.", ["Helps", "Can hurt"], [
      ["Lowercase", "merges 'Cat' and 'cat'", "'US' becomes 'us'; names lose their shape"],
      ["Remove punctuation", "cleaner tokens", "'!!!' and ':-)' carry sentiment"],
      ["Remove numbers", "less noise", "prices, dates and doses matter"],
      ["Strip HTML / URLs", "removes boilerplate", "link targets can be useful features"],
    ]),
  },
  {
    t: "Tokenization: choosing the units",
    lv: 1,
    s: `A {{token}} is the unit the model sees. Splitting on spaces is a start, but English needs more care: "don't" → "do" + "n't", "New York" is one name, "e-mail" and "U.S.A." contain punctuation, and languages such as Chinese or Thai have no spaces at all. Tokenizers can work at word, sub-word or character level. Word tokens are readable but make a huge vocabulary with unknown words; character tokens never fail but make sequences long; sub-words sit in between.`,
    r: `The tokenizer is part of the model: swapping it silently changes every downstream number.`,
    i: `Why is splitting on whitespace not enough for English?`,
    c: py`
import re

s = "Don't visit New York, e-mail me at 5pm!"
print(s.split())
print(re.findall(r"\w+(?:'\w+)?|[^\w\s]", s))
print(list("NLP"))`,
    v: compare("Three granularities of tokens for 'unhappiness'.", ["Tokens", "Trade-off"], [
      ["Word", "unhappiness", "readable, but unseen words become <UNK>"],
      ["Sub-word", "un · happi · ness", "small vocabulary, handles new words"],
      ["Character", "u n h a p p i n e s s", "never unknown, but long sequences"],
    ]),
  },
  {
    t: "Stop words, stemming and lemmatization",
    lv: 1,
    s: `{{Stop words}} (the, of, is) are frequent and often removed for retrieval — but they matter for syntax-sensitive tasks ("to be or not to be"). {{Stemming}} chops suffixes with rules: "running", "runs" → "run" (but also "university" and "universe" → "univers"). {{Lemmatization}} uses a dictionary and part of speech to return the true base form: "better" → "good", "was" → "be". Stemming is fast and crude; lemmatization is slower and linguistically correct.`,
    r: `For search, stemming often raises recall at some cost in precision; for classification with embeddings, neither is usually needed.`,
    i: `Give an example where stemming and lemmatization disagree.`,
    c: py`
def crude_stem(w):
    for suf in ("ing", "ed", "es", "s"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            w = w[: -len(suf)]
            break
    if len(w) > 3 and w[-1] == w[-2] and w[-1] not in "aeiou":
        w = w[:-1]
    return w

for w in ("running", "runs", "cats", "studies", "better"):
    print(w, "->", crude_stem(w))
lemma = {"better": "good", "was": "be", "mice": "mouse"}
print(lemma["better"], lemma["mice"])`,
    v: compare("Stemming versus lemmatization.", ["Stemming", "Lemmatization"], [
      ["running", "run", "run"],
      ["studies", "studi", "study"],
      ["better", "better", "good"],
      ["method", "rules on suffixes", "dictionary + part of speech"],
    ]),
  },
  {
    t: "Spelling and the edit distance",
    lv: 2,
    s: `{{Edit (Levenshtein) distance}} counts the minimum insertions, deletions and substitutions that turn one string into another. A table D[i][j] holds the distance between the first i letters of one word and the first j of the other: D[i][j] = min(D[i−1][j] + 1, D[i][j−1] + 1, D[i−1][j−1] + (letters differ)). "kitten" → "sitting" takes 3 edits (k→s, e→i, insert g). Spell checkers rank dictionary words by small distance and by how common they are; the same table underlies sequence alignment and word-error rate.`,
    r: `Dynamic programming turns an exponential search into n × m cheap cells.`,
    i: `Fill the edit-distance table for "cat" and "cut".`,
    c: py`
import numpy as np

def edit(a, b):
    D = np.zeros((len(a) + 1, len(b) + 1), int)
    D[:, 0] = range(len(a) + 1)
    D[0, :] = range(len(b) + 1)
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (a[i - 1] != b[j - 1]))
    return D

print(edit("cat", "cut").tolist())
print(edit("kitten", "sitting")[-1, -1])`,
    v: cells("Edit-distance table for 'cat' → 'cut'; the bottom-right cell is the answer.", table(["", "∅", "c", "u", "t"], [["∅", "0", "1", "2", "3"], ["c", "1", "0", "1", "2"], ["a", "2", "1", "1", "2"], ["t", "3", "2", "2", "1"]]), [
      ["Row i and column j hold the distance between prefixes."],
      ["'c' matches 'c' on the diagonal: cost 0.", [[2, 2, 2]]],
      ["'a' versus 'u' is a substitution: 1 + 0 = 1.", [[3, 3, 3]]],
      ["'t' matches 't': the final distance is 1.", [[4, 4, 4]]],
    ]),
  },
  {
    t: "N-grams: remembering a little context",
    lv: 1,
    s: `An {{n-gram}} is a run of n consecutive tokens: unigrams are single words, bigrams pairs ("New York"), trigrams triples. Counting them captures phrases that single words miss and is the basis of classic language models and of features such as "not good". The price is size: a vocabulary of V words has V² possible bigrams and V³ trigrams, almost all of them never seen. The sentence "the cat sat on the mat" has 6 unigrams, 5 bigrams and 4 trigrams.`,
    r: `Character n-grams are robust to misspellings and useful for language identification.`,
    i: `How many bigrams does a sentence of 7 tokens contain?`,
    c: py`
words = "the cat sat on the mat".split()
ngrams = lambda n: list(zip(*[words[i:] for i in range(n)]))
print(len(ngrams(1)), len(ngrams(2)), len(ngrams(3)))
print(ngrams(2))`,
    v: cells("Sliding a window of 2 over the sentence gives the bigrams.", [P("tokens", ["the", "cat", "sat", "on", "the", "mat"]), P("bigram 1", ["the", "cat", "", "", "", ""]), P("bigram 2", ["", "cat", "sat", "", "", ""]), P("bigram 5", ["", "", "", "", "the", "mat"])], [
      ["Six tokens give five overlapping bigrams."],
      ["Bigram 1: 'the cat'.", [[1, 0, 1]]],
      ["Bigram 2: 'cat sat'.", [[2, 1, 2]]],
      ["Bigram 5: 'the mat'.", [[3, 4, 5]]],
    ]),
  },
  {
    t: "Sub-word tokenization with byte-pair encoding",
    lv: 2,
    s: `{{Byte-pair encoding (BPE)}} starts from characters and repeatedly merges the most frequent adjacent pair into a new symbol. Corpus: low ×5, lower ×2, newest ×6, widest ×3. Counting pairs gives the merges (t, </w>) → "t</w>" (9 times), then (s, t</w>) → "st</w>" (9), then (e, st</w>) → "est</w>" (9), then (o, w) → "ow" (7) and (l, ow) → "low" (7). Frequent words become single tokens, rare words are split into pieces, and no word is ever unknown — the idea behind the tokenizers of modern language models.`,
    r: `Vocabulary size is a hyper-parameter: more merges mean shorter sequences but bigger embedding tables.`,
    i: `Perform the first BPE merge on the corpus above and say why that pair wins.`,
    c: py`
from collections import Counter

corpus = Counter({"l o w </w>": 5, "l o w e r </w>": 2, "n e w e s t </w>": 6, "w i d e s t </w>": 3})

def pair_counts(c):
    p = Counter()
    for word, f in c.items():
        s = word.split()
        for a, b in zip(s, s[1:]):
            p[(a, b)] += f
    return p

for _ in range(5):
    p = pair_counts(corpus)
    best = max(p, key=lambda k: (p[k], k))
    print(best, p[best])
    merged = Counter()
    for word, f in corpus.items():
        merged[word.replace(" ".join(best), "".join(best))] += f
    corpus = merged
print(list(corpus))`,
    v: rowflow("The first merges on the toy corpus.", ["characters", "merge t + </w>", "merge s + t</w>", "merge e + st</w>", "merge o + w", "merge l + ow"], [
      "Every word starts as single characters.",
      "'t</w>' appears 9 times (newest, widest).",
      "'st</w>' 9 times.",
      "'est</w>' 9 times.",
      "'ow' 7 times (low, lower).",
      "'low' is now one token.",
    ]),
  },
  {
    t: "Vocabulary, unknown words and padding",
    lv: 1,
    s: `A model needs a fixed vocabulary. Words outside it become an {{<UNK>}} token; sequences are padded with {{<PAD>}} (ignored by masks) and often wrapped with <S> and </S>. Choosing the size is a trade-off: keep the most frequent 10,000 words and everything else becomes <UNK>; sub-word vocabularies avoid the problem. Build the vocabulary on the training split only — words that appear only in test data are exactly the unknowns you must learn to handle.`,
    r: `Track the <UNK> rate on live text: a rising rate is an early drift alarm.`,
    i: `Why must the vocabulary be built from the training set only?`,
    c: py`
from collections import Counter

train = "the cat sat on the mat the dog sat".split()
counts = Counter(train)
vocab = ["<PAD>", "<UNK>"] + [w for w, c in counts.most_common() if c >= 2]
index = {w: i for i, w in enumerate(vocab)}
encode = lambda s: [index.get(w, index["<UNK>"]) for w in s.split()]
print(vocab, encode("the bird sat"))`,
    v: cells("A sentence with an unseen word, encoded and padded to length 5.", [P("words", ["the", "bird", "sat", "", ""]), P("ids", ["2", "1", "3", "0", "0"])], [
      ["'bird' is not in the vocabulary."],
      ["It receives the <UNK> id 1.", [[1, 1, 1]]],
      ["Padding fills the sequence to a fixed length with id 0.", [[1, 3, 4]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const repr: ConceptDef[] = [
  {
    t: "Bag of words: counting what is there",
    lv: 1,
    s: `The simplest representation counts each vocabulary word in a document and forgets the order. "the cat sat on the mat" becomes a vector with the = 2 and cat = sat = on = mat = 1. It is fast and works surprisingly well for topic classification and spam filtering, but it cannot tell "dog bites man" from "man bites dog", treats "good" and "great" as unrelated, and the vectors are long and mostly zero (sparse).`,
    r: `A sparse matrix (SciPy / scikit-learn) stores only the non-zero counts; always keep text features sparse.`,
    i: `Why can a bag-of-words model not distinguish "dog bites man" from "man bites dog"?`,
    c: py`${DOCS}
def bow(t):
    c = Counter(t)
    return [c[w] for w in vocab]

print(vocab)
print(bow(toks[0]))
print(sorted(toks[0]) == sorted("mat the on sat cat the".split()))`,
    v: cells("Counts for 'the cat sat on the mat' (vocabulary shortened to the words that occur).", table(["word", "the", "cat", "sat", "on", "mat", "dog"], [["count", "2", "1", "1", "1", "1", "0"]]), [
      ["One number per vocabulary word; order is lost."],
      ["'the' appears twice.", [[1, 1, 1]]],
      ["Words that do not occur are 0 — most of the vector.", [[1, 6, 6]]],
    ]),
  },
  {
    t: "Sparse versus dense: why embeddings exist",
    lv: 1,
    s: `A one-hot or count vector has one dimension per word: 50,000 dimensions, almost all zero, and every pair of words is equally unrelated (their dot product is 0). A {{dense embedding}} gives each word a short vector (50–300 numbers) learned from text so that words used in similar contexts get similar vectors. "cat" and "dog" end up close, "cat" and "stock" far apart, and the model can generalise from "I adopted a cat" to "I adopted a dog".`,
    r: `Embeddings are learned once on huge corpora and reused: that is transfer learning for text.`,
    i: `Why are one-hot vectors of "cat" and "dog" no more similar than "cat" and "stock"?`,
    c: py`
import numpy as np

onehot = np.eye(4)
print(float(onehot[0] @ onehot[1]), float(onehot[0] @ onehot[3]))
E = np.array([[0.9, 0.8], [0.85, 0.75], [0.1, 0.9], [-0.7, 0.1]])
cos = lambda a, b: float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))
print(round(cos(E[0], E[1]), 3), round(cos(E[0], E[3]), 3))`,
    v: compare("Sparse counts versus dense embeddings.", ["Sparse (one-hot / counts)", "Dense embedding"], [
      ["Dimensions", "vocabulary size (50,000+)", "50–300"],
      ["Similarity", "every pair equally unrelated", "similar words are close"],
      ["Learned?", "no, defined by counting", "yes, from context"],
      ["Memory", "sparse storage needed", "small dense matrix"],
    ]),
  },
  {
    t: "Cosine similarity between word vectors",
    lv: 1,
    s: `{{cos(a, b) = a·b / (‖a‖‖b‖)}} measures the angle between two vectors: 1 = same direction, 0 = unrelated, −1 = opposite. It ignores length, so a rare and a frequent word of similar meaning can still match. With toy vectors cat = (0.9, 0.8) and dog = (0.85, 0.75) the cosine is 1.000 (almost the same direction), while cat and stock = (−0.7, 0.1) give −0.65. Drag the angle: cosine is simply cos θ.`,
    r: `Normalise vectors once and cosine becomes a plain dot product, which is what vector databases compute.`,
    i: `What range can cosine similarity take and what does 0 mean?`,
    c: py`
import numpy as np

cat, dog, stock = np.array([0.9, 0.8]), np.array([0.85, 0.75]), np.array([-0.7, 0.1])
cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
print(round(cos(cat, dog), 3), round(cos(cat, stock), 3))
print(round(cos(np.array([1.0, 0.0]), np.array([0.0, 2.0])), 3))`,
    v: plot("Cosine similarity against the angle between two vectors.", {
      x: [0, 180], y: [-1.2, 1.2], labels: ["angle θ (degrees)", "cosine"],
      params: [par("a", "angle θ", 0, 180, 5, 45)],
      readout: ["cos({a}°) = {cos(a*3.14159265/180):3}"],
      steps: [["0°: identical direction.", { a: 0 }], ["90°: unrelated.", { a: 90 }], ["180°: opposite.", { a: 180 }]],
    }, [curve("cos(x*3.14159265/180)", { c: "accent" }), pt("a", "cos(a*3.14159265/180)", { c: "bad" }), hline("0", { c: "muted" })]),
  },
  {
    t: "Word2vec: learning vectors from context",
    lv: 2,
    s: `The distributional idea: "you shall know a word by the company it keeps". {{Skip-gram}} trains a network to predict the words around a centre word; {{CBOW}} predicts the centre from its context. Window 2 on "the quick brown fox jumps" with centre "brown" gives the training pairs (brown → the), (brown → quick), (brown → fox), (brown → jumps). After training on millions of pairs the hidden weights are the embeddings. {{GloVe}} reaches similar vectors by factorising co-occurrence counts.`,
    r: `Negative sampling (a few random wrong words per pair) makes training cheap enough for huge corpora.`,
    i: `List the skip-gram training pairs for the centre word "brown" with window 2.`,
    c: py`
words = "the quick brown fox jumps".split()
window = 2
pairs = [(words[i], words[j]) for i in range(len(words)) for j in range(max(0, i - window), min(len(words), i + window + 1)) if i != j]
print(len(pairs))
print([p for p in pairs if p[0] == "brown"])`,
    v: cells("Centre word 'brown' and its context window of 2.", [P("sentence", ["the", "quick", "brown", "fox", "jumps"]), P("context", ["the", "quick", "·", "fox", "jumps"])], [
      ["Slide the window over the text; the centre word predicts its neighbours."],
      ["Centre word: 'brown'.", [[0, 2, 2]]],
      ["Targets inside the window: the, quick, fox, jumps.", [[1, 0, 1], [1, 3, 4]]],
    ]),
  },
  {
    t: "Analogies in embedding space",
    lv: 2,
    s: `Because directions in the space capture relations, vector arithmetic can express analogies: {{king − man + woman ≈ queen}}. Toy 2-D vectors (royalty, maleness): king = (0.9, 0.8), man = (0.1, 0.8), woman = (0.1, 0.2) → king − man + woman = (0.9, 0.2), exactly the vector chosen for queen. In real embeddings this works only roughly, the answer must exclude the query words, and it also reproduces biases present in the training text.`,
    r: `Treat analogies as a probe, not a guarantee; audit embeddings for gender and other social bias before using them.`,
    i: `Compute king − man + woman with the toy vectors and find the nearest word.`,
    c: py`
import numpy as np

E = {"king": [0.9, 0.8], "queen": [0.9, 0.2], "man": [0.1, 0.8], "woman": [0.1, 0.2], "apple": [-0.5, 0.0]}
E = {w: np.array(v) for w, v in E.items()}
v = E["king"] - E["man"] + E["woman"]
dist = {w: round(float(np.linalg.norm(v - e)), 3) for w, e in E.items() if w not in ("king", "man", "woman")}
print(v.tolist(), min(dist, key=dist.get), dist)`,
    v: plot("Toy embedding space: the arrow from man to woman equals the arrow from king to queen.", {
      x: [-0.6, 1.2], y: [-0.2, 1.1], labels: ["royalty", "maleness"],
    }, [pt("0.9", "0.8", { c: "info", label: "king" }), pt("0.9", "0.2", { c: "good", label: "queen" }), pt("0.1", "0.8", { c: "info", label: "man" }), pt("0.1", "0.2", { c: "good", label: "woman" }), seg("0.1", "0.8", "0.1", "0.2", { c: "muted", dash: true }), seg("0.9", "0.8", "0.9", "0.2", { c: "muted", dash: true })]),
  },
  {
    t: "Sentence and document vectors",
    lv: 1,
    s: `To classify or compare a whole text you need one vector. The simplest recipe averages the word vectors, optionally weighted by idf: for "cat sat" with cat = (0.9, 0.8) and sat = (0.1, 0.4) the mean is (0.5, 0.6). Averaging ignores order and dilutes long texts. Better: sentence encoders (such as those built on transformers) give a single vector per sentence trained so that paraphrases are close; these power semantic search and clustering.`,
    r: `Evaluate on your own task: a good general encoder can still be poor on a narrow domain.`,
    i: `Why might averaged word vectors fail to separate "not good" from "good"?`,
    c: py`
import numpy as np

E = {"cat": [0.9, 0.8], "sat": [0.1, 0.4], "good": [0.8, 0.1], "not": [-0.1, 0.0]}
mean = lambda ws: np.mean([E[w] for w in ws], axis=0)
print(mean(["cat", "sat"]).round(2).tolist())
print(mean(["good"]).round(3).tolist(), mean(["not", "good"]).round(3).tolist())`,
    v: compare("Ways to get one vector for a text.", ["Keeps order?", "Cost"], [
      ["Average of word vectors", "no", "very cheap"],
      ["idf-weighted average", "no", "cheap; stop words matter less"],
      ["Recurrent / transformer encoder", "yes", "heavier, usually better"],
    ]),
  },
  {
    t: "Contextual embeddings: one word, many vectors",
    lv: 2,
    s: `A static embedding gives "bank" one vector whatever the sentence. {{Contextual embeddings}} (ELMo, BERT and its successors) compute a different vector for each occurrence from the whole sentence: "river bank" and "bank loan" end up far apart. They come from deep networks pretrained to predict masked or next words on enormous text, then fine-tuned on the task. This is the shift that made pretraining the default in NLP.`,
    r: `Using a pretrained encoder as a frozen feature extractor is cheap; full fine-tuning usually gives more accuracy.`,
    i: `What problem of static word vectors do contextual embeddings solve?`,
    c: py`
import numpy as np

static = {"bank": np.array([0.5, 0.5])}
context_shift = {"river": np.array([-0.4, 0.3]), "loan": np.array([0.4, -0.3])}
for c, s in context_shift.items():
    print("bank near", c, (static["bank"] + s).round(2).tolist())`,
    v: compare("Static versus contextual vectors for 'bank'.", ["Static (word2vec)", "Contextual (BERT)"], [
      ["Vectors per word", "one", "one per occurrence"],
      ["'river bank' vs 'bank loan'", "identical", "different"],
      ["Needs the sentence?", "no", "yes"],
      ["Typical use", "fast features", "state-of-the-art accuracy"],
    ]),
  },
];

void [bars, vline];
