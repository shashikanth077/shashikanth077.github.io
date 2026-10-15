import { L, arrow, bars, cells, circle, compare, curve, flow, hline, layers, line, matmul, par, plot, poly, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* ------------------------------------------------------------------ */
export const num: ConceptDef[] = [
  {
    t: "Reading mathematical notation",
    lv: 1,
    s: `Maths notation is shorthand. A subscript picks an item ({{xᵢ}} is "the i-th x"), {{Σ}} means "add them all up", {{∏}} means "multiply them all", a hat marks a prediction ({{ŷ}} is "y-hat") and {{|x|}} is the size of x. Read every symbol as a short sentence and the formulas stop looking scary.`,
    r: `Every ML paper, loss function and library doc is written in this notation. {{Σ (ŷᵢ − yᵢ)²}} is simply a loop that adds up squared errors.`,
    i: `Translate {{x̄ = (1/n) Σ xᵢ}} into one sentence and one line of Python.`,
    c: py`
x = [2, 4, 6]
print(sum(x))
mean = sum(x) / len(x)
print(mean)
y = [1, 2, 3]
print(sum((p - a) ** 2 for p, a in zip(x, y)))`,
    o: `12\n4.0\n14`,
    v: compare("Every symbol is a tiny instruction; Python reads it the same way.", ["Python"], [
      ["Σ xᵢ  (add them all)", "sum(x)"],
      ["x̄ = (1/n) Σ xᵢ  (the mean)", "sum(x) / len(x)"],
      ["ŷᵢ  (prediction number i)", "pred[i]"],
      ["Σ (ŷᵢ − yᵢ)²  (squared errors)", "sum((p - a) ** 2 for p, a in zip(pred, y))"],
      ["|x|  (size, ignoring sign)", "abs(x)"],
      ["∏ xᵢ  (multiply them all)", "math.prod(x)"],
    ]),
  },
  {
    t: "Fractions, ratios and percentages",
    lv: 1,
    s: `A fraction is a division: 45/60 = 0.75. A ratio compares two amounts, and a percentage is a fraction out of 100 (0.75 = 75%). Accuracy, error rates and probabilities are all just fractions of a total.`,
    r: `Accuracy = correct ÷ total. Precision, recall, dropout rates and train/test splits are all percentages of something.`,
    i: `A model gets 45 of 60 examples right. What is its accuracy and its error rate?`,
    c: py`
correct, total = 45, 60
print(correct / total)
print(f"{correct / total:.1%}")
print(f"{(total - correct) / total:.1%} wrong")`,
    o: `0.75\n75.0%\n25.0% wrong`,
    v: bars("A fraction out of a total: the two parts always add up to 100%.", [["Correct", "correct/total"], ["Wrong", "(total-correct)/total"]], {
      params: [par("correct", "examples correct", 0, 60, 1, 45)],
      defs: [["total", "60"]],
      percent: true,
      readout: ["accuracy = {correct} / {total} = {correct/total:3}  →  {correct/total*100:1}%"],
    }),
  },
  {
    t: "Solving equations",
    lv: 1,
    s: `To solve an equation, keep it balanced: whatever you do to one side, do to the other, until the unknown stands alone. Undo addition by subtracting, undo multiplication by dividing. Check by putting your answer back in.`,
    r: `Rearranging formulas — for example finding the weight that gives a target output — is how you reason about a model by hand.`,
    i: `Solve {{2x + 3 = 13}} and show the check.`,
    c: py`
# 2x + 3 = 13
x = (13 - 3) / 2
print(x)
print(2 * x + 3)`,
    o: `5.0\n13.0`,
    v: flow("Undo the operations in reverse order, doing the same thing to both sides.", "row",
      ["2x + 3 = 13|the equation|i", "2x = 10|subtract 3 from both sides|w", "x = 5|divide both sides by 2|g", "Check|2×5 + 3 = 13 ✓|g"],
      [[0, 1, "− 3"], [1, 2, "÷ 2"], [2, 3, "put it back"]]),
  },
  {
    t: "Powers and roots",
    lv: 1,
    s: `A power repeats multiplication: {{x³ = x · x · x}}. A root undoes it: {{√9 = 3}} because 3² = 9. Negative powers mean "one over": {{10⁻² = 1/100}}. The curve {{xⁿ}} bends upward faster as n grows.`,
    r: `Squared errors, variances (σ²) and learning-rate decay are powers; norms and standard deviations are roots.`,
    i: `Why does squaring an error punish big mistakes much more than small ones?`,
    c: py`
import math
print(2 ** 3, 9 ** 0.5, math.sqrt(16))
print(10 ** -2, (-2) ** 2)`,
    o: `8 3.0 4.0\n0.01 4`,
    v: plot("The bigger the power n, the faster the curve climbs.", { x: [0, 3], y: [0, 9], labels: ["x", "y = xⁿ"], params: [par("n", "power n", 0.5, 4, 0.5, 2)], readout: ["x^n with n = {n}: at x = 2 the value is 2^{n} = {2^n:3}"] }, [
      curve("x", { c: "muted", dash: true }),
      curve("x^n", { c: "accent" }),
      pt("2", "2^n", { c: "warn", label: "(2, {2^n:2})" }),
    ]),
  },
  {
    t: "Exponentials and the number e",
    lv: 1,
    s: `An exponential multiplies by the same factor again and again: it starts slowly and then explodes. The special number {{e ≈ 2.718}} makes {{eˣ}} always positive and its slope equal to its own height. It appears in sigmoid, softmax and compound growth.`,
    r: `{{eˣ}} turns any score — positive or negative — into a positive number, which is exactly what softmax and sigmoid need.`,
    i: `What is {{e⁰}}, and why is {{eˣ}} never negative?`,
    c: py`
import math
print(math.e)
print(math.exp(0), math.exp(1))
print(round(math.exp(-1), 4))`,
    o: `2.718281828459045\n1.0 2.718281828459045\n0.3679`,
    v: plot("e^x is always positive, passes through (0, 1), and grows faster the further right you go.", { x: [-3, 3], y: [0, 20], labels: ["x", "y = e^(kx)"], params: [par("k", "growth rate k", 0.2, 1.5, 0.1, 1)], readout: ["y = e^({k}·x): at x = 0 → 1; at x = 1 → {exp(k):3}"] }, [
      curve("exp(x)", { c: "muted", dash: true }),
      curve("exp(k*x)", { c: "accent" }),
      pt("0", "1", { c: "warn", label: "(0, 1)" }),
      pt("1", "exp(k)", { c: "purple", label: "(1, {exp(k):2})" }),
    ]),
  },
  {
    t: "Logarithms",
    lv: 1,
    s: `A logarithm answers "what power gives this number?": since e² ≈ 7.39, {{ln(7.39) ≈ 2}}. It undoes the exponential, is only defined for positive numbers, dives to −∞ near 0 and grows slowly. Logs turn products into sums: {{ln(ab) = ln a + ln b}}.`,
    r: `Cross-entropy loss is {{−ln(p)}}; log-likelihoods add instead of multiply; and log scales tame huge ranges of values.`,
    i: `Why do ML losses use log-probabilities instead of multiplying many small probabilities?`,
    c: py`
import math
print(math.log(math.e), math.log(1))
print(math.log2(8), math.log10(1000))
print(round(math.exp(math.log(5)), 6))`,
    o: `1.0 0.0\n3.0 3.0\n5.0`,
    v: plot("ln(x) asks 'e to what power gives x?' — and exp undoes it.", { x: [0, 10], y: [-4, 4], labels: ["x", "y = ln(x)"], params: [par("a", "x = a", 0.1, 10, 0.1, 2)], readout: ["ln({a}) = {ln(a):3}  because  e^{ln(a):3} = {exp(ln(a)):2}"] }, [
      curve("ln(x)", { c: "accent", from: "0.03" }),
      seg("a", "0", "a", "ln(a)", { c: "warn", dash: true }),
      seg("0", "ln(a)", "a", "ln(a)", { c: "warn", dash: true }),
      pt("a", "ln(a)", { c: "warn", label: "(a, ln a)" }),
    ]),
  },
  {
    t: "Functions and graphs",
    lv: 1,
    s: `A function is a machine: put in x, the same rule always gives out one y. To draw it, pick several x values, compute each y, plot the points {{(x, y)}} and join them. A whole neural network is one big function built from small ones.`,
    r: `Think of a model as {{ŷ = f(x)}}: the picture of f is what training reshapes.`,
    i: `What is the difference between a function's input, output and rule?`,
    c: py`
def f(x):
    return 2 * x + 1

xs = [-2, -1, 0, 1, 2]
print([(x, f(x)) for x in xs])`,
    o: `[(-2, -3), (-1, -1), (0, 1), (1, 3), (2, 5)]`,
    v: plot("Choose x, apply the rule, mark (x, y) — enough points reveal the shape.", {
      x: [-3, 3], y: [-5, 7], labels: ["x", "y = 2x + 1"],
      params: [par("n", "points drawn", 0, 6, 0.1, 0)],
      readout: ["rule: y = 2·x + 1"],
      steps: [
        ["Start with the rule y = 2x + 1. Pick x = −2.", { n: 0 }],
        ["x = −2 → y = 2(−2) + 1 = −3. Plot (−2, −3).", { n: 1 }],
        ["x = −1 → y = −1.", { n: 2 }],
        ["x = 0 → y = 1.", { n: 3 }],
        ["x = 1 → y = 3.", { n: 4 }],
        ["x = 2 → y = 5.", { n: 5 }],
        ["Join the points: a straight line. Every other x lands on it too.", { n: 6 }],
      ],
    }, [
      ...[1, 2, 3, 4, 5].map((k) => pt(String(k - 3), String(2 * (k - 3) + 1), { c: "warn", show: `n-${k}+0.5`, label: `(${k - 3}, ${2 * (k - 3) + 1})` })),
      curve("2*x+1", { c: "accent", show: "n-5.5" }),
    ]),
  },
  {
    t: "Function composition: chains of functions",
    lv: 2,
    s: `Composition feeds one function's output into the next: {{f(g(x))}}. If {{u = 3x + 1}} and {{y = u²}}, then {{y = (3x + 1)²}}. A neural network is a long chain — layer after layer — and the chain rule later tells you how a change at the start ripples to the end.`,
    r: `Input → layer 1 → layer 2 → … → loss is one composed function. Backpropagation is the chain rule applied to it.`,
    i: `If u = 3x + 1 and y = u², what is y when x = 3?`,
    c: py`
def u(x):
    return 3 * x + 1

def y(u_value):
    return u_value ** 2

x = 3
print(u(x), y(u(x)))`,
    o: `10 100`,
    v: flow("The output of one function becomes the input of the next.", "row",
      ["x = 3|the input|i", "u = 3x + 1|= 10|w", "y = u²|= 100|g"],
      [[0, 1, "apply u"], [1, 2, "apply y"]],
      undefined,
      ["First function: u(3) = 3·3 + 1 = 10.", "Second function takes that 10: y = 10² = 100. So y(u(3)) = 100."]),
  },
];

/* ------------------------------------------------------------------ */
export const lin: ConceptDef[] = [
  {
    t: "What slope means",
    lv: 1,
    s: `Slope is "change per one": how much y changes when x increases by 1. Pick two points, find the rise (change in y) and the run (change in x), then divide: {{m = (y₂ − y₁) / (x₂ − x₁)}}. Always say the units — for a taxi, slope is euros per kilometre.`,
    r: `A weight in a model is a slope: how much the output moves when that input moves by one.`,
    i: `Explain slope as a "change per one" with a real-world example, including units.`,
    c: py`
x1, y1 = 2, 7
x2, y2 = 5, 13
rise = y2 - y1
run = x2 - x1
print(rise, run, rise / run)`,
    o: `6 3 2.0`,
    v: plot("Slope = rise ÷ run. Move point B and watch both change.", { x: [0, 10], y: [-2, 12], labels: ["x", "y"],
      params: [par("x2", "B: x₂", 1.5, 9, 0.5, 5), par("y2", "B: y₂", -2, 12, 0.5, 8)],
      readout: ["rise = {y2} − 2 = {y2-2}     run = {x2} − 1 = {x2-1}", "slope m = rise / run = {(y2-2)/(x2-1):3}"] }, [
      line("1", "2", "(y2-2)/(x2-1)", { c: "accent", dash: true }),
      seg("1", "2", "x2", "2", { c: "warn", dash: true, label: "run" }),
      seg("x2", "2", "x2", "y2", { c: "bad", dash: true, label: "rise" }),
      pt("1", "2", { c: "accent", label: "A" }),
      pt("x2", "y2", { c: "accent", label: "B" }),
    ]),
  },
  {
    t: "The line y = wx + b",
    lv: 1,
    s: `The most important equation to understand before a neural network: {{y = wx + b}}. The weight {{w}} is the slope — how steeply y changes with x. The bias {{b}} is the intercept — the value of y when x = 0 — and it slides the line up or down. A taxi that charges €3 to start and €2 per km has w = 2, b = 3.`,
    r: `A neuron's first step is exactly {{z = w·x + b}}. Training finds the w and b that make the line pass close to the data.`,
    i: `What does the weight control, and what does the bias control?`,
    c: py`
def fare(km, w=2, b=3):
    return w * km + b

print(fare(0), fare(2), fare(5))`,
    o: `3 7 13`,
    v: plot("w tilts the line; b slides it up or down.", { x: [0, 10], y: [-6, 30], labels: ["distance x (km)", "fare y (€)"],
      params: [par("w", "price per km (w)", -1, 4, 0.25, 2), par("b", "starting fee (b)", -3, 10, 0.5, 3)],
      readout: ["fare = {w} × km + ({b})", "0 km → {b}     5 km → {w*5+b:2}     10 km → {w*10+b:2}"] }, [
      curve("w*x+b", { c: "accent" }),
      pt("0", "b", { c: "warn", label: "b = {b}" }),
      pt("5", "5*w+b", { c: "purple", label: "5 km: {5*w+b:2}" }),
    ]),
  },
  {
    t: "Positive, negative, zero and undefined slope",
    lv: 1,
    s: `Read a line left to right. Positive slope climbs, negative slope falls, zero slope is flat (no change at all). A vertical line has run = 0, so the division is by zero: its slope is undefined — not zero. Two identical points (0/0) also give no single slope.`,
    r: `Gradients are slopes: positive means "output rises as this weight rises", negative means it falls, zero means a flat spot (maybe a minimum).`,
    i: `What is the difference between a zero slope and an undefined slope?`,
    c: py`
def slope(p, q):
    (x1, y1), (x2, y2) = p, q
    if x1 == x2:
        return "undefined"
    return (y2 - y1) / (x2 - x1)

print(slope((1, 2), (3, 6)), slope((2, 5), (6, 3)))
print(slope((1, 4), (5, 4)), slope((3, 2), (3, 7)))`,
    o: `2.0 -0.5\n0.0 undefined`,
    v: plot("Climbing, falling, flat — and the vertical line that has no slope at all.", { x: [-1, 6], y: [-1, 8], labels: ["x", "y"],
      params: [par("m", "slope m", -3, 3, 0.25, 2), par("v", "vertical? (0 / 1)", 0, 1, 1, 0)],
      readout: ["slope m = {m}   (when v = 1 the line is vertical: run = 0, slope undefined)"],
      steps: [
        ["Positive slope (m = +2): going right, the line climbs.", { m: 2, v: 0 }],
        ["Negative slope (m = −1.5): going right, the line falls.", { m: -1.5, v: 0 }],
        ["Zero slope (m = 0): flat — y does not change at all.", { m: 0, v: 0 }],
        ["Vertical: run = 0, so rise ÷ 0 is undefined. It is NOT zero.", { m: 0, v: 1 }],
      ] }, [
      line("2.5", "3.5", "m", { c: "accent", show: "0.5-v" }),
      vline("2.5", { c: "bad", show: "v-0.5" }),
      pt("2.5", "3.5", { c: "warn" }),
    ]),
  },
  {
    t: "Worked example: a taxi fare",
    lv: 1,
    s: `Fare = €3 start + €2 per km. Compute two fares, then their slope — it recovers the €2 per km. Once you know w and b you can predict any trip: 6 km costs 2 × 6 + 3 = €15. The extra €6 between 2 km and 5 km is the total change; €2/km is the change per kilometre.`,
    r: `Fitting a line to data is the same job in reverse: given many (x, y) examples, find the w and b that explain them.`,
    i: `Given two points on a line, how do you find its equation and predict a new value?`,
    c: py`
w, b = 2, 3
km = [2, 5]
fares = [w * k + b for k in km]
slope = (fares[1] - fares[0]) / (km[1] - km[0])
print(fares, slope)
print("6 km ->", w * 6 + b)`,
    o: `[7, 13] 2.0\n6 km -> 15`,
    v: trace("Two points give the slope; slope and intercept give every other prediction.", py`
w, b = 2, 3
km = [2, 5]
fares = [w * k + b for k in km]
slope = (fares[1] - fares[0]) / (km[1] - km[0])
print(fares, slope)
print("6 km ->", w * 6 + b)`, [
      [1, { w: "2", b: "3" }, undefined, "The tariff: €2 per km plus a €3 starting fee."],
      [2, { km: "[2, 5]" }],
      [3, { fares: "[7, 13]" }, undefined, "2×2 + 3 = 7 and 2×5 + 3 = 13."],
      [4, { slope: "2.0" }, undefined, "(13 − 7) / (5 − 2) = 6 / 3 = 2 € per km — the weight, recovered from two points."],
      [5, undefined, "[7, 13] 2.0"],
      [6, undefined, "6 km -> 15", "Prediction: 2×6 + 3 = 15."],
    ]),
  },
  {
    t: "Slope depends on units",
    lv: 2,
    s: `Slope is a ratio of units, so changing the units changes the number but not the relationship: €2 per km is €0.002 per metre. A fare of €2/km over 5000 m still costs €10. Always read a slope together with its units, and never compare slopes with different units directly.`,
    r: `Feature scaling exists because weights for a feature measured in millimetres and one in kilometres differ by a factor of a million.`,
    i: `If a slope is 2 €/km, what is it in €/m, and why doesn't the cost of a trip change?`,
    c: py`
per_km = 2
per_m = per_km / 1000
print(per_m)
print(per_km * 5, per_m * 5000)`,
    o: `0.002\n10 10.0`,
    v: compare("Same relationship, different numbers: the units travel with the slope.", ["Per kilometre", "Per metre"], [
      ["Slope", "2", "0.002"],
      ["Units", "€ / km", "€ / m"],
      ["Cost of the same trip", "5 km → €10", "5000 m → €10"],
      ["Same relationship?", "yes", "yes"],
    ]),
  },
  {
    t: "Why y ÷ x is not the slope",
    lv: 2,
    s: `A common mistake: dividing y by x. That is the slope only when the line passes through the origin. With a starting fee, 7 ÷ 2 = 3.5 at 2 km is not the slope of 2. Slope always uses a difference between two points.`,
    r: `A bias term exists precisely because real data rarely passes through the origin — ignoring it distorts every weight.`,
    i: `Why can't you get the slope of y = 2x + 3 by dividing a single y by its x?`,
    c: py`
def fare(x):
    return 2 * x + 3

for km in [1, 2, 4]:
    print(km, fare(km) / km)
print((fare(4) - fare(2)) / (4 - 2))`,
    o: `1 5.0\n2 3.5\n4 2.75\n2.0`,
    v: plot("y/x changes from point to point; the true slope is always 2.", { x: [0, 8], y: [0, 20], labels: ["x", "y = 2x + 3"],
      params: [par("x", "choose x", 0.5, 8, 0.5, 2)],
      readout: ["y = {2*x+3}     y / x = {(2*x+3)/x:3}   ← not the slope", "true slope = 2 (the same everywhere)"] }, [
      curve("2*x+3", { c: "accent" }),
      seg("0", "0", "x", "2*x+3", { c: "bad", dash: true, label: "y/x = {(2*x+3)/x:2}" }),
      pt("x", "2*x+3", { c: "warn" }),
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const vec: ConceptDef[] = [
  {
    t: "Scalars, vectors, matrices and tensors",
    lv: 1,
    s: `A scalar is one number. A vector is a list of numbers (one dimension). A matrix is a table (two dimensions). A tensor is the general case: three or more dimensions, like a colour image. The shape — a tuple such as {{(2, 3)}} — says how many numbers along each dimension.`,
    r: `Features are vectors, a batch of examples is a matrix, an image batch is a 4-D tensor. Most errors in deep learning are shape errors.`,
    i: `What is the shape of a batch of 32 RGB images that are 224×224?`,
    c: py`
scalar = 7
vector = [5, 7, 9]
matrix = [[5, 7, 9], [1, 2, 3]]
print(len(vector), (len(matrix), len(matrix[0])))`,
    o: `3 (2, 3)`,
    v: layers("Add a dimension and you get the next kind of object.", [
      "Scalar|one number: 7|g",
      "Vector|a list: [5, 7, 9] — shape (3,)|i",
      "Matrix|a table: 2 rows × 3 columns — shape (2, 3)|i",
      "Tensor|3 or more dimensions: an image (224, 224, 3), a batch (32, 224, 224, 3)|w",
    ], "adds a dimension"),
  },
  {
    t: "Vector addition and scaling",
    lv: 1,
    s: `A vector can be drawn as an arrow from the origin. To add two vectors, add matching components — or slide one arrow to the tip of the other: {{[2, 1] + [1, 2] = [3, 3]}}. Multiplying by a scalar stretches (or flips) the arrow without changing its direction.`,
    r: `Embeddings are vectors; adding and subtracting them gives the famous "king − man + woman ≈ queen" arithmetic.`,
    i: `What does multiplying a vector by −2 do to its direction and length?`,
    c: py`
u = [2, 1]
v = [1, 2]
print([a + b for a, b in zip(u, v)])
print([3 * a for a in u])`,
    o: `[3, 3]\n[6, 3]`,
    v: plot("u + v is the diagonal: v slid to the tip of u.", { x: [-6, 6], y: [-6, 6], labels: ["x", "y"],
      params: [par("ux", "u: x", -4, 4, 1, 2), par("uy", "u: y", -4, 4, 1, 1), par("vx", "v: x", -4, 4, 1, 1), par("vy", "v: y", -4, 4, 1, 2)],
      readout: ["u = [{ux}, {uy}]   v = [{vx}, {vy}]   →   u + v = [{ux+vx}, {uy+vy}]"] }, [
      arrow("0", "0", "ux", "uy", { c: "info", label: "u" }),
      arrow("0", "0", "vx", "vy", { c: "purple", label: "v" }),
      arrow("ux", "uy", "ux+vx", "uy+vy", { c: "warn", dash: true }),
      arrow("0", "0", "ux+vx", "uy+vy", { c: "accent", label: "u + v" }),
    ]),
  },
  {
    t: "The dot product: a weighted score",
    lv: 1,
    s: `Multiply matching components, then add: {{[x₁, x₂, x₃] · [w₁, w₂, w₃] = x₁w₁ + x₂w₂ + x₃w₃}}. The result is one number. A weight says how much an input matters; a negative weight pushes the answer down. Add a bias and you have a neuron's pre-activation.`,
    r: `Every dense layer, attention score and similarity search is built from dot products.`,
    i: `Compute [1, 2, 3] · [4, 5, 6] and say what a dot product measures.`,
    c: py`
x = [5, 7, 9]      # hours studied, hours slept, days attended
w = [4, 2, 0.5]    # how much each one matters
b = 10
score = sum(xi * wi for xi, wi in zip(x, w)) + b
print(score)`,
    o: `48.5`,
    v: matmul("A dot product is one row times one column: multiply pairs, then add.", [[5, 7, 9]], [[4], [2], [0.5]], ["x", "w", "score"], [10]),
  },
  {
    t: "Element-wise product versus dot product",
    lv: 1,
    s: `Element-wise multiplication keeps the shape: it multiplies matching entries and returns a vector. The dot product goes one step further and adds those products into a single number. They are easy to confuse — in NumPy, {{*}} is element-wise and {{@}} is the dot / matrix product.`,
    r: `Masks and gating (element-wise) versus scores and projections (dot product) both appear in the same network.`,
    i: `What is the output shape of an element-wise product versus a dot product?`,
    c: py`
x = [5, 7, 9]
w = [4, 2, 0.5]
elementwise = [a * b for a, b in zip(x, w)]
print(elementwise, sum(elementwise))`,
    o: `[20, 14, 4.5] 38.5`,
    v: compare("Same multiplications — but the dot product also adds them up.", ["Element-wise (x * w)", "Dot product (x · w)"], [
      ["Result", "a vector: [20, 14, 4.5]", "one number: 38.5"],
      ["Shape out", "same as the inputs", "a single value"],
      ["Python", "[a * b for a, b in zip(x, w)]", "sum(a * b for a, b in zip(x, w))"],
      ["Used for", "masks, gates, scaling each feature", "weighted sums, similarity, attention"],
    ]),
  },
  {
    t: "Vector length: the L1 and L2 norms",
    lv: 1,
    s: `A norm measures a vector's size. L2 (Euclidean) is the straight-line length, {{√(x² + y²)}} — Pythagoras. L1 adds the absolute values, {{|x| + |y|}} — a taxi-cab walk along the grid. Dividing a vector by its L2 length gives a unit vector (length 1) that keeps only the direction.`,
    r: `L2 appears in distances and weight decay; L1 encourages sparse weights; unit vectors are used before cosine similarity.`,
    i: `Compute the L1 and L2 norms of [3, 4].`,
    c: py`
import math
v = [3, 4]
l2 = math.sqrt(sum(a * a for a in v))
l1 = sum(abs(a) for a in v)
print(l2, l1)
unit = [a / l2 for a in v]
print(unit)`,
    o: `5.0 7\n[0.6, 0.8]`,
    v: plot("L2 is the straight line; L1 is the walk along the axes.", { x: [-6, 6], y: [-6, 6], labels: ["x", "y"],
      params: [par("vx", "v: x", -5, 5, 1, 3), par("vy", "v: y", -5, 5, 1, 4)],
      readout: ["L2 length = √({vx}² + {vy}²) = {sqrt(vx^2+vy^2):3}", "L1 length = |{vx}| + |{vy}| = {abs(vx)+abs(vy)}"] }, [
      seg("0", "0", "vx", "0", { c: "warn", dash: true }),
      seg("vx", "0", "vx", "vy", { c: "warn", dash: true }),
      arrow("0", "0", "vx", "vy", { c: "accent", label: "‖v‖₂ = {sqrt(vx^2+vy^2):2}" }),
    ]),
  },
  {
    t: "Distance between points",
    lv: 1,
    s: `The distance between two points is the L2 length of their difference vector: {{d = √((x₂ − x₁)² + (y₂ − y₁)²)}}. With many features it is the same formula with more terms. Close points are "similar"; far points are not.`,
    r: `k-nearest neighbours, clustering and embedding search all rank things by distance.`,
    i: `How would you find the closest of 1,000 training points to a new one?`,
    c: py`
import math
a, b = (1, 1), (4, 5)
dist = math.dist(a, b)
print(dist)`,
    o: `5.0`,
    v: plot("Distance is the hypotenuse of the right triangle between the two points.", { x: [0, 10], y: [0, 10], labels: ["feature 1", "feature 2"],
      params: [par("bx", "B: x", 0, 10, 0.5, 4), par("by", "B: y", 0, 10, 0.5, 5)],
      readout: ["Δx = {bx-1}   Δy = {by-1}", "d = √({bx-1}² + {by-1}²) = {sqrt((bx-1)^2+(by-1)^2):3}"] }, [
      seg("1", "1", "bx", "1", { c: "warn", dash: true }),
      seg("bx", "1", "bx", "by", { c: "warn", dash: true }),
      seg("1", "1", "bx", "by", { c: "accent", label: "d = {sqrt((bx-1)^2+(by-1)^2):2}" }),
      pt("1", "1", { c: "info", label: "A" }),
      pt("bx", "by", { c: "purple", label: "B" }),
    ]),
  },
  {
    t: "Cosine similarity: comparing direction",
    lv: 2,
    s: `Cosine similarity compares the direction of two vectors and ignores their length: {{cos θ = (u · v) / (‖u‖ ‖v‖)}}. It is 1 when they point the same way, 0 when perpendicular, −1 when opposite. Two documents can be similar even if one is much longer.`,
    r: `Embedding search and retrieval (RAG) rank passages by cosine similarity between the query vector and each document vector.`,
    i: `Why prefer cosine similarity over distance when comparing text embeddings?`,
    c: py`
import math

def cosine(u, v):
    dot = sum(a * b for a, b in zip(u, v))
    return dot / (math.sqrt(sum(a * a for a in u)) * math.sqrt(sum(b * b for b in v)))

print(round(cosine([1, 0], [1, 1]), 4))
print(round(cosine([1, 2], [2, 4]), 4), round(cosine([1, 0], [0, 1]), 4))`,
    o: `0.7071\n1.0 0.0`,
    v: plot("Same direction → 1; at right angles → 0; opposite → −1 — length does not matter.", { x: [-5, 5], y: [-5, 5], labels: ["x", "y"],
      params: [par("vx", "v: x", -4, 4, 0.5, 2), par("vy", "v: y", -4, 4, 0.5, 2)],
      readout: ["u = [3, 1]   v = [{vx}, {vy}]", "cos θ = (u·v) / (‖u‖‖v‖) = {(3*vx+vy)/(sqrt(10)*sqrt(vx^2+vy^2)):3}   (angle ≈ {acos((3*vx+vy)/(sqrt(10)*sqrt(vx^2+vy^2)))*180/pi:0}°)"] }, [
      arrow("0", "0", "3", "1", { c: "info", label: "u" }),
      arrow("0", "0", "vx", "vy", { c: "purple", label: "v" }),
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const mat: ConceptDef[] = [
  {
    t: "Matrix multiplication and the shape rule",
    lv: 1,
    s: `Each entry of the product is a dot product of one row of A with one column of B. The inner sizes must match: an (m × n) matrix times an (n × p) matrix gives an (m × p) matrix. A (2 × 3) times a (3 × 2) is (2 × 2); a (2 × 3) times a (2 × 3) is not allowed.`,
    r: `A whole layer of neurons — and a whole batch of examples — is computed with one matrix multiplication; GPUs are built for it.`,
    i: `What is the shape of (4 × 3) · (3 × 5), and when is a matrix product undefined?`,
    c: py`
A = [[1, 2, 3], [4, 5, 6]]
B = [[7, 8], [9, 10], [11, 12]]
C = [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]
print(C)`,
    o: `[[58, 64], [139, 154]]`,
    v: matmul("Each cell of C is a row of A dotted with a column of B.", [[1, 2, 3], [4, 5, 6]], [[7, 8], [9, 10], [11, 12]], ["A", "B", "C"]),
  },
  {
    t: "A neural-network layer is a matrix multiply",
    lv: 1,
    s: `A dense layer computes {{Z = XW + b}}: X holds one example per row, W holds one column of weights per neuron, and the bias is added to every row. With 3 examples, 2 features and 2 neurons, X is (3 × 2), W is (2 × 2), and Z is (3 × 2): every neuron's output for every example at once.`,
    r: `This is the forward pass of a dense layer — the single most common operation in deep learning.`,
    i: `Explain the shapes in {{Z = XW + b}} for a batch of 100 examples with 20 features and 64 neurons.`,
    c: py`
X = [[2, 3], [1, 0], [4, 1]]
W = [[1, 2], [3, -1]]
b = [0.5, -1]
Z = [[sum(x * w for x, w in zip(row, col)) + bj for col, bj in zip(zip(*W), b)] for row in X]
print(Z)`,
    o: `[[11.5, 0], [1.5, 1], [7.5, 6]]`,
    v: matmul("Z = XW + b: every example through every neuron in one go.", [[2, 3], [1, 0], [4, 1]], [[1, 2], [3, -1]], ["X (examples)", "W (weights)", "Z (outputs)"], [0.5, -1]),
  },
  {
    t: "Transpose",
    lv: 1,
    s: `The transpose {{Aᵀ}} flips a matrix over its diagonal: rows become columns. A (2 × 3) matrix becomes (3 × 2). You use it to line shapes up for multiplication, as in {{XᵀX}} or {{WᵀW}}.`,
    r: `Gradients with respect to weights are written with transposes: {{∂L/∂W = Xᵀ · (∂L/∂Z)}}.`,
    i: `What is the shape of {{Aᵀ}} when A is (2 × 3), and what is {{(Aᵀ)ᵀ}}?`,
    c: py`
A = [[1, 2, 3], [4, 5, 6]]
At = [list(col) for col in zip(*A)]
print(At)`,
    o: `[[1, 4], [2, 5], [3, 6]]`,
    v: cells("Row i of A becomes column i of Aᵀ.", [L("A[0]", ["1", "2", "3"], "pos"), L("A[1]", ["4", "5", "6"], "pos")], [
      ["A is (2 × 3): two rows, three columns."],
      ["Row 0 of A, [1, 2, 3], is about to become column 0.", [[0, 0, 2]]],
      ["Aᵀ is (3 × 2): column 0 now holds 1, 2, 3 — the old row 0.", [[0, 0, 0], [1, 0, 0], [2, 0, 0]], [L("Aᵀ[0]", ["1", "4"], "pos"), L("Aᵀ[1]", ["2", "5"], "pos"), L("Aᵀ[2]", ["3", "6"], "pos")]],
      ["And column 1 holds the old row 1: 4, 5, 6.", [[0, 1, 1], [1, 1, 1], [2, 1, 1]]],
    ]),
  },
  {
    t: "Matrices transform space",
    lv: 2,
    s: `A 2×2 matrix is a machine that moves every point of the plane. Its columns say where the unit vectors land: the first column is where {{(1, 0)}} goes, the second where {{(0, 1)}} goes. Scaling, rotating and shearing are all matrices; the unit square shows what happens to everything.`,
    r: `A dense layer reshapes the space your data lives in, stretching and rotating it until classes are easy to separate.`,
    i: `What do the columns of a transformation matrix represent?`,
    c: py`
A = [[2, 0], [0, 1]]
p = [1, 1]
q = [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]]
print(q)`,
    o: `[2, 1]`,
    v: plot("The columns (a, c) and (b, d) show where the two unit vectors land; the square follows.", { x: [-3, 3], y: [-3, 3], labels: ["x", "y"],
      params: [par("a", "a", -2, 2, 0.05, 1), par("b", "b", -2, 2, 0.05, 0), par("c", "c", -2, 2, 0.05, 0), par("d", "d", -2, 2, 0.05, 1)],
      readout: ["matrix [[{a}, {b}], [{c}, {d}]]", "(1, 0) → ({a}, {c})    (0, 1) → ({b}, {d})    area scale = det = {a*d-b*c:3}"],
      steps: [
        ["The identity matrix changes nothing: the square stays put.", { a: 1, b: 0, c: 0, d: 1 }],
        ["Scale x by 2: the first column becomes (2, 0), so the square stretches sideways.", { a: 2, b: 0, c: 0, d: 1 }],
        ["Rotate 45°: both unit vectors turn, lengths unchanged (determinant 1).", { a: 0.7071, b: -0.7071, c: 0.7071, d: 0.7071 }],
        ["Shear: (0, 1) is pushed to (1, 1) — the square leans over.", { a: 1, b: 1, c: 0, d: 1 }],
      ] }, [
      poly([["0", "0"], ["1", "0"], ["1", "1"], ["0", "1"]], { c: "muted", dash: true }),
      poly([["0", "0"], ["a", "c"], ["a+b", "c+d"], ["b", "d"]], { c: "accent", fill: true }),
      arrow("0", "0", "a", "c", { c: "good", label: "(a, c)" }),
      arrow("0", "0", "b", "d", { c: "warn", label: "(b, d)" }),
    ]),
  },
  {
    t: "Solving linear systems",
    lv: 2,
    s: `A system such as {{x + y = 4}} and {{x − y = 2}} asks where two lines cross. Each equation is a line; the solution is their intersection. In matrix form it is {{A·v = e}}, solved by the inverse, {{v = A⁻¹e}} — if one exists. Parallel lines have no solution; identical lines have infinitely many.`,
    r: `Least-squares fitting and many closed-form ML solutions are linear systems.`,
    i: `Why does a system with parallel lines have no solution?`,
    c: py`
a, b, c, d = 1, 1, 1, -1      # x + y = 4  and  x - y = 2
e, f = 4, 2
det = a * d - b * c
x = (e * d - b * f) / det
y = (a * f - e * c) / det
print(x, y)`,
    o: `3.0 1.0`,
    v: plot("The solution is where the two lines cross. Move the second line.", { x: [-2, 8], y: [-4, 8], labels: ["x", "y"],
      params: [par("d", "second line: x − y = d", -2, 6, 0.5, 2)],
      readout: ["x + y = 4   and   x − y = {d}", "they cross at x = {(4+d)/2}, y = {(4-d)/2}"] }, [
      curve("4-x", { c: "info", label: "x + y = 4" }),
      curve("x-d", { c: "purple", label: "x − y = d" }),
      pt("(4+d)/2", "(4-d)/2", { c: "warn", label: "({(4+d)/2:2}, {(4-d)/2:2})" }),
    ]),
  },
  {
    t: "Determinant, inverse and rank",
    lv: 2,
    s: `For a 2×2 matrix the determinant {{ad − bc}} is the signed area of the parallelogram its columns span — how much it scales area. If the determinant is 0 the columns lie on one line, the matrix squashes the plane flat, loses information, and has no inverse (its rank is less than 2).`,
    r: `Rank tells you how many independent features you really have; a rank-deficient feature matrix breaks linear regression.`,
    i: `What does a determinant of zero tell you about a matrix?`,
    c: py`
a, b, c, d = 2, 1, 1, 3
det = a * d - b * c
inv = [[d / det, -b / det], [-c / det, a / det]]
print(det)
print(inv)`,
    o: `5\n[[0.6, -0.2], [-0.2, 0.4]]`,
    v: plot("The determinant is the area of the parallelogram; squash it flat and it is 0.", { x: [-3, 6], y: [-3, 4], labels: ["x", "y"],
      params: [par("vx", "v: x", -2, 3, 0.25, 1), par("vy", "v: y", -2, 3, 0.25, 1.5)],
      readout: ["columns u = [2, 0], v = [{vx}, {vy}]", "det = 2·{vy} − 0·{vx} = {2*vy:2}   (area = {abs(2*vy):2})", "det = 0 → the arrows lie on one line: no inverse"],
      steps: [
        ["Two independent arrows span a parallelogram with area 3.", { vx: 1, vy: 1.5 }],
        ["Lean v down toward u: the area shrinks.", { vx: 1, vy: 0.5 }],
        ["v lies along u: the area is 0, the determinant is 0 — the matrix flattens the plane.", { vx: 1, vy: 0 }],
      ] }, [
      poly([["0", "0"], ["2", "0"], ["2+vx", "vy"], ["vx", "vy"]], { c: "accent", fill: true }),
      arrow("0", "0", "2", "0", { c: "info", label: "u" }),
      arrow("0", "0", "vx", "vy", { c: "purple", label: "v" }),
    ]),
  },
  {
    t: "Eigenvectors and eigenvalues",
    lv: 3,
    s: `Most vectors change direction when a matrix acts on them. An eigenvector is special: the matrix only stretches it, {{A v = λ v}}, and the stretch factor λ is the eigenvalue. For {{A = [[2, 1], [1, 2]]}} the direction (1, 1) is stretched ×3 and (1, −1) ×1.`,
    r: `PCA directions are eigenvectors of the covariance matrix; their eigenvalues say how much variance each carries.`,
    i: `In one sentence, what is an eigenvector?`,
    c: py`
A = [[2, 1], [1, 2]]
v = [1, 1]
Av = [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]]
print(Av)`,
    o: `[3, 3]`,
    v: plot("Turn v around: only at special angles does A·v stay on the same line as v.", { x: [-4, 4], y: [-4, 4], labels: ["x", "y"],
      params: [par("t", "angle of v (radians)", 0, 3.14, 0.02, 0.3)],
      readout: ["v = ({cos(t):2}, {sin(t):2})    A·v = ({2*cos(t)+sin(t):2}, {cos(t)+2*sin(t):2})", "cross product v × Av = {cos(t)*(cos(t)+2*sin(t))-sin(t)*(2*cos(t)+sin(t)):3}   (0 means same direction)"],
      steps: [
        ["A generic direction: A·v points somewhere else.", { t: 0.3 }],
        ["At 45° (t ≈ 0.785) A·v lies on the same line and is exactly 3× longer: eigenvalue 3.", { t: 0.785 }],
        ["At 135° the matrix leaves the length unchanged: eigenvalue 1.", { t: 2.356 }],
      ] }, [
      line("0", "0", "1", { c: "muted", dash: true }),
      line("0", "0", "-1", { c: "muted", dash: true }),
      arrow("0", "0", "cos(t)", "sin(t)", { c: "info", label: "v" }),
      arrow("0", "0", "2*cos(t)+sin(t)", "cos(t)+2*sin(t)", { c: "warn", label: "A·v" }),
    ]),
  },
  {
    t: "Hyperplanes and decision boundaries",
    lv: 2,
    s: `In 2D the set of points with {{w₁x + w₂y + b = 0}} is a line; in 3D a plane; in n dimensions a hyperplane. The weight vector (w₁, w₂) is perpendicular to it. Plug a point in: positive means one side, negative the other. That sign is a linear classifier.`,
    r: `A single neuron with a threshold, logistic regression and a linear SVM all draw a hyperplane through feature space.`,
    i: `How does a linear classifier decide which side of the boundary a point is on?`,
    c: py`
w, b = [1, 1], -2
for p in [(2, 2), (-1, 0)]:
    z = w[0] * p[0] + w[1] * p[1] + b
    print(p, z, "class 1" if z > 0 else "class 0")`,
    o: `(2, 2) 2 class 1\n(-1, 0) -3 class 0`,
    v: plot("The weights point toward the 'positive' side; z = 0 is the boundary.", { x: [-4, 4], y: [-4, 4], labels: ["feature 1", "feature 2"],
      params: [par("w1", "w₁", -3, 3, 0.5, 1), par("w2", "w₂", -3, 3, 0.5, 1), par("b", "bias b", -4, 4, 0.5, -2)],
      readout: ["z = {w1}·x + {w2}·y + ({b})", "point (2, 2): z = {w1*2+w2*2+b:2}     point (−1, 0): z = {-w1+b:2}"] }, [
      curve("-(w1*x+b)/w2", { c: "accent", show: "abs(w2)-0.01" }),
      vline("-b/w1", { c: "accent", show: "0.01-abs(w2)" }),
      arrow("0", "0", "w1", "w2", { c: "warn", label: "w" }),
      pt("2", "2", { c: "good", label: "z = {w1*2+w2*2+b:1}" }),
      pt("-1", "0", { c: "bad", label: "z = {-w1+b:1}" }),
    ]),
  },
];

void circle;
void hline;
