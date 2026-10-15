import { area, bars, compare, curve, hline, par, plot, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* ------------------------------------------------------------------ */
export const stats: ConceptDef[] = [
  {
    t: "Mean, median and outliers",
    lv: 1,
    s: `The mean adds everything and divides by the count; the median is the middle value once sorted. One extreme value (an outlier) drags the mean a long way but barely moves the median — so the median is "robust". Always look at both before trusting an average.`,
    r: `A few huge values in a dataset (prices, durations) can fool a model that relies on means; robust statistics and clipping guard against it.`,
    i: `Why can the mean be misleading, and when would you report the median instead?`,
    c: py`
import statistics
marks = [3, 4, 5, 6, 30]
print(statistics.mean(marks), statistics.median(marks))
print(statistics.mean([3, 4, 5, 6]))`,
    o: `9.6 5\n4.5`,
    v: bars("Drag the outlier up: the mean runs away, the median stays put.", [["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["outlier", "o"]], {
      max: 100,
      params: [par("o", "outlier value", 7, 100, 1, 30)],
      readout: ["mean = (3 + 4 + 5 + 6 + {o}) / 5 = {(18+o)/5:2}", "median = 5  (the middle value never moved)"],
    }),
  },
  {
    t: "Variance and standard deviation",
    lv: 1,
    s: `The mean says where the data is centred; variance says how spread out it is. Subtract the mean from each value, square the differences, and average them: {{σ² = (1/n) Σ (xᵢ − x̄)²}}. The standard deviation {{σ}} is the square root, in the original units. Two players with the same average can have very different σ.`,
    r: `Standardising features, initialising weights, and judging noise all use variance and standard deviation.`,
    i: `Why do we square the differences, and why take the square root at the end?`,
    c: py`
marks = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(marks) / len(marks)
diffs = [m - mean for m in marks]
variance = sum(d * d for d in diffs) / len(marks)
std = variance ** 0.5
print(mean, variance, std)`,
    o: `5.0 4.0 2.0`,
    v: trace("Distance from the mean, squared, averaged — then rooted.", py`
marks = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(marks) / len(marks)
diffs = [m - mean for m in marks]
variance = sum(d * d for d in diffs) / len(marks)
std = variance ** 0.5
print(mean, variance, std)`, [
      [1, { marks: "[2, 4, 4, 4, 5, 5, 7, 9]" }],
      [2, { mean: "5.0" }, undefined, "40 / 8 = 5: the centre."],
      [3, { diffs: "[-3, -1, -1, -1, 0, 0, 2, 4]" }, undefined, "How far each mark is from the mean."],
      [4, { variance: "4.0" }, undefined, "Square each difference (9, 1, 1, 1, 0, 0, 4, 16) → 32, and average: 32 / 8 = 4."],
      [5, { std: "2.0" }, undefined, "√4 = 2: the typical distance from the mean, in marks."],
      [6, undefined, "5.0 4.0 2.0"],
    ]),
  },
  {
    t: "Standardisation: z-scores",
    lv: 1,
    s: `A z-score re-expresses a value as "how many standard deviations from the mean": {{z = (x − mean) / σ}}. After standardising, every feature has mean 0 and standard deviation 1, so no feature dominates just because its numbers are bigger (age 0–100 versus salary 0–100,000).`,
    r: `Standardise inputs before gradient descent and distance-based models; it makes training faster and fairer across features.`,
    i: `A mark of 9 with mean 5 and σ = 2: what is the z-score and what does it mean?`,
    c: py`
mean, std = 5, 2
print([(m - mean) / std for m in [2, 5, 9]])`,
    o: `[-1.5, 0.0, 2.0]`,
    v: plot("A z-score is just the distance from the mean, measured in standard deviations.", { x: [-1, 11], y: [0, 0.25], labels: ["value x", "how common"],
      params: [par("v", "value x", -1, 11, 0.5, 9)],
      readout: ["z = ({v} − 5) / 2 = {(v-5)/2:2}", "mean 5, standard deviation 2"] }, [
      area("norm(x,5,2)", "-1", "11", { c: "info" }),
      curve("norm(x,5,2)", { c: "info" }),
      vline("5", { c: "muted", dash: true, label: "mean" }),
      seg("v", "0", "v", "norm(v,5,2)", { c: "warn", dash: true }),
      pt("v", "norm(v,5,2)", { c: "warn", label: "z = {(v-5)/2:1}" }),
    ]),
  },
  {
    t: "Covariance and correlation",
    lv: 2,
    s: `Covariance asks whether two features move together: positive when both rise together, negative when one rises as the other falls. Correlation rescales it to a number between −1 and +1 so it can be compared: {{r = cov(x, y) / (σₓ σᵧ)}}. Correlation measures a straight-line relationship — it is not proof of cause.`,
    r: `Highly correlated features are redundant; the covariance matrix drives PCA and Gaussian models.`,
    i: `What does a correlation of 0 mean, and does it prove the features are unrelated?`,
    c: py`
x = [1, 2, 3, 4, 5]
y = [2, 4, 5, 4, 5]
mx, my = sum(x) / 5, sum(y) / 5
cov = sum((a - mx) * (b - my) for a, b in zip(x, y)) / 5
sx = (sum((a - mx) ** 2 for a in x) / 5) ** 0.5
sy = (sum((b - my) ** 2 for b in y) / 5) ** 0.5
print(round(cov, 2), round(cov / (sx * sy), 3))`,
    o: `1.2 0.775`,
    v: plot("The tighter the points hug a line, the closer correlation is to ±1.", { x: [-3, 3], y: [-3, 3], labels: ["feature x", "feature y"],
      params: [par("r", "strength r", -1, 1, 0.1, 0.8)],
      readout: ["relationship strength r = {r}", "r near +1: rise together · near −1: one rises as the other falls · near 0: no straight-line link"],
      steps: [
        ["Strong positive: points rise together along a line.", { r: 0.95 }],
        ["No relationship: a cloud with no pattern.", { r: 0 }],
        ["Strong negative: as x rises, y falls.", { r: -0.95 }],
      ] }, [
      curve("r*x", { c: "muted", dash: true }),
      ...[
        [-2, 0.8], [-1.5, -0.5], [-1, 0.3], [-0.5, -0.9], [0.5, 0.6], [1, -0.2], [1.5, -0.7], [2, 0.4],
      ].map(([xv, nv]) => pt(String(xv), `r*${xv}+sqrt(1-r^2)*${nv}`, { c: "accent" })),
    ]),
  },
  {
    t: "The normal distribution and the empirical rule",
    lv: 2,
    s: `Many natural quantities pile up in a bell shape: the normal (Gaussian) distribution. The mean sets the centre, the standard deviation the width. The empirical rule: about 68% of values fall within 1σ of the mean, 95% within 2σ and 99.7% within 3σ. The total area under the curve is 1.`,
    r: `Weights are initialised from a normal distribution, noise is modelled as Gaussian, and z-scores flag outliers beyond about 3σ.`,
    i: `Roughly what fraction of values lies within two standard deviations of the mean?`,
    c: py`
import math

def within(k):
    return math.erf(k / math.sqrt(2))

print(round(within(1), 4), round(within(2), 4), round(within(3), 4))`,
    o: `0.6827 0.9545 0.9973`,
    v: plot("The mean slides the hill; σ widens it. The shaded band holds about 68% of the data.", { x: [-8, 8], y: [0, 0.9], labels: ["value", "how common"],
      params: [par("m", "mean", -3, 3, 0.1, 0), par("s", "standard deviation σ", 0.5, 2.5, 0.1, 1)],
      readout: ["68% of values lie in [{m-s:2}, {m+s:2}]", "95% lie in [{m-2*s:2}, {m+2*s:2}]    99.7% in [{m-3*s:2}, {m+3*s:2}]"] }, [
      area("norm(x,m,s)", "m-s", "m+s", { c: "accent" }),
      curve("norm(x,m,s)", { c: "accent" }),
      vline("m", { c: "muted", dash: true }),
    ]),
  },
  {
    t: "Samples, populations and bias",
    lv: 2,
    s: `The population is everyone you care about; a sample is the part you actually measured. Sample statistics estimate population values — and a sample that over-represents some group (selection bias) misleads every model trained on it. The sample variance divides by n − 1, not n, to correct for estimating the mean from the same data.`,
    r: `A model is only as good as its training sample. Biased data produces biased predictions, however clever the algorithm.`,
    i: `Why does the sample variance divide by n − 1?`,
    c: py`
import statistics
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(statistics.pvariance(data), round(statistics.variance(data), 3))`,
    o: `4 4.571`,
    v: compare("Same formula, but a sample needs a small correction.", ["Population", "Sample"], [
      ["What it is", "everyone you care about", "the part you measured"],
      ["Mean and spread", "μ and σ", "x̄ and s"],
      ["Variance divides by", "n", "n − 1"],
      ["Main danger", "—", "selection bias: a skewed sample misleads"],
    ], 1),
  },
];

/* ------------------------------------------------------------------ */
export const prob: ConceptDef[] = [
  {
    t: "Probability, events and complements",
    lv: 1,
    s: `Probability is a number from 0 (impossible) to 1 (certain). The probabilities of all possible outcomes add up to 1, so the complement is {{P(not A) = 1 − P(A)}}. For overlapping events, add and subtract the overlap: {{P(A or B) = P(A) + P(B) − P(A and B)}}.`,
    r: `A classifier's output is a probability for each class, and the complement rule is how a binary model gets both from one number.`,
    i: `If P(spam) = 0.3, what is P(not spam)? Why do we subtract P(A and B) in the addition rule?`,
    c: py`
p_spam = 0.3
print(round(1 - p_spam, 2))
p_a, p_b, p_both = 0.5, 0.4, 0.2
print(round(p_a + p_b - p_both, 2))`,
    o: `0.7\n0.7`,
    v: bars("An event and its complement always share 100% between them.", [["P(spam)", "p"], ["P(not spam)", "1-p"]], {
      percent: true,
      params: [par("p", "P(spam)", 0, 1, 0.05, 0.3)],
      readout: ["P(spam) + P(not spam) = {p} + {1-p:2} = 1"],
    }),
  },
  {
    t: "Conditional probability and independence",
    lv: 2,
    s: `Conditional probability narrows the world: {{P(A | B) = P(A and B) / P(B)}} is "the chance of A once we know B happened". Events are independent when knowing one tells you nothing about the other, so {{P(A | B) = P(A)}}.`,
    r: `Every classifier estimates a conditional probability: P(class | features). Naive Bayes assumes the features are independent given the class.`,
    i: `Of 100 tickets, 40 are billing and 10 of those are urgent. What is P(urgent | billing)?`,
    c: py`
total, billing, urgent_total, urgent_billing = 100, 40, 20, 10
print(urgent_total / total)
print(urgent_billing / billing)
print(urgent_billing / total)`,
    o: `0.2\n0.25\n0.1`,
    v: bars("Knowing the ticket is billing changes the chance it is urgent — unless they are independent.", [["P(urgent)", "20/100"], ["P(urgent | billing)", "ub/40"]], {
      percent: true,
      params: [par("ub", "urgent among the 40 billing tickets", 0, 40, 1, 10)],
      readout: ["P(urgent and billing) = {ub}/100 = {ub/100:3}", "independent only when P(urgent | billing) = P(urgent) = 20% — slide to 8"],
    }),
  },
  {
    t: "Bayes' theorem and the base rate",
    lv: 2,
    s: `Bayes' theorem reverses a conditional probability: {{P(A | B) = P(B | A) · P(A) / P(B)}}. It shows why a positive result from a good test can still be probably wrong when the thing is rare: the base rate (prior) matters as much as the test's accuracy.`,
    r: `Medical screening, spam filters and Naive Bayes all use it. Ignoring base rates is the classic mistake in reading model alerts.`,
    i: `A test is 90% sensitive with a 5% false-positive rate, for a condition affecting 1%. If you test positive, how likely is it you have the condition?`,
    c: py`
prev, sens, fpr = 0.01, 0.9, 0.05
p_pos = sens * prev + fpr * (1 - prev)
posterior = sens * prev / p_pos
print(round(p_pos, 4), round(posterior, 3))`,
    o: `0.0585 0.154`,
    v: bars("With a rare condition most positives are false alarms. Raise the prevalence and watch the posterior jump.", [["Really has it", "post"], ["False alarm", "1-post"]], {
      percent: true,
      params: [par("prev", "prevalence", 0.001, 0.2, 0.001, 0.01), par("sens", "sensitivity", 0.5, 1, 0.01, 0.9), par("fpr", "false-positive rate", 0.001, 0.2, 0.001, 0.05)],
      defs: [["ppos", "sens*prev+fpr*(1-prev)"], ["post", "sens*prev/ppos"]],
      readout: ["P(positive) = {sens:2}·{prev:3} + {fpr:3}·(1 − {prev:3}) = {ppos:4}", "P(has it | positive) = {sens*prev:4} / {ppos:4} = {post:3}"],
    }),
  },
  {
    t: "Random variables and expected value",
    lv: 2,
    s: `A random variable takes different values with different probabilities. Its expected value is the probability-weighted average: {{E[X] = Σ x · P(x)}} — the long-run mean. The probabilities must add to 1. Expectation is linear: {{E[aX + b] = aE[X] + b}}.`,
    r: `A model's loss is an expectation over data; "expected reward" drives reinforcement learning.`,
    i: `A request is retried 0, 1, 2 or 3 times with probabilities 0.5, 0.3, 0.15, 0.05. What is the expected number of retries?`,
    c: py`
values = [0, 1, 2, 3]
probs = [0.5, 0.3, 0.15, 0.05]
expected = sum(v * p for v, p in zip(values, probs))
print(round(expected, 2), round(sum(probs), 2))`,
    o: `0.75 1.0`,
    v: bars("Move probability between '0 retries' and '3 retries' and the expectation shifts.", [["0 retries", "q"], ["1 retry", "0.3"], ["2 retries", "0.15"], ["3 retries", "0.55-q"]], {
      percent: true,
      params: [par("q", "P(0 retries)", 0, 0.55, 0.05, 0.5)],
      readout: ["E[retries] = 0·{q:2} + 1·0.30 + 2·0.15 + 3·{0.55-q:2} = {0.3+0.3+3*(0.55-q):3}", "the four probabilities always add to 1"],
    }),
  },
  {
    t: "Bernoulli and binomial distributions",
    lv: 2,
    s: `A Bernoulli trial has two outcomes (success with probability p). Repeat it n times independently and count successes: that is the binomial distribution, {{P(k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ}}, with mean {{n·p}}. A classifier's right/wrong answers on n test examples are binomial.`,
    r: `Coin-flip logic underlies accuracy estimates, A/B tests and the labels a logistic model predicts.`,
    i: `If each test prediction is correct with probability 0.8, how many of 10 do you expect to get right?`,
    c: py`
import math
n, p = 10, 0.3
pmf = [math.comb(n, k) * p**k * (1 - p) ** (n - k) for k in range(n + 1)]
print(round(pmf[3], 4), round(sum(pmf), 4))
print(n * p)`,
    o: `0.2668 1.0\n3.0`,
    v: bars("Ten Bernoulli trials: how likely is each number of successes?", Array.from({ length: 11 }, (_, k) => [String(k), `comb(10,${k})*p^${k}*(1-p)^${10 - k}`] as [string, string]), {
      max: 0.5,
      percent: true,
      params: [par("p", "chance of success p", 0.05, 0.95, 0.05, 0.3)],
      readout: ["mean = n·p = 10 × {p} = {10*p:2} successes"],
    }),
  },
  {
    t: "Common distributions at a glance",
    lv: 2,
    s: `Different situations have familiar shapes. Normal: measurement noise. Bernoulli/binomial: yes-no counts. Poisson: how many events fall in an interval. Exponential: the waiting time between events. Uniform: every value equally likely. Choosing the right one is half of modelling.`,
    r: `Loss functions correspond to assumptions: squared error assumes Gaussian noise, cross-entropy assumes Bernoulli/categorical labels.`,
    i: `Which distribution describes the number of requests arriving per second?`,
    c: py`
import math
lam = 3                       # average events per interval
k = 2
p = math.exp(-lam) * lam**k / math.factorial(k)
print(round(p, 4))`,
    o: `0.224`,
    v: compare("Match the situation to the distribution.", ["Normal", "Binomial", "Poisson", "Exponential", "Uniform"], [
      ["Models", "noise, errors, heights", "number of successes in n tries", "events per interval", "waiting time between events", "all values equally likely"],
      ["Typical AI use", "weight initialisation", "accuracy of n predictions", "requests per second", "time to failure", "random sampling, dropout masks"],
    ]),
  },
  {
    t: "Entropy: measuring uncertainty",
    lv: 2,
    s: `Entropy measures how unpredictable an outcome is: {{H = −Σ p log₂ p}} (in bits). A fair coin (50/50) is maximally uncertain, 1 bit. A coin that is almost always heads has little entropy: you barely learn anything from seeing it. Certainty has entropy 0.`,
    r: `Decision trees split on the question that removes the most entropy; entropy also underlies cross-entropy and KL divergence.`,
    i: `Why is the entropy of a fair coin larger than that of a loaded coin?`,
    c: py`
import math

def entropy(p):
    return -sum(q * math.log2(q) for q in p if q > 0)

print(entropy([0.5, 0.5]), round(entropy([0.9, 0.1]), 3))
print(max(0.0, entropy([1.0, 0.0])))`,
    o: `1.0 0.469\n0.0`,
    v: plot("Uncertainty is highest at 50/50 and zero when the outcome is certain.", { x: [0, 1], y: [0, 1.1], labels: ["probability p of heads", "entropy (bits)"],
      params: [par("p", "p(heads)", 0.01, 0.99, 0.01, 0.5)],
      readout: ["H = −({p}·log₂ {p} + {1-p:2}·log₂ {1-p:2}) = {-(p*ln(p)+(1-p)*ln(1-p))/ln(2):3} bits"] }, [
      curve("-(x*ln(x)+(1-x)*ln(1-x))/ln(2)", { c: "accent", from: "0.001", to: "0.999" }),
      pt("p", "-(p*ln(p)+(1-p)*ln(1-p))/ln(2)", { c: "warn", label: "{-(p*ln(p)+(1-p)*ln(1-p))/ln(2):2} bits" }),
    ]),
  },
  {
    t: "Cross-entropy and the log loss",
    lv: 2,
    s: `Cross-entropy measures how surprised a model is by the truth: for the correct class with predicted probability p, the loss is {{−ln(p)}}. Confident and right: close to 0. Confident and wrong: huge. It is the standard loss for classification because it rewards honest probabilities.`,
    r: `Every classifier from logistic regression to GPT-style language models is trained by minimising cross-entropy.`,
    i: `If the model gives the correct class probability 0.9, then 0.05, what are the losses?`,
    c: py`
import math
for p in [0.9, 0.5, 0.05]:
    print(p, round(-math.log(p), 3))`,
    o: `0.9 0.105\n0.5 0.693\n0.05 2.996`,
    v: plot("The less probability the model gives the right answer, the steeper the penalty.", { x: [0, 1], y: [0, 4], labels: ["probability given to the correct class", "loss = −ln(p)"],
      params: [par("p", "probability p", 0.02, 1, 0.01, 0.7)],
      readout: ["loss = −ln({p}) = {-ln(p):3}"] }, [
      curve("-ln(x)", { c: "accent", from: "0.02", to: "1" }),
      pt("p", "-ln(p)", { c: "warn", label: "{-ln(p):2}" }),
    ]),
  },
  {
    t: "KL divergence: how different are two distributions?",
    lv: 3,
    s: `KL divergence measures how far a distribution Q is from the true distribution P: {{D(P‖Q) = Σ p ln(p/q)}}. It is 0 only when Q equals P, never negative, and not symmetric. Cross-entropy equals entropy plus KL, which is why minimising cross-entropy pulls the model's distribution toward the data's.`,
    r: `KL appears in variational autoencoders, knowledge distillation and RLHF regularisation.`,
    i: `What is the KL divergence when P and Q are identical?`,
    c: py`
import math
P = [0.5, 0.3, 0.2]
Q = [0.4, 0.4, 0.2]
kl = sum(p * math.log(p / q) for p, q in zip(P, Q))
print(round(kl, 4))`,
    o: `0.0253`,
    v: bars("Move Q toward P: the divergence shrinks to exactly zero when they match.", [["P: A", "0.5"], ["Q: A", "q0"], ["P: B", "0.3"], ["Q: B", "(1-q0)*0.6"], ["P: C", "0.2"], ["Q: C", "(1-q0)*0.4"]], {
      percent: true,
      params: [par("q0", "Q's probability for A", 0.1, 0.8, 0.05, 0.5)],
      readout: ["D(P‖Q) = {0.5*ln(0.5/q0)+0.3*ln(0.3/((1-q0)*0.6))+0.2*ln(0.2/((1-q0)*0.4)):4}   (0 when Q = P, at 0.5)"],
    }),
  },
  {
    t: "The central limit theorem and standard error",
    lv: 2,
    s: `Average many independent samples and the averages follow a bell curve around the true mean, whatever the original distribution. The spread of those averages — the standard error — is {{σ / √n}}: it shrinks as the sample grows, but only with the square root. Four times the data halves the uncertainty.`,
    r: `It is why accuracy on a larger test set is a more trustworthy estimate, and why confidence intervals narrow with more data.`,
    i: `How much more data do you need to halve the standard error?`,
    c: py`
import math
sigma = 2
for n in [1, 4, 25, 100]:
    print(n, sigma / math.sqrt(n))`,
    o: `1 2.0\n4 1.0\n25 0.4\n100 0.2`,
    v: plot("Averages of more samples cluster ever more tightly around the true mean.", { x: [-5, 5], y: [0, 2.2], labels: ["value", "how common"],
      params: [par("n", "sample size n", 1, 100, 1, 4)],
      readout: ["standard error = σ / √n = 2 / √{n} = {2/sqrt(n):3}"],
      steps: [
        ["n = 1: the 'average' is just one value — as spread out as the data (σ = 2).", { n: 1 }],
        ["n = 4: the averages are twice as tight.", { n: 4 }],
        ["n = 25: five times tighter.", { n: 25 }],
        ["n = 100: ten times tighter — more data, narrower uncertainty.", { n: 100 }],
      ] }, [
      curve("norm(x,0,2)", { c: "muted", dash: true, label: "individual values" }),
      area("norm(x,0,2/sqrt(n))", "-5", "5", { c: "accent" }),
      curve("norm(x,0,2/sqrt(n))", { c: "accent" }),
    ]),
  },
  {
    t: "Hypothesis tests and p-values",
    lv: 3,
    s: `A hypothesis test asks: if nothing special were going on (the null hypothesis), how surprising is my result? The p-value is that probability of seeing something at least this extreme. A small p-value (below a chosen level such as 0.05) is evidence against the null — it is not the probability that the null is true. Pick the test by the data: z or t for means, chi-square for counts, ANOVA for several means.`,
    r: `A/B tests of two models, checking whether an accuracy gain is real or luck, and feature selection all use these tests.`,
    i: `What does a p-value of 0.03 mean — and what does it not mean?`,
    c: py`
import math
mean, mu, sigma, n = 52, 50, 10, 25
z = (mean - mu) / (sigma / math.sqrt(n))
p = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))
print(z, round(p, 4))`,
    o: `1.0 0.3173`,
    v: compare("Match the question to the test.", ["z-test", "t-test", "Chi-square", "ANOVA"], [
      ["Compares", "a mean to a known value (σ known)", "means when σ is estimated (small samples)", "observed counts to expected counts", "the means of three or more groups"],
      ["Statistic", "z = (x̄ − μ) / (σ/√n)", "t = (x̄ − μ) / (s/√n)", "Σ (O − E)² / E", "between-group ÷ within-group variance"],
      ["Example", "is this batch's mean 50?", "is model B's mean score higher?", "do clicks differ by ad?", "do three optimisers differ?"],
    ]),
  },
];

void hline;
