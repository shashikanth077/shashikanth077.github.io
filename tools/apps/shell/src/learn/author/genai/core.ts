import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- generative-ai`. */

const ATT = `
import numpy as np

X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
d = X.shape[1]
def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)`;

export const tok: ConceptDef[] = [
  {
    t: "What generative AI is",
    lv: 1,
    s: `{{Generative AI}} models learn the distribution of data (text, images, audio, code) and sample new examples from it. A {{large language model (LLM)}} is trained on one simple task — predict the next token — on trillions of tokens, and from this emerge abilities nobody programmed: answering questions, summarising, translating, writing code. The same recipe (large model, huge data, self-supervision) powers image, audio and video generators. They are {{probabilistic}}: the same prompt can give different answers, and a fluent answer is not necessarily a true one.`,
    r: `Treat a model as a very capable but fallible component: design systems around its failure modes.`,
    i: `Why can the same prompt give different answers, and why is fluency not evidence of truth?`,
    c: py`
import numpy as np

probs = {"Paris": 0.86, "Lyon": 0.07, "France": 0.04, "the": 0.03}
rng = np.random.default_rng(0)
print([str(rng.choice(list(probs), p=list(probs.values()))) for _ in range(6)])`,
    v: compare("Discriminative versus generative models.", ["Discriminative", "Generative"], [
      ["Learns", "labels from inputs: P(y | x)", "the data itself: P(x)"],
      ["Output", "a class or number", "new text, images, audio"],
      ["Typical use", "spam detection, diagnosis", "chat, drafting, image creation"],
      ["Main risk", "wrong label", "fluent but false content"],
    ]),
  },
  {
    t: "Tokens: the units a model reads",
    lv: 1,
    s: `Models do not see characters or words but {{tokens}} — sub-word pieces produced by a tokenizer such as byte-pair encoding. Common words are one token ("the"), rare words split ("unhappiness" → un · happi · ness), numbers and code split into many. A rule of thumb for English: 1 token ≈ 4 characters ≈ 0.75 words, so 1,000 words ≈ 1,300 tokens; other languages and code often need 2–3× more. Tokens are what you pay for, what the context window limits and what the model predicts one at a time. Whitespace and casing matter: " the" and "the" can be different tokens.`,
    r: `Always count tokens with the model's own tokenizer before estimating cost or fitting a prompt into the context window.`,
    i: `Estimate the number of tokens in a 1,500-word English essay.`,
    c: py`
words = 1500
print(round(words / 0.75), "tokens (rule of thumb)")
text = "unhappiness"
pieces = ["un", "happi", "ness"]
print(len(text), "characters ->", len(pieces), "tokens", pieces)
print(round(1500 * 1.3), round(1500 * 2.5))`,
    v: compare("Rough token counts.", ["Words / characters", "≈ Tokens"], [
      ["English prose", "1,000 words", "1,300"],
      ["Source code", "1,000 words", "2,000–3,000"],
      ["Non-Latin scripts", "1,000 words", "2,000–4,000"],
      ["A page of text", "≈ 500 words", "≈ 650"],
    ]),
  },
  {
    t: "Embeddings: meaning as vectors",
    lv: 1,
    s: `Each token is turned into a vector by an {{embedding table}} of shape (vocabulary × dimension); with 50,257 tokens and 768 dimensions that is 38.6 million numbers, learned during training. Sentences and documents get vectors too, from dedicated embedding models. In the space, similar meanings sit close together; {{cosine similarity}} measures closeness: for the toy vectors a = (0.9, 0.1) and b = (0.8, 0.3) the cosine is 0.969 (similar), for a and c = (0.1, 0.9) it is 0.220 (different). Embeddings power semantic search, clustering, recommendation and the retrieval step of RAG.`,
    r: `Embeddings from different models live in different spaces: never compare or mix them.`,
    i: `Compute the cosine similarity of (0.9, 0.1) with (0.8, 0.3) and with (0.1, 0.9).`,
    c: py`
import numpy as np

a, b, c = np.array([0.9, 0.1]), np.array([0.8, 0.3]), np.array([0.1, 0.9])
cos = lambda x, y: float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))
print(round(cos(a, b), 3), round(cos(a, c), 3))
print(50257 * 768)`,
    v: plot("Toy 2-D embedding space: 'cat' and 'dog' are close, 'invoice' is far away.", {
      x: [0, 1], y: [0, 1], labels: ["dimension 1", "dimension 2"],
    }, [pt("0.9", "0.1", { c: "info", label: "cat" }), pt("0.8", "0.3", { c: "info", label: "dog" }), pt("0.1", "0.9", { c: "warn", label: "invoice" }), seg("0.9", "0.1", "0.8", "0.3", { c: "muted", dash: true })]),
  },
  {
    t: "Positional information: telling a model the order",
    lv: 2,
    s: `Self-attention treats a sentence as a set — without extra signals "dog bites man" and "man bites dog" look the same. Position is injected in one of three ways. {{Learned absolute}} position vectors (GPT-2: 1,024 positions). {{Sinusoidal}} encodings: PE(pos, 2i) = sin(pos / 10000^(2i/d)): for the first dimension (i = 0) positions 0, 1, 2 give 0, 0.841, 0.909. {{Rotary embeddings (RoPE)}} rotate the query and key vectors by an angle proportional to position, so attention depends on the relative distance of two tokens — the choice of most modern LLMs, and the basis of context-extension tricks.`,
    r: `A model trained on 4k tokens often fails beyond that unless its positional scheme is extended and the model is adapted.`,
    i: `Why does attention need positional information?`,
    c: py`
import numpy as np

pos = np.array([0, 1, 2])
print(np.sin(pos / 10000 ** (0 / 4)).round(3).tolist())
def rotate(v, angle):
    c, s = np.cos(angle), np.sin(angle)
    return np.array([c * v[0] - s * v[1], s * v[0] + c * v[1]])
q, k = np.array([1.0, 0.0]), np.array([1.0, 0.0])
print(round(float(rotate(q, 0.3 * 5) @ rotate(k, 0.3 * 3)), 3), round(float(rotate(q, 0.3 * 12) @ rotate(k, 0.3 * 10)), 3))`,
    v: compare("Three ways to encode position.", ["Idea", "Typical use"], [
      ["Learned absolute", "a trainable vector per position", "GPT-2, BERT"],
      ["Sinusoidal", "fixed sines and cosines", "original Transformer"],
      ["Rotary (RoPE)", "rotate Q and K by position angle", "most modern LLMs"],
      ["ALiBi", "penalty growing with distance", "some long-context models"],
    ]),
  },
  {
    t: "The context window and its cost",
    lv: 1,
    s: `The {{context window}} is the maximum number of tokens (input + output) a model can handle in one request: 4k, 8k, 128k, 1M and beyond. Everything the model should consider — instructions, history, retrieved documents, the question and the room for the answer — has to fit. Attention cost grows with the square of the length, so long prompts are slower and costlier even when allowed. A 6,000-token prompt with a 1,000-token answer needs 7,000 of an 8,000 window. Models also use the middle of a very long context less reliably than its start and end, so put key facts and instructions where they are seen.`,
    r: `Budget tokens explicitly: system prompt + history + retrieved text + question + reserved answer length.`,
    i: `How many tokens of retrieved text fit in an 8,000-token window with a 500-token system prompt, 100-token question and 1,000 reserved for the answer?`,
    c: py`
window, system, question, answer = 8000, 500, 100, 1000
room = window - system - question - answer
print(room, room // 500, "chunks of 500 tokens")
for n in (1000, 4000, 16000):
    print(n, n * n)`,
    v: bars("Token budget of an 8,000-token window.", [["system prompt", "500"], ["question", "100"], ["reserved answer", "1000"], ["room for retrieved text", "8000-500-100-1000"]], {
      max: 8000,
    }),
  },
  {
    t: "Vocabulary size and embedding parameters",
    lv: 2,
    s: `The tokenizer's vocabulary V sets the size of the input embedding (V × d) and the output layer (d × V, often tied to the same matrix). GPT-2 has V = 50,257 and d = 768: 38.6 M parameters in embeddings — 31% of its 124 M. Larger vocabularies (100k–250k) shorten sequences (fewer tokens per text, cheaper attention) and help multilingual text, but enlarge the embedding matrices and the softmax over V at every generation step. Byte-level tokenizers never produce an unknown token because any text is a sequence of bytes.`,
    r: `For small models the vocabulary can dominate the parameter count: consider it when sizing a model.`,
    i: `How many embedding parameters do V = 50,257 and d = 768 give, and what fraction of 124 M is that?`,
    c: py`
V, d = 50257, 768
emb = V * d
print(emb, round(emb / 124.3e6 * 100, 1), "% of 124.3M")
for V2 in (32000, 100000, 250000):
    print(V2, V2 * 4096 / 1e6, "M parameters at d = 4096")`,
    v: bars("Embedding matrix size (millions of parameters) for d = 4096.", [["V = 32k", "32*4.096"], ["V = 100k", "100*4.096"], ["V = 250k", "250*4.096"]], {
      max: 1100,
    }),
  },
];

