import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["start", 1, "What is Matplotlib and why use it?", "Python's core plotting library. It turns lists and arrays into charts so you can see trends, spread and outliers; pandas, seaborn and most ML notebooks draw with it."],
  ["start", 1, "What does {{import matplotlib.pyplot as plt}} give you?", "The {{pyplot}} module, with the plotting commands ({{plt.plot}}, {{plt.show}}, {{plt.subplots}}), under the standard nickname {{plt}}."],
  ["start", 1, "Figure versus Axes?", "The Figure is the whole image or page. An Axes is one chart inside it, with its own x- and y-axis. A figure can hold many Axes."],
  ["start", 1, "Why prefer {{fig, ax = plt.subplots()}} to bare {{plt.plot}}?", "It names the objects, so you always say which chart a command touches. It scales to several charts and is the style used in real projects."],
  ["start", 1, "What does {{plt.show()}} do?", "Displays the figure (opens a window, or renders in a notebook). In a headless script use {{fig.savefig}} instead."],
  ["chart", 1, "Which chart for change over time?", "A line chart: {{ax.plot(x, y)}}. The order of the points matters and the line makes the trend visible."],
  ["chart", 1, "Bar chart versus histogram?", "A bar chart compares separate categories; a histogram groups a continuous number into bins and counts how many fall in each, so its bars touch."],
  ["chart", 1, "What does a scatter plot show?", "One dot per observation, to reveal the relationship between two numbers, clusters and outliers. Correlation does not prove causation."],
  ["chart", 2, "How does the number of bins affect a histogram?", "Too few hides the shape, too many shows noise. Try several values and choose the one that shows the real structure."],
  ["chart", 2, "How is a box plot drawn?", "A box from Q1 to Q3 with a line at the median; whiskers reach the furthest points within 1.5 × IQR; points beyond are drawn separately as potential outliers."],
  ["chart", 1, "When is a pie chart acceptable?", "For a few clearly different parts of a whole. For many slices or similar values, a sorted bar chart is easier to read."],
  ["chart", 2, "How do you plot two series and label them?", "Call {{ax.plot}} twice with a {{label}} each, then {{ax.legend()}}. Without labels the legend is empty."],
  ["chart", 2, "How do you draw side-by-side (grouped) bars?", "Use {{x = np.arange(n)}} and two {{ax.bar}} calls at {{x - w/2}} and {{x + w/2}} with width {{w}}, then set the tick labels and a legend."],
  ["style", 1, "What text should every chart have?", "A title, axis labels and units, e.g. {{ax.set(title=…, xlabel=\"Time (s)\", ylabel=\"Loss\")}}."],
  ["style", 1, "What do {{figsize}} and {{dpi}} control?", "{{figsize}} is the size in inches; {{dpi}} is dots per inch. The saved image is width × dpi by height × dpi pixels."],
  ["style", 1, "How do you save a chart to a file?", "{{fig.savefig(\"chart.png\", dpi=200, bbox_inches=\"tight\")}}, before {{plt.show()}} in scripts. Use SVG or PDF for sharp vector output."],
  ["style", 2, "How can a bar chart mislead?", "If the y-axis does not start at zero, small differences look huge. Start bars at zero or clearly mark the break."],
  ["style", 2, "How do you highlight a point or a threshold?", "{{ax.annotate}} with {{arrowprops}} for a labelled arrow; {{ax.axhline}} / {{ax.axvline}} for reference lines."],
  ["style", 2, "How do you change the look of every chart?", "{{plt.style.use(\"ggplot\")}} for a style sheet, or edit {{plt.rcParams}} for single defaults."],
  ["layout", 1, "What does {{plt.subplots(1, 2)}} return?", "A Figure and an array of two Axes (one row, two columns); index them {{axes[0]}} and {{axes[1]}}."],
  ["layout", 2, "How do you loop over a grid of axes?", "{{for ax in axes.flat:}} — flat walks the 2D array in reading order. Check {{axes.shape}}: one row or column is 1D."],
  ["layout", 2, "What are {{sharex}}, {{sharey}} and {{twinx}}?", "Shared axes put panels on one scale; {{twinx()}} adds a second y-axis on the right for a series with different units."],
  ["layout", 2, "Labels overlap or are cut off. Fix?", "{{fig.tight_layout()}}, {{layout=\"constrained\"}} when creating the figure, or {{bbox_inches=\"tight\"}} when saving."],
  ["data", 1, "How do you plot a mathematical function?", "Make inputs with {{np.linspace}}, outputs with a NumPy function, and call {{ax.plot(x, y)}}. More points give a smoother curve."],
  ["data", 2, "How do you plot a pandas column against dates?", "Parse dates ({{parse_dates}} or {{pd.to_datetime}}), sort by date, pass the columns to {{ax.plot}} and call {{fig.autofmt_xdate()}}."],
  ["data", 2, "What does {{df.plot()}} return?", "A Matplotlib Axes, so you can keep customising with {{ax.set_ylabel(…)}}. Pass {{ax=ax}} to draw on an existing Axes."],
  ["image", 1, "How do you show an image or matrix?", "{{ax.imshow(array)}}. Use {{cmap=\"gray\"}} for one-channel images; add {{fig.colorbar}} to explain colours."],
  ["image", 2, "Which colormap for which data?", "{{viridis}} for general values, {{Blues}} for counts, {{coolwarm}} for diverging data like correlations, {{gray}} for images. Avoid rainbow maps such as {{jet}}."],
  ["image", 2, "What do the rows and columns of a confusion matrix mean?", "Rows are actual classes and columns predicted classes; the diagonal holds the correct predictions."],
  ["ml", 1, "How do you recognise overfitting on a learning curve?", "Training loss keeps falling while validation loss stops improving and rises. Respond with early stopping, regularisation, more data or a simpler model."],
  ["ml", 2, "Why isn't accuracy enough?", "With imbalanced classes a model can score high accuracy while missing the rare class. Check precision and recall from the confusion matrix."],
  ["ml", 2, "What does the learning rate do to a loss curve?", "Too small: slow progress. Too large: the curve bounces or diverges. Plot the loss every run to catch it."],
  ["pitfalls", 1, "A line chart zig-zags. Cause?", "The x-values are not sorted. Sort x and y together, for example with {{np.argsort(x)}}."],
  ["pitfalls", 2, "What happens if you create hundreds of figures?", "They stay open and use memory; Matplotlib warns after 20. Call {{plt.close(fig)}} or {{plt.close(\"all\")}}."],
  ["pitfalls", 2, "With two figures open, where does {{plt.plot}} draw?", "On the current Axes — the most recently created one. Call methods on the explicit {{ax}} to avoid surprises."],
  ["pitfalls", 2, "How do you make charts on a server with no display?", "Use the Agg backend ({{matplotlib.use(\"Agg\")}}) and write files with {{fig.savefig}}."],
];

