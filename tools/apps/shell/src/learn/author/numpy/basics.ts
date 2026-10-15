import { L, area, cells, compare, flow, par, plot, pt, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* Example outputs are NOT written here: `npm run outputs -- numpy` runs each snippet with real NumPy. */

/* ------------------------------------------------------------------ */
export const start: ConceptDef[] = [
  {
    t: "Why NumPy: lists versus arrays",
    lv: 1,
    s: `A Python list holds any objects, so {{list * 2}} repeats it and arithmetic needs a loop. A NumPy array holds numbers of one type packed side by side, so one operation applies to every element at once — "vectorised" — in fast compiled code. NumPy is the foundation under pandas, scikit-learn and the deep-learning frameworks.`,
    r: `Features, weights, images and predictions are all arrays. Every ML library speaks NumPy.`,
    i: `Why does {{array * 0.9}} work but {{list * 0.9}} fail, and why is NumPy faster on big numeric data?`,
    c: py`
import numpy as np

prices = [100, 200, 300]
print(prices * 2)
arr = np.array(prices)
print(arr * 2)
print(arr * 0.9)`,
    v: compare("A list is a basket of objects; an array is a tray of numbers built for maths.", ["Python list", "NumPy array"], [
      ["prices * 2", "repeats the list: [100, 200, 300, 100, 200, 300]", "doubles every number: [200 400 600]"],
      ["prices * 0.9", "TypeError — a list can't be multiplied by a float", "scales every number at once"],
      ["Stores", "any mix of Python objects", "numbers of one fixed type, packed together"],
      ["Big numeric data", "a slow Python-level loop", "a fast compiled loop"],
    ], 1),
  },
  {
    t: "Install, import and your first array",
    lv: 1,
    s: `Install once with {{python -m pip install numpy}} (in a terminal, not inside the Python prompt; in a notebook use {{%pip install numpy}}). Then every script starts with {{import numpy as np}} — {{np}} is the universal nickname. {{np.array([...])}} turns a list into an array.`,
    r: `Almost every AI notebook starts with the same two lines: {{import numpy as np}} and a data load.`,
    i: `If importing NumPy fails even though pip says it is installed, what is the most likely cause?`,
    c: py`
import numpy as np

a = np.array([10, 20, 30])
print(a)
print(type(a))`,
    v: flow("Install once, import in every file, then build arrays.", "row",
      ["Install Python|python.org / your editor|i", "pip install numpy|once per environment|w", "import numpy as np|top of every script|g", "np.array([…])|your first array|g"],
      [[0, 1], [1, 2, "same interpreter!"], [2, 3]],
      undefined,
      ["Install NumPy into the SAME environment your editor runs — a mismatch is the usual cause of 'No module named numpy'.", "Import it with the standard nickname np.", "Create an array from a list and start computing."]),
  },
  {
    t: "Arrays, dimensions and shape",
    lv: 1,
    s: `Think of dimensions as the directions you need to locate a value. 1D: one position (a vector). 2D: row and column (a matrix). 3D: layer, row, column. The {{shape}} tuple lists the size along each direction, {{ndim}} counts them and {{size}} is the total number of values.`,
    r: `A dataset is a 2D array (rows = examples, columns = features); a batch of images is 4D. Reading shapes fluently is the most useful NumPy skill.`,
    i: `What are the shape, ndim and size of {{np.array([[70, 85, 90], [80, 75, 95]])}}?`,
    c: py`
import numpy as np

one_d = np.array([70, 85, 90])
two_d = np.array([[70, 85, 90], [80, 75, 95]])
print(one_d.ndim, one_d.shape)
print(two_d.ndim, two_d.shape)
print(two_d.size)`,
    v: cells("shape lists the size of each dimension: (rows, columns) for a table.", [L("one_d", ["70", "85", "90"], "pos")], [
      ["A 1D array: one direction. shape = (3,), ndim = 1."],
      ["Stack two rows and it becomes 2D: shape (2, 3) — 2 rows, 3 columns.", [[0, 0, 2]], [L("two_d[0]", ["70", "85", "90"], "pos"), L("two_d[1]", ["80", "75", "95"], "pos")]],
      ["ndim = 2 (two directions) and size = 2 × 3 = 6 values in total.", [[0, 0, 2], [1, 0, 2]]],
    ]),
  },
  {
    t: "Creating arrays",
    lv: 1,
    s: `Rather than typing numbers, create them: {{zeros}}, {{ones}} and {{full}} fill a shape, {{arange}} counts like {{range}} (stop excluded), {{linspace}} gives evenly spaced values including both ends, and {{eye}} is the identity matrix. Pass the shape as a tuple.`,
    r: `Weights start as arrays of random numbers or zeros; masks and padding use {{zeros}} and {{ones}}; {{linspace}} makes x-values for plots.`,
    i: `What is the difference between {{arange(0, 1, 0.25)}} and {{linspace(0, 1, 5)}}?`,
    c: py`
import numpy as np

print(np.zeros((2, 3)))
print(np.full((2, 2), 7))
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))
print(np.eye(3))`,
    v: compare("One call, a whole array.", ["Result"], [
      ["np.zeros((2, 3))", "2 rows × 3 columns of 0."],
      ["np.ones((2, 2))", "a 2 × 2 grid of 1."],
      ["np.full((2, 2), 7)", "a 2 × 2 grid of 7"],
      ["np.arange(0, 10, 2)", "[0 2 4 6 8] — stop 10 excluded"],
      ["np.linspace(0, 1, 5)", "[0. 0.25 0.5 0.75 1.] — five points, both ends included"],
      ["np.eye(3)", "3 × 3 identity: 1 on the diagonal, 0 elsewhere"],
    ]),
  },
  {
    t: "Data types and astype",
    lv: 1,
    s: `Every array stores one data type ({{dtype}}): {{int64}}, {{float64}}, {{bool}}, {{uint8}}… A mix is upgraded to a common type, so one decimal makes the whole array float. {{astype}} converts — and converting float to int truncates toward zero, it does not round.`,
    r: `Pixels are {{uint8}}, model weights are {{float32}} or {{float64}}; mismatched dtypes cause silent precision loss and shape-correct but wrong results.`,
    i: `What does {{np.array([3.9, -3.9]).astype(int)}} return?`,
    c: py`
import numpy as np

a = np.array([1, 2, 3], dtype=np.float64)
print(a.dtype)
print(a.astype(np.int32))
b = np.array([1, 2.5, 3])
print(b)
c = np.array([3.9, -3.9]).astype(int)
print(c)`,
    v: trace("One dtype per array: a decimal upgrades the lot, and astype(int) chops the fraction.", py`
import numpy as np

a = np.array([1, 2, 3], dtype=np.float64)
print(a.dtype)
print(a.astype(np.int32))
b = np.array([1, 2.5, 3])
print(b)
c = np.array([3.9, -3.9]).astype(int)
print(c)`, [
      [3, { a: "[1. 2. 3.]  (float64)" }, undefined, "dtype=np.float64 stores the integers as decimals."],
      [4, undefined, "float64"],
      [5, undefined, "[1 2 3]", "astype makes a NEW integer array; a is unchanged."],
      [6, { b: "[1.  2.5 3. ]  (float64)" }, undefined, "One 2.5 in the list → every element becomes a float."],
      [7, undefined, "[1.  2.5 3. ]"],
      [8, { c: "[ 3 -3]  (int64)" }, undefined, "3.9 → 3 and −3.9 → −3: truncation toward zero, NOT rounding."],
      [9, undefined, "[ 3 -3]"],
    ]),
  },
  {
    t: "Three dimensions: stacks and images",
    lv: 2,
    s: `A 3D array is a stack of 2D tables — frames of a video, or the colour channels of an image. {{three_d[1, 0, 1]}} means layer 1, row 0, column 1. Add the three sizes in order: (layers, rows, columns). A colour image is (height, width, 3).`,
    r: `Colour images, audio spectrograms and batches of sequences are 3D arrays; deep-learning layers expect exactly these shapes.`,
    i: `What is the shape of two 2×2 frames stacked together, and what does {{a[1, 0, 1]}} select?`,
    c: py`
import numpy as np

three_d = np.array([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
print(three_d.ndim, three_d.shape)
print(three_d[1, 0, 1])
print(three_d[0])`,
    v: cells("Layers of rows of columns: pick the layer first, then the row, then the column.", [L("frame 0 · row 0", ["1", "2"], "pos"), L("frame 0 · row 1", ["3", "4"], "pos"), L("frame 1 · row 0", ["5", "6"], "pos"), L("frame 1 · row 1", ["7", "8"], "pos")], [
      ["Two frames, each 2 × 2: shape (2, 2, 2)."],
      ["three_d[0] is the whole first frame.", [[0, 0, 1], [1, 0, 1]]],
      ["three_d[1] is the second frame.", [[2, 0, 1], [3, 0, 1]]],
      ["three_d[1, 0, 1]: frame 1, row 0, column 1 → 6.", [[2, 1, 1]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
const six = [10, 20, 30, 40, 50, 60];

export const index: ConceptDef[] = [
  {
    t: "Indexing and negative indexes",
    lv: 1,
    s: `Counting starts at 0, exactly like Python lists. {{a[0]}} is the first element and {{a[-1]}} the last. Asking for a position that doesn't exist raises {{IndexError}}. For arrays this is the same idea, just faster and with more dimensions.`,
    r: `Picking one pixel, one feature or the last time step is an index.`,
    i: `What do {{a[0]}}, {{a[-1]}} and {{a[6]}} return for a six-element array?`,
    c: py`
import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[0])
print(a[-1])
print(a[-2])`,
    v: cells("Positions count from 0 at the front and from −1 at the back.", [L("a", six.map(String))], [
      ["Six values. Each box shows its position from the start and (purple) from the end."],
      ["a[0] is the first element: 10.", [[0, 0, 0]]],
      ["a[-1] is the last element: 60.", [[0, 5, 5]]],
      ["a[-2] is the second from the end: 50.", [[0, 4, 4]]],
    ]),
  },
  {
    t: "Slicing: start:stop:step",
    lv: 1,
    s: `{{a[start:stop]}} selects a run of elements: the start is included and the stop is excluded. Leave one blank for "from the beginning" or "to the end". A third number is the step, and {{[::-1]}} reverses. A slice of an array is a VIEW of the same data, not a copy.`,
    r: `Splitting data into train/test, taking a window of a time series, or selecting a column all use slicing.`,
    i: `What does {{a[1:4]}} return for {{[10, 20, 30, 40, 50, 60]}}?`,
    c: py`
import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[1:4])
print(a[:3])
print(a[-2:])
print(a[::2])
print(a[::-1])`,
    v: plot("Move the sliders: orange values are inside a[start:stop]. The stop index is never included.", { x: [-0.6, 5.6], y: [-1, 1.8], labels: ["position", ""],
      params: [par("start", "start", 0, 6, 1, 1), par("stop", "stop (excluded)", 0, 6, 1, 4)],
      readout: ["a[{start}:{stop}]  →  {max(0,stop-start)} elements, positions {start} to {stop-1}"],
      steps: [
        ["a[1:4] takes positions 1, 2 and 3 — the value at position 4 is the stop, so it stays out.", { start: 1, stop: 4 }],
        ["a[:3] means from the beginning: positions 0, 1, 2.", { start: 0, stop: 3 }],
        ["a[4:] runs to the end: positions 4 and 5 (like a[-2:]).", { start: 4, stop: 6 }],
        ["a[2:2] is empty — start and stop meet.", { start: 2, stop: 2 }],
      ] }, [
      area("0.7", "start-0.5", "stop-0.5", { c: "warn" }),
      ...six.map((v, i) => pt(String(i), "0", { c: "warn", label: String(v), show: `step(${i}-start+0.5)*step(stop-${i}-0.5)` })),
      ...six.map((v, i) => pt(String(i), "0", { c: "muted", label: String(v), show: `1-step(${i}-start+0.5)*step(stop-${i}-0.5)` })),
    ]),
  },
  {
    t: "Negative steps and strides",
    lv: 2,
    s: `The step in {{a[::2]}} skips elements: every second one. A negative step walks backwards, so {{a[::-1]}} is the array reversed and {{a[-2:]}} is "the last two". Because slices are views, reversing or striding costs no copying at all.`,
    r: `Reversing a signal, subsampling every nth frame, or taking the most recent values are one-line slices.`,
    i: `How do you get every other element, and how do you reverse an array?`,
    c: py`
import numpy as np

a = np.arange(10, 70, 10)
print(a[::2])
print(a[1::2])
print(a[::-1])
print(a[-3:])`,
    v: cells("The step decides how far to jump between selected elements.", [L("a", six.map(String))], [
      ["Six values at positions 0 to 5."],
      ["a[::2] — every second element starting at 0 → 10, 30, 50.", [[0, 0, 0], [0, 2, 2], [0, 4, 4]]],
      ["a[1::2] — start at 1 instead → 20, 40, 60.", [[0, 1, 1], [0, 3, 3], [0, 5, 5]]],
      ["a[::-1] — negative step walks backwards: the whole array reversed.", [[0, 0, 5]]],
      ["a[-3:] — the last three elements.", [[0, 3, 5]]],
    ]),
  },
  {
    t: "Indexing 2D arrays: rows and columns",
    lv: 1,
    s: `For a table use {{a[row, col]}}. A colon means "all": {{a[:, 0]}} is every row of column 0 (the first column), {{a[1, :]}} is all of row 1. This row-and-column selection is how you split features from labels.`,
    r: `{{X[:, :-1]}} (all features) and {{X[:, -1]}} (the label column) are everywhere in ML code.`,
    i: `Select the first column and the last row of a 2D array.`,
    c: py`
import numpy as np

marks = np.array([[70, 85, 90], [80, 75, 95]])
print(marks[1, 2])
print(marks[:, 0])
print(marks[0, :])
print(marks[:, 1:])`,
    v: cells("The first number picks rows, the second picks columns; a colon keeps them all.", [L("marks[0]", ["70", "85", "90"], "pos"), L("marks[1]", ["80", "75", "95"], "pos")], [
      ["A 2 × 3 table: students × subjects."],
      ["marks[1, 2] → row 1, column 2 → 95.", [[1, 2, 2]]],
      ["marks[:, 0] → every row, column 0 → [70 80].", [[0, 0, 0], [1, 0, 0]]],
      ["marks[0, :] → row 0, every column → [70 85 90].", [[0, 0, 2]]],
      ["marks[:, 1:] → every row, columns 1 onward.", [[0, 1, 2], [1, 1, 2]]],
    ]),
  },
  {
    t: "Boolean masks: filtering without loops",
    lv: 1,
    s: `A comparison like {{marks >= 50}} gives an array of True/False — a mask. Use the mask as an index and you keep only the True positions: {{marks[marks >= 50]}}. No loop, and it works on any shape. Unlike a slice, a mask selection returns a copy.`,
    r: `Selecting rows that meet a condition (labels equal 1, values above a threshold, non-missing entries) is a mask.`,
    i: `How does {{a[a >= 50]}} work, step by step?`,
    c: py`
import numpy as np

marks = np.array([35, 48, 50, 67, 91])
mask = marks >= 50
print(mask)
print(marks[mask])
print(marks[marks < 50])`,
    v: plot("Slide the pass mark: the green marks make the mask True and survive the filter.", { x: [0, 100], y: [-1, 1.5], labels: ["mark", ""],
      params: [par("t", "pass mark", 0, 100, 1, 50)],
      readout: ["mask = marks >= {t}", "marks that pass: {step(35-t+0.0001)+step(48-t+0.0001)+step(50-t+0.0001)+step(67-t+0.0001)+step(91-t+0.0001)} of 5"],
      steps: [
        ["Pass mark 50: 50, 67 and 91 pass — the mask is [False False True True True].", { t: 50 }],
        ["Raise it to 70: only 91 survives.", { t: 70 }],
        ["Lower it to 30: everyone passes.", { t: 30 }],
      ] }, [
      vline("t", { c: "accent", dash: true, label: "pass mark" }),
      ...[35, 48, 50, 67, 91].map((v) => pt(String(v), "0", { c: "good", label: String(v), show: `${v}-t+0.0001` })),
      ...[35, 48, 50, 67, 91].map((v) => pt(String(v), "0", { c: "bad", label: String(v), show: `t-${v}-0.0001` })),
    ]),
  },
  {
    t: "np.where: choose by condition",
    lv: 2,
    s: `{{np.where(cond, a, b)}} builds a new array by picking {{a}} where the condition is True and {{b}} elsewhere — an if/else for a whole array. With only the condition, {{np.where(cond)}} returns the positions where it is True.`,
    r: `Replacing negatives with 0, turning probabilities into class labels, or flagging outliers all use {{np.where}}.`,
    i: `Write a one-liner that labels marks as "Pass" or "Fail".`,
    c: py`
import numpy as np

marks = np.array([35, 48, 50, 67, 91])
print(np.where(marks >= 50, "Pass", "Fail"))
print(np.where(marks >= 50)[0])
print(np.where(marks < 50, 0, marks))`,
    v: cells("A vectorised if/else: one condition decides every element.", [L("marks", ["35", "48", "50", "67", "91"], "pos")], [
      ["Five marks."],
      ["marks >= 50 → the condition for each element.", [[0, 0, 4]], [L("marks", ["35", "48", "50", "67", "91"], "pos"), L("marks >= 50", ["F", "F", "T", "T", "T"], "pos")]],
      ["np.where picks 'Pass' where True and 'Fail' where False.", [[1, 0, 4]], [L("marks", ["35", "48", "50", "67", "91"], "pos"), L("marks >= 50", ["F", "F", "T", "T", "T"], "pos"), L("result", ["Fail", "Fail", "Pass", "Pass", "Pass"], "pos")]],
    ]),
  },
  {
    t: "Combining conditions with & | ~",
    lv: 2,
    s: `To combine masks use {{&}} (and), {{|}} (or) and {{~}} (not) — each condition in parentheses. Python's {{and}} / {{or}} fail on arrays because they need a single True or False. {{(marks >= 50) & (marks <= 90)}} is the mark range 50–90.`,
    r: `Selecting "age between 18 and 65 and country == X" from a feature matrix is exactly this.`,
    i: `Why does {{a > 1 and a < 5}} raise an error on an array, and how do you fix it?`,
    c: py`
import numpy as np

marks = np.array([35, 48, 50, 67, 91])
inside = (marks >= 50) & (marks <= 90)
print(inside)
print(marks[inside])
print(marks[(marks < 40) | (marks > 90)])
print(marks[~inside])`,
    v: cells("Each condition makes a mask; & keeps positions where both are True.", [L("marks", ["35", "48", "50", "67", "91"], "pos")], [
      ["Five marks."],
      ["marks >= 50", [[0, 2, 4]], [L("marks", ["35", "48", "50", "67", "91"], "pos"), L(">= 50", ["F", "F", "T", "T", "T"], "pos")]],
      ["marks <= 90", [[1, 0, 4]], [L("marks", ["35", "48", "50", "67", "91"], "pos"), L(">= 50", ["F", "F", "T", "T", "T"], "pos"), L("<= 90", ["T", "T", "T", "T", "F"], "pos")]],
      ["Combine with & — True only where BOTH are True: 50 and 67.", [[0, 2, 3]], [L("marks", ["35", "48", "50", "67", "91"], "pos"), L(">= 50", ["F", "F", "T", "T", "T"], "pos"), L("<= 90", ["T", "T", "T", "T", "F"], "pos"), L("both (&)", ["F", "F", "T", "T", "F"], "pos")]],
    ]),
  },
  {
    t: "Fancy indexing with lists of positions",
    lv: 2,
    s: `Index with a list (or array) of positions to pick elements in any order, repeating if you like: {{a[[0, 2, 4]]}}. Unlike a slice, fancy indexing returns a COPY. Combined with {{argsort}} it reorders data by another array; with a random permutation it shuffles rows.`,
    r: `Shuffling a dataset, picking a batch by index, or sorting predictions by confidence all use index arrays.`,
    i: `How would you reorder one array by the order that sorts another?`,
    c: py`
import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[[0, 2, 4]])
print(a[[5, 0, 0]])
scores = np.array([0.3, 0.9, 0.1])
names = np.array(["a", "b", "c"])
print(names[np.argsort(-scores)])`,
    v: cells("A list of positions picks exactly those elements, in that order.", [L("a", six.map(String))], [
      ["Six values."],
      ["a[[0, 2, 4]] picks positions 0, 2 and 4 → [10 30 50].", [[0, 0, 0], [0, 2, 2], [0, 4, 4]]],
      ["a[[5, 0, 0]] can reorder and repeat: 60, 10, 10.", [[0, 5, 5], [0, 0, 0]]],
    ]),
  },
];

