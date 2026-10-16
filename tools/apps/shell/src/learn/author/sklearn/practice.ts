import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["start", 1, "What is scikit-learn and when do you use it?", "Python's standard library for classic machine learning on tabular data: preprocessing, regression, classification, clustering and evaluation behind one consistent API. For images, text and audio at scale you use a deep-learning framework."],
  ["start", 1, "Which name do you install and which do you import?", "Install {{scikit-learn}}; import {{sklearn}}. {{pip install sklearn}} is a deliberate dead end."],
  ["start", 1, "Describe the estimator API.", "Create a model with its settings, {{fit(X, y)}} to learn, {{predict(X_new)}} to answer and {{score}} to grade. Learned attributes end with an underscore ({{coef_}}, {{intercept_}}). Every model works the same way."],
  ["start", 1, "What shapes must {{X}} and {{y}} have?", "{{X}} is 2D, (n_samples, n_features); {{y}} is 1D, (n_samples,). A single feature needs {{reshape(-1, 1)}} or {{df[[\"col\"]]}}."],
  ["prep", 1, "Why split into train and test sets?", "To estimate performance on data the model has never seen. Scoring on the training data only measures memorisation."],
  ["prep", 2, "What does {{stratify=y}} do?", "It splits each class separately so train and test keep the same class proportions — essential for imbalanced classification."],
  ["prep", 1, "What is data leakage in preprocessing?", "Using information from the test set when preparing the training data, for example fitting a scaler on all rows. The test score becomes optimistic. Fit on train only, transform both."],
  ["prep", 1, "Which models need feature scaling?", "Distance- and gradient-based models: KNN, SVM, logistic regression, k-means, neural networks, PCA. Trees and forests do not."],
  ["prep", 1, "How do you encode a text category?", "One-hot encoding ({{OneHotEncoder}}): one 0/1 column per category, so no false order is implied. Use {{handle_unknown=\"ignore\"}} if new categories may appear."],
  ["prep", 1, "How do you handle missing values?", "{{SimpleImputer}} with the median, mean or most frequent value, learned from the training rows only — ideally inside a Pipeline."],
  ["prep", 2, "What does ColumnTransformer do?", "Applies different transformers to different columns (scale the numbers, one-hot the text) and joins the results into one feature matrix."],
  ["prep", 1, "Why use a Pipeline?", "It chains preprocessing and the model into one object so fit/predict apply the same steps, prevents leakage by fitting steps on training rows only, and can be saved and tuned as a whole."],
  ["regress", 1, "What does linear regression minimise?", "The sum of squared residuals — the vertical distances between the points and the line (ordinary least squares)."],
  ["regress", 1, "How do you read {{coef_}}?", "One number per feature in column order: the change in the prediction when that feature rises by one unit with the others fixed. Scale features to compare them."],
  ["regress", 1, "Explain MAE, RMSE and R².", "MAE is the average absolute error; RMSE is the root of the mean squared error and penalises big misses; R² is the share of variance explained, 1 for perfect, 0 for no better than predicting the mean."],
  ["regress", 2, "How do you fit a curve with a linear model?", "Add polynomial features ({{PolynomialFeatures}}), so the model is linear in the new columns x, x², …"],
  ["regress", 2, "What is the difference between underfitting and overfitting?", "Underfit: too simple, high error on both train and test. Overfit: too flexible, near-zero train error but worse test error."],
  ["regress", 2, "What does Ridge's alpha do?", "It sets the strength of an L2 penalty on the coefficients; larger alpha shrinks them toward zero and reduces overfitting. Lasso (L1) can zero some out."],
  ["classify", 1, "Why is logistic regression called regression but used to classify?", "It models a probability (a sigmoid of a linear score) and then thresholds it, normally at 0.5, to choose a class."],
  ["classify", 1, "{{predict}} versus {{predict_proba}}?", "{{predict}} gives labels; {{predict_proba}} gives one probability per class (rows sum to 1), so you can choose your own threshold or rank cases."],
  ["classify", 1, "How does KNN classify a point and what is the role of k?", "It finds the k nearest training points and takes a majority vote. Small k follows noise; large k smooths and may blur real boundaries."],
  ["classify", 2, "Why does KNN need scaled features?", "It uses distances, so a feature with a large numeric range dominates. Standardise first, inside a Pipeline."],
  ["classify", 1, "How does a decision tree choose a split?", "It tries thresholds on each feature and picks the one that makes the child groups purest (lowest Gini impurity or entropy), then repeats on each child."],
  ["classify", 2, "How do you stop a tree from overfitting?", "Limit {{max_depth}}, require more samples per leaf ({{min_samples_leaf}}), prune, or use an ensemble such as a random forest."],
  ["classify", 2, "Why does a random forest beat one tree?", "Each tree is trained on a bootstrap sample and random feature subsets; their individual errors differ, so the majority vote cancels much of the noise."],
  ["eval", 1, "Why can accuracy be misleading?", "With imbalanced classes a model that always predicts the majority class scores high accuracy while finding none of the rare cases. Compare with a DummyClassifier and use precision, recall or F1."],
  ["eval", 1, "Define precision and recall.", "Precision: of the cases flagged positive, the share that really are. Recall: of the real positives, the share found. In a confusion matrix: TP / (TP + FP) and TP / (TP + FN)."],
  ["eval", 2, "How does the threshold affect precision and recall?", "Raising it flags fewer cases, so precision tends to rise and recall falls; lowering it does the opposite. Choose it from the costs of each mistake."],
  ["eval", 1, "Train accuracy 99%, test accuracy 70%. What does it mean?", "Overfitting: the model memorised training data. Simplify, regularise, get more data, or cross-validate to confirm."],
  ["eval", 1, "How does k-fold cross-validation work?", "Split the data into k folds; train on k−1 and test on the remaining one, k times, so every row is tested once. Average the scores and look at their spread."],
  ["eval", 2, "What does GridSearchCV do and why only on training data?", "It cross-validates every combination of hyper-parameters, picks the best and refits it. Searching on the test set would tune to it and make the final score optimistic."],
  ["unsup", 1, "Describe k-means.", "Pick k centres; assign each point to the nearest centre; move each centre to the mean of its points; repeat until stable."],
  ["unsup", 2, "How do you choose k?", "Look for the elbow in inertia versus k, check silhouette scores, and use domain meaning. Inertia always falls as k grows, so the lowest value is not the answer."],
  ["unsup", 2, "What does PCA do?", "It finds orthogonal directions of maximum variance and projects the data onto the first few, reducing columns while keeping most of the variation. Scale first; {{explained_variance_ratio_}} says how much is kept."],
  ["ship", 2, "How do you tune a parameter of a step inside a Pipeline?", "Use {{step__parameter}}, for example {{knn__n_neighbors}}, in {{set_params}} or as a key in the GridSearchCV grid."],
  ["ship", 1, "How do you save a trained model?", "{{joblib.dump(pipeline, \"model.joblib\")}}, then {{joblib.load}}. Save the whole Pipeline, pin the library version, and only load trusted files."],
  ["ship", 1, "What causes NotFittedError?", "Calling {{predict}} or {{transform}} on an estimator that has not been fitted yet."],
  ["ship", 1, "How do you make results reproducible?", "Set {{random_state}} everywhere randomness is used (split, forest, k-means), fix the data and code, and record library versions."],
  ["ship", 2, "A model scores 99% on the first try. What do you check?", "Leakage (a column derived from the target, preprocessing fitted on all data), whether the test set was touched, a dummy baseline, and whether train and cross-validation scores agree."],
];

