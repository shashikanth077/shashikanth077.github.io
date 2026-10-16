import { L, P, bars, cells, compare, flow, layers, par, plot, pt, seg } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "./data.js";

/* Every code example is RUN by `npm run outputs -- machine-learning`. */

const tickets = ["refund payment", "refund charge", "delivery late", "parcel delivery", "password login", "reset password"];

export const text: ConceptDef[] = [
  {
    t: "The whole text-mining story: four tasks",
    lv: 1,
    s: `A shop's support inbox gets messages like "I paid twice for order AB123. Please refund €20." A person sees the issue, the order number and the request; a computer needs methods to turn words into useful outputs. Four tasks: {{find a document}} (search the help centre for the refund policy — information retrieval), {{read details}} (extract AB123, €20, "refund" — information extraction), {{route a ticket}} (assign Billing — classification) and {{discover a pattern}} (a growing group of double-payment complaints — clustering and text mining). The pipeline is always: understand the task → prepare the text → turn words into numbers → train, retrieve or cluster → evaluate and review.`,
    r: `All example customers and tickets are fictional. Real messages contain greetings, spelling errors, personal data, several issues at once and context from earlier replies.`,
    i: `Give an example of information retrieval, information extraction, classification and clustering on support tickets.`,
    v: compare("One inbox, four jobs.", ["Task", "Output for the refund ticket"], [
      ["Find a document", "information retrieval", "the ranked refund-policy pages"],
      ["Read details", "information extraction", "{order: AB123, amount: 20, currency: EUR}"],
      ["Route a ticket", "classification", "Billing"],
      ["Discover a pattern", "clustering / text mining", "a growing group of double-payment complaints"],
    ]),
  },
  {
    t: "Five terms that sound similar",
    lv: 1,
    s: `Give each term its own question and output. {{Text mining}}: what useful patterns exist across text? {{Information retrieval (IR)}}: which documents help answer this query? {{Information extraction (IE)}}: which structured facts are inside this text? {{Data mining}}: what patterns exist in data of any type? {{Natural language processing (NLP)}}: how can software process language — tokens, entities, sentiment, translations, summaries? They overlap; they are not five mandatory stages in a fixed order. An NLP component can identify entities, IE stores them as fields, IR finds evidence, text mining aggregates patterns.`,
    r: `NLP systems model language patterns; success does not mean a computer understands language as a person does. Check performance on real users' wording.`,
    i: `Distinguish information retrieval from information extraction.`,
    v: compare("Question and example output of each term.", ["Question", "Example output"], [
      ["Text mining", "what useful patterns exist across text?", "refund complaints rose after a release"],
      ["Information retrieval", "which documents help answer this query?", "ranked policy pages for \"refund delay\""],
      ["Information extraction", "which structured facts are inside this text?", "{order: AB123, amount: 20, currency: EUR}"],
      ["Data mining", "what patterns exist in data of any type?", "late delivery correlates with repeat contacts"],
      ["NLP", "how can software process language?", "tokens, entities, sentiment, translations, summaries"],
    ]),
  },
  {
    t: "Six decisions before choosing an algorithm",
    lv: 1,
    s: `The lecture's overview map reduces to six decisions. {{Purpose}}: extract context, detect sentiment, analyse meaning, recognise entities, find topics or similar text, generate text, summarise. {{Learning method}}: supervised (examples with answers), unsupervised (look for structure), semi-supervised (a small labelled set plus unlabelled data). {{Label structure}}: binary, multiclass (one of several), multilabel (several tags at once), unlabelled. {{Text length}}: a short chat message differs from a policy document (the "under 150 symbols" bucket is only illustrative). {{Representation}}: counts, TF–IDF, learned embeddings. {{Language}}: single-language or multilingual.`,
    r: `The same purpose can use several learning methods: sentiment can use rules or a supervised model; topic discovery can use clustering, while classification assigns predefined topics.`,
    i: `What is the difference between multiclass and multilabel classification?`,
    v: layers("Walk through the decisions in order.", [
      "1 · Purpose|context, sentiment, meaning, entities, topics, generation, summaries|i",
      "2 · Learning method|supervised · unsupervised · semi-supervised|g",
      "3 · Label structure|binary · multiclass · multilabel · unlabelled|g",
      "4 · Text length|chat message · paragraph · page|w",
      "5 · Representation|counts · TF–IDF · embeddings|w",
      "6 · Language|single-language · multilingual|b",
    ], "decide in this order"),
  },
  {
    t: "A small, understandable dataset",
    lv: 1,
    s: `Start with six short support tickets so the vectors can be calculated by hand. The Billing, Delivery and Account labels are answers supplied by people (used for classification); for clustering hide that column and let the algorithm group the text vectors. Keep IDs for traceability but never use unique IDs as predictive features. Near-duplicate messages from one thread must not appear in both training and test sets — otherwise the model seems to generalise while merely recognising repeated text.`,
    r: `Collect authorised messages, remove identifiers from the modelling text, label using written rules, split by customer or thread, and fit preprocessing on training data only.`,
    i: `Why must messages from the same thread stay in one split?`,
    c: py`
from collections import Counter

tickets = ["refund payment", "refund charge", "delivery late", "parcel delivery", "password login", "reset password"]
labels = ["Billing", "Billing", "Delivery", "Delivery", "Account", "Account"]
print(dict(Counter(labels)))
print([len(t.split()) for t in tickets])`,
    v: cells("Six toy tickets with their human labels.", table(["id", "text", "category"], tickets.map((t, i) => [`T${i + 1}`, t, ["Billing", "Billing", "Delivery", "Delivery", "Account", "Account"][i] ?? ""])), [
      ["Short on purpose, so every vector can be computed by hand."],
      ["The category column is only for classification; clustering would not see it.", [[1, 2, 2], [2, 2, 2], [3, 2, 2], [4, 2, 2], [5, 2, 2], [6, 2, 2]]],
      ["The text column is what the algorithms turn into numbers.", [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 1], [5, 1, 1], [6, 1, 1]]],
    ]),
  },
  {
    t: "Preparing text without destroying its meaning",
    lv: 1,
    s: `Cleaning depends on the task. Keep the original securely, normalise whitespace and Unicode, {{tokenise}}, optionally remove stop words or reduce words to stems/lemmas, then create features. Caution everywhere: lower-casing can hurt entity recognition; do not remove "not" blindly ("payment received" versus "payment not received"); a stem like "connect" may not be a dictionary word; n-grams keep phrases ("not refunded") but multiply features. "It is not bad" and "It is bad" must stay distinguishable, and "Great, another payment failure" may be sarcasm.`,
    r: `The code uses a simple transparent tokeniser, not a production multilingual one. Pretrained models expect their own input format.`,
    i: `Why is removing the word "not" as a stop word dangerous?`,
    c: py`
import re

msg = "My PAYMENT was not refunded for order AB123!!!"
tokens = re.findall(r"[a-z0-9]+", msg.lower())
print(tokens)
stop = {"my", "was", "for", "the", "a"}
kept = [t for t in tokens if t not in stop]
print(kept)
print(list(zip(kept, kept[1:])))`,
    v: compare("Common operations and their cautions.", ["Example", "Caution"], [
      ["Lower-case", "PAYMENT → payment", "case can help entity recognition"],
      ["Tokenise", "\"refund payment\" → [refund, payment]", "words, subwords and characters are different units"],
      ["Stop words", "remove \"the\", \"a\"", "never remove \"not\" blindly"],
      ["Stemming", "\"connected\" → stem", "the result may not be a real word"],
      ["Lemmatisation", "\"payments\" → \"payment\"", "language and context matter"],
      ["N-grams", "\"not refunded\" as one feature", "preserves phrases, increases the feature count"],
      ["Character n-grams", "\"login\" → log, ogi, gin", "helps spelling variation, adds noise"],
    ]),
  },
  {
    t: "Bag of words: text as a table",
    lv: 1,
    s: `A fixed vocabulary gives every message the same coordinate system. For the mini-corpus D1 = "refund payment", D2 = "refund charge", D3 = "delivery" and the column order [refund, payment, charge, delivery]: D1 = [1, 1, 0, 0], D2 = [1, 0, 1, 0], D3 = [0, 0, 0, 1]; "refund refund payment" is [2, 1, 0, 0] (binary presence would give [1, 1, 0, 0]). What is lost: word order — "dog bites person" and "person bites dog" have identical counts (n-grams recover some). Most entries of a large document–term matrix are zero, so use sparse storage.`,
    r: `Fit the vocabulary on training text only; unknown words are ignored, which can produce an all-zero vector.`,
    i: `Build the bag-of-words vector for "refund refund payment" with vocabulary [refund, payment, charge, delivery].`,
    c: py`
import numpy as np

vocab = ["refund", "payment", "charge", "delivery"]
docs = ["refund payment", "refund charge", "delivery", "refund refund payment"]
matrix = np.array([[d.split().count(w) for w in vocab] for d in docs])
print(matrix.tolist())
print((matrix > 0).astype(int).tolist()[-1])`,
    v: cells("Each document becomes a row of word counts.", table(["", "refund", "payment", "charge", "delivery"], [["D1: refund payment", "1", "1", "0", "0"], ["D2: refund charge", "1", "0", "1", "0"], ["D3: delivery", "0", "0", "0", "1"]]), [
      ["The vocabulary fixes the column order."],
      ["D1 contains refund once and payment once → [1, 1, 0, 0].", [[1, 1, 2]]],
      ["D2 → [1, 0, 1, 0]; D3 → [0, 0, 0, 1].", [[2, 1, 1], [2, 3, 3], [3, 4, 4]]],
    ]),
  },
  {
    t: "TF–IDF: make distinctive words count more",
    lv: 2,
    s: `Common words help less in telling documents apart. With the smoothed convention used by scikit-learn's default: {{idf(t) = ln((1 + N)/(1 + df(t))) + 1}}, {{weight(t, d) = count(t, d) × idf(t)}}, then L2-normalise each row: {{v / √Σ vⱼ²}}. N = 3 documents; "refund" appears in 2 (df = 2): idf = ln(4/3) + 1 ≈ 1.2877; "payment" in 1: idf = ln(4/2) + 1 ≈ 1.6931. D1 unnormalised = [1.2877, 1.6931, 0, 0], length 2.1272, so D1 ≈ [0.6053, 0.7960, 0, 0]. TF–IDF does not understand synonyms: "refund" and "reimbursement" stay different features. Drag N, df and the count.`,
    r: `Books use different TF and IDF conventions: state your formula before doing arithmetic, because another convention gives other (also correct) numbers.`,
    i: `Compute idf for a word found in 1 of 3 documents with the smoothed formula.`,
    c: py`
import numpy as np

docs = [["refund", "payment"], ["refund", "charge"], ["delivery"]]
vocab = ["refund", "payment", "charge", "delivery"]
N = len(docs)
df = np.array([sum(w in d for d in docs) for w in vocab])
idf = np.log((1 + N) / (1 + df)) + 1
counts = np.array([[d.count(w) for w in vocab] for d in docs], dtype=float)
tfidf = counts * idf
norm = tfidf / np.linalg.norm(tfidf, axis=1, keepdims=True)
print(df.tolist(), idf.round(4).tolist())
print(norm.round(4).tolist())`,
    v: bars("Inverse document frequency of a word and its weight in a message.", [["idf", "ln((1+N)/(1+df))+1"], ["weight = count × idf", "c*(ln((1+N)/(1+df))+1)"]], {
      max: 6,
      params: [par("N", "documents N", 3, 100, 1, 3), par("df", "documents containing the word df", 1, 100, 1, 2), par("c", "word count in this message", 1, 3, 1, 1)],
      readout: ["N = {N}, df = {df}: idf = {ln((1+N)/(1+df))+1:4}"],
      steps: [["\"refund\": df = 2 of 3 → idf 1.2877.", { N: 3, df: 2, c: 1 }], ["\"payment\": df = 1 of 3 → idf 1.6931 — rarer, so heavier.", { N: 3, df: 1, c: 1 }], ["A word in every document is barely distinctive: idf ≈ 1.", { N: 3, df: 3, c: 1 }]],
    }),
  },
  {
    t: "Cosine similarity: do two messages point the same way?",
    lv: 2,
    s: `{{cos(x, y) = (x · y) / (‖x‖ ‖y‖)}} compares content and reduces the effect of document length. For counts D1 = [1, 1, 0, 0] and D2 = [1, 0, 1, 0]: dot product 1, both lengths √2, similarity 1/2 = 0.5. D1 and D3 = [0, 0, 0, 1]: dot product 0 → similarity 0. For the normalised TF–IDF vector of D1 and the query "refund" = [1, 0, 0, 0] the similarity is just the dot product, 0.6053; D2 ties; D3 scores 0. For non-negative counts or TF–IDF cosine lies between 0 and 1. A zero vector has no direction: handle it separately.`,
    r: `Similarity is not correctness: two near-identical messages can have opposite meanings if "not" is added.`,
    i: `Compute the cosine similarity of [1, 1, 0, 0] and [1, 0, 1, 0].`,
    c: py`
import numpy as np

cos = lambda a, b: float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
D1, D2, D3 = np.array([1, 1, 0, 0]), np.array([1, 0, 1, 0]), np.array([0, 0, 0, 1])
print(round(cos(D1, D2), 2), cos(D1, D3))
d1 = np.array([np.log(4 / 3) + 1, np.log(4 / 2) + 1, 0, 0])
d1 = d1 / np.linalg.norm(d1)
print(round(float(d1 @ np.array([1, 0, 0, 0])), 4))`,
    v: cells("Dot product ÷ product of lengths.", table(["pair", "dot product", "lengths", "cosine"], [["D1 · D2", "1", "√2 × √2 = 2", "0.5"], ["D1 · D3", "0", "√2 × 1", "0"], ["D1(tf-idf) · query", "0.6053", "1 × 1", "0.6053"]]), [
      ["Three pairs of vectors."],
      ["D1 and D2 share one of two words: similarity 0.5.", [[1, 3, 3]]],
      ["D1 and D3 share nothing: similarity 0.", [[2, 3, 3]]],
      ["With normalised vectors the cosine is just the dot product.", [[3, 3, 3]]],
    ]),
  },
  {
    t: "Information retrieval: a tiny search engine",
    lv: 2,
    s: `Return useful documents before trying to generate an answer: transform the query with the SAME vocabulary, compare it with the document vectors, rank, and show the source text. In the toy corpus the query "refund" scores D1 and D2 equally (0.6053 each) and D3 zero; "payment" retrieves D1 first (0.7960); a query with no vocabulary overlap returns no positive score instead of pretending it found evidence. Evaluate with {{precision@k}} = relevant retrieved / k and {{recall@k}} = relevant retrieved / all relevant: with 4 relevant pages and 2 among the top 3, precision@3 = 2/3 and recall@3 = 2/4 = 0.5. Choose the query below.`,
    r: `Beyond this lab: BM25 for lexical retrieval, embeddings for semantic retrieval, hybrid retrieval and rerankers. Good ranking cannot compensate for missing or outdated sources, and you must search only what the user may access.`,
    i: `Compute precision@3 and recall@3 when 2 of the top 3 results are relevant and there are 4 relevant pages in total.`,
    c: py`
import numpy as np

vocab = ["refund", "payment", "charge", "delivery"]
docs = np.array([[0.6053, 0.7960, 0, 0], [0.6053, 0, 0.7960, 0], [0, 0, 0, 1.0]])
for query in ("refund", "payment", "delivery", "parcel"):
    q = np.array([1.0 if w == query else 0.0 for w in vocab])
    scores = docs @ q
    print(query, scores.round(4).tolist(), (scores.argsort()[::-1] + 1).tolist() if scores.max() > 0 else "no match")
print(round(2 / 3, 3), 2 / 4)`,
    v: bars("Cosine score of each document for the chosen query (1 = refund, 2 = payment, 3 = charge, 4 = delivery).", [
      ["D1: refund payment", "0.6053*step(1.5-q)+0.796*step(q-1.5)*step(2.5-q)"],
      ["D2: refund charge", "0.6053*step(1.5-q)+0.796*step(q-2.5)*step(3.5-q)"],
      ["D3: delivery", "step(q-3.5)"],
    ], {
      max: 1,
      params: [par("q", "query", 1, 4, 1, 1)],
      steps: [["Query \"refund\": D1 and D2 tie at 0.6053.", { q: 1 }], ["Query \"payment\": only D1 matches (0.796).", { q: 2 }], ["Query \"delivery\": only D3 — perfect score 1.", { q: 4 }]],
    }),
  },
  {
    t: "Information extraction and named-entity recognition",
    lv: 2,
    s: `Convert a sentence into structured fields: "Asha paid €20 for order AB123 on 12 September 2026." → person Asha (NER), amount 20 and currency EUR (pattern plus normalisation), order_id AB123 (an order-ID pattern or a domain-trained model), date 2026-09-12 (date recognition and normalisation). {{NER}} finds spans of people, organisations and places; {{relation extraction}} links them ("Asha paid €20 for AB123") — finding all entities does not reveal which amount belongs to which order. Measure quality under an exact span-and-type rule: reference 10 entities, extractor returns 8, 6 correct → precision 6/8 = 0.75, recall 6/10 = 0.60, F1 = 2·6/(8 + 10) = 0.667.`,
    r: `An order ID is a domain field, not a standard NER label. "Tomorrow" needs the message timestamp and time zone to become a date. Validate extracted values against records and keep uncertainty when a field is ambiguous.`,
    i: `Compute precision, recall and F1 for an extractor that returns 8 entities, 6 correct, against 10 reference entities.`,
    c: py`
import re

text = "Asha paid €20 for order AB123 on 12 September 2026."
order = re.search(r"\b[A-Z]{2}\d{3}\b", text).group()
amount = re.search(r"€(\d+)", text).group(1)
print({"order_id": order, "amount": int(amount), "currency": "EUR"})
tp, returned, reference = 6, 8, 10
print(tp / returned, tp / reference, round(2 * tp / (returned + reference), 3))`,
    v: cells("The pipeline from a sentence to checked fields.", table(["field", "value", "how it was found"], [["person", "Asha", "named-entity recognition"], ["amount / currency", "20 / EUR", "pattern + normalisation"], ["order_id", "AB123", "ID format or domain model"], ["date", "2026-09-12", "date recognition + normalisation"]]), [
      ["One sentence, four fields."],
      ["Find spans, assign entity types, link related fields, normalise values, validate against records.", [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 1]]],
      ["Quality: exact span-and-type matching gives precision 0.75, recall 0.60.", [[1, 2, 2], [2, 2, 2], [3, 2, 2], [4, 2, 2]]],
    ]),
  },
  {
    t: "Sentiment, context, meaning, topics and summaries",
    lv: 2,
    s: `Different outputs need different definitions of success. {{Context extraction}}: "it failed again" refers to the payment mentioned earlier — carry the conversation history, do not guess. {{Sentiment}}: negation, sarcasm and mixed feelings. {{Semantic analysis}}: "charged twice" and "duplicate payment" share meaning, not words. {{Topic extraction}}: repeated terms refund / charge / payment suggest a billing topic. {{Similarity detection}}: related topic versus true duplicate. {{Generation}} and {{summarisation}}: factual accuracy and tone. A summary must not invent a resolution: the faithful summary of "Payment failed. I tried again and was charged twice. Support is checking." is "duplicate charge after retrying a failed payment; investigation ongoing" — not "refund completed".`,
    r: `Sentiment and urgency are different targets: a polite "the entire checkout is down" can be critical, an angry message can be low-impact. Extractive summaries select existing sentences; abstractive ones rewrite and can add unsupported details.`,
    i: `Why is "Refund completed" an unfaithful summary of an ongoing investigation?`,
    v: compare("Purpose, example and what to check.", ["Ticket example", "What to check"], [
      ["Context extraction", "\"It failed again\" refers to the earlier payment", "carry the relevant conversation history"],
      ["Sentiment analysis", "\"The delivery was awful\" → negative", "negation, sarcasm, mixed sentiment, language coverage"],
      ["Semantic analysis", "\"charged twice\" ≈ \"duplicate payment\"", "meaning similarity, not shared words"],
      ["Topic extraction", "refund / charge / payment → billing", "coherence, useful human names"],
      ["Similarity detection", "find tickets about the same outage", "related topic vs true duplicate; false matches"],
      ["Text generation", "draft a reply from a verified policy", "factual accuracy, tone, human review"],
      ["Summarisation", "compress a long thread", "preserve facts, dates, negation, unresolved status"],
    ]),
  },
  {
    t: "Text classification: route a ticket to a known team",
    lv: 1,
    s: `Training examples teach the model the category names. The workflow: text + human labels → training split → fit the vectoriser AND classifier → validate settings → evaluate untouched test data → predict a new ticket. {{Multiclass}}: one team per ticket (Billing OR Delivery OR Account). {{Multilabel}}: a ticket can be BOTH Billing AND Delivery. {{Binary}}: urgent or not. These definitions decide the output layer, the labelling rules and the evaluation. Models: multinomial Naive Bayes (word frequencies per class), logistic regression (word weights add to a score), linear SVM, kNN, trees (evaluate them on sparse text rather than assume they win). Logistic example: z = −1 + 2·I("refund"); a message with "refund" has z = 1 and p = σ(1) ≈ 0.731.`,
    r: `A route is a prediction, not an action mandate: add an abstain / manual-review path for ambiguous or out-of-domain tickets.`,
    i: `Calculate the probability for z = −1 + 2 when the word "refund" is present.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for has_refund in (0, 1):
    z = -1 + 2 * has_refund
    print(has_refund, z, round(float(sigmoid(z)), 3))`,
    v: flow("From labelled messages to a routed ticket.", "row",
      ["Text + labels|human categories|i", "Training split|by customer / thread|w", "Vectoriser + model|fit on training data|g", "Validate|choose settings|g", "Test once|untouched data|g", "Predict|route a new ticket|b"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]], undefined,
      ["Keep threads together; hold out validation and test data.", "The vocabulary and IDF are learned from training text only.", "Use cross-validation to choose n-grams, smoothing, etc.", "Report the locked test score.", "Return a class, a model version and a review flag."]),
  },
  {
    t: "Naive Bayes for text: a complete hand calculation",
    lv: 2,
    s: `Training corpus: Billing "refund refund payment" and "refund payment"; Delivery "delivery late" and "delivery delivery late". Counts per class: Billing refund 3, payment 2; Delivery delivery 3, late 2; each class has 5 word occurrences; vocabulary |V| = 4. {{P(word | class) = (count + α) / (total words + α|V|)}} with α = 1: denominator 5 + 4 = 9, so Billing: refund 4/9, payment 3/9, delivery 1/9, late 1/9; Delivery: refund 1/9, payment 1/9, delivery 4/9, late 3/9. Score(class) = P(class) × Π P(word | class)^count; priors 0.5. For "refund payment": Billing 0.5 × 4/9 × 3/9 = 6/81, Delivery 0.5 × 1/9 × 1/9 = 0.5/81 → P(Billing) = 6/6.5 = 12/13 ≈ 0.9231. For long documents add log probabilities. Change the words below.`,
    r: `"Naive" = words are treated as conditionally independent given the class. The 92.31% is the model's posterior under its assumptions, not a guarantee.`,
    i: `Classify "refund payment" with the counts above.`,
    c: py`
import numpy as np

vocab = ["refund", "payment", "delivery", "late"]
counts = {"Billing": np.array([3, 2, 0, 0]), "Delivery": np.array([0, 0, 3, 2])}
alpha = 1
def posterior(words):
    scores = {}
    for c, cnt in counts.items():
        p = (cnt + alpha) / (cnt.sum() + alpha * len(vocab))
        scores[c] = 0.5 * float(np.prod([p[vocab.index(w)] for w in words]))
    total = sum(scores.values())
    return {c: round(s / total, 4) for c, s in scores.items()}

print(posterior(["refund", "payment"]))
print(posterior(["delivery", "late", "late"]))`,
    v: bars("Posterior probability for a message with the chosen word counts.", [
      ["P(Billing | words)", "0.5*(4/9)^r*(3/9)^p*(1/9)^d*(1/9)^l/(0.5*(4/9)^r*(3/9)^p*(1/9)^d*(1/9)^l+0.5*(1/9)^r*(1/9)^p*(4/9)^d*(3/9)^l)"],
      ["P(Delivery | words)", "0.5*(1/9)^r*(1/9)^p*(4/9)^d*(3/9)^l/(0.5*(4/9)^r*(3/9)^p*(1/9)^d*(1/9)^l+0.5*(1/9)^r*(1/9)^p*(4/9)^d*(3/9)^l)"],
    ], {
      percent: true,
      params: [par("r", "'refund' count", 0, 3, 1, 1), par("p", "'payment' count", 0, 3, 1, 1), par("d", "'delivery' count", 0, 3, 1, 0), par("l", "'late' count", 0, 3, 1, 0)],
      steps: [["\"refund payment\": 92.3% Billing.", { r: 1, p: 1, d: 0, l: 0 }], ["\"delivery late late\": firmly Delivery.", { r: 0, p: 0, d: 1, l: 2 }], ["A mixed message \"refund delivery\": the classes compete.", { r: 1, p: 0, d: 1, l: 0 }]],
    }),
  },
  {
    t: "Text clustering and topic models",
    lv: 2,
    s: `With no reliable labels: vectorise the six tickets, group nearby vectors, inspect representative texts, THEN name the groups. Cluster numbers 0, 1, 2 have no inherent meaning. Choose a representation (TF–IDF for word overlap, embeddings for meaning) and a grouping rule (k-means for a fixed number of centre-based groups, hierarchical for nested structure, density methods for noise). For vectors (1, 1) and (1, 0) the centre is (1, 0.5) and SSE = 0.5. The toy tickets form three intuitive word-sharing groups (refund / delivery / password) — not a promise that every algorithm finds them. {{Topic models}} (LDA, NMF) expose groups of related terms with a mixture of topics per document, a different output from one cluster per document.`,
    r: `Sparse high-dimensional distances are hard: consider feature selection or TruncatedSVD, then verify the groups still make sense. A 2D plot is only a view. Compare partitions with the adjusted Rand index, not raw cluster-ID accuracy.`,
    i: `How does a topic model differ from clustering?`,
    c: py`
tickets = ["refund payment", "refund charge", "delivery late", "parcel delivery", "password login", "reset password"]
sets = [set(t.split()) for t in tickets]
groups = []
for i, s in enumerate(sets):
    for g in groups:
        if any(s & sets[j] for j in g):
            g.append(i)
            break
    else:
        groups.append([i])
print([[tickets[i] for i in g] for g in groups])
print(0 ** 2 + 0.5 ** 2 + 0 ** 2 + (-0.5) ** 2)`,
    v: cells("Three groups discovered from shared words, named only afterwards.", [P("group A", ["T1 refund payment", "T2 refund charge"]), P("group B", ["T3 delivery late", "T4 parcel delivery"]), P("group C", ["T5 password login", "T6 reset password"])], [
      ["The algorithm receives vectors, not categories."],
      ["Group A shares \"refund\" — a human might call it Billing.", [[0, 0, 1]]],
      ["Group B shares \"delivery\"; group C shares \"password\".", [[1, 0, 1], [2, 0, 1]]],
    ]),
  },
  {
    t: "Embeddings and the connection to RAG",
    lv: 2,
    s: `Count vectors give "refund" and "reimbursement" different coordinates. A suitable {{embedding}} model places texts with related meaning near each other because of patterns learned in training; its coordinates are learned features, not labelled axes. Pipeline: message or chunk → embedding model → numeric vector → similarity search or clustering → inspect retrieved or grouped text. Illustration only: "refund request" → (1, 0) and "money back" → (0.8, 0.6): both length 1, cosine = 0.8 (hand-picked teaching vectors, not from a real model). {{Retrieval-augmented generation (RAG)}}: query → retrieve evidence → keep relevant passages → give passages and the question to a generator → answer with source references.`,
    r: `RAG supplies evidence but does not guarantee correctness; evaluate retrieval and answer grounding separately. Protect source permissions and never treat instructions inside retrieved documents as trusted commands.`,
    i: `What is RAG and why can it still produce a wrong answer?`,
    c: py`
import numpy as np

a, b = np.array([1.0, 0.0]), np.array([0.8, 0.6])
print(round(float(a @ b), 2), round(float(np.linalg.norm(b)), 2))`,
    v: flow("Retrieval first, then generation, with sources.", "row",
      ["Query|the user's question|i", "Retrieve|embed + similarity search|g", "Select|keep relevant passages|g", "Generate|answer from the passages|w", "Answer|with source references|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["The most similar chunks are found.", "Only relevant passages are kept, within permission limits.", "A generator writes an answer using the passages.", "Show the sources; a generator can still misuse a correct passage."]),
  },
  {
    t: "Text length, language and chunking",
    lv: 2,
    s: `The short English ticket is only the starting point. Very short text ("not working"): use preceding context or ask for details. Paragraphs: keep local phrases and negation. Long documents: chunk around headings or coherent passages and keep document IDs. Multilingual tickets: multilingual models or a translation workflow, evaluated per language. Few labels, many unlabelled tickets: active learning (people label the most informative examples) or carefully validated semi-supervised learning (pseudo-label errors can reinforce themselves). Chunking arithmetic: 1,000 tokens, chunk size 300, overlap 50 → stride 250; windows start at 0, 250, 500, 750 with lengths 300, 300, 300, 250; total processed 1,150 tokens because of the overlap.`,
    r: `Evaluate by language, issue type and text length: a good average can hide a weak Lithuanian or mixed-language subset. Characters and tokens are not interchangeable.`,
    i: `Compute the chunk start positions for 1,000 tokens, size 300, overlap 50.`,
    c: py`
n, size, overlap = 1000, 300, 50
stride = size - overlap
starts = list(range(0, n - overlap, stride))
lengths = [min(size, n - s) for s in starts]
print(stride, starts, lengths, sum(lengths))`,
    v: cells("Overlapping windows over a 1,000-token document.", [P("starts", ["0", "250", "500", "750"]), P("lengths", ["300", "300", "300", "250"])], [
      ["Stride = size − overlap = 250."],
      ["Four windows start at 0, 250, 500, 750.", [[0, 0, 3]]],
      ["The last window is shorter (250). Total processed tokens = 300 + 300 + 300 + 250 = 1,150.", [[1, 0, 3]]],
    ]),
  },
  {
    t: "Association: which words occur together?",
    lv: 2,
    s: `Among 100 tickets, 20 mention "refund", 30 mention "delay" and 15 mention both. {{Support}}(refund AND delay) = 15/100 = 0.15. {{Confidence}}(refund → delay) = 15/20 = 0.75. {{Lift}} = confidence / P(delay) = 0.75 / 0.30 = 2.5: the pair co-occurs 2.5 times as often as independence would suggest. Investigate representative messages, changes over time and confounders before deciding what caused the pattern.`,
    r: `Association is not causation. Templates, duplicates or one popular topic can create strong co-occurrence without a new operational problem.`,
    i: `Compute support, confidence and lift for the refund → delay rule.`,
    c: py`
n, refund, delay, both = 100, 20, 30, 15
support = both / n
confidence = both / refund
print(support, confidence, round(confidence / (delay / n), 2))`,
    v: bars("Support, confidence and lift (lift shown on a 0–4 scale as lift ÷ 4).", [["support", "b/100"], ["confidence", "b/r"], ["lift ÷ 4", "(b/r)/(d/100)/4"]], {
      max: 1,
      params: [par("r", "tickets mentioning refund", 5, 60, 1, 20), par("d", "tickets mentioning delay", 5, 60, 1, 30), par("b", "tickets mentioning both", 1, 20, 1, 15)],
      readout: ["support {b/100:2} · confidence {b/r:2} · lift {(b/r)/(d/100):2}"],
      steps: [["The example: 0.15, 0.75, lift 2.5.", { r: 20, d: 30, b: 15 }], ["Independent words would give lift 1 (b = 6).", { r: 20, d: 30, b: 6 }]],
    }),
  },
  {
    t: "A tiny text-classification project, from scratch",
    lv: 2,
    s: `Put the lessons together with the six-per-class toy corpus (Billing, Delivery, Account): build the vocabulary on TRAINING text only, count words per class, classify new messages with smoothed Naive Bayes in log space. This is a deliberately tiny demonstration, NOT an accuracy benchmark: the three test messages are too few and too similar to the training text. A production project needs a larger representative labelled set, realistic held-out threads or future tickets, language-specific checks, error analysis, model versioning and an explicit review policy.`,
    r: `For a thesis or portfolio start with a reproducible TF–IDF baseline and error analysis; add embeddings or generation only when they improve a measured task.`,
    i: `Which parts of this pipeline must be fitted on training data only?`,
    c: py`
import numpy as np
from collections import Counter

train_text = ["refund payment", "refund charge", "payment charged twice", "refund money", "card payment problem", "charge refund request",
              "delivery late", "parcel delayed", "delivery missing", "late parcel", "package delivery problem", "parcel not arrived",
              "password login", "reset password", "login failed", "account locked", "password reset request", "cannot login account"]
y = ["Billing"] * 6 + ["Delivery"] * 6 + ["Account"] * 6
vocab = sorted({w for t in train_text for w in t.split()})
counts = {c: Counter() for c in dict.fromkeys(y)}
for t, c in zip(train_text, y):
    counts[c].update(t.split())

def predict(text, alpha=1.0):
    scores = {}
    for c, cnt in counts.items():
        total = sum(cnt.values()) + alpha * len(vocab)
        scores[c] = np.log(1 / 3) + sum(np.log((cnt[w] + alpha) / total) for w in text.split() if w in vocab)
    return max(scores, key=scores.get)

for t in ["payment refund please", "delivery parcel late", "password login problem", "refund my payment"]:
    print(t, "->", predict(t))`,
    v: flow("Everything that learns from data sits before the arrow into 'predict'.", "row",
      ["Training text|18 messages, 3 classes|i", "Vocabulary|learned from training text|w", "Word counts per class|with smoothing α = 1|w", "predict(text)|log-probabilities|g", "Class|highest score wins|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["Unknown words are ignored at prediction time.", "These counts ARE the trained model.", "Scores add logs instead of multiplying tiny probabilities.", "Return the class — and, in production, a review flag."]),
  },
  {
    t: "From notebook to a full-stack feature",
    lv: 2,
    s: `A familiar React + Node.js application can call a Python text service. React: the user submits a ticket. Node API: authenticate and validate. Python service: vectoriser + model. Return a category, evidence, the model version and a review flag. Node saves the outcome and any human correction. Use the SAME saved preprocessing and model at inference time — never refit TF–IDF for each incoming ticket. Return probabilities only when the model supports them and calibration has been validated; an SVM decision score is not a probability. Review human corrections before using them for retraining and log metadata without copying raw sensitive text.`,
    r: `Monitor latency, changing inputs, reviewed corrections and class-specific error rates. Retrain only through a reviewed evaluation process.`,
    i: `Why must a deployed service reuse the TF–IDF vocabulary fitted at training time?`,
    v: layers("A request travels through the stack.", [
      "React|the user submits a ticket form; shows result + human override|i",
      "Node API|authentication, validation, rate limits|g",
      "Python service|saved vectoriser + model; returns class, version, review flag|g",
      "Database|stores the result, model version and human correction|w",
      "Queue + review|ambiguous cases go to a person; corrections feed a reviewed retraining|b",
    ], "request →"),
  },
];

void [L, plot, pt, seg];
