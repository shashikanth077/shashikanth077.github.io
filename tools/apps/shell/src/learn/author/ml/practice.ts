import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* big picture */
  ["big", 1, "How does machine learning differ from traditional programming?", "In traditional programming you write the rules and apply them to data to get answers; in ML you supply data and the correct answers and the computer learns the rules (the model)."],
  ["big", 1, "Define supervised, unsupervised and semi-supervised learning.", "Supervised: every training example has a known answer. Unsupervised: no answers, find structure such as clusters. Semi-supervised: a few labelled examples plus many unlabelled ones."],
  ["big", 1, "What is the difference between classification, regression, clustering and association?", "Classification predicts a category; regression a number; clustering groups similar items without labels; association finds items that co-occur."],
  ["big", 1, "What is target leakage?", "Using information unavailable at prediction time — the label itself or a field created after the outcome — as an input. Training scores look perfect; real use fails."],
  ["big", 1, "List the steps of an ML project.", "Define the decision → collect and label → explore → split → prepare (fit on train only) → train → evaluate → test once → deploy and monitor."],
  ["big", 1, "Explain overfitting and underfitting.", "Underfitting: too simple, high error on train and test. Overfitting: too flexible, near-zero training error but worse error on new data. Compare training and validation scores."],
  /* statistics */
  ["stats", 1, "Mean, median and mode: which is robust to outliers?", "The median (and the mode). For 2, 3, 3, 4, 18 the mean is 6 but the median and mode are 3."],
  ["stats", 1, "Compute the population variance and standard deviation of 2, 3, 3, 4.", "Mean 3; squared deviations 1, 0, 0, 1; variance 0.5; standard deviation √0.5 ≈ 0.707. The sample versions divide by n − 1."],
  ["stats", 2, "How do quartiles flag outliers?", "IQR = Q3 − Q1; values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR are flagged as possible outliers."],
  ["stats", 1, "Name the four measurement scales.", "Nominal (names), ordinal (order, unequal gaps), interval (equal gaps, no true zero), ratio (equal gaps and a true zero)."],
  ["stats", 1, "What does a p-value of 0.03 mean?", "If H₀ were true, a result at least this extreme would occur about 3% of the time. It is not the probability that H₀ is true; with α = 0.05 we reject H₀."],
  ["stats", 2, "Compute the one-sample t statistic: x̄ = 8.8, μ₀ = 10, s = 3, n = 25.", "t = (8.8 − 10)/(3/√25) = −1.2/0.6 = −2.0 with 24 degrees of freedom."],
  ["stats", 2, "Which test: same agents before and after training?", "A paired t-test (or Wilcoxon signed-rank if not normal). Independent tests are for unrelated groups; ANOVA for three or more means."],
  ["stats", 1, "Why does correlation not prove causation?", "A third factor (a confounder) can drive both variables, or the link may be chance. Pearson r only measures the linear association."],
  /* preparation */
  ["prep", 1, "Why one-hot encode categories instead of 0, 1, 2?", "Integer codes invent an order and distances (Friend closer to Shop than to Unknown). One-hot makes all categories equally different."],
  ["prep", 1, "Normalise x = 30 from [10, 50] into [0, 100].", "0 + (30 − 10) × 100 / (50 − 10) = 50. General form: a + (x − min)(b − a)/(max − min), with min/max from training data."],
  ["prep", 1, "What does z = 1 mean?", "One standard deviation above the training mean: z = (x − μ)/σ. With μ = 4 and σ = 2, x = 6 gives 1."],
  ["prep", 1, "Which models need scaling?", "Distance- and gradient-based ones: kNN, SVM, k-means, PCA, neural networks. Trees and forests do not."],
  ["prep", 1, "Why can accuracy mislead on imbalanced data?", "Always predicting the majority class is highly accurate yet finds none of the rare class. Check recall, precision, F1 and a baseline."],
  ["prep", 2, "Describe SMOTE and its main rules.", "x_new = A + λ(B − A) between a minority point and a minority neighbour, 0 ≤ λ ≤ 1. Apply only inside training folds, never before splitting; it can create overlapping or invalid points."],
  ["prep", 2, "What is leakage in preprocessing?", "Fitting a scaler, imputer, encoder or sampler on data that includes the validation or test rows. Fit on training rows only; use a pipeline inside cross-validation."],
  ["prep", 1, "How should you treat an outlier?", "Flag it, inspect the original record, compare with domain rules, then correct, cap, transform, keep or model separately — and document the decision."],
  /* distance */
  ["distance", 1, "Euclidean versus Manhattan distance between (1, 2) and (4, 6).", "Euclidean √(3² + 4²) = 5; Manhattan |3| + |4| = 7."],
  ["distance", 1, "Why use cosine similarity for text?", "It compares direction, not length, so a long and a short document on the same topic are similar. For unit vectors squared Euclidean distance = 2(1 − cosine)."],
  ["distance", 1, "Why can one feature dominate a distance?", "Squaring a large-range difference swamps small-range ones. Standardise or weight features — but do not rescale coordinates that already share one physical unit."],
  /* trees */
  ["tree", 1, "Compute the Gini of a node with 6 Spam and 4 Normal.", "1 − 0.6² − 0.4² = 0.48. A pure node has Gini 0; a 50/50 two-class node 0.5."],
  ["tree", 1, "How is a split scored?", "Weighted child impurity Σ (n_child/n_parent) × Gini(child) (or entropy); choose the split with the largest reduction (or information gain)."],
  ["tree", 2, "Compute the information gain of a split producing two pure children from a 50/50 parent.", "H(parent) = 1 bit; children 0; gain = 1 bit. A 3-to-1 child has entropy 0.8113 bits."],
  ["tree", 1, "How do you prevent a tree from overfitting?", "Limit max_depth, require min_samples_leaf, prune, or use an ensemble; compare training with validation scores."],
  ["tree", 2, "Random forest versus gradient boosting?", "A forest averages independently trained randomised trees (reduces variance); boosting adds trees sequentially to correct the current model (reduces bias, can overfit)."],
  ["tree", 2, "How does a boosting stage update a prediction?", "F_new = F_old + η·h(x) on the log-odds score, then p = sigmoid(F). Example: F₀ = ln(0.4/0.6), + 0.5 × 0.8 → p = 0.4986."],
  ["tree", 2, "What is a bootstrap sample and an out-of-bag row?", "A bootstrap sample draws rows with replacement; rows a tree never saw are out-of-bag and give a built-in validation estimate."],
  /* classic */
  ["classic", 1, "State Naive Bayes and its assumption.", "P(class | clues) ∝ P(class) Π P(clue | class); features are assumed conditionally independent given the class."],
  ["classic", 2, "Calculate P(Spam | offer = no, links high = yes) from the eight-email table.", "Spam score 0.5 × (2/6) × (5/6) = 5/36; Normal 0.5 × (4/6) × (1/6) = 2/36; P(Spam) = 5/7 ≈ 0.7143."],
  ["classic", 2, "Why use Laplace smoothing?", "A zero count would zero the whole product; adding α to each count keeps every probability positive."],
  ["classic", 1, "Classify Q = (2, 2) with 3-NN given the table of distances.", "The three nearest points are N2 (1), N3 (1), N1 (√2): all Normal, so predict Normal."],
  ["classic", 2, "kNN: when do uniform and distance-weighted voting disagree?", "Neighbours [Normal, Spam, Spam] at distances 1, 2, 2.5: uniform → Spam; weights 1/d give Normal 1.0 vs Spam 0.9 → Normal."],
  ["classic", 2, "Find the SVM score of Q = (4, 3) with w = (0.5, 0.5), b = −3.", "f = 0.5·4 + 0.5·3 − 3 = 0.5 → Spam, at distance 0.5/‖w‖ ≈ 0.707. A score is not a probability."],
  ["classic", 2, "What does the C parameter do?", "It weights the hinge-loss violations against the margin width: large C → fewer violations, narrower margin, overfitting risk; small C → wider, more regularised margin."],
  ["classic", 2, "What does an RBF kernel's γ control?", "How local the influence of a point is: K = exp(−γ‖x − z‖²). Large γ → wiggly boundary; small γ → smooth."],
  ["classic", 1, "Why is there no best classifier?", "The best choice depends on representation, sample size, class balance, error costs and validation evidence; compare on the same split and metric."],
  /* neural networks */
  ["nn", 1, "Compute the output of a neuron: x = (1, 0.5, 0.8), w = (2, 1, 3), b = −2, sigmoid.", "z = 2 + 0.5 + 2.4 − 2 = 2.9; sigmoid(2.9) ≈ 0.948."],
  ["nn", 1, "Why do hidden layers need non-linear activations?", "Without them stacked layers collapse to one linear transformation and cannot learn curved decision boundaries."],
  ["nn", 1, "Sigmoid, tanh, ReLU, softmax: ranges and uses.", "Sigmoid 0–1 (binary probability); tanh −1 to 1 (centred hidden values); ReLU max(0, z) (common hidden layer); softmax turns several scores into class probabilities that sum to 1."],
  ["nn", 2, "Describe one training step.", "Forward pass → loss → backpropagation (gradients by the chain rule) → optimiser update w ← w − η·gradient."],
  ["nn", 2, "Gradient of binary cross-entropy for a sigmoid output.", "∂L/∂w = (p − y)·x and ∂L/∂b = p − y."],
  ["nn", 1, "Epoch, batch, iteration?", "An epoch is one pass over the training set; a batch is the examples used for one update; an iteration is one update. 1,000 rows with batch 100 → 10 iterations per epoch."],
  ["nn", 2, "How does a PNN differ from an MLP?", "A PNN is a kernel-density classifier that stores the examples and adds Gaussian bumps per class; it is not trained by backpropagation."],
  /* evaluation */
  ["eval", 1, "What is each of train, validation and test used for?", "Train: estimate parameters. Validation: choose settings (depth, k, C, threshold). Test: estimate the final workflow once; it must not decide anything."],
  ["eval", 1, "How many fits does 5-fold CV need? Leave-one-out for 80 rows?", "Five fits (plus a final refit); leave-one-out needs 80. Leave-p-out uses C(80, p) runs: 3,160 for p = 2."],
  ["eval", 1, "Define precision, recall, specificity, F1.", "Precision TP/(TP+FP); recall TP/(TP+FN); specificity TN/(TN+FP); F1 = 2TP/(2TP+FP+FN), the harmonic mean of precision and recall."],
  ["eval", 1, "Given TP = 18, FN = 2, FP = 6, TN = 74, compute precision, recall and F1.", "Precision 18/24 = 0.75; recall 18/20 = 0.90; F1 = 36/44 ≈ 0.818."],
  ["eval", 2, "Macro versus weighted versus micro averaging?", "Macro averages the classes equally; weighted weights by support; micro pools the counts (equal to accuracy for single-label multiclass). State which formula you use."],
  ["eval", 2, "Does raising the threshold always raise precision?", "No. Fewer positives are predicted but precision can fall, as in the eight-score example (0.667 at 0.7, 0.5 at 0.8)."],
  ["eval", 2, "Compute ROC-AUC from positives [0.9, 0.7, 0.4] and negatives [0.8, 0.6, 0.3, 0.2, 0.1].", "Pairs ranked correctly: 5 + 4 + 3 = 12 of 15 → AUC = 0.8. This is not 80% accuracy."],
  ["eval", 2, "When prefer a precision–recall curve to ROC?", "For rare positives, because many negatives keep the false-positive rate small and make ROC look flattering."],
  ["eval", 2, "What does log loss reward?", "Honest probabilities: only the probability given to the true class matters, and a confident wrong answer is costly (−ln 0.1 = 2.30)."],
  ["eval", 2, "How many fits: 3 × 2 grid, 5-fold CV?", "6 candidates × 5 folds = 30 validation fits, plus one final refit."],
  ["eval", 3, "Why is the best CV score over many settings optimistic?", "Choosing the maximum of many noisy estimates biases it upward. Nested CV or a locked test set gives an honest estimate."],
  ["eval", 1, "Compute MAE, RMSE and R² for y = [3, 5, 7], predictions [2.5, 5, 8].", "Errors −0.5, 0, +1: MAE 0.5, MSE 0.4167, RMSE 0.6455, R² = 1 − 1.25/8 = 0.844."],
  /* projections */
  ["viz", 1, "List the steps of PCA.", "Centre (and usually standardise), covariance matrix, eigenvectors and eigenvalues, sort by eigenvalue, project onto the top components; explained variance = eigenvalue / sum."],
  ["viz", 2, "PCA versus LDA?", "PCA is unsupervised and keeps the largest variance; LDA uses labels to find the direction that best separates classes."],
  ["viz", 2, "What is the curse of dimensionality?", "In many dimensions all points become nearly equally far apart and the data needed to cover the space explodes, so distance-based methods lose discrimination."],
  ["viz", 2, "Can you trust cluster gaps in a t-SNE plot?", "Only locally: neighbourhoods are meaningful, but gaps and cluster sizes depend on parameters and are not reliable measurements."],
  ["viz", 3, "Why TruncatedSVD for TF–IDF?", "It works on sparse matrices without centring (which would make them dense); the latent coordinates support similarity and clustering."],
  /* clustering */
  ["cluster", 1, "Describe k-means.", "Choose K and starting centres; assign each point to its nearest centre; move each centre to the mean of its points; repeat until stable. It minimises the within-cluster SSE."],
  ["cluster", 2, "Compute the SSE after the first assignment for the six delivery points.", "Squared distances to the centres (1,1) and (2,1): 0 + 1 + 0 + 85 + 100 + 98 = 284 km²."],
  ["cluster", 2, "Why can't the smallest SSE choose K?", "SSE falls as K grows and is 0 when every point is its own cluster. Use the elbow, silhouette, stability and business usefulness."],
  ["cluster", 2, "Compute the silhouette of A.", "a = 1, b ≈ 10.3866, s = (b − a)/max(a, b) ≈ 0.9037."],
  ["cluster", 1, "Do single-linkage clustering of 1, 2, 7, 10.", "Merge (1, 2) at 1, (7, 10) at 3, then the two groups at min(6, 9, 5, 8) = 5."],
  ["cluster", 1, "How do you read a dendrogram?", "Leaves are points, join heights are merge distances; a horizontal cut gives the number of clusters it crosses. Leaf spacing is only layout."],
  ["cluster", 2, "Single, complete and average linkage between {1, 2} and {7, 10}.", "Cross distances 6, 9, 5, 8: single 5, complete 9, average 7."],
  ["cluster", 1, "Define core, border and noise in DBSCAN.", "Core: at least min_samples points within ε (itself included). Border: not core but within ε of a core point. Noise: neither; label −1."],
  ["cluster", 2, "With ε = 1.5, min_samples = 3: roles of H and G?", "H has 2 neighbours (itself and C) but C is core 0.8 away → border. G has only itself → noise."],
  ["cluster", 2, "What happens when min_samples rises from 3 to 4 at ε = 1.5?", "Only C stays core; D, E, F (3 points each) become noise; {A, B, C, H} is one cluster."],
  ["cluster", 2, "K-means, hierarchical, DBSCAN: when to use each?", "K-means for compact groups with K known; hierarchical for nested structure and a choice of cut; DBSCAN for irregular dense groups with noise."],
  ["cluster", 2, "K-medoids versus k-means?", "K-medoids uses a real data point as centre and ordinary distance, so outliers have less pull; k-means uses the mean of squared distances."],
  ["cluster", 2, "Compute fuzzy memberships for x = 4, centres 2 and 8, m = 2.", "Distances 2 and 4: u₁ = 1/[1 + (2/4)²] = 0.8 and u₂ = 0.2."],
  ["cluster", 3, "What is a GMM responsibility?", "r_ij = π_j φ_j(x_i) / Σ_k π_k φ_k(x_i): the posterior probability that component j generated x_i. At x = 1 for N(0,1), N(3,1) with equal shares: 0.8176."],
  ["cluster", 3, "What does the bandwidth do in mean shift?", "It sets the window size: small windows find many modes, large ones blend groups. Example: h = 8 from start 1 gives mean 4.6."],
  ["cluster", 3, "What does reachability mean in OPTICS?", "reach(q from p) = max(core_k(p), d(p, q)); valleys in the reachability plot are dense regions and peaks are gaps."],
  ["cluster", 3, "Compute the CF radius for N = 3, LS = 6, SS = 14 (BIRCH).", "Centre 2, radius √(14/3 − 4) = √(2/3) ≈ 0.816."],
  ["cluster", 2, "How do you cluster categorical data?", "K-modes with the mismatch distance and modes as centres; K-prototypes for mixed data with a weight γ; or Gower distance with medoids."],
  ["cluster", 2, "How do you evaluate clusters when there are no labels?", "Internal scores (silhouette, Davies–Bouldin, Calinski–Harabasz), stability across seeds and resamples, noise coverage and business validity. With trusted labels use ARI."],
  ["cluster", 3, "Compute ARI for true {A,B}/{C,D} vs predicted {A,C}/{B,D}.", "I = 0, E = 2/3, M = 2 → ARI = (0 − 2/3)/(2 − 2/3) = −0.5."],
  /* text */
  ["text", 1, "Retrieval, extraction, classification, clustering: what is each?", "Retrieval finds relevant documents; extraction pulls structured fields; classification assigns a known category; clustering discovers groups without labels."],
  ["text", 1, "Why not remove the word \"not\" as a stop word?", "\"payment received\" and \"payment not received\" would look the same although the meaning is opposite."],
  ["text", 1, "Build the bag-of-words vector of \"refund refund payment\" for [refund, payment, charge, delivery].", "[2, 1, 0, 0]; binary presence would be [1, 1, 0, 0]. Word order is lost."],
  ["text", 2, "Compute idf for a word in 1 of 3 documents.", "idf = ln((1 + 3)/(1 + 1)) + 1 = ln 2 + 1 ≈ 1.6931 (smoothed). State the convention you use."],
  ["text", 1, "Compute the cosine similarity of [1, 1, 0, 0] and [1, 0, 1, 0].", "Dot product 1, lengths √2 each → 1/2 = 0.5."],
  ["text", 2, "Compute precision@3 and recall@3.", "With 2 relevant among the top 3 and 4 relevant in total: precision 2/3 ≈ 0.667, recall 2/4 = 0.5."],
  ["text", 2, "Compute extraction precision, recall, F1.", "8 returned, 6 correct, 10 in the reference: precision 0.75, recall 0.60, F1 = 12/18 = 0.667."],
  ["text", 2, "Classify \"refund payment\" with the Naive Bayes counts of the lecture.", "Billing 0.5 × 4/9 × 3/9 = 6/81; Delivery 0.5 × 1/9 × 1/9 = 0.5/81; P(Billing) = 12/13 ≈ 0.9231."],
  ["text", 2, "Multiclass versus multilabel?", "Multiclass: exactly one class per ticket. Multilabel: several tags can apply to one ticket. It changes the output layer, labelling rules and evaluation."],
  ["text", 2, "What is RAG and its main risk?", "Retrieve evidence, then generate an answer from it with sources. A generator can still misuse a correct passage, so evaluate retrieval and grounding separately."],
  ["text", 2, "Support, confidence and lift for 20 refund, 30 delay, 15 both among 100.", "Support 0.15; confidence 15/20 = 0.75; lift 0.75/0.30 = 2.5. Association is not causation."],
  ["text", 2, "Compute chunk starts for 1,000 tokens, size 300, overlap 50.", "Stride 250; starts 0, 250, 500, 750; lengths 300, 300, 300, 250; 1,150 tokens processed in total."],
  ["text", 2, "Why keep a thread's messages in one split?", "Near-duplicate messages in train and test make the model look good by recognising repeated text."],
  ["text", 2, "Why must a service reuse the TF–IDF vocabulary from training?", "The vector coordinates must mean the same thing at prediction time; refitting per ticket changes them."],
];

