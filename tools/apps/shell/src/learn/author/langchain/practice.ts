import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* langchain */
  ["lc", 1, "How are LangChain, LangGraph and the integrations related?", "LangChain provides create_agent, init_chat_model, retrievers and middleware; its agents run on LangGraph (state, persistence, interrupts); integrations wrap providers, embedding models and vector stores behind common interfaces."],
  ["lc", 1, "What is a Runnable and what does the | operator do?", "An object with invoke/batch/stream; | chains runnables so each output feeds the next; a dict inside a pipe is a parallel branch receiving the same input."],
  ["lc", 1, "Where does a tool's schema come from?", "The function's name, docstring and type-hinted parameters."],
  ["lc", 2, "What does create_agent do and what does its result contain?", "It runs the model–tools loop until the model answers without tool calls; the result's messages list holds the whole trajectory, the last message is the answer."],
  ["lc", 2, "Give three uses of agent middleware.", "Summarising history, human approval for sensitive tools, redacting data, call limits, retries or model switching."],
  ["lc", 1, "Why separate prompt templates from data, and why validate structured output?", "Templates are reusable and testable; models can still return wrong values that fit the schema."],
  ["lc", 1, "Give two reasons to use LangChain and two to avoid it.", "Use for provider/store portability and ready-made pieces; avoid for a single call or when the abstraction hides provider features you need (such as prompt caching)."],
  /* vector databases */
  ["vec", 1, "Show that for unit vectors ‖a − b‖² = 2 − 2·cos(a, b).", "‖a − b‖² = ‖a‖² + ‖b‖² − 2a·b = 2 − 2cos for unit vectors, so rankings by L2, cosine and dot product agree."],
  ["vec", 1, "Cost of a flat search over 1 million 1,536-dimensional vectors?", "N × d = 1.5 billion multiply-adds per query and 6.1 GB of float32 memory."],
  ["vec", 2, "Define recall@k for an ANN index.", "The fraction of the true k nearest neighbours (from an exact search) that the index returns."],
  ["vec", 2, "How does IVF work and what do nlist and nprobe control?", "k-means into nlist lists; a query scans only the nprobe nearest lists: higher nprobe raises recall and cost."],
  ["vec", 2, "How does HNSW work and which parameters trade recall for speed?", "A layered proximity graph searched greedily from the top; m and ef_construction at build, hnsw.ef_search at query: higher means better recall, slower and more memory."],
  ["vec", 2, "Memory of 1M × 1,536 vectors in float32 and with 64-byte PQ?", "6.1 GB versus 64 MB."],
  ["vec", 2, "Why can post-filtering return fewer than k rows?", "The index returns k candidates and the filter then removes non-matching ones; pre-filtering or iterative index scans avoid it."],
  ["vec", 2, "Which pgvector operator is cosine distance and how do you index with it?", "<=>; CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops) (ivfflat is the alternative)."],
  ["vec", 2, "pgvector guidance for IVFFlat lists and probes?", "lists ≈ rows/1000 up to 1M rows (sqrt(rows) above); probes ≈ sqrt(lists); build after loading data."],
  ["vec", 1, "Criteria for choosing a vector store?", "Scale, existing infrastructure (e.g. PostgreSQL), filtering and multi-tenancy, hybrid search, managed versus self-hosted, cost and latency."],
  /* RAG */
  ["rag", 1, "Name the five building blocks of retrieval.", "Document loaders, text splitters, embedding models, vector stores, retrievers."],
  ["rag", 2, "Chunks from a 10,000-character document with chunk_size 1000 and overlap 200?", "1 + ⌈9000/800⌉ = 13."],
  ["rag", 1, "Compare 2-step, agentic and hybrid RAG.", "2-step: high control, low flexibility, fast; agentic: low control, high flexibility, variable latency; hybrid: medium on both, adds query rewriting and validation."],
  ["rag", 2, "What extra steps does hybrid RAG add?", "Query enhancement, retrieval validation and answer validation, with a limit on loop iterations."],
  ["rag", 2, "Explain MMR and the role of λ.", "score = λ·sim(doc, query) − (1 − λ)·max sim(doc, chosen); λ = 1 is plain similarity, lower λ favours diversity."],
  ["rag", 2, "recall@2 and MRR for relevant ranks 1, 2 and not-retrieved?", "recall@2 = 2/3; MRR = (1 + 0.5 + 0)/3 = 0.5."],
  ["rag", 1, "Why return the retrieved chunks with the answer?", "Users and evaluators need to see the evidence; also enables citations and debugging."],
  /* LangGraph */
  ["lg", 1, "What three benefits come from running an agent as a LangGraph graph?", "Durable execution, human-in-the-loop and memory (short- and long-term)."],
  ["lg", 1, "Difference between a state key with and without a reducer?", "Without: the update replaces the value. With (e.g. operator.add, add_messages): updates are combined, which makes parallel writes safe."],
  ["lg", 1, "What are super-steps?", "Discrete execution rounds: all active nodes run against the same snapshot, updates are merged, edges choose the next active nodes."],
  ["lg", 1, "What does a conditional edge's routing function return?", "The name of the next node (or several nodes, or END), computed from the state."],
  ["lg", 2, "Name the nodes and routing function of the basic tool-calling agent graph.", "llm_call, tool_node and should_continue (to tool_node if tool_calls else END), plus edge tool_node → llm_call."],
  ["lg", 2, "Where is recursion_limit set and what happens when exceeded?", "A top-level config key (not under configurable); exceeding it raises GraphRecursionError (default 1000 since version 1.0.6)."],
  ["lg", 2, "What does a routing function return to start a variable number of workers?", "A list of Send(node, state) objects, one per sub-task; outputs are merged by a reducer and then synthesised."],
  ["lg", 2, "What identifies a conversation to a checkpointer and which savers exist?", "thread_id in config['configurable']; InMemorySaver, SqliteSaver, PostgresSaver / AsyncPostgresSaver."],
  ["lg", 2, "How do interrupt() and Command(resume=...) work together?", "interrupt(value) pauses and returns the payload; invoking again with Command(resume=answer) on the same thread makes interrupt() return the answer."],
  ["lg", 2, "Why must code before interrupt() be idempotent?", "On resume the runtime restarts the whole node from its beginning, so earlier code runs again."],
  ["lg", 2, "Checkpointer versus store?", "Checkpointer: graph state snapshots scoped to a thread; store: application key–value data shared across threads (long-term memory)."],
  ["lg", 2, "Name the standard workflow patterns.", "Prompt chaining, parallelization, routing, orchestrator–worker, evaluator–optimizer, and agents."],
  ["lg", 2, "How does a supervisor hand work to a specialist?", "It returns Command(goto='specialist', update={...}); the specialist reports back to the supervisor."],
  /* production */
  ["prod", 2, "How do you test a graph without a real model?", "Unit-test nodes, routing functions and reducers; use a scripted fake chat model; test interrupts by invoke, check __interrupt__, resume."],
  ["prod", 1, "What should a trace of a RAG run show?", "Question, rewritten query, retrieved chunks with scores, the exact prompt, the output, tokens, cost and latency."],
  ["prod", 2, "Why can a changed state schema break resumed runs?", "Old checkpoints were written with the old schema; plan migrations or finish old runs first."],
  ["prod", 1, "Raw SDK, create_agent or LangGraph: how do you choose?", "Single call or chain: SDK/LCEL; standard tool loop: create_agent with middleware; custom flow, approvals, long-running work: LangGraph with a durable checkpointer."],
];

