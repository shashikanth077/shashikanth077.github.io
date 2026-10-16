import { L, P, area, bars, cells, compare, curve, flow, layers, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { emailHead, emailRows, table } from "./data.js";

/* Every code example uses NumPy only and is RUN by `npm run outputs -- machine-learning`; no output is typed by hand. */

/* ------------------------------------------------------------------ */
export const big: ConceptDef[] = [
  {
    t: "What machine learning is",
    lv: 1,
    s: `In ordinary programming you write the rules and the computer applies them to data to produce answers. In machine learning you give the computer data AND the correct answers, and it finds the rules itself. The rule it learns — a threshold, a set of weights, a tree — is called the {{model}}. Below, a "model" is just a threshold found from eight labelled emails.`,
    r: `Use ML when the rule is too complicated to write by hand (spam, fraud, image content) but you have many examples with known answers.`,
    i: `Explain the difference between traditional programming and machine learning in one sentence.`,
    c: py`
import numpy as np

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
is_spam = np.array([0, 0, 0, 0, 1, 1, 1, 1])
print(links[is_spam == 0].max(), links[is_spam == 1].min())
threshold = (links[is_spam == 0].max() + links[is_spam == 1].min()) / 2
print(threshold)
print((links > threshold).astype(int).tolist())`,
    v: compare("The arrows between data, answers and rules point in opposite directions.", ["Traditional programming", "Machine learning"], [
      ["You provide", "rules + data", "data + correct answers"],
      ["The computer produces", "answers", "rules (the model)"],
      ["Example", "if links > 2: spam", "see 8 labelled emails, learn the threshold 2.5"],
      ["Fits when", "the rule is easy to state", "the rule is too complex to write but examples exist"],
    ], 1),
  },
  {
    t: "Data, information, knowledge, wisdom",
    lv: 1,
    s: `Raw {{data}} (response times 4, 7, 3 minutes) is not yet useful. {{Information}} is data summarised so a person can read it ("the average was 4.67 minutes"). {{Knowledge}} is a pattern with a reason ("tickets with outage words need fast action"). {{Wisdom}} is a decision that uses it ("keep a senior engineer free during peak outage hours"). Machine learning mostly turns data into information and knowledge; people supply the wisdom.`,
    r: `Always ask what decision a model's output will support. A perfect prediction nobody can act on is wasted work.`,
    i: `Give an example of data, information, knowledge and wisdom from one scenario.`,
    c: py`
import numpy as np

times = np.array([4, 7, 3])
print(times.tolist())
print(round(float(times.mean()), 2))`,
    v: layers("Each level adds meaning to the one below.", [
      "Wisdom|reserve a senior engineer during peak outage hours|g",
      "Knowledge|tickets that mention an outage usually need fast action|i",
      "Information|the average response time was 4.67 minutes|w",
      "Data|raw response times: 4, 7, 3 minutes|p",
    ], "more meaning ↑"),
  },
  {
    t: "Three ways a machine can learn",
    lv: 1,
    s: `{{Supervised}} learning has an answer for every training example (spam / not spam) and learns to predict it. {{Unsupervised}} learning has no answers: it looks for structure such as groups. {{Semi-supervised}} learning has a few labelled examples and many unlabelled ones and uses both. (A fourth kind, reinforcement learning, learns from rewards for actions; it is outside this track.)`,
    r: `Labelling is expensive. Many real projects are semi-supervised: label a few hundred tickets by hand and let the structure of thousands more help.`,
    i: `Which learning paradigm fits: grouping customers with no categories supplied?`,
    v: compare("What the training data contains decides the paradigm.", ["Answers in the data?", "Example"], [
      ["Supervised", "yes, for every row", "predict Spam / Normal from labelled emails"],
      ["Unsupervised", "no", "group customers by behaviour"],
      ["Semi-supervised", "for a small part", "100 labelled tickets + 10,000 unlabelled"],
      ["Reinforcement", "no, but rewards", "a robot learning to walk"],
    ]),
  },
  {
    t: "Classification, regression, clustering and association",
    lv: 1,
    s: `The question decides the task. {{Classification}} predicts a category (urgent or routine). {{Regression}} predicts a number (hours to resolve). {{Clustering}} groups items that are alike when no categories are supplied. {{Association}} finds things that occur together ("refund" and "delay" appear in the same tickets). The first two are supervised; the last two usually are not.`,
    r: `Name the task before choosing an algorithm. Predicting "late" or "on time" is classification; predicting "how many days late" is regression.`,
    i: `Is predicting delivery time classification or regression, and why?`,
    v: compare("One support-ticket system, four different questions.", ["Output", "Learning"], [
      ["Classification", "a class: Billing / Delivery / Account", "supervised"],
      ["Regression", "a number: predicted resolution hours", "supervised"],
      ["Clustering", "groups with no names yet", "unsupervised"],
      ["Association", "co-occurring patterns, e.g. refund + delay", "usually unsupervised"],
    ]),
  },
  {
    t: "Features, labels and the leakage trap",
    lv: 1,
    s: `A row is one example; its columns are {{features}} (measurable inputs such as the number of links) and, in supervised learning, one {{label}} (the known answer). The label must never be used as an input: a model that sees the answer scores perfectly in training and fails on new data where no answer exists. That is {{target leakage}}. The same trap hides in columns created after the outcome, like "resolved as spam".`,
    r: `Ask of every column: "will I know this at the moment I have to predict?" If not, drop it.`,
    i: `Why is the label not allowed as an input feature?`,
    v: cells("Features are what we know in advance; the label is what we want to predict.", table(emailHead, emailRows), [
      ["Eight teaching emails: two features (links, offer) and a label."],
      ["Features: links and offer are known when the email arrives.", [[1, 1, 2], [2, 1, 2], [3, 1, 2], [4, 1, 2], [5, 1, 2], [6, 1, 2], [7, 1, 2], [8, 1, 2]]],
      ["Label: the verified answer — only known for training emails.", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3], [5, 3, 3], [6, 3, 3], [7, 3, 3], [8, 3, 3]]],
      ["This pattern is artificial (real spam is not \"3+ links\"); it teaches mechanics, not a production rule.", [[0, 0, 3]]],
    ]),
  },
  {
    t: "The end-to-end workflow",
    lv: 1,
    s: `A good project follows the same nine steps: define the decision, collect and label data, explore it, split it, prepare it, train, evaluate, test once, and deploy and monitor. Splitting comes BEFORE preparation so nothing learned from the test data leaks into training. Evaluation uses several metrics because accuracy alone hides mistakes.`,
    r: `Most project time goes into steps 2 to 5 (data), not into step 6 (training). The model is the easy part.`,
    i: `List the steps of a machine-learning project and say where the test set is first used.`,
    v: flow("Decide, collect, explore, split, prepare, train, evaluate, test once, deploy and monitor.", "row",
      ["1. Decide|what will the output change?|i", "2. Collect + label|check label quality|i", "3. Explore|means, medians, balance, outliers|g", "4. Split|train / validation / test|w", "5. Prepare|encode, scale, vectorise|g", "6. Train|fit the model|g", "7. Evaluate|precision, recall, F1|g", "8. Test once|locked test score|w", "9. Deploy + monitor|drift, errors, feedback|b"],
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]], undefined,
      ["Collect tickets and final labels; check the labels are reliable.", "Look at distributions, missing values and class balance.", "Split BEFORE fitting any preparation step.", "Encode categories, normalise numbers, vectorise text — fit on training rows only.", "Fit the model and tune settings on validation data.", "Judge with the metric that matches the cost of mistakes.", "Report the untouched test score once.", "Monitor drift, latency and human corrections after launch."]),
  },
  {
    t: "Underfitting and overfitting",
    lv: 1,
    s: `A model that is too simple misses the pattern (underfitting): large error on training AND new data. A model that is too flexible memorises the training examples, noise included (overfitting): tiny training error but a worse error on new data. As flexibility grows, training error keeps falling while test error falls, bottoms out and rises. The best model sits at the bottom of the test curve. Drag the flexibility.`,
    r: `Compare the training score with the validation score every time. A big gap is overfitting; two low scores are underfitting.`,
    i: `Training error is near zero but test error is large. What is happening and what can you do?`,
    v: plot("Training error (green) always falls; test error (red) has a sweet spot.", {
      x: [0, 10], y: [0, 9], labels: ["model flexibility", "error"],
      params: [par("c", "flexibility", 0, 10, 0.5, 3.5)],
      defs: [["tr", "8*exp(-0.5*c)+0.3"], ["te", "8*exp(-0.5*c)+0.3+0.08*c^2"]],
      readout: ["flexibility {c}: training error {tr:1}, test error {te:1}"],
      steps: [["Very simple: both errors are high (underfit).", { c: 0.5 }], ["Near the sweet spot: test error is lowest.", { c: 3.5 }], ["Very flexible: training error is tiny, test error has climbed (overfit).", { c: 9 }]],
    }, [
      curve("8*exp(-0.5*x)+0.3", { c: "good", label: "training" }),
      curve("8*exp(-0.5*x)+0.3+0.08*x^2", { c: "bad", label: "test" }),
      vline("c", { c: "muted", dash: true }),
    ]),
  },
  {
    t: "Always compare with a baseline",
    lv: 1,
    s: `A score means nothing without something to compare it to. The simplest baseline predicts the most common class every time. If 95 of 100 emails are Normal, "always Normal" is 95% accurate and catches 0% of spam. Your model must beat the baseline on the metric that matters, not just on accuracy. Drag the share of spam to see how a lazy baseline looks better as spam gets rarer.`,
    r: `Report "model 0.97 accuracy versus 0.95 for always-Normal" — the honest improvement is 2 points, not 97.`,
    i: `A classifier is 95% accurate on data that is 95% one class. Is it good?`,
    c: py`
import numpy as np

y = np.array([0] * 95 + [1] * 5)
pred = np.zeros_like(y)
print((pred == y).mean())
print(((pred == 1) & (y == 1)).sum() / (y == 1).sum())`,
    v: bars("The 'always predict Normal' baseline: accuracy rises as spam gets rarer, spam recall stays 0.", [["accuracy of always-Normal", "(100-p)/100"], ["recall for spam", "0"]], {
      percent: true,
      params: [par("p", "% of emails that are spam", 1, 50, 1, 5)],
      readout: ["with {p}% spam the lazy baseline is {100-p}% accurate and catches none of it"],
      steps: [["5% spam: 95% accuracy, 0% recall.", { p: 5 }], ["40% spam: accuracy 60% — now the baseline looks poor.", { p: 40 }]],
    }),
  },
];

