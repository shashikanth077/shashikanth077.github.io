import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { LIB, rowflow } from "./lib.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- langchain-langgraph-rag`.
   pgvector facts (operators, HNSW/IVFFlat syntax and defaults) were checked against the pgvector
   README on 2026-10-16. */

const ANN = `
import numpy as np

rng = np.random.default_rng(0)
N, d, n_clusters = 20000, 32, 40
centers = rng.normal(size=(n_clusters, d)) * 3
X = centers[rng.integers(0, n_clusters, N)] + rng.normal(size=(N, d))
X /= np.linalg.norm(X, axis=1, keepdims=True)
Q = X[rng.choice(N, 100, replace=False)] + 0.02 * rng.normal(size=(100, d))
Q /= np.linalg.norm(Q, axis=1, keepdims=True)
truth = np.argsort(-(Q @ X.T), axis=1)[:, :10]

nlist = 100
cent = X[rng.choice(N, nlist, replace=False)].copy()
for _ in range(8):
    assign = np.argmax(X @ cent.T, axis=1)
    for c in range(nlist):
        members = X[assign == c]
        if len(members):
            m = members.mean(axis=0)
            cent[c] = m / np.linalg.norm(m)
assign = np.argmax(X @ cent.T, axis=1)

def ivf_search(q, nprobe, k=10):
    cells_ = np.argsort(-(cent @ q))[:nprobe]
    idx = np.where(np.isin(assign, cells_))[0]
    top = idx[np.argsort(-(X[idx] @ q))[:k]]
    return top, len(idx)`;