export const drills: DrillDef[] = [
  {
    t: "Unit vectors: L2 versus cosine",
    q: "What does this print?",
    code: py`
import numpy as np
a, b = np.array([3.0, 4.0]), np.array([4.0, 3.0])
a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
print(round(float(a @ b), 2), round(float(np.sum((a - b) ** 2)), 2))`,
    opts: [["0.96 0.08", true, "cos = 0.96 and ‖a − b‖² = 2 − 2·0.96."], ["0.96 0.96", false, "The squared distance is 2 − 2cos."], ["0.08 0.96", false, "The cosine is the larger number here."]],
    path: ["a·b = 24/25 = 0.96.", "‖a − b‖² = 2 − 2 × 0.96 = 0.08."],
    why: "For unit vectors the metrics rank identically.",
    watch: "Normalise before using dot product as cosine.",
    remember: "‖a − b‖² = 2 − 2cos.",
  },
  {
    t: "Flat search cost",
    q: "What does this print?",
    code: py`
N, d = 1_000_000, 768
print(N * d, round(N * d * 4 / 1e9, 2))`,
    opts: [["768000000 3.07", true, "Multiply-adds per query and float32 gigabytes."], ["1000768 3.07", false, "Cost scales with N × d, not N + d."], ["768000000 1.54", false, "float32 uses 4 bytes per number."]],
    path: ["N × d = 768,000,000.", "× 4 bytes = 3.07 GB."],
    why: "A flat scan touches every number of every vector.",
    watch: "Index before this becomes too slow.",
    remember: "cost = N·d, memory = 4·N·d.",
  },
  {
    t: "Product quantisation memory",
    q: "What does this print?",
    code: py`
N, d = 1_000_000, 1536
print(round(N * d * 4 / 1e9, 3), N * 64 / 1e6, round(d * 4 / 64))`,
    opts: [["6.144 64.0 96", true, "96× smaller with 64-byte codes."], ["6.144 64.0 24", false, "1,536 floats = 6,144 bytes; ÷ 64 = 96."], ["1.536 64.0 96", false, "float32 is 4 bytes per dimension."]],
    path: ["float32: 6,144 bytes per vector → 6.144 GB.", "PQ: 64 bytes → 64 MB.", "Ratio 96."],
    why: "PQ replaces sub-vectors by centroid ids.",
    watch: "Re-rank with full vectors to recover recall.",
    remember: "bytes = codes per vector.",
  },
  {
    t: "Chunk count",
    q: "What does this print?",
    code: py`
import math
print(1 + math.ceil((10000 - 1000) / (1000 - 200)))`,
    opts: [["13", true, "Stride 800 over the remaining 9,000 characters."], ["10", false, "That ignores the overlap."], ["12", false, "Remember the first chunk."]],
    path: ["stride = 1000 − 200 = 800.", "(10000 − 1000)/800 = 11.25 → 12.", "+ 1 = 13."],
    why: "Overlap shrinks the stride.",
    watch: "The last chunk may be short.",
    remember: "1 + ⌈(L − size)/(size − overlap)⌉.",
  },
  {
    t: "pgvector index parameters",
    q: "What does this print?",
    code: py`
rows = 1_000_000
lists = rows // 1000
print(lists, round(lists ** 0.5), 4 * 1536 + 8)`,
    opts: [["1000 32 6152", true, "lists = rows/1000, probes ≈ √lists, vector(1536) bytes."], ["1000 1000 1536", false, "probes ≈ √lists and a vector costs 4n + 8 bytes."], ["100 32 6152", false, "rows/1000 = 1000."]],
    path: ["lists = 1,000,000/1,000 = 1,000.", "probes ≈ √1000 ≈ 32.", "bytes = 4·1536 + 8 = 6,152."],
    why: "pgvector's rule of thumb for IVFFlat.",
    watch: "Build the index after loading the data.",
    remember: "lists = rows/1000, probes = √lists.",
  },
  {
    t: "HNSW layer sizes",
    q: "What does this print?",
    code: py`
m, N = 16, 1_000_000
print([round(N / m ** l) for l in range(4)])`,
    opts: [["[1000000, 62500, 3906, 244]", true, "Each layer holds about 1/m of the layer below."], ["[1000000, 16, 256, 4096]", false, "Layers get sparser as you go up."], ["[1000000, 500000, 250000, 125000]", false, "The decay is by a factor m = 16, not 2."]],
    path: ["N/16⁰ = 1,000,000.", "N/16¹ = 62,500.", "N/16² = 3,906; N/16³ = 244."],
    why: "Sparse upper layers act as long-range shortcuts.",
    watch: "Higher m means more links and more memory.",
    remember: "layer l ≈ N / mˡ.",
  },
  {
    t: "recall@k",
    q: "What does this print?",
    code: py`
truth = set(range(1, 11))
returned = {1, 2, 3, 4, 5, 6, 7, 8, 11, 12}
print(len(truth & returned) / len(truth))`,
    opts: [["0.8", true, "Eight of the ten true neighbours were returned."], ["0.2", false, "Two returned items were wrong, not missing."], ["1.0", false, "Two true neighbours (9, 10) were missed."]],
    path: ["Shared items: 1–8 = 8.", "8 / 10 = 0.8."],
    why: "Recall measures coverage of the true neighbours.",
    watch: "Always measure against an exact search on real queries.",
    remember: "recall = |true ∩ returned| / |true|.",
  },
  {
    t: "MRR",
    q: "What does this print?",
    code: py`
ranks = [1, 2, None]
print(round(sum(1 / r for r in ranks if r) / len(ranks), 3))`,
    opts: [["0.5", true, "(1 + 0.5 + 0) / 3."], ["0.667", false, "That is recall@2; MRR weights by rank."], ["1.5", false, "Divide by the number of questions."]],
    path: ["Reciprocal ranks 1, 0.5, 0.", "Mean = 1.5 / 3 = 0.5."],
    why: "MRR rewards ranking the relevant chunk high.",
    watch: "A miss counts as 0.",
    remember: "MRR = mean(1/rank).",
  },
  {
    t: "MMR score",
    q: "What does this print?",
    code: py`
lam, sim_query, sim_chosen = 0.5, 0.8, 0.6
print(round(lam * sim_query - (1 - lam) * sim_chosen, 2))`,
    opts: [["0.1", true, "Relevance 0.4 minus redundancy 0.3."], ["0.7", false, "Subtract the weighted redundancy."], ["0.5", false, "λ weights both terms."]],
    path: ["0.5 × 0.8 = 0.4.", "0.5 × 0.6 = 0.3.", "0.4 − 0.3 = 0.1."],
    why: "Similar-to-chosen documents are penalised.",
    watch: "λ = 1 ignores diversity.",
    remember: "λ·sim − (1 − λ)·max sim to chosen.",
  },
  {
    t: "A reducer",
    q: "What does this print?",
    code: py`
def add_list(old, new):
    return (old or []) + (new if isinstance(new, list) else [new])
print(add_list([1], [2, 3]), add_list(None, 4))`,
    opts: [["[1, 2, 3] [4]", true, "Updates are appended to the current value."], ["[2, 3] 4", false, "Without a reducer the update would replace the value."], ["[1, [2, 3]] [4]", false, "The reducer flattens list updates."]],
    path: ["old [1] + new [2, 3] = [1, 2, 3].", "None + 4 = [4]."],
    why: "Reducers merge updates instead of replacing.",
    watch: "Parallel writers need a reducer.",
    remember: "state[k] = reducer(old, new).",
  },
  {
    t: "Super-steps",
    q: "What does this print?",
    code: py`
edges = {"START": ["a", "b"], "a": ["c"], "b": ["c"], "c": ["END"]}
active, steps = ["a", "b"], 0
while active:
    steps += 1
    nxt = []
    for n in active:
        nxt += edges[n]
    active = [n for n in dict.fromkeys(nxt) if n != "END"]
print(steps)`,
    opts: [["2", true, "a and b run together, then c."], ["3", false, "a and b share one super-step."], ["4", false, "c runs once, after both."]],
    path: ["Step 1: a and b.", "Step 2: c (once)."],
    why: "Active nodes run in one super-step.",
    watch: "Fan-in nodes run once.",
    remember: "parallel nodes share a step.",
  },
  {
    t: "Interrupt restarts the node",
    q: "What does this print?",
    code: py`
runs = []
def node(resume=None):
    runs.append("start")
    if resume is None:
        return "paused"
    return f"resumed with {resume}"
print(node(), node(resume="yes"), len(runs))`,
    opts: [["paused resumed with yes 2", true, "The node body runs again on resume."], ["paused resumed with yes 1", false, "Resuming restarts the node from its beginning."], ["paused paused 2", false, "The second call receives the resume value."]],
    path: ["First call pauses.", "Second call runs the whole body again with the answer.", "So 'start' is recorded twice."],
    why: "interrupt() resumes by re-running the node.",
    watch: "Keep code before interrupt() idempotent.",
    remember: "resume = restart node.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Exact search and cosine", "Find the nearest vectors with a flat search.", py`
import numpy as np

rng = np.random.default_rng(0)
X = rng.normal(size=(1000, 16))
X /= np.linalg.norm(X, axis=1, keepdims=True)
q = X[42] + 0.05 * rng.normal(size=16)
q /= np.linalg.norm(q)
print(np.argsort(-(X @ q))[:3].tolist())`],
  ["A tiny vector store", "Add documents and search with a filter.", py`
import numpy as np

docs = [("refunds take 14 days", "a"), ("shipping takes 3 days", "b"), ("refund policy for premium", "a")]
vocab = sorted({w for t, _ in docs for w in t.split()})
embed = lambda t: np.array([t.split().count(w) for w in vocab], float)
vecs = [embed(t) / np.linalg.norm(embed(t)) for t, _ in docs]
q = embed("refund policy"); q /= np.linalg.norm(q)
hits = sorted(((float(v @ q), i) for i, v in enumerate(vecs) if docs[i][1] == "a"), reverse=True)
print([docs[i][0] for _, i in hits])`],
  ["Recursive chunking", "Split text on paragraphs, then sentences, with overlap.", py`
def split(text, size=60, overlap=10):
    parts = [p for p in text.replace("\n\n", "\n").split("\n")]
    chunks, cur = [], ""
    for p in parts:
        if cur and len(cur) + len(p) + 1 > size:
            chunks.append(cur)
            cur = cur[-overlap:] + " " + p
        else:
            cur = (cur + " " + p).strip()
    return chunks + [cur]

print([len(c) for c in split("Refunds take 14 days.\n\nShipping takes 3 to 5 days.\n\nSupport is open on weekdays.")])`],
  ["IVF from scratch", "Cluster vectors and search two lists.", py`
import numpy as np

rng = np.random.default_rng(0)
X = np.vstack([rng.normal(c, 0.3, (200, 2)) for c in ((0, 0), (5, 5), (0, 5), (5, 0))])
cent = np.array([[0, 0], [5, 5], [0, 5], [5, 0]], float)
assign = np.argmin(((X[:, None] - cent[None]) ** 2).sum(axis=2), axis=1)
q = np.array([4.8, 4.9])
probe = np.argsort(((cent - q) ** 2).sum(axis=1))[:2]
idx = np.where(np.isin(assign, probe))[0]
print(len(idx), "of", len(X), "vectors scanned")`],
  ["A LangGraph-style state merge", "Apply reducers to a list of node updates.", py`
def merge(state, update, reducers):
    for k, v in update.items():
        state[k] = reducers[k](state.get(k), v) if k in reducers else v
    return state

add = lambda old, new: (old or []) + [new]
state = {}
for u in [{"log": "a", "x": 1}, {"log": "b", "x": 2}]:
    state = merge(state, u, {"log": add})
print(state)`],
  ["Conditional routing", "Route a request with a plain function.", py`
def route(state):
    if state["tries"] >= 3:
        return "give_up"
    return "retry" if state["score"] < 0.7 else "answer"

for s in ({"score": 0.4, "tries": 1}, {"score": 0.9, "tries": 1}, {"score": 0.4, "tries": 3}):
    print(s, "->", route(s))`],
  ["Checkpoint and resume", "Save a state per thread and resume after a pause.", py`
import json

checkpoints = {}
def run(thread, inputs, answer=None):
    state = json.loads(checkpoints[thread]) if thread in checkpoints else {"step": 0}
    if state["step"] == 0:
        state.update(step=1, question="approve?")
        checkpoints[thread] = json.dumps(state)
        return "paused: " + state["question"]
    state.update(step=2, result="done" if answer else "refused")
    checkpoints[thread] = json.dumps(state)
    return state["result"]

print(run("t1", {}), "|", run("t1", {}, answer=True), "|", run("t2", {}))`],
  ["Evaluate retrieval", "Compute recall@k and MRR for a small labelled set.", py`
results = [(["c1", "c2", "c3"], "c1"), (["c4", "c5", "c6"], "c5"), (["c7", "c8", "c9"], "c2")]
k = 2
recall = sum(rel in ret[:k] for ret, rel in results) / len(results)
mrr = sum(1 / (ret.index(rel) + 1) if rel in ret else 0 for ret, rel in results) / len(results)
print(round(recall, 3), round(mrr, 3))`],
];

