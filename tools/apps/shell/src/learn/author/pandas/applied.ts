import { L, P, bars, cells, compare, flow, layers, par, plot, pt, seg, trace } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "./basics.js";

const sales = [10, 14, 9, 20, 15, 24, 18, 26];
/** Rolling mean as [x, value] pairs (x is 1-based); undefined windows are skipped like pandas' NaN. */
const roll = (vals: number[], w: number): [number, number][] =>
  vals.flatMap((_, i) => (i + 1 >= w ? [[i + 1, +(vals.slice(i + 1 - w, i + 1).reduce((a, b) => a + b, 0) / w).toFixed(3)] as [number, number]] : []));

/* ------------------------------------------------------------------ */
export const time: ConceptDef[] = [
  {
    t: "Dates: to_datetime and the .dt accessor",
    lv: 1,
    s: `Dates read from files are text until you convert them: {{pd.to_datetime(col)}}. After that the {{.dt}} accessor gives the parts — {{dt.year}}, {{dt.month}}, {{dt.day_name()}}, {{dt.dayofweek}} — and you can filter with date strings. Setting the date column as the index ({{df.set_index("when")}}) lets {{loc["2026-02"]}} select a whole month.`,
    r: `Weekday, month and "days since signup" are among the most predictive features in business data, and all come from .dt.`,
    i: `How do you get the weekday name of every date in a column?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "when": pd.to_datetime(["2026-01-05", "2026-02-14", "2026-03-30"]),
    "v": [1, 2, 3],
})
print(df["when"].dt.month.tolist())
print(df["when"].dt.day_name().tolist())
print(df.set_index("when").loc["2026-02"]["v"].tolist())`,
    v: cells("One date column, several useful pieces.", [P("when", ["2026-01-05", "2026-02-14", "2026-03-30"]), P("dt.month", ["1", "2", "3"]), P("dt.day_name()", ["Monday", "Saturday", "Monday"])], [
      ["Three dates, already parsed with to_datetime."],
      ["dt.month extracts the month number.", [[1, 0, 2]]],
      ["dt.day_name() gives the weekday — Jan 5 and Mar 30 are Mondays.", [[2, 0, 2]]],
      ["With the date as the index, loc[\"2026-02\"] selects just February's row.", [[0, 1, 1]]],
    ]),
  },
  {
    t: "resample: totals per week or month",
    lv: 2,
    s: `With a date index, {{s.resample("MS").sum()}} groups the values into calendar periods and summarises each — here "MS" means month start, "W" weeks and "D" days. It is {{groupby}} for time. Choose {{sum}} for amounts (sales), {{mean}} for levels (temperature) and {{last}} for balances. Drag to add months and watch the monthly totals appear.`,
    r: `Daily data is noisy; weekly or monthly totals show the trend. Forecasting problems begin with a resampled series.`,
    i: `How do you turn daily sales into monthly totals?`,
    c: py`
import pandas as pd

s = pd.Series(
    [10, 20, 30, 40, 50, 60],
    index=pd.to_datetime(["2026-01-05", "2026-01-20", "2026-02-03", "2026-02-18", "2026-03-02", "2026-03-25"]),
)
print(s.resample("MS").sum())
print(s.resample("MS").mean().tolist())`,
    v: bars("Six readings fall into three months; each month's bar is the sum of its readings.", [["Jan (10+20)", "step(m-0.5)*30"], ["Feb (30+40)", "step(m-1.5)*70"], ["Mar (50+60)", "step(m-2.5)*110"]], {
      max: 120,
      params: [par("m", "months shown", 0, 3, 1, 3)],
      readout: ["{m} of 3 months resampled"],
      steps: [["No months yet.", { m: 0 }], ["January: 10 + 20 = 30.", { m: 1 }], ["February: 30 + 40 = 70.", { m: 2 }], ["March: 50 + 60 = 110.", { m: 3 }]],
    }),
  },
  {
    t: "Rolling averages",
    lv: 2,
    s: `{{s.rolling(3).mean()}} replaces each value with the average of itself and the two before it — a moving window. A bigger window gives a smoother line but reacts later, and the first {{window − 1}} values are NaN because there is not enough history. Drag the window (1 = raw data, 3, 5).`,
    r: `Moving averages smooth noisy metrics (daily users, sensor readings) so a trend or a change is visible.`,
    i: `Why does rolling(3).mean() start with two NaN values?`,
    c: py`
import pandas as pd

s = pd.Series([10, 14, 9, 20, 15, 24, 18, 26])
print(s.rolling(3).mean().round(2).tolist())
print(s.rolling(5).mean().round(2).tolist())`,
    v: plot("Grey dots: the raw values. The line is the rolling mean for the chosen window.", {
      x: [0, 9], y: [0, 30], labels: ["position", "value"],
      params: [par("w", "window", 1, 5, 2, 3)],
      readout: ["window {w}: each point is the average of the last {w} value(s)"],
      steps: [["window 1 is the raw data.", { w: 1 }], ["window 3: noticeably smoother; it starts at position 3.", { w: 3 }], ["window 5: smoother again, but slower to react and shorter.", { w: 5 }]],
    }, [
      ...sales.map((v, i) => pt(String(i + 1), String(v), { c: "muted" })),
      ...[1, 3, 5].flatMap((k) => {
        const r = roll(sales, k);
        const show = `1-abs(w-${k})`;
        return [
          ...r.slice(1).map(([x, y], i) => seg(String(r[i]?.[0]), String(r[i]?.[1]), String(x), String(y), { c: "accent", show })),
          ...r.map(([x, y]) => pt(String(x), String(y), { c: "accent", show })),
        ];
      }),
    ]),
  },
  {
    t: "shift, diff and pct_change",
    lv: 2,
    s: `{{s.shift(1)}} moves every value down one row so each row can see the previous one. {{s.diff()}} is the change from the previous value and {{s.pct_change()}} the percentage change. The first row has no predecessor, so it is NaN. They are the building blocks of lag features and growth rates.`,
    r: `"Yesterday's value" and "growth since last week" are standard time-series features; shift and pct_change create them.`,
    i: `How do you add yesterday's sales as a feature for today's row?`,
    c: py`
import pandas as pd

s = pd.Series([100, 110, 99, 120])
print(s.shift(1).tolist())
print(s.diff().tolist())
print(s.pct_change().round(3).tolist())`,
    v: cells("Each row is compared with the row above it.", [L("s", ["100", "110", "99", "120"], "pos"), P("shift(1)", ["NaN", "100", "110", "99"]), P("diff()", ["NaN", "10", "-11", "21"]), P("pct_change()", ["NaN", "0.100", "-0.100", "0.212"])], [
      ["A short series: 100, 110, 99, 120."],
      ["shift(1) slides the values down: each row now shows the previous value.", [[1, 1, 3]]],
      ["diff() = s − shift(1): 110 − 100 = +10, 99 − 110 = −11, 120 − 99 = +21.", [[2, 1, 3]]],
      ["pct_change() = diff / previous: 10/100 = 10%, −11/110 = −10%, 21/99 ≈ 21.2%.", [[3, 1, 3]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const ml: ConceptDef[] = [
  {
    t: "Features X and target y",
    lv: 1,
    s: `Supervised learning needs two things: the input table {{X}} (the features) and the answer column {{y}} (the target). With pandas that is two lines: {{X = df.drop(columns="bought")}} and {{y = df["bought"]}}. Check the shapes — {{X}} is a DataFrame with rows and columns, {{y}} is a Series with one value per row — and that the target is not hiding inside the features.`,
    r: `Leaving the target (or something computed from it) inside X makes a model look perfect in testing and useless in real life. This is called leakage.`,
    i: `How do you split a DataFrame into features and target, and what is leakage?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "age": [22, 35, 47, 61],
    "income": [30, 52, 71, 64],
    "bought": [0, 1, 1, 0],
})
X = df.drop(columns="bought")
y = df["bought"]
print(X.shape, y.shape)
print(X.columns.tolist())`,
    v: flow("One table becomes the model's inputs and its answers.", "row",
      ["df|age, income, bought|i", "X = df.drop(columns=\"bought\")|the features|g", "y = df[\"bought\"]|the target|w", "model.fit(X, y)|learn the mapping|g"],
      [[0, 1], [0, 2], [1, 3], [2, 3]], undefined,
      ["The full table includes the answer.", "X keeps only the input columns: shape (4, 2).", "y is the answer column: shape (4,).", "The model learns from X to predict y."]),
  },
  {
    t: "One-hot encoding with get_dummies",
    lv: 1,
    s: `Models need numbers, not text. {{pd.get_dummies(df, columns=["city"], dtype=int)}} replaces a category column by one 0/1 column per value ("one-hot"). Pune becomes {{city_Pune = 1, city_Delhi = 0}}. For categories with many values this makes many columns — then consider grouping rare values first. Apply the same columns to training and test data.`,
    r: `A model seeing "Pune" as 1 and "Delhi" as 2 would think Delhi is twice Pune. One-hot avoids inventing an order.`,
    i: `Why one-hot encode a city column instead of mapping the cities to 1, 2, 3?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"city": ["Pune", "Delhi", "Pune"], "age": [30, 40, 50]})
enc = pd.get_dummies(df, columns=["city"], dtype=int)
print(enc)`,
    v: cells("Each city becomes its own yes/no column.", table(["city", "age"], [["Pune", "30"], ["Delhi", "40"], ["Pune", "50"]]), [
      ["Before: a text column the model cannot use."],
      ["get_dummies creates a column per city and puts a 1 where it applies.", [[1, 0, 0], [2, 0, 0], [3, 0, 0]], table(["age", "city_Delhi", "city_Pune"], [["30", "0", "1"], ["40", "1", "0"], ["50", "0", "1"]])],
      ["Row 1 (Delhi) has city_Delhi = 1 and city_Pune = 0.", [[2, 1, 2]]],
    ]),
  },
  {
    t: "Scaling with training statistics only",
    lv: 2,
    s: `Standardising means {{(x − mean) / std}}. Compute the mean and standard deviation on the training rows only, then apply those same numbers to the test rows — otherwise information from the test set leaks into training. A trap: pandas {{std()}} divides by n − 1 ({{ddof=1}}) while NumPy's {{np.std}} divides by n, so the two disagree on small samples.`,
    r: `Scaling fitted on all data gives optimistic test scores. Fit on train, transform both.`,
    i: `Why must the scaler's mean and std come from the training set only?`,
    c: py`
import pandas as pd

train = pd.DataFrame({"x": [10, 20, 30, 40]})
test = pd.DataFrame({"x": [25, 50]})
mean = train["x"].mean()
std = train["x"].std(ddof=0)
print(mean, round(std, 2))
print(((train["x"] - mean) / std).round(2).tolist())
print(((test["x"] - mean) / std).round(2).tolist())`,
    v: compare("Fit on the training rows, reuse on the test rows.", ["Correct", "Leaky"], [
      ["mean and std come from", "training rows only", "train + test together"],
      ["Test rows are scaled with", "the training numbers", "numbers that include the test data"],
      ["Test score is", "an honest estimate", "too optimistic"],
      ["pandas vs NumPy", "std() is ddof=1; use ddof=0 to match np.std", "mixing the two gives different scales"],
    ]),
  },
  {
    t: "Shuffling and train/test splits",
    lv: 1,
    s: `A simple split: shuffle with {{df.sample(frac=1, random_state=42)}}, then take the first 80% as training and the rest as test with {{iloc}}. {{random_state}} makes the shuffle repeatable. Keep features and target together (one DataFrame) until after the shuffle so the rows cannot get out of step. For time series do NOT shuffle — split by date so the model never sees the future.`,
    r: `scikit-learn's train_test_split does exactly this; knowing the pandas version helps you debug it and handle time-ordered data.`,
    i: `Why shouldn't you shuffle a time series before splitting it?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"x": range(10), "y": range(10)})
shuffled = df.sample(frac=1, random_state=42).reset_index(drop=True)
cut = int(len(df) * 0.8)
train, test = shuffled.iloc[:cut], shuffled.iloc[cut:]
print(len(train), len(test))
print(sorted(train["x"].tolist() + test["x"].tolist()) == list(range(10)))`,
    v: flow("Shuffle once, cut once, and keep every row in exactly one set.", "row",
      ["df|10 rows|i", "sample(frac=1)|shuffled copy|g", "iloc[:8]|train: 80%|g", "iloc[8:]|test: 20%|w"],
      [[0, 1], [1, 2], [1, 3]], undefined,
      ["All rows are shuffled into a copy with a fixed random_state.", "The first 8 rows become the training set.", "The last 2 rows are held out for testing."]),
  },
  {
    t: "Missing values in a modelling pipeline",
    lv: 2,
    s: `Fill gaps with a statistic computed from the training data (the median is robust to outliers) and apply the same number to the test data. Before filling, add an indicator column — {{df["age"].isna().astype(int)}} — because "was missing" can itself be a useful signal. Never compute the fill value on the whole dataset.`,
    r: `Many models cannot accept NaN at all. A principled fill plus an indicator keeps both the number and the fact that it was missing.`,
    i: `How do you impute missing ages without leaking test information?`,
    c: py`
import numpy as np
import pandas as pd

train = pd.DataFrame({"age": [20, 30, np.nan, 40]})
test = pd.DataFrame({"age": [np.nan, 50]})
med = train["age"].median()
for d in (train, test):
    d["age_missing"] = d["age"].isna().astype(int)
    d["age"] = d["age"].fillna(med)
print(med)
print(test)`,
    v: trace("The median comes from the training rows; both tables get the same fill.", py`
import numpy as np
import pandas as pd

train = pd.DataFrame({"age": [20, 30, np.nan, 40]})
test = pd.DataFrame({"age": [np.nan, 50]})
med = train["age"].median()
for d in (train, test):
    d["age_missing"] = d["age"].isna().astype(int)
    d["age"] = d["age"].fillna(med)
print(med)
print(test)`, [
      [4, { train: "age: 20, 30, NaN, 40" }, undefined, "Training data with one gap."],
      [5, { test: "age: NaN, 50" }, undefined, "Test data with one gap."],
      [6, { med: "30.0" }, undefined, "Median of 20, 30, 40 — computed from TRAIN only."],
      [8, { "d.age_missing": "flags added to both tables" }, undefined, "1 where the age was missing, 0 otherwise."],
      [9, { "d.age": "NaN replaced by 30.0" }, undefined, "The same training median fills both tables."],
      [10, undefined, "30.0"],
    ]),
  },
  {
    t: "A first-look checklist before modelling",
    lv: 1,
    s: `Before training anything, write down what you checked: shape, missing values, duplicates, column types, the target's balance and obvious impossible values. A small helper that prints these for any DataFrame pays for itself on every project. Each item prevents a different failure: crashes (types), silent bias (missing, duplicates) and useless models (imbalance).`,
    r: `Interviewers love "what do you do when you get a new dataset?" — this is the answer.`,
    i: `Walk me through your checks on a brand-new dataset before modelling.`,
    c: py`
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "age": [22, 35, 35, np.nan, 61],
    "city": ["Pune", "Delhi", "Delhi", "Pune", None],
    "bought": [0, 1, 1, 0, 1],
})

def quick_look(df):
    print("shape", df.shape)
    print("missing", int(df.isna().sum().sum()))
    print("duplicates", int(df.duplicated().sum()))
    print("numeric", df.select_dtypes("number").columns.tolist())
    print("target balance", df["bought"].value_counts(normalize=True).round(2).to_dict())

quick_look(df)`,
    v: layers("Check from the structure inward to the target.", [
      "Shape and sample|df.shape, df.head() — is it the size and layout you expect?|i",
      "Types|df.dtypes — numbers stored as text? dates unparsed?|g",
      "Missing values|df.isna().sum() — how much, and where?|w",
      "Duplicates|df.duplicated().sum() — repeated rows inflate scores|w",
      "Target balance|y.value_counts(normalize=True) — is one class rare?|g",
    ], "first → last"),
  },
];

/* ------------------------------------------------------------------ */
export const pitfalls: ConceptDef[] = [
  {
    t: "SettingWithCopyWarning and chained assignment",
    lv: 2,
    s: `{{df[df["a"] > 1]["b"] = 0}} does two steps: the filter makes a new DataFrame, then the assignment writes into that temporary copy — so the original never changes (pandas warns with SettingWithCopyWarning). Do the selection and the assignment in one {{.loc}} call: {{df.loc[df["a"] > 1, "b"] = 0}}. When you really want a separate table, say so with {{.copy()}}.`,
    r: `This is the most notorious pandas bug: the code runs, the warning is easy to ignore, and the data is silently unchanged.`,
    i: `Why doesn't df[df.a > 1]["b"] = 0 change df, and what is the correct form?`,
    c: py`
import warnings
import pandas as pd

warnings.simplefilter("ignore")
df = pd.DataFrame({"a": [1, 2, 3], "b": [10, 20, 30]})
df[df["a"] > 1]["b"] = 0
print(df["b"].tolist())
df.loc[df["a"] > 1, "b"] = 0
print(df["b"].tolist())`,
    v: trace("The chained version writes into a throwaway copy; loc writes into df.", py`
import warnings
import pandas as pd

warnings.simplefilter("ignore")
df = pd.DataFrame({"a": [1, 2, 3], "b": [10, 20, 30]})
df[df["a"] > 1]["b"] = 0
print(df["b"].tolist())
df.loc[df["a"] > 1, "b"] = 0
print(df["b"].tolist())`, [
      [5, { "df.b": "[10, 20, 30]" }, undefined, "The starting table."],
      [6, { temp: "filtered COPY: rows 1, 2" }, undefined, "df[mask] makes a new temporary DataFrame…"],
      [6, undefined, undefined, "…and ['b'] = 0 sets zeros inside that copy, which is then thrown away. df is unchanged."],
      [7, undefined, "[10, 20, 30]", "Nothing changed."],
      [8, { "df.b": "[10, 0, 0]" }, undefined, "loc selects rows and column in ONE step, writing into df itself."],
      [9, undefined, "[10, 0, 0]"],
    ]),
  },
  {
    t: "Assignment does not copy",
    lv: 2,
    s: `{{df2 = df}} makes a second name for the same table, not a second table, so changing {{df2}} changes {{df}}. {{df.copy()}} makes an independent table. Use it before experiments on a table you still need, and when you take a slice you plan to modify.`,
    r: `A "temporary" column added to an alias silently appears in the table you thought was untouched.`,
    i: `What is the difference between df2 = df and df2 = df.copy()?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"x": [1, 2]})
alias = df
alias["new"] = 0
print("new" in df.columns)
safe = df.copy()
safe["other"] = 1
print("other" in df.columns)`,
    v: compare("One table with two names, or two tables?", ["df2 = df", "df2 = df.copy()"], [
      ["Creates", "a second NAME for the same table", "a second, independent table"],
      ["Change df2", "also changes df", "df is untouched"],
      ["Memory", "none extra", "a full duplicate"],
      ["Use when", "you only need another name", "you will modify df2 and keep df"],
    ], 1),
  },
  {
    t: "Why loops over rows are slow",
    lv: 2,
    s: `{{df.iterrows()}} and {{apply(axis=1)}} call Python once per row, which is hundreds of times slower than a whole-column expression that runs in compiled code. If you find yourself looping to compute a value, look for a vectorised form: arithmetic, {{np.where}}, {{map}}, {{groupby}}. Reserve loops for genuinely row-by-row logic such as calling an API.`,
    r: `A loop over a million rows can take minutes; the same calculation as one expression takes milliseconds.`,
    i: `How would you compute a new column faster than looping with iterrows?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"price": [100, 250, 400], "qty": [2, 1, 3]})
total_loop = 0
for _, row in df.iterrows():
    total_loop += row["price"] * row["qty"]
total_vec = (df["price"] * df["qty"]).sum()
print(total_loop, total_vec)`,
    v: compare("Same answer, very different cost.", ["Row loop", "Vectorised"], [
      ["Code", "for _, row in df.iterrows(): …", "(df[\"price\"] * df[\"qty\"]).sum()"],
      ["Python calls", "one per row", "one for the whole column"],
      ["Speed on 1M rows", "seconds to minutes", "milliseconds"],
      ["Readability", "more lines", "one line"],
    ], 1),
  },
  {
    t: "Index alignment surprises",
    lv: 2,
    s: `Arithmetic between Series or DataFrames lines up the {{index labels}}, not the positions. Labels that exist in only one operand give NaN: adding a Series indexed a, b, c to one indexed b, c, d produces NaN for a and d. This is powerful for combining tables, and confusing when the indexes are different by accident — for example after a filter or a sort.`,
    r: `If a column arithmetic gives unexpected NaNs, compare the indexes first. Use {{.values}} or {{reset_index(drop=True)}} only when you truly want positional matching.`,
    i: `Why does adding two Series of equal length sometimes return NaN?`,
    c: py`
import pandas as pd

s1 = pd.Series([1, 2, 3], index=["a", "b", "c"])
s2 = pd.Series([10, 20, 30], index=["b", "c", "d"])
print(s1 + s2)
print(s1.add(s2, fill_value=0).tolist())`,
    v: cells("Only labels b and c appear in both Series, so only those are added.", [P("s1 index", ["a", "b", "c", "d"]), P("s1", ["1", "2", "3", "—"]), P("s2", ["—", "10", "20", "30"]), P("s1 + s2", ["NaN", "12", "23", "NaN"])], [
      ["Two Series with overlapping labels."],
      ["b: 2 + 10 = 12 and c: 3 + 20 = 23 — matched by label.", [[1, 1, 2], [2, 1, 2], [3, 1, 2]]],
      ["a exists only in s1 and d only in s2 → NaN.", [[1, 0, 0], [2, 3, 3], [3, 0, 0], [3, 3, 3]]],
      ["add(fill_value=0) treats a missing side as 0 and avoids the NaN.", [[3, 0, 3]]],
    ]),
  },
  {
    t: "Memory and the category dtype",
    lv: 2,
    s: `A text column repeats the same few words as separate Python strings. {{astype("category")}} stores each distinct value once and replaces the column with small integer codes — less memory and faster groupby. It suits columns with few distinct values (city, department, label) and not ones with unique values like names or ids. Check {{nunique()}} first.`,
    r: `A 10-million-row table with a country column can shrink by gigabytes after astype("category"). For big files also read only the columns you need.`,
    i: `When is the category dtype a good idea?`,
    c: py`
import pandas as pd

s = pd.Series(["Pune", "Delhi", "Pune", "Pune", "Delhi"])
cat = s.astype("category")
print(s.nunique(), cat.dtype)
print(cat.cat.categories.tolist())
print(cat.cat.codes.tolist())`,
    v: cells("Each distinct value is stored once; the column holds small integer codes.", [P("values", ["Pune", "Delhi", "Pune", "Pune", "Delhi"])], [
      ["As text, every row stores its own copy of the word."],
      ["astype(\"category\") builds a small lookup: 0 = Delhi, 1 = Pune.", [[0, 0, 1]], [P("categories", ["Delhi", "Pune"]), P("codes", ["1", "0", "1", "1", "0"])]],
      ["The column now holds only the codes — much smaller when values repeat.", [[1, 0, 4]]],
    ]),
  },
  {
    t: "read_csv gotchas",
    lv: 2,
    s: `Type inference is helpful until it is not: a zip code {{"00501"}} loads as the number 501 and loses its zeros; one stray text value turns a numeric column into text; {{"NA"}} in a country column becomes a missing value (Namibia is "NA"). Protect yourself with {{dtype=str}} for identifiers, {{na_values}} and {{keep_default_na=False}} where "NA" is real, and check {{df.dtypes}} straight after reading.`,
    r: `Ids and codes should be strings. Numeric-looking identifiers that lose leading zeros cause failed joins that are painful to trace.`,
    i: `A merge on zip codes finds no matches although the files look identical. What do you suspect?`,
    c: py`
import io
import pandas as pd

text = "zip,country\n00501,NA\n10001,US\n"
default = pd.read_csv(io.StringIO(text))
careful = pd.read_csv(io.StringIO(text), dtype={"zip": str}, keep_default_na=False)
print(default["zip"].tolist(), default["country"].tolist())
print(careful["zip"].tolist(), careful["country"].tolist())`,
    v: compare("Default inference versus careful reading.", ["Default", "dtype + keep_default_na"], [
      ["zip \"00501\"", "becomes the number 501", "stays \"00501\""],
      ["country \"NA\"", "becomes NaN (missing)", "stays the text \"NA\""],
      ["Joins on zip", "fail silently", "match as expected"],
      ["Habit", "—", "check df.dtypes right after read_csv"],
    ], 1),
  },
];
