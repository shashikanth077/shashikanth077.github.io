import { area, bars, compare, flow, layers, line, par, plot, poly, pt, seg, trace, txt, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Example outputs are NOT written here: `npm run outputs -- matplotlib` runs each snippet with real Matplotlib. */

/** A line chart as segments + dots, for the plot diagram. */
export function series(xs: number[], ys: (number | string)[], c: "accent" | "info" | "good" | "warn" | "bad" | "purple" = "accent", show?: string) {
  const o = { c, ...(show ? { show } : {}) };
  return [
    ...xs.slice(1).map((x, i) => seg(String(xs[i]), String(ys[i]), String(x), String(ys[i + 1]), o)),
    ...xs.map((x, i) => pt(String(x), String(ys[i]), o)),
  ];
}

/* ------------------------------------------------------------------ */
export const start: ConceptDef[] = [
  {
    t: "What Matplotlib does: numbers become pictures",
    lv: 1,
    s: `Matplotlib is Python's drawing library for data. You give it numbers, it draws a chart — and the chart shows a pattern that a table of numbers hides. Five days of coffee sales {{[10, 14, 13, 20, 26]}} are just digits until a line chart shows them climbing. It is the base that pandas, seaborn and most AI notebooks build their charts on.`,
    r: `Every training run, data check and model report ends in a chart: loss curves, feature distributions, confusion matrices. If you can read and write Matplotlib you can see what your model and data are doing.`,
    i: `Why plot your data before you train a model on it?`,
    c: py`
import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
sales = [10, 14, 13, 20, 26]

plt.plot(days, sales, marker="o")
plt.title("Coffee Sales This Week")
plt.xlabel("Day")
plt.ylabel("Cups Sold")
plt.show()`,
    v: flow("Matplotlib is the step between a list of numbers and a trend you can see.", "row",
      ["Daily sales|[10, 14, 13, 20, 26]|i", "Matplotlib|plt.plot(days, sales)|g", "A picture|sales climb ↗|g"],
      [[0, 1, "numbers in"], [1, 2, "figure out"]],
      undefined,
      ["You hand it two lists: the days and the cups sold.", "It draws the points, joins them with a line and adds the axes — now the upward trend is obvious."]),
  },
  {
    t: "Install, import and the plt nickname",
    lv: 1,
    s: `Install once in a terminal with {{python -m pip install matplotlib}} (in a notebook: {{%pip install matplotlib}}). Then every script starts with {{import matplotlib.pyplot as plt}} — {{pyplot}} is the module with the plotting commands and {{plt}} is the universal nickname. For maths and tables you will also import {{numpy as np}} and {{pandas as pd}}.`,
    r: `Install into the same environment your editor or notebook runs; "No module named matplotlib" almost always means a mismatch between the two.`,
    i: `Matplotlib is installed but the import fails in your editor. What do you check first?`,
    c: py`
import matplotlib.pyplot as plt

print(plt.__name__)`,
    v: flow("Install once per environment, import in every file.", "row",
      ["Install Python|and your editor|i", "pip install matplotlib|once per environment|w", "import matplotlib.pyplot as plt|top of every script|g", "plt.plot(…)|start drawing|g"],
      [[0, 1], [1, 2, "same interpreter!"], [2, 3]],
      undefined,
      ["Make sure you know which Python your editor or notebook uses.", "Install into THAT Python — a mismatch is the usual cause of an import error, then import pyplot as plt.", "Now every drawing command starts with plt. or with an axes object."]),
  },
  {
    t: "Your first plot, command by command",
    lv: 1,
    s: `A chart is built by a short list of commands, and nothing appears until the last one. {{plt.plot(x, y)}} puts the data on the chart, {{plt.title}}, {{plt.xlabel}} and {{plt.ylabel}} name it, and {{plt.show()}} displays the finished picture. Drag the slider to run the commands one at a time.`,
    r: `A chart without a title, axis labels and units is a guess. Build the habit of adding all three before you show or save anything.`,
    i: `What does {{plt.show()}} do, and why does a script that never calls it often draw nothing?`,
    c: py`
import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5]
sales = [10, 14, 13, 20, 26]

plt.plot(days, sales, marker="o")
plt.title("Coffee Sales This Week")
plt.xlabel("Day (1 = Mon … 5 = Fri)")
plt.ylabel("Cups sold")
plt.show()`,
    v: plot("Each command adds one thing to the chart. Drag the slider (0 → 4) to run them in order.", {
      x: [0, 6], y: [0, 32], labels: ["Day (1 = Mon … 5 = Fri)", "Cups sold"],
      params: [par("k", "commands run", 0, 4, 1, 4)],
      readout: ["commands run so far: {k} of 4  (plot, title, labels, show)"],
      steps: [
        ["Nothing drawn yet — an empty axes.", { k: 0 }],
        ["plt.plot(days, sales, marker=\"o\") puts the five dots on the chart.", { k: 1 }],
        ["…and joins them with a line, so the trend is visible.", { k: 2 }],
        ["plt.title(...) gives the chart a heading.", { k: 3 }],
        ["plt.xlabel / ylabel say what the axes mean. plt.show() then displays the picture.", { k: 4 }],
      ],
    }, [
      ...[[1, 10], [2, 14], [3, 13], [4, 20], [5, 26]].map(([x, y]) => pt(String(x), String(y), { c: "accent", show: "k-0.5" })),
      ...[[1, 10, 2, 14], [2, 14, 3, 13], [3, 13, 4, 20], [4, 20, 5, 26]].map(([a, b, c, d]) => seg(String(a), String(b), String(c), String(d), { c: "accent", show: "k-1.5" })),
      txt("3", "30", "Coffee Sales This Week", { c: "warn", show: "k-2.5" }),
      txt("1.2", "3", "← Day", { c: "info", show: "k-3.5" }),
      txt("5.3", "31", "Cups sold ↑", { c: "info", show: "k-3.5" }),
    ]),
  },
  {
    t: "Anatomy of a graph: figure, axes, ticks, legend",
    lv: 1,
    s: `Before learning commands, learn the words. The {{Figure}} is the whole image. Inside it sit one or more {{Axes}} — the rectangle where data is drawn, with an x-axis and a y-axis. The axes show numbered {{ticks}}, a {{title}}, {{labels}}, an optional {{legend}} and {{grid}}, and hold the {{artists}}: lines, bars and dots. Documentation and error messages use these words constantly.`,
    r: `"Axes" does not mean "two axis lines" — it is one whole chart. A figure with a 2 × 2 grid has four Axes.`,
    i: `What is the difference between a Figure and an Axes?`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [3, 5, 4])
print(type(fig).__name__)
print(type(ax).__name__)
print(len(ax.lines))`,
    v: layers("Figure → Axes → the things drawn inside the Axes.", [
      "Figure|the whole image or page — made by plt.figure() or plt.subplots()|i",
      "Axes|one chart: the plotting rectangle with its own x- and y-axis (ax)|g",
      "Axis and ticks|the number lines along the edges and their tick marks and labels|p",
      "Artists|lines, dots, bars, text — whatever you draw with ax.plot, ax.bar, …|g",
      "Title, labels, legend, grid|ax.set_title, ax.set_xlabel, ax.legend, ax.grid — what makes it readable|w",
    ], "outside → inside"),
  },
  {
    t: "The fig, ax style (recommended)",
    lv: 1,
    s: `There are two ways to draw. The quick {{plt.plot()}} style quietly draws on "the current chart". The recommended style names the objects: {{fig, ax = plt.subplots()}} gives you the figure and the axes, and you call methods on {{ax}}: {{ax.plot}}, {{ax.set(title=…, xlabel=…, ylabel=…)}}, {{ax.legend()}}. It scales to several charts because you always say which one you mean.`,
    r: `Notebooks, tutorials and production code use fig, ax. The plt.* shortcut is fine for a one-off glance.`,
    i: `Why do most teams prefer {{fig, ax = plt.subplots()}} over a series of {{plt.plot}} calls?`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot([1, 2, 3], [3, 5, 4], marker="o", label="Sales")
ax.set(title="My Chart", xlabel="Day", ylabel="Sales")
ax.legend()
ax.grid(alpha=0.25)
fig.tight_layout()
plt.show()
print(ax.get_title(), "|", ax.get_xlabel())`,
    v: compare("Same chart — the right-hand style says exactly which chart each command touches.", ["plt.* shortcut", "fig, ax style"], [
      ["Create", "nothing — the first plt call makes a chart", "fig, ax = plt.subplots()"],
      ["Draw", "plt.plot(x, y)", "ax.plot(x, y)"],
      ["Name it", "plt.title(...), plt.xlabel(...)", "ax.set(title=..., xlabel=...)"],
      ["Two charts", "easy to draw on the wrong one", "axes[0], axes[1] — always explicit"],
      ["Best for", "a quick look", "anything you will keep or share"],
    ], 1),
  },
  {
    t: "Reading a plotting script line by line",
    lv: 1,
    s: `Watch what each line really creates. {{plt.subplots()}} makes an empty Figure and Axes; {{ax.plot}} adds a line artist to the Axes; {{ax.set}} fills in text; {{plt.show()}} renders it. Variables like {{days}} and {{sales}} are ordinary Python lists — Matplotlib only reads them.`,
    r: `When a chart looks wrong, the cause is nearly always the data you passed in, not Matplotlib. Print the lists first.`,
    i: `Which line of a plotting script actually creates the empty chart, and which one adds the data?`,
    c: py`
import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed"]
sales = [10, 14, 13]
fig, ax = plt.subplots()
ax.plot(days, sales, marker="o")
ax.set(title="Sales", ylabel="Cups")
plt.show()`,
    v: trace("Subplots builds the empty chart, plot adds the line, set adds the text, show displays it.", py`
import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed"]
sales = [10, 14, 13]
fig, ax = plt.subplots()
ax.plot(days, sales, marker="o")
ax.set(title="Sales", ylabel="Cups")
plt.show()`, [
      [3, { days: "['Mon', 'Tue', 'Wed']" }, undefined, "Plain Python list of labels."],
      [4, { sales: "[10, 14, 13]" }, undefined, "Plain Python list of numbers."],
      [5, { fig: "Figure — an empty page", ax: "Axes — an empty chart" }, undefined, "Now there is somewhere to draw."],
      [6, { "ax.lines": "[ one line, 3 markers ]" }, undefined, "ax.plot adds a Line artist to the Axes."],
      [7, { "ax.title": "'Sales'", "ax.ylabel": "'Cups'" }, undefined, "Text is stored on the Axes too."],
      [8, undefined, "(a window or notebook cell shows the chart)", "plt.show() renders everything drawn so far."],
    ]),
  },
];