export const drills: DrillDef[] = [
  {
    t: "Figure and Axes types",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
print(type(fig).__name__, type(ax).__name__)`,
    opts: [["Figure Axes", true, "subplots() returns a Figure and an Axes."], ["Axes Figure", false, "The order is figure first."], ["Figure Figure", false, "ax is the chart, an Axes."]],
    path: ["plt.subplots() creates the page and one chart.", "fig is the Figure, ax the Axes."],
    why: "Figure = page, Axes = chart.",
    watch: "With subplots(1, 2) ax would be an array.",
    remember: "fig, ax = plt.subplots()",
  },
  {
    t: "Shape of the axes array",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
fig, axes = plt.subplots(2, 3)
print(axes.shape)`,
    opts: [["(2, 3)", true, "Two rows and three columns of Axes."], ["(6,)", false, "That is axes.flat flattened."], ["(3, 2)", false, "Rows come first."]],
    path: ["2 rows × 3 columns of charts.", "The array has the same shape."],
    why: "subplots(rows, cols) returns a rows × cols array.",
    watch: "A single row gives a 1D array.",
    remember: "Check axes.shape.",
  },
  {
    t: "Image size in pixels",
    q: "How many pixels wide and tall is the saved image?",
    code: py`
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
fig, ax = plt.subplots(figsize=(5, 3))
fig.savefig("a.png", dpi=100)
print(mpimg.imread("a.png").shape[:2])`,
    opts: [["(300, 500)", true, "Height 3 × 100 = 300, width 5 × 100 = 500."], ["(500, 300)", false, "NumPy shapes are (height, width)."], ["(5, 3)", false, "Those are inches, not pixels."]],
    path: ["figsize is (width, height) in inches.", "Multiply by dpi: 500 × 300 pixels.", "Image arrays are (height, width)."],
    why: "pixels = inches × dpi.",
    watch: "bbox_inches=\"tight\" can change the size.",
    remember: "inches × dpi",
  },
  {
    t: "Plot call count",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([1, 2], [1, 2])
ax.plot([1, 2], [2, 1])
print(len(ax.lines))`,
    opts: [["2", true, "Each plot call adds one line."], ["1", false, "Lines accumulate on the same Axes."], ["0", false, "plot adds lines immediately."]],
    path: ["Two ax.plot calls.", "Two Line artists on the Axes."],
    why: "Calls accumulate until you clear the Axes.",
    watch: "Label each line for the legend.",
    remember: "One plot call, one line.",
  },
  {
    t: "Bar positions",
    q: "What are the grouped-bar positions?",
    code: py`
import numpy as np
x = np.arange(3)
print(x + 0.2)`,
    opts: [["[0.2 1.2 2.2]", true, "Each position shifts right by 0.2."], ["[0 1 2]", false, "The shift is added."], ["[0.2 0.2 0.2]", false, "arange gives 0, 1, 2 first."]],
    path: ["arange(3) is [0 1 2].", "Add 0.2 to each."],
    why: "Offsets place bars side by side.",
    watch: "Use ±width/2 to centre the pair.",
    remember: "x ± width/2",
  },
  {
    t: "IQR fences",
    q: "What are the outlier fences?",
    code: py`
import numpy as np
w = np.array([98, 99, 99, 100, 100, 101, 101, 102, 145])
q1, q3 = np.percentile(w, [25, 75])
print(q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1))`,
    opts: [["96.0 104.0", true, "Q1 = 99, Q3 = 101, IQR = 2, so 99 − 3 and 101 + 3."], ["99.0 101.0", false, "Those are the quartiles."], ["98.0 145.0", false, "Those are the min and max."]],
    path: ["Q1 = 99, Q3 = 101.", "IQR = 2; 1.5 × IQR = 3.", "Fences: 96 and 104; 145 lies outside."],
    why: "Fences are 1.5 × IQR beyond the box.",
    watch: "Flagged is not the same as wrong.",
    remember: "Q1 − 1.5·IQR, Q3 + 1.5·IQR",
  },
  {
    t: "Histogram counts",
    q: "What does this print?",
    code: py`
import numpy as np
counts, edges = np.histogram([1, 2, 2, 3, 3, 3], bins=3)
print(counts)`,
    opts: [["[1 2 3]", true, "Three equal bins, containing 1, 2 and 3 values."], ["[2 2 2]", false, "The values are not evenly spread."], ["[3 2 1]", false, "The big values are on the right."]],
    path: ["Range 1–3 split into three bins.", "Counts: one value 1, two values 2, three values 3."],
    why: "hist counts values per bin.",
    watch: "The last bin includes its right edge.",
    remember: "np.histogram matches ax.hist.",
  },
  {
    t: "Sigmoid at zero",
    q: "What does this print?",
    code: py`
import numpy as np
print(1 / (1 + np.exp(0)))`,
    opts: [["0.5", true, "exp(0) = 1, so 1 / 2."], ["1.0", false, "That is the limit for large z."], ["0.0", false, "That is the limit for very negative z."]],
    path: ["exp(0) = 1.", "1 / (1 + 1) = 0.5."],
    why: "Sigmoid is centred at 0.5.",
    watch: "It saturates far from zero.",
    remember: "σ(0) = 0.5",
  },
  {
    t: "Accuracy from a matrix",
    q: "What does this print?",
    code: py`
import numpy as np
cm = np.array([[45, 5], [8, 42]])
print(cm.trace() / cm.sum())`,
    opts: [["0.87", true, "Correct = 45 + 42 = 87 out of 100."], ["0.13", false, "That is the error rate."], ["0.5", false, "Not the diagonal share."]],
    path: ["trace sums the diagonal: 87.", "sum is 100."],
    why: "Accuracy = diagonal / total.",
    watch: "Check recall too.",
    remember: "trace / sum",
  },
  {
    t: "Open figures",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
plt.subplots()
plt.subplots()
plt.close("all")
print(len(plt.get_fignums()))`,
    opts: [["0", true, "close(\"all\") closes every figure."], ["2", false, "That was before closing."], ["1", false, "Both were closed."]],
    path: ["Two figures opened.", "close all → none left."],
    why: "Figures live until closed.",
    watch: "Close in loops.",
    remember: "plt.close(fig)",
  },
  {
    t: "Where does plt.plot draw?",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
fig1, ax1 = plt.subplots()
fig2, ax2 = plt.subplots()
plt.plot([1, 2], [1, 2])
print(len(ax1.lines), len(ax2.lines))`,
    opts: [["0 1", true, "plt draws on the current (latest) Axes: ax2."], ["1 0", false, "ax1 is no longer current."], ["1 1", false, "Only one plot call was made."]],
    path: ["Two charts created; the second is current.", "plt.plot adds a line to ax2."],
    why: "pyplot uses the current Axes.",
    watch: "Use ax.plot.",
    remember: "Be explicit.",
  },
  {
    t: "Label returned by get_title",
    q: "What does this print?",
    code: py`
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.set(title="Loss", xlabel="Epoch")
print(ax.get_title(), ax.get_xlabel())`,
    opts: [["Loss Epoch", true, "set stores both texts on the Axes."], ["Epoch Loss", false, "Order follows the print call."], ["None None", false, "They were set."]],
    path: ["ax.set sets title and xlabel.", "get_* read them back."],
    why: "Text lives on the Axes.",
    watch: "Set units too.",
    remember: "ax.set(...)",
  },
];

export const codeLab: [string, string, string][] = [
  ["Weekly temperature line chart", "Plot temperatures [12, 14, 13, 16, 18, 17, 15] over seven days with markers and labels.", py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(range(1, 8), [12, 14, 13, 16, 18, 17, 15], marker="o")
ax.set(title="Weekly temperature", xlabel="Day", ylabel="Temperature (°C)")
plt.show()`],
  ["Compare three products", "Draw a bar chart for Phone 14, Laptop 9, Tablet 20.", py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.bar(["Phone", "Laptop", "Tablet"], [14, 9, 20])
ax.set(ylabel="Units sold")
plt.show()`],
  ["Study hours scatter", "Scatter hours [1, 2, 3, 4] against marks [40, 52, 65, 75] and print the slope of the best line.", py`
import numpy as np
import matplotlib.pyplot as plt

hours, marks = np.array([1, 2, 3, 4]), np.array([40, 52, 65, 75])
fig, ax = plt.subplots()
ax.scatter(hours, marks)
ax.set(xlabel="Hours studied", ylabel="Marks")
plt.show()
print(round(np.polyfit(hours, marks, 1)[0], 2))`],
  ["Draw ReLU", "Plot ReLU = max(0, x) on −5…5.", py`
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-5, 5, 200)
fig, ax = plt.subplots()
ax.plot(x, np.maximum(0, x))
ax.set(title="ReLU", xlabel="x", ylabel="max(0, x)")
plt.show()
print(np.maximum(0, x).min())`],
  ["Two-panel dashboard", "Show training loss and accuracy side by side with titles.", py`