export const drills: DrillDef[] = [
  {
    t: "Split sizes",
    q: "What does this print?",
    code: py`
import numpy as np
from sklearn.model_selection import train_test_split
X = np.arange(20).reshape(10, 2)
y = np.arange(10)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)
print(len(X_train), len(X_test))`,
    opts: [["7 3", true, "30% of 10 rows is 3 for the test set; 7 remain."], ["3 7", false, "The training part comes first and is the larger one."], ["10 10", false, "The rows are divided, not copied."]],
    path: ["10 rows, test_size = 0.3 → 3 test rows.", "The other 7 rows train the model.", "Order returned: X_train, X_test, y_train, y_test."],
    why: "test_size is the fraction held out.",
    watch: "The return order is train first, then test.",
    remember: "Four arrays out, in a fixed order.",
  },
  {
    t: "What the scaler learned",
    q: "What does this print?",
    code: py`
from sklearn.preprocessing import StandardScaler
sc = StandardScaler().fit([[2], [4], [6]])
print(sc.mean_.tolist(), sc.transform([[4]]).tolist())`,
    opts: [["[4.0] [[0.0]]", true, "The mean is 4, and 4 is exactly the mean, so its scaled value is 0."], ["[4.0] [[4.0]]", false, "transform subtracts the mean first."], ["[2.0] [[1.0]]", false, "The mean of 2, 4, 6 is 4."]],
    path: ["fit learns mean_ = (2 + 4 + 6) / 3 = 4.", "transform computes (4 − 4) / std = 0."],
    why: "Scaled value = (x − mean) / std.",
    watch: "Fit on training data only.",
    remember: "Learned values end in an underscore.",
  },
  {
    t: "Predicting with a fitted line",
    q: "What does this print?",
    code: py`
from sklearn.linear_model import LinearRegression
model = LinearRegression().fit([[0], [1], [2]], [1, 3, 5])
print(round(float(model.predict([[3]])[0]), 2))`,
    opts: [["7.0", true, "The data follow y = 2x + 1, so x = 3 gives 7."], ["5.0", false, "That is the last training value."], ["6.0", false, "The line has slope 2, not 5/3."]],
    path: ["Points (0,1), (1,3), (2,5) lie exactly on a line.", "Slope = 2, intercept = 1.", "x = 3 → 2·3 + 1 = 7."],
    why: "A fitted line extends beyond the training points.",
    watch: "Predictions far outside the data are unreliable.",
    remember: "y = coef·x + intercept.",
  },
  {
    t: "The 1D input error",
    q: "What happens here?",
    code: py`
from sklearn.linear_model import LinearRegression
try:
    LinearRegression().fit([1, 2, 3], [1, 2, 3])
    print("fitted")
except ValueError:
    print("ValueError")`,
    opts: [["ValueError", true, "X must be 2D: one row per example."], ["fitted", false, "A flat list is not accepted as features."], ["TypeError", false, "scikit-learn raises ValueError for bad shapes."]],
    path: ["X = [1, 2, 3] has one dimension.", "scikit-learn expects (n_samples, n_features).", "It raises ValueError (\"Expected 2D array, got 1D array\")."],
    why: "Features must be a 2D table.",
    watch: "Fix with reshape(-1, 1) or df[[\"col\"]].",
    remember: "X is 2D, y is 1D.",
  },
  {
    t: "predict_proba shape",
    q: "What does this print?",
    code: py`
from sklearn.linear_model import LogisticRegression
X = [[0], [1], [4], [5], [8], [9]]
y = [0, 0, 1, 1, 2, 2]
clf = LogisticRegression().fit(X, y)
print(clf.predict_proba([[1], [5]]).shape)`,
    opts: [["(2, 3)", true, "2 rows asked about, one probability per each of the 3 classes."], ["(3, 2)", false, "Rows come first: one row per sample."], ["(2,)", false, "That would be predict, not predict_proba."]],
    path: ["Two samples to predict.", "Three classes (0, 1, 2) → three probabilities each.", "Shape = (n_samples, n_classes) = (2, 3)."],
    why: "predict_proba has one column per class.",
    watch: "Columns follow clf.classes_.",
    remember: "(samples, classes).",
  },
  {
    t: "One-hot width",
    q: "What is the shape of the encoded array?",
    code: py`
from sklearn.preprocessing import OneHotEncoder
out = OneHotEncoder(sparse_output=False).fit_transform([["a"], ["b"], ["a"], ["c"]])
print(out.shape)`,
    opts: [["(4, 3)", true, "Four rows, one column for each of the 3 categories a, b, c."], ["(4, 1)", false, "That would be label encoding."], ["(3, 4)", false, "Rows stay the rows."]],
    path: ["4 samples.", "3 distinct categories: a, b, c.", "One 0/1 column per category → (4, 3)."],
    why: "One-hot width = number of categories.",
    watch: "Many categories mean many columns.",
    remember: "One column per category.",
  },
  {
    t: "Mean imputation",
    q: "What does this print?",
    code: py`
import numpy as np
from sklearn.impute import SimpleImputer
X = np.array([[1.0], [np.nan], [5.0]])
print(SimpleImputer(strategy="mean").fit_transform(X).ravel().tolist())`,
    opts: [["[1.0, 3.0, 5.0]", true, "The mean of the known values 1 and 5 is 3."], ["[1.0, 0.0, 5.0]", false, "The default strategy is mean, not constant 0."], ["[1.0, 2.0, 5.0]", false, "NaN is not counted as a value."]],
    path: ["Known values: 1 and 5.", "mean = (1 + 5) / 2 = 3.", "The NaN becomes 3."],
    why: "The imputer learns a statistic and fills gaps with it.",
    watch: "Fit on training data only.",
    remember: "Statistics ignore the missing values.",
  },
  {
    t: "k changes the vote",
    q: "What does this print?",
    code: py`
from sklearn.neighbors import KNeighborsClassifier
X = [[0], [1], [2], [10]]
y = [0, 0, 0, 1]
k1 = KNeighborsClassifier(n_neighbors=1).fit(X, y)
k3 = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print(k1.predict([[8]]).tolist(), k3.predict([[8]]).tolist())`,
    opts: [["[1] [0]", true, "k=1: nearest is 10 (class 1). k=3: neighbours 10, 2, 1 vote 1, 0, 0 → class 0."], ["[1] [1]", false, "With k=3 the two class-0 points outvote the single class-1 point."], ["[0] [0]", false, "With k=1 the closest point to 8 is 10, which is class 1."]],
    path: ["Distances from 8: 10 → 2, 2 → 6, 1 → 7, 0 → 8.", "k=1 takes only the nearest: class 1.", "k=3 takes 10, 2, 1: votes 1, 0, 0 → class 0."],
    why: "More neighbours means a smoother vote.",
    watch: "Use an odd k for two classes to avoid ties.",
    remember: "k=1 follows every point.",
  },
  {
    t: "Precision and recall",
    q: "What does this print?",
    code: py`
from sklearn.metrics import precision_score, recall_score
y_true = [1, 0, 1, 1]
y_pred = [1, 1, 0, 0]
print(precision_score(y_true, y_pred), round(recall_score(y_true, y_pred), 2))`,
    opts: [["0.5 0.33", true, "TP = 1, FP = 1, FN = 2 → precision 1/2, recall 1/3."], ["0.33 0.5", false, "Those are swapped."], ["0.5 0.5", false, "Recall divides by the 3 real positives, not by 2."]],
    path: ["Predicted positive: positions 0 and 1; only position 0 is truly positive → TP = 1, FP = 1.", "Real positives: positions 0, 2, 3; found only 1 → FN = 2.", "precision = 1/2, recall = 1/3 ≈ 0.33."],
    why: "Precision divides by predicted positives; recall by real positives.",
    watch: "Do not mix the two up.",
    remember: "Precision = found right / flagged; recall = found / real.",
  },
  {
    t: "Number of CV scores",
    q: "What does this print?",
    code: py`
from sklearn.dummy import DummyClassifier
from sklearn.model_selection import cross_val_score
X = [[i] for i in range(10)]
y = [0] * 5 + [1] * 5
print(len(cross_val_score(DummyClassifier(), X, y, cv=5)))`,
    opts: [["5", true, "cv=5 means five folds, one score each."], ["1", false, "cross_val_score returns a score per fold, not an average."], ["10", false, "The number of scores equals the number of folds, not rows."]],
    path: ["cv=5 splits the data into 5 folds.", "Each fold is the test set once.", "Five rounds → five scores."],
    why: "One score per fold.",
    watch: "Average them with .mean().",
    remember: "len(scores) == cv.",
  },
  {
    t: "Pipeline step names",
    q: "What does this print?",
    code: py`
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
pipe = make_pipeline(StandardScaler(), LogisticRegression())
print(list(pipe.named_steps))`,
    opts: [["['standardscaler', 'logisticregression']", true, "make_pipeline names each step by its lower-cased class name."], ["['scale', 'model']", false, "Those are names you choose with Pipeline([...]), not make_pipeline."], ["['step1', 'step2']", false, "Names come from the class names."]],
    path: ["make_pipeline builds names automatically.", "Class name lower-cased: standardscaler, logisticregression."],
    why: "make_pipeline auto-names steps.",
    watch: "Grid keys use these names: logisticregression__C.",
    remember: "Use Pipeline([...]) to choose names.",
  },
  {
    t: "R² of the mean",
    q: "What does this print?",
    code: py`
from sklearn.metrics import r2_score
print(r2_score([1, 2, 3], [2, 2, 2]))`,
    opts: [["0.0", true, "Predicting the mean (2) every time is the baseline R² = 0."], ["1.0", false, "1.0 needs every prediction to be exact."], ["-1.0", false, "Negative values mean worse than the mean baseline."]],
    path: ["The mean of the true values is 2.", "The predictions all equal the mean.", "R² compares with that baseline → 0."],
    why: "R² = 1 − error / error of the mean predictor.",
    watch: "R² can be negative for bad models.",
    remember: "0 means no better than the mean.",
  },
];

