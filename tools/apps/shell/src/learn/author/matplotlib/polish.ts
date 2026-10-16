import { L, area, arrow, cells, compare, hline, par, plot, poly, trace, txt } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { series } from "./basics.js";

/* ------------------------------------------------------------------ */
export const style: ConceptDef[] = [
  {
    t: "Titles, axis labels and units",
    lv: 1,
    s: `A chart without words is a puzzle. Give every chart a {{title}} saying what it shows, an {{xlabel}} and {{ylabel}} naming each axis, and the unit in brackets — {{"Time (s)"}}, {{"Revenue (€)"}}. {{ax.set(title=…, xlabel=…, ylabel=…)}} sets all three in one call. Clear words matter more than decoration.`,
    r: `Charts are pasted into reports and slides without the surrounding text. The title and units must carry the meaning on their own.`,
    i: `What three pieces of text should every chart have?`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3, 4], [3, 5, 4, 8], marker="o")
ax.set(title="Weekly revenue", xlabel="Week", ylabel="Revenue (€)")
plt.show()
print(ax.get_title())
print(ax.get_ylabel())`,
    v: compare("Same data. Only the right-hand chart can be understood on its own.", ["Unlabelled", "Labelled"], [
      ["Title", "(none)", "\"Weekly revenue\""],
      ["x-axis", "1, 2, 3, 4 — of what?", "\"Week\""],
      ["y-axis", "3 … 8 — of what?", "\"Revenue (€)\""],
      ["Reader can answer", "\"something went up\"", "\"revenue doubled by week 4\""],
    ], 1),
  },
  {
    t: "Colours, markers and line styles",
    lv: 1,
    s: `Every {{ax.plot}} accepts {{color}}, {{linestyle}}, {{linewidth}} and {{marker}}. Colours can be names ({{"teal"}}), hex codes ({{"#1f77b4"}}) or one letter ({{"r"}}). There is also a compact format string: {{"o--r"}} means circle markers, dashed line, red. Use colour to separate series, but never rely on colour alone — vary the line style or marker too.`,
    r: `About one in twelve men has colour-vision deficiency. Combine colour with markers or dashes so a printed or greyscale chart still works.`,
    i: `Name three ways to make two lines distinguishable besides colour.`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
line, = ax.plot([1, 2, 3], [2, 4, 3], color="crimson", linestyle="--", marker="s", linewidth=2)
ax.plot([1, 2, 3], [1, 3, 5], "o:g")        # format string: circle, dotted, green
plt.show()
print(line.get_color(), line.get_linestyle(), line.get_marker())`,
    v: compare("The arguments you will use most.", ["Options", "Example"], [
      ["color", "name, hex, or one letter: b g r c m y k w", "color=\"teal\"  ·  \"#1f77b4\"  ·  \"r\""],
      ["linestyle", "solid, dashed, dotted, dash-dot", "\"-\"   \"--\"   \":\"   \"-.\""],
      ["marker", "dot shapes on each data point", "\"o\"   \"s\"   \"^\"   \"x\"   \"+\""],
      ["linewidth / markersize", "thickness in points", "linewidth=2, markersize=8"],
      ["format string", "marker + line + colour in one", "\"o--r\" = circles, dashed, red"],
    ]),
  },
  {
    t: "Legends and grid lines",
    lv: 1,
    s: `A legend is built from the {{label}} you give each artist, so label first, then call {{ax.legend()}}; {{loc="upper left"}} moves it. {{ax.grid(alpha=0.3)}} adds faint reference lines that help the eye read values — keep them light so they never compete with the data.`,
    r: `If the legend hides your data, move it with {{loc}} or put it outside; if every series has the same colour, the legend can't help.`,
    i: `Why is ax.legend() empty even though you plotted two lines?`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [0.9, 0.6, 0.4], label="Train")
