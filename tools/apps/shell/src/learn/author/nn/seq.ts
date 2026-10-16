import { P, bars, cells, compare, curve, flow, par, plot, pt, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

const rowflow = (takeaway: string, nodes: string[], notes: string[]) =>
  flow(takeaway, "row", nodes, nodes.slice(1).map((_, i): [number, number] => [i, i + 1]), nodes.slice(1).map((_, i) => i), [`${notes[0] ?? ""} ${notes[1] ?? ""}`.trim(), ...notes.slice(2)]);

export const rnn: ConceptDef[] = [
  {
    t: "What is an RNN? A network with memory",
    lv: 1,
    s: `Order matters: in "The delivery was slow but the food was excellent" the word "but" flips the mood. A {{recurrent neural network}} reads one element at a time and carries a {{hidden state}} — its running memory — to the next step. A feedforward network has a direct path, a CNN shares filters over neighbouring positions, an RNN feeds its own previous state back in. A bag-of-words model cannot represent the order at all.`,
    r: `The same weights process word 1, word 2 and every later word: parameters do not grow with sequence length.`,
    i: `Why is a bag-of-words model unable to tell "dog bites man" from "man bites dog"?`,
    c: py`
a = "dog bites man".split()
b = "man bites dog".split()
print(sorted(a) == sorted(b), a == b)`,
    v: rowflow("An RNN passes memory from step to step.", ["slow", "but", "excellent", "→ sentiment"], [
      "Read 'slow': memory leans negative.",
      "Read 'but': the interpretation begins to flip.",
      "Read 'excellent': memory leans positive.",
      "The final state is used to classify the review.",
    ]),
  },
  {
    t: "Unrolling an RNN through time",
    lv: 1,
    s: `One recurrent neuron computes {{hₜ = tanh(wₓ·xₜ + wₕ·hₜ₋₁ + b)}}: current input plus remembered previous state, squashed to −1…+1. Example weights wₓ = 0.8, wₕ = 0.6, b = 0.1 and h₀ = 0. For inputs x = 1, 0.5, −1, 0.8 the states are h₁ = tanh(0.9) = 0.716, h₂ = tanh(0.8×0.5 + 0.6×0.716 + 0.1) = 0.731, h₃ = −0.256, h₄ = 0.527. Unrolling draws one copy of the neuron per step — all copies share the same three numbers.`,
    r: `The state mixes old and new information in the same few numbers; that is both the strength and the weakness of a plain RNN.`,
    i: `Compute h₁ for x₁ = 1 with the example weights.`,
    c: py`
import numpy as np

wx, wh, b = 0.8, 0.6, 0.1
h = 0.0
for t, x in enumerate([1, 0.5, -1, 0.8], 1):
    h = np.tanh(wx * x + wh * h + b)
    print(t, x, round(float(h), 4))`,
    v: plot("The hidden state h_t for each input in the sequence (chosen x₁ is adjustable).", {
      x: [0, 5], y: [-1, 1], labels: ["time step", "hidden state h"],
      params: [par("x1", "first input x₁", -2, 2, 0.1, 1)],
      readout: ["h₁ = tanh(0.8·{x1} + 0.1) = {tanh(0.8*x1+0.1):3}   h₂ = {tanh(0.8*0.5+0.6*tanh(0.8*x1+0.1)+0.1):3}"],
      steps: [["Positive first word: the state starts high.", { x1: 1 }], ["Negative first word: the state starts low.", { x1: -1 }]],
    }, [pt("1", "tanh(0.8*x1+0.1)", { c: "accent" }), pt("2", "tanh(0.8*0.5+0.6*tanh(0.8*x1+0.1)+0.1)", { c: "accent" })]),
  },
  {
    t: "Sequence shapes: batch, time, features",
    lv: 2,
    s: `Recurrent layers take 3-D input: {{(batch_size, time_steps, features)}}. 32 reviews × 200 tokens × 128 embedding dimensions → (32, 200, 128). SimpleRNN(64) returns (32, 64) when only the final state is wanted (many-to-one: a review → sentiment) and (32, 200, 64) with return_sequences=True (many-to-many: a label each hour, or feeding a second recurrent layer). Encoder–decoder models read a source sequence and generate a different target sequence (translation).`,
    r: `The business question decides the output shape — decide it before choosing layers.`,
    i: `What shape does a SimpleRNN(64) return for a batch of 32×200×128, with and without return_sequences?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(32, 200, 128))
Wx, Wh = rng.normal(0, 0.05, (128, 64)), rng.normal(0, 0.05, (64, 64))
h = np.zeros((32, 64))
states = []
for t in range(200):
    h = np.tanh(x[:, t] @ Wx + h @ Wh)
    states.append(h)
print(h.shape, np.stack(states, axis=1).shape)`,
    v: compare("Which output do you need?", ["Example", "Layer setting"], [
      ["Many → one", "whole review → sentiment", "return_sequences=False → (batch, units)"],
      ["Many → many", "hourly sensor → label per hour", "return_sequences=True → (batch, time, units)"],
      ["Encoder → decoder", "English → French", "two recurrent networks"],
    ]),
  },
  {
    t: "Backpropagation through time and vanishing gradients",
    lv: 2,
    s: `The same weights appear at every step, so the gradient from a late output flows back through every step, multiplying by a factor each time. If that factor is 0.65, then after 5 steps it is 0.116, after 10 steps 0.0135, after 20 steps 0.00018 — early words stop influencing learning ({{vanishing gradients}}). A factor of 1.2 explodes: 1.2²⁰ ≈ 38 ({{exploding gradients}}). Gradient clipping tames explosions but does not by itself give long-term memory. That is why gated networks (LSTM, GRU) exist.`,
    r: `Illustrative constant factor, not a trained model; real factors depend on weights and the activation slopes.`,
    i: `With a per-step factor of 0.65, how much of the gradient survives 10 steps back?`,
    c: py`
for factor in (0.65, 1.0, 1.2):
    print(factor, [round(factor ** n, 5) for n in (1, 5, 10, 20)])`,
    v: plot("Gradient size after n steps back in time for the chosen per-step factor.", {
      x: [0, 20], y: [0, 2], labels: ["steps back", "gradient size"],
      params: [par("f", "step multiplier", 0.5, 1.3, 0.05, 0.65)],
      readout: ["after 10 steps: {pow(f,10):4}   after 20 steps: {pow(f,20):4}"],
      steps: [["0.65: vanishes within a dozen steps.", { f: 0.65 }], ["1.0: stable.", { f: 1 }], ["1.2: explodes.", { f: 1.2 }]],
    }, [curve("pow(f,x)", { c: "bad" }), vline("10", { c: "muted", dash: true })]),
  },
  {
    t: "LSTM: a gated memory cell",
    lv: 2,
    s: `An LSTM adds a cell state c running alongside h, and three sigmoid gates (values 0–1, "how much"): {{forget f}}, {{input i}}, {{output o}}, plus a tanh candidate g. {{cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ gₜ}}, {{hₜ = oₜ ⊙ tanh(cₜ)}}. Example: f = 0.9, i = 0.5, g = 0.6, o = 0.8, previous c = 2.0 → c = 0.9×2.0 + 0.5×0.6 = 2.1 and h = 0.8 × tanh(2.1) = 0.776. Setting f≈1 lets information (and gradient) flow along the cell state almost unchanged — the cure for vanishing gradients. The gates themselves are computed from [hₜ₋₁, xₜ] with learned weights.`,
    r: `Keep the important detail of a long complaint, discard filler phrases: that is what the gates learn.`,
    i: `Compute the new cell state and hidden state for the example gates.`,
    c: py`
import numpy as np

f, i, o, g, c_prev = 0.9, 0.5, 0.8, 0.6, 2.0
c = f * c_prev + i * g
h = o * np.tanh(c)
print(round(c, 3), round(float(h), 4))`,
    v: bars("The cell state after one step for the chosen gates (previous c = 2, candidate g = 0.6).", [["kept memory f·c", "f*2"], ["new write i·g", "i*0.6"], ["new cell c", "f*2+i*0.6"], ["hidden h = o·tanh(c)", "o*tanh(f*2+i*0.6)"]], {
      max: 3,
      params: [par("f", "forget f", 0, 1, 0.05, 0.9), par("i", "input i", 0, 1, 0.05, 0.5), par("o", "output o", 0, 1, 0.05, 0.8)],
      readout: ["c = {f}·2 + {i}·0.6 = {f*2+i*0.6:3}   h = {o}·tanh(c) = {o*tanh(f*2+i*0.6):3}"],
      steps: [["Typical values.", { f: 0.9, i: 0.5, o: 0.8 }], ["f = 0: forget everything.", { f: 0, i: 0.5, o: 0.8 }], ["f = 1, i = 0: perfect copy of the memory.", { f: 1, i: 0, o: 0.8 }]],
    }),
  },
  {
    t: "GRU: fewer gates, one state",
    lv: 2,
    s: `A {{GRU}} merges cell and hidden state into one and uses two gates: {{reset r}} (how much of the old state to use when proposing new content) and {{update z}} (how much of the candidate to blend in). With the convention used here, z scales the candidate: {{hₜ = (1 − z)·hₜ₋₁ + z·h̃ₜ}} (other texts swap z and 1 − z). Example: h₍ₜ₋₁₎ = 0.8, candidate h̃ = 0.716, z = 0.3 → h = 0.7×0.8 + 0.3×0.716 = 0.775. Fewer parameters than an LSTM and often just as accurate.`,
    r: `Check each library's z convention before comparing equations.`,
    i: `Blend h = 0.8 with candidate 0.716 using z = 0.3.`,
    c: py`
h_prev, cand, z = 0.8, 0.716, 0.3
print(round((1 - z) * h_prev + z * cand, 4))
for z in (0.0, 0.5, 1.0):
    print(z, round((1 - z) * h_prev + z * cand, 4))`,
    v: plot("The new state moves from the old state (z = 0) to the candidate (z = 1).", {
      x: [0, 1], y: [0.6, 0.9], labels: ["update gate z", "new state h"],
      params: [par("z", "update gate z", 0, 1, 0.05, 0.3)],
      readout: ["h = (1 − {z})·0.8 + {z}·0.716 = {(1-z)*0.8+z*0.716:3}"],
    }, [curve("(1-x)*0.8+x*0.716", { c: "accent" }), pt("z", "(1-z)*0.8+z*0.716", { c: "warn" })]),
  },
  {
    t: "IMDb sentiment with an LSTM or GRU",
    lv: 2,
    s: `Pipeline: raw review → token IDs → pad to 200 → Embedding(10000, 128, mask_zero) → LSTM(64, return_sequences=True) → LSTM(24) → Dense(1, sigmoid) → probability of "positive". Compile with Adam + binary cross-entropy; keep the final test set isolated, hold out a validation split, and use EarlyStopping(monitor="val_loss", patience=2, restore_best_weights=True). Parameter arithmetic for ONE recurrent layer of 64 units on 128 inputs: SimpleRNN 12,352; LSTM 4× that = 49,408; GRU (Keras default, reset_after) 37,248.`,
    r: `Compare architectures with the same split, length, embedding size, optimiser and training budget.`,
    i: `How many parameters does LSTM(64) have on a 128-dimensional input?`,
    c: py`
units, inputs = 64, 128
simple = units * (inputs + units) + units
lstm = 4 * simple
gru = 3 * (units * (inputs + units) + 2 * units)
print(simple, lstm, gru)
print(10000 * 128)`,
    v: rowflow("From a review to a probability.", ["raw review", "token IDs", "pad to 200", "Embedding 128D", "LSTM / GRU", "Dense sigmoid"], [
      "'really loved it'",
      "[11, 82, 9]",
      "[0, …, 0, 11, 82, 9]",
      "each ID becomes a 128-vector",
      "reads the sequence, keeps a state",
      "probability of positive",
    ]),
  },
  {
    t: "SimpleRNN, LSTM or GRU?",
    lv: 1,
    s: `Choose by data, sequence length, speed and measured validation performance. {{SimpleRNN}}: one recurrent state — a baseline for short patterns. {{LSTM}}: forget/input/output gates and a separate cell state — long dependencies. {{GRU}}: reset and update gates — an efficient gated baseline. Swap the layers (layers.GRU(64, return_sequences=True), layers.GRU(24)) and time training with time.perf_counter(). Overfitting shows as training accuracy rising towards 100% while validation accuracy stalls — read the curves and use early stopping.`,
    r: `Transformers have largely replaced recurrent models for big language tasks, but RNNs remain a clear way to learn sequence ideas.`,
    i: `Why can a simple RNN lose early information?`,
    c: py`
import numpy as np

def keep(step_factor, n):
    return step_factor ** n

print(round(keep(0.65, 20), 6), round(keep(0.98, 20), 3))`,
    v: compare("Recurrent cell types side by side.", ["Mechanism", "Best first use"], [
      ["SimpleRNN", "one recurrent state", "short patterns / baseline"],
      ["LSTM", "forget, input, output gates; cell state", "long dependencies"],
      ["GRU", "reset and update gates; one state", "efficient gated baseline"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const text: ConceptDef[] = [
  {
    t: "Machine translation: encoder and decoder",
    lv: 1,
    s: `Seq2Seq translation uses two recurrent networks: an {{encoder}} reads the source words ("I love cats") into hidden states; a {{decoder}} generates the target ("J'aime les chats") one word at a time, each prediction conditioned on the words already generated and the encoded source. Squeezing the whole source into one fixed-size vector forgets the early words of long sentences. {{Attention}} (Bahdanau, 2014) lets the decoder look back at all encoder states and learn where to focus at each output word.`,
    r: `Teacher forcing during training feeds the true previous word to the decoder; at test time it uses its own predictions.`,
    i: `What problem does attention solve in encoder–decoder translation?`,
    c: py`
source = "i love cats".split()
target = ["j'aime", "les", "chats"]
print(len(source), len(target), "lengths differ")`,
    v: rowflow("Encoder → attention → decoder.", ["I love cats", "RNN encoder", "attention context", "RNN decoder", "J'aime les chats"], [
      "Source sentence.",
      "Hidden state per source word.",
      "Weights say which source words matter now.",
      "Predicts the next target word.",
      "Translated sentence.",
    ]),
  },
  {
    t: "Attention: query, key, value",
    lv: 2,
    s: `Attention combines evidence from several words. The {{query}} asks "what do I need?", the {{keys}} measure how well each word matches, the {{values}} carry the information. {{Attention(Q,K,V) = softmax(QKᵀ/√dₖ)·V}}. Toy: Q = [1,2], K = [2,1] → Q·K = 1×2 + 2×1 = 4; scaled 4/√2 = 2.828. With K = [[2,1],[1,0]] and V = [[1,4],[3,2]]: scores [2.828, 0.707] → softmax weights [0.893, 0.107] → context = 0.893×[1,4] + 0.107×[3,2] = [1.214, 3.786]. The √dₖ keeps the scores from growing with the dimension and saturating the softmax.`,
    r: `Earlier seq2seq attention aligns decoder states with encoder states; Transformer self-attention builds Q, K, V from the same sequence and runs in parallel.`,
    i: `Compute the attention weights for scores [2.828, 0.707].`,
    c: py`
import numpy as np

Q = np.array([[1.0, 2.0]])
K = np.array([[2.0, 1.0], [1.0, 0.0]])
V = np.array([[1.0, 4.0], [3.0, 2.0]])
scores = Q @ K.T / np.sqrt(2)
p = np.exp(scores - scores.max(axis=-1, keepdims=True))
p = p / p.sum(axis=-1, keepdims=True)
print(scores.round(3).tolist(), p.round(3).tolist(), (p @ V).round(3).tolist())`,
    v: bars("Softmax attention weights for four words from adjustable match scores.", [["“I”", "exp(a)/(exp(a)+exp(b)+exp(c)+exp(d))"], ["“really”", "exp(b)/(exp(a)+exp(b)+exp(c)+exp(d))"], ["“love”", "exp(c)/(exp(a)+exp(b)+exp(c)+exp(d))"], ["“Lithuania”", "exp(d)/(exp(a)+exp(b)+exp(c)+exp(d))"]], {
      max: 1,
      params: [par("a", "score: I", -3, 3, 0.5, 0), par("b", "score: really", -3, 3, 0.5, 0), par("c", "score: love", -3, 3, 0.5, 2), par("d", "score: Lithuania", -3, 3, 0.5, 0)],
      readout: ["weights sum to 1; raise a score and the others shrink"],
      steps: [["The decoder is asking about the verb: 'love' wins.", { a: 0, b: 0, c: 2, d: 0 }], ["Equal scores: attention spreads evenly.", { a: 0, b: 0, c: 0, d: 0 }]],
    }),
  },
  {
    t: "Attention matrix and positional encoding",
    lv: 2,
    s: `For every query word, attention gives one row of weights over the key words (rows sum to 1). A row can be identity-like (each word attends to itself), focused on one word ("love"), or spread out. Attention itself has no sense of order, so Transformers add {{positional encodings}} to the token embeddings: PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(…). Token embeddings tell the model WHAT a word is; positional signals tell it WHERE it is. Not every modern Transformer uses this sinusoidal scheme.`,
    r: `Without positional information "dog bites man" and "man bites dog" would look identical to attention.`,
    i: `Why do attention models need positional encoding?`,
    c: py`
import numpy as np

d = 8
pos = np.arange(4)[:, None]
i = np.arange(d // 2)[None, :]
angle = pos / 10000 ** (2 * i / d)
pe = np.zeros((4, d))
pe[:, 0::2], pe[:, 1::2] = np.sin(angle), np.cos(angle)
print(pe[:, :4].round(3).tolist())`,
    v: cells("An illustrative attention matrix: each row is a query word, each row sums to 1.", table(["query ↓ / key →", "I", "love", "cats"], [["I", "0.7", "0.2", "0.1"], ["love", "0.1", "0.6", "0.3"], ["cats", "0.1", "0.3", "0.6"]]), [
      ["Row = which words this query pays attention to."],
      ["Identity-like diagonal: each word mostly attends to itself.", [[1, 1, 1], [2, 2, 2], [3, 3, 3]]],
      ["Off-diagonal weights show relations between words.", [[2, 3, 3], [3, 2, 2]]],
    ]),
  },
  {
    t: "BLEU: scoring translations",
    lv: 2,
    s: `{{BLEU}} compares the n-gram overlap between a machine translation and reference translations and applies a {{brevity penalty}} for outputs that are too short. Simplified unigram precision: candidate with 7 tokens, 5 of them matching → 5/7 = 0.714. Brevity penalty = 1 if the candidate is at least as long as the reference, else exp(1 − r/c). Real BLEU uses several n-gram orders (usually up to 4), clipped counts and corpus-level aggregation, and should be read alongside human inspection of examples.`,
    r: `A high BLEU is not the same as a good translation, and scores are comparable only under the same tokenisation.`,
    i: `Compute unigram precision and brevity penalty for candidate length 6 with 5 matches against a reference of length 8.`,
    c: py`
import math

cand, match, ref = 6, 5, 8
precision = match / cand
bp = 1.0 if cand >= ref else math.exp(1 - ref / cand)
print(round(precision, 4), round(bp, 4), round(bp * precision, 4))`,
    v: bars("Simplified BLEU pieces for the chosen lengths.", [["unigram precision", "m/c"], ["brevity penalty", "min(1,exp(1-r/c))"], ["score", "m/c*min(1,exp(1-r/c))"]], {
      max: 1,
      params: [par("c", "candidate tokens", 2, 12, 1, 6), par("m", "matching tokens", 0, 12, 1, 5), par("r", "reference length", 2, 12, 1, 8)],
      readout: ["precision {m}/{c} = {m/c:3} · penalty {min(1,exp(1-r/c)):3}"],
      steps: [["Short candidate: penalised.", { c: 6, m: 5, r: 8 }], ["Same length as the reference: no penalty.", { c: 8, m: 5, r: 8 }]],
    }),
  },
  {
    t: "Choosing the model family from the goal",
    lv: 1,
    s: `Match the tool to the business goal. Detect defects (normal vs defective photo) → a discriminative classifier. Learn compact features (compress MNIST) → an autoencoder. Generate images (synthetic digits) → a VAE or GAN. Translate a sentence → Seq2Seq with attention or a Transformer. Classify review sentiment → embedding + dense/CNN/RNN. The mixed lecture covers distinct research families: study them as connected but separate ideas.`,
    r: `Order that works well: autoencoder → VAE → attention maths → Seq2Seq → GAN.`,
    i: `Which family fits "create new, realistic handwritten digits"?`,
    c: py`
goal_to_family = {
    "detect defects": "discriminative classifier",
    "compress features": "autoencoder",
    "generate images": "VAE or GAN",
    "translate": "seq2seq attention / transformer",
}
for g, f in goal_to_family.items():
    print(g, "->", f)`,
    v: compare("Goal → model family.", ["Example", "Typical approach"], [
      ["Detect defects", "normal vs defective photo", "discriminative classifier"],
      ["Learn compact features", "compress MNIST", "autoencoder"],
      ["Generate images", "synthetic digits", "VAE or GAN"],
      ["Translate", "English → French", "Seq2Seq attention / Transformer"],
    ]),
  },
];

void [P, cells, table, curve, pt, vline];
