import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

export const fit: ConceptDef[] = [
  {
    t: "Underfitting, good fit and overfitting",
    lv: 1,
    s: `A network is judged on {{new examples}}, not on the ones it trained on. {{Underfitting}}: the model is too simple, so training AND validation error are both high. {{Good fit}}: it captures the real trend. {{Overfitting}}: it reproduces training noise — training error keeps falling while validation error rises. Think of a student who memorised 100 practice answers but fails an unfamiliar question. Delivery times are noisy (traffic lights, weather), so a curve that threads every training dot will miss on a brand-new trip.`,
    r: `A complicated curve is not automatically better. Ask: would it also predict a brand-new delivery correctly?`,
    i: `What distinguishes overfitting from underfitting in terms of training and validation error?`,
    c: py`
import numpy as np

rng = np.random.default_rng(1)
x = np.linspace(0, 1, 12)
y = 3 * x + rng.normal(0, 0.15, 12)
xv = np.linspace(0.04, 0.96, 12)
yv = 3 * xv + rng.normal(0, 0.15, 12)
for degree in (0, 1, 9):
    coef = np.polyfit(x, y, degree)
    mse = lambda a, b: float(np.mean((np.polyval(coef, a) - b) ** 2))
    print(degree, round(mse(x, y), 4), round(mse(xv, yv), 4))`,
    v: compare("Three outcomes of training, by how they behave on seen and unseen data.", ["Training error", "Validation error", "Typical cure"], [
      ["Underfitting", "high", "high", "more capacity, better features, train longer"],
      ["Good fit", "low", "low (close to training)", "confirm on the untouched test set"],
      ["Overfitting", "very low", "high or rising", "regularize, more data, early stopping"],
    ]),
  },
  {
    t: "L1 and L2: a price tag on large weights",
    lv: 2,
    s: `Regularization adds a penalty for large weights to the loss, so the optimiser must trade fit against simplicity. {{L1}}: loss + λΣ|wᵢ| (absolute values; it can push weights exactly to zero — sparse). {{L2}}: loss + λΣwᵢ² (squares; it shrinks large weights hard but keeps most features alive). {{Elastic Net}}: λ[αΣ|wᵢ| + (1−α)Σwᵢ²] with α = 1 meaning pure L1 here (conventions differ between libraries). For w = 2 and λ = 0.2: L1 = 0.4, L2 = 0.8. Neither penalises a weight of zero. Note: the L1 formula needs |w|; a plain signed sum would reward negative weights.`,
    r: `Scale features before comparing penalties; regularization does not guarantee fairness or causal relevance.`,
    i: `Compute the L1 and L2 penalty for w = 2 and λ = 0.2.`,
    c: py`
import numpy as np

w, lam, alpha = 2.0, 0.2, 0.5
l1 = lam * abs(w)
l2 = lam * w ** 2
elastic = lam * (alpha * abs(w) + (1 - alpha) * w ** 2)
print(l1, l2, round(elastic, 2))
weights = np.array([0.5, -2.0, 0.0, 3.0])
print(round(float(lam * np.abs(weights).sum()), 2), round(float(lam * (weights ** 2).sum()), 2))`,
    v: plot("Penalty against the weight: L1 is a V, L2 a bowl. The dots show the chosen weight.", {
      x: [-3, 3], y: [0, 2], labels: ["weight w", "penalty"],
      params: [par("w", "weight w", -3, 3, 0.1, 2), par("lam", "strength λ", 0.05, 0.5, 0.05, 0.2), par("al", "L1 share α", 0, 1, 0.1, 0.5)],
      readout: ["L1 = {lam*abs(w):2}   L2 = {lam*w^2:2}   Elastic = {lam*(al*abs(w)+(1-al)*w^2):2}"],
      steps: [["w = 2, λ = 0.2: L1 0.4, L2 0.8.", { w: 2, lam: 0.2 }], ["w = 0.5: L2 almost vanishes (0.05) while L1 keeps pulling (0.1).", { w: 0.5, lam: 0.2 }]],
    }, [curve("lam*abs(x)", { c: "info" }), curve("lam*x^2", { c: "bad" }), curve("lam*(al*abs(x)+(1-al)*x^2)", { c: "good" }), pt("w", "lam*abs(w)", { c: "info" }), pt("w", "lam*w^2", { c: "bad" })]),
  },
  {
    t: "Weight decay: what L2 does to a weight",
    lv: 2,
    s: `Add L2 to the loss and the gradient picks up an extra 2λw. Each update becomes {{w ← w − η(g + 2λw)}} = w(1 − 2ηλ) − ηg: the weight is first multiplied by a number slightly below 1 ("decay") and then moved by the data gradient. Starting from w = 2 with no data gradient, η = 0.1 and λ = 0.5, the factor is 0.9 and the weight goes 2 → 1.8 → 1.62 → 1.458…: it fades towards zero unless the data keep pushing back.`,
    r: `With plain SGD, L2 and weight decay coincide; with adaptive optimisers like Adam they are not identical, so libraries offer a separate decoupled weight decay.`,
    i: `With η = 0.1 and λ = 0.5, by what factor does one L2 update shrink a weight when the data gradient is zero?`,
    c: py`
w, lr, lam = 2.0, 0.1, 0.5
path = [w]
for _ in range(5):
    w = w - lr * (0 + 2 * lam * w)
    path.append(round(w, 4))
print(path, 1 - 2 * lr * lam)`,
    v: plot("The weight after each step when only the penalty acts.", {
      x: [0, 12], y: [0, 2.2], labels: ["step", "weight"],
      params: [par("lam", "strength λ", 0, 1.5, 0.1, 0.5)],
      readout: ["decay factor per step = 1 − 2·0.1·{lam} = {1-0.2*lam:3}"],
      steps: [["λ = 0.5: gentle shrinking.", { lam: 0.5 }], ["λ = 1.5: fast decay.", { lam: 1.5 }]],
    }, [curve("2*pow(1-0.2*lam,x)", { c: "accent" }), ...Array.from({ length: 13 }, (_, i) => pt(String(i), `2*pow(1-0.2*lam,${i})`, { c: "warn" }))]),
  },
  {
    t: "Early stopping and the best epoch",
    lv: 1,
    s: `Training longer is not always better. Plot loss against epoch: the training loss keeps falling, but the validation loss reaches a minimum and then climbs as the network starts memorising noise. {{Early stopping}} watches the validation loss, saves the weights whenever it improves, stops after {{patience}} epochs without improvement, and restores the BEST weights, not the last. In Keras: EarlyStopping(monitor="val_loss", patience=3, restore_best_weights=True). Real curves wiggle, so patience and a minimum improvement threshold matter.`,
    r: `The validation set guides this decision, so the final honest number must come from an untouched test set.`,
    i: `Which epoch's weights should early stopping restore, and why?`,
    c: py`
import numpy as np

epochs = np.arange(1, 21)
train = 1.0 / epochs ** 0.7
val = train + 0.003 * (epochs - 8) ** 2 * (epochs > 8) + 0.05
best = int(epochs[np.argmin(val)])
patience, wait, best_val, stop = 3, 0, 9.9, None
for e, v in zip(epochs, val):
    if v < best_val - 1e-4:
        best_val, wait = v, 0
    else:
        wait += 1
        if wait >= patience:
            stop = int(e)
            break
print(best, stop)`,
    v: plot("Synthetic curves: training loss keeps falling; validation loss bottoms out at epoch 10 and then climbs.", {
      x: [0, 21], y: [0, 1.2], labels: ["epoch", "loss"],
      params: [par("e", "inspect epoch", 1, 20, 1, 10)],
      readout: ["epoch {e}: gap between validation and training = {(1/pow(e,0.7)+0.05+0.003*pow(e-8,2)*step(e-8)) - 1/pow(e,0.7):3}"],
      steps: [["Epoch 10: validation loss is at its lowest — the model to keep.", { e: 10 }], ["Epoch 18: training looks better, but validation is worse.", { e: 18 }]],
    }, [curve("1/pow(x,0.7)", { c: "info" }), curve("1/pow(x,0.7)+0.05+0.003*pow(x-8,2)*step(x-8)", { c: "bad" }), vline("10", { c: "good", dash: true }), vline("e", { c: "muted" })]),
  },
  {
    t: "Dropout: practising with random absences",
    lv: 1,
    s: `During training, {{dropout}} hides each hidden activation with probability p, so neurons cannot lean on one another (like a medical team that must cope when specialists are missing). To keep the average signal unchanged, the survivors are scaled up — {{inverted dropout}}: keep probability q = 1 − p, output = mask × activation / q. For p = 0.25, q = 0.75 and a surviving activation is multiplied by 1/0.75 ≈ 1.333. In evaluation mode dropout is switched OFF. The expected value matches across many masks, but a single pass need not.`,
    r: `Keras: Dropout(0.3) is active in model.fit and inactive in model.predict. Forgetting to switch to evaluation mode is a classic bug.`,
    i: `Why are surviving activations multiplied by 1/(1−p)?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
a = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
p = 0.25
q = 1 - p
mask = rng.random(a.size) < q
print(mask.astype(int).tolist(), round(1 / q, 3))
print((mask * a / q).round(2).tolist())
means = [float((((rng.random(a.size) < q) * a) / q).sum()) for _ in range(20000)]
print(round(float(np.mean(means)), 2), float(a.sum()))`,
    v: bars("Training output of a hidden unit whose activation is 1: dropped → 0, survivors scaled by 1/(1−p); the average stays 1.", [["a surviving unit (activation 1) is scaled to", "1/(1-p)"], ["a dropped unit outputs", "0"], ["expected output over many masks", "(1-p)*(1/(1-p))"]], {
      max: 6,
      params: [par("p", "dropout rate p", 0, 0.8, 0.05, 0.25)],
      readout: ["keep probability q = {1-p:2}   →   a surviving activation is multiplied by 1/q = {1/(1-p):3}"],
      steps: [["p = 0.25: survivors ×1.333.", { p: 0.25 }], ["p = 0.5: survivors ×2.", { p: 0.5 }]],
    }),
  },
  {
    t: "Batch normalization, step by step",
    lv: 2,
    s: `A layer's activations can have wildly different scales. {{BatchNorm}} standardises each feature over the mini-batch and then lets the network re-scale it: μ = mean(x), σ² = mean((x−μ)²), x̂ = (x−μ)/√(σ²+ε), y = γx̂ + β, with γ, β learnable. Four activations 2, 4, 6, 8: μ = 5, σ² = 5, x̂ = −1.342, −0.447, 0.447, 1.342. With γ = 1, β = 0 these are the outputs; changing γ and β lets the network undo the normalisation if that helps. In inference, running statistics from training replace the batch statistics.`,
    r: `BatchNorm of hidden activations is not the same as z-scoring the input data, and it behaves differently in train and eval modes.`,
    i: `Normalise the activations 2, 4, 6, 8.`,
    c: py`
import numpy as np

x = np.array([2.0, 4.0, 6.0, 8.0])
mu, var, eps = x.mean(), x.var(), 1e-5
xhat = (x - mu) / np.sqrt(var + eps)
gamma, beta = 1.5, 0.2
print(mu, var, xhat.round(3).tolist(), (gamma * xhat + beta).round(3).tolist())`,
    v: bars("Normalised outputs y = γ·x̂ + β for the four activations 2, 4, 6, 8.", [["A (2)", "g*(-1.3416)+bt"], ["B (4)", "g*(-0.4472)+bt"], ["C (6)", "g*(0.4472)+bt"], ["D (8)", "g*(1.3416)+bt"]], {
      max: 4,
      params: [par("g", "scale γ", 0.2, 2, 0.1, 1), par("bt", "shift β", -1, 1, 0.1, 0)],
      readout: ["μ = 5, σ² = 5;  outputs = γ·x̂ + β with γ = {g}, β = {bt}"],
      steps: [["γ = 1, β = 0: plain standardisation (mean 0, variance 1).", { g: 1, bt: 0 }], ["γ = 2: spread widens; β shifts everything.", { g: 2, bt: 0.5 }]],
    }),
  },
  {
    t: "Reading training curves like an engineer",
    lv: 1,
    s: `Learning curves tell you what to change next. {{Healthy}}: both losses fall and stay close. {{Overfitting}}: training keeps falling, validation turns up → regularize, add data, stop earlier. {{Underfitting}}: both stay high → bigger model, better features, train longer. {{Learning rate too high}}: the loss oscillates or explodes → lower η, scale inputs, clip gradients. A learning curve plots loss against epoch; a loss landscape plots loss against weights — different things. Validation need not sit above training (dropout and augmentation can reverse it), so read trends, not one rule.`,
    r: `Accuracy alone can mislead on imbalanced data — also read the confusion matrix, precision, recall and F1.`,
    i: `Training loss 0.05 and validation loss 0.62 and rising. Diagnosis and two remedies?`,
    c: py`
import numpy as np

def diagnose(train, val):
    if not np.all(np.isfinite(val)) or val[-1] > 5 * val[0]:
        return "unstable: lower the learning rate"
    if val[-1] > min(val) + 0.1 and val[-1] - train[-1] > 0.3:
        return "overfitting"
    if train[-1] > 0.5:
        return "underfitting"
    return "healthy"

e = np.arange(1, 31)
print(diagnose(1 / e, 1 / e + 0.02))
print(diagnose(1 / e, 1 / e + 0.01 * np.maximum(0, e - 10) ** 1.3 + 0.05))
print(diagnose(0.8 + 0 * e, 0.82 + 0 * e))
print(diagnose(1.5 ** e, 1.5 ** e))`,
    v: compare("What each curve pattern means and what to try.", ["Meaning", "Possible actions"], [
      ["Both losses high", "underfitting / optimisation trouble", "more capacity, features, train longer, tune η"],
      ["Train low, validation high or rising", "overfitting", "early stopping, more data, regularization, simpler model"],
      ["Both low and stable", "good fit so far", "confirm on the test set"],
      ["Loss oscillates or diverges", "unstable optimisation", "lower η, normalise inputs, clip gradients"],
    ]),
  },
  {
    t: "Validation methods: who trains and who tests",
    lv: 1,
    s: `Training data fits the weights, {{validation data}} chooses settings (epochs, λ, architecture), and a separate {{test set}} gives one honest final number. Strategies: {{hold-out}} (one split), {{K-fold}} (each fold validates once), {{stratified K-fold}} (keeps class ratios — vital if 90% of reviews are positive), {{ShuffleSplit}}, {{leave-one-out}} and {{leave-p-out}} (exhaustive, costly) and {{time-series splits}} (always train on the past, validate on the future, never shuffle). K-fold works for networks but costs K trainings.`,
    r: `Repeated tuning on validation results slowly overfits the validation set — that is why a final test set exists. Keras validation_split takes the LAST fraction of the arrays, so shuffle first.`,
    i: `When must you use a time-ordered split instead of random K-fold?`,
    c: py`
import numpy as np

n, k = 10, 5
idx = np.arange(n)
for fold in range(k):
    val = idx[fold * 2:(fold + 1) * 2]
    train = np.setdiff1d(idx, val)
    print(fold + 1, train.tolist(), val.tolist())
print("leave-one-out trainings:", n, "  leave-2-out:", len(list(__import__("itertools").combinations(idx, 2))))`,
    v: cells("5-fold cross-validation on 10 records: every record validates exactly once.", [P("fold 1", ["V", "V", "T", "T", "T", "T", "T", "T", "T", "T"]), P("fold 2", ["T", "T", "V", "V", "T", "T", "T", "T", "T", "T"]), P("fold 3", ["T", "T", "T", "T", "V", "V", "T", "T", "T", "T"]), P("fold 4", ["T", "T", "T", "T", "T", "T", "V", "V", "T", "T"]), P("fold 5", ["T", "T", "T", "T", "T", "T", "T", "T", "V", "V"])], [
      ["T = train, V = validation. Average the five validation scores."],
      ["Fold 1 validates on records 1–2.", [[0, 0, 1]]],
      ["Fold 3 validates on records 5–6.", [[2, 4, 5]]],
      ["Fold 5 validates on records 9–10.", [[4, 8, 9]]],
    ]),
  },
  {
    t: "Data leakage: the silent cheater",
    lv: 2,
    s: `Leakage means information from validation or test data sneaks into training, making results look better than they will be. Fit the vocabulary, the scaler, the normalisation and any feature selection on the TRAINING split only, then apply them to the rest. If one user wrote several similar reviews, split by user. Example: scaling with the mean of ALL values shifts the test inputs using test information; the honest way uses the training mean only.`,
    r: `A suspiciously high validation score is often a leak, not a breakthrough.`,
    i: `Why must the scaler be fitted on the training split only?`,
    c: py`
import numpy as np

data = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 100.0])
train, test = data[:8], data[8:]
leak_mean = data.mean()
honest_mean = train.mean()
print(round(float(leak_mean), 2), round(float(honest_mean), 2))
print((test - honest_mean).round(2).tolist(), (test - leak_mean).round(2).tolist())`,
    v: compare("Honest versus leaking preprocessing.", ["Honest", "Leaking"], [
      ["Scaler / normalisation", "fit on train, apply to test", "fit on all data"],
      ["Vocabulary", "built from train reviews", "built from all reviews"],
      ["Feature selection", "inside each training fold", "before splitting"],
      ["Same user in both splits", "split by user", "random record split"],
    ]),
  },
];

