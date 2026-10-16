import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { LIB, rowflow } from "./lib.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- langchain-langgraph-rag`.
   The RAG components follow the LangChain retrieval documentation (document loaders, text
   splitters, embeddings, vector stores, retrievers; 2-step, agentic and hybrid RAG). */

const SPLIT = `
def split_text(text, chunk_size=200, chunk_overlap=40, separators=("\\n\\n", "\\n", " ", "")):
    """A small recursive splitter in the spirit of RecursiveCharacterTextSplitter."""
    def pieces(t, seps):
        if len(t) <= chunk_size or not seps:
            return [t]
        sep, rest = seps[0], seps[1:]
        parts = t.split(sep) if sep else list(t)
        out = []
        for p in parts:
            out += pieces(p, rest) if len(p) > chunk_size else [p]
        return out
    chunks, current = [], ""
    for p in pieces(text, list(separators)):
        if current and len(current) + 1 + len(p) > chunk_size:
            chunks.append(current)
            current = current[-chunk_overlap:] + " " + p if chunk_overlap else p
        else:
            current = (current + " " + p).strip() if current else p
    if current:
        chunks.append(current)
    return chunks`;

const KB = `
handbook = [
    Document("Refunds are issued within 14 days of a return request. Premium customers receive refunds within 7 days.", {"source": "refunds.md"}),
    Document("Standard shipping takes 3 to 5 business days. Express shipping takes 1 to 2 business days.", {"source": "shipping.md"}),
    Document("Support is available on weekdays from 9:00 to 17:00. Premium customers have a 24/7 chat line.", {"source": "support.md"}),
    Document("Orders above 50 EUR ship for free within the European Union.", {"source": "shipping.md"}),
]`;

