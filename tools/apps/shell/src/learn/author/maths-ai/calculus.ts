import { arrow, area, bars, circle, compare, curve, flow, hline, line, par, plot, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* ------------------------------------------------------------------ */
export const calc: ConceptDef[] = [
  {
    t: "Limits: from the secant to the tangent",
    lv: 2,
    s: `The slope between two points on a curve (a secant) is an average rate of change. Bring the second point closer — h smaller and smaller — and the secant settles on the slope at one point: the tangent. That value the slopes approach is the limit. We never put h = 0 in the fraction; we ask what it approaches.`,
    r: `The derivative that powers backpropagation is exactly this limit, computed by formula instead of by shrinking h.`,
    i: `Why can't you simply set h = 0 in {{[f(x + h) − f(x)] / h}}?`,
    c: py`
def s(t):
    return t ** 2

t0 = 2
for h in [1, 0.5, 0.1, 0.01]:
    print(h, round((s(t0 + h) - s(t0)) / h, 3))`,
    o: `1 5.0\n0.5 4.5\n0.1 4.1\n0.01 4.01`,
    v: plot("Shrink h and the secant (orange) rotates onto the tangent (purple).", { x: [0, 4.5], y: [0, 22], labels: ["time t (s)", "distance s = t² (m)"],
      params: [par("t0", "point t₀", 0.5, 3, 0.1, 2), par("h", "gap h", 0.01, 1.5, 0.01, 1)],
      readout: ["secant slope = [({t0}+{h})² − {t0}²] / {h} = {2*t0+h:3} m/s", "tangent slope = 2·{t0} = {2*t0:3} m/s   (gap between them: {h:2})"],
      steps: [
        ["h = 1: the second point is far away — the secant slope is 5.", { h: 1 }],
        ["h = 0.5: closer — 4.5.", { h: 0.5 }],
        ["h = 0.1: closer still — 4.1.", { h: 0.1 }],
        ["h = 0.01: the secant almost sits on the tangent. The limit is 4.", { h: 0.01 }],
      ] }, [
      curve("x^2", { c: "info" }),
      line("t0", "t0^2", "2*t0+h", { c: "warn", dash: true }),
      line("t0", "t0^2", "2*t0", { c: "purple" }),
      pt("t0", "t0^2", { c: "accent", label: "A" }),
      pt("t0+h", "(t0+h)^2", { c: "warn", label: "B" }),
    ]),
  },
  {
    t: "The derivative as a local slope",
    lv: 1,
    s: `The derivative {{f′(x)}} (or {{df/dx}}) is the slope of the curve at one exact point — the slope of the tangent line. For {{f(x) = x²}} it is {{2x}}: shallow near 0, steeper further out. Positive: climbing. Negative: falling. Zero: a flat spot, perhaps a minimum.`,
    r: `Training a network means finding the bottom of the loss curve; the derivative is the signal that says which way is downhill.`,
    i: `What does it mean when the derivative of the loss is zero?`,
    c: py`
def derivative(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print(round(derivative(lambda x: x ** 2, 3), 4))
print(round(derivative(lambda x: x ** 3, 2), 3))`,
    o: `6.0\n12.0`,
    v: plot("Slide the point: the tangent's slope is 2a — negative on the left, zero at the bottom, positive on the right.", { x: [-4, 4], y: [-2, 12], labels: ["x", "y = x²"],
      params: [par("a", "point a", -3, 3, 0.1, 1.5)],
      readout: ["f(a) = {a}² = {a^2:2}     slope f′(a) = 2·{a} = {2*a:2}"],
      steps: [
        ["On the right the curve climbs: positive slope.", { a: 2 }],
        ["At the bottom the tangent is flat: slope 0.", { a: 0 }],
        ["On the left the curve falls: negative slope.", { a: -2 }],
      ] }, [
      curve("x^2", { c: "info" }),
      line("a", "a^2", "2*a", { c: "warn" }),
      pt("a", "a^2", { c: "accent" }),
    ]),
  },
  {
    t: "Derivative rules: power, constant and sum",
    lv: 1,
    s: `You rarely compute limits by hand. Learn a few rules. Power rule: {{(xⁿ)′ = n·xⁿ⁻¹}}. Constant: {{(c)′ = 0}} and {{(c·f)′ = c·f′}}. Sum: differentiate term by term. So {{(3x² + 2x − 5)′ = 6x + 2}}.`,
    r: `Backpropagation applies these rules to every operation in the network.`,
    i: `Differentiate {{3x² + 2x − 5}} and evaluate it at x = 3.`,
    c: py`
def d(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

f = lambda x: 3 * x**2 + 2 * x - 5
print(round(d(f, 3), 3), 6 * 3 + 2)`,
    o: `20.0 20`,
    v: compare("A tiny table covers most of what you need.", ["Derivative f′(x)", "At x = 3"], [
      ["x²", "2x", "6"],
      ["x³", "3x²", "27"],
      ["5x", "5", "5"],
      ["7 (a constant)", "0", "0"],
      ["3x² + 2x − 5", "6x + 2", "20"],
    ]),
  },
  {
    t: "Product and quotient rules",
    lv: 2,
    s: `When two functions are multiplied, differentiate one at a time: {{(u·v)′ = u′v + uv′}}. For a ratio: {{(u/v)′ = (u′v − uv′) / v²}}. Do not simply multiply or divide the derivatives. Check with a number: for {{x²(x + 1)}} at x = 2 the slope is 16.`,
    r: `Neurons multiply inputs by weights and then pass them through further functions, so product and chain rules appear together.`,
    i: `Why is {{(uv)′}} not {{u′v′}}?`,
    c: py`
def d(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print(round(d(lambda x: x**2 * (x + 1), 2), 3))
print(round(d(lambda x: x / (x + 1), 2), 4))`,
    o: `16.0\n0.1111`,
    v: compare("Each rule has a shape to remember.", ["Worked example", "Value at x = 2"], [
      ["Product (u·v)′ = u′v + u v′", "x²(x+1): 2x(x+1) + x² = 3x² + 2x", "16"],
      ["Quotient (u/v)′ = (u′v − u v′)/v²", "x/(x+1): 1/(x+1)²", "1/9 ≈ 0.111"],
    ]),
  },
  {
    t: "The chain rule",
    lv: 1,
    s: `When functions are chained, multiply their slopes: {{dy/dx = (dy/du) · (du/dx)}}. Like gears: if one gear multiplies speed by 3 and the next by 2, the pair multiplies it by 6. With {{u = 3x + 1}} and {{y = u²}} at x = 2: dy/du = 2u = 14, du/dx = 3, so dy/dx = 42.`,
    r: `Backpropagation IS the chain rule: it walks the network from the loss backwards, multiplying local slopes so every weight learns how it affected the loss.`,
    i: `Differentiate {{y = (3x + 1)²}} with the chain rule.`,
    c: py`
x = 2
u = 3 * x + 1
du_dx = 3
dy_du = 2 * u
print(u, u ** 2, dy_du * du_dx)
h = 1e-6
print(round(((3 * (x + h) + 1) ** 2 - (3 * x + 1) ** 2) / h, 2))`,
    o: `7 49 42\n42.0`,
    v: flow("Multiply the slope of each link in the chain.", "row",
      ["x = 2|input|i", "u = 3x + 1|= 7|w", "y = u²|= 49|g", "dy/dx|14 × 3 = 42|g"],
      [[0, 1, "du/dx = 3"], [1, 2, "dy/du = 2u = 14"], [2, 3, "multiply the slopes"]],
      undefined,
      ["Nudge x by 1 and u moves by 3 — that link's slope is 3.", "Nudge u by 1 and y moves by 2u = 14 (u is 7) — that link's slope is 14.", "The whole chain: 14 × 3 = 42. Check numerically: x = 2.001 gives y = 49.042, a change of 0.042 per 0.001 = 42."]),
  },
  {
    t: "Derivatives of e^x, ln x and the sigmoid",
    lv: 2,
    s: `The exponential is its own slope: {{(eˣ)′ = eˣ}}. The log: {{(ln x)′ = 1/x}}. A chain gives {{(e⁻ˣ)′ = −e⁻ˣ}}. For the sigmoid {{σ(z) = 1/(1 + e⁻ᶻ)}} the derivative is wonderfully simple: {{σ′(z) = σ(z)(1 − σ(z))}}, at most 0.25.`,
    r: `Softmax, sigmoid and cross-entropy all contain exponentials and logs; their tidy derivatives make backpropagation cheap.`,
    i: `What is σ′(z) in terms of σ(z), and what is its maximum?`,
    c: py`
import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
s = sigmoid(1)
print(round(s, 4), round(s * (1 - s), 4))`,
    o: `0.7311 0.1966`,
    v: compare("Four derivatives that show up everywhere in AI.", ["Derivative", "Why it matters"], [
      ["eˣ", "eˣ", "grows exactly as fast as it is — softmax, sigmoid"],
      ["ln x", "1 / x", "cross-entropy loss: steep near 0"],
      ["e⁻ˣ", "−e⁻ˣ", "chain rule: the minus comes from the −x"],
      ["σ(z) = 1 / (1 + e⁻ᶻ)", "σ(1 − σ)", "tiny at both ends → vanishing gradients"],
    ]),
  },
  {
    t: "Partial derivatives and the gradient",
    lv: 2,
    s: `A model has many weights, so the loss depends on many inputs. A partial derivative {{∂L/∂w}} asks: "turning only this knob, and freezing the rest, how fast does the loss change?" The gradient is the list of all of them. It points uphill; stepping the opposite way goes downhill.`,
    r: `Backpropagation computes a partial derivative for every weight; together they form the gradient the optimiser follows.`,
    i: `For {{L(w, b) = w² + b²}}, what are the partial derivatives and the gradient at (3, 1)?`,
    c: py`
w, b = 3, 1
loss = w**2 + b**2
grad = [2 * w, 2 * b]
print(loss, grad)
print([round(v - 0.1 * g, 2) for v, g in zip([w, b], grad)])`,
    o: `10 [6, 2]\n[2.4, 0.8]`,
    v: plot("Rings are equal-loss contours. The gradient points straight uphill; the opposite way is fastest downhill.", { x: [-5, 5], y: [-5, 5], labels: ["weight w", "bias b"],
      params: [par("w", "w", -4, 4, 0.5, 3), par("b", "b", -4, 4, 0.5, 1)],
      readout: ["L = w² + b² = {w^2+b^2:2}", "∂L/∂w = 2w = {2*w:2}     ∂L/∂b = 2b = {2*b:2}   → gradient [{2*w:1}, {2*b:1}]"],
      steps: [
        ["At (3, 1) the gradient is [6, 2]: mostly 'uphill in w'.", { w: 3, b: 1 }],
        ["Move to (−2, 3): the gradient flips sign in w.", { w: -2, b: 3 }],
        ["Near the centre the gradient shrinks toward zero — the bottom of the bowl.", { w: 0.5, b: -0.5 }],
      ] }, [
      ...[1, 2, 3, 4, 5].map((r) => circle("0", "0", String(r), { c: "muted" })),
      arrow("w", "b", "1.6*w", "1.6*b", { c: "warn", label: "uphill" }),
      arrow("w", "b", "0.4*w", "0.4*b", { c: "good", label: "downhill" }),
      pt("w", "b", { c: "accent" }),
    ]),
  },
  {
    t: "Second derivative and curvature",
    lv: 3,
    s: `The second derivative is the slope of the slope: it tells you how the curve bends. Positive: curving up like a bowl (a minimum when the slope is 0). Negative: curving down (a maximum). Where the first derivative is zero but the second is not, you can tell a minimum from a maximum.`,
    r: `Curvature tells you how big a safe learning rate is, and why optimisers like Adam adapt the step size per weight.`,
    i: `At a point where f′ = 0, how do you tell a minimum from a maximum?`,
    c: py`
f = lambda x: x**3 - 3 * x
df = lambda x: 3 * x**2 - 3
d2f = lambda x: 6 * x
for x in [-1, 1]:
    print(x, f(x), df(x), "max" if d2f(x) < 0 else "min")`,
    o: `-1 2 0 max\n1 -2 0 min`,
    v: plot("Flat tangents sit at the hilltop (x = −1) and the valley (x = 1); the bend tells you which.", { x: [-3, 3], y: [-6, 6], labels: ["x", "y = x³ − 3x"],
      params: [par("a", "point a", -2.5, 2.5, 0.1, 1.8)],
      readout: ["slope f′(a) = 3·{a}² − 3 = {3*a^2-3:2}", "curvature f″(a) = 6·{a} = {6*a:2}  (positive: bowl-up · negative: bowl-down)"],
      steps: [
        ["Right of the valley: the slope is positive and the curve bends up.", { a: 1.8 }],
        ["At x = 1 the tangent is flat and f″ = 6 > 0: a minimum.", { a: 1 }],
        ["At x = −1 the tangent is flat and f″ = −6 < 0: a maximum.", { a: -1 }],
      ] }, [
      curve("x^3-3*x", { c: "info" }),
      line("a", "a^3-3*a", "3*a^2-3", { c: "warn" }),
      pt("-1", "2", { c: "bad", label: "max" }),
      pt("1", "-2", { c: "good", label: "min" }),
      pt("a", "a^3-3*a", { c: "accent" }),
    ]),
  },
  {
    t: "Integrals: area under a curve",
    lv: 2,
    s: `An integral adds up infinitely many thin slices to find the area under a curve. It is the reverse of differentiation: the area under {{f(x) = x²}} from 0 to b is {{b³/3}}. Probability works this way — the area under a density curve between two values is the probability of landing between them.`,
    r: `Expected values and probabilities of continuous variables are integrals; normalising a distribution means making its area 1.`,
    i: `What does the area under a probability density curve represent?`,
    c: py`
n = 1000
b = 2
area = sum((i * b / n) ** 2 * (b / n) for i in range(n))
print(round(area, 3), round(b ** 3 / 3, 3))`,
    o: `2.663 2.667`,
    v: plot("Sweep the right edge b and the shaded area grows as b³/3.", { x: [0, 3.5], y: [0, 10], labels: ["x", "y = x²"],
      params: [par("b", "right edge b", 0, 3, 0.1, 2)],
      readout: ["area from 0 to {b} = {b}³ / 3 = {b^3/3:3}"],
      steps: [
        ["A thin sliver of area near zero.", { b: 0.5 }],
        ["Widen it: area = 1³/3 = 0.333.", { b: 1 }],
        ["To b = 2 the area is 8/3 ≈ 2.667.", { b: 2 }],
        ["To b = 3 it reaches 9.", { b: 3 }],
      ] }, [
      area("x^2", "0", "b", { c: "accent" }),
      curve("x^2", { c: "info" }),
      vline("b", { c: "warn", dash: true }),
    ]),
  },
  {
    t: "Numerical gradient checking",
    lv: 2,
    s: `You can test a derivative you derived by hand: nudge the input a tiny amount both ways and measure the slope directly, {{(f(x + h) − f(x − h)) / 2h}}, then compare with your formula. If they agree to several decimals your formula is right. This "gradient check" catches almost every backpropagation bug.`,
    r: `Before trusting a hand-written backward pass or custom layer, deep-learning engineers run a gradient check.`,
    i: `How would you verify that a hand-derived gradient is correct?`,
    c: py`
def f(x):
    return x ** 2

x, h = 3, 1e-5
numeric = (f(x + h) - f(x - h)) / (2 * h)
analytic = 2 * x
print(round(numeric, 6), analytic)
print(abs(numeric - analytic) < 1e-6)`,
    o: `6.0 6\nTrue`,
    v: trace("Measure the slope with a tiny nudge and compare it with the formula.", py`
def f(x):
    return x ** 2

x, h = 3, 1e-5
numeric = (f(x + h) - f(x - h)) / (2 * h)
analytic = 2 * x
print(round(numeric, 6), analytic)
print(abs(numeric - analytic) < 1e-6)`, [
      [1, { f: "<function x²>" }],
      [4, { x: "3", h: "0.00001" }, undefined, "The point to check, and a tiny nudge."],
      [5, { numeric: "6.0000000000" }, undefined, "(f(3.00001) − f(2.99999)) / 0.00002 — the slope measured directly."],
      [6, { analytic: "6" }, undefined, "The formula from the derivative rule: 2x."],
      [7, undefined, "6.0 6"],
      [8, undefined, "True", "They agree to six decimals: the derivative is correct."],
    ]),
  },
];

/* ------------------------------------------------------------------ */
// Gradient descent on L(w) = (w − 3)², lr 0.1, starting at 0.
const gd: number[] = [0];
for (let k = 0; k < 8; k++) gd.push((gd[k] as number) - 0.1 * 2 * ((gd[k] as number) - 3));

const sigDefs = (name: string, expr: (k: number) => string, n: number): [string, string][] => Array.from({ length: n }, (_, k) => [`${name}${k + 1}`, expr(k + 1)]);

export const learn: ConceptDef[] = [
  {
    t: "Loss: measuring how wrong the model is",
    lv: 1,
    s: `A loss is a single number for how wrong the predictions are — smaller is better. Mean squared error squares each error then averages: it punishes big misses heavily. Mean absolute error averages the sizes of the errors: it is gentler with outliers. Pick the loss that matches what you care about.`,
    r: `Regression models usually minimise MSE (or MAE if outliers abound); classification uses cross-entropy.`,
    i: `Why does MSE punish a large error more than MAE does?`,
    c: py`
actual = [10, 20, 30]
pred = [12, 18, 33]
mse = sum((a - p) ** 2 for a, p in zip(actual, pred)) / 3
mae = sum(abs(a - p) for a, p in zip(actual, pred)) / 3
print(round(mse, 3), round(mae, 3))`,
    o: `5.667 2.333`,
    v: plot("Double the error and MAE doubles — but squared error quadruples.", { x: [-4, 4], y: [0, 16], labels: ["error (prediction − actual)", "loss"],
      params: [par("e", "error", -4, 4, 0.1, 2.5)],
      readout: ["error = {e}:  squared loss = {e^2:2}   absolute loss = {abs(e):2}"] }, [
      curve("x^2", { c: "accent", label: "squared (MSE)" }),
      curve("abs(x)", { c: "info", label: "absolute (MAE)" }),
      pt("e", "e^2", { c: "accent" }),
      pt("e", "abs(e)", { c: "info" }),
    ]),
  },
  {
    t: "Gradient descent, one step at a time",
    lv: 1,
    s: `Gradient descent walks downhill. At the current weight, find the slope of the loss, then step the opposite way: {{w_new = w − η · slope}}. The learning rate η sets the step size. Repeat — each step lowers the loss until you reach the bottom. The minus sign is what turns "uphill direction" into "downhill step".`,
    r: `This is how every neural network learns: compute the gradient, take a small step against it, repeat — millions of times.`,
    i: `Why do we subtract the gradient, and what does the learning rate control?`,
    c: py`
w, lr = 0.0, 0.1
for step in range(5):
    grad = 2 * (w - 3)
    w -= lr * grad
    print(step + 1, round(w, 4), round((w - 3) ** 2, 4))`,
    o: `1 0.6 5.76\n2 1.08 3.6864\n3 1.464 2.3593\n4 1.7712 1.5099\n5 2.017 0.9664`,
    v: plot("Each step slides the point down the bowl toward the minimum at w = 3.", { x: [-1, 6], y: [0, 20], labels: ["weight w", "loss L(w) = (w − 3)²"],
      params: [par("w", "weight w", -1, 5, 0.01, 0)],
      readout: ["w = {w:3}    loss = ({w:3} − 3)² = {(w-3)^2:3}    slope = 2({w:3} − 3) = {2*(w-3):3}", "next: w − 0.1 × slope = {w-0.1*2*(w-3):3}"],
      steps: gd.map((w, k): [string, Record<string, number>] => [
        k === 0 ? "Start at w = 0: loss 9, slope −6 (the curve falls to the right)." : `Step ${k}: w moves to ${w.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} and the loss falls to ${((w - 3) ** 2).toFixed(3)}.`,
        { w },
      ]) }, [
      curve("(x-3)^2", { c: "info" }),
      line("w", "(w-3)^2", "2*(w-3)", { c: "warn", dash: true }),
      pt("3", "0", { c: "good", label: "minimum" }),
      pt("w", "(w-3)^2", { c: "accent" }),
    ]),
  },
  {
    t: "The learning rate: too small, just right, too big",
    lv: 1,
    s: `On this bowl each step multiplies the distance to the minimum by {{(1 − 2η)}}. Small η: safe but slow. A good η: fast and smooth. η = 1: it bounces forever between two points. η above 1: each step overshoots further and the loss explodes. Choosing the learning rate is the most common tuning job in ML.`,
    r: `A loss that suddenly becomes NaN or shoots up is usually a learning rate that is too high.`,
    i: `What happens to gradient descent when the learning rate is too large?`,
    c: py`
def run(lr, steps=8):
    w = 0.0
    for _ in range(steps):
        w -= lr * 2 * (w - 3)
    return round(w, 3)

for lr in [0.05, 0.4, 1.0, 1.1]:
    print(lr, run(lr))`,
    o: `0.05 1.709\n0.4 3.0\n1.0 0.0\n1.1 -9.899`,
    v: plot("Eight steps from w = 0 for the learning rate you choose.", { x: [-3, 9], y: [0, 40], labels: ["weight w", "loss (w − 3)²"],
      params: [par("eta", "learning rate η", 0.01, 1.2, 0.01, 0.1)],
      defs: [["w0", "0"], ...sigDefs("w", (k) => `w${k - 1}-eta*2*(w${k - 1}-3)`, 8)],
      readout: ["each step multiplies the distance to 3 by (1 − 2η) = {1-2*eta:2}", "after 8 steps: w = {w8:3}   (the target is 3)"],
      steps: [
        ["η = 0.05: safe but slow — after 8 steps it is still far away.", { eta: 0.05 }],
        ["η = 0.4: fast — it lands almost exactly on 3.", { eta: 0.4 }],
        ["η = 0.95: it overshoots and zig-zags, shrinking only slowly.", { eta: 0.95 }],
        ["η = 1.1: each step overshoots further than the last — it diverges.", { eta: 1.1 }],
      ] }, [
      curve("(x-3)^2", { c: "info" }),
      vline("3", { c: "good", dash: true }),
      ...Array.from({ length: 8 }, (_, k) => seg(`w${k}`, `(w${k}-3)^2`, `w${k + 1}`, `(w${k + 1}-3)^2`, { c: "warn", dash: true, show: `min(40-(w${k}-3)^2, 40-(w${k + 1}-3)^2)` })),
      ...Array.from({ length: 9 }, (_, k) => pt(`w${k}`, `(w${k}-3)^2`, { c: k === 8 ? "accent" : "warn", show: `40-(w${k}-3)^2` })),
    ]),
  },
  {
    t: "Local minima, saddles and flat regions",
    lv: 3,
    s: `Real loss surfaces are bumpy. Gradient descent follows the slope downhill, so where it ends depends on where it starts: it can settle in a shallower valley (a local minimum) instead of the deepest one. Flat regions give tiny gradients and slow progress, and saddle points are flat but not minima. In very high dimensions most trouble spots are saddles, which is why noise from mini-batches helps.`,
    r: `Different random initialisations lead to different trained models; that is why results vary between runs.`,
    i: `Does gradient descent always find the global minimum? Why or why not?`,
    c: py`
grad = lambda x: 4 * x**3 - 4 * x + 0.5

def descend(x, lr=0.05, steps=200):
    for _ in range(steps):
        x -= lr * grad(x)
    return round(x, 3)

print(descend(1.5), descend(-1.5))`,
    o: `0.93 -1.057`,
    v: plot("Same landscape, two starting points, two different valleys.", { x: [-2, 2], y: [-2.5, 4], labels: ["weight x", "loss f(x)"],
      params: [par("x0", "starting point", -2, 2, 0.05, 1.5)],
      defs: [["x_0", "x0"], ...sigDefs("x_", (k) => `x_${k - 1}-0.05*(4*x_${k - 1}^3-4*x_${k - 1}+0.5)`, 50)],
      readout: ["start at x = {x0:2}  →  after 50 steps x = {x_50:3},  loss = {x_50^4-2*x_50^2+0.5*x_50:3}"],
      steps: [
        ["Starting at 1.5 the ball rolls into the nearer, shallower valley (a local minimum).", { x0: 1.5 }],
        ["Starting at −1.5 it finds the deeper valley (the global minimum).", { x0: -1.5 }],
        ["Starting at 0.5, just right of the hump near 0.13, it rolls right into the shallow valley.", { x0: 0.5 }],
        ["Starting at 0.1, just left of the hump, the same rule rolls it left into the deep valley.", { x0: 0.1 }],
      ] }, [
      curve("x^4-2*x^2+0.5*x", { c: "info" }),
      pt("x0", "x0^4-2*x0^2+0.5*x0", { c: "warn", label: "start" }),
      pt("x_50", "x_50^4-2*x_50^2+0.5*x_50", { c: "good", label: "end" }),
    ]),
  },
  {
    t: "Mini-batches, SGD and epochs",
    lv: 2,
    s: `Computing the gradient over the whole dataset every step is slow. Stochastic gradient descent uses a small random mini-batch instead: a noisier but much cheaper estimate. One pass over all the data is an epoch. 1,000 rows in batches of 100 give 10 updates per epoch. The noise even helps escape bad spots.`,
    r: `Batch size trades speed, memory and gradient noise; epochs and batch size are two of the first hyperparameters you set.`,
    i: `With 1,000 examples, batch size 100 and 5 epochs, how many weight updates happen?`,
    c: py`
n, batch = 1000, 100
updates_per_epoch = n // batch
epochs = 5
print(updates_per_epoch, updates_per_epoch * epochs)`,
    o: `10 50`,
    v: flow("Each mini-batch makes one small improvement; looping over all of them is one epoch.", "cycle",
      ["Shuffle|mix the rows|i", "Mini-batch|e.g. 100 rows|i", "Forward + loss|predict, measure error|w", "Gradient|slope over this batch|w", "Update|w ← w − η · gradient|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1, "next batch"]],
      [0, 1, 2, 3, 4],
      ["Shuffle the training data so batches are random.", "Take the next small batch.", "Run the batch through the model and compute the loss.", "Compute the gradient from that batch alone.", "Update the weights, then fetch the next batch. After all batches: one epoch."]),
  },
  {
    t: "Momentum and Adam",
    lv: 3,
    s: `Plain gradient descent forgets the past. Momentum keeps a running velocity — {{v = β·v + gradient}} — so steady directions speed up and zig-zags cancel, like a heavy ball rolling downhill. Adam also tracks the size of recent gradients and scales each weight's step separately. They usually reach a low loss in fewer steps.`,
    r: `Adam is the default optimiser for most deep-learning work; SGD with momentum remains common for vision.`,
    i: `What problem does momentum solve compared with plain gradient descent?`,
    c: py`
def run(lr, beta, steps=10):
    w, v = 0.0, 0.0
    for _ in range(steps):
        g = 2 * (w - 3)
        v = beta * v + g
        w -= lr * v
    return round((w - 3) ** 2, 4)

print(run(0.03, 0.0), run(0.03, 0.7))`,
    o: `2.611 0.0149`,
    v: plot("Same learning rate: momentum (green) reaches a low loss much sooner than plain descent (orange).", { x: [0, 10], y: [0, 9.5], labels: ["step", "loss (w − 3)²"],
      params: [par("lr", "learning rate", 0.01, 0.3, 0.01, 0.03), par("beta", "momentum β", 0, 0.95, 0.05, 0.7)],
      defs: [
        ["pw0", "0"], ["mw0", "0"], ["mv0", "0"],
        ...Array.from({ length: 10 }, (_, i): [string, string][] => {
          const k = i + 1;
          return [[`pw${k}`, `pw${k - 1}-lr*2*(pw${k - 1}-3)`], [`mv${k}`, `beta*mv${k - 1}+2*(mw${k - 1}-3)`], [`mw${k}`, `mw${k - 1}-lr*mv${k}`]];
        }).flat(),
      ],
      readout: ["after 10 steps — plain: loss {(pw10-3)^2:3}     momentum: loss {(mw10-3)^2:3}"],
      steps: [
        ["β = 0: momentum switched off — it is plain gradient descent.", { beta: 0 }],
        ["β = 0.5: a little memory — already faster.", { beta: 0.5 }],
        ["β = 0.7: the velocity builds and the loss drops far quicker. (Push β too high and it overshoots and oscillates — try 0.95.)", { beta: 0.7 }],
      ] }, [
      ...Array.from({ length: 10 }, (_, k) => seg(String(k), `(pw${k}-3)^2`, String(k + 1), `(pw${k + 1}-3)^2`, { c: "warn" })),
      ...Array.from({ length: 10 }, (_, k) => seg(String(k), `(mw${k}-3)^2`, String(k + 1), `(mw${k + 1}-3)^2`, { c: "good" })),
      pt("10", "(pw10-3)^2", { c: "warn", label: "plain" }),
      pt("10", "(mw10-3)^2", { c: "good", label: "momentum" }),
    ]),
  },
  {
    t: "Regularisation: L1 and L2",
    lv: 2,
    s: `A model can fit noise by growing huge weights. Regularisation adds a penalty on the weights to the loss so it prefers simpler solutions. L2 adds {{λ·w²}} and shrinks weights smoothly toward 0; L1 adds {{λ·|w|}} and can push some weights exactly to 0. λ sets how strong the pull is.`,
    r: `Weight decay (L2) is applied to almost every neural network; L1 is used when you want a sparse model.`,
    i: `How does adding λw² to the loss change where the minimum is?`,
    c: py`
for lam in [0, 0.5, 1, 4]:
    w_star = 3 / (1 + lam)
    print(lam, round(w_star, 3))`,
    o: `0 3.0\n0.5 2.0\n1 1.5\n4 0.6`,
    v: plot("Turn up the penalty λ and the best weight is pulled from 3 toward 0.", { x: [-1, 5], y: [0, 20], labels: ["weight w", "loss"],
      params: [par("lam", "penalty strength λ", 0, 4, 0.1, 0.5)],
      readout: ["total loss = (w − 3)² + {lam}·w²   → minimum at w = 3 / (1 + {lam}) = {3/(1+lam):3}"],
      steps: [
        ["λ = 0: no penalty — the minimum is at 3, the best fit to the data.", { lam: 0 }],
        ["λ = 1: the penalty pulls the best weight to 1.5.", { lam: 1 }],
        ["λ = 4: a heavy penalty shrinks it all the way to 0.6.", { lam: 4 }],
      ] }, [
      curve("(x-3)^2", { c: "muted", dash: true, label: "data loss" }),
      curve("lam*x^2", { c: "warn", dash: true, label: "penalty" }),
      curve("(x-3)^2+lam*x^2", { c: "accent" }),
      pt("3/(1+lam)", "(3/(1+lam)-3)^2+lam*(3/(1+lam))^2", { c: "good", label: "min" }),
    ]),
  },
  {
    t: "Overfitting and the bias–variance trade-off",
    lv: 2,
    s: `Early in training both the training and validation loss fall. Later the model starts memorising the training set: training loss keeps falling while validation loss rises — overfitting. Too simple a model has high bias (underfits); too flexible has high variance (overfits). Early stopping halts training at the validation minimum.`,
    r: `Always evaluate on data the model never trained on; the gap between training and validation loss is your overfitting alarm.`,
    i: `Training loss is falling but validation loss is rising. What is happening and what do you do?`,
    c: py`
val = [0.9, 0.6, 0.45, 0.4, 0.42, 0.47]
best = min(range(len(val)), key=val.__getitem__)
print(best, val[best])`,
    o: `3 0.4`,
    v: plot("Past the validation minimum the model memorises — the two curves part ways.", { x: [0, 20], y: [0, 2.5], labels: ["epoch", "loss"],
      params: [par("ep", "epoch", 0, 20, 1, 10)],
      readout: ["epoch {ep}: training loss = {0.2+2*exp(-ep/4):2}   validation loss = {0.36+1.75*exp(-ep/3.5)+0.012*max(0,ep-8)^2:2}"],
      steps: [
        ["Epoch 2: both losses are high — the model is still learning (underfitting).", { ep: 2 }],
        ["Epoch 8: validation loss is at its lowest — the best moment to stop.", { ep: 8 }],
        ["Epoch 18: training loss keeps falling but validation loss climbs — overfitting.", { ep: 18 }],
      ] }, [
      curve("0.2+2*exp(-x/4)", { c: "info", label: "training" }),
      curve("0.36+1.75*exp(-x/3.5)+0.012*max(0,x-8)^2", { c: "warn", label: "validation" }),
      vline("ep", { c: "muted", dash: true }),
      pt("ep", "0.2+2*exp(-ep/4)", { c: "info" }),
      pt("ep", "0.36+1.75*exp(-ep/3.5)+0.012*max(0,ep-8)^2", { c: "warn" }),
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const act: ConceptDef[] = [
  {
    t: "Why networks need non-linear activations",
    lv: 1,
    s: `Stacking linear layers gives another linear layer: two steps of "multiply by w" collapse into one bigger multiplication. The network could never bend. A non-linear activation between layers (ReLU, sigmoid, tanh) breaks that collapse and lets many layers represent curved, complicated relationships.`,
    r: `Without activations a 100-layer network is no more powerful than a single linear model.`,
    i: `Why would a network of only linear layers be useless for XOR or image recognition?`,
    c: py`
w1, w2 = 2, 3
x = 5
print(w2 * (w1 * x), (w2 * w1) * x)      # two layers = one layer
relu = lambda z: max(0, z)
print(w2 * relu(w1 * -x))                  # a ReLU breaks the collapse`,
    o: `30 30\n0`,
    v: compare("Without a bend between them, layers merge into one.", ["Linear layers only", "With activations"], [
      ["Two layers equal", "one linear layer (W₂W₁)x", "a bent, more expressive function"],
      ["Can it learn curves or XOR?", "no", "yes"],
      ["Depth helps?", "no — it collapses", "yes — each layer adds a new bend"],
    ], 1),
  },
  {
    t: "Sigmoid: squashing into 0 to 1",
    lv: 1,
    s: `The sigmoid {{σ(z) = 1/(1 + e⁻ᶻ)}} maps any real number to between 0 and 1: large negative inputs go near 0, large positive near 1, and 0 maps to 0.5. That makes it a natural output for a probability. Its drawback: at both ends the curve is almost flat, so gradients nearly vanish.`,
    r: `Binary classifiers end in a sigmoid to turn a score into a probability.`,
    i: `What is σ(0), and what is the problem with very large or very small inputs?`,
    c: py`
import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
for z in [-4, 0, 1, 4]:
    print(z, round(sigmoid(z), 3))`,
    o: `-4 0.018\n0 0.5\n1 0.731\n4 0.982`,
    v: plot("Any score becomes a probability between 0 and 1.", { x: [-6, 6], y: [-0.2, 1.2], labels: ["score z", "σ(z)"],
      params: [par("z", "score z", -6, 6, 0.1, 1)],
      readout: ["σ({z}) = 1 / (1 + e^(−{z})) = {sigmoid(z):3}"] }, [
      hline("0.5", { c: "muted", dash: true }),
      curve("sigmoid(x)", { c: "accent" }),
      pt("z", "sigmoid(z)", { c: "warn", label: "{sigmoid(z):2}" }),
    ]),
  },
  {
    t: "ReLU, tanh and Leaky ReLU",
    lv: 1,
    s: `ReLU, {{max(0, z)}}, zeroes out negatives and passes positives unchanged — cheap, and its slope is 1 for positive inputs, so gradients flow. Tanh squashes to between −1 and 1 and is centred on 0. Leaky ReLU keeps a small slope for negatives so a neuron cannot "die" at zero.`,
    r: `ReLU (and variants such as GELU) is the default hidden-layer activation; tanh appears in recurrent networks.`,
    i: `What is the "dying ReLU" problem and how does Leaky ReLU address it?`,
    c: py`
import math
for z in [-2, 0, 2]:
    print(z, max(0, z), round(math.tanh(z), 3), z if z >= 0 else 0.1 * z)`,
    o: `-2 0 -0.964 -0.2\n0 0 0.0 0\n2 2 0.964 2`,
    v: plot("Three bends: ReLU's hinge, tanh's S-curve, and Leaky ReLU's small negative slope.", { x: [-4, 4], y: [-2, 3], labels: ["input z", "output"],
      params: [par("z", "input z", -4, 4, 0.1, 1.5)],
      readout: ["z = {z}:   ReLU = {relu(z):2}   tanh = {tanh(z):3}   Leaky ReLU = {max(z,0.1*z):2}"] }, [
      curve("relu(x)", { c: "accent", label: "ReLU" }),
      curve("tanh(x)", { c: "info", label: "tanh" }),
      curve("max(x,0.1*x)", { c: "purple", dash: true, label: "Leaky" }),
      pt("z", "relu(z)", { c: "accent" }),
      pt("z", "tanh(z)", { c: "info" }),
    ]),
  },
  {
    t: "Softmax: scores to probabilities",
    lv: 1,
    s: `Softmax turns a vector of raw class scores into probabilities that add to 1: take {{eˢᶜᵒʳᵉ}} of each, then divide by the total. The biggest score gets the biggest share, and exponentials exaggerate gaps. It is applied in the last layer of a multi-class classifier.`,
    r: `A language model's next-word prediction is a softmax over its whole vocabulary.`,
    i: `Do softmax outputs always add to 1? Does a high probability mean the model is correct?`,
    c: py`
import math
scores = [2.0, 1.0, 0.1]
exps = [math.exp(s) for s in scores]
probs = [e / sum(exps) for e in exps]
print([round(p, 3) for p in probs], round(sum(probs), 3))`,
    o: `[0.659, 0.242, 0.099] 1.0`,
    v: bars("Raise one score and its share grows at the others' expense — the total stays 100%.", [["cat", "e0/(e0+e1+e2)"], ["dog", "e1/(e0+e1+e2)"], ["bird", "e2/(e0+e1+e2)"]], {
      percent: true,
      params: [par("s0", "score: cat", -2, 5, 0.1, 2), par("s1", "score: dog", -2, 5, 0.1, 1), par("s2", "score: bird", -2, 5, 0.1, 0.1)],
      defs: [["e0", "exp(s0)"], ["e1", "exp(s1)"], ["e2", "exp(s2)"]],
      readout: ["e^score → {e0:2}, {e1:2}, {e2:2}   total = {e0+e1+e2:2}", "each divided by the total → probabilities that sum to 1"],
    }),
  },
  {
    t: "Derivatives of activations and vanishing gradients",
    lv: 2,
    s: `Backpropagation multiplies by each activation's slope. The sigmoid's slope {{σ(1 − σ)}} is at most 0.25 and almost 0 at the ends — multiply many such small numbers through a deep network and the gradient vanishes, so early layers stop learning. ReLU's slope is 1 for positive inputs, which is why it trains deep networks so much better.`,
    r: `Vanishing gradients are why sigmoid was replaced by ReLU in hidden layers, and why residual connections and normalisation exist.`,
    i: `Why do gradients vanish in deep sigmoid networks?`,
    c: py`
import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
for z in [0, 2, 6]:
    s = sigmoid(z)
    print(z, round(s * (1 - s), 4))`,
    o: `0 0.25\n2 0.105\n6 0.0025`,
    v: plot("The slope (orange) peaks at 0.25 and fades to nothing where the sigmoid flattens.", { x: [-6, 6], y: [-0.05, 1.1], labels: ["input z", "value"],
      params: [par("z", "input z", -6, 6, 0.1, 2)],
      readout: ["σ({z}) = {sigmoid(z):3}     slope σ′ = σ(1 − σ) = {sigmoid(z)*(1-sigmoid(z)):4}"] }, [
      curve("sigmoid(x)", { c: "info", label: "σ" }),
      curve("sigmoid(x)*(1-sigmoid(x))", { c: "warn", label: "σ′" }),
      pt("z", "sigmoid(z)*(1-sigmoid(z))", { c: "warn" }),
    ]),
  },
];

void seg;
void compare;
