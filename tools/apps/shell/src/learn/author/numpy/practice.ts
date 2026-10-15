import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["start", 1, "What is the main difference between a Python list and a NumPy array?", "A list holds any Python objects; an array holds numbers of ONE type packed in memory. Operations apply element by element ({{arr * 2}} doubles each value; {{list * 2}} repeats the list) and run in fast compiled code."],
  ["start", 1, "What do {{shape}}, {{ndim}} and {{size}} tell you?", "{{shape}} is the size along each dimension, {{ndim}} the number of dimensions and {{size}} the total number of elements. For shape (2, 3): ndim = 2, size = 6."],
  ["start", 1, "What is a dtype and why does it matter?", "The type of every element ({{int64}}, {{float64}}, {{uint8}}, {{bool}}). A mixed list is upgraded to a common type, {{astype}} converts, and integer types can overflow or truncate silently."],
  ["start", 2, "What does {{astype(int)}} do to 3.9 and −3.9?", "It truncates toward zero, giving 3 and −3. It does not round; use {{np.round}} first if you want rounding."],
  ["start", 1, "Difference between {{arange}} and {{linspace}}?", "{{arange(start, stop, step)}} steps by a size and excludes the stop; {{linspace(start, stop, num)}} gives a fixed number of evenly spaced points and includes both ends."],
  ["index", 1, "What does {{a[1:4]}} return?", "Elements at positions 1, 2 and 3 — the start is included, the stop excluded. It is a view of the original data."],
  ["index", 1, "How do you select the first column of a 2D array?", "{{a[:, 0]}} — all rows, column 0. {{a[0, :]}} is the first row."],
  ["index", 1, "What is a boolean mask?", "An array of True/False from a comparison, such as {{a >= 50}}. Used as an index ({{a[mask]}}) it keeps only the True positions — filtering without a loop."],
  ["index", 2, "Why does {{a > 1 and a < 5}} fail on an array?", "Python's {{and}} needs one True/False, but an array has many. Use {{&}} with parentheses: {{(a > 1) & (a < 5)}}."],
  ["index", 2, "What does {{np.where(cond, x, y)}} do?", "An element-wise if/else: x where the condition is True, y elsewhere. With just a condition it returns the positions where it is True."],
  ["index", 2, "Is fancy indexing a view or a copy?", "A copy. Slices are views; index lists/arrays and boolean masks return copies."],
  ["math", 1, "What is vectorisation?", "Applying an operation to a whole array at once instead of looping in Python. It is shorter, clearer and typically much faster because the loop runs in compiled code."],
  ["math", 1, "Element-wise {{*}} versus matrix {{@}}?", "{{*}} multiplies matching positions and keeps the shape; {{@}} is the linear-algebra product (rows times columns, summed) and needs matching inner dimensions."],
  ["math", 2, "State the broadcasting rule.", "Compare shapes from the right. Each pair of sizes must be equal or one must be 1 (a missing leading size counts as 1). Sizes of 1 are stretched. (2,3)+(3,) works; (2,3)+(2,) does not."],
  ["math", 1, "What do {{axis=0}} and {{axis=1}} mean for a table?", "{{axis=0}} works down the rows, giving one result per column; {{axis=1}} works across the columns, giving one result per row. The axis you name disappears from the shape."],
  ["math", 2, "What does {{ddof}} change in {{std}}?", "NumPy's default divides by n (population, ddof=0). {{ddof=1}} divides by n − 1 for the sample standard deviation."],
  ["math", 2, "What is the difference between {{argmax}} and {{max}}?", "{{max}} returns the largest value; {{argmax}} returns its position. {{a[a.argmax()]}} equals {{a.max()}}."],
  ["math", 2, "What does {{argsort}} return?", "The positions that would sort the array. Use it to reorder another array or to take the top-k: {{np.argsort(a)[::-1][:k]}}."],
  ["shape", 1, "What does {{reshape(1, -1)}} do?", "Turns an array into one row; the −1 is inferred from the element count. Three values become shape (1, 3). The element count must stay the same."],
  ["shape", 2, "{{flatten}} versus {{ravel}}?", "{{flatten}} always returns a copy; {{ravel}} returns a view when possible, so editing it can change the original."],
  ["shape", 1, "{{np.concatenate}} versus {{np.stack}}?", "Concatenate joins along an existing axis (two (2,) arrays become (4,)); stack creates a new axis (two (2,) arrays become (2, 2))."],
  ["shape", 2, "How do you turn a (3,) array into a column?", "{{a[:, np.newaxis]}} or {{a.reshape(-1, 1)}} gives shape (3, 1). A column plus a row broadcasts to a (3, 3) table."],
  ["linalg", 1, "What shape does {{X @ W}} have for (32, 20) and (20, 64)?", "(32, 64): the inner 20s match and vanish; the outer sizes remain."],
  ["linalg", 1, "Write a dense layer with ReLU in NumPy.", "{{Z = X @ W + b}} then {{A = np.maximum(0, Z)}}. The bias broadcasts across the batch."],
  ["linalg", 2, "Why prefer {{np.linalg.solve}} to {{np.linalg.inv}}?", "Solving {{A x = b}} directly is faster and numerically more accurate than forming the inverse and multiplying."],
  ["linalg", 2, "How do you compute the distance from one point to many?", "{{np.linalg.norm(points - q, axis=1)}} — broadcasting subtracts q from every row, the norm is taken per row."],
  ["data", 1, "Why does the mean of an array with a NaN return NaN, and what do you do?", "NaN propagates through arithmetic. Use {{np.nanmean}} (or drop with {{a[~np.isnan(a)]}}); decide deliberately whether to ignore, fill or remove missing values."],
  ["data", 2, "How do you detect outliers with the IQR rule?", "Compute Q1 and Q3 with {{np.percentile(a, [25, 75])}}, IQR = Q3 − Q1, and flag values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR."],
  ["data", 1, "Why use a seed with {{default_rng}}?", "The same seed reproduces the same random sequence (for the same code and library version), so experiments can be repeated and compared."],
  ["data", 1, "{{.npy}} versus CSV for saving arrays?", "{{.npy}} keeps dtype and shape exactly and is fast; CSV is human-readable text but loses types. {{.npz}} stores several named arrays."],
  ["memory", 2, "What is a view and why can it be dangerous?", "A view shares memory with the original array, so writing through it changes the original. Use {{.copy()}} when you need independence; check with {{np.shares_memory}}."],
  ["memory", 2, "What happens to a uint8 array when values exceed 255?", "They wrap around silently (200 + 100 becomes 44). Convert to a wider type with {{astype}} before arithmetic, then clip."],
  ["memory", 2, "Why not compare floats with {{==}}?", "Floating-point rounding makes {{0.1 + 0.2 == 0.3}} False. Use {{np.isclose}} / {{np.allclose}} with a tolerance."],
  ["memory", 1, "Why is NumPy fast?", "Data sits in one contiguous block of a single type and operations run in compiled C loops, avoiding per-element Python overhead. Always measure with %timeit."],
  ["ai", 1, "How is a grayscale image stored, and a colour image?", "Grayscale: a 2D array (height, width) of 0–255 values. Colour: (height, width, 3) channels; a batch adds a leading dimension."],
  ["ai", 1, "Why scale features, and how with NumPy?", "Different scales distort many models. Min–max: {{(X − X.min(axis=0)) / (X.max(axis=0) − X.min(axis=0))}}. Standardise: {{(X − X.mean(axis=0)) / X.std(axis=0)}}. Fit the numbers on training data only."],
  ["ai", 2, "How do you compute softmax safely?", "Subtract the maximum before exponentiating — {{np.exp(z - z.max())}} — then divide by the sum. This prevents overflow and does not change the result."],
  ["ai", 2, "How do you shuffle X and y together?", "Draw one permutation of row indices, {{idx = rng.permutation(len(X))}}, and use it on both: {{X[idx]}}, {{y[idx]}}."],
  ["ai", 2, "One-hot encode labels and compute accuracy in NumPy.", "{{np.eye(k)[labels]}} gives one-hot rows; accuracy is {{(pred == labels).mean()}}."],
];

