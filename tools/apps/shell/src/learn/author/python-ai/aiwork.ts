import { L, T, cells, flow, layers, trace } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

export const ai: ConceptDef[] = [
  {
    t: "Predictions versus labels: accuracy with zip",
    lv: 1,
    s: `{{zip(a, b)}} pairs the items of two lists. Comparing predictions with the true labels pair by pair and counting the matches gives accuracy: correct ÷ total. In Python, {{True}} counts as 1 and {{False}} as 0 when you sum them.`,
    r: `Accuracy is the first metric you compute for any classifier — and you can compute it with nothing but two lists, {{zip}} and {{sum}}.`,
    i: `Why does {{sum(p == a for p, a in zip(pred, actual))}} work?`,
    c: py`
predictions = [1, 0, 1, 1]
actual      = [1, 0, 0, 1]
correct = sum(p == a for p, a in zip(predictions, actual))
accuracy = correct / len(actual)
print(correct, accuracy)`,
    o: `3 0.75`,
    v: cells("zip pairs prediction i with label i; every match counts as 1.", [L("predictions", ["1", "0", "1", "1"], "pos"), L("actual", ["1", "0", "0", "1"], "pos")], [
      ["Four predictions and the four true labels."],
      ["Pair 0: 1 vs 1 → equal → counts 1.", [[0, 0, 0], [1, 0, 0]]],
      ["Pair 1: 0 vs 0 → equal → counts 1.", [[0, 1, 1], [1, 1, 1]]],
      ["Pair 2: 1 vs 0 → different → counts 0.", [[0, 2, 2], [1, 2, 2]]],
      ["Pair 3: 1 vs 1 → equal → counts 1.", [[0, 3, 3], [1, 3, 3]]],
      ["3 correct out of 4 → accuracy 0.75.", [[0, 0, 3], [1, 0, 3]]],
    ]),
  },
  {
    t: "Shapes and tuples: (224, 224, 3)",
    lv: 1,
    s: `An image is a grid of pixels with colour channels, so its shape is a tuple: (height, width, channels). Unpack it, compare it and use it to validate input. Datasets add a leading batch dimension, as in {{(32, 224, 224, 3)}}.`,
    r: `Shape mismatches are the most common error in deep-learning code. Read shapes as tuples and unpack them to check your assumptions.`,
    i: `What does {{(batch, height, width, channels)}} mean?`,
    c: py`
image_shape = (224, 224, 3)
height, width, channels = image_shape
batch_shape = (32,) + image_shape
print(width, channels)
print(batch_shape)
print(height * width * channels)`,
    o: `224 3\n(32, 224, 224, 3)\n150528`,
    v: cells("A shape is a tuple of sizes: one number per dimension.", [T("image_shape", ["224", "224", "3"], "pos")], [
      ["An RGB image, 224 pixels tall and wide."],
      ["Index 0 is the height: 224 rows of pixels.", [[0, 0, 0]]],
      ["Index 1 is the width: 224 columns.", [[0, 1, 1]]],
      ["Index 2 is the channels: 3 (red, green, blue).", [[0, 2, 2]]],
      ["(32,) + image_shape puts a batch size in front: 32 images at a time.", [[1, 0, 0]], [T("image_shape", ["224", "224", "3"], "pos"), T("batch_shape", ["32", "224", "224", "3"], "pos")]],
    ]),
  },
  {
    t: "Dictionaries as training configuration",
    lv: 1,
    s: `A config dict names every setting, so code reads {{config["lr"]}} instead of a magic position. Pass it around, save it to JSON and spread it with {{**config}}. Keep the defaults in one dict and override only what you change — without mutating the defaults.`,
    r: `Reproducible experiments start with a config you can print, save and reload.`,
    i: `How do you override one value in a default config without changing the original?`,
    c: py`
defaults = {"epochs": 20, "batch_size": 32, "lr": 0.001}
overrides = {"lr": 0.01}
config = {**defaults, **overrides}
print(config)
print(defaults["lr"], config["lr"])

def train(epochs, batch_size, lr):
    return f"training {epochs} epochs at lr={lr}"

print(train(**config))`,
    o: `{'epochs': 20, 'batch_size': 32, 'lr': 0.01}\n0.001 0.01\ntraining 20 epochs at lr=0.01`,
    v: flow("Merge dicts with {**a, **b} — later values win — then spread them as keyword arguments.", "row",
      ["defaults|epochs 20, batch 32, lr 0.001|i", "overrides|lr 0.01|w", "config|{**defaults, **overrides}|g", "train(**config)|keyword arguments|g"],
      [[0, 2, "merge"], [1, 2, "later wins"], [2, 3, "spread as keywords"]],
      undefined,
      ["The defaults are copied into a new dict.", "overrides come second, so lr becomes 0.01. defaults itself is unchanged.", "**config turns each key into a keyword argument: train(epochs=20, batch_size=32, lr=0.01)."]),
  },
  {
    t: "Functions as reusable metrics",
    lv: 2,
    s: `A metric is a plain function: predictions and labels in, a number out — no printing and no hidden globals. Validate that the lengths match, handle empty input, and return the value so you can log, compare and plot it.`,
    r: `Mean absolute error, accuracy and precision are the same few lines reused across every experiment.`,
    i: `Which edge cases should a metric function handle?`,
    c: py`
def mean_absolute_error(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("need equal, non-empty lists")
    errors = [abs(a - p) for a, p in zip(actual, predicted)]
    return sum(errors) / len(errors)

print(mean_absolute_error([10, 20], [12, 18]))`,
    o: `2.0`,
    v: trace("Validate inputs, compute per-item errors, return one number.", py`
def mean_absolute_error(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("need equal, non-empty lists")
    errors = [abs(a - p) for a, p in zip(actual, predicted)]
    return sum(errors) / len(errors)

print(mean_absolute_error([10, 20], [12, 18]))`, [
      [7, { actual: "[10, 20]", predicted: "[12, 18]" }, undefined, "The call fills in both parameters."],
      [2, undefined, undefined, "Same length and not empty: no error is raised."],
      [4, { errors: "[2, 2]" }, undefined, "|10 − 12| = 2 and |20 − 18| = 2."],
      [5, undefined, undefined, "(2 + 2) / 2 = 2.0 is returned…"],
      [7, undefined, "2.0", "…and print displays it."],
    ]),
  },
  {
    t: "A tiny ML pipeline, end to end",
    lv: 2,
    s: `Real projects chain what you've learned: load a CSV into a list of dicts, build features and labels as lists, "fit" something simple, predict, score with a metric function and save the results as JSON. Swap the toy rule for a real model and the shape stays the same.`,
    r: `This load → transform → fit → evaluate → save loop is the shape of every ML script, from a threshold rule to a neural network.`,
    i: `Walk me through a basic ML pipeline and say where each Python structure is used.`,
    c: py`
import csv, json

with open("students.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))                   # list of dicts

X = [float(r["hours"]) for r in rows]                # features: a list
y = [1 if r["passed"] == "yes" else 0 for r in rows] # labels: a list

threshold = sum(X) / len(X)                          # "fit": learn a number
pred = [int(x >= threshold) for x in X]              # predict
accuracy = sum(p == t for p, t in zip(pred, y)) / len(y)
print(round(threshold, 2), accuracy)

with open("metrics.json", "w", encoding="utf-8") as f:
    json.dump({"threshold": threshold, "accuracy": accuracy}, f)`,
    o: `4.67 1.0`,
    v: flow("Every ML script is the same chain: file → structures → model → metric → file.", "row",
      ["students.csv|file on disk|i", "list of dicts|csv.DictReader|i", "X and y|two lists|i", "fit|threshold = the mean|w", "predict + metric|accuracy|g", "metrics.json|saved results|g"],
      [[0, 1, "read"], [1, 2, "build lists"], [2, 3, "learn"], [3, 4, "score"], [4, 5, "write"]],
      undefined,
      ["…as a list of dictionaries…", "…which a comprehension turns into feature and label lists…", "…a simple 'model' learns a threshold from X…", "…predictions are compared with y using a metric function…", "…and the results go back to disk as JSON."]),
  },
  {
    t: "What comes next: NumPy, Pandas and models",
    lv: 1,
    s: `Everything here carries over. A NumPy array is a list made fast, with a shape that is a tuple. A Pandas DataFrame is a table of columns, like a list of dicts with speed. Model libraries are classes with {{fit}} and {{predict}}. Next in the AI Atlas: NumPy and Pandas, then Maths for AI, then Machine Learning.`,
    r: `If lists, dicts, functions, classes and files feel natural, the ML libraries will read like familiar Python.`,
    i: `How is a NumPy array different from a Python list?`,
    c: py`
scores = [72, 45, 88]                  # Python list
passed = [s >= 50 for s in scores]     # comprehension
print(passed)
# NumPy:  np.array(scores) >= 50       -> same result, vectorised
# Pandas: df["score"] >= 50            -> a whole column at once`,
    o: `[True, False, True]`,
    v: layers("Each layer builds on the one before it — you've finished the first.", [
      "Python (you are here)|lists, tuples, dicts, functions, classes, files|g",
      "NumPy|arrays: lists made fast, with a shape tuple|i",
      "Pandas|DataFrames: tables of columns built on arrays|i",
      "Machine learning|models are objects with fit() and predict()|w",
    ], "builds on"),
  },
];
