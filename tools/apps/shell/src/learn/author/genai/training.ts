import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- generative-ai`. */

export const train: ConceptDef[] = [
  {
    t: "Pretraining: predict the next token",
    lv: 1,
    s: `Pretraining minimises the cross-entropy of the next token over a huge text corpus: loss = −ln P(true next token | previous tokens), averaged over every position. If the model gives the true word probability 0.25 the loss is 1.386; probability 0.5 → 0.693. A loss of 2.0 corresponds to a perplexity of e² = 7.4 (as unsure as a choice between 7 words), a loss of 3.0 to 20.1. No labels are needed — the text labels itself — which is why training can use the whole web. The skills of an LLM (grammar, facts, reasoning patterns, code) are by-products of getting better at this one prediction.`,
    r: `Pretraining loss predicts general ability well, but not every downstream skill: always evaluate on the tasks you care about.`,
    i: `Convert a loss of 2.0 and 3.0 to perplexity.`,
    c: py`
import numpy as np

for p in (0.25, 0.5, 0.9):
    print(p, round(float(-np.log(p)), 3))
for loss in (2.0, 3.0):
    print(loss, round(float(np.exp(loss)), 1))`,
    v: plot("Cross-entropy loss and perplexity against the probability given to the true token.", {
      x: [0.05, 1], y: [0, 3.2], labels: ["probability of the true token", "loss −ln p"],
      params: [par("p", "probability p", 0.05, 1, 0.05, 0.25)],
      readout: ["p = {p}: loss = {-ln(p):3}, perplexity = {1/p:2}"],
      steps: [["p = 0.25: loss 1.386.", { p: 0.25 }], ["p = 0.9: confident and right.", { p: 0.9 }]],
    }, [curve("-ln(x)", { c: "accent" }), pt("p", "-ln(p)", { c: "bad" })]),
  },
  {
    t: "Scaling laws and the compute budget",
    lv: 2,
    s: `Loss falls smoothly and predictably as parameters N, data D (tokens) and compute C grow — a power law, so each 10× in compute gives a smaller but steady improvement. The Chinchilla study found that for a fixed compute budget models were too big and under-trained: the best ratio is about {{20 training tokens per parameter}}. A 70 B model wants ≈ 1.4 T tokens. Training compute ≈ 6 N D FLOPs: 6 × 7×10¹⁰ × 1.4×10¹² = 5.9×10²³. Since inference cost scales with N while training cost is paid once, today's models are often trained on far more than 20 tokens per parameter to make a smaller model that is cheap to serve.`,
    r: `Scaling laws help plan experiments: train small models, fit the curve, then predict the large one.`,
    i: `How many tokens does a 70 B-parameter model need at 20 tokens per parameter, and how many FLOPs does it take to train?`,
    c: py`
N = 70e9
D = 20 * N
print(D / 1e12, "T tokens")
print(f"{6 * N * D:.2e} FLOPs")
gpu = 3e14 * 0.4
print(round(6 * N * D / gpu / 86400 / 1000), "days on 1000 GPUs at 40% utilisation")`,
    v: plot("Compute-optimal training tokens against model size (20 tokens per parameter).", {
      x: [0, 100], y: [0, 2200], labels: ["parameters (billions)", "tokens (billions)"],
      params: [par("r", "tokens per parameter", 5, 200, 5, 20)],
      readout: ["70 B parameters → {70*r} B tokens"],
      steps: [["Chinchilla ratio: 20 tokens per parameter.", { r: 20 }], ["Over-trained small model: 200 tokens per parameter.", { r: 200 }]],
    }, [curve("x*r", { c: "accent" })]),
  },
  {
    t: "Training data: quality beats quantity",
    lv: 1,
    s: `Web text is the raw material, but raw crawls are noisy. The recipe: {{filter}} (language, quality classifiers, remove boilerplate and toxic or personal data), {{deduplicate}} (exact and near-duplicate removal — repeated text is memorised and wastes compute), {{mix}} sources deliberately (web, books, code, maths, multilingual) and {{decontaminate}} (remove benchmark questions so evaluation is honest). Code and mathematics improve reasoning even for non-code tasks. Licensing, consent and privacy of the data are legal and ethical questions; document the sources. A smaller, cleaner corpus often beats a larger noisy one.`,
    r: `If the model repeats a rare string from training verbatim, that is memorisation: another reason to deduplicate and filter personal data.`,
    i: `Name four steps in preparing a pretraining corpus and what each prevents.`,
    c: py`
docs = ["the cat sat", "the cat sat", "buy now!!! click here", "A thorough guide to tides", "the cat sat "]
norm = lambda s: " ".join(s.lower().split())
seen, kept = set(), []
for d in docs:
    n = norm(d)
    if n not in seen and "!!!" not in d:
        seen.add(n)
        kept.append(d)
print(len(docs), "->", len(kept), kept)`,
    v: rowflow("Preparing a pretraining corpus.", ["Crawl", "Filter quality + language", "Deduplicate", "Mix sources", "Remove benchmark leaks", "Tokenize"], [
      "Billions of web pages and documents.",
      "Remove spam, boilerplate, toxic and personal data.",
      "Delete exact and near-duplicate text.",
      "Balance web, books, code, maths, languages.",
      "Keep evaluation questions out of the training set.",
      "Convert to token ids.",
    ]),
  },
  {
    t: "Optimisation: AdamW, warm-up and cosine decay",
    lv: 2,
    s: `LLMs are trained with {{AdamW}} (Adam with decoupled weight decay) at a learning rate that follows a schedule: a short linear {{warm-up}} (e.g. 1,000 steps from 0 to 3×10⁻⁴) because early updates are unreliable, then a {{cosine decay}} towards a small value: lr(t) = lr_max · ½(1 + cos(π (t − t_w)/(T − t_w))). With lr_max = 3×10⁻⁴, warm-up 1,000, total 10,000: lr(100) = 3×10⁻⁵, lr(1,000) = 3×10⁻⁴, lr(5,000) = 1.76×10⁻⁴, lr(10,000) = 0. Gradient clipping (norm ≤ 1) tames loss spikes. Batches are huge (millions of tokens), assembled by gradient accumulation across many GPUs.`,
    r: `Loss spikes are normal at scale: keep checkpoints, and be ready to restart from before a spike with a lower learning rate.`,
    i: `Compute the learning rate at step 5,000 for the schedule above.`,
    c: py`
import numpy as np

def lr(step, peak=3e-4, warm=1000, total=10000):
    if step < warm:
        return peak * step / warm
    return peak * 0.5 * (1 + np.cos(np.pi * (step - warm) / (total - warm)))

print([round(float(lr(s)), 6) for s in (0, 100, 1000, 5000, 10000)])`,
    v: plot("Learning-rate schedule: linear warm-up then cosine decay.", {
      x: [0, 10000], y: [0, 0.00035], labels: ["step", "learning rate"],
      params: [par("w", "warm-up steps", 100, 3000, 100, 1000)],
      readout: ["peak 3×10⁻⁴ reached at step {w}, then a smooth decay to 0 at step 10,000"],
    }, [curve("step(w-x)*0.0003*x/w+(1-step(w-x))*0.0003*0.5*(1+cos(3.14159265*(x-w)/(10000-w)))", { c: "accent" })]),
  },
  {
    t: "Memory for training: bytes per parameter",
    lv: 2,
    s: `Training needs far more memory than the weights alone. With mixed precision and Adam, each parameter costs about 16 bytes: 2 (16-bit weights) + 2 (16-bit gradients) + 4 (32-bit master weights) + 4 + 4 (Adam's two moment estimates). A 7 B model therefore needs 7×10⁹ × 16 ≈ 112 GB before counting activations — more than one 80 GB GPU, so the state is sharded across GPUs (ZeRO / FSDP), activations are recomputed instead of stored (checkpointing), and tensors are split across devices (tensor and pipeline parallelism). Inference needs only the weights (2 bytes each in 16-bit: 14 GB for 7 B) plus the KV cache.`,
    r: `Rule of thumb: fine-tuning a full model needs ≈ 16 bytes × parameters; LoRA and quantisation shrink that dramatically.`,
    i: `How much memory does full Adam training of a 7 B model need, and how much does inference need?`,
    c: py`
per_param = 2 + 2 + 4 + 4 + 4
N = 7e9
print(per_param, N * per_param / 1e9, "GB training state")
print(N * 2 / 1e9, "GB weights in 16-bit,", N * 0.5 / 1e9, "GB in 4-bit")`,
    v: bars("Memory per parameter during mixed-precision Adam training (bytes).", [["16-bit weights", "2"], ["16-bit gradients", "2"], ["32-bit master weights", "4"], ["Adam moment 1", "4"], ["Adam moment 2", "4"]], {
      max: 5,
    }),
  },
  {
    t: "Emergent abilities and in-context learning",
    lv: 1,
    s: `Larger, longer-trained models show abilities absent in small ones. {{In-context learning}}: shown a few examples in the prompt, the model performs a new task without any weight update — a form of learning at inference time. Instruction following, multi-step reasoning and code synthesis also improve sharply with scale. Some apparent "jumps" are artefacts of all-or-nothing metrics: measured by a smoother score the improvement is gradual. The practical consequence: much can be done by prompting, and capability must be measured on your task rather than inferred from size.`,
    r: `Bigger is not always better: a smaller model fine-tuned or prompted well can beat a general giant on a narrow task at a fraction of the cost.`,
    i: `What is in-context learning and why is it surprising?`,
    c: py`
examples = [("great film", "positive"), ("dull and slow", "negative")]
query = "a wonderful surprise"
prompt = "".join(f"Review: {t}\nSentiment: {l}\n\n" for t, l in examples) + f"Review: {query}\nSentiment:"
print(prompt)`,
    v: compare("Three ways a model can learn a task.", ["Weights change?", "Data needed"], [
      ["Pretraining", "yes", "trillions of tokens"],
      ["Fine-tuning", "yes", "hundreds–thousands of examples"],
      ["In-context learning", "no", "a few examples in the prompt"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const adapt: ConceptDef[] = [
  {
    t: "Prompting, RAG or fine-tuning?",
    lv: 1,
    s: `Three levers adapt a model, from cheap to costly. {{Prompting}}: change the instructions and examples — minutes, no data, fully reversible. {{Retrieval (RAG)}}: give the model relevant documents at question time — adds fresh and private knowledge, with citations. {{Fine-tuning}}: change the weights on your examples — teaches style, format, domain skills and reduces prompt length, but does not reliably add facts and needs data and upkeep. Order of attack: prompt first, add retrieval if the model lacks knowledge, fine-tune if behaviour or cost must change. Many systems combine all three.`,
    r: `Fine-tuning for facts is a common mistake: facts change and models forget; retrieve them instead.`,
    i: `The model does not know your company's 2025 policies. Which lever do you pull first?`,
    c: py`
needs = {
    "unknown or changing facts": "RAG",
    "output style / format": "prompting, then fine-tuning",
    "domain skill, short prompts, low cost": "fine-tuning a small model",
    "quick prototype": "prompting",
}
for k, v in needs.items():
    print(f"{k:38s} -> {v}")`,
    v: compare("Choosing how to adapt a model.", ["Adds", "Cost"], [
      ["Prompting", "instructions and examples", "lowest"],
      ["RAG", "current and private knowledge", "medium: index and search"],
      ["Fine-tuning", "style, format, specialised skill", "high: data, training, upkeep"],
    ]),
  },
  {
    t: "Supervised fine-tuning for instructions",
    lv: 2,
    s: `A pretrained model continues text; to make it an assistant, train on (instruction, ideal response) pairs — {{supervised fine-tuning (SFT)}}. The loss is the usual next-token cross-entropy, but computed only on the response tokens (the prompt is masked). A few thousand high-quality, diverse examples already change behaviour dramatically; quality matters far more than quantity. Typical data: human-written answers, curated public sets, or model-generated answers filtered for quality. Hold out an evaluation set, train for 1–3 epochs at a small learning rate (10⁻⁵) and watch for the model forgetting general skills.`,
    r: `Template exactly the same chat format (special tokens for roles) at training and inference.`,
    i: `Why is the loss computed only on the response tokens?`,
    c: py`
import numpy as np

tokens = ["<user>", "What", "is", "2+2", "?", "<assistant>", "It", "is", "4", "."]
is_response = np.array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1])
nll = np.array([2.1, 1.9, 1.2, 3.0, 0.8, 1.0, 0.9, 0.4, 0.3, 0.2])
print(float((nll * is_response).sum() / is_response.sum()), float(nll.mean()))`,
    v: cells("Loss mask: only the response tokens contribute to the training loss.", [P("token", ["<user>", "What", "is", "2+2", "?", "<assistant>", "It", "is", "4", "."]), P("in loss?", ["no", "no", "no", "no", "no", "no", "yes", "yes", "yes", "yes"])], [
      ["The prompt is given; the model is trained to produce the answer."],
      ["Prompt tokens are masked out.", [[1, 0, 5]]],
      ["Response tokens are scored.", [[1, 6, 9]]],
    ]),
  },
  {
    t: "LoRA: low-rank adapters",
    lv: 2,
    s: `Updating all weights is expensive. {{LoRA}} freezes the pretrained matrix W (d × k) and learns a low-rank update ΔW = B A with B (d × r) and A (r × k), r ≪ d. Only A and B are trained: r(d + k) parameters instead of d·k. For d = k = 4,096 and r = 8: 2 × 4,096 × 8 = 65,536 trainable parameters instead of 16,777,216 — 0.39%. Applied to the attention projections of a 7 B model this means a few million trainable weights, one adapter file of tens of MB per task, and fine-tuning on a single GPU. At inference the update can be merged: W′ = W + (α/r) B A. {{QLoRA}} adds a 4-bit quantised base model.`,
    r: `Typical ranks are 8–64; raise r if the adapter underfits the task.`,
    i: `Compute the LoRA parameter count and fraction for d = k = 4096 and r = 8.`,
    c: py`
import numpy as np

d, k, r = 4096, 4096, 8
print(r * (d + k), d * k, round(r * (d + k) / (d * k) * 100, 3))
rng = np.random.default_rng(0)
W = rng.normal(size=(6, 6))
B, A = rng.normal(size=(6, 2)), rng.normal(size=(2, 6))
print(int(np.linalg.matrix_rank(B @ A)), (W + B @ A).shape)`,
    v: bars("Trainable parameters per matrix (thousands) for d = k = 4096.", [["full fine-tuning", "4096*4096/1000"], ["LoRA", "r*(4096+4096)/1000"]], {
      max: 17000,
      params: [par("r", "rank r", 1, 128, 1, 8)],
      readout: ["r = {r}: {r*8192} parameters = {r*8192/16777216*100:2}% of {4096*4096}"],
      steps: [["r = 8: 0.39%.", { r: 8 }], ["r = 64: still only 3.1%.", { r: 64 }]],
    }),
  },
  {
    t: "Quantisation: smaller numbers, smaller models",
    lv: 2,
    s: `Weights stored in 16 bits can often be stored in 8 or 4 bits with little loss. Symmetric {{int8 quantisation}}: scale s = max|w|/127, q = round(w/s), reconstruction ŵ = q·s. For w = (0.5, −1.2, 0.03, 0.9): s = 0.00945, q = (53, −127, 3, 95), ŵ = (0.5008, −1.2, 0.0283, 0.8976) — error at most 0.0024, but the tiny weight 0.03 has the largest relative error. Memory falls from 2 bytes to 1 (int8) or 0.5 (4-bit) per weight: a 70 B model goes from 140 GB to 35 GB. Per-group scales and outlier handling keep 4-bit accuracy acceptable; activations and the KV cache can be quantised too.`,
    r: `Always evaluate the quantised model on your task: small average error can still break rare, important behaviours.`,
    i: `Quantise (0.5, −1.2, 0.03, 0.9) to int8 and find the largest reconstruction error.`,
    c: py`
import numpy as np

w = np.array([0.5, -1.2, 0.03, 0.9])
s = np.abs(w).max() / 127
q = np.round(w / s).astype(int)
print(round(float(s), 5), q.tolist(), (q * s).round(4).tolist(), round(float(np.abs(q * s - w).max()), 4))
for bits, name in ((16, "fp16"), (8, "int8"), (4, "int4")):
    print(name, 70e9 * bits / 8 / 1e9, "GB for 70B")`,
    v: bars("Memory of a 70 B model (GB) at each precision.", [["16-bit", "140"], ["8-bit", "70"], ["4-bit", "35"]], {
      max: 150,
    }),
  },
  {
    t: "Distillation: a small student from a large teacher",
    lv: 2,
    s: `{{Distillation}} trains a small {{student}} to imitate a large {{teacher}}. Instead of one-hot labels the student matches the teacher's full output distribution, which carries more information ("dark knowledge": this is 70% cat, 25% dog, 5% car). The loss is the KL divergence between the teacher's and student's temperature-softened distributions. For teacher (0.7, 0.25, 0.05) and student (0.5, 0.4, 0.1): KL = 0.7 ln(0.7/0.5) + 0.25 ln(0.25/0.4) + 0.05 ln(0.05/0.1) = 0.0834. Modern practice also uses teacher-generated text as training data for the student. Result: much cheaper inference at a modest quality loss.`,
    r: `Check the teacher's licence: some forbid training competing models on their outputs.`,
    i: `Compute KL(teacher ‖ student) for the two distributions above.`,
    c: py`
import numpy as np

t = np.array([0.7, 0.25, 0.05])
s = np.array([0.5, 0.4, 0.1])
print(round(float((t * np.log(t / s)).sum()), 4))
def soft(z, T):
    e = np.exp(np.array(z) / T)
    return (e / e.sum()).round(3).tolist()
print(soft([3, 1, 0], 1), soft([3, 1, 0], 3))`,
    v: bars("Teacher and student probabilities; KL measures their mismatch.", [["teacher: cat", "0.7"], ["student: cat", "s1"], ["teacher: dog", "0.25"], ["student: dog", "0.9-s1"]], {
      max: 1,
      params: [par("s1", "student P(cat)", 0.1, 0.8, 0.05, 0.5)],
      readout: ["KL = 0.7·ln(0.7/{s1}) + 0.25·ln(0.25/{0.9-s1}) + 0.05·ln(0.05/0.1) = {0.7*ln(0.7/s1)+0.25*ln(0.25/(0.9-s1))+0.05*ln(0.5):3}"],
      steps: [["Student (0.5, 0.4, 0.1): KL 0.083.", { s1: 0.5 }], ["Student matching the teacher: KL 0.", { s1: 0.7 }]],
    }),
  },
  {
    t: "Preference tuning: RLHF and DPO",
    lv: 2,
    s: `After SFT, models are aligned with human preferences using pairs (chosen answer, rejected answer). {{RLHF}} trains a reward model on the pairs and optimises the policy against it with PPO under a KL penalty to the SFT model. {{DPO}} skips the reward model and RL loop: it directly raises the probability of the chosen answer relative to the rejected one, measured against a frozen reference model. Loss = −ln σ(β[(ln π(y_w) − ln π_ref(y_w)) − (ln π(y_l) − ln π_ref(y_l))]). With log-ratios +2 for the chosen and −2 for the rejected answer and β = 0.1: margin 4 → loss = −ln σ(0.4) = 0.513; at margin 0 the loss is 0.693; at margin −4 it is 0.913.`,
    r: `Preference data encodes what annotators prefer: write clear guidelines and check for biases such as favouring longer answers.`,
    i: `Compute the DPO loss for chosen log-ratio +2, rejected log-ratio −2, β = 0.1.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
beta = 0.1
for chosen, rejected in ((2.0, -2.0), (0.0, 0.0), (-2.0, 2.0)):
    margin = chosen - rejected
    print(margin, round(float(-np.log(sigmoid(beta * margin))), 3))`,
    v: plot("DPO loss against the margin between the chosen and rejected log-ratios (β = 0.1).", {
      x: [-20, 20], y: [0, 2.5], labels: ["margin", "loss −ln σ(β·margin)"],
      params: [par("b", "β", 0.05, 1, 0.05, 0.1)],
      readout: ["margin 4 → loss {-ln(sigmoid(b*4)):3}; margin −4 → {-ln(sigmoid(-b*4)):3}"],
      steps: [["β = 0.1: gentle slope.", { b: 0.1 }], ["β = 0.5: sharper, stronger preference signal.", { b: 0.5 }]],
    }, [curve("-ln(sigmoid(b*x))", { c: "accent" })]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