const IDS = { this: 5, movie: 6, was: 7, amazing: 8, and: 9, funny: 10 };

export const data: ConceptDef[] = [
  {
    t: "Words must become numbers: tokenize and index",
    lv: 1,
    s: `A network multiplies numbers by weights, so the sentence "This movie was amazing" must be converted. Step 1: lowercase and {{tokenize}} into words. Step 2: map each known word to an integer ID from a {{vocabulary}} (unknown words get a special OOV ID, padding gets 0). With a demo vocabulary this=${IDS.this}, movie=${IDS.movie}, was=${IDS.was}, amazing=${IDS.amazing}: the sentence is [5, 6, 7, 8]. IDs are labels, not magnitudes — amazing=8 is not "bigger" than movie=6.`,
    r: `The real IMDb dataset in Keras uses a frequency-ranked index; the demo IDs here are only for teaching.`,
    i: `Convert "this movie was amazing" to token IDs with the vocabulary above.`,
    c: py`
vocab = {"<pad>": 0, "<start>": 1, "<oov>": 2, "this": 5, "movie": 6, "was": 7, "amazing": 8, "and": 9, "funny": 10}
sentence = "This movie was amazing and boring"
ids = [vocab.get(w, vocab["<oov>"]) for w in sentence.lower().split()]
print(ids)`,
    v: cells("Sentence → tokens → IDs (the unknown word 'boring' becomes the OOV ID 2).", table(["step", "t1", "t2", "t3", "t4", "t5", "t6"], [["words", "this", "movie", "was", "amazing", "and", "boring"], ["token IDs", "5", "6", "7", "8", "9", "2"]]), [
      ["Lowercase and split into tokens."],
      ["Look every token up in the vocabulary.", [[1, 1, 6]]],
      ["Unknown words map to the OOV ID so the model never crashes.", [[1, 6, 6]]],
    ]),
  },
  {
    t: "Padding and truncation: equal-length sequences",
    lv: 1,
    s: `Batches are rectangular tensors, so every review must have the same length. Choose a fixed length (here 10): shorter sequences are {{padded}} with the PAD ID 0, longer ones are {{truncated}}. A 4-token review [5,6,7,8] becomes [5,6,7,8,0,0,0,0,0,0]. Padding is usually masked or ignored by the model so it does not count as information. Pad at the end ("post") or beginning ("pre") consistently.`,
    r: `A very long fixed length wastes compute; a short one throws information away. Pick it from the length distribution of the training reviews.`,
    i: `Pad [5, 6, 7, 8] to length 10.`,
    c: py`
def pad(seq, length=10, value=0):
    return (seq + [value] * length)[:length]

print(pad([5, 6, 7, 8]))
print(pad(list(range(1, 14))))`,
    v: cells("A short and a long review forced to length 10.", [P("short [5,6,7,8]", ["5", "6", "7", "8", "0", "0", "0", "0", "0", "0"]), P("long (13 tokens)", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])], [
      ["Fixed length 10 for every review."],
      ["The short review is padded with zeros.", [[0, 4, 9]]],
      ["The long review loses its last three tokens.", [[1, 0, 9]]],
    ]),
  },
  {
    t: "One-hot and multi-hot encoding",
    lv: 1,
    s: `A {{one-hot}} vector represents ONE token: all zeros with a single 1 at its index (vocabulary of 12 → length 12). A {{multi-hot}} vector represents a WHOLE review: mark 1 for every word that appears anywhere, 0 otherwise. The lecture's results[i, sequence] = 1 makes a multi-hot bag-of-words vector. It ignores word order and counts but feeds nicely into a Dense network: a 10,000-word vocabulary gives each review a 10,000-long 0/1 vector.`,
    r: `Multi-hot vectors are huge and sparse and carry no similarity between words — the motivation for embeddings.`,
    i: `Build the multi-hot vector of the token IDs [3, 5, 5, 9] for a vocabulary of size 12.`,
    c: py`
import numpy as np

vocab_size = 12
tokens = [3, 5, 5, 9]
one_hot = np.eye(vocab_size, dtype=int)[5]
multi_hot = np.zeros(vocab_size, dtype=int)
multi_hot[tokens] = 1
print(one_hot.tolist())
print(multi_hot.tolist(), int(multi_hot.sum()))`,
    v: cells("One-hot for the single token 5; multi-hot for the review with tokens 3, 5, 5, 9.", [P("one-hot (5)", ["0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0"]), P("multi-hot", ["0", "0", "0", "1", "0", "1", "0", "0", "0", "1", "0", "0"])], [
      ["Index positions 0 – 11."],
      ["One-hot: a single 1 at the token's index.", [[0, 5, 5]]],
      ["Multi-hot: 1 for each distinct word present (the repeated 5 still gives one 1).", [[1, 3, 3], [1, 5, 5], [1, 9, 9]]],
    ]),
  },
  {
    t: "Embeddings: a trainable lookup table",
    lv: 2,
    s: `A word ID is only an index. An {{Embedding}} layer owns a trainable matrix of shape (vocabulary × dimension) and returns row ID for each token — a dense vector learned by backpropagation so that useful words end up close. Embedding(10000, 8) holds 10,000 × 8 = 80,000 trainable values. A sentence of 10 tokens becomes a 10 × 8 matrix; global average pooling then collapses it to one 8-vector fed to Dense layers. Real embeddings have dozens to hundreds of dimensions and are not human-readable axes.`,
    r: `Raw token IDs should never go straight into a Dense layer as if they were measurements — use multi-hot or an Embedding.`,
    i: `How many trainable values does Embedding(10000, 8) have?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
vocab, dim = 10000, 8
table_ = rng.normal(0, 0.05, (vocab, dim))
ids = np.array([5, 6, 7, 8, 0, 0, 0, 0, 0, 0])
vectors = table_[ids]
pooled = vectors.mean(axis=0)
print(table_.size, vectors.shape, pooled.shape)`,
    v: plot("Illustrative 2-D word map (not a trained embedding): related words sit close; move 'cat' and watch the distance to 'dog'.", {
      x: [-3, 3], y: [-2.5, 2.5], labels: ["dimension 1", "dimension 2"],
      params: [par("cx", "move 'cat' horizontally", -2.5, 2.5, 0.1, -1.4)],
      readout: ["distance cat–dog = {sqrt((cx+1)^2+(0.8-0.6)^2):2}   ·   distance cat–movie = {sqrt((cx-1.5)^2+(0.8+1.2)^2):2}"],
      steps: [["cat near dog: a small distance means similar usage.", { cx: -1.4 }], ["cat moved next to the movie words: similarity lost.", { cx: 1.4 }]],
    }, [pt("cx", "0.8", { c: "accent", label: "cat" }), pt("-1", "0.6", { c: "good", label: "dog" }), pt("1.5", "-1.2", { c: "warn", label: "movie" }), pt("2", "-1.8", { c: "warn", label: "film" }), seg("cx", "0.8", "-1", "0.6", { c: "muted", dash: true })]),
  },
  {
    t: "The IMDb project: two architectures",
    lv: 2,
    s: `Goal: classify a movie review as positive (1) or negative (0) from 50,000 reviews split into train / validation / test. Pipeline: reviews → split → token index → encode → network → early stopping → test results. {{Architecture A}}: multi-hot 10,000-vector → Dense(16, relu) → Dense(16, relu) → Dense(1, sigmoid). {{Architecture B}}: token IDs → Embedding → global pooling → Dense layers → sigmoid. Output sigmoid + binary cross-entropy suit a two-class label. Check that training loss falls, find the epoch where validation loss is lowest, compare train and validation curves, and only then evaluate on the untouched test reviews.`,
    r: `Parameter count of A: 10,000×16+16 + 16×16+16 + 16×1+1 = 160,305. These snippets need TensorFlow; here the network arithmetic is reproduced in NumPy.`,
    i: `How many trainable parameters does the multi-hot Dense(16)-Dense(16)-Dense(1) model have?`,
    c: py`
sizes = [10000, 16, 16, 1]
params = [a * b + b for a, b in zip(sizes[:-1], sizes[1:])]
print(params, sum(params))
emb = 10000 * 8
print(emb, emb + 8 * 16 + 16 + 16 * 1 + 1)`,
    v: compare("Two ways to feed text to a network.", ["A: multi-hot + Dense", "B: embedding + pooling"], [
      ["Input", "10,000-long 0/1 vector", "sequence of token IDs"],
      ["Word order", "lost", "kept until pooling"],
      ["Learns word similarity", "no", "yes"],
      ["Typical use", "simple teaching baseline", "compact dense vectors"],
    ]),
  },
];

void [hline];