export const drills: DrillDef[] = [
  {
    t: "Mean versus median",
    q: "What does this print?",
    code: py`
import numpy as np
x = np.array([2, 3, 3, 4, 18])
print(x.mean(), np.median(x))`,
    opts: [["6.0 3.0", true, "The outlier 18 pulls the mean to 6; the middle sorted value is 3."], ["3.0 6.0", false, "The mean is the first number, and it is the larger one here."], ["6.0 6.0", false, "The median is the middle value, not the mean."]],
    path: ["Sum = 30, five values → mean 6.0.", "Sorted: 2, 3, 3, 4, 18 → middle = 3.", "The outlier moves the mean, not the median."],
    why: "The median ignores how extreme the largest value is.",
    watch: "Report the median for skewed data.",
    remember: "Outlier → mean moves, median stays.",
  },
  {
    t: "Population variance",
    q: "What does this print?",
    code: py`
import numpy as np
print(np.array([2, 3, 3, 4]).var())`,
    opts: [["0.5", true, "Mean 3; squared deviations 1, 0, 0, 1; average 0.5."], ["0.667", false, "That is the sample variance (divide by n − 1)."], ["2.0", false, "That sums the squared deviations without dividing."]],
    path: ["Mean = 3.", "Squared deviations: 1, 0, 0, 1.", "Divide by n = 4 → 0.5."],
    why: "NumPy var defaults to the population formula (ddof = 0).",
    watch: "pandas std() uses n − 1.",
    remember: "ddof=0 population, ddof=1 sample.",
  },
  {
    t: "Normalising into [0, 100]",
    q: "What does this print?",
    code: py`
x, lo, hi = 30, 10, 50
print(0 + (x - lo) * 100 / (hi - lo))`,
    opts: [["50.0", true, "(30 − 10) × 100 / 40 = 50."], ["0.5", false, "That is the [0, 1] version; the target here is [0, 100]."], ["75.0", false, "30 is the midpoint of 10 and 50, so the result is 50."]],
    path: ["30 − 10 = 20.", "20 × 100 = 2000.", "2000 / 40 = 50."],
    why: "x′ = a + (x − min)(b − a)/(max − min).",
    watch: "Fit min and max on training data.",
    remember: "Midpoint maps to midpoint.",
  },
  {
    t: "Gini impurity",
    q: "What does this print?",
    code: py`
p = [6 / 10, 4 / 10]
print(round(1 - sum(v * v for v in p), 2))`,
    opts: [["0.48", true, "1 − 0.36 − 0.16 = 0.48."], ["0.5", false, "0.5 is the Gini of a perfect 50/50 node."], ["0.24", false, "Do not halve the sum of squares."]],
    path: ["p = (0.6, 0.4).", "Sum of squares = 0.36 + 0.16 = 0.52.", "Gini = 1 − 0.52 = 0.48."],
    why: "Gini = 1 − Σ p².",
    watch: "A pure node has Gini 0.",
    remember: "Mixed → higher Gini.",
  },
  {
    t: "Entropy of a 50/50 node",
    q: "What does this print?",
    code: py`
import numpy as np
p = np.array([0.5, 0.5])
print(float((p * np.log2(1 / p)).sum()))`,
    opts: [["1.0", true, "Maximum uncertainty for two classes: 1 bit."], ["0.5", false, "That is the Gini, not the entropy."], ["0.0", false, "0 is a pure node."]],
    path: ["Each class: 0.5 × log₂(2) = 0.5.", "Sum = 1 bit."],
    why: "H = −Σ p log₂ p.",
    watch: "A 3-to-1 node has 0.8113 bits.",
    remember: "50/50 → 1 bit.",
  },
  {
    t: "Naive Bayes posterior",
    q: "What does this print?",
    code: py`
spam = 0.5 * (4 / 6) * (5 / 6)
normal = 0.5 * (2 / 6) * (1 / 6)
print(round(spam / (spam + normal), 4))`,
    opts: [["0.9091", true, "10/36 divided by 11/36 = 10/11."], ["0.5", false, "The priors are equal but the evidence is not."], ["0.2778", false, "That is the unnormalised Spam score."]],
    path: ["Spam score = 10/36 ≈ 0.2778; Normal = 1/36 ≈ 0.0278.", "Normalise: 0.2778 / 0.3056 = 0.9091."],
    why: "Posterior = score / sum of scores.",
    watch: "Normalise by the total of all classes.",
    remember: "Prior × evidence, then normalise.",
  },
  {
    t: "k changes the vote",
    q: "What does this print?",
    code: py`
import numpy as np
x, y = np.array([1, 2, 3, 10]), np.array([0, 0, 0, 1])
order = np.argsort(np.abs(x - 8))
for k in (1, 3):
    print(int(np.bincount(y[order[:k]]).argmax()), end=" ")`,
    opts: [["1 0", true, "k = 1: nearest is 10 (class 1). k = 3: 10, 3, 2 vote 1, 0, 0 → class 0."], ["1 1", false, "With k = 3 two class-0 points outvote one class-1 point."], ["0 0", false, "The single nearest neighbour of 8 is 10, class 1."]],
    path: ["Distances from 8: 10 → 2, 3 → 5, 2 → 6, 1 → 7.", "k = 1: class 1.", "k = 3: classes 1, 0, 0 → majority 0."],
    why: "More neighbours means a smoother vote.",
    watch: "Choose k with validation data.",
    remember: "k = 1 follows every point.",
  },
  {
    t: "SVM score",
    q: "What does this print?",
    code: py`
import numpy as np
w, b = np.array([0.5, 0.5]), -3
print(float(w @ np.array([4, 3]) + b))`,
    opts: [["0.5", true, "0.5·4 + 0.5·3 − 3 = 0.5 — the Spam side."], ["−0.5", false, "The score is positive here."], ["1.0", false, "1.0 is the margin edge, reached at (4, 4)."]],
    path: ["0.5 × 4 = 2, 0.5 × 3 = 1.5.", "2 + 1.5 − 3 = 0.5 > 0 → Spam."],
    why: "The sign of w·x + b gives the class.",
    watch: "The score is not a probability.",
    remember: "f > 0 → positive class.",
  },
  {
    t: "Precision and recall",
    q: "What does this print?",
    code: py`
tp, fn, fp, tn = 18, 2, 6, 74
print(tp / (tp + fp), tp / (tp + fn))`,
    opts: [["0.75 0.9", true, "Precision 18/24, recall 18/20."], ["0.9 0.75", false, "Those are swapped."], ["0.75 0.75", false, "Recall divides by the 20 real positives, not 24."]],
    path: ["Predicted positives = 18 + 6 = 24 → precision 0.75.", "Real positives = 18 + 2 = 20 → recall 0.9."],
    why: "Precision divides by flagged; recall by real positives.",
    watch: "Fix the positive class first.",
    remember: "Flagged vs real.",
  },
  {
    t: "SMOTE point",
    q: "What does this print?",
    code: py`
import numpy as np
A, B = np.array([2, 4]), np.array([6, 8])
print((A + 0.5 * (B - A)).tolist())`,
    opts: [["[4.0, 6.0]", true, "The midpoint of A and B."], ["[6.0, 8.0]", false, "That is B itself (λ = 1)."], ["[2.0, 4.0]", false, "That is A (λ = 0)."]],
    path: ["B − A = (4, 4).", "0.5 × (4, 4) = (2, 2).", "A + (2, 2) = (4, 6)."],
    why: "SMOTE interpolates on the segment between neighbours.",
    watch: "Only inside the training fold.",
    remember: "x_new = A + λ(B − A).",
  },
  {
    t: "ROC-AUC by pairs",
    q: "What does this print?",
    code: py`
import numpy as np
pos, neg = np.array([0.9, 0.7, 0.4]), np.array([0.8, 0.6, 0.3, 0.2, 0.1])
print(round(float((pos[:, None] > neg[None]).mean()), 2))`,
    opts: [["0.8", true, "12 of 15 positive–negative pairs are ranked correctly."], ["0.625", false, "That is the accuracy at threshold 0.5, not the AUC."], ["0.6", false, "Count the correctly ordered pairs: 5 + 4 + 3."]],
    path: ["15 pairs in total.", "0.9 beats 5 negatives, 0.7 beats 4, 0.4 beats 3 → 12.", "12 / 15 = 0.8."],
    why: "AUC is the fraction of correctly ordered pairs.",
    watch: "AUC ignores calibration.",
    remember: "AUC = pairwise ranking accuracy.",
  },
  {
    t: "Log loss of a confident mistake",
    q: "What does this print?",
    code: py`
import numpy as np
print(round(float(-np.log(0.1)), 4))`,
    opts: [["2.3026", true, "A true Spam scored 0.1 costs −ln 0.1."], ["0.2231", false, "That is −ln 0.8, the cost of a confident correct answer."], ["0.1", false, "The loss is not the probability itself."]],
    path: ["True class gets probability 0.1.", "Loss = −ln(0.1) = 2.3026."],
    why: "Log loss punishes confident wrong probabilities.",
    watch: "Clip probabilities away from 0.",
    remember: "−ln(p of the true class).",
  },
  {
    t: "DBSCAN role",
    q: "What is H (2.8, 1)?",
    code: py`
import numpy as np
X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8], [5, 1], [2.8, 1]])
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
n = (D[7] <= 1.5).sum()
core_C = (D[2] <= 1.5).sum() >= 3
print(int(n), bool(core_C))`,
    opts: [["2 True — a border point", true, "H has itself and C in range (2 < 3), but C is core and within 1.5."], ["2 True — a core point", false, "A core point needs at least 3 points in its neighbourhood."], ["1 False — noise", false, "H is within 0.8 of C, so it is not isolated."]],
    path: ["H's neighbourhood: H itself and C → count 2.", "2 < min_samples = 3 → not core.", "C is core and 0.8 km from H → H is a border point."],
    why: "A border point lies within ε of a core point.",
    watch: "Border points do not expand a cluster.",
    remember: "Core ≥ min_samples, border touches core.",
  },
  {
    t: "K-means centroid",
    q: "What does this print?",
    code: py`
import numpy as np
print(np.array([[1, 1], [1, 2], [2, 1]]).mean(axis=0).round(4).tolist())`,
    opts: [["[1.3333, 1.3333]", true, "(1 + 1 + 2)/3 in both coordinates."], ["[1.0, 1.0]", false, "That is one of the points, not the mean."], ["[2.0, 2.0]", false, "The mean is not the sum of the extremes."]],
    path: ["x: (1 + 1 + 2)/3 = 4/3.", "y: (1 + 2 + 1)/3 = 4/3."],
    why: "A centroid is the coordinate-wise mean.",
    watch: "A centroid need not be a data point.",
    remember: "Mean of each feature.",
  },
  {
    t: "Cosine similarity",
    q: "What does this print?",
    code: py`
import numpy as np
x, y = np.array([1.0, 0.0]), np.array([0.8, 0.6])
print(round(float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y))), 2))`,
    opts: [["0.8", true, "Both vectors have length 1, so it is the dot product 0.8."], ["0.2", false, "That is the cosine distance 1 − 0.8."], ["1.4", false, "Cosine is never above 1."]],
    path: ["Dot product = 1·0.8 + 0·0.6 = 0.8.", "Lengths: 1 and √(0.64 + 0.36) = 1.", "cos = 0.8."],
    why: "cos = x·y / (‖x‖‖y‖).",
    watch: "Distance = 1 − cosine.",
    remember: "Direction only.",
  },
  {
    t: "Inverse document frequency",
    q: "What does this print?",
    code: py`
import numpy as np
N, df = 3, 1
print(round(float(np.log((1 + N) / (1 + df)) + 1), 4))`,
    opts: [["1.6931", true, "ln(4/2) + 1 = ln 2 + 1."], ["1.0", false, "That is the idf of a word in every document."], ["0.6931", false, "The smoothed formula adds 1."]],
    path: ["(1 + 3) / (1 + 1) = 2.", "ln 2 = 0.6931.", "Add 1 → 1.6931."],
    why: "Rarer words get a larger idf.",
    watch: "Conventions differ between books.",
    remember: "idf = ln((1+N)/(1+df)) + 1.",
  },
  {
    t: "Lift",
    q: "What does this print?",
    code: py`
n, refund, delay, both = 100, 20, 30, 15
print(round((both / refund) / (delay / n), 2))`,
    opts: [["2.5", true, "Confidence 0.75 divided by the baseline 0.30."], ["0.75", false, "That is the confidence, not the lift."], ["0.15", false, "That is the support."]],
    path: ["Confidence = 15/20 = 0.75.", "P(delay) = 30/100 = 0.30.", "Lift = 0.75 / 0.30 = 2.5."],
    why: "Lift > 1 means the words co-occur more than independence predicts.",
    watch: "Association is not causation.",
    remember: "Lift = confidence / baseline.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Outliers with the IQR rule", "Flag the outlier in 2, 3, 3, 4, 18 and compare the mean with the median.", py`
import numpy as np

x = np.array([2, 3, 3, 4, 18])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
print(x[(x < q1 - 1.5 * iqr) | (x > q3 + 1.5 * iqr)].tolist(), x.mean(), np.median(x))`],
  ["Scale a column two ways", "Min–max and z-score the values 10, 20, 30, 40.", py`
import numpy as np

x = np.array([10.0, 20.0, 30.0, 40.0])
print(((x - x.min()) / (x.max() - x.min())).round(3).tolist(), ((x - x.mean()) / x.std()).round(3).tolist())`],
  ["Gini gain of a split", "Compute the weighted Gini and reduction of the split links ≤ 2.5 on the eight emails.", py`
import numpy as np

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
gini = lambda v: 1 - ((np.bincount(v, minlength=2) / len(v)) ** 2).sum() if len(v) else 0
left, right = y[links <= 2.5], y[links > 2.5]
w = (len(left) * gini(left) + len(right) * gini(right)) / len(y)
print(gini(y), w, gini(y) - w)`],
  ["Naive Bayes by hand", "Classify an email with offer = yes and many links using smoothed counts.", py`
n = 4
p = lambda c: (c + 1) / (n + 2)
spam, normal = 0.5 * p(3) * p(4), 0.5 * p(1) * p(0)
print(round(spam / (spam + normal), 4))`],
  ["kNN from scratch", "Predict the class of Q = (2, 2) with k = 3 using Euclidean distance.", py`
import numpy as np

X = np.array([[1, 1], [2, 1], [1, 2], [4, 4], [5, 4], [4, 5]])
y = np.array([0, 0, 0, 1, 1, 1])
q = np.array([2, 2])
nearest = np.argsort(np.linalg.norm(X - q, axis=1))[:3]
print(nearest.tolist(), int(np.bincount(y[nearest]).argmax()))`],
  ["Confusion matrix metrics", "From TP, FP, FN, TN compute precision, recall, specificity, F1 and accuracy.", py`
tp, fp, fn, tn = 16, 8, 4, 72
print(tp / (tp + fp), tp / (tp + fn), tn / (tn + fp), 2 * tp / (2 * tp + fp + fn), (tp + tn) / 100)`],
  ["ROC points and AUC", "Sweep thresholds over eight scores and count the correctly ordered pairs.", py`
import numpy as np

p = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
for t in sorted(set(p), reverse=True):
    pred = p >= t
    print(t, round(float((pred & (y == 1)).sum() / (y == 1).sum()), 3), round(float((pred & (y == 0)).sum() / (y == 0).sum()), 3))
print((p[y == 1][:, None] > p[y == 0][None]).mean())`],
  ["K-means from scratch", "Run two iterations of k-means on the six delivery points starting at A and C.", py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
c = X[[0, 2]].copy()
for _ in range(2):
    labels = ((X[:, None] - c[None]) ** 2).sum(2).argmin(1)
    c = np.array([X[labels == j].mean(axis=0) for j in range(2)])
print(labels.tolist(), c.round(3).tolist())`],
  ["Hierarchical merge heights", "Single-linkage merge heights for stops 1, 2, 7, 10.", py`
import numpy as np

x = np.array([1.0, 2.0, 7.0, 10.0])
D = np.abs(x[:, None] - x[None])
print(D[0, 1], D[2, 3], min(D[0, 2], D[0, 3], D[1, 2], D[1, 3]))`],
  ["DBSCAN neighbour counts", "Count the ε-neighbours of every point with ε = 1.5 and label core points.", py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8], [5, 1], [2.8, 1]])
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
counts = (D <= 1.5).sum(axis=1)
print(counts.tolist(), (counts >= 3).tolist())`],
  ["PCA with eigenvectors", "Find the explained-variance ratios of a small 2D dataset.", py`
import numpy as np

X = np.array([[2.4, 2], [2.8, 3], [2.6, 2], [12, 12], [11, 10], [12.5, 13], [5, 5], [5.2, 6]])
values = np.linalg.eigvalsh(np.cov((X - X.mean(axis=0)).T, bias=True))[::-1]
print((values / values.sum()).round(4).tolist())`],
  ["TF–IDF search", "Rank three documents for the query 'refund' using normalised TF–IDF and cosine.", py`
import numpy as np

docs = [["refund", "payment"], ["refund", "charge"], ["delivery"]]
vocab = ["refund", "payment", "charge", "delivery"]
df = np.array([sum(w in d for d in docs) for w in vocab])
idf = np.log((1 + len(docs)) / (1 + df)) + 1
M = np.array([[d.count(w) for w in vocab] for d in docs]) * idf
M = M / np.linalg.norm(M, axis=1, keepdims=True)
print((M @ np.array([1.0, 0, 0, 0])).round(4).tolist())`],
  ["SMOTE and log loss", "Interpolate a synthetic point and compute the log loss of four predictions.", py`
import numpy as np

A, B = np.array([1.0, 2.0]), np.array([5.0, 6.0])
print((A + 0.25 * (B - A)).tolist())
y, p = np.array([1, 1, 0, 0]), np.array([0.8, 0.1, 0.2, 0.9])
print(round(float(-(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()), 4))`],
];

