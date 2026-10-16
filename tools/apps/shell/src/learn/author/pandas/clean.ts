import { L, P, bars, cells, compare, flow, par, plot, pt, seg, trace, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "./basics.js";

/* ------------------------------------------------------------------ */
export const clean: ConceptDef[] = [
  {
    t: "Finding missing values",
    lv: 1,
    s: `Missing data shows up as {{NaN}} (and {{None}} in text columns). {{df.isna()}} marks every missing cell, {{df.isna().sum()}} counts them per column and {{df.isna().mean()}} gives the share missing. Note that {{mean()}}, {{sum()}} and most statistics skip NaN by default, so a column can look fine while a quarter of it is empty.`,
    r: `Decide per column what a gap means: not collected, not applicable, or an error. The right fix depends on the answer.`,
    i: `A column is 40% empty. What are your options, and what do you check first?`,
    c: py`
import numpy as np
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia"],
    "age": [29, np.nan, 35, 28],
    "city": ["Pune", None, "Delhi", "Pune"],
})
print(df.isna().sum())
print(df.isna().mean().round(2).tolist())
print(df["age"].mean())`,
    v: cells("Ben's age and city are missing. isna() flags exactly those cells.", table(["name", "age", "city"], [["Asha", "29.0", "Pune"], ["Ben", "NaN", "None"], ["Chen", "35.0", "Delhi"], ["Dia", "28.0", "Pune"]]), [
      ["A small table with two gaps."],
      ["isna() is True for the age and the city of row 1.", [[2, 1, 2]]],
      ["isna().sum() counts them per column: name 0, age 1, city 1.", [[2, 1, 1], [2, 2, 2]]],
      ["mean() of age ignores the NaN: (29 + 35 + 28) / 3 = 30.67.", [[1, 1, 1], [3, 1, 1], [4, 1, 1]]],
    ]),
  },
  {
    t: "Dropping, filling and interpolating",
    lv: 1,
    s: `Three standard choices. {{dropna()}} removes rows with gaps (safe only when few). {{fillna(value)}} puts in a constant, the mean or median. {{ffill()}} repeats the previous value and {{interpolate()}} draws a straight line between neighbours — good for ordered data. Choose with the data's meaning in mind and note that each choice changes the numbers. Drag the strategy (0 drop, 1 mean, 2 forward fill, 3 interpolate).`,
    r: `Filling with the mean shrinks the spread; forward fill suits sensor readings; dropping can bias a dataset if the gaps are not random.`,
    i: `Compare dropna, fillna with the mean, and interpolate: when would you use each?`,
    c: py`
import numpy as np
import pandas as pd

s = pd.Series([10, 14, np.nan, 30, 40])
print(s.dropna().tolist())
print(s.fillna(s.mean()).tolist())
print(s.ffill().tolist())
print(s.interpolate().tolist())`,
    v: plot("One missing reading (x = 3). Each strategy fills the gap differently.", {
      x: [0, 6], y: [0, 45], labels: ["position", "value"],
      params: [par("p", "strategy: 0 drop · 1 mean · 2 ffill · 3 interpolate", 0, 3, 1, 3)],
      readout: ["0 = row removed · 1 = 23.5 (mean of the rest) · 2 = 14 (previous value) · 3 = 22 (straight line)"],
      steps: [
        ["dropna(): the row disappears — the line simply jumps from 14 to 30.", { p: 0 }],
        ["fillna(mean): the gap becomes 23.5, the average of the four known values.", { p: 1 }],
        ["ffill(): repeats the previous value, 14.", { p: 2 }],
        ["interpolate(): a straight line from 14 to 30 gives 22.", { p: 3 }],
      ],
    }, [
      pt("1", "10", { c: "accent" }), pt("2", "14", { c: "accent" }), pt("4", "30", { c: "accent" }), pt("5", "40", { c: "accent" }),
      seg("1", "10", "2", "14", { c: "accent" }), seg("4", "30", "5", "40", { c: "accent" }),
      seg("2", "14", "4", "30", { c: "muted", show: "0.5-p" }),
      pt("3", "23.5", { c: "warn", label: "23.5", show: "0.5-abs(p-1)" }), seg("2", "14", "3", "23.5", { c: "warn", show: "0.5-abs(p-1)" }), seg("3", "23.5", "4", "30", { c: "warn", show: "0.5-abs(p-1)" }),
      pt("3", "14", { c: "warn", label: "14", show: "0.5-abs(p-2)" }), seg("2", "14", "3", "14", { c: "warn", show: "0.5-abs(p-2)" }), seg("3", "14", "4", "30", { c: "warn", show: "0.5-abs(p-2)" }),
      pt("3", "22", { c: "warn", label: "22", show: "0.5-abs(p-3)" }), seg("2", "14", "3", "22", { c: "warn", show: "0.5-abs(p-3)" }), seg("3", "22", "4", "30", { c: "warn", show: "0.5-abs(p-3)" }),
    ]),
  },
  {
    t: "Duplicates",
    lv: 1,
    s: `{{df.duplicated()}} is True for every row that repeats an earlier one; {{df.drop_duplicates()}} removes them. Restrict the test to the columns that define identity with {{subset=["id"]}} and choose which copy to keep with {{keep="first"}} or {{"last"}}. Duplicates inflate counts, sums and model accuracy (the same row ends up in both train and test).`,
    r: `Repeated rows come from double-loaded files, joins that multiply rows and form re-submissions. Check {{df.duplicated().sum()}} on every new dataset.`,
    i: `How do you remove duplicate customers but keep their most recent record?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"id": [1, 2, 2, 3], "name": ["a", "b", "b", "c"], "score": [5, 7, 7, 9]})
print(df.duplicated().tolist())
print(len(df.drop_duplicates()))
print(df.drop_duplicates(subset="id", keep="last").index.tolist())`,
    v: cells("Row 2 repeats row 1 exactly, so duplicated() flags it.", table(["id", "name", "score"], [["1", "a", "5"], ["2", "b", "7"], ["2", "b", "7"], ["3", "c", "9"]]), [
      ["Four rows; two of them are identical."],
      ["duplicated() is False for the first copy and True for the repeat (row 2).", [[3, 0, 2]]],
      ["drop_duplicates() keeps the first copy of each: 3 rows remain.", [[2, 0, 2]], table(["id", "name", "score"], [["1", "a", "5"], ["2", "b", "7"], ["3", "c", "9"]], ["0", "1", "3"])],
    ]),
  },
  {
    t: "Fixing data types",
    lv: 1,
    s: `Text that should be a number or a date must be converted before you can calculate with it. {{pd.to_numeric(col, errors="coerce")}} turns text into numbers and bad values into NaN instead of crashing; {{pd.to_datetime(col)}} parses dates; {{astype}} converts between clean types. Remove thousands separators first with {{.str.replace(",", "")}}.`,
    r: `A single "n/a" in a numeric column turns the whole column to text. {{errors="coerce"}} plus a NaN count shows how many values were bad.`,
    i: `A price column contains "1,200" and "n/a". Convert it to numbers safely.`,
    c: py`
import pandas as pd

df = pd.DataFrame({"price": ["1,200", "950", "n/a"], "date": ["2026-01-05", "2026-02-10", "2026-03-15"]})
df["price"] = pd.to_numeric(df["price"].str.replace(",", ""), errors="coerce")
df["date"] = pd.to_datetime(df["date"])
print(df.dtypes)
print(df["price"].tolist())`,
    v: trace("Text becomes numbers and dates; the unparseable 'n/a' becomes NaN.", py`
import pandas as pd

df = pd.DataFrame({"price": ["1,200", "950", "n/a"], "date": ["2026-01-05", "2026-02-10", "2026-03-15"]})
df["price"] = pd.to_numeric(df["price"].str.replace(",", ""), errors="coerce")
df["date"] = pd.to_datetime(df["date"])
print(df.dtypes)
print(df["price"].tolist())`, [
      [3, { "df.price": "['1,200', '950', 'n/a']  (object)", "df.date": "text dates  (object)" }, undefined, "Both columns start as text."],
      [4, { "df.price": "[1200.0, 950.0, NaN]  (float64)" }, undefined, "The comma is removed, then to_numeric converts; 'n/a' cannot be a number, so it becomes NaN."],
      [5, { "df.date": "[2026-01-05, 2026-02-10, 2026-03-15]  (datetime64)" }, undefined, "to_datetime parses the strings into real dates."],
      [6, undefined, "price: float64, date: datetime64[ns]", "dtypes now report numbers and dates."],
      [7, undefined, "[1200.0, 950.0, nan]"],
    ]),
  },
  {
    t: "Cleaning text with .str",
    lv: 1,
    s: `The {{.str}} accessor applies a text operation to every value: {{strip()}} removes stray spaces, {{lower()}} unifies case, {{replace(pattern, new, regex=True)}} fixes patterns, {{contains}} searches and {{split}} breaks text apart. Standardise text first, otherwise "Pune ", "pune" and "PUNE" are counted as three different cities.`,
    r: `Category columns typed by humans are messy. Normalising them is what makes {{groupby}} and {{value_counts}} trustworthy.`,
    i: `Why do you lower-case and strip a text column before grouping by it?`,
    c: py`
import pandas as pd

s = pd.Series(["  Pune ", "DELHI", "pune", "New  Delhi"])
clean = s.str.strip().str.lower().str.replace(r"\s+", " ", regex=True)
print(clean.tolist())
print(clean.str.contains("delhi").tolist())
print(clean.str.split(" ").str[0].tolist())`,
    v: cells("Four spellings become three clean values; 'pune' and '  Pune ' now match.", [L("raw", ["  Pune ", "DELHI", "pune", "New  Delhi"], "pos")], [
      ["The raw values have stray spaces and mixed case."],
      ["strip() removes the outer spaces: \"  Pune \" → \"Pune\".", [[0, 0, 0]], [L("stripped", ["Pune", "DELHI", "pune", "New  Delhi"], "pos")]],
      ["lower() makes the case consistent.", [[0, 0, 3]], [L("lower", ["pune", "delhi", "pune", "new  delhi"], "pos")]],
      ["replace(r\"\\s+\", \" \") collapses the double space. Now rows 0 and 2 are identical.", [[0, 0, 0], [0, 2, 2]], [L("clean", ["pune", "delhi", "pune", "new delhi"], "pos")]],
    ]),
  },
  {
    t: "Renaming, dropping and reordering columns",
    lv: 1,
    s: `{{df.rename(columns={"old": "new"})}} changes names, {{df.drop(columns=["tmp"])}} removes columns and {{df[["b", "a"]]}} reorders them. Most pandas methods return a new DataFrame, so assign the result back ({{df = df.drop(…)}}). Clean column names early — lower case, no spaces — and you can use them without typos.`,
    r: `Names with spaces or odd capitals ("Total Sales ") cause key errors. Normalise with {{df.columns = [c.strip().lower() for c in df.columns]}}.`,
    i: `Why does df.drop(columns="x") seem to do nothing?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"Name ": ["a"], "Age": [30], "tmp": [0]})
df = df.rename(columns={"Name ": "name", "Age": "age"}).drop(columns="tmp")
print(df.columns.tolist())
print(df[["age", "name"]].columns.tolist())`,
    v: compare("Three everyday column operations — all return a new DataFrame.", ["Call", "Remember"], [
      ["Rename", "df.rename(columns={\"Age\": \"age\"})", "pass a dict of old → new"],
      ["Drop", "df.drop(columns=[\"tmp\"])", "assign the result back, or nothing changes"],
      ["Reorder / select", "df[[\"age\", \"name\"]]", "the list order becomes the column order"],
      ["Clean all names", "df.columns = [c.strip().lower() for c in df.columns]", "do it once, right after loading"],
    ]),
  },
  {
    t: "Outliers: the IQR rule and clip",
    lv: 2,
    s: `A common outlier test: with {{Q1 = quantile(0.25)}}, {{Q3 = quantile(0.75)}} and {{IQR = Q3 − Q1}}, flag values outside {{Q1 − 1.5·IQR}} to {{Q3 + 1.5·IQR}}. Then decide: investigate, drop, or {{clip(upper=…)}} to cap them. Capping keeps the row but limits the damage a single extreme value can do to a mean or a model.`,
    r: `A flagged value is a question, not a verdict: a typo, a faulty sensor or a rare real event. Look before you delete.`,
    i: `How do you cap extreme values without removing rows?`,
    c: py`
import pandas as pd

s = pd.Series([10, 12, 13, 14, 15, 16, 17, 18, 50])
q1, q3 = s.quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, high)
print(s[(s < low) | (s > high)].tolist())
print(s.clip(upper=high).max())`,
    v: plot("Top row: original values. Bottom row: after clipping at the cap. Drag the cap.", {
      x: [0, 55], y: [-1, 1], labels: ["value", ""],
      params: [par("cap", "clip at", 20, 50, 1, 23)],
      readout: ["Q1 = 13, Q3 = 17, IQR = 4  →  upper fence 23.  Values above the cap become {cap}."],
      steps: [["Cap at the fence (23): the 50 is pulled down to 23.", { cap: 23 }], ["Cap at 40: a gentler limit.", { cap: 40 }], ["Cap at 50: nothing changes.", { cap: 50 }]],
    }, [
      ...[10, 12, 13, 14, 15, 16, 17, 18].flatMap((v) => [pt(String(v), "0.5", { c: "info" }), pt(String(v), "-0.5", { c: "info" })]),
      pt("50", "0.5", { c: "bad", label: "50" }),
      pt("cap", "-0.5", { c: "warn", label: "{cap}" }),
      vline("cap", { c: "warn", dash: true, label: "cap" }),
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const transform: ConceptDef[] = [
  {
    t: "New columns from old ones",
    lv: 1,
    s: `Create a column by assigning to a new name: {{df["bonus"] = df["salary"] * 0.10}}. The right side is calculated for every row at once — no loop. Columns can combine each other ({{df["salary"] + df["bonus"]}}) and comparisons give True/False columns ({{df["salary"] > 60000}}).`,
    r: `Feature engineering — ratios, differences, flags, lengths — is mostly this one-line pattern.`,
    i: `Why is df["total"] = df["a"] + df["b"] preferred to looping over rows?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"name": ["Asha", "Ben"], "salary": [48000, 72000]})
df["bonus"] = df["salary"] * 0.10
df["total"] = df["salary"] + df["bonus"]
df["high_pay"] = df["salary"] > 60000
print(df)`,
    v: cells("Each new column is computed for every row in one step.", table(["name", "salary"], [["Asha", "48000"], ["Ben", "72000"]]), [
      ["Start with two columns."],
      ["df[\"bonus\"] = salary × 0.10 adds a column.", [[1, 2, 2], [2, 2, 2]], table(["name", "salary", "bonus"], [["Asha", "48000", "4800.0"], ["Ben", "72000", "7200.0"]])],
      ["total = salary + bonus is another column built from two existing ones.", [[1, 3, 3], [2, 3, 3]], table(["name", "salary", "bonus", "total"], [["Asha", "48000", "4800.0", "52800.0"], ["Ben", "72000", "7200.0", "79200.0"]])],
    ]),
  },
  {
    t: "map, apply and replace",
    lv: 2,
    s: `When arithmetic is not enough: {{Series.map(dict)}} translates values through a dictionary, {{Series.replace}} swaps listed values, and {{Series.apply(function)}} runs your own Python function on each value. {{apply}} is flexible but slow on large data — prefer a vectorised expression or {{np.where}} when one exists.`,
    r: `Mapping codes to labels (1 → "male") and bucketing values are the typical uses; reach for apply last.`,
    i: `When would you use map instead of apply, and why is apply slow?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"dept": ["IT", "HR", "IT"], "age": [41, 50, 28]})
df["code"] = df["dept"].map({"IT": "T", "HR": "H"})
df["band"] = df["age"].apply(lambda a: "senior" if a >= 40 else "junior")
print(df)`,
    v: compare("Four ways to transform values, from fast to flexible.", ["Use it for", "Speed"], [
      ["vectorised expression", "arithmetic and comparisons: df[\"a\"] * 2", "fastest"],
      ["map(dict)", "translate codes to labels", "fast"],
      ["replace", "swap specific values", "fast"],
      ["apply(function)", "any custom Python logic", "slow: a Python call per value"],
    ]),
  },
  {
    t: "Binning and conditions: cut and np.where",
    lv: 2,
    s: `{{pd.cut(ages, bins=[0, 30, 50, 100], labels=[…])}} sorts numbers into labelled ranges — age bands, price tiers. {{np.where(condition, a, b)}} is a vectorised if/else for two outcomes. Both are far faster and clearer than a row-by-row function.`,
    r: `Turning a continuous variable into bands is a common feature for models and reports.`,
    i: `How do you assign each person to an age band without a loop?`,
    c: py`
import numpy as np
import pandas as pd

ages = pd.Series([22, 35, 47, 61])
print(pd.cut(ages, bins=[0, 30, 50, 100], labels=["young", "mid", "senior"]).tolist())
print(np.where(ages >= 40, "40+", "<40").tolist())`,
    v: cells("Each age falls into one range: (0–30], (30–50], (50–100].", [L("ages", ["22", "35", "47", "61"], "pos"), P("band", ["", "", "", ""])], [
      ["Four ages and three bands."],
      ["22 is in (0, 30] → young.", [[0, 0, 0]], [L("ages", ["22", "35", "47", "61"], "pos"), P("band", ["young", "", "", ""])]],
      ["35 and 47 are in (30, 50] → mid.", [[0, 1, 2]], [L("ages", ["22", "35", "47", "61"], "pos"), P("band", ["young", "mid", "mid", ""])]],
      ["61 is in (50, 100] → senior.", [[0, 3, 3]], [L("ages", ["22", "35", "47", "61"], "pos"), P("band", ["young", "mid", "mid", "senior"])]],
    ]),
  },
  {
    t: "Counting categories: value_counts",
    lv: 1,
    s: `{{s.value_counts()}} counts how often each value appears, sorted from most to least; {{normalize=True}} gives shares instead. It is the quickest way to see the balance of a label column — and to spot typos, since "Pune" and "pune" show up as two rows. Drag the HR count to watch the shares change.`,
    r: `Class balance decides your model choice and metric: if 95% of rows are one class, accuracy alone is meaningless.`,
    i: `What does value_counts(normalize=True) return and why check it before training a classifier?`,
    c: py`
import pandas as pd

dept = pd.Series(["IT", "Sales", "IT", "HR", "Sales", "IT"])
print(dept.value_counts())
print(dept.value_counts(normalize=True).round(2).tolist())`,
    v: bars("Counts per department. The bar height is how many rows have that value.", [["IT", "3"], ["Sales", "2"], ["HR", "h"]], {
      max: 8,
      params: [par("h", "HR rows", 0, 8, 1, 1)],
      readout: ["total {5+h} rows  ·  IT share {3/(5+h):2}  ·  HR share {h/(5+h):2}"],
      steps: [["IT 3, Sales 2, HR 1 — IT is half of the 6 rows.", { h: 1 }], ["With 6 HR rows the groups are far more balanced.", { h: 6 }]],
    }),
  },
  {
    t: "assign and method chaining",
    lv: 2,
    s: `Because most methods return a DataFrame, you can chain them into one readable pipeline: {{df.assign(bonus=…).query("salary > 50000").sort_values("bonus").reset_index(drop=True)}}. {{assign}} adds columns without touching the original, and wrapping the chain in parentheses lets you put each step on its own line. Read it top to bottom like a recipe.`,
    r: `Chains keep intermediate junk variables out of your notebook and make a transformation easy to review and reuse.`,
    i: `What are the benefits of chaining, and what does reset_index(drop=True) do?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
result = (
    df.assign(bonus=df["salary"] * 0.1)
      .query("salary > 50000")
      .sort_values("bonus", ascending=False)
      .reset_index(drop=True)
)
print(result)`,
    v: flow("Each method receives the DataFrame from the one before it.", "row",
      ["df|6 rows|i", ".assign(bonus=…)|adds a column|g", ".query(\"salary > 50000\")|5 rows left|g", ".sort_values(\"bonus\")|biggest first|g", ".reset_index(drop=True)|tidy 0…n index|g"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["Start with the original table; a bonus column is added and the original df is untouched.", "Asha (48000) is filtered out.", "Rows are ordered by bonus, highest first.", "The index is renumbered 0 to 4 so it looks fresh."]),
  },
];