export const drills: DrillDef[] = [
  {
    t: "Slicing a 1D array",
    q: "What does this print?",
    code: py`
import numpy as np
a = np.array([5, 10, 15, 20])
print(a[1:3])`,
    opts: [["[10 15]", true, "Start 1 is included, stop 3 is excluded: positions 1 and 2."], ["[10 15 20]", false, "That would include position 3, the stop."], ["[5 10 15]", false, "The slice starts at position 1, not 0."]],
    path: ["a has positions 0:5, 1:10, 2:15, 3:20.", "a[1:3] takes positions 1 and 2.", "Result: [10 15]."],
    why: "A slice includes the start and excludes the stop.",
    watch: "The result is a view of a, not a copy.",
    remember: "start included, stop excluded.",
  },
  {
    t: "The axis argument",
    q: "For an array of shape (4, 3), what is the shape of the result?",
    code: py`
import numpy as np
a = np.ones((4, 3))
print(a.mean(axis=0).shape)`,
    opts: [["(3,)", true, "axis=0 collapses the rows: one mean per column, so 3 values."], ["(4,)", false, "That is mean(axis=1): one mean per row."], ["()", false, "A single number would need no axis at all."]],
    path: ["The array has 4 rows and 3 columns.", "axis=0 averages down the rows, removing that dimension.", "What remains is the column dimension: shape (3,)."],
    why: "The axis you name disappears from the shape.",
    watch: "Don't mix up the meaning of axis=0 and axis=1.",
    remember: "axis=0 → one result per column.",
  },
  {
    t: "Can these broadcast?",
    q: "What happens with a shape (4, 3) array plus a shape (3,) array?",
    code: py`
import numpy as np
a = np.zeros((4, 3))
b = np.array([1, 2, 3])
print((a + b).shape)`,
    opts: [["(4, 3) — the vector is added to every row", true, "From the right, 3 matches 3, and the missing leading size acts as 1."], ["ValueError", false, "That would happen with shape (4,) — then 3 ≠ 4."], ["(3,)", false, "Broadcasting never shrinks the larger array."]],
    path: ["Align from the right: (4, 3) and (3,).", "3 vs 3 — equal. The missing leading size counts as 1, so it stretches to 4.", "Result: (4, 3)."],
    why: "Dimensions must be equal or 1, comparing from the right.",
    watch: "(4, 3) + (4,) fails — use b[:, None] to make a column.",
    remember: "Right-to-left, equal or 1.",
  },
  {
    t: "Dot product",
    q: "What does this print?",
    code: py`
import numpy as np
print(np.dot([2, 3], [4, 5]))`,
    opts: [["23", true, "2×4 + 3×5 = 8 + 15 = 23."], ["[ 8 15]", false, "That is the element-wise product; the dot product adds those up."], ["40", false, "That multiplies the two sums (5 × 8) — not how a dot product works."]],
    path: ["Pair the elements: (2, 4) and (3, 5).", "Multiply each pair: 8 and 15.", "Add them: 23."],
    why: "A dot product is the sum of element-wise products.",
    watch: "For two vectors @ and np.dot give one number.",
    remember: "Multiply pairs, then add.",
  },
  {
    t: "Boolean filtering",
    q: "What remains after this filter?",
    code: py`
import numpy as np
a = np.array([20, 50, 80])
print(a[a >= 50])`,
    opts: [["[50 80]", true, "The mask is [False, True, True]; only the True positions are kept."], ["[False True True]", false, "That is the mask itself, not the filtered values."], ["[20]", false, "20 fails the condition and is dropped."]],
    path: ["a >= 50 → [False, True, True].", "Indexing with the mask keeps positions 1 and 2.", "Result: [50 80]."],
    why: "A boolean mask selects the True positions.",
    watch: "Mask indexing returns a copy.",
    remember: "Compare, then index with the result.",
  },
  {
    t: "Reshape limits",
    q: "What happens here?",
    code: py`
import numpy as np
a = np.arange(8)
try:
    print(a.reshape(3, 3))
except ValueError:
    print("error")`,
    opts: [["It prints error — 8 values cannot fill a 3 × 3 grid", true, "reshape needs the same number of elements: 3 × 3 = 9, not 8."], ["It prints a 3 × 3 array with one value repeated", false, "NumPy never invents or repeats values when reshaping."], ["It prints a 2 × 4 array", false, "Only the shape you ask for is tried."]],
    path: ["a has 8 elements.", "(3, 3) needs 9.", "NumPy raises ValueError, which the code catches and prints."],
    why: "Reshape preserves the element count.",
    watch: "Use −1 to let NumPy infer one size: reshape(2, -1).",
    remember: "Same number of elements in and out.",
  },
  {
    t: "View or copy?",
    q: "What does this print?",
    code: py`
import numpy as np
a = np.array([10, 20, 30])
v = a[1:]
v[0] = 999
print(a)`,
    opts: [["[ 10 999  30]", true, "A slice is a view: writing through it changes a."], ["[10 20 30]", false, "That would need v = a[1:].copy()."], ["[999  20  30]", false, "v[0] is position 1 of a, not position 0."]],
    path: ["v = a[1:] points into a's memory, covering positions 1 and 2.", "v[0] = 999 writes to a's position 1.", "Printing a shows the change."],
    why: "Basic slices share memory with the original array.",
    watch: "Use .copy() when you need an independent array.",
    remember: "Slice = view.",
  },
  {
    t: "uint8 overflow",
    q: "What does this print?",
    code: py`
import numpy as np
a = np.array([200], dtype=np.uint8)
print(a + 100)`,
    opts: [["[44]", true, "uint8 holds 0–255; 300 wraps around to 300 − 256 = 44."], ["[300]", false, "A uint8 array cannot hold 300 — the result stays uint8."], ["OverflowError", false, "Array arithmetic wraps silently; it does not raise."]],
    path: ["a is a uint8 array containing 200.", "200 + 100 = 300, outside 0–255.", "It wraps modulo 256: 44."],
    why: "Fixed-size integers wrap around.",
    watch: "Convert with astype(int) before arithmetic on pixel data.",
    remember: "Integer dtypes have a range.",
  },
  {
    t: "Mean of data with a NaN",
    q: "What does this print?",
    code: py`
import numpy as np
x = np.array([1.0, np.nan, 3.0])
print(x.mean(), np.nanmean(x))`,
    opts: [["nan 2.0", true, "NaN poisons mean(); nanmean ignores it and averages 1 and 3."], ["2.0 2.0", false, "mean() does not skip NaN automatically."], ["nan nan", false, "nanmean exists exactly to skip missing values."]],
    path: ["x.mean() includes NaN in the sum → nan.", "np.nanmean drops the NaN: (1 + 3) / 2 = 2.0."],
    why: "NaN propagates through ordinary arithmetic.",
    watch: "Decide whether to drop, fill or ignore missing values.",
    remember: "nan-functions skip NaN.",
  },
  {
    t: "Element-wise or matrix?",
    q: "What does this print?",
    code: py`
import numpy as np
x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
print(x * y)`,
    opts: [["[ 4 10 18]", true, "* multiplies element by element: 1×4, 2×5, 3×6."], ["32", false, "That is x @ y, the dot product."], ["[ 5  7  9]", false, "That is x + y."]],
    path: ["Pair the positions: (1,4), (2,5), (3,6).", "Multiply each pair: 4, 10, 18.", "The result keeps the shape (3,)."],
    why: "The * operator is element-wise in NumPy.",
    watch: "Use @ for matrix products and dot products.",
    remember: "* element-wise, @ matrix.",
  },
  {
    t: "argmax is a position",
    q: "What does this print?",
    code: py`
import numpy as np
scores = np.array([0.2, 0.7, 0.1])
print(scores.argmax(), scores.max())`,
    opts: [["1 0.7", true, "The largest value 0.7 sits at position 1."], ["0.7 1", false, "argmax returns the position and max the value, in that order."], ["0.7 0.7", false, "argmax returns an index, not a value."]],
    path: ["scores has positions 0:0.2, 1:0.7, 2:0.1.", "argmax() → 1, the position of the largest value.", "max() → 0.7, the value itself."],
    why: "argmax answers 'where?', max answers 'what?'.",
    watch: "For a batch of probabilities use argmax(axis=1).",
    remember: "Position vs value.",
  },
  {
    t: "Reshape fills row by row",
    q: "What is the first row printed?",
    code: py`
import numpy as np
a = np.arange(1, 7).reshape(2, 3)
print(a[0])`,
    opts: [["[1 2 3]", true, "reshape fills left to right, row by row: the first row is 1, 2, 3."], ["[1 3 5]", false, "That would fill column by column, which is not the default."], ["[1 2]", false, "A (2, 3) array has three values per row."]],
    path: ["arange(1, 7) is [1 2 3 4 5 6].", "reshape(2, 3) fills row 0 first: 1, 2, 3.", "Row 1 gets 4, 5, 6."],
    why: "NumPy uses row-major (C) order by default.",
    watch: "Transposing swaps rows and columns afterwards.",
    remember: "Row by row.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Marks statistics", "Create marks for five students and print the mean, highest and lowest value.", py`
import numpy as np

m = np.array([45, 78, 90, 67, 88])
print(m.mean(), m.max(), m.min())`],
  ["Second column of a grid", "Make a 3 × 3 array with arange and reshape, then extract its second column.", py`
import numpy as np

a = np.arange(1, 10).reshape(3, 3)
print(a[:, 1])`],
  ["VAT without a loop", "Apply 18% VAT to every price in one expression.", py`
import numpy as np

prices = np.array([100, 250, 400])
print(prices * 1.18)`],
  ["Hot days", "Filter temperatures higher than 35 °C with a Boolean mask and count them.", py`
import numpy as np

t = np.array([29, 34, 36, 40, 33])
hot = t[t > 35]
print(hot, hot.size)`],
  ["Scale and score", "Min–max scale each column of a feature matrix, then compute a weighted score with @.", py`
import numpy as np

X = np.array([[1., 10.], [2., 20.], [3., 30.]])
scaled = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))
print(scaled @ np.array([0.4, 0.6]))`],
  ["Random normal values", "Generate 100 values from a normal distribution with a seeded generator and inspect their mean and standard deviation.", py`
import numpy as np

rng = np.random.default_rng(42)
x = rng.normal(0, 1, 100)
print(round(x.mean(), 3), round(x.std(), 3))`],
  ["Centre every column", "Subtract each column's mean from a table using broadcasting and check the new column means are zero.", py`
import numpy as np

X = np.array([[70, 80, 90], [60, 75, 85], [95, 88, 92]], dtype=float)
centered = X - X.mean(axis=0)
print(centered.mean(axis=0).round(6))`],
  ["Top-3 scores", "Find the indices and values of the three highest scores.", py`
import numpy as np

scores = np.array([0.31, 0.92, 0.15, 0.77, 0.64])
top = np.argsort(scores)[::-1][:3]
print(top, scores[top])`],
  ["Standardise", "Convert a feature to z-scores and verify the mean is 0 and the standard deviation is 1.", py`
import numpy as np

x = np.array([2., 4., 4., 4., 5., 5., 7., 9.])
z = (x - x.mean()) / x.std()
print(round(z.mean(), 6), round(z.std(), 6))`],
  ["Nearest point", "Find which of five points is closest to a query, without a loop.", py`
import numpy as np

points = np.array([[1, 1], [2, 1.5], [1.5, 2.5], [4, 4], [4.5, 3]])
q = np.array([2.5, 2.0])
d = np.linalg.norm(points - q, axis=1)
print(d.round(3), d.argmin())`],
  ["Softmax rows", "Apply a numerically stable softmax to every row of a score matrix and check each row sums to 1.", py`
import numpy as np

Z = np.array([[2.0, 1.0, 0.1], [1.0, 3.0, 0.2]])
E = np.exp(Z - Z.max(axis=1, keepdims=True))
P = E / E.sum(axis=1, keepdims=True)
print(P.round(3))
print(P.sum(axis=1))`],
  ["Accuracy and confusion counts", "Compute accuracy and the true/false positive counts from two label arrays.", py`
import numpy as np

actual = np.array([1, 1, 1, 0, 0, 1, 0, 0])
pred = np.array([1, 0, 1, 1, 0, 1, 0, 0])
print((actual == pred).mean())
tp = np.sum((actual == 1) & (pred == 1))
fp = np.sum((actual == 0) & (pred == 1))
print(tp, fp)`],
  ["Train/test split", "Shuffle a dataset with a seeded generator and split it 80/20, keeping features and labels aligned.", py`
import numpy as np

rng = np.random.default_rng(1)
X = np.arange(20).reshape(10, 2)
y = np.arange(10)
idx = rng.permutation(len(X))
cut = int(0.8 * len(X))
X_train, X_test = X[idx[:cut]], X[idx[cut:]]
y_train, y_test = y[idx[:cut]], y[idx[cut:]]
print(X_train.shape, X_test.shape, y_train.shape, y_test.shape)
print(np.array_equal(X_train[:, 0] // 2, y_train))`],
];

