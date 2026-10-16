import { P, bars, cells, compare, curve, flow, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

const rowflow = (takeaway: string, nodes: string[], notes: string[]) =>
  flow(takeaway, "row", nodes, nodes.slice(1).map((_, i): [number, number] => [i, i + 1]), nodes.slice(1).map((_, i) => i), [`${notes[0] ?? ""} ${notes[1] ?? ""}`.trim(), ...notes.slice(2)]);

export const gen: ConceptDef[] = [
  {
    t: "Autoencoders: compress, then reconstruct",
    lv: 1,
    s: `An {{autoencoder}} is trained to reproduce its own input. The {{encoder}} squeezes an input (a 784-pixel digit) into a small {{latent code}} (say 32 numbers); the {{decoder}} rebuilds the 784 values. The loss is reconstruction error {{MSE = (1/N)Σ(xᵢ − x̂ᵢ)²}} and the targets are the inputs themselves: model.fit(x_train, x_train). The goal is a compact useful representation, not predicting a digit label.`,
    r: `Because the code is smaller than the input, the network is forced to keep only the most important structure.`,
    i: `What is the training target of an autoencoder?`,
    c: py`
import numpy as np

x = np.array([0.0, 0.5, 1.0, 0.5])
x_hat = np.array([0.1, 0.4, 0.9, 0.6])
print(round(float(np.mean((x - x_hat) ** 2)), 4))`,
    v: rowflow("Input → code → reconstruction.", ["784 pixels", "Encoder", "32-number code", "Decoder", "784 pixels"], [
      "The original digit.",
      "Compress.",
      "The bottleneck keeps essentials.",
      "Rebuild.",
      "Compared with the input to get the loss.",
    ]),
  },
  {
    t: "Capacity of the code: how many components to keep",
    lv: 2,
    s: `The smaller the latent code, the more detail is lost. A linear autoencoder behaves like PCA, so we can see the trade-off with plain NumPy: take 40 noisy 8×8 "digit" patterns, project onto the top k directions (singular vectors) and rebuild. Reconstruction error falls quickly for the first few components and then flattens — extra capacity buys little. Choose the bottleneck size by validation reconstruction error and by what the code is for.`,
    r: `Nonlinear autoencoders can compress better than PCA at the same code size.`,
    i: `Why does reconstruction error stop improving after enough components?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
basis = rng.normal(size=(3, 64))
X = rng.normal(size=(40, 3)) @ basis + rng.normal(0, 0.1, (40, 64))
mean = X.mean(axis=0)
U, S, Vt = np.linalg.svd(X - mean, full_matrices=False)
for k in (1, 2, 3, 5, 10):
    Xk = (X - mean) @ Vt[:k].T @ Vt[:k] + mean
    print(k, round(float(np.mean((X - Xk) ** 2)), 4))`,
    v: plot("Illustrative reconstruction error against the number of kept components.", {
      x: [0, 12], y: [0, 1.1], labels: ["latent components kept", "reconstruction error"],
      params: [par("k", "components kept", 0, 12, 1, 3)],
      readout: ["error at k = {k}: about {0.05+0.95*exp(-0.9*k):3}"],
      steps: [["k = 1: a rough sketch.", { k: 1 }], ["k = 3: the main structure is captured.", { k: 3 }], ["k = 10: little left to gain.", { k: 10 }]],
    }, [curve("0.05+0.95*exp(-0.9*x)", { c: "accent" }), pt("k", "0.05+0.95*exp(-0.9*k)", { c: "warn" })]),
  },
  {
    t: "An autoencoder in Keras terms: 784 → 32 → 784",
    lv: 2,
    s: `Lecture architecture: Input(784) → Dense(32, relu) → Dense(784, sigmoid), compiled with Adam and MSE, trained for 20 epochs at batch 256 on x_train as both input and target, with a validation subset (never the final test set). Parameters: encoder 784×32 + 32 = 25,120; decoder 32×784 + 784 = 25,872; total 50,992. The sigmoid output matches pixels scaled to 0–1. Check reconstructions with autoencoder.predict(x_test[:10]) → shape (10, 784).`,
    r: `Use a separate validation subset to choose hyper-parameters.`,
    i: `Count the parameters of the 784-32-784 autoencoder.`,
    c: py`
dense = lambda a, b: a * b + b
enc, dec = dense(784, 32), dense(32, 784)
print(enc, dec, enc + dec)
print(784 / 32)`,
    v: bars("Parameters in the encoder and decoder for the chosen code size.", [["encoder 784 → c", "784*c+c"], ["decoder c → 784", "c*784+784"]], {
      max: 130000,
      params: [par("c", "code size c", 2, 128, 2, 32)],
      readout: ["total = {784*c+c+c*784+784} parameters; compression {784/c:1}×"],
      steps: [["The lecture's 32-number code.", { c: 32 }], ["A wider 128-number code.", { c: 128 }]],
    }),
  },
  {
    t: "Latent space: not every point decodes to something real",
    lv: 2,
    s: `A plain autoencoder only learned to reconstruct the training images; it makes no promise that a random point in latent space decodes to a realistic sample. Codes of one digit class form clusters with gaps between them; a point in a gap decodes to a blurry or meaningless image. Dense regions are the places where reconstruction is trustworthy. That is why we cannot simply "sample the latent space" of an ordinary autoencoder to generate new data.`,
    r: `The 2-D map is illustrative; real latent spaces have tens of dimensions.`,
    i: `Why can't we sample random latent codes from a plain autoencoder to generate digits?`,
    c: py`
import numpy as np

centres = np.array([[-2.0, 0.0], [2.0, 0.0]])
points = np.array([[-1.8, 0.2], [0.0, 0.0], [2.1, -0.3]])
for p in points:
    d = np.linalg.norm(centres - p, axis=1).min()
    print(p.tolist(), round(float(d), 2), "ok" if d < 1 else "gap")`,
    v: plot("Two illustrative digit clusters; move the probe point and watch its distance to the nearest cluster.", {
      x: [-4.5, 4.5], y: [-2.5, 2.5], labels: ["code x", "code y"],
      params: [par("px", "probe x", -4, 4, 0.1, 0), par("py_", "probe y", -2, 2, 0.1, 0)],
      readout: ["nearest cluster distance = {min(sqrt((px+2)^2+py_^2),sqrt((px-2)^2+py_^2)):2}  (below 1 → likely realistic, above → a gap)"],
      steps: [["Between the clusters: a gap.", { px: 0, py_: 0 }], ["Inside the left cluster.", { px: -2, py_: 0.3 }]],
    }, [pt("-2", "0", { c: "info", label: "digit A" }), pt("2", "0", { c: "good", label: "digit B" }), pt("px", "py_", { c: "bad" })]),
  },
  {
    t: "Variational autoencoders: a distribution instead of a point",
    lv: 2,
    s: `A VAE encoder predicts a distribution for each input: a mean μ and a log-variance. A code is sampled by the {{reparameterisation trick}}: {{z = μ + σ·ε}} with ε ~ N(0,1) and σ = exp(½·logσ²). Because ε carries the randomness, gradients flow through μ and σ during training. Example μ = 0.5, log σ² = −0.4, ε = 1: σ = e^(−0.2) = 0.819, so z = 1.319. Drag μ, log σ² and ε.`,
    r: `Sampling is written as a deterministic function of (μ, σ) plus external noise — that is the whole trick.`,
    i: `Compute z for μ = 0.5, log σ² = −0.4, ε = 1.`,
    c: py`
import numpy as np

mu, logvar, eps = 0.5, -0.4, 1.0
sigma = np.exp(0.5 * logvar)
print(round(float(sigma), 4), round(float(mu + sigma * eps), 4))`,
    v: plot("The Gaussian the encoder outputs, and the sampled code z (dot).", {
      x: [-5, 5], y: [0, 1.4], labels: ["latent value", "density"],
      params: [par("mu", "mean μ", -3, 3, 0.1, 0.5), par("lv", "log variance", -3, 1.5, 0.1, -0.4), par("eps", "noise ε", -3, 3, 0.1, 1)],
      readout: ["σ = {exp(0.5*lv):3}   z = {mu} + σ·{eps} = {mu+exp(0.5*lv)*eps:3}"],
      steps: [["The lecture's numbers.", { mu: 0.5, lv: -0.4, eps: 1 }], ["Large variance: wide uncertain code.", { mu: 0, lv: 1, eps: 0 }]],
    }, [curve("exp(-(x-mu)^2/(2*exp(lv)))/sqrt(2*3.14159265*exp(lv))", { c: "accent" }), pt("mu+exp(0.5*lv)*eps", "0", { c: "bad" }), vline("mu", { c: "muted", dash: true })]),
  },
  {
    t: "The VAE loss and the KL term",
    lv: 2,
    s: `The loss has two parts: {{L = reconstruction + β·KL(q(z|x) ‖ N(0,I))}}. KL for a diagonal Gaussian is {{−½ Σ(1 + log σ² − μ² − σ²)}}. It is zero when μ = 0 and σ = 1 and grows as the encoder drifts from the standard normal prior — which keeps the latent space compact and sample-able. Example μ = 0.5, log σ² = −0.4: −½(1 − 0.4 − 0.25 − 0.670) = 0.160. β balances reconstruction against regularity; the choice of mean vs sum in the reconstruction term changes the scale, so compare loss terms carefully.`,
    r: `After training, sample z ~ N(0,I) and decode it to generate new digits.`,
    i: `Compute the KL term for μ = 0.5 and log σ² = −0.4.`,
    c: py`
import numpy as np

mu, logvar = 0.5, -0.4
kl = -0.5 * (1 + logvar - mu ** 2 - np.exp(logvar))
print(round(float(kl), 4))
print(-0.5 * (1 + 0 - 0 - 1))`,
    v: plot("KL against the mean for the chosen variance: zero only at μ = 0, σ = 1.", {
      x: [-3, 3], y: [0, 5], labels: ["mean μ", "KL"],
      params: [par("lv", "log variance", -3, 2, 0.1, -0.4)],
      readout: ["KL(μ = 0.5) = {-0.5*(1+lv-0.25-exp(lv)):3}"],
      steps: [["log σ² = 0: only the mean costs.", { lv: 0 }], ["Narrow variance adds a cost even at μ = 0.", { lv: -2 }]],
    }, [curve("-0.5*(1+lv-x^2-exp(lv))", { c: "bad" }), pt("0.5", "-0.5*(1+lv-0.25-exp(lv))", { c: "warn" })]),
  },
  {
    t: "GANs: generator versus discriminator",
    lv: 1,
    s: `A {{GAN}} has two networks with opposing goals. The {{generator G}} turns random noise z into fake samples; the {{discriminator D}} outputs the probability that a sample is real. They train alternately: D learns to tell real from fake, G learns to fool D. The classic objective is the minimax game {{min_G max_D E[log D(x)] + E[log(1 − D(G(z)))]}}. Practical training is delicate: oscillation, vanishing gradients and mode collapse (G repeats a few outputs) can occur, so intuition scores on a page are only intuition.`,
    r: `A GAN has no reconstruction target: the only teacher is the other network.`,
    i: `What does the generator try to do to D(G(z))?`,
    c: py`
import numpy as np

d_real, d_fake = 0.9, 0.2
d_loss = -(np.log(d_real) + np.log(1 - d_fake))
g_loss = -np.log(d_fake)
print(round(float(d_loss), 4), round(float(g_loss), 4))`,
    v: rowflow("The adversarial loop.", ["noise z", "Generator", "fake image", "Discriminator", "real or fake?"], [
      "Random numbers.",
      "Turns noise into a candidate.",
      "A synthetic digit.",
      "Compares fake with real examples.",
      "Its verdict trains both networks, in opposite directions.",
    ]),
  },
  {
    t: "The GAN losses in numbers",
    lv: 2,
    s: `The discriminator's loss is {{−[log D(x) + log(1 − D(G(z)))]}}; the (non-saturating) generator loss is {{−log D(G(z))}}. If D says 0.9 for the real image and 0.2 for the fake: D-loss = −(ln 0.9 + ln 0.8) = 0.328, G-loss = −ln 0.2 = 1.609. As G improves, D(G(z)) rises towards 0.5 — D can no longer tell — and G-loss falls to ln 2 = 0.693. At that balance D is guessing: the equilibrium of the game.`,
    r: `A discriminator that wins too easily gives the generator no useful gradient; keep the two roughly matched.`,
    i: `Compute the generator loss when D(G(z)) = 0.2 and when it is 0.5.`,
    c: py`
import numpy as np

for d_fake in (0.05, 0.2, 0.5):
    print(d_fake, round(float(-np.log(d_fake)), 4))`,
    v: plot("Generator loss against how convincing the fake is.", {
      x: [0.02, 1], y: [0, 4], labels: ["D(G(z))", "generator loss"],
      params: [par("d", "D(G(z))", 0.05, 0.95, 0.05, 0.2)],
      readout: ["G-loss = −ln({d}) = {-ln(d):3}   ·   D-loss with D(x) = 0.9: {-(ln(0.9)+ln(1-d)):3}"],
      steps: [["A poor fake: high loss.", { d: 0.1 }], ["Convincing fake: the discriminator is at 50/50.", { d: 0.5 }]],
    }, [curve("-ln(x)", { c: "bad" }), curve("-(ln(0.9)+ln(1-x))", { c: "info" }), pt("d", "-ln(d)", { c: "warn" }), vline("0.5", { c: "muted", dash: true })]),
  },
  {
    t: "Generative versus discriminative models",
    lv: 1,
    s: `A {{discriminative}} model learns the boundary between classes — P(y | x): "is this photo defective?". A {{generative}} model learns what the data look like — P(x), or P(x | y) — and can synthesise new samples. Autoencoders learn compact representations; VAEs and GANs generate. Choose by the business goal, not by fashion: if you only need to classify, a discriminator is simpler and usually more accurate.`,
    r: `Generative models answer a harder question, and are harder to evaluate (BLEU for text, human judgement or specialised scores for images).`,
    i: `Which type of model answers "which class does this belong to?"`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
a = rng.normal(-1, 0.5, 200)
b = rng.normal(1, 0.5, 200)
boundary = (a.mean() + b.mean()) / 2
mean_a, std_a = a.mean(), a.std()
sample = rng.normal(mean_a, std_a, 3)
print(round(float(boundary), 2), sample.round(2).tolist())`,
    v: compare("Two ways of modelling the same data.", ["Discriminative", "Generative"], [
      ["Learns", "the decision boundary", "the data distribution"],
      ["Answers", "which class?", "what would a new example look like?"],
      ["Examples", "logistic regression, CNN classifier", "VAE, GAN, language models"],
      ["Output", "label / probability", "new samples"],
    ]),
  },
  {
    t: "Capstone projects and a study order",
    lv: 1,
    s: `Pick one project to implement, evaluate, document and present. {{A: MNIST autoencoder and VAE}} — load, normalise, hold out validation, build encoder/decoder, optimise reconstruction (+KL), plot learning curves, compare original vs reconstructed digits, plot the 2-D latent map and sample new digits. {{B: attention for translation}} — aligned sentence pairs, tokenise, split, encoder/decoder, attention weights, teacher forcing, decode, BLEU plus human examples. {{C: GAN digit generator}} — generator and discriminator on MNIST trained alternately, saving an image grid each epoch. Study order: autoencoder → VAE → attention maths → Seq2Seq → GAN.`,
    r: `These are separate research families; study them as connected but different ideas.`,
    i: `In what order would you study autoencoders, VAEs, attention, Seq2Seq and GANs?`,
    c: py`
order = ["autoencoder", "VAE", "attention maths", "Seq2Seq", "GAN"]
print(" -> ".join(order), len(order))`,
    v: rowflow("A sensible learning path.", ["Autoencoder", "VAE", "Attention maths", "Seq2Seq", "GAN"], [
      "Compress and reconstruct.",
      "Add a distribution and KL.",
      "Query, key, value.",
      "Encoder–decoder translation.",
      "Adversarial generation.",
    ]),
  },
];

void [P, bars, cells, hline, seg];
