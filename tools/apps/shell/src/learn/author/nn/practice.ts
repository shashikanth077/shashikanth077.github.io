import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* start */
  ["start", 1, "What does one artificial neuron compute?", "A weighted sum plus a bias, passed through an activation: a = f(w·x + b)."],
  ["start", 1, "How many parameters does a 3 → 4 → 2 dense network have?", "Layer 1: 3×4 + 4 = 16; layer 2: 4×2 + 2 = 10; total 26."],
  ["start", 1, "Name the four steps of the learning loop.", "Forward pass → loss → backpropagation (gradients) → parameter update; repeat."],
  ["start", 2, "Why do hidden layers need non-linear activations?", "Without them stacked layers collapse into one linear map and cannot model curved relationships such as XOR."],
  /* activations */
  ["act", 1, "Range and typical use of sigmoid, tanh, ReLU and softmax.", "Sigmoid 0–1 (binary probability); tanh −1 to 1 (centred hidden values); ReLU max(0, z) (default hidden layer); softmax turns scores into probabilities summing to 1."],
  ["act", 2, "How are tanh and sigmoid related?", "tanh(z) = 2σ(2z) − 1: the same S-shape stretched to −1…1."],
  ["act", 1, "What is the dying-ReLU problem and one remedy?", "A neuron whose input is always negative outputs 0 with gradient 0 and never recovers; leaky ReLU keeps a small slope for negative inputs."],
  ["act", 2, "Why subtract the maximum logit in softmax?", "It prevents overflow of exp() and leaves the probabilities unchanged."],
  ["act", 1, "Which output activation and loss for (a) binary, (b) multi-class, (c) regression?", "(a) sigmoid + binary cross-entropy; (b) softmax + categorical cross-entropy; (c) linear + MSE."],
  ["act", 2, "Why does a saturated sigmoid learn slowly?", "Its slope σ(1−σ) is near 0 for large |z|, so the gradient and the update are tiny."],
  /* loss */
  ["loss", 1, "Two models predict p = 0.51 and 0.99 for a true 1. Same accuracy, different loss — why?", "Both are correct at threshold 0.5, but cross-entropy −ln p is 0.673 versus 0.010: B put much more probability on the right answer."],
  ["loss", 2, "Compute the binary cross-entropy for y = 1, p = 0.8.", "−ln 0.8 = 0.2231; for y = 0 and p = 0.8 it is −ln 0.2 = 1.609."],
  ["loss", 2, "Sparse versus one-hot categorical cross-entropy?", "They compute the same loss; sparse takes integer labels, categorical takes one-hot vectors."],
  ["loss", 1, "Why square the error in MSE?", "Under- and over-predictions both cost, big mistakes cost disproportionately more, and the loss is smooth to differentiate."],
  /* learn */
  ["learn", 1, "w = 1, b = 2, x = 3, y = 11. Do one gradient step with η = 0.05.", "ŷ = 5, error −6; dL/dw = −18, dL/db = −6; w = 1.9, b = 2.3; new loss 4.5."],
  ["learn", 1, "What does a positive gradient tell you?", "Increasing the parameter increases the loss, so move it down (w ← w − η·g)."],
  ["learn", 2, "State the chain rule for dL/dw in a one-neuron regression.", "dL/dw = (dL/dŷ)(dŷ/dw) = (ŷ − y)·x."],
  ["learn", 1, "Epoch, batch and iteration: 100 records, batch 20, 4 epochs?", "5 iterations per epoch × 4 epochs = 20 updates."],
  ["learn", 2, "For L = ½(3w − 9)² which learning rates converge?", "Each step multiplies the distance to w = 3 by (1 − 9η), so 0 < η < 2/9 converges; η > 2/9 diverges."],
  ["learn", 2, "In backprop through a ReLU neuron with negative z, what flows back?", "Zero: ReLU′(z) = 0, so the weights feeding that neuron get no gradient from that example."],
  ["learn", 2, "Why can a single neuron not learn XOR?", "XOR is not linearly separable; a hidden layer of two non-linear neurons builds features that make it separable."],
  /* optimisers */
  ["opt", 1, "Write the SGD update and say what 'stochastic' means.", "w ← w − η·g. Strictly one random example per step; in practice a mini-batch gradient."],
  ["opt", 2, "How does momentum change SGD?", "v ← βv + g, w ← w − ηv: consistent gradients build speed (up to 1/(1−β)), alternating ones cancel."],
  ["opt", 2, "RMSprop with g = 4, v = 4, β = 0.9: new v and scaled gradient?", "v = 0.9·4 + 0.1·16 = 5.2; scaled gradient 4/√5.2 = 1.754."],
  ["opt", 2, "Adam's first update for g = 4, η = 0.1?", "m = 0.4, v = 0.016, m̂ = 4, v̂ = 16, update = 0.1·4/√16 = 0.1."],
  ["opt", 1, "Is Adam always better than SGD?", "No. It is a convenient default, but SGD with momentum sometimes generalises better; compare on validation metrics."],
  /* fit */
  ["fit", 1, "Training loss 0.05, validation loss 0.62 and rising: diagnosis and remedies?", "Overfitting: early stopping, more data, regularization (L2, dropout) or a smaller model."],
  ["fit", 1, "Write the L1 and L2 penalties.", "L1: λΣ|wᵢ| (can zero weights); L2: λΣwᵢ² (shrinks weights). Elastic Net blends both."],
  ["fit", 2, "What factor does L2 weight decay apply per step with η = 0.1, λ = 0.5?", "1 − 2ηλ = 0.9 (when the data gradient is zero)."],
  ["fit", 1, "How does early stopping work?", "Monitor validation loss, stop after `patience` epochs without improvement and restore the best weights."],
  ["fit", 2, "Why scale surviving activations by 1/(1−p) in dropout?", "It keeps the expected activation the same between training and inference (inverted dropout); at inference dropout is off."],
  ["fit", 2, "Normalise the activations 2, 4, 6, 8 with BatchNorm (γ=1, β=0).", "μ = 5, σ² = 5, x̂ = −1.342, −0.447, 0.447, 1.342."],
  ["fit", 1, "When must a time-ordered split be used?", "For forecasting: train on the past and validate on the future, never shuffle."],
  ["fit", 2, "Give two examples of data leakage.", "Fitting a scaler or vocabulary on all data; the same user's records in both train and test."],
  /* data */
  ["data", 1, "Convert 'this movie was amazing' with this=5, movie=6, was=7, amazing=8.", "[5, 6, 7, 8]; unknown words map to the OOV id, padding is 0."],
  ["data", 1, "One-hot versus multi-hot?", "One-hot encodes a single token; multi-hot marks every word present in a whole review (order and counts lost)."],
  ["data", 2, "How many trainable values has Embedding(10000, 8)?", "10,000 × 8 = 80,000."],
  ["data", 2, "Parameters of Dense(16)-Dense(16)-Dense(1) on a 10,000-long multi-hot input?", "160,016 + 272 + 17 = 160,305."],
  /* metrics */
  ["metrics", 1, "Define TP, FP, FN, TN.", "TP: positive caught; FP: negative flagged; FN: positive missed; TN: negative kept."],
  ["metrics", 1, "TP=16, FP=8, FN=4, TN=72: accuracy, precision, recall, specificity.", "Accuracy 0.88; precision 16/24 = 0.667; recall 16/20 = 0.80; specificity 72/80 = 0.90."],
  ["metrics", 1, "A model predicts 'negative' for all 9,999 cases, 9 positive. Accuracy and recall?", "Accuracy 99.91%, recall 0%: accuracy hides failure on a rare class."],
  ["metrics", 2, "Why a harmonic mean in F1?", "It stays near the smaller of precision and recall, so one high score cannot hide a poor one."],
  ["metrics", 2, "What happens to precision and recall as the threshold rises?", "Recall cannot rise (it usually falls); precision often improves but not guaranteed."],
  ["metrics", 2, "Compute AUC: positives 0.9, 0.7; negatives 0.8, 0.1.", "Pairs: 0.9 beats both, 0.7 beats one → 3/4 = 0.75."],
  ["metrics", 2, "Macro versus weighted versus micro F1?", "Macro averages classes equally; weighted by support; micro pools all decisions (equals accuracy for single-label)."],
  /* mnist */
  ["mnist", 1, "Count the parameters of 784 → 100 → 10.", "78,500 + 1,010 = 79,510."],
  ["mnist", 1, "Why divide pixels by 255?", "To put inputs in 0–1, which keeps gradients and activations well-scaled."],
  ["mnist", 1, "Updates per epoch for 48,000 images at batch 32, and in six epochs?", "1,500 per epoch, 9,000 in six."],
  ["mnist", 2, "What must a new scanned digit go through before predict?", "Grayscale, 28×28 resize, match polarity, ÷255, add batch and channel axes → (1, 28, 28, 1)."],
  /* cnn */
  ["cnn", 1, "Output size for n = 6, k = 3, stride 1 with no padding?", "(6 − 3)/1 + 1 = 4."],
  ["cnn", 2, "Parameters of Conv2D(64, 3×3) on 32 input channels?", "3·3·32·64 + 64 = 18,496."],
  ["cnn", 1, "Does pooling have parameters?", "No — it shrinks height and width with a fixed rule (max or mean)."],
  ["cnn", 2, "Why does 'same' padding not always preserve size?", "Only at stride 1; at stride 2 the output is ceil(n/2)."],
  ["cnn", 2, "What does a ResNet block output and why does it help?", "F(x) + x; the identity shortcut lets information and gradients flow through deep stacks."],
  ["cnn", 2, "What is transfer learning with VGG16?", "Load pretrained ImageNet weights, freeze the base, train a small new head on your data."],
  /* rnn */
  ["rnn", 1, "Write the simple RNN update.", "hₜ = tanh(wₓxₜ + wₕhₜ₋₁ + b), with the same weights at every step."],
  ["rnn", 2, "Why do simple RNNs forget early inputs?", "Gradients are multiplied by a factor per step; below 1 they vanish (0.65¹⁰ ≈ 0.0135)."],
  ["rnn", 2, "LSTM: f=0.9, i=0.5, g=0.6, c_prev=2 → c?", "c = 0.9·2 + 0.5·0.6 = 2.1."],
  ["rnn", 2, "How does a GRU differ from an LSTM?", "Reset and update gates and a single state; the LSTM has three gates and a separate cell state."],
  ["rnn", 1, "Input shape of a recurrent layer?", "(batch_size, time_steps, features)."],
  /* text */
  ["text", 2, "What problem does attention solve in seq2seq?", "It lets the decoder look at all encoder states instead of one fixed-size vector."],
  ["text", 2, "Compute attention weights for scores [2.828, 0.707].", "softmax → [0.893, 0.107]."],
  ["text", 1, "Why are positional encodings needed?", "Attention has no notion of order; positions are added to the embeddings."],
  ["text", 2, "What does BLEU measure and what is the brevity penalty?", "n-gram overlap with references; the penalty exp(1 − r/c) punishes candidates shorter than the reference."],
  /* gen */
  ["gen", 1, "What is the target of an autoencoder?", "The input itself; the loss is the reconstruction error."],
  ["gen", 2, "Reparameterisation: μ = 0.5, log σ² = −0.4, ε = 1 → z?", "σ = e^(−0.2) = 0.819; z = 1.319."],
  ["gen", 2, "What does the KL term do in a VAE?", "It pulls the encoder distributions towards N(0, I) so the latent space is smooth and can be sampled."],
  ["gen", 2, "Describe the two GAN losses.", "D minimises −[log D(x) + log(1 − D(G(z)))]; G minimises −log D(G(z)). At equilibrium D(G(z)) ≈ 0.5."],
  ["gen", 1, "Generative versus discriminative?", "Discriminative learns P(y|x) boundaries; generative models the data distribution and can create samples."],
];

