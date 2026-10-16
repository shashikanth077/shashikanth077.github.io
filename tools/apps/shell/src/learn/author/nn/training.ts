import { L, P, bars, cells, compare, curve, flow, hline, layers, line, par, plot, poly, pt, seg } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";

/* Every code example is plain NumPy and is RUN by `npm run outputs -- neural-networks`. */

/* One training example (3 km → 11 min), start w = 1, b = 2, learning rate 0.05. */
const gdStates = (() => {
  let w = 1;
  let b = 2;
  const out: { w: number; b: number; loss: number }[] = [];
  for (let i = 0; i <= 12; i++) {
    out.push({ w, b, loss: (w * 3 + b - 11) ** 2 / 2 });
    const e = w * 3 + b - 11;
    w -= 0.05 * e * 3;
    b -= 0.05 * e;
  }
  return out;
})();

export const learn: ConceptDef[] = [
  {
    t: "The food-delivery story: learning y = w·x + b",
    lv: 1,
    s: `A delivery app wants to predict minutes from distance. Records: 1 km → 5 min, 2 → 8, 3 → 11, 4 → 14. The simplest model is one neuron: {{prediction ŷ = w × distance + b}}. The weight w is minutes per extra kilometre; the bias b is the fixed start-up time. Training means finding good w and b. (The classroom data follow 3 km + 2 min exactly; real deliveries also depend on traffic, weather and kitchen time.)`,
    r: `This one-neuron regression is the seed of every deep network: the same forward pass, loss, gradient and update just repeat across layers.`,
    i: `What do w and b mean in ŷ = wx + b for the delivery problem?`,
    c: py`
import numpy as np

x = np.array([1, 2, 3, 4], dtype=float)
y = np.array([5, 8, 11, 14], dtype=float)
w, b = np.polyfit(x, y, 1)
print(round(float(w), 2), round(float(b), 2))`,
    v: cells("Four delivery records: distance in, minutes out.", table(["distance x (km)", "actual minutes y"], [["1", "5"], ["2", "8"], ["3", "11"], ["4", "14"]]), [
      ["Training examples: the inputs x and the known answers y."],
      ["Each extra kilometre adds 3 minutes: that is the weight w = 3.", [[1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1]]],
      ["At zero distance the order still takes 2 minutes: the bias b = 2.", [[1, 1, 1]]],
    ]),
  },
  {
    t: "Drawing the model: weight tilts the line, bias lifts it",
    lv: 1,
    s: `Plot each record as a dot: distance along x, minutes up y. The model ŷ = wx + b is a straight line; the weight is its steepness and the bias moves it up and down. Worked example: x = 3 km, w = 1, b = 2 → ŷ = 3 × 1 + 2 = 5 minutes, but the record says 11, so the model is wrong by 6. Drag w and b and watch the line chase the dots.`,
    r: `Training is exactly this fitting, done automatically: change w and b until the line passes close to the data.`,
    i: `With w = 1 and b = 2, what does the model predict for 3 km, and what is the error?`,
    c: py`
w, b, x, actual = 1.0, 2.0, 3, 11
pred = w * x + b
print(pred, actual - pred)`,
    v: plot("Orange dots: actual deliveries. The line is the model; the vertical segment is the error at the chosen distance.", {
      x: [0, 5], y: [0, 21], labels: ["distance (km)", "minutes"],
      params: [par("w", "weight w", -1, 5, 0.1, 1), par("b", "bias b", -3, 9, 0.1, 2), par("gx", "distance to predict", 0, 5, 1, 3)],
      readout: ["ŷ = {w} × {gx} + {b} = {w*gx+b:2} minutes   ·   the true time at {gx} km is {3*gx+2} minutes"],
      steps: [["w = 1, b = 2: far below the data.", { w: 1, b: 2, gx: 3 }], ["w = 3, b = 2: the line passes through every dot.", { w: 3, b: 2, gx: 3 }]],
    }, [line("0", "b", "w", { c: "accent", label: "model" }), ...[[1, 5], [2, 8], [3, 11], [4, 14]].map(([x, y]) => pt(String(x), String(y), { c: "warn" })), seg("gx", "3*gx+2", "gx", "w*gx+b", { c: "bad", dash: true }), pt("gx", "w*gx+b", { c: "good" })]),
  },
  {
    t: "Loss as a U-shaped curve",
    lv: 1,
    s: `To tell how wrong a prediction is we use {{half squared error L = ½(ŷ − y)²}}. The ½ cancels the 2 that appears when we differentiate; squaring makes under- and over-predictions both costly. For the 3 km trip (actual 11): predicting 5 gives error −6 and L = ½ × 36 = 18; predicting 11 gives 0. Plot L against the prediction and you get a U: the bottom is the right answer, and training means sliding down the U.`,
    r: `Squared error is a teaching choice for regression; classification uses cross-entropy.`,
    i: `Compute the half-squared-error loss when the prediction is 5 and the truth is 11.`,
    c: py`
import numpy as np

for pred in (5, 8, 11, 14):
    err = pred - 11
    print(pred, err, 0.5 * err ** 2)`,
    v: plot("Loss against the predicted minutes (actual = 11).", {
      x: [0, 20], y: [0, 65], labels: ["predicted minutes", "loss"],
      params: [par("p", "prediction ŷ", 0, 20, 0.5, 5)],
      readout: ["error = {p} − 11 = {p-11:1}  →  loss = ½({p-11:1})² = {(p-11)^2/2:2}"],
      steps: [["Prediction 5: loss 18.", { p: 5 }], ["Prediction 11: loss 0 — the bottom of the U.", { p: 11 }], ["Prediction 17: over-predicting costs as much as under-predicting.", { p: 17 }]],
    }, [curve("(x-11)^2/2", { c: "info" }), pt("p", "(p-11)^2/2", { c: "bad" })]),
  },
  {
    t: "The derivative: the slope of the loss right now",
    lv: 1,
    s: `Picture walking down a foggy hill: the slope tells you which way is downhill. The derivative is that slope. A positive gradient means "decrease the parameter"; a negative gradient means "increase it". For x = 3, y = 11, bias 2: ŷ = 3w + 2, L = ½(3w − 9)² and the slope is dL/dw = (3w − 9) × 3 — the error times the 3 that the weight multiplies. At w = 1 the slope is −18: the loss falls steeply as w increases. Drag w: the orange tangent flattens as you approach the minimum at w = 3.`,
    r: `A derivative can be checked numerically: (L(w + h) − L(w − h)) / 2h. This "gradient check" is how people debug hand-written backpropagation.`,
    i: `The gradient is −18. In which direction should the weight move?`,
    c: py`
loss = lambda w: 0.5 * (3 * w + 2 - 11) ** 2
w, h = 1.0, 1e-5
analytic = (3 * w - 9) * 3
numeric = (loss(w + h) - loss(w - h)) / (2 * h)
print(analytic, round(numeric, 3))`,
    v: plot("Loss against the weight (bias fixed at 2) with the tangent at the chosen w.", {
      x: [0, 5], y: [0, 42], labels: ["weight w", "loss"],
      params: [par("w", "weight w", 0, 5, 0.1, 1)],
      readout: ["error = 3·{w} + 2 − 11 = {3*w-9:2}   →   slope dL/dw = {(3*w-9)*3:2}   (negative: move w up)"],
      steps: [["w = 1: slope −18, steeply downhill to the right.", { w: 1 }], ["w = 3: slope 0 — the bottom.", { w: 3 }], ["w = 4.5: slope positive — move w down.", { w: 4.5 }]],
    }, [curve("(3*x-9)^2/2", { c: "info" }), line("w", "(3*w-9)^2/2", "(3*w-9)*3", { c: "warn" }), pt("w", "(3*w-9)^2/2", { c: "good" })]),
  },
  {
    t: "The chain rule: follow the effect backwards",
    lv: 2,
    s: `A weight does not touch the loss directly: it changes the prediction, and the prediction changes the loss. The {{chain rule}} multiplies the two slopes: {{dL/dw = (dL/dŷ) × (dŷ/dw)}}. For w = 1, b = 2, x = 3, y = 11: forward ŷ = 5, L = 18. dL/dŷ = ŷ − y = −6; dŷ/dw = x = 3; dŷ/db = 1. So dL/dw = −6 × 3 = −18 and dL/db = −6. With learning rate 0.05: w = 1 − 0.05 × (−18) = 1.9 and b = 2 − 0.05 × (−6) = 2.3. The new prediction is 1.9 × 3 + 2.3 = 8.0 and the loss falls from 18 to 4.5.`,
    r: `PyTorch and TensorFlow do this automatically (autograd); you still need the idea to interpret training problems.`,
    i: `Backpropagate one step for ŷ = wx + b with w = 1, b = 2, x = 3, y = 11.`,
    c: py`
w, b, x, y, lr = 1.0, 2.0, 3.0, 11.0, 0.05
pred = w * x + b
loss = 0.5 * (pred - y) ** 2
dL_dpred = pred - y
dw, db = dL_dpred * x, dL_dpred * 1
print(pred, loss, dL_dpred, dw, db)
w2, b2 = w - lr * dw, b - lr * db
print(round(w2, 2), round(b2, 2), round(w2 * x + b2, 2), round(0.5 * (w2 * x + b2 - y) ** 2, 2))`,
    v: cells("One complete backward step, from loss to updated weights.", [P("forward", ["ŷ = wx + b", "= 1×3 + 2 = 5"]), P("loss", ["L = ½(ŷ − y)²", "= ½(5 − 11)² = 18"]), P("dL/dŷ", ["ŷ − y", "= −6"]), P("dŷ/dw", ["x", "= 3"]), P("dL/dw", ["(−6) × 3", "= −18"]), P("update (η = 0.05)", ["w = 1.90", "b = 2.30"])], [
      ["Forward pass: the model predicts 5 minutes."],
      ["Loss: ½(5 − 11)² = 18.", [[1, 0, 1]]],
      ["Slope of the loss with respect to the prediction: −6 (a bigger prediction would help).", [[2, 0, 1]]],
      ["Chain rule: dL/dw = (−6) × 3 = −18 and dL/db = −6.", [[3, 0, 1], [4, 0, 1]]],
      ["Update: w = 1.90, b = 2.30. The new prediction 8.0 is closer to 11.", [[5, 0, 1]]],
    ]),
  },
  {
    t: "Gradient descent in motion",
    lv: 1,
    s: `{{new weight = old weight − learning rate × gradient}}, for every parameter, repeated. With the single record (3 km → 11 min), starting at w = 1, b = 2 and learning rate 0.05, each step shrinks the error by half (the loss by a factor of four): 18 → 4.5 → 1.125 → 0.28 … Slide through the iterations and watch the loss fall. Many (w, b) pairs fit a single point, so real training uses many examples.`,
    r: `Convergence is judged on validation data, not by driving one example's loss to zero.`,
    i: `After one gradient-descent step the loss fell from 18 to 4.5. What will it be after the second?`,
    c: py`
w, b, x, y, lr = 1.0, 2.0, 3.0, 11.0, 0.05
for it in range(5):
    e = w * x + b - y
    print(it, round(w, 3), round(b, 3), round(0.5 * e * e, 4))
    w -= lr * e * x
    b -= lr * e`,
    v: plot("Loss after each training step (single example). The ringed dot is the chosen iteration.", {
      x: [0, 12], y: [0, 20], labels: ["training step", "loss"],
      params: [par("it", "iteration", 0, 12, 1, 0)],
      readout: ["iteration {it}: the loss is multiplied by 0.25 at every step"],
      steps: [[`Start: w = 1.00, b = 2.00, loss ${gdStates[0]?.loss.toFixed(3)}.`, { it: 0 }], [`After 1 step: w = ${gdStates[1]?.w.toFixed(2)}, b = ${gdStates[1]?.b.toFixed(2)}, loss ${gdStates[1]?.loss.toFixed(3)}.`, { it: 1 }], [`After 3 steps: loss ${gdStates[3]?.loss.toFixed(3)}.`, { it: 3 }], [`After 12 steps: loss ${gdStates[12]?.loss.toFixed(6)}.`, { it: 12 }]],
    }, [
      ...gdStates.slice(1).map((s, i) => seg(String(i), String(gdStates[i]?.loss ?? 0), String(i + 1), String(s.loss), { c: "accent" })),
      ...gdStates.map((s, i) => pt(String(i), String(s.loss), { c: "warn", label: `w ${s.w.toFixed(2)}`, show: `0.5-abs(it-${i})` })),
      ...gdStates.map((s, i) => pt(String(i), String(s.loss), { c: "info", show: `0.5-abs(it-${i})*0-${i}*0+0*it` })),
    ]),
  },
  {
    t: "Learning rate: the size of each step",
    lv: 1,
    s: `The learning rate sets how far each update moves. Too small: safe but slow. Too large: you jump across the valley and the loss grows. For the one-example loss L(w) = ½(3w − 9)² the update is w_new − 3 = (1 − 9η)(w − 3): the distance to the best weight is multiplied by (1 − 9η) every step, so it shrinks only if |1 − 9η| < 1, i.e. 0 < η < 2/9 ≈ 0.222. (A bound specific to this toy curve — it does not carry over to every network.) Between 1/9 and 2/9 the iterate oscillates but still converges. Drag η.`,
    r: `A negative gradient is not a negative loss: it only tells you which way to move. The learning rate does not change where the best answer is, only how you get there.`,
    i: `For which learning rates does gradient descent converge on L(w) = ½(3w − 9)²?`,
    c: py`
for lr in (0.02, 0.1, 0.2, 0.25):
    w = 1.0
    for step in range(10):
        w -= lr * 9 * (w - 3)
    print(lr, round(w, 4), round(0.5 * (3 * w - 9) ** 2, 6))`,
    v: plot("Loss after n steps from w = 1 (start loss 18) for the chosen η.", {
      x: [0, 15], y: [0, 60], labels: ["optimizer step n", "loss"],
      params: [par("a", "learning rate η", 0.005, 0.3, 0.005, 0.05)],
      readout: ["each step multiplies the distance to the best weight by (1 − 9η) = {1-9*a:3}   (converges if its size is below 1)"],
      steps: [["η = 0.02: stable but slow.", { a: 0.02 }], ["η = 0.11 ≈ 1/9: converges almost at once.", { a: 0.11 }], ["η = 0.2: oscillates, still converges.", { a: 0.2 }], ["η = 0.25 > 2/9: overshoots more each time — divergence.", { a: 0.25 }]],
    }, [curve("18*pow(abs(1-9*a),2*x)", { c: "accent" }), ...Array.from({ length: 16 }, (_, i) => pt(String(i), `18*pow(abs(1-9*a),${2 * i})`, { c: "warn" }))]),
  },
  {
    t: "Epoch, batch size and iteration",
    lv: 1,
    s: `One {{epoch}} is a pass over the whole training set. The {{batch size}} is how many examples contribute to one gradient. One {{iteration}} (optimiser step) uses one batch. With 8 records and batch size 2 there are 8 / 2 = 4 updates per epoch. In general steps per epoch = ceil(N / batch size): 1,000 examples with batch 32 give ceil(31.25) = 32 steps, and 10 epochs make 320 updates; the last batch may be smaller. Small batches give noisy, frequent updates; large batches give smoother ones but need more memory.`,
    r: `100 records, batch size 20, 4 epochs → 5 × 4 = 20 optimizer steps. Do not confuse "batch size 32" with "32 epochs".`,
    i: `How many weight updates happen with 100 records, batch size 20 and 4 epochs?`,
    c: py`
import math

print(math.ceil(8 / 2), math.ceil(1000 / 32), math.ceil(1000 / 32) * 10)
print(math.ceil(100 / 20) * 4, math.ceil(1000 / 100) * 5)`,
    v: cells("Eight records, batch size 2: four updates per epoch.", [P("records", ["1", "2", "3", "4", "5", "6", "7", "8"]), P("update 1", ["▣", "▣", "·", "·", "·", "·", "·", "·"]), P("update 2", ["·", "·", "▣", "▣", "·", "·", "·", "·"]), P("update 3", ["·", "·", "·", "·", "▣", "▣", "·", "·"]), P("update 4", ["·", "·", "·", "·", "·", "·", "▣", "▣"])], [
      ["8 examples in the training set."],
      ["Update 1 uses records 1 and 2 (averaged gradient).", [[1, 0, 1]]],
      ["Updates 2, 3 and 4 use the next pairs.", [[2, 2, 3], [3, 4, 5], [4, 6, 7]]],
      ["All 8 records seen once = 1 epoch = 4 iterations.", [[1, 0, 1], [2, 2, 3], [3, 4, 5], [4, 6, 7]]],
    ]),
  },
  {
    t: "Backpropagation through a hidden neuron",
    lv: 2,
    s: `With a hidden layer the chain simply gets longer. Network: x → z₁ = w₁x + b₁ → a₁ = ReLU(z₁) → ŷ = w₂a₁ + b₂ → L = ½(ŷ − y)². Take x = 2, w₁ = 1, b₁ = 0, w₂ = 2, b₂ = 1, y = 7. Forward: z₁ = 2, a₁ = 2, ŷ = 5, L = 2. Backward: dL/dŷ = −2; dL/dw₂ = −2 × a₁ = −4; dL/db₂ = −2; dL/da₁ = −2 × w₂ = −4; ReLU′(2) = 1; dL/dz₁ = −4; dL/dw₁ = −4 × x = −8; dL/db₁ = −4. If z₁ had been negative, ReLU′ = 0 and no gradient would flow to w₁, b₁.`,
    r: `Every gradient is the product of the slopes along the path. This is why vanishing (many small factors) or exploding (many large ones) gradients appear in deep networks.`,
    i: `Backpropagate through the network above to find dL/dw₁.`,
    c: py`
x, w1, b1, w2, b2, y = 2.0, 1.0, 0.0, 2.0, 1.0, 7.0
z1 = w1 * x + b1
a1 = max(0.0, z1)
pred = w2 * a1 + b2
loss = 0.5 * (pred - y) ** 2
d_pred = pred - y
d_w2, d_b2 = d_pred * a1, d_pred
d_a1 = d_pred * w2
d_z1 = d_a1 * (1.0 if z1 > 0 else 0.0)
d_w1, d_b1 = d_z1 * x, d_z1
print(z1, a1, pred, loss)
print(d_pred, d_w2, d_b2, d_a1, d_z1, d_w1, d_b1)`,
    v: cells("Forward values on the top rows; backward gradients below.", [P("forward", ["z₁ = 2", "a₁ = 2", "ŷ = 5", "L = 2"]), P("dL/dŷ", ["−2", "", "", ""]), P("w₂, b₂", ["dL/dw₂ = −4", "dL/db₂ = −2", "", ""]), P("hidden", ["dL/da₁ = −4", "dL/dz₁ = −4", "", ""]), P("w₁, b₁", ["dL/dw₁ = −8", "dL/db₁ = −4", "", ""])], [
      ["Forward pass first: it gives the values the backward pass needs."],
      ["Start at the loss: dL/dŷ = ŷ − y = −2.", [[1, 0, 0]]],
      ["Output-layer weights: dL/dw₂ = −2 × a₁ = −4 and dL/db₂ = −2.", [[2, 0, 1]]],
      ["Pass the error back through w₂, then through ReLU′(z₁) = 1: dL/dz₁ = −4.", [[3, 0, 1]]],
      ["Hidden-layer weights: dL/dw₁ = −4 × x = −8 and dL/db₁ = −4.", [[4, 0, 1]]],
    ]),
  },
  {
    t: "Training from scratch: batch gradient descent in NumPy",
    lv: 1,
    s: `Put it all together without any framework. Four records (distance → minutes), w = 1, b = 2, learning rate 0.02, 300 epochs of batch gradient descent: for each record compute the prediction (forward), the error, the loss ½e² and the gradients error × x and error (chain rule), average them over the four records, then update w and b. The words in the lectures map to lines of code: forward pass → {{w*x + b}}; loss → {{0.5*error**2}}; backprop → {{dw += error*x}}; gradient descent → {{w -= lr*(dw/n)}}; epoch → the outer loop.`,
    r: `This is batch gradient descent: the whole dataset forms one batch, so each epoch is one update. Frameworks use mini-batches and an optimiser class, but the arithmetic is the same.`,
    i: `Which line of the training loop is backpropagation and which is the optimiser step?`,
    c: py`
samples = [(1, 5), (2, 8), (3, 11), (4, 14)]
w, b = 1.0, 2.0
lr, epochs = 0.02, 300
for epoch in range(epochs):
    dw = db = total = 0.0
    for x, actual in samples:
        pred = w * x + b
        error = pred - actual
        total += 0.5 * error ** 2
        dw += error * x
        db += error
    n = len(samples)
    w -= lr * dw / n
    b -= lr * db / n
    if epoch % 100 == 0:
        print(epoch, round(total / n, 4), round(w, 3), round(b, 3))
print("Prediction at 5 km:", round(w * 5 + b, 2))`,
    v: compare("The mathematical words, and where they live in the code.", ["Code", "Meaning"], [
      ["Forward pass", "pred = w * x + b", "predict the delivery time"],
      ["Loss", "0.5 * error ** 2", "measure the mistake"],
      ["Backpropagation", "dw += error * x", "gradient of the loss w.r.t. the weight"],
      ["Gradient descent", "w -= lr * dw / n", "update the weight"],
      ["Epoch", "for epoch in range(epochs)", "one pass over the dataset"],
      ["Batch size", "n = len(samples)", "the whole dataset as one batch"],
    ]),
  },
  {
    t: "A whole network from scratch: learning XOR",
    lv: 2,
    s: `XOR (output 1 when exactly one input is 1) cannot be solved by one neuron — no straight line separates the classes — but a network with ONE hidden layer of two sigmoid neurons can. The code trains a 2 → 2 → 1 network with plain NumPy: forward pass, binary cross-entropy, backpropagation through both layers (output gradient p − y, then through the hidden sigmoid with a(1 − a)), and gradient descent for 8,000 epochs. After training the four outputs are close to 0, 1, 1, 0 — the hidden layer has built the feature the output neuron needed.`,
    r: `This is the smallest demonstration that hidden layers + non-linear activations add real power. Different random seeds can need different training lengths.`,
    i: `Why can a single neuron not learn XOR while two hidden neurons can?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)
sigmoid = lambda z: 1 / (1 + np.exp(-z))
W1, b1 = rng.normal(0, 1, (2, 2)), np.zeros(2)
W2, b2 = rng.normal(0, 1, (2, 1)), np.zeros(1)
for epoch in range(8000):
    a1 = sigmoid(X @ W1 + b1)
    p = sigmoid(a1 @ W2 + b2)
    dz2 = (p - y) / len(X)
    dW2, db2 = a1.T @ dz2, dz2.sum(axis=0)
    dz1 = (dz2 @ W2.T) * a1 * (1 - a1)
    dW1, db1 = X.T @ dz1, dz1.sum(axis=0)
    W2 -= 1.0 * dW2
    b2 -= 1.0 * db2
    W1 -= 1.0 * dW1
    b1 -= 1.0 * db1
p = sigmoid(sigmoid(X @ W1 + b1) @ W2 + b2)
print(p.ravel().round(3).tolist(), (p.ravel() > 0.5).astype(int).tolist())`,
    v: cells("The four XOR cases and the trained network's outputs.", table(["x₁", "x₂", "target", "network output"], [["0", "0", "0", "0.001"], ["0", "1", "1", "0.999"], ["1", "0", "1", "0.998"], ["1", "1", "0", "0.001"]]), [
      ["XOR: no single line separates the 1s from the 0s."],
      ["The hidden layer learns two intermediate features.", [[1, 0, 1], [4, 0, 1]]],
      ["The output neuron combines them: outputs near 0, 1, 1, 0.", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
type V2 = { x: number; y: number };
const racers = (() => {
  const eta = 0.15;
  const steps = 40;
  const grad = (p: V2): V2 => ({ x: 2 * p.x, y: 0.2 * p.y });
  const obj = (p: V2) => 0.5 * (2 * p.x * p.x + 0.2 * p.y * p.y);
  const out: Record<string, V2[]> = { sgd: [{ x: 3.7, y: 3.5 }], rms: [{ x: 3.7, y: 3.5 }], adam: [{ x: 3.7, y: 3.5 }] };
  const st = { rms: { vx: 0, vy: 0 }, adam: { mx: 0, my: 0, vx: 0, vy: 0 } };
  for (let t = 1; t <= steps; t++) {
    const s = out.sgd?.[t - 1] ?? { x: 0, y: 0 };
    const gs = grad(s);
    out.sgd?.push({ x: s.x - eta * gs.x, y: s.y - eta * gs.y });
    const r = out.rms?.[t - 1] ?? { x: 0, y: 0 };
    const gr = grad(r);
    st.rms.vx = 0.9 * st.rms.vx + 0.1 * gr.x * gr.x;
    st.rms.vy = 0.9 * st.rms.vy + 0.1 * gr.y * gr.y;
    out.rms?.push({ x: r.x - (eta * gr.x) / (Math.sqrt(st.rms.vx) + 1e-8), y: r.y - (eta * gr.y) / (Math.sqrt(st.rms.vy) + 1e-8) });
    const a = out.adam?.[t - 1] ?? { x: 0, y: 0 };
    const ga = grad(a);
    st.adam.mx = 0.9 * st.adam.mx + 0.1 * ga.x;
    st.adam.my = 0.9 * st.adam.my + 0.1 * ga.y;
    st.adam.vx = 0.999 * st.adam.vx + 0.001 * ga.x * ga.x;
    st.adam.vy = 0.999 * st.adam.vy + 0.001 * ga.y * ga.y;
    const c1 = 1 - 0.9 ** t;
    const c2 = 1 - 0.999 ** t;
    out.adam?.push({ x: a.x - (eta * (st.adam.mx / c1)) / (Math.sqrt(st.adam.vx / c2) + 1e-8), y: a.y - (eta * (st.adam.my / c1)) / (Math.sqrt(st.adam.vy / c2) + 1e-8) });
  }
  return { out, obj };
})();
const lossAt = (k: string, t: number) => racers.obj(racers.out[k]?.[t] ?? { x: 0, y: 0 });
const contour = (c: number): [string, string][] => Array.from({ length: 49 }, (_, i) => {
  const a = (2 * Math.PI * i) / 48;
  return [(Math.sqrt(c) * Math.cos(a)).toFixed(3), (Math.sqrt(c / 0.1) * Math.sin(a)).toFixed(3)] as [string, string];
});

export const opt: ConceptDef[] = [
  {
    t: "Backpropagation versus the optimiser: SGD",
    lv: 1,
    s: `Backpropagation computes gradients; the {{optimiser}} decides how to use them. The simplest is gradient descent: {{w ← w − η · gradient}}. "Stochastic" (SGD) strictly means one random example per step; in practice SGD means mini-batch gradients. Example: loss ½(w − 2)², start at w = −4: the gradient is w − 2 = −6 and with η = 0.2 the next weight is −4 − 0.2 × (−6) = −2.8. Each step closes a fraction η of the gap to w = 2. Drag η: small is slow, 1 jumps straight to the answer, above 1 overshoots further each time and diverges.`,
    r: `With momentum, SGD makes faster progress along consistent directions and is a strong choice, especially for convolutional networks.`,
    i: `Perform one SGD step from w = −4 on L = ½(w − 2)² with η = 0.2.`,
    c: py`
w, lr = -4.0, 0.2
path = [w]
for step in range(5):
    w -= lr * (w - 2)
    path.append(round(w, 3))
print(path)
print(-4 - 0.2 * (-4 - 2))`,
    v: plot("Weight after each step (dots) for the chosen learning rate; the target is w = 2.", {
      x: [0, 12], y: [-8, 12], labels: ["step", "weight w"],
      params: [par("eta", "learning rate η", 0.05, 1.3, 0.05, 0.2)],
      readout: ["each step multiplies the gap to w = 2 by (1 − η) = {1-eta:2}"],
      steps: [["η = 0.2: a smooth approach.", { eta: 0.2 }], ["η = 1: lands on 2 immediately.", { eta: 1 }], ["η = 1.3: the gap grows by 0.3× each step — divergence.", { eta: 1.3 }]],
    }, [hline("2", { c: "muted", dash: true }), ...Array.from({ length: 13 }, (_, i) => pt(String(i), `2+(-6)*pow(1-eta,${i})`, { c: "accent" }))]),
  },
  {
    t: "Momentum: remember the direction",
    lv: 2,
    s: `{{Momentum}} keeps a running "velocity": {{v ← βv + g}}, then {{w ← w − η v}}. When successive gradients agree, the velocity builds up and steps grow; when they flip sign, the velocity cancels, damping zig-zags. With a constant gradient of 1 and β = 0.9 the velocity is 1, 1.9, 2.71, 3.44, 4.10 …, approaching 10: the effective step becomes ten times larger along a consistent slope. It is optional in SGD and a building block for Adam.`,
    r: `A typical β is 0.9. Too much momentum overshoots minima; it interacts with the learning rate, so tune them together.`,
    i: `What does momentum do to a sequence of identical gradients?`,
    c: py`
beta, v = 0.9, 0.0
speeds = []
for g in [1.0] * 5:
    v = beta * v + g
    speeds.append(round(v, 3))
print(speeds, round(1 / (1 - beta), 1))`,
    v: compare("Plain SGD versus SGD with momentum.", ["SGD", "SGD with momentum"], [
      ["Update", "w ← w − η g", "v ← βv + g;  w ← w − η v"],
      ["Constant gradient", "constant steps", "steps grow towards 1/(1 − β) times larger"],
      ["Alternating gradient signs", "zig-zags", "cancels, damping the oscillation"],
      ["Extra state", "none", "one velocity per weight"],
    ], 1),
  },
  {
    t: "RMSprop: a step size for every parameter",
    lv: 2,
    s: `Different parameters can have gradients of very different size. RMSprop tracks a moving average of the SQUARED gradients, {{v ← βv + (1 − β)g²}}, and divides each update by its root: {{w ← w − η g / (√v + ε)}}. A parameter that has been receiving large gradients gets a smaller effective step; one with tiny gradients gets a larger one. With g = 4, old v = 4 and β = 0.9: new v = 0.9 × 4 + 0.1 × 16 = 5.2 and the scaled gradient is 4 / √5.2 = 1.754. Drag g and v.`,
    r: `Squaring keeps negative and positive gradients from cancelling. The benefit shows up across many steps and many parameters, not in a single step.`,
    i: `Compute the RMSprop scaled gradient for g = 4, v = 4, β = 0.9.`,
    c: py`
import numpy as np

g, v, beta = 4.0, 4.0, 0.9
v_new = beta * v + (1 - beta) * g ** 2
scaled = g / (np.sqrt(v_new) + 1e-8)
print(round(v_new, 2), round(float(scaled), 3), round(float(-0.1 * scaled), 4))`,
    v: bars("The raw gradient (size) versus the RMSprop-scaled gradient the optimiser actually uses.", [["|raw gradient g|", "abs(g)"], ["|scaled g / (√v + ε)|", "abs(g)/(sqrt(b*v+(1-b)*g^2)+0.00000001)"]], {
      max: 8,
      params: [par("g", "gradient g", -8, 8, 0.5, 4), par("v", "past average v", 0, 50, 1, 4), par("b", "decay β", 0.5, 0.99, 0.01, 0.9)],
      readout: ["new v = {b}·{v} + {1-b:2}·{g}² = {b*v+(1-b)*g^2:2}   →   scaled gradient = {g/(sqrt(b*v+(1-b)*g^2)+0.00000001):3}"],
      steps: [["g = 4 with a past average of 4: the step is shrunk to 1.754.", { g: 4, v: 4, b: 0.9 }], ["A history of tiny gradients (v = 0): the step is boosted.", { g: 4, v: 0, b: 0.9 }]],
    }),
  },
  {
    t: "Adam: direction memory plus adaptive scaling",
    lv: 2,
    s: `Adam combines momentum and RMSprop. It keeps {{m ← β₁m + (1 − β₁)g}} (average gradient) and {{v ← β₂v + (1 − β₂)g²}} (average squared gradient), corrects their start-up bias {{m̂ = m/(1 − β₁ᵗ)}}, {{v̂ = v/(1 − β₂ᵗ)}}, and updates {{w ← w − η m̂ / (√v̂ + ε)}}. First step with g = 4, η = 0.1, m₀ = v₀ = 0: m = 0.4, v = 0.016, m̂ = 4, v̂ = 16, update = 0.1 × 4/√16 = 0.1. Typical defaults: β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸. Adam is a convenient default but not always the best.`,
    r: `Evaluate Adam against SGD with momentum on validation metrics; SGD can generalise better in some settings.`,
    i: `Compute Adam's first update for g = 4 and η = 0.1.`,
    c: py`
import numpy as np

g, eta, b1, b2 = 4.0, 0.1, 0.9, 0.999
m = v = 0.0
for t in range(1, 4):
    m = b1 * m + (1 - b1) * g
    v = b2 * v + (1 - b2) * g * g
    m_hat, v_hat = m / (1 - b1 ** t), v / (1 - b2 ** t)
    print(t, round(m, 4), round(v, 4), round(m_hat, 3), round(v_hat, 3), round(float(eta * m_hat / (np.sqrt(v_hat) + 1e-8)), 4))`,
    v: cells("Adam's first update, line by line (g = 4, η = 0.1).", table(["quantity", "formula", "value"], [["m", "0.9·0 + 0.1·4", "0.4"], ["v", "0.999·0 + 0.001·4²", "0.016"], ["m̂", "m / (1 − 0.9)", "4"], ["v̂", "v / (1 − 0.999)", "16"], ["update", "0.1 · 4 / (√16 + ε)", "≈ 0.1"]]), [
      ["Both averages start at 0, so they are biased towards 0 at first."],
      ["m and v after one step: 0.4 and 0.016.", [[1, 2, 2], [2, 2, 2]]],
      ["Bias correction rescales them to 4 and 16.", [[3, 2, 2], [4, 2, 2]]],
      ["The update size is η times (average gradient / typical gradient size) ≈ 0.1.", [[5, 2, 2]]],
    ]),
  },
  {
    t: "SGD, RMSprop and Adam on the same landscape",
    lv: 2,
    s: `All three start at (3.7, 3.5) on an illustrative stretched bowl, loss = ½(2x² + 0.2y²) — steep in x, shallow in y — with learning rate 0.15. SGD moves in proportion to the gradient, so it crawls along the shallow y direction. RMSprop and Adam normalise the step per parameter, so both directions progress at a similar pace. Step through the first 40 updates. This is a teaching landscape, not a claim about universal speed.`,
    r: `Which optimiser wins depends on the model, the data, scaling and tuning — compare on validation results.`,
    i: `Why does plain SGD struggle on a bowl that is much steeper in one direction than another?`,
    c: py`
import numpy as np

grad = lambda p: np.array([2 * p[0], 0.2 * p[1]])
obj = lambda p: 0.5 * (2 * p[0] ** 2 + 0.2 * p[1] ** 2)
eta = 0.15
s = r = a = np.array([3.7, 3.5])
vr = np.zeros(2)
m, va = np.zeros(2), np.zeros(2)
for t in range(1, 41):
    s = s - eta * grad(s)
    g = grad(r)
    vr = 0.9 * vr + 0.1 * g * g
    r = r - eta * g / (np.sqrt(vr) + 1e-8)
    g = grad(a)
    m = 0.9 * m + 0.1 * g
    va = 0.999 * va + 0.001 * g * g
    a = a - eta * (m / (1 - 0.9 ** t)) / (np.sqrt(va / (1 - 0.999 ** t)) + 1e-8)
print(round(float(obj(s)), 3), round(float(obj(r)), 3), round(float(obj(a)), 3))`,
    v: plot("Paths of SGD (blue), RMSprop (orange) and Adam (green) on the contour lines; the centre is the minimum.", {
      x: [-4.5, 4.5], y: [-4.5, 4.5], labels: ["parameter x", "parameter y"],
      params: [par("t", "update number", 0, 40, 1, 0)],
      readout: ["update {t} of 40 — see the caption for the three losses"],
      steps: [0, 5, 15, 40].map((t) => [`After ${t} updates: loss — SGD ${lossAt("sgd", t).toFixed(3)}, RMSprop ${lossAt("rms", t).toFixed(3)}, Adam ${lossAt("adam", t).toFixed(3)}.`, { t }] as [string, Record<string, number>]),
    }, [
      ...[0.5, 1, 2, 4, 7, 11, 15, 20].map((c) => poly(contour(c), { c: "muted" })),
      ...(["sgd", "rms", "adam"] as const).flatMap((k) => {
        const col = k === "sgd" ? "info" : k === "rms" ? "warn" : "good";
        const path = racers.out[k] ?? [];
        return [
          ...path.slice(1).map((p, i) => seg((path[i]?.x ?? 0).toFixed(4), (path[i]?.y ?? 0).toFixed(4), p.x.toFixed(4), p.y.toFixed(4), { c: col, show: `t-${i}-0.5` })),
          ...path.map((p, i) => pt(p.x.toFixed(4), p.y.toFixed(4), { c: col, show: `0.5-abs(t-${i})` })),
        ];
      }),
    ]),
  },
];

void [L, bars, flow, hline, layers, line];