/* ------------------------------------------------------------------ */
const marks = [35, 42, 48, 50, 52, 55, 58, 60, 61, 64, 66, 68, 70, 74, 76, 80, 82, 83, 88, 92];
const markBin = (m: number, n: number) => Math.min(n - 1, Math.floor(((m - 35) / 57) * n));
const hist6 = [2, 3, 4, 4, 4, 3];
const hist9 = [1, 1, 3, 3, 3, 2, 2, 3, 2];
const hist3 = [5, 8, 7];
const hist12 = [1, 1, 1, 2, 2, 2, 3, 1, 2, 2, 1, 2];

/** Wedge of a pie as a filled polygon: centre + points along the arc. */
function wedge(from: string, to: string, c: "accent" | "info" | "warn" | "purple") {
  const R = 4;
  const pts: [string, string][] = [["0", "0"]];
  for (let j = 0; j <= 10; j++) {
    const a = `pi/2+2*pi*(${from}+(${to}-${from})*${j / 10})/100`;
    pts.push([`${R}*cos(${a})`, `${R}*sin(${a})`]);
  }
  return poly(pts, { c, fill: true });
}

export const chart: ConceptDef[] = [
  {
    t: "Which chart answers which question?",
    lv: 1,
    s: `Pick the chart from the question, not from what looks fancy. Change over time → {{line}}. Compare categories → {{bar}}. Relationship between two numbers → {{scatter}}. How values are spread → {{histogram}}. Typical range and odd values → {{box plot}}. Share of a whole → {{pie}} (few slices) or a bar. A grid of numbers → {{heatmap}}.`,
    r: `A wrong chart type hides the answer; the right one makes it obvious. Ask "what decision should this picture support?" before writing any code.`,
    i: `You have exam scores for 200 students. Which chart shows how they are distributed, and why not a bar or a pie?`,
    v: compare("Question first, chart second.", ["Best chart", "Matplotlib"], [
      ["How does it change over time (or in order)?", "Line chart", "ax.plot(x, y)"],
      ["Which category is bigger?", "Bar chart", "ax.bar(...) / ax.barh(...)"],
      ["Are two numbers related?", "Scatter plot", "ax.scatter(x, y)"],
      ["How are the values spread out?", "Histogram", "ax.hist(values, bins=...)"],
      ["What is typical, and what is unusual?", "Box plot", "ax.boxplot(values)"],
      ["What share of the whole?", "Pie (few slices) or a bar", "ax.pie(shares, labels=...)"],
      ["How does a table of numbers look?", "Heatmap", "ax.imshow(matrix)"],
    ], 0),
  },
  {
    t: "Line chart: how does something change?",
    lv: 1,
    s: `Use {{ax.plot(x, y)}} when the order of the points matters — days, hours, epochs. The line joins the points so the eye follows the trend, and {{marker="o"}} marks each real measurement. Drag Saturday's value and watch the whole shape respond; you see the highest and lowest day without reading a number.`,
    r: `Training loss per epoch, daily active users, sensor readings, price history — anything measured in sequence is a line chart.`,
    i: `When is a line chart the wrong choice for categories?`,
    c: py`
import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
steps = [4000, 6000, 5500, 7500, 9000, 11000, 8500]

fig, ax = plt.subplots()
ax.plot(days, steps, color="royalblue", linewidth=2,
        marker="o", label="Daily steps")
ax.set(title="Walking Progress", xlabel="Day", ylabel="Steps")
ax.grid(alpha=0.3)
ax.legend()
plt.show()`,
    v: plot("Steps walked per day: the shape of the line is the story. Drag Saturday.", {
      x: [0, 8], y: [0, 16000], labels: ["Day (1 = Mon … 7 = Sun)", "Steps"],
      params: [par("s", "Saturday steps", 3000, 15000, 500, 11000)],
      readout: ["Saturday: {s} steps  (Friday was 9000, so the change is {s-9000})"],
      steps: [
        ["Saturday 11,000 — the peak of the week.", { s: 11000 }],
        ["Cut Saturday to 3,000 — the line plunges and the dip is impossible to miss.", { s: 3000 }],
        ["Raise it to 15,000 — a spike, then a drop on Sunday.", { s: 15000 }],
      ],
    }, [
      ...[[1, 4000, 2, 6000], [2, 6000, 3, 5500], [3, 5500, 4, 7500], [4, 7500, 5, 9000]].map(([a, b, c, d]) => seg(String(a), String(b), String(c), String(d), { c: "accent" })),
      seg("5", "9000", "6", "s", { c: "accent" }),
      seg("6", "s", "7", "8500", { c: "accent" }),
      ...[[1, 4000], [2, 6000], [3, 5500], [4, 7500], [5, 9000], [7, 8500]].map(([x, y]) => pt(String(x), String(y), { c: "accent" })),
      pt("6", "s", { c: "warn", label: "Sat {s}" }),
    ]),
  },
  {
    t: "Several lines and a legend",
    lv: 1,
    s: `Call {{ax.plot}} once per series and give each a {{label="…"}}; then {{ax.legend()}} turns those labels into a key. Without labels the legend is empty and the reader cannot tell the lines apart. Use the same x-values so the series are comparable.`,
    r: `Train versus validation loss, this week versus last week, model A versus model B — comparison charts are mostly two or three labelled lines.`,
    i: `You call ax.legend() and nothing appears. What did you forget?`,
    c: py`
import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5, 6, 7]
this_week = [4000, 6000, 5500, 7500, 9000, 11000, 8500]
last_week = [3500, 4200, 5000, 5200, 6100, 7000, 7200]

fig, ax = plt.subplots()
ax.plot(days, this_week, marker="o", label="This week")
ax.plot(days, last_week, marker="s", label="Last week")
ax.set(title="Steps per day", xlabel="Day", ylabel="Steps")
ax.legend()
plt.show()
print([line.get_label() for line in ax.lines])`,
    v: plot("Two labelled series, then a legend that names them.", {
      x: [0, 8], y: [0, 16000], labels: ["Day", "Steps"],
      params: [par("k", "commands run", 0, 2, 1, 2)],
      readout: ["{k}: 0 = first series only · 1 = both lines · 2 = legend added"],
      steps: [
        ["First ax.plot(..., label=\"This week\") draws one line.", { k: 0 }],
        ["A second ax.plot(..., label=\"Last week\") adds a second line — but which is which?", { k: 1 }],
        ["ax.legend() builds the key from the labels. Now the chart can be read.", { k: 2 }],
      ],
    }, [
      ...series([1, 2, 3, 4, 5, 6, 7], [4000, 6000, 5500, 7500, 9000, 11000, 8500], "accent"),
      ...series([1, 2, 3, 4, 5, 6, 7], [3500, 4200, 5000, 5200, 6100, 7000, 7200], "info", "k-0.5"),
      txt("1.9", "15000", "— This week", { c: "accent", show: "k-1.5" }),
      txt("1.9", "14000", "— Last week", { c: "info", show: "k-1.5" }),
    ]),
  },
  {
    t: "Bar chart: which category is bigger?",
    lv: 1,
    s: `Use {{ax.bar(names, values)}} to compare quantities across separate categories; the bar height is the value. Bars should start at zero, because the eye compares lengths. Drag the bananas bar and notice how fast you spot the winner — no need to read the numbers.`,
    r: `Sales per product, error count per endpoint, accuracy per model, class sizes in a dataset — all categories compared.`,
    i: `What is the difference between a bar chart and a histogram?`,
    c: py`
import matplotlib.pyplot as plt

fruits = ["Apples", "Bananas", "Oranges", "Grapes"]
units = [24, 36, 18, 12]

fig, ax = plt.subplots()
ax.bar(fruits, units, color="teal")
ax.set(title="Fruit Sold", ylabel="Units")
plt.show()`,
    v: bars("Bar height = value. The tallest bar wins at a glance.", [["Apples", "24"], ["Bananas", "b"], ["Oranges", "18"], ["Grapes", "12"]], {
      max: 50,
      params: [par("b", "bananas sold", 0, 50, 2, 36)],
      readout: ["bananas: {b} of {24+b+18+12} fruits sold in total"],
      steps: [
        ["Bananas 36 — the tallest bar.", { b: 36 }],
        ["Cut bananas to 10: now apples lead — compare the heights.", { b: 10 }],
        ["Bananas 48 dominate.", { b: 48 }],
      ],
    }),
  },
  {
    t: "Horizontal and grouped bars",
    lv: 2,
    s: `{{ax.barh}} draws horizontal bars — use it when category names are long, so they don't collide along the bottom. To compare two series per category, draw two {{ax.bar}} calls shifted left and right of each tick by half a {{width}}, with the positions made by {{np.arange}}. Add a legend so the reader knows which colour is which.`,
    r: `Comparing models on several metrics (accuracy, precision, recall) is a grouped bar chart.`,
    i: `How do you place two bars side by side for each category?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

models = ["Tree", "Forest", "Neural net"]
precision = [0.81, 0.88, 0.91]
recall = [0.75, 0.84, 0.86]

x = np.arange(len(models))
width = 0.35
fig, ax = plt.subplots()
ax.bar(x - width / 2, precision, width, label="Precision")
ax.bar(x + width / 2, recall, width, label="Recall")
ax.set_xticks(x, labels=models)
ax.legend()
plt.show()
print(x - width / 2)
print(x + width / 2)`,
    v: compare("Same data, three layouts — choose by name length and number of series.", ["ax.bar", "ax.barh", "grouped ax.bar"], [
      ["Looks like", "vertical bars", "horizontal bars", "pairs of bars per category"],
      ["Best when", "short category names", "long names that would overlap", "2–3 series per category"],
      ["Key code", "ax.bar(names, values)", "ax.barh(names, values)", "ax.bar(x - w/2, a, w); ax.bar(x + w/2, b, w)"],
      ["Remember", "start the axis at zero", "ax.invert_yaxis() puts the first item on top", "ax.set_xticks(x, labels=names) and ax.legend()"],
    ], 2),
  },
  {
    t: "Scatter plot: are two numbers related?",
    lv: 1,
    s: `A scatter plot draws one dot per observation: {{ax.scatter(x, y)}}. Dots rising together suggest a relationship; a cloud means little; a lone dot far from the rest is an outlier. Toggle the unusual student on and off: one point swings the trend line from a slope of 8.6 marks per hour to 3.4 and the correlation from 0.998 to 0.394.`,
    r: `Plot features against the target before modelling. Correlation does not prove one thing causes the other, and one outlier can fake or hide a relationship.`,
    i: `What can a single outlier do to a fitted line, and how does a scatter plot help you notice it?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

hours = np.array([1, 2, 3, 4, 5, 6, 7])
marks = np.array([35, 43, 50, 62, 67, 78, 86])

fig, ax = plt.subplots()
ax.scatter(hours, marks, color="purple", s=70)
ax.set(title="Study vs Exam Score", xlabel="Study hours", ylabel="Marks")
ax.grid(alpha=0.25)
plt.show()

slope, intercept = np.polyfit(hours, marks, 1)
print(round(slope, 2), round(intercept, 2))
print(round(np.corrcoef(hours, marks)[0, 1], 3))`,
    v: plot("Each dot is a student. The dashed line is the best straight-line fit — watch it move.", {
      x: [0, 9], y: [0, 100], labels: ["Study hours", "Marks"],
      params: [par("o", "unusual student included (0 = no, 1 = yes)", 0, 1, 1, 0)],
      readout: ["without the unusual student: slope 8.57 marks per hour, correlation 0.998", "with the unusual student (7.7 h, 28 marks): slope 3.40, correlation 0.394"],
      steps: [
        ["Seven students: marks rise steadily with hours studied.", { o: 0 }],
        ["Add one unusual student (7.7 hours, only 28 marks): the fitted line flattens a lot.", { o: 1 }],
      ],
    }, [
      ...[[1, 35], [2, 43], [3, 50], [4, 62], [5, 67], [6, 78], [7, 86]].map(([x, y]) => pt(String(x), String(y), { c: "info" })),
      pt("7.7", "28", { c: "bad", label: "unusual", show: "o-0.5" }),
      line("0", "25.857", "8.571", { c: "warn", dash: true, label: "trend", show: "0.5-o" }),
      line("0", "40.951", "3.400", { c: "warn", dash: true, label: "trend", show: "o-0.5" }),
    ]),
  },
  {
    t: "Scatter: size, colour and transparency",
    lv: 2,
    s: `A scatter plot can carry more than two numbers. {{s}} sets each marker's size, {{c}} colours dots by a value (with a {{cmap}} and a {{colorbar}} to decode it), {{alpha}} makes dots see-through so overlapping points show their density, and {{marker}} changes the shape. Use these to add a third or fourth variable — without cluttering the chart.`,
    r: `With thousands of points, plain dots become a solid blob. A low {{alpha}} (0.1–0.3) reveals where they are dense.`,
    i: `Thousands of points overlap into a blob. What is the simplest fix?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
x = rng.random(50)
y = rng.random(50)
size = rng.integers(20, 200, 50)

fig, ax = plt.subplots()
sc = ax.scatter(x, y, s=size, c=y, cmap="viridis", alpha=0.7)
fig.colorbar(sc, ax=ax, label="y value")
plt.show()
print(size.min() >= 20, len(sc.get_offsets()))`,
    v: compare("Four arguments that add information to the same dots.", ["What it does", "Typical use"], [
      ["s=…", "marker size (area in points²)", "a bubble chart: size = a third number such as population"],
      ["c=…, cmap=…", "colour each dot by a value or a class", "colour by label; add fig.colorbar(sc) to decode the colours"],
      ["alpha=0.3", "transparency from 0 (invisible) to 1", "show density when many dots overlap"],
      ["marker=\"^\"", "dot shape: o s ^ x +", "separate classes without relying on colour alone"],
    ]),
  },
  {
    t: "Histogram: how are values spread out?",
    lv: 1,
    s: `A histogram groups numbers into ranges called {{bins}} and draws one bar per bin: its height is how many values fall in that range. Unlike a bar chart, the bars touch because the x-axis is a continuous number line. Drag the slider to count the 20 exam marks into the bins one by one.`,
    r: `Look at the distribution of every feature before training: is it skewed, does it have a long tail, are there impossible values?`,
    i: `A bar chart and a histogram both have bars. What is the difference?`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

marks = [35, 42, 48, 50, 52, 55, 58, 60,
         61, 64, 66, 68, 70, 74, 76, 80,
         82, 83, 88, 92]

fig, ax = plt.subplots()
counts, edges, patches = ax.hist(marks, bins=6, edgecolor="black", color="skyblue")
ax.set(title="Distribution of Marks", xlabel="Marks", ylabel="Frequency")
plt.show()
print(counts)
print(edges)`,
    v: bars("Each student drops into the bin that contains their mark; the bar height is the count.", [
      ["35–44.5", binFormula(0)],
      ["44.5–54", binFormula(1)],
      ["54–63.5", binFormula(2)],
      ["63.5–73", binFormula(3)],
      ["73–82.5", binFormula(4)],
      ["82.5–92", binFormula(5)],
    ], {
      max: 5,
      params: [par("r", "students counted", 0, 20, 1, 20)],
      readout: ["{r} of 20 marks counted"],
      steps: [
        ["No marks counted yet.", { r: 0 }],
        ["The first five marks (35, 42, 48, 50, 52) fill the first two bins.", { r: 5 }],
        ["Ten marks counted: the middle bins are growing.", { r: 10 }],
        ["All 20 marks counted — most students scored in the middle, with a few at each end.", { r: 20 }],
      ],
    }),
  },
  {
    t: "Bins change the story",
    lv: 2,
    s: `The same data can look very different depending on {{bins}}. Too few bins hide the shape; too many make it jagged and noisy. There is no single right number: try several (a common start is 10–30 for hundreds of points) and keep the one that shows the real shape without chasing noise. You can also give exact edges, {{bins=[0, 50, 70, 100]}}.`,
    r: `A histogram that looks "bimodal" with 30 bins may look flat with 5. Always check more than one bin count before concluding anything.`,
    i: `How do you choose the number of histogram bins?`,
    c: py`
import numpy as np

marks = [35, 42, 48, 50, 52, 55, 58, 60, 61, 64, 66, 68, 70, 74, 76, 80, 82, 83, 88, 92]
for bins in (3, 6, 12):
    counts, edges = np.histogram(marks, bins=bins)
    print(bins, counts)`,
    v: plot("Same 20 marks, different bin counts. Drag the slider (3, 6, 9, 12).", {
      x: [30, 100], y: [0, 9], labels: ["Marks", "Students"],
      params: [par("bins", "number of bins", 3, 12, 3, 6)],
      readout: ["{bins} bins, each {57/bins:1} marks wide"],
      steps: [
        ["3 bins: coarse — it only says the upper two groups are bigger.", { bins: 3 }],
        ["6 bins: a clear single hump around the middle.", { bins: 6 }],
        ["9 bins: still readable, a little more detail.", { bins: 9 }],
        ["12 bins: jagged — random ups and downs, not real structure.", { bins: 12 }],
      ],
    }, [
      ...([[3, hist3], [6, hist6], [9, hist9], [12, hist12]] as [number, number[]][]).flatMap(([b, counts]) =>
        counts.map((n, k) => area(String(n), String(+(35 + (k * 57) / b).toFixed(3)), String(+(35 + ((k + 1) * 57) / b).toFixed(3)), { c: k % 2 ? "info" : "accent", show: `1.5-abs(bins-${b})` })),
      ),
    ]),
  },
  {
    t: "Box plot: spread and outliers",
    lv: 2,
    s: `A box plot compresses a whole dataset into five numbers. The box runs from Q1 (25th percentile) to Q3 (75th), the line inside is the median, and the whiskers reach the furthest points within {{1.5 × IQR}} of the box (IQR = Q3 − Q1). Anything beyond is drawn as a separate dot — a potential outlier, not automatically a mistake. Drag the suspicious reading.`,
    r: `Compare a feature across groups with side-by-side boxes. A flagged point is a question to investigate: sensor glitch, data-entry error or a genuinely rare case.`,
    i: `Explain how a box plot decides which points are outliers.`,
    c: py`
import numpy as np
import matplotlib.pyplot as plt

weights = np.array([98, 99, 99, 100, 100, 101, 101, 102, 145])

fig, ax = plt.subplots()
ax.boxplot(weights, orientation="horizontal")   # Matplotlib 3.10+; older: vert=False
ax.set(title="Package Weights", xlabel="Weight (g)")
plt.show()

q1, q3 = np.percentile(weights, [25, 75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, iqr)
print(low, high)
print(weights[(weights < low) | (weights > high)])`,
    v: plot("Box = middle 50%, line = median, whiskers = reach, dot = beyond the fences.", {
      x: [90, 150], y: [-1, 1], labels: ["Weight (g)", ""],
      params: [par("o", "the largest reading (g)", 103, 150, 1, 145)],
      defs: [["wend", "102+(o-102)*step(104.0001-o)"]],
      readout: ["Q1 = 99, median = 100, Q3 = 101, IQR = 2  →  fences at 96 and 104", "largest reading {o} g  →  upper whisker ends at {wend} g"],
      steps: [
        ["145 g is far beyond the upper fence (104): drawn as a lone dot.", { o: 145 }],
        ["110 g: still beyond the fence, still flagged.", { o: 110 }],
        ["103 g: inside the fence, so the whisker simply reaches it — no outlier.", { o: 103 }],
      ],
    }, [
      vline("96", { c: "warn", dash: true, label: "low fence 96" }),
      vline("104", { c: "warn", dash: true, label: "high fence 104" }),
      poly([["99", "-0.35"], ["101", "-0.35"], ["101", "0.35"], ["99", "0.35"]], { c: "accent", fill: true }),
      seg("100", "-0.35", "100", "0.35", { c: "good" }),
      seg("99", "0", "98", "0", { c: "accent" }),
      seg("98", "-0.15", "98", "0.15", { c: "accent" }),
      seg("101", "0", "wend", "0", { c: "accent" }),
      seg("wend", "-0.15", "wend", "0.15", { c: "accent" }),
      pt("o", "0", { c: "bad", label: "{o} g", show: "o-104.0001" }),
    ]),
  },
  {
    t: "Pie chart: what share of the whole?",
    lv: 1,
    s: `{{ax.pie(shares, labels=names, autopct="%1.0f%%")}} cuts a circle into slices whose sizes add up to 100%. It works for two to five clearly different parts. Drag the rent slice: the others shrink together and it quickly becomes hard to say which of the small slices is biggest — that is why a bar chart is usually the better way to compare.`,
    r: `Use a pie only for a simple "part of a whole" message with few slices. For precise comparisons, or similar values, switch to bars.`,
    i: `Why do many data teams avoid pie charts?`,
    c: py`
import matplotlib.pyplot as plt

categories = ["Rent", "Food", "Transport", "Other"]
shares = [45, 25, 15, 15]

fig, ax = plt.subplots()
ax.pie(shares, labels=categories, autopct="%1.0f%%", startangle=90)
ax.set_title("Monthly Budget")
plt.show()`,
    v: plot("Slices are shares of 100%. Drag rent: everything else shrinks in proportion.", {
      x: [-9.61, 9.61], y: [-5, 5],
      params: [par("rent", "rent share (%)", 20, 70, 5, 45)],
      defs: [
        ["rest", "100-rent"],
        ["food", "rest*25/55"], ["trans", "rest*15/55"], ["oth", "rest*15/55"],
        ["c2", "rent+food"], ["c3", "c2+trans"],
      ],
      readout: ["Rent {rent}%  ·  Food {round(food)}%  ·  Transport {round(trans)}%  ·  Other {round(oth)}%"],
      steps: [
        ["Rent 45% — nearly half the circle.", { rent: 45 }],
        ["Rent 70%: the three small slices are almost the same size — hard to rank by eye.", { rent: 70 }],
        ["Rent 20%: four similar slices. A bar chart would show the order instantly.", { rent: 20 }],
      ],
    }, [
      wedge("0", "rent", "accent"),
      wedge("rent", "c2", "info"),
      wedge("c2", "c3", "warn"),
      wedge("c3", "100", "purple"),
      txt("-7", "3.5", "Rent {rent}%", { c: "accent" }),
      txt("-7", "2.5", "Food {round(food)}%", { c: "info" }),
      txt("-7", "1.5", "Transport {round(trans)}%", { c: "warn" }),
      txt("-7", "0.5", "Other {round(oth)}%", { c: "purple" }),
    ]),
  },
];

/** Formula for a histogram bar that fills as students are counted (r = how many so far). */
function binFormula(k: number) {
  const terms = marks.flatMap((m, i) => (markBin(m, 6) === k ? [`step(r-${i})`] : []));
  return terms.length ? terms.join("+") : "0";
}