import matplotlib.pyplot as plt

epochs = [1, 2, 3, 4, 5]
fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
axes[0].plot(epochs, [0.9, 0.65, 0.44, 0.3, 0.23], marker="o")
axes[0].set_title("Loss")
axes[1].plot(epochs, [0.55, 0.66, 0.76, 0.84, 0.89], marker="o")
axes[1].set_title("Accuracy")
fig.tight_layout()
plt.show()
print(axes.shape)`],
  ["Histogram of exam marks", "Draw a 6-bin histogram and print the bin counts.", py`
import matplotlib.pyplot as plt

marks = [35, 42, 48, 50, 52, 55, 58, 60, 61, 64, 66, 68, 70, 74, 76, 80, 82, 83, 88, 92]
fig, ax = plt.subplots()
counts, edges, _ = ax.hist(marks, bins=6, edgecolor="black")
ax.set(xlabel="Marks", ylabel="Students")
plt.show()
print(counts)`],
  ["Flag outliers", "Find the readings outside the IQR fences and mark them red on a scatter.", py`
import numpy as np
import matplotlib.pyplot as plt

w = np.array([98, 99, 99, 100, 100, 101, 101, 102, 145])
q1, q3 = np.percentile(w, [25, 75])
iqr = q3 - q1
mask = (w < q1 - 1.5 * iqr) | (w > q3 + 1.5 * iqr)
fig, ax = plt.subplots()
ax.scatter(range(len(w)), w, c=np.where(mask, "red", "steelblue"))
plt.show()
print(w[mask])`],
  ["Sigmoid with a marker", "Plot the sigmoid and mark the point z = 2.", py`