/* ------------------------------------------------------------------ */
const xe = [1, 2, 3, 4, 5];
const ee = [1, -2, 1.6, -1.2, 0.6];
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const mx = mean(xe);
const vx = mean(xe.map((x) => (x - mx) ** 2));
const me = mean(ee);
const ve = mean(ee.map((e) => (e - me) ** 2));
const cxe = mean(xe.map((x, i) => (x - mx) * ((ee[i] ?? 0) - me)));

export const stats: ConceptDef[] = [
  {
    t: "Mean, median and mode",
    lv: 1,
    s: `Three ways to find the "typical" value. The {{mean}} adds everything and divides by the count; the {{median}} is the middle value after sorting; the {{mode}} is the most frequent. For ticket times 2, 3, 3, 4, 18 minutes the mean is 6, but the median and mode are 3. One outlier drags the mean, not the median. Drag the last value.`,
    r: `Report the median for skewed data (salaries, waiting times). Use the mean when values are symmetric and you need totals.`,
    i: `Which is more robust to outliers, the mean or the median, and why?`,
    c: py`
import numpy as np

x = np.array([2, 3, 3, 4, 18])
print(x.mean(), np.median(x))
values, counts = np.unique(x, return_counts=True)
print(int(values[counts.argmax()]))`,
    v: plot("The median stays put; the mean chases the outlier.", {
      x: [0, 42], y: [-1, 1], labels: ["minutes", ""],
      params: [par("o", "the last ticket (minutes)", 5, 40, 1, 18)],
      readout: ["mean = (2+3+3+4+{o}) / 5 = {(12+o)/5:1}   ·   median = 3   ·   mode = 3"],
      steps: [["With 18 minutes: mean 6, median 3.", { o: 18 }], ["Without a big outlier (5): mean 3.4, median 3 — they agree.", { o: 5 }], ["A 40-minute ticket: mean 12.4 but the typical ticket is still 3.", { o: 40 }]],
    }, [
      ...[2, 3, 3.1, 4].map((v) => pt(String(v), "0", { c: "info" })),
      pt("o", "0", { c: "warn" }),
      vline("(12+o)/5", { c: "bad", label: "mean" }),
      vline("3", { c: "good", label: "median" }),
    ]),
  },
  {
    t: "Spread: range, variance and standard deviation",
    lv: 1,
    s: `The spread tells you how far values stray from the centre. The {{range}} (max − min) is easy but controlled by extremes. {{Variance}} averages the squared distances from the mean; the {{standard deviation}} is its square root, in the original unit. For 2, 3, 3, 4 the mean is 3, the squared deviations are 1, 0, 0, 1, the population variance is 0.5 and the standard deviation is about 0.707. Dividing by n − 1 instead of n gives the sample versions.`,
    r: `NumPy and pandas differ: {{np.std}} divides by n; pandas {{std()}} divides by n − 1. Use {{ddof}} to match them.`,
    i: `Calculate the variance and standard deviation of 2, 3, 3, 4.`,
    c: py`
import numpy as np

x = np.array([2, 3, 3, 4])
print(x.mean(), x.var(), round(float(x.std()), 3))
print(round(float(x.var(ddof=1)), 3), round(float(x.std(ddof=1)), 3))`,
    v: cells("Distance from the mean (3), squared, then averaged.", [L("x", ["2", "3", "3", "4"], "pos")], [
      ["Four values with mean 3."],
      ["Deviations from the mean: −1, 0, 0, +1.", [[0, 0, 3]], [L("x", ["2", "3", "3", "4"], "pos"), P("x − 3", ["-1", "0", "0", "1"])]],
      ["Square them: 1, 0, 0, 1.", [[1, 0, 3]], [L("x", ["2", "3", "3", "4"], "pos"), P("x − 3", ["-1", "0", "0", "1"]), P("(x − 3)²", ["1", "0", "0", "1"])]],
      ["Population variance = (1 + 0 + 0 + 1) / 4 = 0.5; standard deviation = √0.5 ≈ 0.707.", [[2, 0, 3]]],
    ]),
  },
  {
    t: "Quartiles, IQR and shape",
    lv: 2,
    s: `{{Q1}} and {{Q3}} cut off the lowest and highest quarter of the sorted data; {{IQR = Q3 − Q1}} is the spread of the middle half and is not affected by extremes. A value beyond {{Q1 − 1.5·IQR}} or {{Q3 + 1.5·IQR}} is flagged as a possible outlier. A long tail to the right is positive skew (mean above median); the "peakedness" of the tails is kurtosis. Drag the last value past the fence.`,
    r: `The IQR rule is the first screen for outliers. A flagged value is something to investigate, not delete.`,
    i: `How do quartiles identify an outlier?`,
    c: py`
import numpy as np

x = np.array([2, 3, 3, 4, 18])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, iqr)
print(low, high)
print(x[(x < low) | (x > high)].tolist(), x.mean() > np.median(x))`,
    v: plot("Fences at 1.5 and 5.5 (Q1 = 3, Q3 = 4, IQR = 1). The last value turns red beyond the upper fence.", {
      x: [0, 32], y: [-1, 1], labels: ["minutes", ""],
      params: [par("o", "the last ticket (minutes)", 4, 30, 1, 18)],
      readout: ["upper fence = 4 + 1.5 × 1 = 5.5; the value {o} is flagged only if it is above 5.5"],
      steps: [["18 is far above the fence: flagged.", { o: 18 }], ["5 is inside the fence: normal.", { o: 5 }]],
    }, [
      vline("1.5", { c: "warn", dash: true, label: "low fence" }),
      vline("5.5", { c: "warn", dash: true, label: "high fence" }),
      ...[2, 3, 3.1, 4].map((v) => pt(String(v), "0", { c: "info" })),
      pt("o", "0", { c: "bad", label: "{o}", show: "o-5.5" }),
      pt("o", "0", { c: "good", label: "{o}", show: "5.5001-o" }),
    ]),
  },
  {
    t: "Measurement scales",
    lv: 1,
    s: `How a variable was measured decides what you may calculate. {{Nominal}} values are names with no order (browser = Chrome). {{Ordinal}} values have an order but unequal gaps (low, medium, high). {{Interval}} values have equal gaps but no true zero (°C: 20° is not "twice as hot" as 10°). {{Ratio}} values have equal gaps AND a true zero (response seconds: 20 s really is twice 10 s).`,
    r: `Encoding follows the scale: one-hot for nominal, ordered codes for ordinal (equal gaps are an assumption), plain numbers for interval and ratio.`,
    i: `Why is 20 °C not twice as hot as 10 °C?`,
    v: compare("Four scales, from weakest to strongest.", ["Meaning", "Example", "ML caution"], [
      ["Nominal", "names, no order", "browser = Chrome", "one-hot encode"],
      ["Ordinal", "order, unequal gaps", "low / medium / high", "keep the order, do not assume equal gaps"],
      ["Interval", "equal gaps, no true zero", "temperature in °C", "differences are meaningful, ratios are not"],
      ["Ratio", "equal gaps and a true zero", "response seconds", "ratios are meaningful"],
    ]),
  },
  {
    t: "Population, sample and inference",
    lv: 1,
    s: `We usually cannot measure everything. The {{population}} is every case we care about (all future tickets); a {{sample}} is the part we actually observe (100 tickets). {{Descriptive}} statistics summarise the sample. {{Inferential}} statistics use probability to say what the sample suggests about the population — and how sure we can be. A random, representative sample is what makes this valid.`,
    r: `A biased sample (only angry customers write reviews) gives biased conclusions no matter how large it is.`,
    i: `What is the difference between descriptive and inferential statistics?`,
    c: py`
import numpy as np

rng = np.random.default_rng(1)
population = np.arange(1, 101)
sample = rng.choice(population, size=10, replace=False)
print(population.mean(), len(sample))
print(abs(sample.mean() - population.mean()) < 25)`,
    v: flow("From a sample we reason about the population.", "row",
      ["Population|all future tickets|i", "Random sample|100 observed tickets|w", "Statistic|sample mean, proportion|g", "Inference|estimate + uncertainty|g"],
      [[0, 1, "draw"], [1, 2, "compute"], [2, 3, "probability"]], undefined,
      ["We cannot measure the whole population, so we draw a random sample.", "We compute a statistic from the sample.", "Probability tells us how far it can be from the true population value."]),
  },
  {
    t: "Hypothesis testing: the four steps",
    lv: 1,
    s: `A hypothesis test asks whether the data give enough evidence against "nothing is happening". Step 1: state {{H₀}} (no difference, no effect) and {{Hₐ}} (there is a difference). Step 2: choose the significance level {{α}}, usually 0.05. Step 3: compute a test statistic and its {{p-value}} — the chance of a result at least this extreme if H₀ were true. Step 4: if p &lt; α, reject H₀; otherwise do not reject it. Failing to reject is not proof that H₀ is true.`,
    r: `Say "the sample did not give enough evidence against H₀", never "H₀ is true". A tiny effect in a huge sample can be significant but unimportant.`,
    i: `What does p = 0.03 mean, and what does it not mean?`,
    c: py`
alpha = 0.05
for p in (0.03, 0.057):
    decision = "reject H0" if p < alpha else "do not reject H0"
    print(p, decision)`,
    v: flow("State, choose α, compute p, decide.", "row",
      ["1. H₀ and Hₐ|no difference vs a difference|i", "2. Choose α|usually 0.05|w", "3. Test statistic + p|how extreme is the data?|g", "4. Decide|p < α → reject H₀|b"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["Decide in advance how much false-alarm risk you accept.", "Compute the statistic and its p-value from the sample.", "Compare p with α and report in words, with the effect size."]),
  },
  {
    t: "A t-test by hand",
    lv: 2,
    s: `A new routing model is claimed to beat the old average of 10 minutes. In 25 tickets the mean is 8.8 with sample standard deviation 3. The one-sample statistic is {{t = (x̄ − μ₀) / (s / √n)}} = (8.8 − 10) / (3 / 5) = −2.0 with {{df = n − 1 = 24}}. The p-value is the area in the tails of the t distribution beyond |t|. Drag t: the shaded tails shrink as the evidence grows.`,
    r: `With t = −2 the two-sided p is about 0.057 (not significant at 0.05) and the one-sided p about 0.028 (significant). Choose one- or two-sided BEFORE looking at the data.`,
    i: `Compute the one-sample t statistic for mean 8.8, μ₀ = 10, s = 3, n = 25.`,
    c: py`
import math
import numpy as np

n, mean, s, mu0 = 25, 8.8, 3.0, 10.0
t = (mean - mu0) / (s / math.sqrt(n))
df = n - 1
print(round(t, 2), df)

def t_pdf(x, df):
    c = math.gamma((df + 1) / 2) / (math.sqrt(df * math.pi) * math.gamma(df / 2))
    return c * (1 + x * x / df) ** (-(df + 1) / 2)

xs = np.linspace(abs(t), 60, 200001)
tail = np.trapezoid([t_pdf(x, df) for x in xs], xs)
print(round(float(2 * tail), 3), round(float(tail), 3))`,
    v: plot("t distribution with 24 degrees of freedom. The shaded tails beyond ±t hold the p-value.", {
      x: [-5, 5], y: [0, 0.45], labels: ["t", "density"],
      params: [par("t", "|t|", 0, 4, 0.1, 2)],
      readout: ["|t| = {t}: two-sided p ≈ 0.057 at 2.0, 0.050 at 2.064, 0.006 at 3.0"],
      steps: [["|t| = 1: the tails are large (p ≈ 0.33) — no evidence.", { t: 1 }], ["|t| = 2: p ≈ 0.057, just above 0.05.", { t: 2 }], ["|t| = 3: tiny tails, p ≈ 0.006 — strong evidence against H₀.", { t: 3 }]],
    }, [
      curve("0.39480938821349065*(1+x^2/24)^(-12.5)", { c: "accent" }),
      area("0.39480938821349065*(1+x^2/24)^(-12.5)", "t", "5", { c: "bad" }),
      area("0.39480938821349065*(1+x^2/24)^(-12.5)", "-5", "-t", { c: "bad" }),
    ]),
  },
  {
    t: "Which test: t-tests, ANOVA and non-parametric",
    lv: 2,
    s: `Pick the test from the question. {{One-sample t}}: does one mean differ from a target? {{Independent t}}: do two unrelated groups differ? {{Paired t}}: did the same units change (before/after)? {{ANOVA}}: do three or more means differ? {{Wilcoxon / Kruskal–Wallis}}: rank-based tests for non-normal data or strong outliers. After a significant ANOVA, follow up with careful pairwise tests.`,
    r: `Matching the test to the design matters more than the arithmetic. Using an independent test on paired data throws away power.`,
    i: `Same agents, before and after training: which test?`,
    v: compare("The design decides the test.", ["Question", "Example"], [
      ["One-sample t", "does one mean differ from a target?", "mean response time vs 10 minutes"],
      ["Independent t", "do two separate groups differ?", "old routing vs new routing on different tickets"],
      ["Paired t", "did the same units change?", "same agents before and after training"],
      ["ANOVA", "do 3+ means differ?", "three regions' resolution times"],
      ["Wilcoxon / Kruskal–Wallis", "ranks, non-normal data, outliers", "satisfaction scores 1 to 5"],
    ]),
  },
  {
    t: "Correlation is not causation",
    lv: 1,
    s: `{{Pearson r = covariance(X, Y) / (sₓ · s_y)}} measures how closely two numbers move along a straight line: +1 rise together, −1 one rises while the other falls, near 0 no linear link. It says nothing about cause. More support agents and more tickets are correlated, but busy days cause both. Drag the slope: with the same scatter of noise, a steeper line means a higher |r|.`,
    r: `A strong r invites a causal story. Ask what third factor could drive both before you act on it.`,
    i: `Ice-cream sales and drownings correlate. Does ice cream cause drowning?`,
    c: py`
import numpy as np

x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])
print(round(float(np.corrcoef(x, y)[0, 1]), 3))
agents = np.array([3, 5, 8, 10])
tickets = np.array([30, 52, 75, 100])
print(round(float(np.corrcoef(agents, tickets)[0, 1]), 3))`,
    v: plot("Five points: y = slope · (x − 3) + 3 + a fixed amount of noise. Steeper slope → stronger correlation.", {
      x: [0, 6], y: [-3, 9], labels: ["x", "y"],
      params: [par("m", "slope", -2, 2, 0.25, 1)],
      defs: [["r", `(${vx}*m+${cxe})/(${Math.sqrt(vx)}*sqrt(m^2*${vx}+2*m*${cxe}+${ve}))`]],
      readout: ["slope {m}  →  Pearson r = {r:2}"],
      steps: [["Slope 1: a clear rising pattern, r ≈ 0.7.", { m: 1 }], ["Slope 0: only noise, r ≈ 0.", { m: 0 }], ["Slope −2: a strong falling pattern, r ≈ −0.9.", { m: -2 }]],
    }, [
      ...xe.map((x, i) => pt(String(x), `m*(${x}-3)+3+(${ee[i]})`, { c: "info" })),
      seg("1", "3-2*m", "5", "3+2*m", { c: "warn", dash: true }),
    ]),
  },
];
