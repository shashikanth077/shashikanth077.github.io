import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["num", 1, "What does {{Σ}} mean?", "\"Add up\": the sum of a list of terms. {{Σ xᵢ}} is {{sum(x)}} in Python."],
  ["num", 1, "Why is a logarithm useful in ML?", "It turns products into sums ({{ln(ab) = ln a + ln b}}), so many small probabilities can be added instead of multiplied without underflow; it also tames huge ranges and appears in cross-entropy."],
  ["num", 1, "What does the number e represent?", "About 2.718. The exponential {{eˣ}} is the function whose slope equals its own value, which makes it the natural base for growth, sigmoid and softmax."],
  ["num", 2, "What is function composition?", "Feeding the output of one function into another: {{f(g(x))}}. A neural network is a long composition of layers."],
  ["lin", 1, "What does the slope of a line mean?", "How much y changes when x increases by 1 — rise over run, with units (for a taxi, euros per kilometre)."],
  ["lin", 1, "In {{y = wx + b}}, what do w and b do?", "w is the slope (how steeply y changes); b is the intercept (the value of y when x = 0) and shifts the line up or down."],
  ["lin", 1, "Is the slope of a vertical line zero?", "No — it is undefined, because the run is 0 and you cannot divide by zero. A horizontal line has slope 0."],
  ["lin", 2, "Why isn't {{y / x}} the slope?", "Slope is a ratio of differences between two points. y / x equals the slope only for lines through the origin; a bias term breaks that."],
  ["vec", 1, "What is a dot product?", "Multiply matching components and add: {{x · w = Σ xᵢwᵢ}}. It gives one number — a weighted sum, and a measure of how aligned two vectors are."],
  ["vec", 1, "What is the L2 norm of {{[3, 4]}}?", "{{√(3² + 4²) = 5}}. The L1 norm is {{|3| + |4| = 7}}."],
  ["vec", 2, "Cosine similarity versus Euclidean distance?", "Cosine compares direction only (ignores length), so it suits text embeddings of different lengths; Euclidean distance also reflects magnitude."],
  ["vec", 1, "Element-wise product versus dot product?", "Element-wise returns a vector of the same shape; the dot product sums those products into one number."],
  ["mat", 1, "When can two matrices be multiplied, and what is the result's shape?", "When the inner dimensions match: (m × n)·(n × p) gives (m × p). Otherwise the product is undefined."],
  ["mat", 1, "Write a dense layer in matrix form.", "{{Z = XW + b}}: X is (batch × features), W is (features × neurons), and b is added to every row."],
  ["mat", 2, "What does a determinant of zero mean?", "The matrix squashes space onto a lower dimension, losing information: its columns are linearly dependent, it has no inverse, and its rank is less than full."],
  ["mat", 3, "What is an eigenvector?", "A direction a matrix only stretches, never turns: {{A v = λ v}}. The eigenvalue λ is the stretch factor. PCA directions are eigenvectors of the covariance matrix."],
  ["stats", 1, "Mean versus median — when does it matter?", "Outliers drag the mean but barely move the median. For skewed data (prices, durations) report the median or both."],
  ["stats", 1, "What are variance and standard deviation?", "Variance is the average squared distance from the mean; the standard deviation is its square root, in the original units — the typical spread."],
  ["stats", 1, "What is a z-score and why standardise features?", "{{z = (x − mean) / σ}}: distance from the mean in standard deviations. Standardising puts all features on one scale so none dominates and gradient descent converges faster."],
  ["stats", 2, "Correlation versus causation?", "Correlation (−1 to +1) measures a linear association. It does not show that one variable causes the other; confounders can create strong correlations."],
  ["stats", 2, "Why does the sample variance divide by n − 1?", "The sample mean is estimated from the same data, which makes deviations slightly too small; dividing by n − 1 corrects that bias."],
  ["prob", 1, "What is the complement rule?", "{{P(not A) = 1 − P(A)}} because all outcomes together have probability 1."],
  ["prob", 2, "State Bayes' theorem and say why base rates matter.", "{{P(A | B) = P(B | A) P(A) / P(B)}}. A positive test for a rare condition is often a false alarm because most people tested do not have it (low prior)."],
  ["prob", 2, "What is expected value?", "The probability-weighted average of the outcomes, {{Σ x·P(x)}} — the long-run mean."],
  ["prob", 2, "What is entropy?", "A measure of uncertainty, {{−Σ p log₂ p}}. A fair coin has 1 bit; a certain outcome has 0."],
  ["prob", 2, "Why is cross-entropy used as the classification loss?", "For the correct class with probability p it is {{−ln p}}: small when confident and right, huge when confident and wrong. Minimising it makes predicted probabilities match the data."],
  ["prob", 3, "What does KL divergence measure?", "How far a distribution Q is from a distribution P, {{Σ p ln(p/q)}}. It is 0 only when they are equal, never negative, and not symmetric."],
  ["prob", 2, "What does the central limit theorem say?", "Averages of many independent samples are approximately normal around the true mean, with standard error {{σ/√n}} — quadrupling the data halves the uncertainty."],
  ["prob", 3, "What does a p-value tell you?", "How surprising the data would be if the null hypothesis were true. A small p is evidence against the null; it is not the probability that the null is true."],
  ["calc", 1, "What is a derivative?", "The slope of a curve at one point — the instantaneous rate of change. In ML it says which way to move a weight to change the loss."],
  ["calc", 1, "State the chain rule.", "For chained functions, multiply the slopes: {{dy/dx = (dy/du)(du/dx)}}. Backpropagation applies it through every layer."],
  ["calc", 1, "Differentiate {{3x² + 2x − 5}}.", "{{6x + 2}} using the power, constant and sum rules."],
  ["calc", 2, "What is a partial derivative and a gradient?", "A partial derivative changes one variable while freezing the others. The gradient collects them all into a vector pointing in the direction of steepest increase."],
  ["calc", 2, "How do you check a hand-derived gradient?", "Numerical gradient checking: compare it with {{(f(x + h) − f(x − h)) / 2h}} for a tiny h; they should agree to several decimals."],
  ["calc", 3, "What does the second derivative tell you?", "How the slope itself changes — the curvature. Positive curves up (a minimum where f′ = 0), negative curves down (a maximum)."],
  ["learn", 1, "Write the gradient-descent update and explain the minus sign.", "{{w_new = w − η · ∂L/∂w}}. The gradient points uphill, so subtracting it moves downhill, lowering the loss."],
  ["learn", 1, "What happens if the learning rate is too small or too large?", "Too small: training is slow. Too large: steps overshoot, the loss bounces or diverges. On a simple bowl, convergence needs 0 < η < 1 for (w − 3)²."],
  ["learn", 1, "MSE versus MAE?", "MSE squares errors, punishing large ones heavily and making a smooth bowl; MAE uses absolute values, is more robust to outliers, but has a kink at zero."],
  ["learn", 2, "What are SGD, a mini-batch and an epoch?", "SGD updates weights from a small random batch instead of the whole dataset. A mini-batch is that subset; an epoch is one full pass over the training data."],
  ["learn", 3, "What do momentum and Adam add?", "Momentum accumulates a velocity so steady directions speed up and oscillations cancel. Adam also scales each weight's step by the recent size of its gradients."],
  ["learn", 2, "What does L2 regularisation do?", "Adds {{λ·w²}} to the loss, shrinking weights toward zero and discouraging overfitting. L1 adds {{λ|w|}} and can drive weights to exactly zero."],
  ["learn", 2, "How can you tell a model is overfitting?", "Training loss keeps falling while validation loss rises. Fixes: more data, regularisation, early stopping, a simpler model."],
  ["act", 1, "Why do neural networks need non-linear activations?", "Without them, stacked linear layers collapse into one linear map and cannot learn curves or XOR. A non-linearity between layers lets depth add expressiveness."],
  ["act", 1, "What does softmax do?", "Turns raw scores into probabilities that are positive and sum to 1: {{eˢⁱ / Σ eˢʲ}}. The largest score gets the largest share."],
  ["act", 2, "What is the vanishing-gradient problem?", "Activations like sigmoid have slopes near 0 at the ends (max 0.25); multiplying many tiny slopes through a deep network makes early-layer gradients vanish. ReLU, normalisation and residual connections help."],
  ["act", 1, "What are ReLU, sigmoid and tanh?", "ReLU: {{max(0, z)}}. Sigmoid: squashes to (0, 1). Tanh: squashes to (−1, 1), centred on zero."],
  ["nn", 1, "What does a single neuron compute?", "A weighted sum of inputs plus a bias, {{z = w·x + b}}, followed by an activation: {{a = σ(z)}}."],
  ["nn", 2, "Walk through backpropagation for a neuron.", "Forward: z, a, loss. Backward: multiply local slopes along the path from the loss to the weight — {{∂E/∂a · ∂a/∂z · ∂z/∂w}} — then update the weight against the gradient."],
  ["nn", 2, "What are the four stages of a training step?", "Forward pass (predict), loss (measure error), backward pass (gradients), update (step against the gradient)."],
  ["nn", 3, "Why divide attention scores by √d?", "Dot products grow with dimension d, pushing softmax into saturated regions with tiny gradients. Dividing by √d keeps the scores' scale stable."],
  ["nn", 3, "Why is weight initialisation important?", "Weights that are too small make signals vanish through layers; too large makes them explode. A spread of about 1/√n (Xavier/He) keeps variance steady."],
  ["ml", 1, "Why split data into train, validation and test?", "Train fits the weights; validation tunes choices; test, used once at the end, gives an unbiased estimate. Evaluating on training data is overly optimistic."],
  ["ml", 2, "Define precision, recall and F1.", "Precision = TP/(TP + FP) (how many flagged were right); recall = TP/(TP + FN) (how many real cases were found); F1 is their harmonic mean."],
  ["ml", 2, "How does k-NN classify a point and what are its weaknesses?", "It finds the k closest training points and lets them vote. It is sensitive to feature scales and the curse of dimensionality, and slow on big datasets."],
  ["ml", 3, "What does PCA do?", "Finds orthogonal directions of greatest variance (eigenvectors of the covariance matrix) and projects the data onto the top few to reduce dimensions while keeping most variance."],
];