export const glance: [string, string][] = [
  ["The workflow", "decide → collect/label → explore → split → prepare (train only) → train → evaluate → test once → monitor"],
  ["Descriptive stats", "mean · median · mode · variance σ² = mean (x − μ)² · IQR = Q3 − Q1 · outlier fences Q1 − 1.5·IQR, Q3 + 1.5·IQR"],
  ["Hypothesis test", "H₀, Hₐ → α → t = (x̄ − μ₀)/(s/√n), df = n − 1 → p < α → reject H₀"],
  ["Scaling", "min–max: a + (x − min)(b − a)/(max − min) · z = (x − μ)/σ — fit on training data"],
  ["Distances", "Euclidean √Σ(x−y)² · Manhattan Σ|x−y| · cosine = x·y/(‖x‖‖y‖)"],
  ["Trees", "Gini = 1 − Σp² · H = −Σp log₂ p · gain = H(parent) − Σ (n_c/n) H(child)"],
  ["Naive Bayes", "P(class | x) ∝ P(class) Π P(x_i | class), P = (count + α)/(total + α·k)"],
  ["SVM", "f(x) = w·x + b · margin 2/‖w‖ · RBF K = exp(−γ‖x − z‖²) · soft margin ½‖w‖² + C Σ hinge"],
  ["Neuron", "z = w·x + b · sigmoid 1/(1+e⁻ᶻ) · ReLU max(0, z) · softmax e^zᵢ/Σe^zⱼ · ∂L/∂w = (p − y)x"],
  ["Classification metrics", "precision TP/(TP+FP) · recall TP/(TP+FN) · specificity TN/(TN+FP) · F1 = 2TP/(2TP+FP+FN)"],
  ["Ranking / probability", "AUC = correctly ordered pos–neg pairs / all pairs · log loss = −mean[y ln p + (1−y) ln(1−p)]"],
  ["PCA", "centre → covariance → eigen → project z = X·w · explained ratio = λᵢ/Σλ"],
  ["k-means", "μⱼ = mean of members · J = Σ‖x − μ‖² · silhouette s = (b − a)/max(a, b)"],
  ["Hierarchical", "single = min · complete = max · average = mean cross distance · Ward ΔJ = nᵤnᵥ/(nᵤ+nᵥ)‖μᵤ − μᵥ‖²"],
  ["DBSCAN", "core: |N_ε(p)| ≥ min_samples (self included) · border: within ε of core · noise: −1"],
  ["Text", "idf = ln((1+N)/(1+df)) + 1 · tf-idf = count × idf, L2-normalised · cosine · precision@k, recall@k"],
  ["Association", "support = both/n · confidence = both/A · lift = confidence/P(B)"],
];