ax.plot([1, 2, 3], [1.0, 0.8, 0.75], label="Validation")
ax.legend(loc="upper right")
ax.grid(alpha=0.3)
plt.show()
print([t.get_text() for t in ax.get_legend().get_texts()])`,
    v: trace("label= on each plot call is what ax.legend() reads.", py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [0.9, 0.6, 0.4], label="Train")
ax.plot([1, 2, 3], [1.0, 0.8, 0.75], label="Validation")
ax.legend(loc="upper right")
ax.grid(alpha=0.3)
plt.show()`, [
      [4, { "ax.lines": "[ line 'Train' ]" }, undefined, "The line remembers its label."],
      [5, { "ax.lines": "[ 'Train', 'Validation' ]" }, undefined, "A second line with its own label."],
      [6, { legend: "Train, Validation" }, undefined, "legend() collects the labels of every line on this Axes."],
      [7, { grid: "on, alpha 0.3" }, undefined, "Faint reference lines."],
      [8, undefined, "(chart displayed)"],
    ]),
  },
  {
    t: "Axis limits and honest scales",
    lv: 2,
    s: `Matplotlib picks axis limits automatically; {{ax.set_ylim(low, high)}} overrides them. Be careful: a bar chart whose axis does not start at zero exaggerates tiny differences. Two values of 50 and 52 are nearly equal — but cut the axis at 48 and one bar looks four times taller. Drag the slider and watch the same data change its message.`,
    r: `Truncated axes are the commonest misleading chart. For bars, start at zero; for lines it can be fine to zoom in, but label it clearly.`,
    i: `A bar chart shows one product double the other, but the numbers are 52 and 50. What happened?`,
    c: py`
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.bar(["A", "B"], [50, 52])
ax.set_ylim(48, 55)          # exaggerates the gap — try ax.set_ylim(0, 55)
plt.show()
print(ax.get_ylim())`,
    v: plot("The same two values (A = 50, B = 52). Drag where the y-axis starts.", {
      x: [0, 5], y: [0, 10.5], labels: ["", "bar height as drawn"],
      params: [par("m", "axis starts at", 0, 48, 2, 40)],
      readout: ["axis starts at {m}  →  B looks {(52-m)/(50-m):2}× taller than A", "the truth: 52 / 50 = 1.04×"],
      steps: [
        ["Axis from 0: the bars are almost equal — an honest picture.", { m: 0 }],
        ["Axis from 40: B already looks noticeably bigger.", { m: 40 }],
        ["Axis from 48: B looks several times taller. Same data, very different message.", { m: 48 }],
      ],
    }, [
      area("(50-m)/(55-m)*10", "1", "2.5", { c: "info" }),
      area("(52-m)/(55-m)*10", "3", "4.5", { c: "warn" }),
      txt("1.75", "0.4", "A = 50", { c: "info" }),
      txt("3.75", "0.4", "B = 52", { c: "warn" }),
    ]),
  },
  {
    t: "Annotate: point at what matters",
    lv: 2,
    s: `Don't make the reader hunt. {{ax.annotate("text", xy=(x, y), xytext=(x2, y2), arrowprops=…)}} draws a note with an arrow to a point; {{ax.axhline(y)}} and {{ax.axvline(x)}} draw a reference line (a target, a threshold, the best epoch); {{ax.text(x, y, "…")}} places plain text. One highlighted point teaches more than a paragraph.`,
    r: `Mark the epoch where validation loss is lowest, the threshold line on a metric, or the moment a deployment happened.`,
    i: `How do you mark a target value on a chart with a dashed line?`,
    c: py`
import matplotlib.pyplot as plt

weeks = [1, 2, 3, 4]
revenue = [3, 5, 4, 8]

fig, ax = plt.subplots()
ax.plot(weeks, revenue, marker="o")
ax.axhline(6, linestyle="--", color="gray")
ax.annotate("Best week", xy=(4, 8), xytext=(2.4, 8.4),
            arrowprops=dict(arrowstyle="->"))
plt.show()
print(len(ax.texts))`,
    v: plot("Reference line first, then an arrow to the point that matters.", {
      x: [0, 5], y: [0, 10], labels: ["Week", "Revenue"],
      params: [par("k", "annotations added", 0, 2, 1, 2)],
      readout: ["{k}: 0 = plain line · 1 = target line · 2 = arrow + note"],
      steps: [
        ["Just the data: where should the reader look?", { k: 0 }],
        ["ax.axhline(6, linestyle=\"--\") adds the target. Weeks 2 and 4 beat it.", { k: 1 }],
        ["ax.annotate(...) points straight at the best week.", { k: 2 }],
      ],
    }, [
      ...series([1, 2, 3, 4], [3, 5, 4, 8], "accent"),
      hline("6", { c: "warn", dash: true, label: "target 6", show: "k-0.5" }),
      arrow("2.6", "8.6", "3.85", "8.1", { c: "bad", show: "k-1.5" }),
      txt("2.2", "8.9", "Best week", { c: "bad", show: "k-1.5" }),
    ]),
  },
  {
    t: "Figure size, DPI and saving",
    lv: 1,
    s: `{{figsize=(width, height)}} is in inches and {{dpi}} is dots per inch, so the saved image has {{width × dpi}} by {{height × dpi}} pixels. {{fig.savefig("chart.png", dpi=200, bbox_inches="tight")}} writes the file — call it before {{plt.show()}} in a script, because some backends clear the figure after showing. Use a high dpi (150–300) for print and 100 for the web. PNG is raster; SVG and PDF stay sharp at any size.`,
    r: `A blurry chart in a slide deck is a DPI problem. Save a PNG at dpi=200 or an SVG for documents.`,
    i: `You saved figsize=(8, 4) at dpi=200. What are the image's dimensions?`,
    c: py`
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot([1, 2, 3, 4], [3, 5, 4, 8])
print(fig.get_size_inches(), fig.dpi)
fig.savefig("chart.png", dpi=200)
print(mpimg.imread("chart.png").shape)`,
    v: plot("The rectangle is the figure in inches; the readout is the saved file in pixels.", {
      x: [0, 12], y: [0, 8], labels: ["width (inches)", "height (inches)"],
      params: [par("w", "width (in)", 4, 12, 1, 8), par("h", "height (in)", 2, 8, 1, 4), par("dpi", "dpi", 50, 300, 50, 200)],
      readout: ["figsize = ({w}, {h}) at dpi {dpi}", "image = {w*dpi} × {h*dpi} pixels"],
      steps: [
        ["figsize (8, 4) at dpi 200 → 1600 × 800 pixels.", { w: 8, h: 4, dpi: 200 }],
        ["Same size at dpi 50: a small, blurry 400 × 200 pixel image.", { w: 8, h: 4, dpi: 50 }],
        ["A big 12 × 8 inch figure at dpi 300 → 3600 × 2400 pixels.", { w: 12, h: 8, dpi: 300 }],
      ],
    }, [poly([["0", "0"], ["w", "0"], ["w", "h"], ["0", "h"]], { c: "accent", fill: true }), txt("w/2", "h/2", "{w*dpi} × {h*dpi} px", { c: "info" })]),
  },
  {
    t: "Styles and rcParams",
    lv: 2,
    s: `{{plt.style.use("ggplot")}} switches the look of every later chart in one line; {{plt.style.available}} lists the options. For one setting, change {{plt.rcParams}} — the dictionary of defaults — for example {{plt.rcParams["lines.linewidth"] = 3}}. Set them once at the top of a notebook so every chart in a report matches.`,
    r: `Consistent fonts, sizes and colours make a report look professional; style sheets give you that without editing every chart.`,
    i: `How do you change the default line width for every chart in a notebook?`,
    c: py`
import matplotlib.pyplot as plt

plt.style.use("ggplot")
plt.rcParams["lines.linewidth"] = 3
print("ggplot" in plt.style.available)
print(plt.rcParams["lines.linewidth"])`,
    v: compare("One line changes the whole look.", ["Feel"], [
      ["default", "white background, blue first line"],
      ["ggplot", "grey panel with white grid — R-like"],
      ["seaborn-v0_8", "soft colours, light grid"],
      ["dark_background", "black canvas — for dark slides"],
      ["plt.rcParams[...]", "override a single default (font size, line width, figure size)"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const layout: ConceptDef[] = [
  {
    t: "Subplots: several charts in one figure",
    lv: 1,
    s: `{{fig, axes = plt.subplots(1, 2)}} makes one row of two charts; you get one Figure and an array of Axes, so {{axes[0]}} is the left chart and {{axes[1]}} the right. Think of a dashboard: each panel has its own data, title and labels. Add {{figsize=(10, 4)}} to give them room.`,
    r: `Training loss and accuracy side by side, a feature before and after scaling, one panel per model — all subplots.`,
    i: `What does {{plt.subplots(1, 2)}} return?`,
    c: py`
import matplotlib.pyplot as plt

epochs = [1, 2, 3, 4, 5]
loss = [0.9, 0.65, 0.44, 0.30, 0.23]
accuracy = [0.55, 0.66, 0.76, 0.84, 0.89]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(epochs, loss, marker="o")
axes[0].set_title("Training loss")
axes[1].plot(epochs, accuracy, marker="o")
axes[1].set_title("Training accuracy")
fig.tight_layout()
plt.show()
print(axes.shape)`,
    v: cells("plt.subplots(1, 2) gives one Figure and an array of two Axes — index them like a list.", [L("axes", ["Loss panel", "Accuracy panel"], "pos")], [
      ["axes is an array of 2 Axes: one row, two charts.", [[0, 0, 1]]],
      ["axes[0] is the LEFT chart — here, training loss.", [[0, 0, 0]]],
      ["axes[1] is the RIGHT chart — here, training accuracy.", [[0, 1, 1]]],
    ]),
  },
  {
    t: "A grid of charts: 2 × 2 and flat",
    lv: 2,
    s: `With rows and columns you get a 2D array: {{fig, axes = plt.subplots(2, 2)}} and you pick a chart with {{axes[row, col]}}. To loop over all of them in order, use {{axes.flat}} — it walks the grid left-to-right, top-to-bottom. With one row or one column the array is 1D, and with a single chart {{plt.subplots()}} returns one Axes, not an array.`,
    r: `A common bug is {{axes[1, 0]}} on a 1 × 3 grid — check {{axes.shape}} first.`,
    i: `How do you loop over every Axes in a 2 × 3 grid?`,
    c: py`
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(7, 5))
for i, ax in enumerate(axes.flat):
    ax.plot([0, 1, 2], [0, i, i * 2])
    ax.set_title(f"Panel {i}")
fig.tight_layout()
plt.show()
print(axes.shape)
print(axes[1, 0] is axes.flat[2])`,
    v: cells("axes[row, col] picks a panel; axes.flat walks them in reading order.", [
      L("axes[0]", ["axes[0, 0]", "axes[0, 1]"], "pos"),
      L("axes[1]", ["axes[1, 0]", "axes[1, 1]"], "pos"),
    ], [
      ["A 2 × 2 grid: two rows of two panels."],
      ["axes.flat starts at the top-left: panel 0.", [[0, 0, 0]]],
      ["…then the top-right: panel 1.", [[0, 1, 1]]],
      ["…then the bottom-left: panel 2 — which is axes[1, 0].", [[1, 0, 0]]],
      ["…and the bottom-right: panel 3.", [[1, 1, 1]]],
    ]),
  },
  {
    t: "Shared axes and twin axes",
    lv: 2,
    s: `{{sharex=True}} or {{sharey=True}} makes panels use the same scale, so they can be compared fairly and the repeated numbers disappear. When two series share an x-axis but have different units — temperature and rainfall — {{ax2 = ax1.twinx()}} adds a second y-axis on the right. Colour each axis label like its series, and use twin axes sparingly; they can mislead.`,
    r: `Compare train and test panels with a shared y-axis; otherwise the same loss looks very different just because the scale differs.`,
    i: `When would you use twinx, and what is the risk?`,
    c: py`
import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr"]
temp = [4, 7, 12, 17]
rain = [80, 60, 55, 40]

fig, ax1 = plt.subplots()
ax1.plot(months, temp, color="tomato", marker="o")
ax1.set_ylabel("Temperature (°C)", color="tomato")
ax2 = ax1.twinx()
ax2.bar(months, rain, alpha=0.3)
ax2.set_ylabel("Rain (mm)")
plt.show()
print(ax1.get_ylabel(), "|", ax2.get_ylabel())`,
    v: compare("Same x, different y: share the scale, or add a second axis.", ["sharex / sharey", "twinx()"], [
      ["Purpose", "put panels on one common scale", "two units on one panel"],
      ["Typical use", "compare train and test fairly", "temperature (°C) with rainfall (mm)"],
      ["Call", "plt.subplots(1, 2, sharey=True)", "ax2 = ax1.twinx()"],
      ["Watch out", "hides tick labels on inner panels (that is intended)", "two scales can suggest a link that is not there"],
    ]),
  },
  {
    t: "Spacing: tight_layout and constrained layout",
    lv: 2,
    s: `Titles and labels can collide with neighbouring panels or be cut off. {{fig.tight_layout()}} nudges the spacing so everything fits; the newer {{plt.subplots(..., layout="constrained")}} does this continuously and also handles colorbars and legends better. When saving, {{bbox_inches="tight"}} trims the border. Pick one approach per figure.`,
    r: `If axis labels overlap or are chopped off in a saved image, the layout is the first thing to fix.`,
    i: `Your y-axis label is cut off in the saved PNG. Name two fixes.`,
    c: py`
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, layout="constrained")
for ax in axes.flat:
    ax.set(title="A long title", xlabel="x label", ylabel="y label")
plt.show()
print(type(fig.get_layout_engine()).__name__)`,
    v: compare("Three ways to stop labels overlapping or clipping.", ["tight_layout()", "layout=\"constrained\"", "bbox_inches=\"tight\""], [
      ["When", "after drawing, before show/save", "when creating the figure", "when saving only"],
      ["Handles", "axes labels and titles", "labels, titles, colorbars, legends", "crops outer whitespace in the file"],
      ["Call", "fig.tight_layout()", "plt.subplots(2, 2, layout=\"constrained\")", "fig.savefig(\"a.png\", bbox_inches=\"tight\")"],
    ], 1),
  },
];