export const drills: DrillDef[] = [
  {
    t: "Slope between two points",
    q: "A taxi costs €7 after 2 km and €13 after 5 km. What is the slope?",
    code: py`
# points (2, 7) and (5, 13)
rise = 13 - 7
run = 5 - 2
print(rise / run)`,
    opts: [["2 € per km", true, "6 ÷ 3 = 2: every extra kilometre adds €2."], ["3.5 € per km", false, "7 ÷ 2 is y/x at one point — not a slope. The starting fee distorts it."], ["6 € per km", false, "6 is the total rise, not the rise per kilometre."]],
    path: ["Rise = 13 − 7 = 6.", "Run = 5 − 2 = 3.", "Slope = rise ÷ run = 2 € per km."],
    why: "Slope is the change in output divided by the change in input.",
    watch: "Never divide a single y by x — use the difference of two points.",
    remember: "Rise over run, with units.",
  },
  {
    t: "A dot product",
    q: "What is the dot product of x = [1, 2, 3] and w = [4, 5, 6]?",
    code: py`
x = [1, 2, 3]
w = [4, 5, 6]
print(sum(a * b for a, b in zip(x, w)))`,
    opts: [["32", true, "1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32."], ["[4, 10, 18]", false, "That is the element-wise product; the dot product adds those up."], ["21", false, "That adds all six numbers instead of multiplying matching pairs first."]],
    path: ["Pair them: (1, 4), (2, 5), (3, 6).", "Multiply each pair: 4, 10, 18.", "Add: 32."],
    why: "A dot product is a sum of products of matching entries.",
    watch: "Don't confuse it with the element-wise product.",
    remember: "Multiply pairs, then add.",
  },
  {
    t: "Matrix shapes",
    q: "What is the shape of the product of a (4 × 3) matrix and a (3 × 5) matrix?",
    code: py`
# A is 4 x 3, B is 3 x 5
rows_a, cols_a = 4, 3
rows_b, cols_b = 3, 5
print((rows_a, cols_b) if cols_a == rows_b else "undefined")`,
    opts: [["(4 × 5)", true, "Inner sizes (3 and 3) match and vanish; the outer sizes remain."], ["(3 × 3)", false, "Those are the inner dimensions — they must match, then disappear."], ["(5 × 4)", false, "The result takes rows from the first matrix and columns from the second."]],
    path: ["Inner dimensions: 3 and 3 — they match, so the product exists.", "Result rows = rows of A = 4.", "Result columns = columns of B = 5."],
    why: "(m × n)·(n × p) = (m × p).",
    watch: "Most shape errors come from mismatched inner dimensions.",
    remember: "Inner match, outer remain.",
  },
  {
    t: "A derivative at a point",
    q: "What is the slope of y = x² at x = 5?",
    code: py`
f = lambda x: x ** 2
h = 1e-6
print(round((f(5 + h) - f(5 - h)) / (2 * h), 3))`,
    opts: [["10", true, "The derivative of x² is 2x, and 2 × 5 = 10."], ["25", false, "25 is the value of the function, not its slope."], ["5", false, "That would be the slope of 5x, not of x²."]],
    path: ["Power rule: (x²)′ = 2x.", "At x = 5 the slope is 2 × 5 = 10.", "It is positive, so the curve is climbing there."],
    why: "The derivative of x² is 2x.",
    watch: "Value and slope are different things.",
    remember: "Power rule: bring the power down, subtract one.",
  },
  {
    t: "One gradient-descent step",
    q: "For L(w) = (w − 3)² at w = 5 with learning rate 0.1, what is the new w?",
    code: py`
w, lr = 5, 0.1
grad = 2 * (w - 3)
print(w - lr * grad)`,
    opts: [["4.6", true, "The gradient is 2(5 − 3) = 4, so w = 5 − 0.1 × 4 = 4.6 — a step toward 3."], ["5.4", false, "That adds the gradient; descent subtracts it."], ["0.4", false, "That is lr × gradient alone, forgetting to subtract from w."]],
    path: ["Gradient = 2(w − 3) = 4.", "Step = lr × gradient = 0.4.", "New w = 5 − 0.4 = 4.6."],
    why: "w_new = w − η · slope moves against the slope.",
    watch: "A sign error sends the weight uphill.",
    remember: "Subtract the gradient.",
  },
  {
    t: "Softmax of equal scores",
    q: "Three equal scores [1, 1, 1] go through softmax. What are the probabilities?",
    code: py`
import math
scores = [1, 1, 1]
exps = [math.exp(s) for s in scores]
print([round(e / sum(exps), 3) for e in exps])`,
    opts: [["33.3% each", true, "Equal inputs give equal shares of the total: 1/3 each."], ["100%, 0%, 0%", false, "A winner only appears when one score is larger."], ["e = 2.718 each", false, "Those are the exponentials before dividing by the total."]],
    path: ["e¹ = 2.718 for each score.", "Total = 3 × 2.718 = 8.155.", "Each share = 2.718 / 8.155 = 1/3."],
    why: "Softmax shares probability in proportion to eˢᶜᵒʳᵉ.",
    watch: "Adding the same number to every score changes nothing.",
    remember: "Equal scores, equal probabilities.",
  },
  {
    t: "The chain rule",
    q: "If dy/du = 5 and du/dx = 4, what is dy/dx?",
    code: py`
dy_du, du_dx = 5, 4
print(dy_du * du_dx)`,
    opts: [["20", true, "Multiply the slopes along the chain: 5 × 4."], ["9", false, "Adding slopes is wrong; chained rates multiply."], ["1.25", false, "Dividing 5 by 4 has no role in the chain rule."]],
    path: ["u changes 4 times as fast as x.", "y changes 5 times as fast as u.", "So y changes 5 × 4 = 20 times as fast as x."],
    why: "dy/dx = (dy/du)(du/dx).",
    watch: "Rates multiply, they do not add.",
    remember: "Chain rule = multiply the links.",
  },
  {
    t: "An outlier",
    q: "For marks [3, 4, 5, 6, 30], which statement is true?",
    code: py`
import statistics
marks = [3, 4, 5, 6, 30]
print(statistics.mean(marks), statistics.median(marks))`,
    opts: [["mean 9.6, median 5", true, "The outlier 30 pulls the mean up to 9.6 while the median stays at the middle value, 5."], ["mean 5, median 9.6", false, "The mean is the one dragged up by the outlier."], ["mean and median are both 9.6", false, "The median ignores how large the extreme value is."]],
    path: ["Sorted: 3, 4, 5, 6, 30.", "Mean = 48 / 5 = 9.6.", "Median = the middle value = 5."],
    why: "The median is robust to outliers; the mean is not.",
    watch: "Check for outliers before trusting an average.",
    remember: "Mean moves, median holds.",
  },
  {
    t: "Bayes and a rare condition",
    q: "A test has 90% sensitivity and a 5% false-positive rate; 1% of people have the condition. You test positive. Roughly how likely is it that you have it?",
    code: py`
prev, sens, fpr = 0.01, 0.9, 0.05
p_pos = sens * prev + fpr * (1 - prev)
print(round(sens * prev / p_pos, 3))`,
    opts: [["about 15%", true, "Of every 1,000 people, 9 true positives and about 50 false positives: 9 / 59 ≈ 15%."], ["90%", false, "That is the test's sensitivity, P(positive | has it) — not the reverse."], ["5%", false, "That is the false-positive rate, not the chance you are ill."]],
    path: ["Per 1,000 people: 10 have it → 9 test positive.", "990 do not → 49.5 false positives.", "P = 9 / (9 + 49.5) ≈ 0.154."],
    why: "Bayes' theorem weighs the evidence by how rare the condition is.",
    watch: "Never ignore the base rate.",
    remember: "P(A|B) is not P(B|A).",
  },
  {
    t: "Cross-entropy loss",
    q: "The correct class gets probability 0.9. What is the cross-entropy loss?",
    code: py`
import math
print(round(-math.log(0.9), 3))`,
    opts: [["0.105", true, "−ln(0.9) ≈ 0.105: small, because the model was confident and right."], ["0.9", false, "The loss is −ln(p), not p itself."], ["2.303", false, "That is −ln(0.1) — the loss if the model had given the right class only 10%."]],
    path: ["Loss = −ln(p).", "−ln(0.9) = 0.1054.", "A confident correct prediction costs very little."],
    why: "Cross-entropy punishes low probability on the truth.",
    watch: "Confident wrong answers are punished heavily: −ln(0.05) ≈ 3.",
    remember: "−ln p.",
  },
  {
    t: "A learning rate that is too large",
    q: "For L(w) = (w − 3)² starting at w = 0 with learning rate 1.1, what is w after one step?",
    code: py`
w, lr = 0.0, 1.1
w -= lr * 2 * (w - 3)
print(w)`,
    opts: [["6.6 — it overshoots past 3", true, "Gradient = 2(0 − 3) = −6; w = 0 − 1.1 × (−6) = 6.6, further from 3 on the other side."], ["0.66", false, "That is a tenth of the right answer — forgetting the gradient is −6."], ["3.0", false, "Landing exactly on the minimum would need η = 0.5."]],
    path: ["Gradient at 0 is −6.", "Step = 1.1 × (−6) = −6.6, so w = +6.6.", "Distance to the minimum went from 3 to 3.6 — it diverges."],
    why: "With η > 1 each step overshoots by more than it started with.",
    watch: "A loss that suddenly explodes often means η is too large.",
    remember: "Factor (1 − 2η): needs |factor| < 1.",
  },
  {
    t: "A z-score",
    q: "A mark of 9 with mean 5 and standard deviation 2. What is the z-score?",
    code: py`
print((9 - 5) / 2)`,
    opts: [["2.0", true, "9 is 4 above the mean, and 4 ÷ 2 = 2 standard deviations."], ["4.0", false, "4 is the raw difference; divide by σ to get the z-score."], ["0.5", false, "That divides σ by the difference — inverted."]],
    path: ["Difference from the mean: 9 − 5 = 4.", "Divide by σ: 4 / 2 = 2.", "The mark is 2 standard deviations above average."],
    why: "z = (x − mean) / σ.",
    watch: "Use the same mean and σ for train and test data.",
    remember: "How many σ from the mean.",
  },
  {
    t: "Standard deviation by hand",
    q: "What is the standard deviation of [2, 4, 4, 4, 5, 5, 7, 9] (population)?",
    code: py`
marks = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(marks) / len(marks)
print((sum((m - mean) ** 2 for m in marks) / len(marks)) ** 0.5)`,
    opts: [["2", true, "Mean 5; squared differences sum to 32; variance 32/8 = 4; σ = √4 = 2."], ["4", false, "4 is the variance — take the square root."], ["5", false, "5 is the mean."]],
    path: ["Mean = 40 / 8 = 5.", "Squared differences: 9, 1, 1, 1, 0, 0, 4, 16 → 32.", "Variance 4, σ = 2."],
    why: "σ is the square root of the average squared distance from the mean.",
    watch: "Sample σ divides by n − 1 instead of n.",
    remember: "Variance squared, σ rooted.",
  },
  {
    t: "The sigmoid at zero",
    q: "What is sigmoid(0)?",
    code: py`
import math
print(1 / (1 + math.exp(0)))`,
    opts: [["0.5", true, "e⁰ = 1, so 1 / (1 + 1) = 0.5 — exactly undecided."], ["0", false, "The sigmoid never reaches exactly 0 or 1."], ["1", false, "Large positive inputs approach 1; 0 sits in the middle."]],
    path: ["e⁰ = 1.", "1 / (1 + 1) = 0.5."],
    why: "σ(0) = 0.5 and the curve is symmetric around it.",
    watch: "Saturated sigmoids (|z| > 5) have tiny gradients.",
    remember: "σ(0) = 0.5.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Taxi fare model", "Find the slope and intercept from two points on the fare line, then predict a 6 km fare.", py`
(x1, y1), (x2, y2) = (2, 7), (5, 13)
w = (y2 - y1) / (x2 - x1)
b = y1 - w * x1
print(w, b, w * 6 + b)`],
  ["Dot product by hand", "Compute a weighted score from features and weights without any library.", py`
x = [5, 7, 9]
w = [4, 2, 0.5]
b = 10
score = 0
for xi, wi in zip(x, w):
    score += xi * wi
print(score + b)`],
  ["Matrix multiplication", "Write a function that multiplies two matrices and check the shapes.", py`
def matmul(A, B):
    if len(A[0]) != len(B):
        raise ValueError("inner dimensions must match")
    return [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]

print(matmul([[1, 2, 3], [4, 5, 6]], [[7, 8], [9, 10], [11, 12]]))`],
  ["Standardise a feature", "Convert values to z-scores and confirm the mean is 0 and the standard deviation is 1.", py`
data = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(data) / len(data)
std = (sum((x - mean) ** 2 for x in data) / len(data)) ** 0.5
z = [(x - mean) / std for x in data]
print(round(sum(z) / len(z), 6), round((sum(v * v for v in z) / len(z)) ** 0.5, 6))`],
  ["A numerical derivative", "Implement a derivative by nudging and test it on x³ at x = 2 (exact answer 12).", py`
def derivative(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print(round(derivative(lambda x: x ** 3, 2), 4))`],
  ["Gradient descent from scratch", "Minimise (w − 3)² starting at 0 with learning rate 0.1 and print the path.", py`
w, lr = 0.0, 0.1
for step in range(1, 9):
    w -= lr * 2 * (w - 3)
    print(step, round(w, 4), round((w - 3) ** 2, 4))`],
  ["Learning-rate experiment", "Try several learning rates on the same bowl and report which converge.", py`
def final_w(lr, steps=20):
    w = 0.0
    for _ in range(steps):
        w -= lr * 2 * (w - 3)
    return w

for lr in [0.01, 0.1, 0.5, 0.9, 1.0, 1.1]:
    w = final_w(lr)
    print(lr, round(w, 3), "converges" if abs(w - 3) < 0.1 else "does not converge")`],
  ["Softmax from scratch", "Implement a numerically stable softmax (subtract the maximum) and check the outputs sum to 1.", py`
import math

def softmax(scores):
    m = max(scores)
    exps = [math.exp(s - m) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

p = softmax([1000, 1001, 1002])      # would overflow without the max trick
print([round(v, 3) for v in p], round(sum(p), 3))`],
  ["Cross-entropy of predictions", "Average the cross-entropy loss over a few predictions with their true classes.", py`
import math
probs = [[0.7, 0.2, 0.1], [0.1, 0.8, 0.1], [0.3, 0.3, 0.4]]
labels = [0, 1, 2]
loss = -sum(math.log(p[y]) for p, y in zip(probs, labels)) / len(labels)
print(round(loss, 4))`],
  ["Linear regression by gradient descent", "Learn w and b for y = 2x + 1 from the points (1, 3), (2, 5), (3, 7).", py`
xs, ys = [1, 2, 3], [3, 5, 7]
w, b, lr = 0.0, 0.0, 0.05
for _ in range(2000):
    gw = sum(2 * ((w * x + b) - y) * x for x, y in zip(xs, ys)) / len(xs)
    gb = sum(2 * ((w * x + b) - y) for x, y in zip(xs, ys)) / len(xs)
    w, b = w - lr * gw, b - lr * gb
print(round(w, 2), round(b, 2))`],
  ["Cosine-similarity ranking", "Rank three documents (as word-count vectors) by similarity to a query.", py`
import math

def cosine(u, v):
    dot = sum(a * b for a, b in zip(u, v))
    return dot / (math.sqrt(sum(a * a for a in u)) * math.sqrt(sum(b * b for b in v)))

query = [1, 1, 0]
docs = {"doc A": [2, 2, 0], "doc B": [0, 1, 3], "doc C": [1, 0, 0]}
for name, vec in sorted(docs.items(), key=lambda kv: -cosine(query, kv[1])):
    print(name, round(cosine(query, vec), 3))`],
  ["A Bayes calculator", "Write a function that returns P(condition | positive test) and try a few prevalences.", py`
def posterior(prev, sens, fpr):
    p_pos = sens * prev + fpr * (1 - prev)
    return sens * prev / p_pos

for prev in [0.001, 0.01, 0.1, 0.5]:
    print(prev, round(posterior(prev, 0.9, 0.05), 3))`],
  ["Precision and recall from labels", "Count TP, FP and FN from two label lists and compute precision, recall and F1.", py`
actual = [1, 1, 1, 0, 0, 1, 0, 0]
pred = [1, 0, 1, 1, 0, 1, 0, 0]
tp = sum(a == 1 and p == 1 for a, p in zip(actual, pred))
fp = sum(a == 0 and p == 1 for a, p in zip(actual, pred))
fn = sum(a == 1 and p == 0 for a, p in zip(actual, pred))
precision, recall = tp / (tp + fp), tp / (tp + fn)
print(tp, fp, fn, round(precision, 3), round(recall, 3), round(2 * precision * recall / (precision + recall), 3))`],
  ["Check a gradient numerically", "Verify the sigmoid derivative σ(1 − σ) against a numerical estimate.", py`
import math
sigmoid = lambda z: 1 / (1 + math.exp(-z))
z, h = 0.7, 1e-6
analytic = sigmoid(z) * (1 - sigmoid(z))
numeric = (sigmoid(z + h) - sigmoid(z - h)) / (2 * h)
print(round(analytic, 6), round(numeric, 6), abs(analytic - numeric) < 1e-8)`],
];