export const glance: [string, string][] = [
  ["LangChain", "create_agent(model, tools, system_prompt) · init_chat_model · Runnable: invoke/batch/stream · a | b · {k: runnable} parallel · middleware"],
  ["Retrieval blocks", "document loaders → text splitters → embeddings → vector stores → retrievers · Document(page_content, metadata)"],
  ["Splitting", "chunks = 1 + ⌈(L − size)/(size − overlap)⌉ · tutorial: chunk_size 1000, chunk_overlap 200 · RecursiveCharacterTextSplitter"],
  ["Metrics", "cosine = a·b/(‖a‖‖b‖) · unit vectors: ‖a − b‖² = 2 − 2cos · flat cost N·d · memory 4Nd bytes"],
  ["ANN", "recall@k = |true ∩ returned| / k · IVF nlist/nprobe · HNSW m, ef_construction, ef_search · PQ bytes per vector"],
  ["pgvector", "<-> L2 · <#> negative inner product · <=> cosine · hnsw (m 16, ef_construction 64, ef_search 40) · ivfflat lists = rows/1000, probes ≈ √lists · vector(n) = 4n + 8 bytes"],
  ["RAG", "2-step: high control, fast · agentic: flexible, variable latency · hybrid: rewrite + validate · MMR = λ·sim − (1 − λ)·max sim(chosen)"],
  ["LangGraph", "StateGraph · START/END · add_node · add_edge · add_conditional_edges · compile · invoke · Send · Command(update, goto, resume)"],
  ["State", "reducer(old, new) · Annotated[list, add] · add_messages · MessagesState · super-steps · recursion_limit (top-level config) → GraphRecursionError"],
  ["Persistence", "compile(checkpointer=InMemorySaver/SqliteSaver/PostgresSaver, store=InMemoryStore) · config={'configurable': {'thread_id': ...}} · interrupt() + Command(resume=…) restarts the node"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable RAG", ["Measure recall@k on real questions before tuning anything else", "Keep source and position metadata on every chunk", "Normalise vectors and use the metric the embedding model expects", "Test your most selective filters", "Return the evidence with the answer", "Re-run evaluation after every change of splitter, embedding model, index or prompt"]],
  ["Habits for LangGraph agents", ["Keep the state small and explicit; add reducers for shared keys", "Unit-test nodes, routing functions and reducers without a model", "Use a durable checkpointer and one thread id per conversation", "Make side effects idempotent: resumed nodes restart", "Set recursion limits, token budgets and timeouts", "Trace every run and keep a human fallback"]],
  ["Explaining your answer in an exam", ["Name the building blocks and the data flowing between them", "Write the formula, substitute the numbers, compute, interpret", "State the trade-off: recall versus latency, control versus flexibility", "Say what you would measure and where a human stays in the loop"]],
];

export const materials: [string, [string, string][]][] = [
  ["LangChain and LangGraph documentation", [["LangChain overview", "https://docs.langchain.com/oss/python/langchain/overview"], ["Retrieval (RAG architectures)", "https://docs.langchain.com/oss/python/langchain/retrieval"], ["Build a RAG agent", "https://docs.langchain.com/oss/python/langchain/rag"], ["LangGraph overview", "https://docs.langchain.com/oss/python/langgraph/overview"], ["Graph API (state, reducers, edges, Send)", "https://docs.langchain.com/oss/python/langgraph/graph-api"], ["Persistence (checkpointers, stores)", "https://docs.langchain.com/oss/python/langgraph/persistence"], ["Interrupts (human-in-the-loop)", "https://docs.langchain.com/oss/python/langgraph/interrupts"], ["Workflows and agents", "https://docs.langchain.com/oss/python/langgraph/workflows-agents"], ["Vector store integrations", "https://docs.langchain.com/oss/python/integrations/vectorstores"]]],
  ["Vector databases", [["pgvector README", "https://github.com/pgvector/pgvector"]]],
];