export const codeLab: [string, string, string][] = [
  ["First regression", "Fit a line to hours studied vs marks and predict the marks for 6 hours.", py`
from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4], [5]]
y = [35, 45, 52, 61, 70]
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(round(float(model.predict([[6]])[0]), 1))`],
  ["Split and shape check", "Split iris 80/20 with a fixed seed and print the four shapes.", py`
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(X_train.shape, X_test.shape, y_train.shape, y_test.shape)`],
  ["Scale without leaking", "Fit a StandardScaler on the training rows only, then scale the test rows.", py`
from sklearn.preprocessing import StandardScaler

train = [[10.0], [20.0], [30.0]]
test = [[40.0]]
sc = StandardScaler().fit(train)
print(sc.transform(test).round(2).tolist())`],
  ["Encode and impute", "One-hot encode a city column and fill a missing age with the median.", py`
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder

print(OneHotEncoder(sparse_output=False).fit_transform([["Pune"], ["Goa"], ["Pune"]]).tolist())
print(SimpleImputer(strategy="median").fit_transform(np.array([[20.0], [np.nan], [40.0], [60.0]])).ravel().tolist())`],
  ["A mixed-type pipeline", "Build a ColumnTransformer plus LogisticRegression pipeline and score it.", py`
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({"age": [22, 25, 47, 52, 46, 56], "city": ["A", "B", "A", "B", "A", "B"], "buy": [0, 0, 1, 1, 1, 1]})
pre = ColumnTransformer([("num", StandardScaler(), ["age"]), ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"])])
pipe = Pipeline([("pre", pre), ("clf", LogisticRegression())])
pipe.fit(df[["age", "city"]], df["buy"])
print(pipe.score(df[["age", "city"]], df["buy"]))`],
  ["Regression metrics", "Compute MAE, RMSE and R² for a set of predictions.", py`
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_true = [10, 20, 30, 40]
y_pred = [12, 18, 33, 41]
print(mean_absolute_error(y_true, y_pred), round(mean_squared_error(y_true, y_pred) ** 0.5, 3), round(r2_score(y_true, y_pred), 3))`],
  ["Compare with a baseline", "Score a KNN classifier and a DummyClassifier on the same split.", py`
from sklearn.datasets import load_iris
from sklearn.dummy import DummyClassifier
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print(round(DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr).score(X_te, y_te), 2))
print(KNeighborsClassifier().fit(X_tr, y_tr).score(X_te, y_te) > 0.8)`],
  ["Tree depth versus score", "Compare train and test accuracy for several tree depths and watch the gap.", py`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)
for depth in (1, 3, None):
    t = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_tr, y_tr)
    print(depth, round(t.score(X_tr, y_tr), 3), round(t.score(X_te, y_te), 3))`],
  ["Cross-validate two models", "Compare logistic regression and a random forest with 5-fold cross-validation.", py`
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
for name, model in [("logistic", make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))), ("forest", RandomForestClassifier(random_state=0))]:
    scores = cross_val_score(model, X, y, cv=5)
    print(name, round(scores.mean(), 3), round(scores.std(), 3))`],
  ["Grid search a pipeline", "Tune the number of neighbours of a scaled KNN with GridSearchCV.", py`
from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_iris(return_X_y=True)
pipe = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])
gs = GridSearchCV(pipe, {"knn__n_neighbors": [1, 3, 5, 7, 9]}, cv=5).fit(X, y)
print(gs.best_params_, round(gs.best_score_, 3))`],
  ["Cluster and inspect", "Run k-means with k = 3 on iris and compare the cluster sizes with the real species counts.", py`
import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print(sorted(np.bincount(km.labels_).tolist()), np.bincount(y).tolist())`],
  ["Reduce with PCA", "Project iris onto two components and print how much variance they keep.", py`
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X, _ = load_iris(return_X_y=True)
Z = PCA(n_components=2).fit_transform(StandardScaler().fit_transform(X))
print(Z.shape)`],
];