export const glance: [string, string][] = [
  ["Array basics", "np.array, shape, ndim, size, dtype. One type per array."],
  ["Slicing", "a[start:stop:step] — stop excluded; a view, not a copy."],
  ["2D indexing", "a[row, col]; a[:, 0] = first column; a[0, :] = first row."],
  ["Boolean mask", "a[a >= 50] filters. Combine with & | ~ in parentheses."],
  ["Vectorised math", "a * 2, a + b, np.sqrt(a). No loops. * is element-wise."],
  ["Broadcasting", "Align shapes from the right: equal or 1. (2,3)+(3,) ✓  (2,3)+(2,) ✗"],
  ["axis", "axis=0 → down the rows (one result per column); axis=1 → across the columns."],
  ["Reshape", "reshape(2, -1); .T transposes; concatenate joins; stack adds an axis."],
  ["Matrix product", "X @ W + b. Inner sizes match: (m,n)@(n,p) → (m,p)."],
  ["Random", "rng = np.random.default_rng(42); rng.random, rng.normal, rng.permutation."],
  ["Missing data", "np.isnan, np.nanmean, a[~np.isnan(a)]. NaN spreads through arithmetic."],
  ["Views vs copies", "Slices are views; .copy() is independent; masks and fancy indexing copy."],
];