export const vec: ConceptDef[] = [
  {
    t: "Embeddings and distance metrics",
    lv: 1,
    s: `A vector database stores embeddings — lists of numbers produced by an embedding model — and finds the ones nearest to a query vector. "Nearest" needs a metric. {{Cosine similarity}} compares directions: cos = a·b/(‖a‖‖b‖). {{Euclidean (L2) distance}} ‖a − b‖. {{Inner (dot) product}} a·b. For vectors normalised to length 1 they are interchangeable: ‖a − b‖² = 2 − 2·cos(a, b), and the dot product equals the cosine, so rankings agree. Use the metric the embedding model was trained for (most text models: cosine or dot product on normalised vectors) and use the same model for documents and queries — vectors from different models live in different spaces and cannot be compared.`,
    r: `Normalise once at write time and use the dot product: it is the fastest operation and every index supports it.`,
    i: `Show that for unit vectors the L2 distance squared equals 2 − 2·cosine.`,
    c: py`
import numpy as np

a, b = np.array([3.0, 4.0]), np.array([4.0, 3.0])
a1, b1 = a / np.linalg.norm(a), b / np.linalg.norm(b)
cos = float(a1 @ b1)
print(round(cos, 4), round(float(np.sum((a1 - b1) ** 2)), 4), round(2 - 2 * cos, 4))
print(round(float(a @ b), 1), round(float(np.linalg.norm(a - b)), 3))`,
    v: compare("Distance metrics.", ["Formula", "Note"], [
      ["Cosine similarity", "a·b / (‖a‖‖b‖)", "direction only; most text embeddings"],
      ["Euclidean (L2)", "‖a − b‖", "same ranking as cosine for unit vectors"],
      ["Inner product", "a·b", "same as cosine for unit vectors; fastest"],
    ]),
  },
  {
    t: "Exact search: brute force and its cost",
    lv: 1,
    s: `The simplest vector search compares the query with every stored vector — {{exact (flat) k-nearest-neighbours}}. It is perfectly accurate and needs no index; its cost is N × d multiply-adds per query. For N = 10,000 and d = 768 that is 7.7 million operations — milliseconds. For N = 10 million it is 7.7 billion — far too slow for interactive use unless you have GPUs or accept latency. Memory is also N × d × 4 bytes in 32-bit floats: 1 million vectors of 1,536 dimensions take 6.1 GB. Exact search remains the right choice up to roughly a few hundred thousand vectors, and as the ground truth against which approximate indexes are measured.`,
    r: `Measure before building an index: at small scale a flat scan on a decent CPU is simpler and exactly right.`,
    i: `How many multiply-adds and how much memory does a flat search over 1 million 1,536-dimensional vectors need?`,
    c: py`
N, d = 1_000_000, 1536
print(f"{N * d:,} multiply-adds per query")
print(round(N * d * 4 / 1e9, 2), "GB in float32;", round(N * d * 2 / 1e9, 2), "GB in float16")
import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(10000, 64)).astype("float32")
q = X[7]
print(int(np.argmax(X @ q)), X.nbytes / 1e6, "MB")`,
    v: plot("Multiply-adds per query of a flat search against the number of vectors (d = 768).", {
      x: [0, 10000000], y: [0, 8000000000], labels: ["vectors N", "operations"],
      params: [par("d", "dimensions d", 128, 3072, 128, 768)],
      readout: ["N = 1,000,000: {1000000*d} operations"],
      steps: [["d = 768: 0.77 billion at a million vectors.", { d: 768 }]],
    }, [curve("x*d", { c: "accent" })]),
  },
  {
    t: "Approximate nearest neighbours: recall versus speed",
    lv: 2,
    s: `{{ANN}} indexes trade a little accuracy for a lot of speed. They are judged by {{recall@k}} — what fraction of the true k nearest neighbours the index returns — against the work done (vectors scanned, latency). Two families dominate. {{Partition-based}} (IVF): cluster the vectors, search only the nearest clusters. {{Graph-based}} (HNSW): walk a layered proximity graph towards the query. Both expose a knob that moves along the curve: nprobe or ef_search. Higher means better recall and more time. Pick the setting from your own data: measure recall against an exact search on a sample of real queries, then choose the cheapest setting meeting your target (for example recall ≥ 0.95).`,
    r: `Report recall together with latency; either number alone is meaningless.`,
    i: `Define recall@k for an approximate index and say how you would measure it.`,
    c: py`
import numpy as np

truth = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
returned = {1, 2, 3, 4, 5, 6, 7, 8, 11, 12}
print(len(truth & returned) / len(truth))
approx_scanned, exact_scanned = 2000, 100000
print(exact_scanned / approx_scanned, "x fewer vectors compared")`,
    v: compare("Index families.", ["Idea", "Knob"], [
      ["Flat (exact)", "compare with everything", "none: recall 1.0"],
      ["IVF", "cluster, search the closest clusters", "nprobe"],
      ["HNSW", "layered graph walk", "ef_search"],
      ["Quantised (PQ, scalar)", "compress vectors to save memory", "bits per vector"],
    ]),
  },
  {
    t: "IVF: search only the nearest clusters",
    lv: 2,
    s: `{{IVF}} (inverted file) splits the vectors into {{nlist}} clusters with k-means; every vector is stored in the list of its nearest centroid. A query finds its closest {{nprobe}} centroids and scans only those lists. On 20,000 vectors in 100 lists the experiment below gives: nprobe = 1 scans 1.5% of the data with recall@10 = 0.74; nprobe = 2 scans 2.4% with 0.93; nprobe = 4 scans 4.3% with 0.996; nprobe = 8 reaches 1.0 at 8.4%. The neighbours of a point often sit in a neighbouring list, which is why probing more than one helps. pgvector's advice for IVFFlat: lists = rows / 1000 up to a million rows (sqrt(rows) above) and probes ≈ sqrt(lists); build the index after the table has data.`,
    r: `Rebuild or retrain IVF when the data distribution drifts: stale centroids hurt recall.`,
    i: `What do nlist and nprobe control, and what happens to recall and cost when nprobe grows?`,
    c: py`${ANN}
for nprobe in (1, 2, 4, 8):
    rec, scanned = [], []
    for i in range(len(Q)):
        top, n = ivf_search(Q[i], nprobe)
        rec.append(len(set(top) & set(truth[i])) / 10)
        scanned.append(n / N)
    print(nprobe, round(float(np.mean(rec)), 3), round(float(np.mean(scanned)), 3))`,
    v: bars("recall@10 of IVF as nprobe grows (100 lists, 20,000 vectors).", [["nprobe = 1", "0.744"], ["nprobe = 2", "0.928"], ["nprobe = 4", "0.996"], ["nprobe = 8", "1.0"]], {
      max: 1.05,
    }),
  },
  {
    t: "HNSW: a layered graph for fast navigation",
    lv: 2,
    s: `{{HNSW}} (hierarchical navigable small world) links each vector to a few near neighbours and stacks sparser and sparser graphs above. A query enters at the top layer, hops greedily to the node closest to the query, drops a layer, and repeats; at the bottom layer it explores more widely and keeps a candidate list of size {{ef_search}}. Each vector is assigned a top layer at random with probability about m⁻ˡ for layer l, so for m = 16 and one million vectors the layers hold roughly 1,000,000 → 62,500 → 3,900 → 244 → 15 nodes — long-range "highways" on top, local detail below. Build parameters: {{m}} (links per node, default 16 in pgvector) and {{ef_construction}} (default 64); query parameter hnsw.ef_search (default 40). Higher values give better recall, slower builds and queries, and more memory.`,
    r: `HNSW gives excellent recall at low latency but uses more memory than IVF and is slower to build; inserts are cheap, deletes are awkward.`,
    i: `Why does HNSW have layers, and which parameters trade recall for speed?`,
    c: py`
import numpy as np

m, N = 16, 1_000_000
rng = np.random.default_rng(0)
levels = np.floor(-np.log(rng.random(N)) / np.log(m)).astype(int)
print([int((levels >= l).sum()) for l in range(5)])
print([round(N / m ** l) for l in range(5)])`,
    v: bars("Nodes per layer for m = 16 and one million vectors (expected).", [["layer 0", "1000000/1000"], ["layer 1", "62500/1000"], ["layer 2", "3906/1000"], ["layer 3", "244/1000"], ["layer 4", "15/1000"]], {
      max: 1050,
    }),
  },
  {
    t: "Compression: quantisation and memory planning",
    lv: 2,
    s: `Memory, not CPU, often limits a vector database. Raw storage is N × d × 4 bytes (float32): 1M × 1,536 → 6.1 GB; 1M × 768 → 3.1 GB. Halving precision (float16) halves it. {{Scalar quantisation}} stores each number in 8 bits (4× smaller). {{Product quantisation (PQ)}} splits a vector into sub-vectors and replaces each by the id of its nearest centroid: with 64 bytes per vector, 1M vectors need only 64 MB — a 96× reduction from 1,536 float32s — at the cost of some recall, often recovered by re-ranking the top candidates with the original vectors. Graph indexes add links: roughly 2m × 4 bytes ≈ 128 bytes per vector for m = 16. Plan capacity from these numbers before choosing hardware.`,
    r: `Quantise only after measuring the recall loss on your own queries; re-ranking with full vectors usually restores most of it.`,
    i: `How much memory do 1 million 1,536-dimensional vectors need in float32 and with 64-byte product quantisation?`,
    c: py`
N, d = 1_000_000, 1536
f32 = N * d * 4
print(round(f32 / 1e9, 2), "GB float32;", round(f32 / 2 / 1e9, 2), "GB float16;", round(f32 / 4 / 1e9, 2), "GB int8")
pq = N * 64
print(round(pq / 1e6), "MB with 64-byte PQ;", round(f32 / pq), "x smaller")
print(N * 2 * 16 * 4 / 1e6, "MB of HNSW links (m = 16)")`,
    v: bars("Memory of 1M × 1,536 vectors (GB).", [["float32", "6.144"], ["float16", "3.072"], ["int8", "1.536"], ["PQ 64 bytes", "0.064"]], {
      max: 6.5,
    }),
  },
  {
    t: "Metadata filtering and its pitfalls",
    lv: 2,
    s: `Real queries combine similarity with conditions: "documents similar to this question, but only for tenant 7, language en, published after 2024". Stores accept a {{filter}} (LangChain: filter={"source": "tweets"} on similarity_search) — but support varies between implementations. Two strategies: {{pre-filtering}} restricts the candidates first (exact, but can be slow if the filter is not indexed) and {{post-filtering}} searches first and removes non-matching results afterwards, which can return fewer than k rows when the filter is selective — pgvector documents this for approximate indexes and offers iterative index scans (hnsw.iterative_scan, ivfflat.iterative_scan, version 0.8.0 onwards). Enforce access control inside the search: filtering after retrieval risks leaking which documents exist.`,
    r: `Index the metadata columns you filter on, and test with your most selective filters: they expose recall problems.`,
    i: `Why can post-filtering return fewer than k results?`,
    c: py`${LIB}
emb = HashEmbeddings()
store = InMemoryVectorStore(emb)
store.add_documents([
    Document("refund policy for premium customers", {"tenant": "a"}),
    Document("refund policy for standard customers", {"tenant": "b"}),
    Document("shipping times for premium orders", {"tenant": "a"}),
    Document("refund request form", {"tenant": "b"}),
])
top = store.similarity_search("refund policy", k=2)
print([d.metadata["tenant"] for d in top])
post = [d for d in store.similarity_search("refund policy", k=2) if d.metadata["tenant"] == "a"]
pre = store.similarity_search("refund policy", k=2, filter={"tenant": "a"})
print(len(post), len(pre))`,
    v: compare("Pre- versus post-filtering.", ["Pre-filter", "Post-filter"], [
      ["Order", "filter, then search", "search, then filter"],
      ["Results", "exactly k (if enough match)", "may be fewer than k"],
      ["Cost", "needs an index on the filter", "cheap, but wasteful when selective"],
      ["Access control", "safe", "risky if done after retrieval"],
    ]),
  },
  {
    t: "pgvector: vectors inside PostgreSQL",
    lv: 2,
    s: `{{pgvector}} adds a vector(n) column type and similarity operators to PostgreSQL: {{<->}} L2 distance, {{<=>}} cosine distance, {{<#>}} negative inner product (multiply by −1), plus L1, Hamming and Jaccard variants. A vector(n) costs 4n + 8 bytes; up to 16,000 dimensions can be stored and up to 2,000 indexed (halfvec up to 4,000). Indexes: CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64); and USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100). Query settings: SET hnsw.ef_search = 100 (default 40); SET ivfflat.probes = 10 (default 1). Benefits: one database for rows, filters, joins, transactions and vectors; backups and access control you already have. LangChain wraps it as PGVector / PGVectorStore.`,
    r: `For up to a few million vectors a well-tuned PostgreSQL with pgvector is often all you need.`,
    i: `Which operator gives cosine distance and how do you create an HNSW index with it?`,
    c: py`
sql = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (id bigserial PRIMARY KEY, tenant text, content text, embedding vector(1536));
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
SET hnsw.ef_search = 100;
SELECT content FROM chunks WHERE tenant = 'a' ORDER BY embedding <=> $1 LIMIT 5;
"""
print(sql.strip().splitlines()[2])
print(1536 * 4 + 8, "bytes per vector(1536)")`,
    v: compare("pgvector operators.", ["Operator", "Index operator class"], [
      ["L2 distance", "<->", "vector_l2_ops"],
      ["Negative inner product", "<#>", "vector_ip_ops"],
      ["Cosine distance", "<=>", "vector_cosine_ops"],
      ["L1 distance", "<+>", "vector_l1_ops"],
    ]),
  },
  {
    t: "Choosing a vector database",
    lv: 1,
    s: `LangChain ships integrations for many stores — InMemoryVectorStore, Chroma, FAISS, PGVector, Pinecone, Qdrant, Weaviate, Milvus, Elasticsearch, Redis, MongoDB Atlas and others — behind the same VectorStore interface (add_documents, delete, similarity_search, a filter argument), but their capabilities differ (delete by id, filtering, search with scores, async, multi-tenancy). Decide by: scale (thousands vs hundreds of millions), where your data already lives (PostgreSQL, MongoDB, Elasticsearch), filtering and multi-tenancy needs, hybrid keyword + vector search, operations (managed service versus self-hosted), cost, and latency. Prototype with an in-memory store or Chroma, move to your production store through the interface, and test recall and filters there.`,
    r: `The interface hides syntax, not behaviour: re-run your retrieval evaluation after every store change.`,
    i: `List four criteria for choosing a vector store.`,
    c: py`
options = {
    "prototype / tests": "InMemoryVectorStore, Chroma",
    "already on PostgreSQL": "PGVector / pgvector",
    "very large, managed": "a managed service (e.g. Pinecone) or a distributed store (Milvus, Qdrant)",
    "keyword + vector in one search": "Elasticsearch or a store with hybrid search",
    "local, library-style ANN": "FAISS",
}
for need, choice in options.items():
    print(f"{need:34s} -> {choice}")`,
    v: compare("Where to start.", ["Fit"], [
      ["InMemoryVectorStore / Chroma", "prototypes, tests, small apps"],
      ["pgvector", "you already run PostgreSQL; up to millions of vectors"],
      ["FAISS", "in-process ANN library"],
      ["Qdrant, Weaviate, Milvus, Pinecone", "dedicated or managed vector databases at larger scale"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow, LIB];
