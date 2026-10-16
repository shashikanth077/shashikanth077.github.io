import { L, P, area, bars, cells, compare, curve, flow, hline, layers, par, plot, pt, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

/* ------------------------------------------------------------------ */
export const start: ConceptDef[] = [
  {
    t: "Why neural networks",
    lv: 1,
    s: `A neural network is a function with thousands or millions of adjustable numbers (weights and biases) arranged in layers. You do not write the rules: you show it examples, measure how wrong its answers are, and nudge every number to be a little less wrong. Repeated many times, the layers learn their own features — edges in an image, word patterns in a sentence. Even the tiniest network, 2 inputs → 3 hidden neurons → 1 output, already has 13 learnable numbers.`,
    r: `Use a network when the input is raw and high-dimensional (pixels, audio, text) and you have plenty of labelled examples. For small tables, a tree ensemble is often simpler and just as good.`,
    i: `What exactly are the "learnable parameters" of a neural network?`,
    c: py`
n_in, n_hidden, n_out = 2, 3, 1
hidden = n_in * n_hidden + n_hidden
output = n_hidden * n_out + n_out
print(hidden, output, hidden + output)`,
    v: layers("Raw input goes in; each layer builds on the one before.", [
      "Output layer|the prediction: a probability, a class, a number|g",
      "Hidden layers|learned features, from simple to abstract|i",
      "Input layer|raw numbers: pixels, word IDs, sensor values|w",
    ], "learning builds upward ↑"),
  },
  {
    t: "The neuron: weighted sum, bias, activation",
    lv: 1,
    s: `A neuron is a small calculator. It multiplies each input by a {{weight}}, adds them up with a {{bias}} to get the score {{z = w₁x₁ + w₂x₂ + b}}, then passes z through an {{activation function}}: {{a = f(z)}}. Take a student with study 0.8 and attendance 0.9 (both scaled 0–1): with weights 0.5 and 0.4 and bias 0.1, z = 0.8×0.5 + 0.9×0.4 + 0.1 = 0.86, and ReLU keeps it: a = 0.86. Drag the weights and watch the score change. Note: this z is a raw score, not a statistics Z-score.`,
    r: `Weights are learned, not fixed importance ratings. The bias lets a neuron fire even when all inputs are zero.`,
    i: `Compute the output of a neuron with inputs (0.8, 0.9), weights (0.5, 0.4), bias 0.1 and ReLU.`,
    c: py`
import numpy as np

x = np.array([0.8, 0.9])
w = np.array([0.5, 0.4])
b = 0.1
print((x * w).round(2).tolist())
z = float(x @ w + b)
print(round(z, 2), max(0.0, z))`,
    v: bars("Score z and ReLU output for the student (study 0.8, attendance 0.9).", [["z (weighted sum)", "0.8*w1+0.9*w2+b"], ["a = ReLU(z)", "relu(0.8*w1+0.9*w2+b)"]], {
      max: 2,
      params: [par("w1", "weight on study", -1, 1, 0.1, 0.5), par("w2", "weight on attendance", -1, 1, 0.1, 0.4), par("b", "bias", -1, 1, 0.1, 0.1)],
      readout: ["z = 0.8 × {w1} + 0.9 × {w2} + {b} = {0.8*w1+0.9*w2+b:2}"],
      steps: [["The worked example: z = 0.86, a = 0.86.", { w1: 0.5, w2: 0.4, b: 0.1 }], ["Negative weights push z below zero — ReLU clips it to 0.", { w1: -0.5, w2: -0.4, b: 0.1 }]],
    }),
  },
  {
    t: "Layers and the forward pass: one student, one prediction",
    lv: 1,
    s: `Chain neurons into layers. Student (0.8, 0.9) → hidden ReLU neuron (weights 0.5, 0.4, bias 0.1) → output sigmoid neuron (weight 2, bias −0.2). Hidden: z = 0.86, a = 0.86. Output: z = 0.86 × 2 − 0.2 = 1.52, and sigmoid(1.52) = 1/(1 + e⁻¹·⁵²) ≈ 0.8205: an 82.05% chance of passing. The student really passed (y = 1), so the binary cross-entropy is −ln(0.8205) ≈ 0.1978. This left-to-right calculation is the {{forward pass}}.`,
    r: `The weights here are invented for the arithmetic; trained weights come from many labelled examples.`,
    i: `Run the forward pass for the pass/fail student and compute the loss.`,
    c: py`
import numpy as np

x = np.array([0.8, 0.9])
z_hidden = x @ np.array([0.5, 0.4]) + 0.1
h = max(0.0, z_hidden)
z_out = h * 2.0 - 0.2
p = 1 / (1 + np.exp(-z_out))
loss = -np.log(p)
print(round(float(z_hidden), 2), round(float(z_out), 2))
print(round(float(p), 4), round(float(loss), 4))`,
    v: flow("Forward pass: input → weighted sum → ReLU → weighted sum → sigmoid → probability → loss.", "row",
      ["Input|study 0.8, attendance 0.9|i", "Hidden score|z = 0.86|g", "ReLU|a = 0.86|g", "Output score|z = 1.52|g", "Sigmoid|P(pass) = 0.8205|g", "Loss|−ln(0.8205) = 0.1978|w"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]], undefined,
      ["0.8 × 0.5 + 0.9 × 0.4 + 0.1 = 0.86.", "ReLU(0.86) = 0.86 (positive, so it passes through).", "0.86 × 2 − 0.2 = 1.52.", "σ(1.52) ≈ 0.8205.", "The student passed (y = 1): loss = −ln(0.8205) ≈ 0.1978."]),
  },
  {
    t: "The learning loop: forward, loss, backward, update",
    lv: 1,
    s: `Every network learns by repeating four moves. {{Forward pass}}: compute the prediction. {{Loss}}: measure how wrong it is. {{Backward pass (backpropagation)}}: use the chain rule to find how the loss would change if each weight moved a little — the gradients. {{Update}}: an optimiser moves each weight a small step against its gradient. One pass over all the training data is an epoch; many epochs are run while validation data are watched. The next areas take each move apart.`,
    r: `Activation = "what signal does this neuron send forward?". Loss = "how far is the final prediction from the truth?". Gradient = "how will the loss change if a weight changes?". Optimiser = "what adjustment should we make?".`,
    i: `Name the four steps of one training iteration.`,
    v: flow("The training cycle repeats until the validation loss stops improving.", "cycle",
      ["Forward pass|predict ŷ|i", "Loss|compare ŷ with y|w", "Backward pass|gradients by the chain rule|g", "Update|w ← w − η · gradient|g"],
      [[0, 1], [1, 2], [2, 3], [3, 0]], undefined,
      ["The inputs flow through the layers to a prediction.", "The loss turns the mistake into one number.", "Backpropagation finds the gradient of every weight.", "The optimiser moves every weight a little; then the cycle repeats."]),
  },
  {
    t: "Parameters and shapes: counting the weights",
    lv: 1,
    s: `A dense layer with {{n_in}} inputs and {{n_out}} neurons has {{n_in × n_out}} weights and {{n_out}} biases: {{n_in × n_out + n_out}} parameters. Each neuron has its own bias. For 3 inputs → 4 hidden → 2 outputs: (3 × 4 + 4) + (4 × 2 + 2) = 16 + 10 = 26. Shapes tell you the same story: an input batch of 8 examples with 3 features is (8, 3); times a (3, 4) weight matrix plus a bias of 4 gives (8, 4).`,
    r: `Counting parameters is the quickest sanity check on a model summary and a favourite exam question.`,
    i: `How many parameters does a Dense layer with 784 inputs and 100 neurons have?`,
    c: py`
import numpy as np

X = np.ones((8, 3))
W1, b1 = np.zeros((3, 4)), np.zeros(4)
W2, b2 = np.zeros((4, 2)), np.zeros(2)
H = X @ W1 + b1
out = H @ W2 + b2
print(X.shape, H.shape, out.shape)
print(W1.size + b1.size, W2.size + b2.size, W1.size + b1.size + W2.size + b2.size)`,
    v: cells("Weights = inputs × neurons; biases = neurons.", table(["layer", "shape of W", "weights", "biases", "parameters"], [["3 → 4", "(3, 4)", "12", "4", "16"], ["4 → 2", "(4, 2)", "8", "2", "10"], ["total", "", "20", "6", "26"]]), [
      ["A tiny 3 → 4 → 2 network."],
      ["The first layer: 3 × 4 = 12 weights plus 4 biases = 16.", [[1, 1, 4]]],
      ["The second layer: 4 × 2 = 8 weights plus 2 biases = 10.", [[2, 1, 4]]],
      ["Total 26 trainable numbers.", [[3, 4, 4]]],
    ]),
  },
  {
    t: "A map of network types",
    lv: 1,
    s: `One basic idea — layers of weighted sums with learned weights — comes in several shapes. {{Feed-forward / dense}} networks map a feature vector to an output. {{Convolutional}} networks (CNNs) slide small shared filters over a grid such as an image. {{Recurrent}} networks (RNN, LSTM, GRU) carry a memory state along a sequence. {{Attention}} networks let every position weigh every other. {{Autoencoders}} compress and reconstruct; {{GANs}} pit a generator against a discriminator. This track takes them in that order.`,
    r: `Choose by the structure of the input: a table → dense; an image → CNN; a time series or sentence → recurrent or attention; creating new data → generative.`,
    i: `Which architecture would you pick for an image classifier, and why?`,
    v: compare("Same ingredients, different wiring.", ["Input", "Key idea", "Typical task"], [
      ["Dense (MLP)", "a feature vector", "every input connects to every neuron", "tabular prediction, digit classifier"],
      ["CNN", "an image or grid", "small filters shared across positions", "image classification"],
      ["RNN / LSTM / GRU", "an ordered sequence", "a hidden state carried step to step", "sentiment, forecasting"],
      ["Attention", "a sequence", "weights over all positions, in parallel", "translation, language models"],
      ["Autoencoder / VAE", "any data", "compress to a code, then reconstruct", "denoising, generation"],
      ["GAN", "random noise", "generator versus discriminator", "image synthesis"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const act: ConceptDef[] = [
  {
    t: "Why activations must be non-linear",
    lv: 1,
    s: `Without an activation function, stacking layers gains nothing: a linear layer followed by another linear layer is just one bigger linear layer, W₂(W₁x) = (W₂W₁)x. A network of such layers can only draw straight lines. A non-linear activation between layers breaks this and lets the network bend its decision boundaries and model curved relationships. The activation does not "learn" by itself; the weights around it do.`,
    r: `"Add a hidden layer" only helps if there is a non-linearity in it. That is the first thing to check when a deep model behaves like logistic regression.`,
    i: `Why would ten linear layers with no activation be no better than one?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=3)
W1, W2 = rng.normal(size=(4, 3)), rng.normal(size=(2, 4))
two_layers = W2 @ (W1 @ x)
one_layer = (W2 @ W1) @ x
print(bool(np.allclose(two_layers, one_layer)))
relu_two = W2 @ np.maximum(0, W1 @ x)
print(bool(np.allclose(relu_two, one_layer)))`,
    v: compare("Stacked linear layers collapse; a non-linearity keeps them useful.", ["Without activation", "With ReLU between layers"], [
      ["Two layers compute", "W₂(W₁x) = (W₂W₁)x — one linear map", "W₂ · ReLU(W₁x) — not a single linear map"],
      ["Decision boundary", "always a straight line / plane", "can be curved and piecewise"],
      ["Depth helps?", "no", "yes"],
    ], 1),
  },
  {
    t: "Sigmoid: any score to a number between 0 and 1",
    lv: 1,
    s: `{{σ(z) = 1 / (1 + e⁻ᶻ)}}. Calculate it in small steps: negate z, exponentiate, add 1, take the reciprocal. For z = 1.5: −z = −1.5, e⁻¹·⁵ = 0.2231, 1 + 0.2231 = 1.2231, 1/1.2231 = 0.8176. At z = 0, e⁰ = 1 so σ = 1/2 = 0.5; for very positive z the denominator approaches 1 (σ → 1); for very negative z it explodes (σ → 0). Drag z.`,
    r: `Used as the output of a binary classifier. A sigmoid output is probability-like, but it is not automatically calibrated, and its slope is tiny for large |z|, which slows learning in deep hidden layers.`,
    i: `Compute σ(1.5) step by step.`,
    c: py`
import numpy as np

z = 1.5
neg = np.exp(-z)
den = 1 + neg
print(round(float(neg), 4), round(float(den), 4), round(float(1 / den), 4))
print(1 / (1 + np.exp(0)), round(float(1 / (1 + np.exp(-8))), 4), round(float(1 / (1 + np.exp(8))), 4))`,
    v: plot("The S-curve; the dot is the chosen z.", {
      x: [-8, 8], y: [-0.1, 1.1], labels: ["z", "σ(z)"],
      params: [par("z", "z", -8, 8, 0.25, 1.5)],
      readout: ["e^(−z) = {exp(-z):4}  →  1 + e^(−z) = {1+exp(-z):4}  →  σ(z) = {1/(1+exp(-z)):4}"],
      steps: [["z = 1.5 → 0.8176.", { z: 1.5 }], ["z = 0 → exactly 0.5.", { z: 0 }], ["z = −6 → almost 0.", { z: -6 }]],
    }, [curve("sigmoid(x)", { c: "accent" }), hline("0.5", { c: "muted", dash: true }), pt("z", "sigmoid(z)", { c: "bad" })]),
  },
  {
    t: "Tanh: a centred, signed signal",
    lv: 2,
    s: `{{tanh(z) = (eᶻ − e⁻ᶻ) / (eᶻ + e⁻ᶻ)}} squashes into (−1, +1) and is centred on zero: negative inputs give negative outputs. It is a rescaled sigmoid: {{tanh(z) = 2σ(2z) − 1}}. A neuron with a tanh activation can pass negative evidence (a review leaning negative) as well as positive. Those are internal signals, not calibrated probabilities. Like sigmoid it saturates for large |z|. It is still used in recurrent networks.`,
    r: `Zero-centred activations can make optimisation slightly easier than sigmoid in hidden layers; ReLU has largely replaced both there.`,
    i: `Show that tanh(z) = 2σ(2z) − 1 for z = 1.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for z in (-2.0, 0.0, 1.0, 2.0):
    print(z, round(float(np.tanh(z)), 4), round(float(2 * sigmoid(2 * z) - 1), 4))`,
    v: plot("tanh and its relation to sigmoid; both curves pass through the dot at the chosen z.", {
      x: [-5, 5], y: [-1.25, 1.25], labels: ["z", "output"],
      params: [par("z", "z", -5, 5, 0.25, 1)],
      readout: ["tanh({z}) = {tanh(z):4}   ·   2σ(2z) − 1 = {2*sigmoid(2*z)-1:4}"],
      steps: [["z = 1: tanh = 0.7616.", { z: 1 }], ["z = −2: strongly negative signal.", { z: -2 }]],
    }, [curve("tanh(x)", { c: "info", label: "tanh" }), curve("sigmoid(x)", { c: "muted", dash: true, label: "sigmoid" }), hline("0", { c: "muted", dash: true }), pt("z", "tanh(z)", { c: "bad" })]),
  },
  {
    t: "ReLU and its variants",
    lv: 1,
    s: `{{ReLU(z) = max(0, z)}}: negative scores become 0 and positive scores pass through unchanged — ReLU(−3) = 0, ReLU(2) = 2. It is cheap, and on the positive side its slope is exactly 1, so gradients flow without the saturation of sigmoid and tanh. Its weakness: a neuron whose input stays negative has zero output AND zero gradient, and may "die". {{Leaky ReLU}} keeps a small slope α on the negative side to prevent that. ReLU is not a probability: it can exceed 1.`,
    r: `ReLU is the default hidden activation for dense and convolutional networks. Local derivative: 1 for z > 0, 0 for z < 0, and by convention 0 at exactly 0.`,
    i: `What is ReLU(−4), and what is its derivative there?`,
    c: py`
import numpy as np

z = np.array([-3.0, -0.5, 0.0, 2.0])
relu = np.maximum(0, z)
leaky = np.where(z > 0, z, 0.1 * z)
print(relu.tolist(), leaky.round(2).tolist())
print((z > 0).astype(int).tolist())`,
    v: plot("ReLU (blue) and leaky ReLU (green, slope α on the left).", {
      x: [-6, 6], y: [-1.5, 6], labels: ["z", "output"],
      params: [par("z", "z", -6, 6, 0.25, 2), par("a", "leaky slope α", 0, 0.3, 0.05, 0.1)],
      readout: ["ReLU({z}) = {relu(z):2}   ·   leaky = {relu(z)-a*relu(-z):2}   ·   slope of ReLU here = {step(z)}"],
      steps: [["z = 2: passes through, slope 1.", { z: 2, a: 0.1 }], ["z = −3: ReLU is 0 with slope 0; leaky ReLU leaks −0.3.", { z: -3, a: 0.1 }]],
    }, [curve("relu(x)", { c: "info", label: "ReLU" }), curve("relu(x)-a*relu(-x)", { c: "good", dash: true, label: "leaky" }), pt("z", "relu(z)", { c: "bad" })]),
  },
  {
    t: "Softmax: a probability share for every class",
    lv: 1,
    s: `For several mutually exclusive classes the output layer produces one raw score (logit) per class and {{softmax(zᵢ) = e^zᵢ / Σⱼ e^zⱼ}} turns them into probabilities that sum to 1. Logits (2, 1, 0): exponentials (7.389, 2.718, 1), sum 11.107, probabilities (0.665, 0.245, 0.090) → predict class 0 (the argmax). Exponentials make everything positive and keep the ranking; dividing by the sum normalises. Adding the SAME constant to every logit changes nothing — which is why implementations subtract the maximum for numerical stability. Try the shift slider.`,
    r: `For independent labels (a photo can contain both a cat and a dog) use one sigmoid per label instead of one softmax.`,
    i: `Compute the softmax of (2, 1, 0).`,
    c: py`
import numpy as np

z = np.array([2.0, 1.0, 0.0])
e = np.exp(z)
print(e.round(4).tolist(), round(float(e.sum()), 4))
p = e / e.sum()
print(p.round(4).tolist(), int(p.argmax()))
shifted = np.exp(z + 10) / np.exp(z + 10).sum()
print(bool(np.allclose(p, shifted)))`,
    v: bars("Class probabilities for logits (a, b, c) after adding a shift s to all three — the bars do not move.", [["Billing", "exp(a+s)/(exp(a+s)+exp(b+s)+exp(c+s))"], ["Technical", "exp(b+s)/(exp(a+s)+exp(b+s)+exp(c+s))"], ["Delivery", "exp(c+s)/(exp(a+s)+exp(b+s)+exp(c+s))"]], {
      percent: true,
      params: [par("a", "Billing score", -5, 5, 0.2, 2), par("b", "Technical score", -5, 5, 0.2, 1), par("c", "Delivery score", -5, 5, 0.2, 0), par("s", "shift added to all", -3, 3, 0.5, 0)],
      steps: [["Scores (2, 1, 0): 66.5% / 24.5% / 9.0%.", { a: 2, b: 1, c: 0, s: 0 }], ["Add +3 to every score: identical probabilities.", { a: 2, b: 1, c: 0, s: 3 }], ["Raise one score: that class takes most of the probability.", { a: 4, b: 1, c: 0, s: 0 }]],
    }),
  },
  {
    t: "Choosing the output activation and loss",
    lv: 1,
    s: `The task decides the last layer. Pass/fail or spam/not spam: one sigmoid output + binary cross-entropy. One class among several: softmax + categorical cross-entropy. Several tags that can all be true: one sigmoid per label + binary cross-entropy for each. A number such as a price or temperature: a linear output (no squashing) + MSE or MAE. Hidden layers almost always use ReLU. Frameworks usually combine the last activation with the loss for numerical stability (BCE-with-logits, cross-entropy on raw logits).`,
    r: `Putting a sigmoid on a regression output, or softmax before a loss that already includes it, are classic bugs.`,
    i: `Which output activation and loss for a house-price model? For a three-class text classifier?`,
    v: compare("Match the output layer to the problem.", ["Hidden", "Output", "Common loss"], [
      ["Pass / fail; spam / not spam", "ReLU", "sigmoid", "binary cross-entropy"],
      ["Cat vs dog vs bird (one class)", "ReLU", "softmax", "categorical cross-entropy"],
      ["Several tags at once", "ReLU", "sigmoid per label", "binary cross-entropy per label"],
      ["House price, temperature", "ReLU", "linear", "MSE or MAE"],
    ]),
  },
  {
    t: "Saturation and the slope of an activation",
    lv: 2,
    s: `Learning multiplies gradients, and every activation contributes its local slope. Sigmoid's slope is σ(z)(1 − σ(z)): at most 0.25 (at z = 0) and tiny for large |z| (0.018 at z = 4). Tanh's slope 1 − tanh²(z) peaks at 1. ReLU's slope is exactly 1 for positive z. Multiply many numbers below 1 through many layers and the gradient shrinks towards zero — the vanishing-gradient problem — which is one reason ReLU replaced sigmoid in deep hidden layers. Drag z to read the three slopes.`,
    r: `Saturated units (|z| large) barely change when their weights change, so they learn slowly. Initialisation, normalisation and ReLU all help.`,
    i: `Why do sigmoid hidden layers make very deep networks hard to train?`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for z in (0.0, 2.0, 4.0):
    s = sigmoid(z)
    print(z, round(float(s * (1 - s)), 4), round(float(1 - np.tanh(z) ** 2), 4), int(z > 0))
print(round(0.25 ** 10, 8))`,
    v: plot("Slope (derivative) of each activation. The sigmoid never exceeds 0.25.", {
      x: [-6, 6], y: [0, 1.1], labels: ["z", "slope"],
      params: [par("z", "z", -6, 6, 0.25, 2)],
      readout: ["z = {z}: sigmoid slope {sigmoid(z)*(1-sigmoid(z)):4} · tanh slope {1-tanh(z)^2:4} · ReLU slope {step(z)}"],
      steps: [["z = 0: sigmoid slope 0.25, tanh slope 1.", { z: 0 }], ["z = 4: sigmoid and tanh are saturated: almost no slope.", { z: 4 }]],
    }, [curve("sigmoid(x)*(1-sigmoid(x))", { c: "accent", label: "sigmoid'" }), curve("1-tanh(x)^2", { c: "info", label: "tanh'" }), curve("step(x)", { c: "warn", label: "ReLU'" }), vline("z", { c: "muted", dash: true })]),
  },
];

/* ------------------------------------------------------------------ */
export const loss: ConceptDef[] = [
  {
    t: "What a loss function is — and how it differs from a metric",
    lv: 1,
    s: `A loss function compares a prediction ŷ with the target y and returns one non-negative number: small when the match is good. Training changes the weights to reduce the average loss; the gradients of the loss drive every update. A {{metric}} (accuracy, precision, recall) is what you REPORT. They can disagree: for a true label of 1, model A predicts p = 0.51 and model B predicts p = 0.99. At threshold 0.5 both are correct (equal accuracy), but their losses are −ln 0.51 = 0.6733 and −ln 0.99 = 0.0101 — B is far more confident in the right answer.`,
    r: `Loss measures confidence as well as correctness, which is why it gives useful gradients; accuracy is flat between decisions.`,
    i: `Two models are equally accurate but have different cross-entropy. What does that mean?`,
    c: py`
import numpy as np

for p in (0.51, 0.99):
    print(p, int(p >= 0.5), round(float(-np.log(p)), 4))`,
    v: flow("The loss steers training; metrics judge the result.", "row",
      ["Prediction ŷ|from the network|i", "Compare with y|the true answer|w", "Loss L|one non-negative number|g", "Gradients|dL/dw for every weight|g", "Update|weights move downhill|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["The forward pass produces a prediction, which is compared with the target: what it should have been.", "L is small for a good match, large for a bad one.", "Backpropagation turns L into a gradient for each weight.", "The optimiser reduces L by changing the weights."]),
  },
  {
    t: "Mean squared error (regression)",
    lv: 1,
    s: `{{MSE = (1/n) Σ (yᵢ − ŷᵢ)²}}. Subtract to get the error, square it (so over- and under-predictions both count and big mistakes count much more), add them up and divide by n. Three deliveries: actual 20, 30, 40 minutes; predicted 18, 25, 44: errors 2, 5, −4, squares 4, 25, 16, MSE = 45/3 = 15 minutes². The units are squared; RMSE = √MSE = 3.87 minutes is back in minutes and MAE (mean absolute error) = 3.67 is more robust to outliers. Drag the prediction: the loss is a parabola with its minimum at the true value.`,
    r: `MSE is sensitive to outliers. If large errors are unusually frequent, compare MAE or Huber loss.`,
    i: `Compute MSE for actual [20, 30, 40] and predicted [18, 25, 44].`,
    c: py`
import numpy as np

y = np.array([20.0, 30.0, 40.0])
pred = np.array([18.0, 25.0, 44.0])
err = y - pred
print(err.tolist(), (err ** 2).tolist())
mse = float((err ** 2).mean())
print(mse, round(mse ** 0.5, 2), round(float(np.abs(err).mean()), 2))`,
    v: plot("Squared error as the prediction moves; the true value is the bottom of the U.", {
      x: [0, 75], y: [0, 2500], labels: ["predicted minutes", "squared error"],
      params: [par("a", "actual time", 5, 60, 1, 30), par("p", "predicted time", 0, 75, 1, 20)],
      readout: ["error = {a} − {p} = {a-p}   →   squared error = {(a-p)^2}"],
      steps: [["Actual 30, predicted 20: error 10, loss 100.", { a: 30, p: 20 }], ["Predicted 45: error −15, loss 225.", { a: 30, p: 45 }], ["Predicted 30: loss 0.", { a: 30, p: 30 }]],
    }, [curve("(a-x)^2", { c: "info" }), pt("p", "(a-p)^2", { c: "bad" })]),
  },
  {
    t: "Binary cross-entropy",
    lv: 1,
    s: `For a yes/no target with predicted probability p (from a sigmoid): {{L = −[y ln p + (1 − y) ln(1 − p)]}}. If y = 1 it reduces to −ln p; if y = 0 to −ln(1 − p). Student passed (y = 1): p = 0.99 → 0.010 (very good), 0.80 → 0.223, 0.50 → 0.693 (uncertain), 0.20 → 1.609, 0.01 → 4.605 (confidently wrong). The logarithm makes a confident wrong answer expensive. In fraud screening with y = 1 and p = 0.9 the loss is 0.105; at p = 0.01 it is 4.605. Choose the truth and drag p.`,
    r: `For binary classification the final logit goes through a sigmoid; libraries offer BCE-with-logits, which fuses the two for numerical stability.`,
    i: `Why is a confident wrong prediction punished so heavily by cross-entropy?`,
    c: py`
import numpy as np

for p in (0.99, 0.80, 0.50, 0.20, 0.01):
    print(p, round(float(-np.log(p)), 3))
print(round(float(-np.log(1 - 0.99)), 3))`,
    v: plot("Loss for a true 'pass' (green) and a true 'fail' (pink) as the predicted P(pass) changes.", {
      x: [0, 1], y: [0, 5], labels: ["predicted P(pass)", "loss"],
      params: [par("p", "predicted P(pass)", 0.01, 0.99, 0.01, 0.8)],
      readout: ["if the student passed: −ln({p}) = {-ln(p):3}   ·   if failed: −ln(1 − {p}) = {-ln(1-p):3}"],
      steps: [["p = 0.8, student passed: 0.223.", { p: 0.8 }], ["p = 0.01, student passed: 4.605.", { p: 0.01 }], ["p = 0.99 but the student failed: 4.605 again.", { p: 0.99 }]],
    }, [curve("-ln(x)", { c: "good", from: "0.01", to: "0.99", label: "y = 1" }), curve("-ln(1-x)", { c: "bad", from: "0.01", to: "0.99", label: "y = 0" }), pt("p", "-ln(p)", { c: "good" }), pt("p", "-ln(1-p)", { c: "bad" })]),
  },
  {
    t: "Categorical cross-entropy",
    lv: 1,
    s: `For one example among several mutually exclusive classes: {{CCE = −Σ yₖ ln pₖ}}. With a one-hot target only the true class has yₖ = 1, so the sum collapses to {{−ln(probability given to the true class)}}. A ticket scored Billing 2, Technical 1, Delivery 0 gets softmax probabilities 0.665, 0.245, 0.090; if the truth is Billing the loss is −ln 0.665 = 0.408; if it were Delivery, −ln 0.090 = 2.408. Raising the true class's score lowers the loss; the other classes only matter through the softmax normalisation. Choose the true class and drag the scores.`,
    r: `In PyTorch, CrossEntropyLoss expects raw logits, not softmax output; it applies a stable log-softmax internally.`,
    i: `Compute the CCE of softmax output (0.1, 0.7, 0.2) when the true class is the third.`,
    c: py`
import numpy as np

z = np.array([2.0, 1.0, 0.0])
p = np.exp(z) / np.exp(z).sum()
print(p.round(3).tolist())
for true in range(3):
    print(true, round(float(-np.log(p[true])), 3))
print(round(float(-np.log(0.2)), 3))`,
    v: bars("Probability of each class; the loss uses only the true class.", [["Billing", "exp(a)/(exp(a)+exp(b)+exp(c))"], ["Technical", "exp(b)/(exp(a)+exp(b)+exp(c))"], ["Delivery", "exp(c)/(exp(a)+exp(b)+exp(c))"]], {
      percent: true,
      params: [par("a", "Billing score", -4, 6, 0.2, 2), par("b", "Technical score", -4, 6, 0.2, 1), par("c", "Delivery score", -4, 6, 0.2, 0)],
      readout: ["if the truth is Billing: loss = {ln(exp(a)+exp(b)+exp(c))-a:3}  ·  Technical: {ln(exp(a)+exp(b)+exp(c))-b:3}  ·  Delivery: {ln(exp(a)+exp(b)+exp(c))-c:3}"],
      steps: [["(2, 1, 0): loss 0.408 if the truth is Billing.", { a: 2, b: 1, c: 0 }], ["Raise Billing to 5: the loss for a true Billing drops to 0.05.", { a: 5, b: 1, c: 0 }]],
    }),
  },
  {
    t: "One-hot or integer labels, and why losses want logits",
    lv: 2,
    s: `A digit label can be stored as an integer (2) or one-hot ([0,0,1,0,0,0,0,0,0,0]). Categorical cross-entropy takes one-hot targets; {{sparse categorical cross-entropy}} takes the integer and computes the same loss without building the vector. For true digit 7 and p₇ = 0.8 both give −ln 0.8 = 0.2231. Libraries prefer logits because computing log(softmax(z)) directly overflows for large scores: with logits (1000, 999) a naive softmax gives NaN, while subtracting the maximum first gives the correct 0.731 / 0.269.`,
    r: `Pass raw logits to the stable loss functions (from_logits=True in Keras) and do not apply softmax yourself first.`,
    i: `Why does a stable cross-entropy subtract the maximum logit?`,
    c: py`
import numpy as np

p = np.full(10, 0.2 / 9)
p[7] = 0.8
one_hot = np.eye(10)[7]
print(round(float(-(one_hot * np.log(p)).sum()), 4), round(float(-np.log(p[7])), 4))
z = np.array([1000.0, 999.0])
with np.errstate(all="ignore"):
    naive = np.exp(z) / np.exp(z).sum()
stable = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print(naive.tolist(), stable.round(3).tolist())`,
    v: compare("Two label formats, one loss value.", ["Integer (sparse)", "One-hot"], [
      ["Digit 2 stored as", "2", "[0, 0, 1, 0, 0, 0, 0, 0, 0, 0]"],
      ["Keras loss", "sparse_categorical_crossentropy", "categorical_crossentropy"],
      ["Value for p(true) = 0.8", "−ln 0.8 = 0.2231", "−ln 0.8 = 0.2231"],
      ["Memory", "1 number per example", "10 numbers per example"],
    ]),
  },
];

void [L, P, area, hline, trace, vline];
