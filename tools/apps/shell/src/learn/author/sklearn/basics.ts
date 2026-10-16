import { L, P, cells, compare, flow, seq } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/*
 * Outputs here are written by hand (scikit-learn was not installed when this track was authored), so every
 * example uses tiny, exact data whose result can be derived independently — and prints rounded scalars or
 * .tolist(), never raw array formatting. Re-run them with real scikit-learn when it is available.
 */

/* ------------------------------------------------------------------ */
export const start: ConceptDef[] = [
  {
    t: "What scikit-learn is for",
    lv: 1,
    s: `scikit-learn (imported as {{sklearn}}) is Python's standard library for classic machine learning: regression, classification, clustering, preprocessing and evaluation, all behind one consistent interface. It works on tables of numbers (NumPy arrays or pandas DataFrames) and is the right first tool for tabular data. Deep learning on images, text or audio is the job of PyTorch or TensorFlow instead.`,
    r: `For spreadsheet-style problems — churn, price, fraud, risk scores — a well-prepared scikit-learn model is often as good as anything fancier, and far easier to explain and maintain.`,
    i: `When would you choose scikit-learn over a deep-learning framework?`,
    v: compare("Each library has a job; scikit-learn covers classic ML on tables.", ["scikit-learn", "pandas", "PyTorch / TensorFlow"], [
      ["Main job", "fit models, predict, evaluate", "load, clean, reshape tables", "build and train neural networks"],
      ["Works on", "arrays and DataFrames of numbers", "tables with mixed types", "tensors, often on a GPU"],
      ["Best for", "tabular data, small to medium size", "preparing data before modelling", "images, text, audio, huge data"],
      ["You write", "3 lines: fit, predict, score", "filters, groupbys, joins", "layers, losses, training loops"],
    ], 0),
  },
  {
    t: "Install and import: two different names",
    lv: 1,
    s: `The package you install is called {{scikit-learn}} but the module you import is {{sklearn}}. Install once with {{python -m pip install scikit-learn}} into the same environment your code runs in, then import only the pieces you need: {{from sklearn.linear_model import LinearRegression}}. Imports are organised by purpose — {{linear_model}}, {{tree}}, {{ensemble}}, {{preprocessing}}, {{model_selection}}, {{metrics}}.`,
    r: `Typing {{pip install sklearn}} fails (that name is a deliberate dead end). Use scikit-learn for the install and sklearn for the import.`,
    i: `Why does "import scikit-learn" fail even though scikit-learn is installed?`,
    v: flow("Install under one name, import under another.", "row",
      ["pip install scikit-learn|the package name|w", "import sklearn|the module name|g", "from sklearn.tree import …|choose by purpose|g", "model.fit(X, y)|start learning|g"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["Install the package called scikit-learn.", "In code the module is sklearn; import only what you need from its sub-modules.", "Every model then follows the same fit / predict pattern."]),
  },
  {
    t: "The estimator API: fit, predict, score",
    lv: 1,
    s: `Every scikit-learn model — a line fitter, a tree, a forest — is used the same way. Create it with its settings ({{model = LinearRegression()}}), teach it with {{model.fit(X, y)}}, ask it for answers with {{model.predict(X_new)}} and grade it with {{model.score(X, y)}}. Whatever the model learns is stored in attributes ending in an underscore, such as {{coef_}} and {{intercept_}}. Learn this pattern once and you can use 100 models.`,
    r: `Swapping a model is a one-line change because the interface never varies. That is what makes experiments fast.`,
    i: `What do the trailing underscores in coef_ and intercept_ mean?`,
    c: py`
from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4]]
y = [3, 5, 7, 9]

model = LinearRegression()
model.fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(model.predict([[5]]).round(2).tolist())
print(round(model.score(X, y), 2))`,
    o: `2.0 1.0
[11.0]
1.0`,
    v: seq("Create, fit, predict, score — the same four moves for every estimator.", ["Your code", "Estimator (the model)"], [
      [0, 1, "model = LinearRegression()", "A new, untrained model with its settings."],
      [0, 1, "model.fit(X, y)", "The model studies the examples and learns coef_ and intercept_."],
      [1, 0, "learned numbers (coef_ = 2, intercept_ = 1)", "Everything learned ends in an underscore.", "r"],
      [0, 1, "model.predict([[5]])", "New input, no answer given."],
      [1, 0, "[11]  (2 × 5 + 1)", "", "r"],
      [0, 1, "model.score(X, y)", "How good is the model on this data?"],
      [1, 0, "1.0  (R² for regression, accuracy for classification)", "", "r"],
    ]),
  },
  {
    t: "X and y: shapes that scikit-learn expects",
    lv: 1,
    s: `{{X}} (the features) must be 2D: one row per example, one column per feature, shape {{(n_samples, n_features)}}. {{y}} (the answers) is 1D with one value per row, shape {{(n_samples,)}}. A single feature must still be a column: use {{X.reshape(-1, 1)}} or {{df[["age"]]}} with double brackets. A 1D {{X}} raises "Expected 2D array, got 1D array".`,
    r: `Shape errors are the most common first-day error. Print {{X.shape}} and {{y.shape}} before every fit.`,
    i: `Why does fit fail with "Expected 2D array" and how do you fix it?`,
    c: py`
import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1, 5], [2, 6], [3, 7]])
y = np.array([10, 20, 30])
print(X.shape, y.shape)
try:
    LinearRegression().fit(np.array([1, 2, 3]), y)
except ValueError:
    print("X must be 2D")`,
    o: `(3, 2) (3,)
X must be 2D`,
    v: cells("X is a table (rows × features); y is one answer per row.", [P("X row 0", ["1", "5"]), P("X row 1", ["2", "6"]), P("X row 2", ["3", "7"]), L("y", ["10", "20", "30"], "pos")], [
      ["Three examples, two features each. X.shape = (3, 2); y.shape = (3,)."],
      ["Each row of X is one example…", [[0, 0, 1]]],
      ["…and has exactly one answer in y — same number of rows.", [[0, 0, 1], [3, 0, 0]]],
      ["Columns are features: first column = 1, 2, 3 and second = 5, 6, 7.", [[0, 0, 0], [1, 0, 0], [2, 0, 0]]],
    ]),
  },
  {
    t: "Built-in datasets: the iris example",
    lv: 1,
    s: `scikit-learn ships small practice datasets. {{load_iris()}} returns an object with {{data}} (the features X), {{target}} (the labels y as 0, 1, 2), {{feature_names}} and {{target_names}}. Iris has 150 flowers, four measurements each, three species, 50 of each. Datasets this size let you test an idea in seconds before using real data.`,
    r: `Use a toy dataset to check your pipeline code works end to end, then swap in your own data with the same shapes.`,
    i: `What is in the iris dataset and why is it used for teaching?`,
    c: py`
import numpy as np
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target
print(X.shape, y.shape)
print(iris.target_names.tolist())
print(np.bincount(y).tolist())
print(iris.feature_names[0])`,
    o: `(150, 4) (150,)
['setosa', 'versicolor', 'virginica']
[50, 50, 50]
sepal length (cm)`,
    v: compare("The attributes of a loaded dataset.", ["What it holds"], [
      ["iris.data", "X: 150 rows × 4 measurements"],
      ["iris.target", "y: 150 labels, 0 / 1 / 2"],
      ["iris.feature_names", "sepal length, sepal width, petal length, petal width (cm)"],
      ["iris.target_names", "setosa, versicolor, virginica"],
    ]),
  },
  {
    t: "The five-step recipe",
    lv: 1,
    s: `Almost every supervised-learning project follows the same five steps: (1) split the data into train and test, (2) preprocess — scale, encode, fill gaps — learning those settings from the training part only, (3) fit a model on the training part, (4) predict on the test part, (5) evaluate with a suitable metric. The rest of this track is these five steps in detail.`,
    r: `If you can say these five steps and name what leaks when one is skipped, you can design an honest experiment.`,
    i: `Describe the steps of a machine-learning experiment and where data leakage can happen.`,
    v: flow("Split first, learn everything from the training part, judge on the test part.", "row",
      ["1. Split|train_test_split|i", "2. Preprocess|fit on train only|w", "3. Fit|model.fit(X_train, y_train)|g", "4. Predict|model.predict(X_test)|g", "5. Evaluate|metrics vs y_test|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["Hold some rows back before looking at anything, then scale, encode and impute using only the training rows.", "Learn the model from the training rows.", "Ask the model about rows it has never seen.", "Compare predictions with the true answers."]),
  },
];

/* ------------------------------------------------------------------ */
export const prep: ConceptDef[] = [
  {
    t: "train_test_split",
    lv: 1,
    s: `{{train_test_split(X, y, test_size=0.25, random_state=42)}} shuffles the rows and cuts them into a training part (to learn from) and a test part (to grade on). It returns four pieces in a fixed order: {{X_train, X_test, y_train, y_test}}. {{random_state}} fixes the shuffle so you get the same split every run. Never train and grade on the same rows — the score would only measure memory.`,
    r: `The test set is a stand-in for the future. Look at it once, at the end.`,
    i: `Why do you hold out a test set, and what does random_state do?`,
    c: py`
import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(16).reshape(8, 2)
y = np.arange(8)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
print(X_train.shape, X_test.shape)
print(len(y_train), len(y_test))
print(sorted(np.concatenate([y_train, y_test]).tolist()) == list(range(8)))`,
    o: `(6, 2) (2, 2)
6 2
True`,
    v: cells("The rows are shuffled, then split: every row lands in exactly one part.", [P("8 rows", ["row", "row", "row", "row", "row", "row", "row", "row"])], [
      ["Eight examples, in the order they arrived."],
      ["Shuffle (fixed by random_state) and cut at 75%: six rows for training…", [[0, 0, 5]], [P("TRAIN (6)", ["row", "row", "row", "row", "row", "row"]), P("TEST (2)", ["row", "row"])]],
      ["…and two rows locked away for the final test. X_train.shape = (6, 2), X_test.shape = (2, 2).", [[1, 0, 1]]],
    ]),
  },
  {
    t: "Stratified splits keep class proportions",
    lv: 2,
    s: `A random split can, by bad luck, put too few rows of a rare class in the test set. {{train_test_split(…, stratify=y)}} splits each class separately so the train and test parts keep the same proportions. With a 50/50 label and {{test_size=0.4}}, the test set gets two of each class. Use it for classification, especially with imbalanced classes.`,
    r: `With 5% positives, an unstratified test set of 20 rows may contain no positives at all — a useless evaluation.`,
    i: `When would you pass stratify=y to train_test_split?`,
    c: py`
import numpy as np
from sklearn.model_selection import train_test_split

y = np.array([0] * 5 + [1] * 5)
X = np.arange(10).reshape(-1, 1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.4, stratify=y, random_state=0)
print(np.bincount(y_te).tolist(), np.bincount(y_tr).tolist())`,
    o: `[2, 2] [3, 3]`,
    v: cells("Each class is cut separately, so both parts stay balanced.", [P("all y", ["0", "0", "0", "0", "0", "1", "1", "1", "1", "1"])], [
      ["Ten labels: five of each class."],
      ["stratify=y cuts class 0 and class 1 in the same proportion…", [[0, 0, 5], [1, 0, 3]], [P("train y", ["0", "0", "0", "1", "1", "1"]), P("test y", ["0", "0", "1", "1"])]],
      ["…so the test set has two of each class — exactly the original 50/50 mix.", [[1, 0, 3]]],
    ]),
  },
  {
    t: "Scaling features with StandardScaler",
    lv: 1,
    s: `Many models compare or add features, so a column in the thousands overwhelms one in single digits. {{StandardScaler}} rescales each column to mean 0 and spread 1: {{(x − mean) / std}}. The pattern is {{scaler.fit(X_train)}} to learn the mean and std (stored as {{mean_}} and {{scale_}}), then {{scaler.transform(X)}} to apply them. {{MinMaxScaler}} squeezes values into 0–1 instead.`,
    r: `KNN, SVM, logistic regression and neural networks all need scaled features. Trees do not.`,
    i: `What does StandardScaler learn during fit, and which models need scaling?`,
    c: py`
from sklearn.preprocessing import StandardScaler

X = [[10.0], [20.0], [30.0], [40.0]]
sc = StandardScaler().fit(X)
print(sc.mean_.tolist(), sc.scale_.round(2).tolist())
print(sc.transform(X).round(2).ravel().tolist())`,
    o: `[25.0] [11.18]
[-1.34, -0.45, 0.45, 1.34]`,
    v: cells("fit learns mean 25 and std 11.18; transform applies (x − 25) / 11.18 to every value.", [L("x", ["10", "20", "30", "40"], "pos")], [
      ["Four values with mean 25."],
      ["Subtract the mean (25): −15, −5, +5, +15.", [[0, 0, 3]], [L("x", ["10", "20", "30", "40"], "pos"), P("x − 25", ["-15", "-5", "5", "15"])]],
      ["Divide by the std (11.18): the column now has mean 0 and spread 1.", [[1, 0, 3]], [L("x", ["10", "20", "30", "40"], "pos"), P("x − 25", ["-15", "-5", "5", "15"]), P("scaled", ["-1.34", "-0.45", "0.45", "1.34"])]],
    ]),
  },
  {
    t: "Fit on train only: avoiding leakage",
    lv: 2,
    s: `The scaler's mean and std must be learned from the training rows only, then reused on the test rows. If you fit on all rows, information about the test set seeps into training — the test score becomes optimistic. In code: {{fit}} (or {{fit_transform}}) on train; only {{transform}} on test. Here the same test value 25 is scaled to 0.0 with the training statistics, but the leaky scaler would give a different number.`,
    r: `Leakage is the number-one reason a model that scored 95% in a notebook fails in production. Pipelines (later) make the mistake impossible.`,
    i: `Why must you never call fit_transform on the test set?`,
    c: py`
from sklearn.preprocessing import StandardScaler

train = [[10.0], [20.0], [30.0], [40.0]]
test = [[25.0], [50.0]]
good = StandardScaler().fit(train)
print(good.transform(test).round(2).ravel().tolist())
leaky = StandardScaler().fit(train + test)
print(leaky.transform(test).round(2).ravel().tolist())`,
    o: `[0.0, 2.24]
[-0.32, 1.6]`,
    v: compare("Same data, two ways to scale — only one is honest.", ["Correct", "Leaky"], [
      ["fit on", "training rows only", "train + test together"],
      ["Test value 25 becomes", "0.0 (the training mean is 25)", "−0.32 (mean shifted by the test rows)"],
      ["Test value 50 becomes", "2.24", "1.6"],
      ["Test score is", "an honest estimate", "too optimistic"],
    ], 0),
  },
  {
    t: "Encoding categories: OneHotEncoder",
    lv: 1,
    s: `Models need numbers, so a text column such as city must be encoded. {{OneHotEncoder}} makes one 0/1 column per category, in sorted order, so no false order like Delhi < Goa < Pune is implied. Learn the categories with {{fit}}, apply with {{transform}}. By default an unseen category at prediction time raises an error — set {{handle_unknown="ignore"}} to output all zeros instead. Pass {{sparse_output=False}} to get a normal array.`,
    r: `New cities will appear after you train. Decide on purpose whether that should crash or be ignored.`,
    i: `Why one-hot encode instead of assigning 0, 1, 2 to cities?`,
    c: py`
from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(sparse_output=False)
X = [["Pune"], ["Delhi"], ["Pune"], ["Goa"]]
out = enc.fit_transform(X)
print(enc.categories_[0].tolist())
print(out.tolist())
print(enc.transform([["Delhi"]]).tolist())`,
    o: `['Delhi', 'Goa', 'Pune']
[[0.0, 0.0, 1.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]]
[[1.0, 0.0, 0.0]]`,
    v: cells("One column per category (Delhi, Goa, Pune); a 1 marks the row's city.", [P("city", ["Pune", "Delhi", "Pune", "Goa"])], [
      ["A text column — unusable by a model."],
      ["fit learns the sorted categories: Delhi, Goa, Pune.", [[0, 0, 3]], [P("city", ["Pune", "Delhi", "Pune", "Goa"]), P("Delhi", ["0", "1", "0", "0"]), P("Goa", ["0", "0", "0", "1"]), P("Pune", ["1", "0", "1", "0"])]],
      ["Each row has exactly one 1: Pune → (0, 0, 1), Delhi → (1, 0, 0).", [[0, 0, 0], [3, 0, 0], [2, 1, 1]]],
    ]),
  },
  {
    t: "Missing values: SimpleImputer",
    lv: 1,
    s: `Most scikit-learn models stop with an error if the data contains {{NaN}}. {{SimpleImputer(strategy="median")}} learns a fill value per column from the training data ({{statistics_}}) and fills gaps with it; other strategies are {{"mean"}}, {{"most_frequent"}} (for categories) and {{"constant"}}. The median is safer than the mean when values are skewed. Add {{add_indicator=True}} to also record which values were missing.`,
    r: `Fill from the training rows only; the test rows then get the same number.`,
    i: `Which statistic would you impute a skewed income column with, and why?`,
    c: py`
import numpy as np
from sklearn.impute import SimpleImputer

X = np.array([[1.0], [np.nan], [3.0], [5.0]])
imp = SimpleImputer(strategy="median").fit(X)
print(imp.statistics_.tolist())
print(imp.transform(X).ravel().tolist())`,
    o: `[3.0]
[1.0, 3.0, 3.0, 5.0]`,
    v: cells("The median of the known values (1, 3, 5) is 3, and it replaces the gap.", [L("before", ["1", "NaN", "3", "5"], "pos")], [
      ["One value is missing."],
      ["fit computes the median of the known values: 3.", [[0, 0, 0], [0, 2, 3]]],
      ["transform puts it in the gap.", [[0, 1, 1]], [L("before", ["1", "NaN", "3", "5"], "pos"), P("after", ["1", "3", "3", "5"])]],
    ]),
  },
  {
    t: "ColumnTransformer: different steps for different columns",
    lv: 2,
    s: `A real table mixes number columns and text columns that need different treatment. {{ColumnTransformer}} takes a list of {{(name, transformer, columns)}} and applies each to its columns, then joins the results side by side: scale {{age}}, one-hot {{city}}. Use it on a pandas DataFrame so you can name columns instead of counting positions.`,
    r: `One ColumnTransformer replaces a pile of manual column surgery and makes the preprocessing a single reusable object.`,
    i: `How do you scale the numeric columns and one-hot encode the text columns in one step?`,
    c: py`
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({"age": [20, 30, 40], "city": ["Pune", "Delhi", "Pune"]})
ct = ColumnTransformer([
    ("num", StandardScaler(), ["age"]),
    ("cat", OneHotEncoder(sparse_output=False), ["city"]),
])
out = ct.fit_transform(df)
print(out.shape)
print(out.round(2).tolist())`,
    o: `(3, 3)
[[-1.22, 0.0, 1.0], [0.0, 1.0, 0.0], [1.22, 0.0, 1.0]]`,
    v: flow("Each column group takes its own route, then the results are joined.", "row",
      ["DataFrame|age, city|i", "StandardScaler|age → 1 column|g", "OneHotEncoder|city → 2 columns|g", "Feature matrix|3 columns: age, Delhi, Pune|g"],
      [[0, 1], [0, 2], [1, 3], [2, 3]], undefined,
      ["The raw table has a number column and a text column.", "Numbers go to the scaler: −1.22, 0, 1.22.", "Text goes to the encoder: one column per city.", "The outputs are placed side by side: shape (3, 3)."]),
  },
  {
    t: "Pipeline: preprocessing and model as one object",
    lv: 1,
    s: `{{Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])}} chains the steps. {{pipe.fit(X_train, y_train)}} fits the scaler on the training rows, scales them, then fits the model; {{pipe.predict(X_test)}} applies the same learned scaling automatically. Because the test rows can never reach {{fit}} of the scaler, leakage becomes impossible. It also lets you save one object and tune everything together.`,
    r: `Teams ship the whole pipeline, not just the model, so production data gets exactly the training-time preprocessing.`,
    i: `What problem does Pipeline solve beyond saving typing?`,
    c: py`
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X = [[10], [20], [30], [40]]
y = [0, 0, 1, 1]
pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X, y)
print(list(pipe.named_steps))
print(pipe.predict([[15], [35]]).tolist())
print(pipe.score(X, y))`,
    o: `['scale', 'model']
[0, 1]
1.0`,
    v: flow("fit and predict flow through the same chain of steps.", "row",
      ["raw X|[[10], [20], …]|i", "scale|StandardScaler|g", "model|LogisticRegression|g", "predictions|[0, 1]|g"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["The raw features enter the pipeline.", "The scaler (fitted on the training rows only) rescales them.", "The model learns from — or predicts on — the scaled data, never the raw data."]),
  },
];