export const glance: [string, string][] = [
  ["Slope", "m = rise ÷ run = Δy ÷ Δx, with units. In y = wx + b, w is the slope and b the intercept."],
  ["Dot product", "Multiply matching entries, then add: x · w = Σ xᵢwᵢ. One number — a weighted score."],
  ["Matrix shapes", "(m × n)(n × p) = (m × p). Dense layer: Z = XW + b."],
  ["Norms and distance", "L2 = √Σx², L1 = Σ|x|. Cosine similarity compares direction only."],
  ["Mean, variance, z-score", "mean = Σx/n; σ² = Σ(x − mean)²/n; z = (x − mean)/σ."],
  ["Bayes", "P(A|B) = P(B|A)P(A)/P(B). Respect the base rate."],
  ["Entropy and cross-entropy", "H = −Σ p log p. Loss for the right class = −ln p."],
  ["Derivative rules", "(xⁿ)′ = nxⁿ⁻¹, (eˣ)′ = eˣ, (ln x)′ = 1/x, σ′ = σ(1 − σ)."],
  ["Chain rule", "dy/dx = (dy/du)(du/dx): multiply the slopes along the chain."],
  ["Gradient descent", "w ← w − η · ∂L/∂w. Needs 0 < η < 1 on the simple bowl (w − 3)²."],
  ["Softmax and sigmoid", "softmax = eˢⁱ/Σeˢʲ (sums to 1); σ(z) = 1/(1 + e⁻ᶻ) ∈ (0, 1)."],
  ["Training step", "Forward → loss → backward → update. Repeat over batches and epochs."],
];