export const rag: ConceptDef[] = [
  {
    t: "The ingestion pipeline: load, split, embed, store",
    lv: 1,
    s: `LangChain's retrieval documentation names five building blocks. {{Document loaders}} ingest data from files, web pages, databases and APIs and return standard {{Document}} objects (page_content plus metadata such as source). {{Text splitters}} break large documents into chunks that can be retrieved individually and fit the context window. {{Embedding models}} turn each chunk into a vector. {{Vector stores}} persist and search those vectors. {{Retrievers}} are the interface that returns documents for an unstructured query. Ingestion is the first four; at query time you embed the question, retrieve the nearest chunks and give them to the model. The pipeline runs once per document change, not once per question.`,
    r: `Keep the source and position of every chunk in metadata: you will need them for citations, updates and debugging.`,
    i: `Name the five building blocks of retrieval in order.`,
    c: py`${LIB}
${KB}
store = InMemoryVectorStore(HashEmbeddings())
ids = store.add_documents(handbook)
print(len(ids), "chunks stored;", sorted({d.metadata["source"] for d in handbook}))
print([d.page_content[:28] for d in store.similarity_search("how long do refunds take", k=2)])`,
    v: rowflow("RAG ingestion and query.", ["Document loader", "Text splitter", "Embedding model", "Vector store", "Retriever", "LLM answer"], [
      "Documents with metadata.",
      "Chunks that fit the context window.",
      "A vector per chunk.",
      "Persisted, searchable.",
      "The question's nearest chunks.",
      "Generated from the retrieved text.",
    ]),
  },
  {
    t: "Splitting text: chunk size and overlap",
    lv: 2,
    s: `{{RecursiveCharacterTextSplitter}} is "the recommended TextSplitter for generic text use cases": it tries to split on paragraph breaks first, then lines, then spaces, then characters, so chunks end at natural boundaries. Parameters: {{chunk_size}} and {{chunk_overlap}}. The LangChain RAG tutorial uses chunk_size=1000 and chunk_overlap=200, which turned its loaded pages into 782 chunks. A 10,000-character document with those settings gives 1 + ⌈(10,000 − 1,000)/800⌉ = 13 chunks. Sizes are measured in characters by default (token-based length functions exist). Too small and a chunk lacks context; too large and the relevant sentence is diluted and the context window is wasted. Tune on your own questions by measuring retrieval recall.`,
    r: `Prefer splitting along document structure (headings, sections) when you have it; characters are the fallback.`,
    i: `How many chunks does a 10,000-character document give with chunk_size 1000 and overlap 200?`,
    c: py`
import math
${SPLIT}
print(1 + math.ceil((10000 - 1000) / (1000 - 200)))
text = "Refunds are issued within 14 days. Premium customers receive refunds within 7 days.\n\nShipping takes 3 to 5 days. Express shipping takes 1 to 2 days. Orders above 50 EUR ship free."
chunks = split_text(text, chunk_size=80, chunk_overlap=20)
print(len(chunks))
for c in chunks:
    print(len(c), repr(c[:40]))`,
    v: bars("Chunks from a 10,000-character document (chunk_size 1000) for the chosen overlap.", [["chunks", "1-floor(-(10000-1000)/(1000-o))"]], {
      max: 30,
      params: [par("o", "chunk_overlap", 0, 500, 100, 200)],
      readout: ["overlap {o} → {1-floor(-(10000-1000)/(1000-o))} chunks"],
      steps: [["No overlap: 10 chunks.", { o: 0 }], ["Overlap 200: 13 chunks.", { o: 200 }]],
    }),
  },
  {
    t: "Two-step RAG: retrieve, then generate",
    lv: 1,
    s: `The simplest architecture is {{2-step RAG}}: retrieval always runs first, then one model call answers from the retrieved text. It has {{high control}}, {{low flexibility}} and {{fast, predictable latency}} — a known, capped number of LLM calls. In LangChain terms: question → retriever → prompt (context + question) → chat model → answer, a pipeline you can write with the | operator or as a small LangGraph with a retrieve node and a generate node. The prompt tells the model to answer only from the sources and to say when they do not contain the answer. Use it for FAQs, documentation search and any case where every question needs retrieval.`,
    r: `Return the retrieved chunks with the answer: users and evaluators need to see the evidence.`,
    i: `What are the control, flexibility and latency characteristics of 2-step RAG?`,
    c: py`${LIB}
${KB}
store = InMemoryVectorStore(HashEmbeddings())
store.add_documents(handbook)
retrieve = Runnable(lambda q: {"question": q, "docs": store.similarity_search(q, k=2)})
build_prompt = Runnable(lambda x: "Answer only from the sources.\n" + "\n".join(f"[{i + 1}] {d.page_content}" for i, d in enumerate(x["docs"])) + "\nQuestion: " + x["question"])
STOP = {"who", "is", "the", "how", "do", "does", "long", "a", "what", "are"}
def fake_llm_fn(prompt):
    sources, question = prompt.lower().split("question:")
    content = [w.strip("?.,") for w in question.split() if w.strip("?.,") not in STOP]
    grounded = any(w in sources for w in content)
    return "Refunds take 14 days (7 for premium) [1]." if grounded else "I could not find that in the sources."
fake_llm = Runnable(fake_llm_fn)
chain = retrieve | build_prompt | fake_llm
print(chain.invoke("How long do refunds take?"))
print(chain.invoke("Who is the CEO?"))`,
    v: rowflow("2-step RAG.", ["Question", "Retriever", "Prompt with sources", "Chat model", "Answer + citations"], [
      "The user's question.",
      "Always runs first.",
      "Context and question in one prompt.",
      "One generation call.",
      "Predictable cost and latency.",
    ]),
  },
  {
    t: "Agentic RAG: the model decides when to retrieve",
    lv: 2,
    s: `In {{agentic RAG}} retrieval is a {{tool}}: an agent decides whether to search, what query to use, whether the results suffice and whether to search again — useful for multi-part questions ("compare the refund rules for premium and standard customers"), follow-ups and chit-chat that needs no retrieval. The LangChain docs summarise the trade-off: 2-step RAG has high control, low flexibility and fast latency; agentic RAG has low control, high flexibility and variable latency; {{hybrid RAG}} sits in between. Costs: more model calls, less predictable latency, harder testing. Guard it with a step limit, a clear tool description and evaluation of whole trajectories.`,
    r: `Choose agentic RAG when questions vary a lot in how much retrieval they need; otherwise 2-step is cheaper and easier to test.`,
    i: `Compare the control, flexibility and latency of 2-step, agentic and hybrid RAG.`,
    c: py`${LIB}
${KB}
store = InMemoryVectorStore(HashEmbeddings())
store.add_documents(handbook)
calls = []
def search_handbook(query: str) -> str:
    """Search the company handbook. Use for questions about refunds, shipping or support."""
    calls.append(query)
    return " | ".join(d.page_content[:40] for d in store.similarity_search(query, k=1))

def scripted_agent(question):
    if "hello" in question.lower():
        return "Hello! How can I help?"
    out = [search_handbook(q.strip()) for q in question.split(" and ")]
    return " || ".join(out)

print(scripted_agent("hello"), calls)
print(scripted_agent("refund policy and express shipping time"), calls)`,
    v: compare("RAG architectures (from the LangChain documentation).", ["Control", "Flexibility", "Latency"], [
      ["2-step RAG", "high", "low", "fast, predictable"],
      ["Agentic RAG", "low", "high", "variable"],
      ["Hybrid RAG", "medium", "medium", "variable"],
    ]),
  },
  {
    t: "Hybrid RAG: rewrite, retrieve, validate",
    lv: 2,
    s: `{{Hybrid RAG}} adds steps around the basic retrieve-and-generate: {{query enhancement}} (rewrite a chatty question into a good search query, or split it into several), {{retrieval validation}} (are the chunks relevant and sufficient? if not, rewrite and retry or widen k) and {{answer validation}} (is the answer supported by the chunks? does it cite them?). Loops need a limit — two or three iterations. In LangGraph this is a small graph: rewrite → retrieve → grade → (generate | rewrite again) → check. The grading steps can be cheap: a similarity threshold, a small model, or rules. Result: better answers on hard questions at moderate extra cost and a latency between 2-step and fully agentic.`,
    r: `A retrieval grader that says "not enough evidence" lets the system abstain instead of inventing an answer.`,
    i: `Name the three kinds of extra steps in hybrid RAG and why the loop needs a limit.`,
    c: py`${LIB}
${KB}
store = InMemoryVectorStore(HashEmbeddings())
store.add_documents(handbook)

def rewrite(q, attempt):
    return ["refund", "refund return days"][min(attempt, 1)] if "money" in q else q

def grade(docs, q):
    return any("refund" in d.page_content.lower() for d in docs)

question = "how fast do I get my money back"
for attempt in range(3):
    query = rewrite(question, attempt)
    docs = store.similarity_search(query, k=2)
    ok = grade(docs, question)
    print(attempt, repr(query), "relevant" if ok else "not relevant")
    if ok:
        break`,
    v: rowflow("A hybrid RAG loop.", ["Question", "Rewrite query", "Retrieve", "Grade the chunks", "Generate", "Check the answer"], [
      "The user's wording.",
      "A better search query (or several).",
      "Top-k chunks.",
      "Relevant? If not, rewrite and retry (limit 2–3).",
      "Answer from the chunks.",
      "Supported and cited? Otherwise abstain or retry.",
    ]),
  },
  {
    t: "MMR: relevant but not redundant",
    lv: 2,
    s: `Plain top-k often returns near-duplicates (overlapping chunks, repeated pages), wasting context. {{Maximal marginal relevance (MMR)}} picks results one at a time by score = λ·sim(doc, query) − (1 − λ)·max sim(doc, already chosen): relevance minus redundancy. λ = 1 is plain similarity; lower λ favours diversity. In the example the first pick is the most relevant document; the second document is almost a copy of it (cosine 0.99), so MMR skips it in favour of a slightly less relevant but different one. Vector stores that support it expose an MMR search option; typical settings fetch a larger candidate pool (say 20) and keep k = 4 from it.`,
    r: `Use MMR when your corpus contains repeated or overlapping text; keep λ high (0.7–0.9) so relevance still dominates.`,
    i: `Explain the MMR score and what λ = 1 does.`,
    c: py`
import numpy as np

q = np.array([1.0, 0.0, 0.0])
docs = np.array([[0.95, 0.31, 0.0], [0.94, 0.30, 0.15], [0.80, -0.55, 0.24], [0.5, 0.2, 0.84]])
docs = docs / np.linalg.norm(docs, axis=1, keepdims=True)
sim = docs @ q
def mmr(lam, k=3):
    chosen = [int(np.argmax(sim))]
    while len(chosen) < k:
        scores = {i: lam * sim[i] - (1 - lam) * max(docs[i] @ docs[j] for j in chosen) for i in range(len(docs)) if i not in chosen}
        chosen.append(max(scores, key=scores.get))
    return chosen
print(sim.round(3).tolist(), round(float(docs[0] @ docs[1]), 3))
print(mmr(1.0), mmr(0.5))`,
    v: compare("Top-k versus MMR.", ["Top-k similarity", "MMR (λ = 0.5)"], [
      ["Selects", "the k most similar", "similar and different from earlier picks"],
      ["Near-duplicates", "all returned", "skipped"],
      ["Context use", "can be wasteful", "covers more ground"],
      ["Cost", "one sort", "a few extra similarity computations"],
    ]),
  },
  {
    t: "Evaluating and debugging a RAG system",
    lv: 2,
    s: `Measure the two halves separately. {{Retrieval}}: for questions with known relevant chunks compute recall@k (is a relevant chunk in the top k?) and MRR (1/rank of the first relevant one). {{Generation}}: faithfulness (is every claim supported by the retrieved text), relevance (does it answer the question) and correctness against reference answers; include unanswerable questions, where the right answer is "not in the sources". Debug by reading failures end to end: print the question, the rewritten query, the retrieved chunks with scores and the final prompt. Typical fixes: better chunking, metadata filters, hybrid keyword + vector search, a reranker, fewer but better chunks, a stronger instruction to abstain. Tracing tools (for example LangSmith) record these steps for you.`,
    r: `Keep a regression set of past failures and rerun it on every change of splitter, embedding model, index or prompt.`,
    i: `Compute recall@2 and MRR for the ranked results in the example.`,
    c: py`
cases = [
    {"relevant": {"c1"}, "retrieved": ["c1", "c7", "c9"]},
    {"relevant": {"c4"}, "retrieved": ["c2", "c4", "c8"]},
    {"relevant": {"c5"}, "retrieved": ["c3", "c6", "c9"]},
]
k = 2
recall = sum(bool(c["relevant"] & set(c["retrieved"][:k])) for c in cases) / len(cases)
def rr(c):
    for i, r in enumerate(c["retrieved"], 1):
        if r in c["relevant"]:
            return 1 / i
    return 0.0
print(round(recall, 3), round(sum(rr(c) for c in cases) / len(cases), 3))`,
    v: cells("Three evaluation questions and where the relevant chunk was ranked.", table(["question", "relevant chunk rank", "in top 2?", "reciprocal rank"], [["Q1", "1", "yes", "1.00"], ["Q2", "2", "yes", "0.50"], ["Q3", "not retrieved", "no", "0.00"]]), [
      ["recall@2 counts the questions whose relevant chunk is in the top 2."],
      ["Q1 and Q2 hit: recall@2 = 2/3 = 0.667.", [[1, 2, 2], [2, 2, 2]]],
      ["MRR = (1 + 0.5 + 0)/3 = 0.5.", [[1, 3, 3], [2, 3, 3], [3, 3, 3]]],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow, LIB];