export const drills: DrillDef[] = [
  {
    t: "Sigmoid and ReLU at zero and below",
    q: "What does this print?",
    code: py`
import numpy as np
print(1 / (1 + np.exp(0)), max(0, -3))`,
    opts: [["0.5 0", true, "σ(0) = 1/2 and ReLU of a negative number is 0."], ["1.0 -3", false, "Sigmoid never reaches 1 at zero, and ReLU clips negatives."], ["0.0 0", false, "σ(0) is exactly one half."]],
    path: ["exp(0) = 1 → 1/(1 + 1) = 0.5.", "max(0, −3) = 0."],
    why: "Sigmoid is centred at 0.5; ReLU removes negatives.",
    watch: "Do not confuse sigmoid(0) = 0.5 with tanh(0) = 0.",
    remember: "σ(0) = 0.5, ReLU(neg) = 0.",
  },
  {
    t: "A uniform softmax",
    q: "What does this print?",
    code: py`
import numpy as np
z = np.array([1.0, 1.0, 1.0])
p = np.exp(z) / np.exp(z).sum()
print(np.round(p, 3).tolist())`,
    opts: [["[0.333, 0.333, 0.333]", true, "Equal logits give equal probabilities summing to 1."], ["[1.0, 1.0, 1.0]", false, "Probabilities must sum to 1."], ["[0.0, 0.0, 1.0]", false, "Softmax only favours one class if its logit is larger."]],
    path: ["exp(1) is the same for all three.", "Each divided by 3·exp(1) = 1/3."],
    why: "Softmax depends only on differences between logits.",
    watch: "Adding a constant to all logits changes nothing.",
    remember: "Equal logits → equal probabilities.",
  },
  {
    t: "Counting parameters",
    q: "What does this print?",
    code: py`
dense = lambda a, b: a * b + b
print(dense(784, 100) + dense(100, 10))`,
    opts: [["79510", true, "78,500 + 1,010."], ["78400", false, "That is only the first layer's weights."], ["79500", false, "Each layer also has bias terms."]],
    path: ["784·100 + 100 = 78,500.", "100·10 + 10 = 1,010.", "Sum = 79,510."],
    why: "Parameters = inputs × units + units.",
    watch: "Do not forget the biases.",
    remember: "Dense: in × out + out.",
  },
  {
    t: "Iterations in a training run",
    q: "What does this print?",
    code: py`
import math
print(math.ceil(1000 / 32), math.ceil(1000 / 32) * 10)`,
    opts: [["32 320", true, "ceil(31.25) = 32 updates per epoch, 320 for ten epochs."], ["31 310", false, "The last smaller batch still counts as an update."], ["32 32", false, "Ten epochs repeat the 32 updates ten times."]],
    path: ["1000 / 32 = 31.25 → ceil → 32.", "× 10 epochs = 320."],
    why: "The final partial batch is still used.",
    watch: "Batch size is not the number of epochs.",
    remember: "Steps per epoch = ceil(N / batch).",
  },
  {
    t: "Inverted dropout scale",
    q: "What does this print?",
    code: py`
p = 0.25
print(round(1 / (1 - p), 3))`,
    opts: [["1.333", true, "Survivors are multiplied by 1/0.75."], ["0.75", false, "That is the keep probability, not the scale."], ["4.0", false, "That would be 1/p."]],
    path: ["keep probability q = 0.75.", "scale = 1/q = 1.333."],
    why: "The scale restores the expected activation.",
    watch: "Dropout is switched off at inference.",
    remember: "Scale = 1/(1 − p).",
  },
  {
    t: "One gradient step",
    q: "What does this print?",
    code: py`
w, b, x, y, lr = 1.0, 2.0, 3.0, 11.0, 0.05
e = w * x + b - y
print(round(w - lr * e * x, 2), round(b - lr * e, 2))`,
    opts: [["1.9 2.3", true, "e = −6, dw = −18, db = −6."], ["0.1 1.7", false, "The signs are reversed: the weights must go up."], ["1.9 2.0", false, "The bias moves too."]],
    path: ["pred = 5, e = −6.", "w = 1 − 0.05·(−6·3) = 1.9.", "b = 2 − 0.05·(−6) = 2.3."],
    why: "Both parameters step against their gradients.",
    watch: "A negative gradient increases the parameter.",
    remember: "w ← w − η(ŷ − y)x.",
  },
  {
    t: "Convolution output size",
    q: "What does this print?",
    code: py`
n, k, p, s = 6, 3, 1, 2
print((n + 2 * p - k) // s + 1)`,
    opts: [["3", true, "(6 + 2 − 3)//2 + 1 = 3."], ["6", false, "'Same' keeps the size only at stride 1."], ["4", false, "That is the no-padding, stride-1 result."]],
    path: ["6 + 2·1 − 3 = 5.", "5 // 2 = 2.", "2 + 1 = 3."],
    why: "Stride 2 halves the grid.",
    watch: "Integer division matters.",
    remember: "out = ⌊(n + 2p − k)/s⌋ + 1.",
  },
  {
    t: "F1 from counts",
    q: "What does this print?",
    code: py`
tp, fp, fn = 16, 8, 4
print(round(2 * tp / (2 * tp + fp + fn), 4))`,
    opts: [["0.7273", true, "32 / 44."], ["0.8", false, "That is the recall."], ["0.6667", false, "That is the precision."]],
    path: ["2TP = 32.", "2TP + FP + FN = 44.", "32/44 = 0.7273."],
    why: "F1 balances precision and recall.",
    watch: "TN never appears in F1.",
    remember: "F1 = 2TP/(2TP + FP + FN).",
  },
  {
    t: "Max pooling a block",
    q: "What does this print?",
    code: py`
import numpy as np
block = np.array([[1, 2], [-1, 0]])
print(block.max(), block.mean())`,
    opts: [["2 0.5", true, "Max keeps 2; the mean is 2/4 = 0.5."], ["2 2.0", false, "The mean is not the max."], ["0 0.5", false, "Max pooling keeps the largest value."]],
    path: ["Values: 1, 2, −1, 0.", "Max = 2.", "Mean = (1 + 2 − 1 + 0)/4 = 0.5."],
    why: "Max pooling keeps strong detections.",
    watch: "Pooling has no learned weights.",
    remember: "Max = strongest evidence.",
  },
  {
    t: "Binary cross-entropy",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(float(-np.log(0.8)), 4), round(float(-np.log(0.2)), 4))`,
    opts: [["0.2231 1.6094", true, "Confident and right is cheap; confident and wrong is costly."], ["0.8 0.2", false, "The loss is −ln p, not p."], ["1.6094 0.2231", false, "These are swapped."]],
    path: ["−ln 0.8 = 0.2231.", "−ln 0.2 = 1.6094."],
    why: "Cross-entropy punishes confident mistakes.",
    watch: "p must be the probability of the TRUE class.",
    remember: "L = −ln p(true class).",
  },
  {
    t: "Batch-norm statistics",
    q: "What does this print?",
    code: py`
import numpy as np
x = np.array([2.0, 4.0, 6.0, 8.0])
print(x.mean(), x.var())`,
    opts: [["5.0 5.0", true, "Mean 5; squared deviations 9, 1, 1, 9 → variance 5."], ["5.0 2.236", false, "That is the standard deviation."], ["4.0 5.0", false, "The mean is 5."]],
    path: ["Mean = 20/4 = 5.", "Deviations² = 9, 1, 1, 9 → mean 5."],
    why: "BatchNorm divides by √(variance + ε).",
    watch: "np.var is the population variance by default.",
    remember: "x̂ = (x − μ)/√(σ² + ε).",
  },
  {
    t: "Adam's first update",
    q: "What does this print?",
    code: py`
g, eta = 4.0, 0.1
m, v = 0.1 * g, 0.001 * g * g
m_hat, v_hat = m / (1 - 0.9), v / (1 - 0.999)
print(round(eta * m_hat / (v_hat ** 0.5), 3))`,
    opts: [["0.1", true, "m̂ = 4, v̂ = 16 → 0.1·4/4."], ["0.4", false, "That is the raw m, before bias correction."], ["0.016", false, "That is v before correction."]],
    path: ["m = 0.4, v = 0.016.", "m̂ = 4, v̂ = 16.", "0.1·4/√16 = 0.1."],
    why: "Bias correction undoes the zero start.",
    watch: "The first update is about η in size.",
    remember: "Adam step ≈ η·m̂/√v̂.",
  },
  {
    t: "LSTM cell update",
    q: "What does this print?",
    code: py`
f, i, g, c = 0.9, 0.5, 0.6, 2.0
print(round(f * c + i * g, 3))`,
    opts: [["2.1", true, "Keep 1.8 of the old memory and write 0.3."], ["3.0", false, "The forget gate shrinks the old memory."], ["0.3", false, "That is only the new write."]],
    path: ["f·c = 1.8.", "i·g = 0.3.", "Sum = 2.1."],
    why: "The cell state mixes kept and new information.",
    watch: "Gates are sigmoid outputs between 0 and 1.",
    remember: "cₜ = f·cₜ₋₁ + i·g.",
  },
  {
    t: "Vanishing gradient",
    q: "What does this print?",
    code: py`
print(round(0.65 ** 10, 4))`,
    opts: [["0.0135", true, "Ten multiplications by 0.65."], ["6.5", false, "That is 0.65 × 10."], ["0.65", false, "The factor compounds."]],
    path: ["0.65² = 0.4225.", "…after ten steps ≈ 0.0135."],
    why: "Repeated small factors shrink gradients.",
    watch: "Factors above 1 explode instead.",
    remember: "Gradient ≈ factorⁿ.",
  },
  {
    t: "Reparameterisation trick",
    q: "What does this print?",
    code: py`
import numpy as np
mu, logvar, eps = 0.5, -0.4, 1.0
print(round(float(mu + np.exp(0.5 * logvar) * eps), 3))`,
    opts: [["1.319", true, "σ = e^(−0.2) = 0.819; z = 0.5 + 0.819."], ["0.5", false, "The noise term must be added."], ["1.5", false, "σ is not 1 here."]],
    path: ["σ = exp(0.5·(−0.4)) = 0.8187.", "z = 0.5 + 0.8187·1 = 1.319."],
    why: "Randomness sits in ε, so gradients can flow through μ and σ.",
    watch: "The encoder outputs log-variance, not σ.",
    remember: "z = μ + σ·ε.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Gradient descent on one neuron", "Fit y = wx + b to the delivery data with batch gradient descent and predict 5 km.", py`
import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([5.0, 8.0, 11.0, 14.0])
w, b = 1.0, 2.0
for _ in range(2000):
    err = w * x + b - y
    w -= 0.02 * (err * x).mean()
    b -= 0.02 * err.mean()
print(round(w, 2), round(b, 2), round(w * 5 + b, 2))`],
  ["Gradient check", "Verify an analytic gradient numerically.", py`
loss = lambda w: 0.5 * (3 * w + 2 - 11) ** 2
w, h = 1.0, 1e-5
print((3 * w - 9) * 3, round((loss(w + h) - loss(w - h)) / (2 * h), 3))`],
  ["Activations side by side", "Evaluate sigmoid, tanh and ReLU on a few inputs.", py`
import numpy as np

z = np.array([-2.0, 0.0, 2.0])
print((1 / (1 + np.exp(-z))).round(3).tolist(), np.tanh(z).round(3).tolist(), np.maximum(0, z).tolist())`],
  ["Stable softmax", "Compute softmax of large logits without overflow.", py`
import numpy as np

z = np.array([1000.0, 1001.0, 1002.0])
p = np.exp(z - z.max())
p /= p.sum()
print(p.round(4).tolist())`],
  ["Confusion-matrix metrics", "Compute accuracy, precision, recall, F1 from labels.", py`
import numpy as np

y = np.array([1, 0, 1, 0, 1, 0, 1, 0])
p = np.array([1, 0, 0, 1, 1, 0, 1, 0])
tp = ((y == 1) & (p == 1)).sum()
fp = ((y == 0) & (p == 1)).sum()
fn = ((y == 1) & (p == 0)).sum()
print((y == p).mean(), tp / (tp + fp), tp / (tp + fn), 2 * tp / (2 * tp + fp + fn))`],
  ["2-D convolution", "Slide a vertical-edge kernel over a 5×5 image that is dark on the left and bright on the right.", py`
import numpy as np

img = np.zeros((5, 5))
img[:, 2:] = 1
k = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
out = np.array([[(img[r:r + 3, c:c + 3] * k).sum() for c in range(3)] for r in range(3)])
print(out.tolist())`],
  ["Dropout mask", "Apply inverted dropout and check the mean.", py`
import numpy as np

rng = np.random.default_rng(1)
a = np.ones(10000)
mask = rng.random(a.size) < 0.8
print(round(float((a * mask / 0.8).mean()), 2))`],
  ["Scaled dot-product attention", "Attention over three keys.", py`
import numpy as np

Q = np.array([[1.0, 0.0]])
K = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
V = np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
s = Q @ K.T / np.sqrt(2)
p = np.exp(s - s.max())
p /= p.sum()
print(p.round(3).tolist(), (p @ V).round(3).tolist())`],
  ["Early stopping", "Find the best epoch and where training would stop.", py`
val = [0.9, 0.7, 0.6, 0.55, 0.56, 0.58, 0.6, 0.65]
best, wait, stop, best_e = 9.9, 0, None, 0
for e, v in enumerate(val, 1):
    if v < best:
        best, wait, best_e = v, 0, e
    else:
        wait += 1
        if wait == 3:
            stop = e
            break
print(best_e, stop)`],
];

export const glance: [string, string][] = [
  ["Neuron", "z = w·x + b · a = f(z) · parameters of a dense layer = in × out + out"],
  ["Activations", "σ = 1/(1+e⁻ᶻ) · tanh = 2σ(2z) − 1 · ReLU = max(0, z) · softmax = e^zᵢ/Σe^zⱼ"],
  ["Losses", "MSE = mean (ŷ − y)² · BCE = −[y ln p + (1−y) ln(1−p)] · CCE = −ln p(true class)"],
  ["Gradient descent", "w ← w − η·∂L/∂w · chain rule ∂L/∂w = (∂L/∂ŷ)(∂ŷ/∂w) · steps per epoch = ceil(N/batch)"],
  ["Optimisers", "momentum v ← βv + g · RMSprop v ← βv + (1−β)g², step g/(√v+ε) · Adam m̂/(√v̂+ε)"],
  ["Regularization", "L1 λΣ|w| · L2 λΣw² · dropout scale 1/(1−p) · BN x̂ = (x−μ)/√(σ²+ε), y = γx̂+β"],
  ["Metrics", "precision TP/(TP+FP) · recall TP/(TP+FN) · F1 = 2TP/(2TP+FP+FN) · AUC = ordered pairs/all pairs"],
  ["CNN", "out = ⌊(n+2p−k)/s⌋+1 · conv params = k²·Cin·F + F · pooling has no weights"],
  ["RNN / LSTM / GRU", "h = tanh(wx·x + wh·h + b) · c = f·c + i·g · GRU h = (1−z)h + z·h̃"],
  ["Attention", "softmax(QKᵀ/√d)·V · PE(pos,2i) = sin(pos/10000^(2i/d))"],
  ["VAE / GAN", "z = μ + σε · KL = −½Σ(1+logσ²−μ²−σ²) · D loss −[log D(x)+log(1−D(G(z)))] · G loss −log D(G(z))"],
];

export const lists: [string, string[]][] = [
  ["Habits that make training work", ["Scale inputs and keep the same preprocessing at prediction time", "Start with a small model and one epoch to check the pipeline", "Plot training and validation loss every run", "Tune on validation data, report once on test data", "Change one thing at a time and record it", "Fix random seeds when comparing models"]],
  ["Debugging a network that will not learn", ["Check shapes at every layer", "Overfit a tiny batch first: the loss should go to zero", "Lower the learning rate if the loss explodes or oscillates", "Check labels and loss pair (sparse vs one-hot, sigmoid vs softmax)", "Look for dead ReLUs, saturated sigmoids and NaNs", "Verify gradients numerically on a small example"]],
  ["Explaining your answer in an exam", ["Write the formula, substitute the numbers, calculate, interpret", "State the positive class and the axes of a confusion matrix", "Say which averaging convention (macro, weighted, micro) you use", "Separate parameters (learned) from hyper-parameters (chosen)", "Mention what data each number was measured on"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["Keras: guide to layers", "https://keras.io/api/layers/"], ["Keras: callbacks (EarlyStopping)", "https://keras.io/api/callbacks/early_stopping/"], ["PyTorch tutorials", "https://pytorch.org/tutorials/"], ["NumPy user guide", "https://numpy.org/doc/stable/user/index.html"]]],
  ["Free books and courses", [["Dive into Deep Learning", "https://d2l.ai/"], ["Neural Networks and Deep Learning — Michael Nielsen", "http://neuralnetworksanddeeplearning.com/"], ["Deep Learning — Goodfellow, Bengio, Courville", "https://www.deeplearningbook.org/"]]],
];