import numpy as np
import matplotlib.pyplot as plt

z = np.linspace(-6, 6, 200)
fig, ax = plt.subplots()
ax.plot(z, 1 / (1 + np.exp(-z)))
ax.plot([2], [1 / (1 + np.exp(-2))], "ro")
plt.show()
print(round(1 / (1 + np.exp(-2)), 3))`],
  ["Save a chart", "Save a 6 × 3 inch chart at dpi 150 and print its pixel size.", py`
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

fig, ax = plt.subplots(figsize=(6, 3))
ax.plot([1, 2, 3], [2, 4, 3])
fig.savefig("out.png", dpi=150)
print(mpimg.imread("out.png").shape[:2])`],
  ["Confusion matrix heatmap", "Draw the matrix [[45, 5], [8, 42]] with counts on the cells and print the accuracy.", py`
import numpy as np
import matplotlib.pyplot as plt

cm = np.array([[45, 5], [8, 42]])
fig, ax = plt.subplots()
ax.imshow(cm, cmap="Blues")
for i in range(2):
    for j in range(2):
        ax.text(j, i, cm[i, j], ha="center", va="center")
plt.show()
print(cm.trace() / cm.sum())`],
  ["Pandas revenue chart", "Plot revenue by date from a small DataFrame.", py`
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({"date": pd.date_range("2026-03-01", periods=5), "revenue": [10, 12, 9, 15, 18]})
fig, ax = plt.subplots()
ax.plot(df["date"], df["revenue"], marker="o")
fig.autofmt_xdate()
plt.show()
print(df["revenue"].sum())`],
  ["Learning curves and best epoch", "Plot two loss curves and print the epoch with the lowest validation loss.", py`
