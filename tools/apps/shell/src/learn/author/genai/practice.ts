import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* tokens */
  ["tok", 1, "How is generative AI different from discriminative AI?", "Generative models learn the data distribution and sample new content; discriminative ones predict labels from inputs."],
  ["tok", 1, "Roughly how many tokens are 1,500 English words?", "About 2,000 (1 token ≈ 0.75 words)."],
  ["tok", 1, "Cosine similarity of (0.9, 0.1) with (0.8, 0.3) and with (0.1, 0.9)?", "0.969 and 0.220."],
  ["tok", 2, "Why does attention need positional information, and what is RoPE?", "Attention ignores order; RoPE rotates Q and K by position-dependent angles so scores depend on relative distance."],
  ["tok", 1, "Token budget: 8,000 window, 500 system, 100 question, 1,000 answer — room for retrieved text?", "6,400 tokens (12 chunks of 500)."],
  ["tok", 2, "Embedding parameters for V = 50,257 and d = 768?", "38.6 million (31% of GPT-2 small)."],
  /* architecture */
  ["arch", 2, "State the attention formula and why divide by √d.", "softmax(QKᵀ/√d)V; without it large d makes scores large and saturates the softmax."],
  ["arch", 2, "What does the causal mask do and why?", "Sets future scores to −∞ so weights are 0: a token can only attend to earlier ones, which lets one pass train every position."],
  ["arch", 2, "Per-head size for d = 768, h = 12? Scores for seq 4096 and 32 heads?", "64; 4096² × 32 = 537 million per layer."],
  ["arch", 2, "Estimate the parameters of a transformer with L layers, width d and vocabulary V.", "≈ 12 L d² + V d (GPT-2 small: 124 M)."],
  ["arch", 2, "KV cache for 32 layers, 32 heads × 128, 4,096 tokens, 16-bit?", "2 × 32 × 32 × 128 × 4096 × 2 bytes = 2.15 GB."],
  ["arch", 2, "FLOPs per generated token and per trained token for N parameters?", "≈ 2N and ≈ 6N."],
  ["arch", 2, "Dense versus mixture of experts?", "MoE routes each token to k of E experts: more total parameters (memory) with active compute of only k/E of the expert weights."],
  /* training */
  ["train", 1, "Loss of a model giving the true token probability 0.25? Perplexity for loss 2.0?", "−ln 0.25 = 1.386; e² = 7.4."],
  ["train", 2, "Tokens and training FLOPs for a 70 B model at 20 tokens per parameter?", "1.4 T tokens; 6 N D ≈ 5.9 × 10²³ FLOPs."],
  ["train", 1, "Name the steps of pretraining data preparation.", "Filter, deduplicate, mix sources, remove benchmark contamination, tokenize."],
  ["train", 2, "Learning rate at step 5,000 with peak 3e-4, warm-up 1,000, cosine to 10,000?", "≈ 1.76 × 10⁻⁴."],
  ["train", 2, "Memory per parameter with mixed-precision Adam, and for a 7 B model?", "16 bytes: ≈ 112 GB."],
  ["train", 1, "What is in-context learning?", "Performing a new task from examples in the prompt, with no weight updates."],
  /* adapt */
  ["adapt", 1, "When prompting, RAG or fine-tuning?", "Prompt first; RAG for missing or changing knowledge; fine-tune for style, format, specialised skills or lower cost."],
  ["adapt", 2, "Why compute SFT loss only on response tokens?", "The model must learn to produce the answer, not to predict the prompt, which is given."],
  ["adapt", 2, "LoRA parameters for d = k = 4096 and r = 8?", "r(d + k) = 65,536, 0.39% of 16.8 M."],
  ["adapt", 2, "Quantise (0.5, −1.2, 0.03, 0.9) to int8.", "scale = 1.2/127 = 0.00945; q = (53, −127, 3, 95); max error ≈ 0.0024."],
  ["adapt", 2, "Memory of a 70 B model in 16-, 8- and 4-bit?", "140, 70 and 35 GB."],
  ["adapt", 2, "DPO loss for log-ratios +2 (chosen) and −2 (rejected), β = 0.1?", "−ln σ(0.4) = 0.513."],
  /* prompting */
  ["prompt", 1, "List the parts of a good prompt.", "Role/context, precise task, delimited input, constraints, output format, optional examples, and permission to say 'unknown'."],
  ["prompt", 1, "Extra daily tokens from 5 examples of 60 tokens at 10,000 requests/day?", "300 per request → 3 million per day."],
  ["prompt", 2, "Why does chain-of-thought help and what does it cost?", "Intermediate tokens give the model more computation; it costs extra output tokens and latency."],
  ["prompt", 2, "Total input tokens over 10 turns: 500-token system prompt, 200 added per turn?", "10 × 500 + 200 × (0 + … + 9) = 14,000."],
  ["prompt", 2, "Why validate structured output?", "Models can return invalid, incomplete or injected content; parse and check keys, types and enums, and retry."],
  ["prompt", 1, "Temperature for extraction versus creative writing?", "Low (0–0.3) versus high (0.7–1.0)."],
  ["prompt", 2, "What is prompt injection and the key mitigation?", "Untrusted text carrying instructions that the model obeys; treat input as untrusted, use least privilege and human approval for sensitive actions."],
  /* RAG */
  ["rag", 1, "Phases of RAG and the most common failure?", "Index, retrieve, generate; most failures are retrieval failures."],
  ["rag", 2, "Chunks from a 10,000-token document with size 500 and overlap 100?", "1 + ⌈9500/400⌉ = 25."],
  ["rag", 2, "Rank chunks for question (0.9, 0.2) against A (0.8, 0.3), B (0.1, 0.9), C (0.7, 0.1).", "Cosines ≈ 0.990, 0.323, 0.997 → C, A, B."],
  ["rag", 2, "Reciprocal rank fusion of A, B, C and B, C, A?", "A 0.0323, B 0.0325, C 0.0320 → B first."],
  ["rag", 2, "What does a reranker add?", "A cross-encoder re-scores top candidates by reading query and chunk together, improving precision."],
  ["rag", 2, "recall@5 with 17 of 20 questions retrieved and 15 answered correctly?", "recall@5 = 0.85; generation success given retrieval = 15/17 = 0.88."],
  ["rag", 1, "Why put the stable part of the prompt first?", "Prompt-prefix caching: an unchanging prefix is cheaper and faster."],
  /* diffusion */
  ["diff", 1, "Forward and reverse process of diffusion?", "Forward: add noise until pure noise. Reverse: a network predicts the noise and removes it step by step."],
  ["diff", 2, "x_t for ᾱ = 0.5, x₀ = 1, ε = 0.5?", "0.707 + 0.354 = 1.061."],
  ["diff", 2, "What loss trains a diffusion model?", "‖ε − ε_θ(x_t, t)‖², the error of the predicted noise."],
  ["diff", 2, "Guided estimate for ε_u = 0.1, ε_c = 0.3, w = 7.5?", "0.1 + 7.5 × 0.2 = 1.6."],
  ["diff", 2, "Savings of a 64×64×4 latent versus a 512×512×3 image?", "16,384 versus 786,432 numbers: 48× fewer."],
  ["multi", 1, "Visual tokens of a 336×336 image with 14×14 patches?", "24 × 24 = 576."],
  /* evaluation */
  ["evalu", 1, "Why are public benchmarks not enough?", "They may be contaminated and rarely match your task; build your own evaluation set."],
  ["evalu", 2, "pass@1 and pass@5 for n = 10, c = 3?", "0.30 and 1 − C(7,5)/C(10,5) = 0.917."],
  ["evalu", 2, "Biases of LLM judges and mitigations?", "Verbosity, position and self-preference bias; swap order, use rubrics, measure agreement with humans."],
  ["evalu", 2, "Cohen's κ for observed agreement 0.85 and chance 0.5?", "(0.85 − 0.5)/(1 − 0.5) = 0.70."],
  ["evalu", 1, "Kinds of hallucination and two mitigations?", "Factual, fabricated, unfaithful and reasoning errors; ground in sources with citations, verify with tools."],
  /* ops */
  ["ops", 1, "Cost of 2,000 input and 500 output tokens at 3 and 15 per million?", "0.006 + 0.0075 = 0.0135."],
  ["ops", 1, "Total time for 500 tokens at 50 tokens/s with 0.8 s time to first token?", "10.8 s."],
  ["ops", 2, "Requests per minute under 200,000 tokens/minute with 2,500-token requests?", "80."],
  ["ops", 1, "Name layers of guardrails.", "Input checks, model with least-privilege tools, output moderation and validation, logging and human review."],
  ["ops", 1, "What to check before sending customer data to a hosted model?", "Retention and training terms, personal data masked, legal basis and transparency to users."],
];

