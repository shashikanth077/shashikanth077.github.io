import { L, bars, cells, curve, flow, hline, line, matmul, par, plot, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

const f = (n: number, d = 3) => n.toFixed(d);
/** Format like Python's round(): trailing zeros trimmed, but a whole number keeps ".0". */
const pyr = (n: number, d: number) => {
  const t = Number(n.toFixed(d)).toString();
  return t.includes(".") ? t : `${t}.0`;
};

/* ------------------------------------------------------------------ */
// Numbers for the single sigmoid neuron: x = 2, w = 0.5, b = 0, target t = 1.
const bx = 2;
const bw = 0.5;
const bz = bw * bx;
const ba = 1 / (1 + Math.exp(-bz));
const bE = 0.5 * (ba - 1) ** 2;
const dEda = ba - 1;
const dadz = ba * (1 - ba);
const dEdw = dEda * dadz * bx;
const bw2 = bw - 0.5 * dEdw;

// Least-squares fit for the scatter plot.
const data: [number, number][] = [[1, 2], [2, 2.6], [3, 4.2], [4, 4.0], [5, 6], [6, 6.2], [7, 8.4], [8, 8], [9, 10.5]];
const mxD = data.reduce((s, [x]) => s + x, 0) / data.length;
const myD = data.reduce((s, [, y]) => s + y, 0) / data.length;
const wBest = data.reduce((s, [x, y]) => s + (x - mxD) * (y - myD), 0) / data.reduce((s, [x]) => s + (x - mxD) ** 2, 0);
const bBest = myD - wBest * mxD;
const mseExpr = `(${data.map(([x, y]) => `(w*${x}+b-${y})^2`).join("+")})/${data.length}`;

export const nn: ConceptDef[] = [
  {
    t: "One neuron: weighted sum, then activation",
    lv: 1,
    s: `A neuron does two things. First a weighted sum of its inputs plus a bias, {{z = w·x + b}} — a dot product. Then it passes z through an activation function to get its output {{a = σ(z)}}. Everything in a neural network is many copies of this.`,
    r: `A "layer" is just many neurons sharing the same inputs — which is a matrix multiplication.`,
    i: `Walk through what one neuron computes, step by step, for inputs [2, 3] with weights [0.5, −1] and bias 0.5.`,
    c: py`
import math
x, w, b = [2, 3], [0.5, -1], 0.5
z = sum(xi * wi for xi, wi in zip(x, w)) + b
a = 1 / (1 + math.exp(-z))
print(z, round(a, 4))`,
    o: `-1.5 0.1824`,
    v: flow("Inputs × weights, add the bias, then squash: that is a neuron.", "row",
      ["x = [2, 3]|inputs|i", "w = [0.5, −1]|weights|i", "z = −1.5|2×0.5 + 3×(−1) + 0.5|w", "a = σ(z)|≈ 0.182|g"],
      [[0, 2, "× weights"], [1, 2, "+ bias 0.5"], [2, 3, "activation"]],
      undefined,
      ["Each input is multiplied by its weight and summed: 2·0.5 + 3·(−1) = −2.", "Add the bias 0.5: z = −1.5.", "Squash with a sigmoid: σ(−1.5) ≈ 0.182 — the neuron's output."]),
  },
  {
    t: "Linear regression: one training step by hand",
    lv: 1,
    s: `One neuron, one example, no tricks. Predict, measure the loss, find the gradient with the chain rule, update. Target 10 for input x = 2, starting at w = 1, b = 0, learning rate 0.05: the prediction jumps from 2 to 6 and the loss falls from 64 to 16 in a single step. Repeat thousands of times and you have training.`,
    r: `Every optimiser step — however huge the model — is this same four-stage recipe.`,
    i: `Compute the gradients of the squared error for w and b in this example.`,
    c: py`
x, t = 2, 10
w, b, lr = 1.0, 0.0, 0.05
pred = w * x + b
loss = (pred - t) ** 2
dp = 2 * (pred - t)
gw, gb = dp * x, dp * 1
w, b = w - lr * gw, b - lr * gb
print(pred, loss, gw, gb)
print(w, b, w * x + b, ((w * x + b) - t) ** 2)`,
    o: `2.0 64.0 -32.0 -16.0\n2.6 0.8 6.0 16.0`,
    v: trace("Predict → loss → gradients → update: the whole of training in nine lines.", py`
x, t = 2, 10
w, b, lr = 1.0, 0.0, 0.05
pred = w * x + b
loss = (pred - t) ** 2
dp = 2 * (pred - t)
gw, gb = dp * x, dp * 1
w, b = w - lr * gw, b - lr * gb
print(pred, loss, gw, gb)
print(w, b, w * x + b, ((w * x + b) - t) ** 2)`, [
      [1, { x: "2", t: "10" }, undefined, "One example: input 2, target 10."],
      [2, { w: "1.0", b: "0.0", lr: "0.05" }],
      [3, { pred: "2.0" }, undefined, "1.0 × 2 + 0 = 2. The target is 10 — far off."],
      [4, { loss: "64.0" }, undefined, "(2 − 10)² = 64."],
      [5, { dp: "-16.0" }, undefined, "Slope of the loss with respect to the prediction: 2(2 − 10) = −16."],
      [6, { gw: "-32.0", gb: "-16.0" }, undefined, "Chain rule: dL/dw = −16 × x = −32 and dL/db = −16 × 1 = −16."],
      [7, { w: "2.6", b: "0.8" }, undefined, "w = 1 − 0.05(−32) = 2.6 and b = 0 − 0.05(−16) = 0.8."],
      [8, undefined, "2.0 64.0 -32.0 -16.0"],
      [9, undefined, "2.6 0.8 6.0 16.0", "New prediction 2.6×2 + 0.8 = 6.0 and the loss fell from 64 to 16."],
    ]),
  },
  {
    t: "Fitting a line: least squares",
    lv: 2,
    s: `Given many noisy points, which line is best? Measure each point's vertical distance to the line (the residual), square them, and average: the mean squared error. The best line has the smallest MSE, and for one feature it has a closed form: slope = cov(x, y) / var(x). Gradient descent finds the same line by taking steps.`,
    r: `Linear regression is the baseline for every prediction problem, and its loss surface is the friendliest bowl in ML.`,
    i: `What does least squares minimise, and why squares?`,
    c: py`
xs = [1, 2, 3, 4, 5, 6, 7, 8, 9]
ys = [2, 2.6, 4.2, 4.0, 6, 6.2, 8.4, 8, 10.5]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
b = my - w * mx
print(round(w, 3), round(b, 3))`,
    o: `${pyr(wBest, 3)} ${pyr(bBest, 3)}`,
    v: plot("Each dashed segment is a residual. The best line makes the squared residuals smallest.", { x: [0, 10], y: [0, 12], labels: ["hours studied x", "score y"],
      params: [par("w", "slope w", 0, 2, 0.05, 0.5), par("b", "intercept b", -2, 4, 0.1, 2)],
      readout: ["line: y = {w}·x + {b}", `mean squared error = {${mseExpr}:3}`],
      steps: [
        ["A poor guess: a flat line far from the points — large residuals.", { w: 0.2, b: 5 }],
        ["Better: tilt it up.", { w: 0.8, b: 1.5 }],
        [`The least-squares line (w ≈ ${f(wBest, 2)}, b ≈ ${f(bBest, 2)}) has the smallest error.`, { w: Math.round(wBest * 100) / 100, b: Math.round(bBest * 100) / 100 }],
      ] }, [
      curve("w*x+b", { c: "accent" }),
      ...data.map(([x, y]) => seg(String(x), String(y), String(x), "w*" + x + "+b", { c: "warn", dash: true })),
      ...data.map(([x, y]) => pt(String(x), String(y), { c: "info" })),
    ]),
  },
  {
    t: "Logistic regression and the decision boundary",
    lv: 2,
    s: `For yes/no answers, take the linear score {{z = w·x + b}} and squash it with a sigmoid to get a probability: {{P(yes) = σ(z)}}. The decision boundary is where that probability is 0.5, i.e. z = 0. Training adjusts w and b with cross-entropy loss so the curve separates the classes.`,
    r: `Logistic regression is the simplest classifier and the final layer of many deep models.`,
    i: `Where is the decision boundary of a logistic model, and what does the weight control?`,
    c: py`
import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
w, b = 1.0, -4.0
for hours in [2, 4, 6]:
    print(hours, round(sigmoid(w * hours + b), 3))`,
    o: `2 0.119\n4 0.5\n6 0.881`,
    v: plot("The S-curve gives the chance of 'pass'; the boundary sits where it crosses 50%.", { x: [0, 9], y: [-0.1, 1.1], labels: ["hours studied", "P(pass)"],
      params: [par("w", "weight w", 0.1, 3, 0.1, 1), par("b", "bias b", -9, 0, 0.5, -4)],
      readout: ["P(pass) = σ({w}·hours + ({b}))", "boundary at hours = −b / w = {-b/w:2}     P(pass | 5 h) = {sigmoid(5*w+b):3}"],
      steps: [
        ["A gentle curve: the model is unsure everywhere.", { w: 0.4, b: -1.5 }],
        ["w = 1, b = −4: the boundary sits at 4 hours.", { w: 1, b: -4 }],
        ["A steeper weight makes the model more decisive around the boundary.", { w: 2, b: -8 }],
      ] }, [
      hline("0.5", { c: "muted", dash: true }),
      curve("sigmoid(w*x+b)", { c: "accent" }),
      vline("-b/w", { c: "warn", dash: true, label: "boundary" }),
      ...[[1, 0], [2, 0], [3, 0], [4.5, 0]].map(([x, y]) => pt(String(x), String(y), { c: "bad" })),
      ...[[3.5, 1], [5, 1], [6, 1], [7.5, 1]].map(([x, y]) => pt(String(x), String(y), { c: "good" })),
    ]),
  },
  {
    t: "Backpropagation through a sigmoid neuron",
    lv: 2,
    s: `Backpropagation is the chain rule run backwards. Forward: z = wx + b, a = σ(z), E = ½(a − t)². Backward: the slope of E with respect to w is the product of the slopes along the path — {{∂E/∂a · ∂a/∂z · ∂z/∂w}} = (a − t) · a(1 − a) · x. Then update w against that gradient.`,
    r: `Frameworks like PyTorch build this chain automatically (autograd); knowing the mechanics lets you debug vanishing gradients and shape errors.`,
    i: `Write ∂E/∂w for a sigmoid neuron as a product of three local derivatives.`,
    c: py`
import math
x, w, b, t = 2, 0.5, 0.0, 1
z = w * x + b
a = 1 / (1 + math.exp(-z))
E = 0.5 * (a - t) ** 2
dE_da = a - t
da_dz = a * (1 - a)
dE_dw = dE_da * da_dz * x
print(round(z, 3), round(a, 4), round(E, 4))
print(round(dE_dw, 4))
w = w - 0.5 * dE_dw
print(round(w, 4))`,
    o: `${pyr(bz, 3)} ${pyr(ba, 4)} ${pyr(bE, 4)}\n${pyr(dEdw, 4)}\n${pyr(bw2, 4)}`,
    v: trace("Forward pass first; then multiply the local slopes backwards to get the gradient.", py`
import math
x, w, b, t = 2, 0.5, 0.0, 1
z = w * x + b
a = 1 / (1 + math.exp(-z))
E = 0.5 * (a - t) ** 2
dE_da = a - t
da_dz = a * (1 - a)
dE_dw = dE_da * da_dz * x
print(round(z, 3), round(a, 4), round(E, 4))
print(round(dE_dw, 4))
w = w - 0.5 * dE_dw
print(round(w, 4))`, [
      [2, { x: "2", w: "0.5", b: "0.0", t: "1" }, undefined, "Input 2, weight 0.5, target 1."],
      [3, { z: f(bz, 3) }, undefined, "Forward: z = 0.5 × 2 + 0 = 1."],
      [4, { a: f(ba, 4) }, undefined, "Forward: a = σ(1) ≈ 0.7311."],
      [5, { E: f(bE, 4) }, undefined, "Forward: error E = ½(0.7311 − 1)² ≈ 0.0362."],
      [6, { dE_da: f(dEda, 4) }, undefined, "Backward, link 1: how the error changes with the output, a − t."],
      [7, { da_dz: f(dadz, 4) }, undefined, "Backward, link 2: the sigmoid's slope, a(1 − a)."],
      [8, { dE_dw: f(dEdw, 4) }, undefined, "Link 3 is ∂z/∂w = x = 2. Multiply all three: −0.2689 × 0.1966 × 2."],
      [9, undefined, `${pyr(bz, 3)} ${pyr(ba, 4)} ${pyr(bE, 4)}`],
      [10, undefined, pyr(dEdw, 4)],
      [11, { w: f(bw2, 4) }, undefined, "Gradient descent: w = 0.5 − 0.5 × (−0.1058) ≈ 0.5529 — the output moves toward the target."],
      [12, undefined, pyr(bw2, 4)],
    ]),
  },
  {
    t: "Backpropagation as a computational graph",
    lv: 2,
    s: `Draw the calculation as a graph: nodes hold values, edges are operations. The forward pass fills in the values left to right. The backward pass starts at the loss and, at every node, multiplies the incoming slope by that node's local slope — passing a gradient to each earlier input. Every weight ends up with its own gradient.`,
    r: `Autograd systems (PyTorch, JAX, TensorFlow) record exactly this graph while the forward pass runs.`,
    i: `What is stored during the forward pass so that the backward pass can be computed?`,
    c: py`
# slopes multiply along the path  w -> z -> a -> E
local = [2, 0.1966, -0.2689]      # dz/dw, da/dz, dE/da  (from the previous example)
grad = 1
for s in local:
    grad *= s
print(round(grad, 4))`,
    o: `-0.1057`,
    v: flow("Values flow forward; slopes flow backward and multiply at every node.", "row",
      ["w = 0.5|weight|i", "z = wx + b|= 1|w", "a = σ(z)|= 0.731|w", "E|= 0.036|b"],
      [[0, 1, "× x"], [1, 2, "σ"], [2, 3, "½(a−t)²"], [3, 2, "∂E/∂a = −0.269"], [2, 1, "× σ′ = 0.197"], [1, 0, "× x = 2"]],
      [0, 1, 2, 3, 4, 5],
      ["Forward: the weight and input make z.", "Forward: the sigmoid turns z into the output a.", "Forward: the output is compared with the target to give the error E.", "Backward: start at the loss — how does E change with a? −0.269.", "Backward: multiply by the sigmoid's slope 0.197 → ∂E/∂z ≈ −0.053.", "Backward: multiply by x = 2 → ∂E/∂w ≈ −0.106. Every weight gets its gradient this way."]),
  },
  {
    t: "Forward pass through a small network",
    lv: 2,
    s: `A network is layers of matrix multiplications with activations between them. For two inputs and two hidden units, compute {{h = ReLU(xW₁ + b₁)}}, then the output {{y = h · W₂}}. Track the shapes: (1×2)(2×2) = (1×2), then (1×2)(2×1) = (1×1).`,
    r: `This is exactly what the forward pass of any feed-forward network does, with bigger matrices.`,
    i: `Write the shapes at each step of the forward pass for a batch of 32 examples with 2 inputs and 2 hidden units.`,
    c: py`
relu = lambda v: [max(0, a) for a in v]
x = [1, 2]
W1 = [[0.5, -1], [1, 0.5]]
b1 = [0.5, -0.5]
h = relu([sum(xi * W1[i][j] for i, xi in enumerate(x)) + b1[j] for j in range(2)])
W2 = [1, 2]
y = sum(hj * wj for hj, wj in zip(h, W2))
print(h, y)`,
    o: `[3.0, 0] 3.0`,
    v: matmul("First layer: one example through two neurons. ReLU then zeroes the negative one.", [[1, 2]], [[0.5, -1], [1, 0.5]], ["x", "W₁", "pre-activation"], [0.5, -0.5]),
  },
  {
    t: "Convolution: a sliding filter",
    lv: 2,
    s: `A convolution slides a small filter (kernel) along the input and takes a dot product at every position. The filter [1, 0, −1] responds to changes, an edge detector. The same few weights are reused everywhere, which is why CNNs need far fewer parameters than dense layers. Output size: {{(n − f + 2p) / s + 1}}.`,
    r: `CNNs detect edges, textures and shapes with sliding filters; the same idea works on time series and audio.`,
    i: `What is the output length for input 5, filter 3, padding 0 and stride 1?`,
    c: py`
x = [1, 2, 3, 4, 5]
k = [1, 0, -1]
out = [sum(x[i + j] * k[j] for j in range(3)) for i in range(len(x) - 2)]
print(out)
n, f, p, s = 5, 3, 0, 1
print((n - f + 2 * p) // s + 1)`,
    o: `[-2, -2, -2]\n3`,
    v: cells("The filter slides one step at a time; each position gives one output.", [L("input", ["1", "2", "3", "4", "5"], "pos"), L("kernel", ["1", "0", "-1"], "pos"), L("output", [], "pos")], [
      ["An input of five values and a filter of three weights [1, 0, −1]."],
      ["Position 0: 1·1 + 2·0 + 3·(−1) = −2.", [[0, 0, 2]], [L("input", ["1", "2", "3", "4", "5"], "pos"), L("kernel", ["1", "0", "-1"], "pos"), L("output", ["-2"], "pos")]],
      ["Slide one step: 2·1 + 3·0 + 4·(−1) = −2.", [[0, 1, 3]], [L("input", ["1", "2", "3", "4", "5"], "pos"), L("kernel", ["1", "0", "-1"], "pos"), L("output", ["-2", "-2"], "pos")]],
      ["Slide again: 3·1 + 4·0 + 5·(−1) = −2. Output length (5 − 3)/1 + 1 = 3.", [[0, 2, 4]], [L("input", ["1", "2", "3", "4", "5"], "pos"), L("kernel", ["1", "0", "-1"], "pos"), L("output", ["-2", "-2", "-2"], "pos")]],
    ]),
  },
  {
    t: "Attention: dot products, softmax and √d",
    lv: 3,
    s: `Attention lets a token look at all others. Compare the query with every key by dot product, divide by {{√d}} to keep the numbers tame, turn the scores into weights with softmax, and use those weights to mix the values. The weights are non-negative and sum to 1 — a weighted average of what to focus on.`,
    r: `This is the core of every Transformer and large language model.`,
    i: `Why divide the attention scores by √d before the softmax?`,
    c: py`
import math
q = [2, 1]
keys = [[1, 0], [0, 1], [1, 1]]
d = len(q)
scores = [sum(a * b for a, b in zip(q, k)) / math.sqrt(d) for k in keys]
exps = [math.exp(s) for s in scores]
weights = [e / sum(exps) for e in exps]
print([round(w, 3) for w in weights])`,
    o: `[0.284, 0.14, 0.576]`,
    v: bars("Change the query and the attention weights re-balance across the three keys.", [["key 1 (1, 0)", "e1/(e1+e2+e3)"], ["key 2 (0, 1)", "e2/(e1+e2+e3)"], ["key 3 (1, 1)", "e3/(e1+e2+e3)"]], {
      percent: true,
      params: [par("q1", "query: q₁", -2, 3, 0.1, 2), par("q2", "query: q₂", -2, 3, 0.1, 1)],
      defs: [["s1", "q1/sqrt(2)"], ["s2", "q2/sqrt(2)"], ["s3", "(q1+q2)/sqrt(2)"], ["e1", "exp(s1)"], ["e2", "exp(s2)"], ["e3", "exp(s3)"]],
      readout: ["scores q·k/√2 = {s1:2}, {s2:2}, {s3:2}", "softmax → weights that add up to 1"],
    }),
  },
  {
    t: "Initialisation and keeping training stable",
    lv: 3,
    s: `Start the weights too small and signals shrink to nothing layer by layer; too large and they explode. Initialisation chooses the spread so the signal keeps about the same size: with n inputs, a weight standard deviation of about {{1/√n}} keeps the output variance near 1. Normalisation layers and L2/dropout regularisation keep it stable during training.`,
    r: `Xavier/He initialisation, batch/layer normalisation and gradient clipping are standard tools for stable deep-network training.`,
    i: `Why not initialise all weights to zero, or to large random values?`,
    c: py`
import math
n = 100
for sigma in [0.01, 0.1, 0.3]:
    print(sigma, round(n * sigma ** 2, 3))
print(round(1 / math.sqrt(n), 3))`,
    o: `0.01 0.01\n0.1 1.0\n0.3 9.0\n0.1`,
    v: plot("With 100 inputs, the output variance is 100·σ². Too small vanishes; too large explodes; 1/√100 = 0.1 is just right.", { x: [0, 0.3], y: [0, 5], labels: ["weight spread σ", "output variance"],
      params: [par("s", "weight σ", 0.01, 0.3, 0.01, 0.1)],
      readout: ["σ = {s} → output variance = 100 × {s}² = {100*s^2:3}", "σ = 1/√100 = 0.1 keeps the variance at 1"] }, [
      hline("1", { c: "good", dash: true, label: "target: 1" }),
      curve("100*x^2", { c: "accent" }),
      pt("s", "100*s^2", { c: "warn" }),
    ]),
  },
  {
    t: "The whole training loop",
    lv: 2,
    s: `Training repeats one cycle: forward pass (predict), loss (how wrong), backward pass (gradients by the chain rule), update (step against the gradient). Over many epochs the loss falls. Every algorithm in this track — linear regression to Transformers — is this loop with different layers.`,
    r: `If you can write this loop from scratch, you understand what frameworks like PyTorch do for you.`,
    i: `Describe the four stages of a training step in order.`,
    c: py`
xs, ys = [1, 2, 3], [3, 5, 7]          # y = 2x + 1
w, b, lr = 0.0, 0.0, 0.05
for epoch in range(3):
    gw = gb = 0
    for x, y in zip(xs, ys):
        err = (w * x + b) - y
        gw += 2 * err * x / len(xs)
        gb += 2 * err / len(xs)
    w, b = w - lr * gw, b - lr * gb
    loss = sum(((w * x + b) - y) ** 2 for x, y in zip(xs, ys)) / len(xs)
    print(epoch + 1, round(w, 3), round(b, 3), round(loss, 3))`,
    o: `1 1.133 0.5 5.489\n2 1.638 0.723 1.09\n3 1.862 0.823 0.217`,
    v: flow("Predict, measure, differentiate, update — and round again.", "cycle",
      ["Forward pass|predict ŷ from x|i", "Loss|how wrong is ŷ?|w", "Backward pass|gradients via the chain rule|w", "Update|w ← w − η · gradient|g"],
      [[0, 1], [1, 2], [2, 3], [3, 0, "next batch / epoch"]],
      [0, 1, 2, 3],
      ["The inputs flow through the layers to produce predictions.", "The loss turns predictions and targets into a single number.", "Backpropagation gives every weight its gradient.", "The optimiser nudges every weight against its gradient — then the loop repeats."]),
  },
];

/* ------------------------------------------------------------------ */
// PCA example data.
const px = [-3, -2, -1, 0, 1, 2, 3, 0.5];
const py2 = [-2.2, -1.9, -0.6, 0.3, 0.9, 1.4, 2.5, 0.2];
const pn = px.length;
const pmx = px.reduce((s, v) => s + v, 0) / pn;
const pmy = py2.reduce((s, v) => s + v, 0) / pn;
const sxx = px.reduce((s, v) => s + (v - pmx) ** 2, 0) / pn;
const syy = py2.reduce((s, v) => s + (v - pmy) ** 2, 0) / pn;
const sxy = px.reduce((s, v, i) => s + (v - pmx) * ((py2[i] as number) - pmy), 0) / pn;
const pTheta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
const projVar = px.map((v, i) => `((${v}-${f(pmx, 4)})*cos(t)+(${py2[i]}-${f(pmy, 4)})*sin(t))^2`).join("+");

export const ml: ConceptDef[] = [
  {
    t: "k-nearest neighbours",
    lv: 2,
    s: `To classify a new point, find its k closest training points (by distance) and let them vote. No training at all — the data is the model. It works well in low dimensions and breaks down when features are on different scales or there are too many of them, which is why scaling matters.`,
    r: `Retrieval and embedding search ("find the most similar items") are nearest-neighbour search at scale.`,
    i: `Why must features be scaled before using k-NN?`,
    c: py`
import math
data = [((1, 1), "A"), ((2, 1.5), "A"), ((1.5, 2.5), "A"), ((4, 4), "B"), ((4.5, 3), "B"), ((3.5, 4.5), "B")]
q = (2.5, 2.0)
nearest = sorted(data, key=lambda item: math.dist(q, item[0]))[:3]
labels = [label for _, label in nearest]
print(labels, max(set(labels), key=labels.count))`,
    o: `['A', 'A', 'A'] A`,
    v: plot("Drag the query point: the class of its nearest neighbours decides its label.", { x: [0, 6], y: [0, 6], labels: ["feature 1", "feature 2"],
      params: [par("qx", "query x", 0, 6, 0.1, 2.5), par("qy", "query y", 0, 6, 0.1, 2)],
      readout: ["distance to nearest A = {min(sqrt((qx-1)^2+(qy-1)^2), sqrt((qx-2)^2+(qy-1.5)^2), sqrt((qx-1.5)^2+(qy-2.5)^2)):2}", "distance to nearest B = {min(sqrt((qx-4)^2+(qy-4)^2), sqrt((qx-4.5)^2+(qy-3)^2), sqrt((qx-3.5)^2+(qy-4.5)^2)):2}   → the closer class wins"] }, [
      ...[[1, 1], [2, 1.5], [1.5, 2.5], [4, 4], [4.5, 3], [3.5, 4.5]].map(([x, y]) => seg("qx", "qy", String(x), String(y), { c: "muted", dash: true })),
      ...[[1, 1], [2, 1.5], [1.5, 2.5]].map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      ...[[4, 4], [4.5, 3], [3.5, 4.5]].map(([x, y]) => pt(String(x), String(y), { c: "warn" })),
      pt("qx", "qy", { c: "accent", label: "query" }),
    ]),
  },
  {
    t: "k-means clustering",
    lv: 2,
    s: `k-means groups unlabeled points. Place k centres, assign every point to its nearest centre, move each centre to the mean of its points, and repeat until nothing changes. Each round is just distance and averaging. The result depends on the starting centres, so it is usually run several times.`,
    r: `Used to group customers, compress colours and build vocabularies of image or audio features.`,
    i: `Describe one iteration of k-means.`,
    c: py`
points = [1, 2, 3, 10, 11, 12]
c1, c2 = 2, 5
for _ in range(3):
    g1 = [p for p in points if abs(p - c1) <= abs(p - c2)]
    g2 = [p for p in points if abs(p - c1) > abs(p - c2)]
    c1, c2 = sum(g1) / len(g1), sum(g2) / len(g2)
    print(c1, c2)`,
    o: `2.0 11.0\n2.0 11.0\n2.0 11.0`,
    v: plot("Blue points belong to centre 1, orange to centre 2; centres then move to the mean of their group.", { x: [0, 13], y: [-1, 1], labels: ["value", ""],
      params: [par("c1", "centre 1", 0, 13, 0.1, 2), par("c2", "centre 2", 0, 13, 0.1, 5)],
      defs: [
        ...[1, 2, 3, 10, 11, 12].map((p, i): [string, string] => [`a${i}`, `step(abs(${p}-c2)-abs(${p}-c1)+0.000001)`]),
        ["n1", [0, 1, 2, 3, 4, 5].map((i) => `a${i}`).join("+")],
        ["m1", `(${[1, 2, 3, 10, 11, 12].map((p, i) => `${p}*a${i}`).join("+")})/n1`],
        ["m2", `(${[1, 2, 3, 10, 11, 12].map((p, i) => `${p}*(1-a${i})`).join("+")})/(6-n1)`],
      ],
      readout: ["{n1} points in group 1 → new centre 1 = {m1:2}", "{6-n1} points in group 2 → new centre 2 = {m2:2}"],
      steps: [
        ["Start with centres at 2 and 5. Each point joins its nearest centre.", { c1: 2, c2: 5 }],
        ["Move each centre to the mean of its group: 2 and 11. Now the groups are clearly separated.", { c1: 2, c2: 11 }],
      ] }, [
      ...[1, 2, 3, 10, 11, 12].map((p, i) => pt(String(p), "0", { c: "info", show: `a${i}-0.5` })),
      ...[1, 2, 3, 10, 11, 12].map((p, i) => pt(String(p), "0", { c: "warn", show: `0.5-a${i}` })),
      pt("c1", "0.4", { c: "info", label: "centre 1" }),
      pt("c2", "0.4", { c: "warn", label: "centre 2" }),
    ]),
  },
  {
    t: "PCA: the direction of most variance",
    lv: 3,
    s: `PCA finds new axes along which the data varies most. Centre the data, compute its covariance matrix, and take its eigenvectors: the first principal component is the direction with the largest eigenvalue (variance). Projecting onto the top few components compresses the data while keeping most of its information.`,
    r: `Used to reduce hundreds of features to a few, visualise embeddings in 2D, and remove redundant correlated inputs.`,
    i: `What does the first principal component represent, and how is it related to the covariance matrix?`,
    c: py`
import math
xs = [-3, -2, -1, 0, 1, 2, 3, 0.5]
ys = [-2.2, -1.9, -0.6, 0.3, 0.9, 1.4, 2.5, 0.2]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
sxx = sum((x - mx) ** 2 for x in xs) / n
syy = sum((y - my) ** 2 for y in ys) / n
sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
theta = 0.5 * math.atan2(2 * sxy, sxx - syy)
print(round(math.degrees(theta), 1))`,
    o: `${f((pTheta * 180) / Math.PI, 1)}`,
    v: plot("Rotate the axis: the variance of the projected points peaks along the data's long direction.", { x: [-4, 4], y: [-4, 4], labels: ["feature 1", "feature 2"],
      params: [par("t", "axis angle (radians)", 0, 3.14, 0.02, 0.2)],
      defs: [["pv", `(${projVar})/${pn}`], ["tv", `${f(sxx + syy, 4)}`]],
      readout: ["variance along this axis = {pv:3}  of total {tv:3}  ({pv/tv*100:0}%)", `the best direction is about ${f(pTheta, 2)} rad (${f((pTheta * 180) / Math.PI, 0)}°) — it keeps the most variance`],
      steps: [
        ["A horizontal axis keeps only part of the spread.", { t: 0 }],
        [`Rotate to about ${f(pTheta, 2)} rad: the axis lies along the data and captures almost all of the variance.`, { t: Math.round(pTheta * 50) / 50 }],
        ["Turn to 90°: the axis cuts across the data and captures much less.", { t: 1.57 }],
      ] }, [
      line(f(pmx, 4), f(pmy, 4), "tan(t)", { c: "accent" }),
      ...px.map((v, i) => pt(String(v), String(py2[i]), { c: "info" })),
      pt(f(pmx, 4), f(pmy, 4), { c: "warn", label: "mean" }),
    ]),
  },
  {
    t: "Naive Bayes: combining evidence",
    lv: 3,
    s: `Naive Bayes classifies by Bayes' theorem, assuming the features are independent given the class: multiply the prior by each word's likelihood and compare the classes. {{P(spam | free, win) ∝ P(spam) · P(free | spam) · P(win | spam)}}. The independence assumption is naive but works surprisingly well for text.`,
    r: `A fast, strong baseline for spam filtering and text classification.`,
    i: `What is the "naive" assumption in Naive Bayes?`,
    c: py`
prior_spam = 0.4
spam = prior_spam * 0.6 * 0.3                   # P(free|spam)=0.6, P(win|spam)=0.3
ham = (1 - prior_spam) * 0.05 * 0.02            # P(free|ham)=0.05, P(win|ham)=0.02
print(round(spam / (spam + ham), 3))`,
    o: `0.992`,
    v: bars("Each word multiplies the odds: 'free' and 'win' make 'spam' almost certain.", [["spam", "post"], ["not spam", "1-post"]], {
      percent: true,
      params: [par("prior", "prior P(spam)", 0.05, 0.95, 0.05, 0.4), par("free", "message contains 'free' (0/1)", 0, 1, 1, 1), par("win", "message contains 'win' (0/1)", 0, 1, 1, 1)],
      defs: [
        ["ss", "prior*(0.6^free*0.4^(1-free))*(0.3^win*0.7^(1-win))"],
        ["sh", "(1-prior)*(0.05^free*0.95^(1-free))*(0.02^win*0.98^(1-win))"],
        ["post", "ss/(ss+sh)"],
      ],
      readout: ["spam score = {ss:4}     not-spam score = {sh:4}", "P(spam | words) = {ss:4} / ({ss:4} + {sh:4}) = {post:3}"],
      steps: [
        ["No spammy words: the prior dominates, and the message looks like ham.", { free: 0, win: 0 }],
        ["The word 'free' multiplies the spam score by 12 — now it is likely spam.", { free: 1, win: 0 }],
        ["'free' and 'win' together: spam with 99% confidence.", { free: 1, win: 1 }],
      ] }),
  },
  {
    t: "Confusion matrix, precision, recall and F1",
    lv: 2,
    s: `Accuracy hides mistakes when classes are unbalanced. A confusion matrix counts true/false positives and negatives. Precision = of everything flagged, how much was right (TP ÷ (TP + FP)). Recall = of everything real, how much was found (TP ÷ (TP + FN)). F1 is their harmonic mean — high only when both are.`,
    r: `For rare-event detection (fraud, disease, urgent tickets) precision and recall matter far more than accuracy.`,
    i: `A model catches 40 of 60 real cases and raises 10 false alarms. What are its precision and recall?`,
    c: py`
tp, fp, fn, tn = 40, 10, 20, 130
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
accuracy = (tp + tn) / (tp + fp + fn + tn)
print(round(precision, 3), round(recall, 3), round(f1, 3), round(accuracy, 3))`,
    o: `0.8 0.667 0.727 0.85`,
    v: bars("Trade false alarms against missed cases and watch each score respond.", [["Precision", "prec"], ["Recall", "rec"], ["F1", "f1"], ["Accuracy", "acc"]], {
      percent: true,
      params: [par("tp", "true positives", 1, 100, 1, 40), par("fp", "false positives", 0, 100, 1, 10), par("fn", "false negatives", 0, 100, 1, 20)],
      defs: [["tn", "130"], ["prec", "tp/(tp+fp)"], ["rec", "tp/(tp+fn)"], ["f1", "2*prec*rec/(prec+rec)"], ["acc", "(tp+tn)/(tp+fp+fn+tn)"]],
      readout: ["TP = {tp}   FP = {fp}   FN = {fn}   TN = 130", "precision = {tp}/({tp}+{fp}) = {prec:3}     recall = {tp}/({tp}+{fn}) = {rec:3}"],
    }),
  },
  {
    t: "Train, validation and test sets",
    lv: 1,
    s: `Never judge a model on the data it learned from. Split the data: train to fit the weights, validation to tune choices (learning rate, model size, when to stop), and test — touched once at the end — for an honest final score. Cross-validation repeats the split to use small datasets efficiently.`,
    r: `Leaking test data into training (even through preprocessing) gives falsely optimistic results — a common and costly mistake.`,
    i: `What is each of the three sets used for, and why must the test set stay untouched?`,
    c: py`
n = 1000
train, val = int(0.7 * n), int(0.15 * n)
test = n - train - val
print(train, val, test)`,
    o: `700 150 150`,
    v: flow("Fit on train, tune on validation, report once on test.", "row",
      ["Dataset|1,000 rows|i", "Train|70% — fit the weights|g", "Validation|15% — tune choices|w", "Test|15% — final score, once|b"],
      [[0, 1, "split"], [0, 2, "split"], [0, 3, "split"]],
      undefined,
      ["The training set is the only data the weights see.", "The validation set guides decisions: learning rate, model size, early stopping.", "The test set is locked away until the very end for an unbiased estimate."]),
  },
];

void L;