export const lists: [string, string[]][] = [
  ["Habits that prevent NumPy bugs", ["Print .shape and .dtype before and after every step", "Use & and | with parentheses, never and / or", "Copy a slice before modifying it", "Name the axis explicitly: mean(axis=0)", "Check for NaN before computing statistics", "Set a seed when you want reproducible randomness"]],
  ["Before you train anything", ["Features are a 2D array: rows = examples, columns = features", "Scale each column, fitting the scaler on training data only", "Shuffle rows and labels with the SAME index array", "Split into train/test before looking at the test data", "Convert integer images to float before arithmetic"]],
  ["Explaining your answer in an interview", ["State the shape of every array in the problem", "Say whether the operation is element-wise or a matrix product", "Mention broadcasting and which axis disappears", "Note whether you created a view or a copy", "Offer the loop-free (vectorised) version"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["NumPy: the absolute basics for beginners", "https://numpy.org/doc/stable/user/absolute_beginners.html"], ["Broadcasting", "https://numpy.org/doc/stable/user/basics.broadcasting.html"], ["Indexing on ndarrays", "https://numpy.org/doc/stable/user/basics.indexing.html"], ["Random Generator", "https://numpy.org/doc/stable/reference/random/generator.html"]]],
  ["Practise and explore", [["NumPy tutorials", "https://numpy.org/numpy-tutorials/"], ["100 NumPy exercises", "https://github.com/rougier/numpy-100"]]],
  ["Books worth owning", [["Python Data Science Handbook — Jake VanderPlas (free online)", "https://jakevdp.github.io/PythonDataScienceHandbook/"], ["Python for Data Analysis — Wes McKinney", "book"]]],
];