export const drills: DrillDef[] = [
  {
    t: "Cosine similarity",
    q: "What does this print?",
    code: py`
import numpy as np
a, b = np.array([0.9, 0.1]), np.array([0.1, 0.9])
print(round(float(a @ b / np.linalg.norm(a) / np.linalg.norm(b)), 3))`,
    opts: [["0.22", true, "0.18 / 0.82."], ["0.18", false, "That is the dot product, not normalised."], ["0.9", false, "The vectors point in different directions."]],
    path: ["a·b = 0.09 + 0.09 = 0.18.", "‖a‖‖b‖ = 0.82.", "0.18/0.82 = 0.22."],
    why: "Cosine divides the dot product by both lengths.",
    watch: "Normalise before comparing.",
    remember: "cos = a·b / (‖a‖‖b‖).",
  },
  {
    t: "Parameter count",
    q: "What does this print?",
    code: py`
L, d, V = 12, 768, 50257
print(12 * L * d * d + V * d)`,
    opts: [["123532032", true, "Layers plus token embeddings (without positions)."], ["84934656", false, "That omits the embeddings."], ["38597376", false, "That is only the embedding table."]],
    path: ["12 × 12 × 768² = 84,934,656.", "50,257 × 768 = 38,597,376.", "Sum = 123,532,032."],
    why: "Each layer has ≈ 12d² weights.",
    watch: "Position embeddings add another 0.8 M.",
    remember: "N ≈ 12 L d² + V d.",
  },
  {
    t: "KV cache size",
    q: "What does this print?",
    code: py`
layers, heads, hd, tokens = 32, 32, 128, 4096
print(2 * layers * heads * hd * tokens * 2 / 1e9)`,
    opts: [["2.147483648", true, "K and V, 2 bytes each."], ["1.073741824", false, "Both keys and values are stored."], ["4.294967296", false, "16-bit means 2 bytes per number."]],
    path: ["2 (K and V) × 32 × 32 × 128 × 4096 × 2 bytes.", "= 2,147,483,648 bytes = 2.15 GB."],
    why: "The cache stores K and V for every layer and head.",
    watch: "Grouped-query attention reduces the heads.",
    remember: "2·layers·heads·dim·tokens·bytes.",
  },
  {
    t: "Perplexity",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(float(np.exp(2.0)), 1), round(float(-np.log(0.25)), 3))`,
    opts: [["7.4 1.386", true, "Perplexity is e^loss; loss is −ln p."], ["2.0 0.25", false, "Convert with exp and log."], ["7.4 0.25", false, "−ln 0.25 is 1.386."]],
    path: ["e² = 7.39.", "−ln 0.25 = 1.386."],
    why: "Perplexity is the exponential of cross-entropy.",
    watch: "Natural log, not log₁₀.",
    remember: "PPL = exp(loss).",
  },
  {
    t: "Training compute",
    q: "What does this print?",
    code: py`
N = 70e9
D = 20 * N
print(D / 1e12, f"{6 * N * D:.2e}")`,
    opts: [["1.4 5.88e+23", true, "20 tokens per parameter, 6ND FLOPs."], ["1.4 7.00e+11", false, "Training costs 6 N D, not N."], ["14.0 5.88e+23", false, "20 × 70 B = 1.4 T tokens."]],
    path: ["D = 1.4 × 10¹² tokens.", "6 × 7×10¹⁰ × 1.4×10¹² = 5.88×10²³."],
    why: "Compute-optimal data scales with model size.",
    watch: "Many models train on far more than 20 tokens per parameter.",
    remember: "C ≈ 6ND.",
  },
  {
    t: "LoRA parameters",
    q: "What does this print?",
    code: py`
d = k = 4096
r = 8
print(r * (d + k), d * k, round(r * (d + k) / (d * k) * 100, 2))`,
    opts: [["65536 16777216 0.39", true, "Two thin matrices instead of one square one."], ["33554432 16777216 200.0", false, "B and A are r-sized, not d-sized."], ["65536 65536 100.0", false, "The full matrix has d × k weights."]],
    path: ["B: 4096 × 8, A: 8 × 4096 → 65,536.", "Full: 16,777,216.", "Ratio 0.39%."],
    why: "Rank r ≪ d limits the update.",
    watch: "Count both A and B.",
    remember: "LoRA params = r(d + k).",
  },
  {
    t: "int8 quantisation",
    q: "What does this print?",
    code: py`
import numpy as np
w = np.array([0.5, -1.2, 0.03, 0.9])
s = np.abs(w).max() / 127
q = np.round(w / s).astype(int)
print(q.tolist())`,
    opts: [["[53, -127, 3, 95]", true, "Each weight divided by the scale and rounded."], ["[0, -1, 0, 1]", false, "The scale maps the largest magnitude to 127."], ["[127, -127, 127, 127]", false, "Only the largest weight reaches 127."]],
    path: ["scale = 1.2/127 = 0.00945.", "0.5/0.00945 = 52.9 → 53.", "−1.2 → −127; 0.03 → 3; 0.9 → 95."],
    why: "Symmetric quantisation maps max|w| to 127.",
    watch: "Small weights lose relative precision.",
    remember: "q = round(w/s), s = max|w|/127.",
  },
  {
    t: "Chunk count",
    q: "What does this print?",
    code: py`
import math
print(1 + math.ceil((10000 - 500) / (500 - 100)))`,
    opts: [["25", true, "Stride 400 over the remaining 9,500 tokens."], ["20", false, "That ignores the overlap."], ["24", false, "Do not forget the first chunk."]],
    path: ["stride = 400.", "(10000 − 500)/400 = 23.75 → 24.", "+ 1 = 25."],
    why: "Overlap shrinks the stride.",
    watch: "The last chunk may be shorter.",
    remember: "1 + ⌈(L − size)/(size − overlap)⌉.",
  },
  {
    t: "Reciprocal rank fusion",
    q: "What does this print?",
    code: py`
dense, keyword = ["A", "B", "C"], ["B", "C", "A"]
s = {}
for r in (dense, keyword):
    for i, d in enumerate(r, 1):
        s[d] = s.get(d, 0) + 1 / (60 + i)
print(max(s, key=s.get), round(s["B"], 4))`,
    opts: [["B 0.0325", true, "B is near the top of both lists."], ["A 0.0323", false, "A is first in only one list."], ["C 0.032", false, "C is third and second."]],
    path: ["B: 1/62 + 1/61 = 0.0325.", "A: 1/61 + 1/63 = 0.0323.", "C: 1/63 + 1/62 = 0.0320."],
    why: "Consistently good ranks beat one first place.",
    watch: "k = 60 is the usual constant.",
    remember: "RRF = Σ 1/(60 + rank).",
  },
  {
    t: "Classifier-free guidance",
    q: "What does this print?",
    code: py`
eps_u, eps_c, w = 0.1, 0.3, 7.5
print(round(eps_u + w * (eps_c - eps_u), 2))`,
    opts: [["1.6", true, "0.1 + 7.5 × 0.2."], ["0.3", false, "That is the conditional estimate (w = 1)."], ["2.4", false, "Start from the unconditional prediction."]],
    path: ["difference = 0.2.", "× 7.5 = 1.5.", "+ 0.1 = 1.6."],
    why: "Extrapolating away from the unconditional prediction strengthens the prompt.",
    watch: "Too large a scale distorts images.",
    remember: "ε̂ = ε_u + w(ε_c − ε_u).",
  },
  {
    t: "pass@k",
    q: "What does this print?",
    code: py`
from math import comb
f = lambda n, c, k: 1 - comb(n - c, k) / comb(n, k)
print(round(f(10, 3, 1), 2), round(f(10, 3, 5), 3))`,
    opts: [["0.3 0.917", true, "More samples give more chances."], ["0.3 0.3", false, "pass@5 is higher than pass@1."], ["0.5 0.917", false, "pass@1 = c/n = 0.3."]],
    path: ["pass@1 = 3/10.", "pass@5 = 1 − C(7,5)/C(10,5) = 1 − 21/252."],
    why: "pass@k counts at least one correct among k samples.",
    watch: "Needs a reliable checker.",
    remember: "1 − C(n − c, k)/C(n, k).",
  },
  {
    t: "Request cost",
    q: "What does this print?",
    code: py`
tin, tout = 2000, 500
print(round(tin / 1e6 * 3 + tout / 1e6 * 15, 4))`,
    opts: [["0.0135", true, "Output tokens cost five times more here."], ["0.0075", false, "Add the input cost 0.006."], ["13.5", false, "Divide token counts by a million."]],
    path: ["input: 2000/10⁶ × 3 = 0.006.", "output: 500/10⁶ × 15 = 0.0075.", "total 0.0135."],
    why: "Billing is per million tokens, separately for input and output.",
    watch: "Prices here are illustrative.",
    remember: "cost = tin·pin + tout·pout.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Self-attention from scratch", "Compute attention weights and outputs for three tokens.", py`
import numpy as np

X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
S = X @ X.T / np.sqrt(2)
W = np.exp(S - S.max(axis=1, keepdims=True))
W /= W.sum(axis=1, keepdims=True)
print(W.round(3).tolist(), (W @ X).round(3).tolist())`],
  ["Causal mask", "Apply a causal mask before the softmax.", py`
import numpy as np

S = np.array([[0.7, 0.0, 0.7], [0.0, 0.7, 0.7], [0.7, 0.7, 1.4]])
S = np.where(np.tril(np.ones((3, 3), bool)), S, -1e9)
W = np.exp(S - S.max(axis=1, keepdims=True))
W /= W.sum(axis=1, keepdims=True)
print(W.round(2).tolist())`],
  ["Temperature and top-p sampling", "Sample from a distribution with top-p filtering.", py`
import numpy as np

rng = np.random.default_rng(0)
z = np.array([3.0, 2.0, 1.0, 0.0])
p = np.exp(z / 0.8) / np.exp(z / 0.8).sum()
order = np.argsort(-p)
keep = order[: int((np.cumsum(p[order]) < 0.9).sum()) + 1]
q = np.zeros_like(p)
q[keep] = p[keep] / p[keep].sum()
print(keep.tolist(), q.round(3).tolist(), np.bincount(rng.choice(4, 1000, p=q), minlength=4).tolist())`],
  ["Cosine retrieval", "Rank documents for a query by cosine similarity.", py`
import numpy as np

docs = np.array([[0.8, 0.3], [0.1, 0.9], [0.7, 0.1]])
q = np.array([0.9, 0.2])
sim = docs @ q / np.linalg.norm(docs, axis=1) / np.linalg.norm(q)
print(sim.round(3).tolist(), np.argsort(-sim).tolist())`],
  ["Chunk a document", "Split a token list into overlapping chunks.", py`
tokens = list(range(30))
size, overlap = 10, 3
chunks = [tokens[i:i + size] for i in range(0, len(tokens) - overlap, size - overlap)]
print(len(chunks), chunks[0][-3:], chunks[1][:3])`],
  ["LoRA update", "Build a low-rank update and merge it into W.", py`
import numpy as np

rng = np.random.default_rng(0)
d, k, r = 8, 8, 2
W = rng.normal(size=(d, k))
B, A = 0.1 * rng.normal(size=(d, r)), rng.normal(size=(r, k))
W2 = W + (4 / r) * B @ A
print(W.size, B.size + A.size, round(float(np.linalg.norm(W2 - W)), 3))`],
  ["Forward diffusion", "Noise a signal at three levels of ᾱ.", py`
import numpy as np

rng = np.random.default_rng(0)
x0 = np.sin(np.linspace(0, 2 * np.pi, 8))
eps = rng.standard_normal(8)
for ab in (0.99, 0.5, 0.01):
    xt = np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps
    print(ab, round(float(np.corrcoef(x0, xt)[0, 1]), 2))`],
  ["Cost and latency calculator", "Estimate cost and latency of a workload.", py`
requests, tin, tout = 50000, 1500, 300
price_in, price_out, tps, ttft = 3.0, 15.0, 60, 0.7
cost = requests * (tin / 1e6 * price_in + tout / 1e6 * price_out)
latency = ttft + tout / tps
print(round(cost, 1), round(latency, 1))`],
];

export const glance: [string, string][] = [
  ["Tokens", "1 token ≈ 4 characters ≈ 0.75 words · embeddings V × d · cosine = a·b/(‖a‖‖b‖)"],
  ["Attention", "softmax(QKᵀ/√d)V · causal mask −∞ above the diagonal · heads d/h"],
  ["Size", "params ≈ 12 L d² + V d · weights memory = N × bytes · KV cache = 2·L·heads·dim·tokens·bytes"],
  ["Compute", "generate 2N FLOPs/token · train 6N · Chinchilla ≈ 20 tokens/parameter · training memory ≈ 16 B/parameter"],
  ["Training", "loss = −ln p · perplexity = e^loss · lr: warm-up then cosine decay · AdamW"],
  ["Adaptation", "LoRA r(d + k) · int8 q = round(w/s), s = max|w|/127 · KL(teacher‖student) · DPO −ln σ(β·margin)"],
  ["Prompting", "role · task · delimited input · constraints · format · examples · validate output · temperature by task"],
  ["RAG", "chunks = 1 + ⌈(L − size)/(size − overlap)⌉ · RRF Σ 1/(60 + rank) · recall@k · faithfulness"],
  ["Diffusion", "x_t = √ᾱ x₀ + √(1 − ᾱ) ε · loss ‖ε − ε_θ‖² · guidance ε_u + w(ε_c − ε_u) · latent 48× smaller"],
  ["Evaluation", "pass@k = 1 − C(n − c, k)/C(n, k) · κ = (p_o − p_e)/(1 − p_e) · interval 1.96√(p(1 − p)/n)"],
  ["Operations", "cost = tin·pin + tout·pout · latency = TTFT + tokens/speed · requests/min = limit/tokens per request"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable LLM applications", ["Write the evaluation set before polishing the prompt", "Version prompts, models and settings together", "Validate every structured output in code", "Treat retrieved and user text as untrusted", "Track quality, latency and cost per task", "Log failures and add them to the evaluation set"]],
  ["When the answers are wrong", ["Read ten failing examples end to end", "Check what was actually in the prompt (retrieved chunks, history)", "Separate retrieval failures from generation failures", "Try a clearer instruction and one good example", "Lower temperature and require citations", "Only then consider a bigger model or fine-tuning"]],
  ["Explaining your answer in an exam", ["Write the formula, substitute the numbers, compute, interpret", "State units: tokens, bytes, FLOPs, milliseconds", "Name the assumptions (precision, batch size, prices)", "Mention the trade-off: quality, cost, latency, safety"]],
];

export const materials: [string, [string, string][]][] = [
  ["Papers and guides", [["Attention Is All You Need", "https://arxiv.org/abs/1706.03762"], ["Training Compute-Optimal Large Language Models (Chinchilla)", "https://arxiv.org/abs/2203.15556"], ["Denoising Diffusion Probabilistic Models", "https://arxiv.org/abs/2006.11239"], ["LoRA: Low-Rank Adaptation of Large Language Models", "https://arxiv.org/abs/2106.09685"]]],
  ["Documentation and courses", [["Anthropic documentation (Claude)", "https://docs.claude.com/"], ["Hugging Face LLM course", "https://huggingface.co/learn/llm-course"], ["Andrej Karpathy: Neural Networks — Zero to Hero", "https://karpathy.ai/zero-to-hero.html"]]],
];