export const lists: [string, string[]][] = [
  ["Habits that prevent ML mistakes", ["Split before any preparation step", "Fit scalers, encoders, imputers and samplers on training rows only", "Compare with a trivial baseline on the metric that matters", "Look at the confusion matrix, not just accuracy", "Compare the training score with the validation score", "Keep the test set for one final check"]],
  ["Before you trust a clustering", ["Features, units and distance chosen on purpose", "Several K or parameter settings tried and recorded", "Stability checked across seeds or resamples", "Noise and cluster sizes reported", "Groups profiled in original units and checked with a domain expert"]],
  ["Explaining your answer in an exam or interview", ["Write the formula, substitute the numbers, calculate, interpret", "Fix the positive class and the axes of a confusion matrix", "State which averaging convention you use (macro, weighted, micro)", "Say what the method learns, how it predicts and what it assumes", "Mention one limitation or common mistake"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["scikit-learn: supervised learning", "https://scikit-learn.org/stable/supervised_learning.html"], ["scikit-learn: clustering", "https://scikit-learn.org/stable/modules/clustering.html"], ["scikit-learn: model evaluation", "https://scikit-learn.org/stable/modules/model_evaluation.html"], ["scikit-learn: decomposition (PCA, SVD)", "https://scikit-learn.org/stable/modules/decomposition.html"]]],
  ["Free books", [["An Introduction to Statistical Learning", "https://www.statlearning.com/"], ["Introduction to Information Retrieval — Manning, Raghavan, Schütze", "https://nlp.stanford.edu/IR-book/"], ["Speech and Language Processing — Jurafsky and Martin", "https://web.stanford.edu/~jurafsky/slp3/"]]],
];