export const glance: [string, string][] = [
  ["The pattern", "model = Model(settings) → model.fit(X, y) → model.predict(X_new) → model.score(X, y)"],
  ["Shapes", "X: (n_samples, n_features) 2D · y: (n_samples,) 1D"],
  ["Split", "train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)"],
  ["Preprocess", "StandardScaler · OneHotEncoder · SimpleImputer — fit on train only"],
  ["Combine", "ColumnTransformer([(name, transformer, columns)]) · Pipeline([(name, step)])"],
  ["Regression", "LinearRegression · Ridge · PolynomialFeatures · MAE / RMSE / R²"],
  ["Classification", "LogisticRegression · KNeighbors · DecisionTree · RandomForest"],
  ["Probabilities", "predict_proba → (n_samples, n_classes), rows sum to 1"],
  ["Metrics", "accuracy · precision = TP/(TP+FP) · recall = TP/(TP+FN) · F1 · confusion_matrix"],
  ["Validation", "cross_val_score(model, X, y, cv=5) · GridSearchCV(pipe, {\"step__param\": […]})"],
  ["Unsupervised", "KMeans(n_clusters=k) · inertia_ · PCA(n_components=2)"],
  ["Ship it", "joblib.dump(pipe, file) · random_state everywhere · pin versions"],
];