export const lists: [string, string[]][] = [
  ["Habits that make maths click", ["Say what a formula means in one sentence before using it", "Always attach units to a slope or a rate", "Compute a tiny example by hand, then check it in Python", "Sketch the graph before you calculate", "Check shapes at every step of a matrix expression"]],
  ["Common mistakes", ["Dividing y by x instead of using differences", "Adding gradients instead of multiplying along a chain", "Forgetting the minus sign in gradient descent", "Ignoring the base rate in Bayes problems", "Mixing up the element-wise and dot products", "Judging a model on its training data"]],
  ["Explaining your answer in an interview", ["State the idea in plain words first", "Give a one-line formula", "Work a small numeric example", "Say where it appears in a model", "Mention an assumption or a failure mode"]],
];

export const materials: [string, [string, string][]][] = [
  ["Free courses and visual explanations", [["3Blue1Brown — Essence of Linear Algebra and Calculus", "https://www.3blue1brown.com/topics/linear-algebra"], ["Khan Academy — Linear algebra", "https://www.khanacademy.org/math/linear-algebra"], ["Khan Academy — Statistics and probability", "https://www.khanacademy.org/math/statistics-probability"], ["Immersive Linear Algebra", "https://immersivemath.com/ila/index.html"]]],
  ["Books", [["Mathematics for Machine Learning — Deisenroth, Faisal, Ong (free PDF)", "https://mml-book.github.io/"], ["Deep Learning — Goodfellow, Bengio, Courville (maths chapters)", "https://www.deeplearningbook.org/"]]],
  ["Practise in code", [["NumPy documentation", "https://numpy.org/doc/stable/"], ["Python statistics module", "https://docs.python.org/3/library/statistics.html"]]],
];