import numpy as np
import matplotlib.pyplot as plt

train = np.array([0.9, 0.6, 0.45, 0.35, 0.3, 0.27])
val = np.array([0.95, 0.7, 0.55, 0.5, 0.52, 0.58])
fig, ax = plt.subplots()
ax.plot(train, label="train")
ax.plot(val, label="validation")
ax.legend()
plt.show()
print(int(val.argmin()))`],
];

export const glance: [string, string][] = [
  ["Start a chart", "fig, ax = plt.subplots(figsize=(8, 4))"],
  ["Line / bar / scatter", "ax.plot(x, y) · ax.bar(names, values) · ax.scatter(x, y)"],
  ["Distribution", "ax.hist(values, bins=10) · ax.boxplot(values)"],
  ["Share of a whole", "ax.pie(values, labels=names, autopct=\"%1.0f%%\")"],
  ["Words", "ax.set(title=…, xlabel=…, ylabel=…) · ax.legend() · ax.grid(alpha=0.3)"],
  ["Several charts", "fig, axes = plt.subplots(1, 2) · axes.flat · layout=\"constrained\""],
  ["Images and heatmaps", "ax.imshow(a, cmap=…) · fig.colorbar(im, ax=ax)"],
  ["Mark things", "ax.annotate(…) · ax.axhline(y) · ax.axvline(x)"],
  ["Limits", "ax.set_xlim / set_ylim — bars start at zero"],
  ["Save", "fig.savefig(\"chart.png\", dpi=200, bbox_inches=\"tight\")"],
  ["Tidy up", "plt.close(fig) · plt.close(\"all\")"],
  ["Mental model", "Question → data → chart type → code → interpretation"],
];

export const lists: [string, string[]][] = [
  ["Before you share a chart", ["Does it have a title, axis labels and units?", "Does the chart type match the question?", "Do bars start at zero?", "Is the legend labelled and not covering data?", "Is it readable in greyscale and at slide size?"]],
  ["Debugging a chart that looks wrong", ["Print the data you passed in", "Check the x-values are sorted for lines", "Check axes.shape and which Axes you drew on", "Check dtypes of dates and numbers", "Try a different bin count or axis limit"]],
  ["Explaining a chart in an interview", ["State the question it answers", "Name what each axis and colour means", "Point to the key pattern or outlier", "Mention caveats: correlation, scale, sample size", "Say what you would do next"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["Matplotlib quick start guide", "https://matplotlib.org/stable/users/explain/quick_start.html"], ["Plot types gallery", "https://matplotlib.org/stable/plot_types/index.html"], ["Choosing colormaps", "https://matplotlib.org/stable/users/explain/colors/colormaps.html"], ["Anatomy of a figure", "https://matplotlib.org/stable/gallery/showcase/anatomy.html"]]],
  ["Practise and explore", [["Matplotlib tutorials", "https://matplotlib.org/stable/tutorials/index.html"], ["Python Graph Gallery", "https://python-graph-gallery.com/"]]],
  ["Books worth owning", [["Python Data Science Handbook — Jake VanderPlas (free online)", "https://jakevdp.github.io/PythonDataScienceHandbook/"], ["Fundamentals of Data Visualization — Claus Wilke (free online)", "https://clauswilke.com/dataviz/"]]],
];
