import { L, cells, compare, curve, flow, hline, par, plot, bars, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* ------------------------------------------------------------------ */
export const data: ConceptDef[] = [
  {
    t: "Plotting a function with NumPy",
    lv: 1,
    s: `Matplotlib draws lists of numbers, and NumPy makes them. {{x = np.linspace(0, 2 * np.pi, 200)}} gives 200 evenly spaced inputs; {{y = np.sin(x)}} computes all 200 outputs at once; {{ax.plot(x, y)}} joins them into a smooth curve. More points means a smoother curve. Drag the sliders to see amplitude and frequency change the shape.`,
    r: `Activation functions, loss surfaces, probability densities and learning-rate schedules are all plotted this way.`,
    i: `Why do you use {{linspace}} with many points instead of a few?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)
y = np.sin(x)

fig, ax = plt.subplots()
ax.plot(x, y)
ax.set(title="sin(x)", xlabel="x", ylabel="sin(x)")
plt.show()
print(x.shape, round(y.max(), 2))`,
    v: plot("y = a · sin(f · x): amplitude stretches it up, frequency squeezes it sideways.", {
      x: [0, 6.283], y: [-3, 3], labels: ["x", "y"],
      params: [par("a", "amplitude a", 0.5, 3, 0.5, 1), par("f", "frequency f", 1, 4, 1, 1)],
      readout: ["y = {a} · sin({f} · x)"],
      steps: [["Plain sine wave.", { a: 1, f: 1 }], ["Amplitude 3: taller waves.", { a: 3, f: 1 }], ["Frequency 4: four waves in the same space.", { a: 1, f: 4 }]],
    }, [curve("a*sin(f*x)", { c: "accent" }), hline("0", { c: "muted", dash: true })]),
  },
  {
    t: "The sigmoid curve",
    lv: 1,
    s: `The sigmoid squashes any number into the range 0 to 1: {{1 / (1 + np.exp(-z))}}. At {{z = 0}} it is exactly 0.5, large positive inputs approach 1 and large negative ones approach 0. That is why it turns a score into a probability. Drag z along the curve.`,
    r: `Logistic regression and the output layer of a binary classifier use it. Plotting it shows the saturation: far from zero the curve is flat, so learning slows.`,
    i: `What is sigmoid(0), and what happens to its output as z grows large?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

z = np.linspace(-6, 6, 200)
sig = 1 / (1 + np.exp(-z))

fig, ax = plt.subplots()
ax.plot(z, sig)
ax.axhline(0.5, color="gray", linestyle="--")
ax.set(title="Sigmoid", xlabel="z", ylabel="σ(z)")
plt.show()
print(round(float(1 / (1 + np.exp(-2))), 3))`,
    v: plot("Any z goes in, a number between 0 and 1 comes out.", {
      x: [-6, 6], y: [0, 1], labels: ["z", "σ(z)"],
      params: [par("z", "input z", -6, 6, 0.25, 2)],
      readout: ["z = {z}  →  σ(z) = {sigmoid(z):3}"],
      steps: [["z = 2 → 0.881.", { z: 2 }], ["z = 0 → exactly 0.5.", { z: 0 }], ["z = −5 → almost 0.", { z: -5 }]],
    }, [curve("sigmoid(x)", { c: "accent" }), hline("0.5", { c: "muted", dash: true }), pt("z", "sigmoid(z)", { c: "bad", label: "{sigmoid(z):3}" })]),
  },
  {
    t: "Comparing activation functions",
    lv: 2,
    s: `Draw several functions on one set of axes to compare them: ReLU ({{np.maximum(0, x)}}) is zero for negatives and a straight line for positives; {{np.tanh}} squashes to −1…1; sigmoid squashes to 0…1. Give each a {{label}} and call {{ax.legend()}}. Drag the marker to read all three at the same input.`,
    r: `Choosing an activation is easier once you have seen their shapes side by side.`,
    i: `How does the output range of ReLU differ from tanh?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-4, 4, 200)
fig, ax = plt.subplots()
ax.plot(x, np.maximum(0, x), label="ReLU")
ax.plot(x, np.tanh(x), label="tanh")
ax.plot(x, 1 / (1 + np.exp(-x)), label="sigmoid")
ax.legend()
plt.show()
print(np.maximum(0, -1.5), round(float(np.tanh(1.5)), 3))`,
    v: plot("Three activations on one chart.", {
      x: [-4, 4], y: [-1.5, 4], labels: ["x", "output"],
      params: [par("z", "input x", -4, 4, 0.5, 1.5)],
      readout: ["x = {z}:  ReLU {relu(z):2} · tanh {tanh(z):3} · sigmoid {sigmoid(z):3}"],
    }, [
      curve("relu(x)", { c: "accent", label: "ReLU" }),
      curve("tanh(x)", { c: "info", label: "tanh" }),
      curve("sigmoid(x)", { c: "warn", label: "sigmoid" }),
      vline("z", { c: "muted", dash: true }),
    ]),
  },
  {
    t: "Pandas to chart: from CSV to plot",
    lv: 1,
    s: `Pandas loads and reshapes tables; Matplotlib draws them. The standard path is {{pd.read_csv}} → clean or aggregate with {{groupby}} → pass the columns to {{ax.plot}}. Every column is a Series that Matplotlib accepts directly. The example builds its CSV in memory so you can run it as is; with a real file, replace {{io.StringIO(…)}} by the file name.`,
    r: `Exploratory data analysis is mostly this loop: load, group, plot, look, repeat.`,
    i: `Which pandas call turns many rows per day into one total per day before plotting?`,
    c: py`
import io
import pandas as pd
import matplotlib.pyplot as plt

csv = io.StringIO("""date,revenue
2026-01-01,120
2026-01-01,80
2026-01-02,150
2026-01-03,90
2026-01-03,110""")
df = pd.read_csv(csv, parse_dates=["date"])
daily = df.groupby("date", as_index=False)["revenue"].sum()

fig, ax = plt.subplots()
ax.plot(daily["date"], daily["revenue"], marker="o")
ax.set(title="Daily revenue", ylabel="Revenue")
fig.autofmt_xdate()
plt.show()
print(daily)`,
    v: flow("Each step reshapes the table until it is ready to draw.", "row",
      ["orders.csv|5 rows, 2 columns|i", "read_csv|dates parsed|g", "groupby + sum|one row per day|g", "ax.plot|the chart|g"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["Load the file; parse_dates turns text into real dates and five orders become a DataFrame.", "Total revenue per date: 200, 150, 200.", "Plot date against revenue."]),
  },
  {
    t: "Time series: dates, sorting and resampling",
    lv: 2,
    s: `For a time series, make the date column a real datetime ({{parse_dates}} or {{pd.to_datetime}}), sort by date, then plot. {{fig.autofmt_xdate()}} tilts the date labels so they stop overlapping. To see the trend through daily noise, aggregate: {{.resample("W").sum()}} gives weekly totals.`,
    r: `Unsorted or text-typed dates give a scrambled line or one label per row. Check {{df.dtypes}} before blaming Matplotlib.`,
    i: `Your date axis shows a crowded blur of labels. What two things do you check?`,
    c: py`
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "date": pd.date_range("2026-01-01", periods=10),
    "revenue": [120, 135, 128, 150, 160, 155, 170, 165, 180, 190],
})
fig, ax = plt.subplots()
ax.plot(df["date"], df["revenue"], marker="o")
fig.autofmt_xdate()
plt.show()
print(df.set_index("date")["revenue"].resample("W").sum())`,
    v: compare("Four habits for date charts.", ["Problem", "Fix"], [
      ["Dates are text", "x-axis treats each as a label", "parse_dates=[\"date\"] or pd.to_datetime"],
      ["Rows out of order", "line zig-zags back and forth", "df.sort_values(\"date\")"],
      ["Labels overlap", "unreadable x-axis", "fig.autofmt_xdate()"],
      ["Too noisy", "daily jitter hides the trend", ".resample(\"W\").sum() or .mean()"],
    ]),
  },
  {
    t: "df.plot: the pandas shortcut",
    lv: 2,
    s: `A DataFrame can draw itself: {{df.plot(x="week", y=["a", "b"])}} makes a line chart with a legend, using Matplotlib underneath, and returns the {{Axes}} so you can keep customising it ({{ax.set_ylabel(…)}}). Pick the style with {{kind="bar"}}, {{"hist"}}, {{"scatter"}} or {{"box"}}. Fast for exploring; use plain {{fig, ax}} when you need full control.`,
    r: `df.plot is what you will see in most notebooks. Passing {{ax=ax}} puts it onto an Axes you created, which lets you combine it with Matplotlib calls.`,
    i: `What does df.plot() return, and what do you do with it?`,
    c: py`
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({"week": [1, 2, 3, 4], "a": [3, 5, 4, 8], "b": [2, 3, 5, 6]})
ax = df.plot(x="week", y=["a", "b"], marker="o", title="Two products")
ax.set_ylabel("Sales")
plt.show()
print(type(ax).__name__)`,
    v: compare("Two routes to the same chart.", ["df.plot(...)", "ax.plot(...)"], [
      ["Code", "one call, columns by name", "one call per series"],
      ["Legend", "automatic from column names", "label=… then ax.legend()"],
      ["Control", "good; returns the Axes", "total"],
      ["Best for", "quick exploration", "final polished charts"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const image: ConceptDef[] = [
  {
    t: "Images are grids of numbers",
    lv: 1,
    s: `{{ax.imshow(array)}} draws a 2D array as a picture, one square per number. For a greyscale image, 0 is black and 255 is white, so the numbers themselves are the picture. A colour image is a 3D array (height, width, 3). Use {{cmap="gray"}} for single-channel data, otherwise Matplotlib paints it in its default colours.`,
    r: `Computer vision starts here: a photo is just an array you can slice, scale and plot.`,
    i: `What shape does a colour image array have, and what does 0 mean in greyscale?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

img = np.array([[0, 128, 255],
                [64, 192, 32],
                [255, 0, 128]], dtype=np.uint8)
fig, ax = plt.subplots()
ax.imshow(img, cmap="gray", vmin=0, vmax=255)
plt.show()
print(img.shape, img.dtype)`,
    v: cells("Every square is one number: low = dark, high = bright.", [
      L("row 0", ["0", "128", "255"], "pos"), L("row 1", ["64", "192", "32"], "pos"), L("row 2", ["255", "0", "128"], "pos"),
    ], [
      ["A 3 × 3 greyscale image: nine numbers between 0 and 255."],
      ["0 is black — the darkest pixels.", [[0, 0, 0], [2, 1, 1]]],
      ["255 is white — the brightest pixels.", [[0, 2, 2], [2, 0, 0]]],
      ["Values in between are shades of grey.", [[0, 1, 1], [1, 0, 2], [2, 2, 2]]],
    ]),
  },
  {
    t: "Heatmap: a confusion matrix",
    lv: 1,
    s: `A heatmap colours a table of numbers so large values stand out. For a classifier, rows are the actual classes, columns the predicted ones, and the diagonal holds the correct predictions. Draw it with {{ax.imshow(cm, cmap="Blues")}}, write each count with {{ax.text}}, and add {{fig.colorbar}}.`,
    r: `A bright diagonal means a good model; bright cells off the diagonal show exactly which classes get confused.`,
    i: `In a confusion matrix, which cells are errors, and how do you get accuracy from it?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

cm = np.array([[45, 5],
               [8, 42]])
fig, ax = plt.subplots()
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks([0, 1], labels=["Negative", "Positive"])
ax.set_yticks([0, 1], labels=["Negative", "Positive"])
ax.set(xlabel="Predicted", ylabel="Actual", title="Confusion matrix")
for i in range(2):
    for j in range(2):
        ax.text(j, i, str(cm[i, j]), ha="center", va="center")
fig.colorbar(im, ax=ax)
plt.show()
print(cm.trace() / cm.sum())`,
    v: cells("Rows = actual, columns = predicted. The diagonal is what the model got right.", [
      L("actual Negative", ["45", "5"], "pos"), L("actual Positive", ["8", "42"], "pos"),
    ], [
      ["2 × 2 matrix: columns are the predicted label (Negative, Positive)."],
      ["Diagonal: 45 true negatives and 42 true positives — correct.", [[0, 0, 0], [1, 1, 1]]],
      ["Off-diagonal: 5 false positives and 8 false negatives — mistakes.", [[0, 1, 1], [1, 0, 0]]],
      ["Accuracy = (45 + 42) / 100 = 0.87.", [[0, 0, 0], [1, 1, 1]]],
    ]),
  },
  {
    t: "Colormaps and colorbars",
    lv: 2,
    s: `A colormap turns numbers into colours; the {{colorbar}} is the key. Choose by data type: {{viridis}} (the default) for ordinary values, {{Blues}} for counts that start at zero, {{coolwarm}} for values around a meaningful centre such as correlations, {{gray}} for images. Avoid rainbow maps like {{jet}}: they invent false boundaries and fail in greyscale.`,
    r: `Always add a colorbar and label what it means; a heatmap without one cannot be read.`,
    i: `Which colormap would you choose for a correlation matrix, and why?`,
    v: compare("Match the colormap to the kind of number.", ["Use for"], [
      ["viridis", "general values — perceptually even, colour-blind friendly"],
      ["Blues / Greens", "counts and amounts that start at zero"],
      ["coolwarm / RdBu", "diverging data: negative ↔ positive around zero"],
      ["gray", "images with one channel"],
      ["jet / rainbow", "avoid: creates fake bands and misleads"],
    ]),
  },
  {
    t: "Correlation heatmap",
    lv: 2,
    s: `{{np.corrcoef}} (or {{df.corr()}}) returns the correlation of every pair of columns: +1 move together, −1 move opposite, 0 unrelated. Show it with {{imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)}} so the colours are centred on zero. Strong cells between a feature and the target are promising; strong cells between two features are redundant.`,
    r: `A first look at a new dataset: which features move with the target, and which duplicate each other?`,
    i: `Why fix vmin=-1 and vmax=1 for a correlation heatmap?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

study = np.array([1, 2, 3, 4, 5, 6, 7])
marks = np.array([35, 43, 50, 62, 67, 78, 86])
screen = np.array([6, 5, 5, 4, 3, 3, 2])
corr = np.corrcoef([study, marks, screen])

fig, ax = plt.subplots()
im = ax.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
names = ["study", "marks", "screen"]
ax.set_xticks(range(3), labels=names)
ax.set_yticks(range(3), labels=names)
fig.colorbar(im, ax=ax)
plt.show()
print(corr.round(2))`,
    v: cells("Study hours and marks rise together (1.00); screen time moves the other way (−0.98).", [
      L("study", ["1.00", "1.00", "-0.98"], "pos"), L("marks", ["1.00", "1.00", "-0.98"], "pos"), L("screen", ["-0.98", "-0.98", "1.00"], "pos"),
    ], [
      ["Columns are study, marks, screen; the diagonal is always 1 (a variable with itself)."],
      ["study vs marks ≈ 1.00: a strong positive link.", [[0, 1, 1], [1, 0, 0]]],
      ["study vs screen ≈ −0.98: a strong negative link.", [[0, 2, 2], [2, 0, 0]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const ml: ConceptDef[] = [
  {
    t: "Learning curves: spotting overfitting",
    lv: 2,
    s: `Plot training loss and validation loss per epoch. Both should fall at first. If training loss keeps falling while validation loss turns upward, the model is memorising the training data — overfitting. The best moment to stop is the epoch where validation loss is lowest (early stopping). These curves are simulated for teaching; drag the severity.`,
    r: `With Keras, {{history.history["loss"]}} and {{["val_loss"]}} are exactly these two lists; plotting them is the first diagnostic after every run.`,
    i: `Training loss keeps falling but validation loss rises. What does it mean and what can you do?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

epochs = np.arange(20)
train = 0.85 * np.exp(-epochs * 0.18) + 0.075
val = 0.8 * np.exp(-epochs * 0.20) + 0.16 + 0.65 * np.maximum(0, epochs - 7) ** 1.18 * 0.018

fig, ax = plt.subplots()
ax.plot(epochs, train, label="Training loss")
ax.plot(epochs, val, label="Validation loss")
ax.axvline(val.argmin(), linestyle="--", color="gray")
ax.set(xlabel="Epoch", ylabel="Loss", title="Learning curves")
ax.legend()
plt.show()
print(int(val.argmin()))`,
    v: plot("A widening gap between the curves is the warning sign. Drag the severity.", {
      x: [0, 19], y: [0, 1], labels: ["Epoch", "Loss"],
      params: [par("s", "overfitting severity", 0, 1, 0.05, 0.65)],
      defs: [["gap", "(0.8*exp(-3.8)+0.16+s*pow(12,1.18)*0.018)-(0.85*exp(-3.42)+0.075)"]],
      readout: ["gap between validation and training loss at epoch 19: {gap:2}"],
      steps: [["No overfitting: the curves stay close.", { s: 0 }], ["Moderate: validation loss bottoms out near epoch 11, then turns up.", { s: 0.65 }], ["Severe: validation loss climbs fast.", { s: 1 }]],
    }, [
      curve("0.85*exp(-0.18*x)+0.075", { c: "accent", label: "training" }),
      curve("0.8*exp(-0.2*x)+0.16+s*pow(max(0,x-7),1.18)*0.018", { c: "bad", label: "validation" }),
    ]),
  },
  {
    t: "Accuracy, precision and recall from a confusion matrix",
    lv: 2,
    s: `From the four counts you can compute three scores. Accuracy is the share correct; precision is how many predicted positives were real; recall is how many real positives were found. Drag the false negatives and false positives: accuracy hardly moves while recall or precision drops — which is why one number is never enough.`,
    r: `For rare events such as fraud, a model that always says "no" has high accuracy and zero recall. Always inspect the matrix.`,
    i: `When is accuracy misleading, and which metric would you check instead?`,
    v: bars("100 cases (50 positive, 50 negative). Missing positives hurts recall; false alarms hurt precision.", [
      ["Accuracy", "(100-fn-fp)/100"], ["Precision", "(50-fn)/((50-fn)+fp)"], ["Recall", "(50-fn)/50"],
    ], {
      percent: true,
      params: [par("fn", "false negatives (missed)", 0, 30, 1, 8), par("fp", "false positives (false alarms)", 0, 30, 1, 5)],
      readout: ["TP {50-fn} · FN {fn} · FP {fp} · TN {50-fp}"],
      steps: [["The earlier matrix: 87% accuracy.", { fn: 8, fp: 5 }], ["Miss 25 positives: accuracy 70%, recall only 50%.", { fn: 25, fp: 5 }], ["25 false alarms: precision falls.", { fn: 8, fp: 25 }]],
    }),
  },
  {
    t: "A decision threshold on a scatter",
    lv: 2,
    s: `A classifier often outputs a score, and a threshold turns it into a class. Plot the scores of the two classes on a line and draw the threshold as a vertical line: points on the wrong side are mistakes. Slide the threshold to find the cut that gets the most right — and see why the overlap in the middle can never be classified perfectly.`,
    r: `Moving the threshold trades precision against recall; the right choice depends on which mistake costs more.`,
    i: `How does changing the decision threshold affect precision and recall?`,
    v: plot("Blue dots should be left of the line, orange dots right. Drag the threshold.", {
      x: [0, 6], y: [-1, 1], labels: ["model score", ""],
      params: [par("t", "threshold", 0.5, 5.5, 0.1, 3)],
      defs: [
        ["ca", "step(t-1)+step(t-1.5)+step(t-2)+step(t-2.5)+step(t-3.2)"],
        ["cb", "step(2.8-t)+step(3.5-t)+step(4-t)+step(4.5-t)+step(5-t)"],
      ],
      readout: ["{ca+cb} of 10 points on the correct side  ·  accuracy {(ca+cb)/10:2}"],
      steps: [["t = 3.0: the overlap zone causes errors.", { t: 3 }], ["t = 1.0: nearly everything is called class B.", { t: 1 }], ["t = 5.2: nearly everything is called class A.", { t: 5.2 }]],
    }, [
      ...[1, 1.5, 2, 2.5, 3.2].map((x) => pt(String(x), "0.4", { c: "info" })),
      ...[2.8, 3.5, 4, 4.5, 5].map((x) => pt(String(x), "-0.4", { c: "warn" })),
      vline("t", { c: "bad", label: "threshold {t}" }),
    ]),
  },
  {
    t: "Scaling a feature and checking it with a histogram",
    lv: 2,
    s: `Standardising subtracts the mean and divides by the standard deviation, so the feature has mean 0 and spread 1. Histograms before and after show that the shape is unchanged — only the scale moves. Plot both with {{subplots(1, 2, sharey=True)}} to prove it.`,
    r: `Plotting the transformed feature is the quickest sanity check that your preprocessing did what you meant.`,
    i: `Does standardising change the shape of a distribution?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
x = rng.normal(70, 10, 200)
z = (x - x.mean()) / x.std()

fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
axes[0].hist(x, bins=15)
axes[0].set_title("Raw")
axes[1].hist(z, bins=15)
axes[1].set_title("Standardised")
plt.show()
print(round(x.mean(), 1), round(x.std(), 1))
print(round(z.mean(), 2), round(z.std(), 2))`,
    v: compare("Same shape, new scale.", ["Raw", "Standardised"], [
      ["Mean", "about 70", "0"],
      ["Spread (std)", "about 10", "1"],
      ["Shape of histogram", "bell curve", "the same bell curve"],
      ["Why", "natural units", "features comparable for the model"],
    ], 1),
  },
  {
    t: "Learning rate and the loss curve",
    lv: 2,
    s: `Gradient descent repeats {{w = w − lr · gradient}}. For the loss {{w²}} each step multiplies w by {{1 − 2·lr}}, so the loss is shrunk by that factor squared. Small lr: slow steady fall. Good lr: quick fall. lr = 1: bounces forever. lr > 1: grows — it diverges. Drag the learning rate and watch the curve.`,
    r: `A loss curve that explodes or stays flat is usually the learning rate. Plot it every time you train.`,
    i: `Your loss curve goes up and down wildly. What is the first thing you change?`,
    c: py`
for lr in (0.1, 0.5, 1.1):
    w = 2.0
    losses = []
    for step in range(5):
        losses.append(round(w * w, 3))
        w -= lr * 2 * w
    print(lr, losses)`,
    v: plot("Loss after each step for w² starting at w = 2.", {
      x: [0, 10], y: [0, 5], labels: ["step", "loss"],
      params: [par("lr", "learning rate", 0.05, 1.1, 0.05, 0.1)],
      readout: ["each step multiplies the loss by {pow(abs(1-2*lr),2):3}"],
      steps: [["lr 0.1: slow, steady fall.", { lr: 0.1 }], ["lr 0.5: reaches the minimum in one step.", { lr: 0.5 }], ["lr 1.0: bounces and never improves.", { lr: 1 }], ["lr 1.1: loss grows — divergence.", { lr: 1.1 }]],
    }, [curve("4*pow(abs(1-2*lr),2*x)", { c: "accent" }), ...Array.from({ length: 11 }, (_, i) => pt(String(i), `4*pow(abs(1-2*lr),${2 * i})`, { c: "warn" }))]),
  },
];

/* ------------------------------------------------------------------ */
export const pitfalls: ConceptDef[] = [
  {
    t: "Common errors and their fixes",
    lv: 1,
    s: `Most Matplotlib problems repeat. Learn the pattern and you fix them in seconds: missing install, nothing displayed, scrambled lines, overlapping labels, histogram versus bar confusion, misleading scales and too many open figures.`,
    r: `When a chart looks wrong, print the data first — the cause is nearly always the data passed in, not the library.`,
    i: `A chart shows nothing in a script but works in a notebook. Why?`,
    v: compare("Symptom → cause → fix.", ["Why", "Fix"], [
      ["ModuleNotFoundError", "not installed in this environment", "python -m pip install matplotlib"],
      ["Nothing appears", "no plt.show(), or a non-interactive backend", "call plt.show() or save with fig.savefig"],
      ["Line zig-zags", "x-values are not sorted", "sort x and y together"],
      ["Overlapping labels", "no spacing adjustment", "fig.tight_layout() or layout=\"constrained\""],
      ["Bar vs histogram", "different variable types", "bar = categories, histogram = numbers"],
      ["Exaggerated trend", "truncated or inconsistent axis", "check set_ylim; start bars at zero"],
      ["Memory warning", "many figures left open", "plt.close(fig)"],
    ]),
  },
  {
    t: "Unsorted x-values scramble the line",
    lv: 1,
    s: `{{ax.plot}} joins points in the order you give them. If the x-values are not in order the line jumps back and forth. Sort x and y together with {{np.argsort(x)}} and index both arrays by the result. A scatter plot does not care about order — only line charts do.`,
    r: `Data from a database or a merge is often unsorted. Sort by time before plotting a time series.`,
    i: `Why must you sort y by the same order as x?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

x = np.array([3, 1, 4, 2, 5])
y = np.array([5, 2, 6, 3, 7])
order = np.argsort(x)

fig, ax = plt.subplots()
ax.plot(x[order], y[order], marker="o")
plt.show()
print(x[order], y[order])`,
    v: plot("Flip the switch: sorted points give a clean line.", {
      x: [0, 6], y: [0, 8], labels: ["x", "y"],
      params: [par("s", "sorted by x (0 = no, 1 = yes)", 0, 1, 1, 0)],
      steps: [["As given: the line jumps back and forth.", { s: 0 }], ["Sorted by x: a smooth rising line.", { s: 1 }]],
    }, [
      ...[[3, 5, 1, 2], [1, 2, 4, 6], [4, 6, 2, 3], [2, 3, 5, 7]].map(([a, b, c, d]) => seg(String(a), String(b), String(c), String(d), { c: "bad", show: "0.5-s" })),
      ...[[1, 2, 2, 3], [2, 3, 3, 5], [3, 5, 4, 6], [4, 6, 5, 7]].map(([a, b, c, d]) => seg(String(a), String(b), String(c), String(d), { c: "good", show: "s-0.5" })),
      ...[[3, 5], [1, 2], [4, 6], [2, 3], [5, 7]].map(([x, y]) => pt(String(x), String(y), { c: "info" })),
    ]),
  },
  {
    t: "Close your figures",
    lv: 2,
    s: `Every {{plt.subplots()}} opens a new figure that stays in memory until you close it. A loop that makes hundreds of charts will warn you (more than 20 open) and slow down. Call {{plt.close(fig)}} after saving, or {{plt.close("all")}}. In a notebook the chart is freed after the cell displays it.`,
    r: `Batch jobs that save one chart per customer or experiment must close each figure.`,
    i: `How do you avoid memory problems when generating many charts in a loop?`,
    c: py`
import matplotlib.pyplot as plt

for i in range(3):
    fig, ax = plt.subplots()
    ax.plot([0, 1], [0, i])
print(len(plt.get_fignums()))
plt.close("all")
print(len(plt.get_fignums()))`,
    v: trace("Figures pile up until you close them.", py`
import matplotlib.pyplot as plt

for i in range(3):
    fig, ax = plt.subplots()
    ax.plot([0, 1], [0, i])
print(len(plt.get_fignums()))
plt.close("all")
print(len(plt.get_fignums()))`, [
      [4, { open_figures: "1" }, undefined, "First loop pass: one figure open."],
      [4, { open_figures: "2" }, undefined, "Second pass: two."],
      [4, { open_figures: "3" }, undefined, "Third pass: three."],
      [6, undefined, "3", "All three are still open."],
      [7, { open_figures: "0" }, undefined, "close(\"all\") frees them."],
      [8, undefined, "0"],
    ]),
  },
  {
    t: "plt vs ax: drawing on the wrong chart",
    lv: 2,
    s: `{{plt.plot()}} always draws on the current Axes — the most recently created one. With two charts open it is easy to draw on the wrong one. Call methods on the object you mean ({{ax1.plot}}) and the problem disappears.`,
    r: `A line that "doesn't show up" is often on a different Axes than the one you are looking at.`,
    i: `With two figures open, where does plt.plot draw?`,
    c: py`
import matplotlib.pyplot as plt

fig1, ax1 = plt.subplots()
fig2, ax2 = plt.subplots()
plt.plot([1, 2, 3], [1, 2, 3])
print(len(ax1.lines), len(ax2.lines))`,
    v: trace("plt.plot goes to the newest chart, not the first.", py`
import matplotlib.pyplot as plt

fig1, ax1 = plt.subplots()
fig2, ax2 = plt.subplots()
plt.plot([1, 2, 3], [1, 2, 3])
print(len(ax1.lines), len(ax2.lines))`, [
      [3, { ax1: "empty Axes" }, undefined, "Figure 1 is the current chart."],
      [4, { ax2: "empty Axes (now current)" }, undefined, "Creating figure 2 makes it the current one."],
      [5, { "ax2.lines": "[ 1 line ]" }, undefined, "plt.plot drew on ax2, not ax1."],
      [6, undefined, "0 1", "ax1 stayed empty."],
    ]),
  },
  {
    t: "Backends: why nothing appears",
    lv: 2,
    s: `A backend decides where the chart goes. Interactive backends open a window ({{plt.show()}}); in Jupyter use {{%matplotlib inline}}; servers and scheduled jobs without a screen use {{matplotlib.use("Agg")}} and save files instead. If a script runs and nothing opens, you are usually on a non-interactive backend — save with {{fig.savefig}}.`,
    r: `Web apps, CI pipelines and cron jobs have no display. Pick Agg and write images to disk.`,
    i: `How would you generate charts on a server with no screen?`,
    c: py`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3])
fig.savefig("chart.png")
print(matplotlib.get_backend())`,
    v: compare("Choose the backend for where the code runs.", ["Setting", "Result"], [
      ["Desktop script", "default window backend", "plt.show() opens a window"],
      ["Jupyter notebook", "%matplotlib inline", "chart appears under the cell"],
      ["Server or CI", "matplotlib.use(\"Agg\")", "no window; use fig.savefig(...)"],
    ]),
  },
  {
    t: "Making charts honest",
    lv: 2,
    s: `A chart persuades before anyone reads it, so it must not mislead. Start bars at zero, show the same scale across comparable panels, label axes with units, avoid pie charts for similar values, avoid 3D effects, and say where data comes from. Ask yourself what a skim-reader would conclude.`,
    r: `Interviewers and managers trust analysts whose charts survive scrutiny.`,
    i: `Give three ways a chart can mislead without any wrong number.`,
    v: compare("Common distortions and the honest alternative.", ["Better"], [
      ["Truncated bar axis", "start at zero"],
      ["Different scales on side-by-side panels", "sharey=True"],
      ["Pie with many similar slices", "sorted bar chart"],
      ["Dual axes implying a link", "separate panels"],
      ["No units or source", "label axes, add a caption"],
    ]),
  },
];