/* ------------------------------------------------------------------ */
export const arch: ConceptDef[] = [
  {
    t: "Self-attention, step by step",
    lv: 2,
    s: `For each token the model forms a query q, key k and value v (linear projections of its embedding). The score between tokens i and j is qᵢ·kⱼ/√d; a softmax over j gives attention weights; the output of token i is the weighted sum of the values. With three tokens x = (1,0), (0,1), (1,1) and identity projections: scores for token 1 are (0.707, 0, 0.707), weights (0.401, 0.198, 0.401), output 0.401·(1,0) + 0.198·(0,1) + 0.401·(1,1) = (0.802, 0.599). Each token's new vector is a blend of the others, weighted by relevance — that is how context flows.`,
    r: `The 1/√d keeps scores from growing with the dimension, which would saturate the softmax.`,
    i: `Compute the attention weights of the first token for the three toy vectors.`,
    c: py`${ATT}
scores = X @ X.T / np.sqrt(d)
W = softmax(scores)
print(scores.round(3).tolist())
print(W.round(3).tolist())
print((W @ X).round(3).tolist())`,
    v: cells("Attention weights (row = the token that is looking, column = the token it looks at).", table(["", "token 1", "token 2", "token 3"], [["token 1", "0.401", "0.198", "0.401"], ["token 2", "0.198", "0.401", "0.401"], ["token 3", "0.248", "0.248", "0.503"]]), [
      ["Every row sums to 1."],
      ["Token 1 attends most to itself and to token 3, which is similar.", [[1, 1, 1], [1, 3, 3]]],
      ["Token 3 = (1,1) is similar to everything, so it spreads weight but favours itself.", [[3, 1, 3]]],
    ]),
  },
  {
    t: "The causal mask: no peeking at the future",
    lv: 2,
    s: `When generating, a token may only look at earlier tokens, otherwise training would be trivial (the answer is the next token). A {{causal mask}} sets the scores of future positions to −∞ before the softmax, so their weights become exactly 0. For the toy example the first token can see only itself (weights 1, 0, 0), the second splits 0.33 / 0.67 over tokens 1–2, the third keeps (0.248, 0.248, 0.503). One forward pass therefore trains the model on every position at once — a sequence of n tokens gives n next-token predictions.`,
    r: `Encoder models (BERT) use no mask; decoder models (GPT, Claude, Llama) use the causal mask.`,
    i: `Apply a causal mask to the three-token scores and give the new weight matrix.`,
    c: py`${ATT}
scores = X @ X.T / np.sqrt(d)
mask = np.tril(np.ones((3, 3), bool))
W = softmax(np.where(mask, scores, -1e9))
print(W.round(3).tolist())`,
    v: cells("Attention weights after the causal mask.", table(["", "token 1", "token 2", "token 3"], [["token 1", "1.00", "0", "0"], ["token 2", "0.33", "0.67", "0"], ["token 3", "0.248", "0.248", "0.503"]]), [
      ["Future positions are blocked: the upper triangle is zero."],
      ["Token 1 can only look at itself.", [[1, 1, 1]]],
      ["Token 3 sees all three: unchanged.", [[3, 1, 3]]],
    ]),
  },
  {
    t: "Multi-head attention and shapes",
    lv: 2,
    s: `One attention pattern is not enough (syntax, coreference, position all matter), so the d-dimensional space is split into h {{heads}} of size d/h that attend independently and are concatenated and mixed by an output projection. For d = 768 and h = 12, each head works in 64 dimensions. Shapes: input (batch, seq, d) → Q, K, V each (batch, h, seq, d/h) → scores (batch, h, seq, seq) → output (batch, seq, d). The scores tensor is why memory and time grow with seq²: for a 4,096-token sequence and 32 heads that is 4,096² × 32 = 537 million scores per layer (FlashAttention avoids storing them).`,
    r: `Grouped-query attention shares keys and values among several query heads to shrink the KV cache.`,
    i: `Give the per-head dimension for d = 768, h = 12 and the number of attention scores for seq = 4,096 and 32 heads.`,
    c: py`
d, h, seq = 768, 12, 4096
print(d // h)
print(seq * seq * 32, round(seq * seq * 32 * 2 / 1e9, 2), "GB in fp16 per layer (if stored)")
import numpy as np
x = np.zeros((2, seq // 64, d))
print(x.reshape(2, seq // 64, h, d // h).transpose(0, 2, 1, 3).shape)`,
    v: bars("Attention scores per layer (millions) for 32 heads as the sequence grows.", [["1,024 tokens", "1024*1024*32/1000000"], ["4,096 tokens", "4096*4096*32/1000000"], ["8,192 tokens", "8192*8192*32/1000000"]], {
      max: 2200,
    }),
  },
  {
    t: "The transformer block: attention, MLP, residuals",
    lv: 2,
    s: `A transformer layer is two sub-layers, each wrapped in {{layer normalisation}} and a {{residual connection}}: x ← x + Attention(LN(x)), then x ← x + MLP(LN(x)). The MLP expands to 4d and projects back (with a GELU or SwiGLU non-linearity). The residual path lets gradients flow through dozens of layers, and each layer only adds a refinement to what is already in the stream. LayerNorm standardises each token's vector: (1, 2, 3, 4) becomes (−1.342, −0.447, 0.447, 1.342). Stacking L such blocks (12 for GPT-2 small, 80+ for the largest models) and adding an output layer over the vocabulary gives the full model.`,
    r: `"Pre-norm" (normalise before each sub-layer) trains more stably than the original "post-norm".`,
    i: `Normalise the vector (1, 2, 3, 4) with LayerNorm (no learned scale).`,
    c: py`
import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
ln = (x - x.mean()) / np.sqrt(x.var() + 1e-5)
print(ln.round(3).tolist())
d = 768
attn, mlp = 4 * d * d, 2 * d * 4 * d
print(attn, mlp, attn + mlp, 12 * d * d)`,
    v: rowflow("One transformer layer.", ["Token vectors x", "LayerNorm", "Self-attention", "+ residual", "LayerNorm + MLP", "+ residual"], [
      "Input from the layer below.",
      "Standardise each token.",
      "Mix information between tokens.",
      "Add the result back to x.",
      "Process each token independently.",
      "Output to the next layer.",
    ]),
  },
  {
    t: "Counting parameters: 12·L·d²",
    lv: 2,
    s: `Each layer holds 4d² weights in attention (Q, K, V and output projections) and 8d² in the MLP (d → 4d → d), so {{≈ 12 d²}} per layer and {{12 L d²}} in total, plus the embeddings V × d. GPT-2 small: L = 12, d = 768 → 12 × 12 × 768² = 84.9 M, plus 50,257 × 768 = 38.6 M and 1,024 × 768 = 0.8 M positions: 124.3 M — the advertised "124M". A 7B model has roughly d = 4,096, L = 32: 12 × 32 × 4,096² = 6.4 B + embeddings ≈ 6.6 B. Memory to store weights = parameters × bytes: 7 B in 16-bit = 14 GB.`,
    r: `Doubling the width d quadruples the parameters; doubling the depth doubles them.`,
    i: `Estimate the parameter count of a model with L = 32, d = 4096 and V = 32,000.`,
    c: py`
def params(L, d, V, pos=0):
    return 12 * L * d * d + V * d + pos * d

print(params(12, 768, 50257, 1024))
print(params(32, 4096, 32000), round(params(32, 4096, 32000) * 2 / 1e9, 1), "GB in 16-bit")`,
    v: bars("Parameters (millions) of the transformer layers for the chosen width and depth.", [["layers: 12·L·d²", "12*L*d*d/1000000"], ["embeddings: V·d (V = 50,257)", "50257*d/1000000"]], {
      max: 9000,
      params: [par("L", "layers L", 4, 96, 4, 12), par("d", "width d", 256, 8192, 256, 768)],
      readout: ["L = {L}, d = {d}: ≈ {floor(12*L*d*d/1000000)} M in the layers"],
      steps: [["GPT-2 small: L = 12, d = 768.", { L: 12, d: 768 }], ["A 7B-class model: L = 32, d = 4096.", { L: 32, d: 4096 }]],
    }),
  },
  {
    t: "The KV cache: memory while generating",
    lv: 2,
    s: `Generating token n+1 needs the keys and values of all n earlier tokens at every layer. Recomputing them each step would be wasteful, so they are stored — the {{KV cache}}. Its size is 2 (K and V) × layers × heads × head_dim × tokens × bytes. For 32 layers, 32 heads of 128 dimensions, 4,096 tokens in 16-bit: 2 × 32 × 32 × 128 × 4,096 × 2 bytes = 2.15 GB — for one conversation. With many users the cache, not the weights, limits throughput; grouped-query attention (fewer KV heads), quantised caches and paged memory (PagedAttention) reduce it.`,
    r: `Long contexts multiply cache memory linearly: a 128k context needs 32× the cache of a 4k one.`,
    i: `Compute the KV cache for 32 layers, 32 heads, head size 128, 4,096 tokens, 16-bit.`,
    c: py`
def kv_cache(layers, heads, head_dim, tokens, bytes_per=2):
    return 2 * layers * heads * head_dim * tokens * bytes_per

base = kv_cache(32, 32, 128, 4096)
print(base, round(base / 1e9, 2), "GB")
print(round(kv_cache(32, 8, 128, 4096) / 1e9, 2), "GB with 8 KV heads (GQA)")
print(round(kv_cache(32, 32, 128, 128000) / 1e9, 1), "GB at 128k tokens")`,
    v: plot("KV cache memory against the context length (32 layers, 32 heads × 128, 16-bit).", {
      x: [0, 32000], y: [0, 18], labels: ["tokens", "cache (GB)"],
      params: [par("kv", "KV heads", 4, 32, 4, 32)],
      readout: ["4,096 tokens → {2*32*kv*128*4096*2/1000000000:2} GB"],
      steps: [["Full multi-head: 2.15 GB at 4k tokens.", { kv: 32 }], ["Grouped-query (8 KV heads): a quarter.", { kv: 8 }]],
    }, [curve("2*32*kv*128*x*2/1000000000", { c: "accent" })]),
  },
  {
    t: "Compute: FLOPs per token and mixture of experts",
    lv: 2,
    s: `Generating one token costs about {{2N}} floating-point operations for a dense model with N parameters (one multiply and one add per weight); training costs about {{6N}} per token (forward + backward). A 7 B model generates at ≈ 14 GFLOP/token. A {{mixture of experts (MoE)}} replaces the MLP by several expert MLPs and a router that sends each token to the best k: with 8 experts and k = 2, only a quarter of the expert weights are active, so a model of 47 B total parameters can run with ≈ 13 B active — more knowledge for the compute of a smaller model, at the cost of memory for all experts.`,
    r: `Quote both numbers for an MoE: total parameters (memory) and active parameters (speed).`,
    i: `How many FLOPs does generating one token cost for N = 7 B, and what fraction of experts is active for 8 experts with k = 2?`,
    c: py`
N = 7e9
print(2 * N / 1e9, "GFLOP per token,", 6 * N / 1e9, "GFLOP per token to train")
experts, k = 8, 2
print(k / experts)
shared, per_expert = 1.5e9, 5.7e9
print((shared + experts * per_expert) / 1e9, (shared + k * per_expert) / 1e9)`,
    v: compare("Dense versus mixture-of-experts.", ["Dense", "MoE (8 experts, top-2)"], [
      ["Parameters used per token", "all", "about a quarter of the expert weights"],
      ["Memory", "N weights", "all experts must be stored"],
      ["Speed per token", "2N FLOPs", "≈ 2N_active FLOPs"],
      ["Complication", "none", "routing, load balancing"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