export const lists: [string, string[]][] = [
  ["Habits that prevent leakage", ["Split before any preprocessing", "Put every learned step inside a Pipeline", "Never call fit or fit_transform on the test set", "Look at the test set once, at the end", "Tune with cross-validation on training data only"]],
  ["Before you trust a score", ["Compare with a DummyClassifier or the mean predictor", "Check train score against test score", "Use a metric that matches the cost of mistakes", "Look at the confusion matrix, not just accuracy", "Check cross-validation spread", "Suspect any score that looks too good"]],
  ["Explaining a model in an interview", ["State the target, the features and the metric", "Describe how you split and what you fitted on which part", "Name the baseline you beat and by how much", "Say how you prevented overfitting", "Say what you would monitor after deployment"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["scikit-learn user guide", "https://scikit-learn.org/stable/user_guide.html"], ["Getting started", "https://scikit-learn.org/stable/getting_started.html"], ["Choosing the right estimator", "https://scikit-learn.org/stable/machine_learning_map.html"], ["Common pitfalls and recommended practices", "https://scikit-learn.org/stable/common_pitfalls.html"]]],
  ["Practise and explore", [["scikit-learn examples gallery", "https://scikit-learn.org/stable/auto_examples/index.html"], ["Kaggle Learn: Intro to Machine Learning", "https://www.kaggle.com/learn/intro-to-machine-learning"]]],
  ["Books worth owning", [["Hands-On Machine Learning — Aurélien Géron", "book"], ["Introduction to Machine Learning with Python — Müller and Guido", "book"]]],
];
