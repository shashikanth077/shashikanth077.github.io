import { L, P, cells, compare, flow, par, plot, pt, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import type { CellsRow } from "../../visuals/types.js";

/* Example outputs are NOT written here: `npm run outputs -- pandas` runs each snippet with real pandas. */

/** A DataFrame as boxes: a header row, then one row per record. Row 0 of the diagram is the header. */
export const table = (headers: string[], rows: string[][], names?: string[]): CellsRow[] => [
  P("columns", headers),
  ...rows.map((r, i) => P(names?.[i] ?? String(i), r)),
];

/** The six-person staff table used across the track. */
export const staff: string[][] = [
  ["Asha", "Sales", "29", "48000"],
  ["Ben", "IT", "41", "72000"],
  ["Chen", "IT", "35", "65000"],
  ["Dia", "Sales", "28", "51000"],
  ["Eli", "HR", "50", "58000"],
  ["Fay", "IT", "33", "70000"],
];
export const staffHead = ["name", "dept", "age", "salary"];

/* ------------------------------------------------------------------ */
export const start: ConceptDef[] = [
  {
    t: "Why pandas: tables in Python",
    lv: 1,
    s: `Most real data is a table: rows of records, columns with names and different types. A NumPy array has one type and only positions; a Python list of dicts has no tools. pandas gives you the {{DataFrame}} — a labelled table — with one-line methods to load, filter, clean, group and join it. It is the tool you reach for first, before any machine learning.`,
    r: `Before a model sees data it has been loaded, cleaned, joined and summarised with pandas. Most of a data scientist's time is spent here.`,
    i: `What does a pandas DataFrame give you that a NumPy array does not?`,
    c: py`
import pandas as pd

sales = pd.DataFrame({
    "city": ["Pune", "Delhi", "Pune"],
    "revenue": [120, 90, 80],
})
print(sales)
print(sales.groupby("city")["revenue"].sum())`,
    v: compare("NumPy is for numbers in bulk; pandas is for tables of mixed, labelled data.", ["NumPy array", "pandas DataFrame"], [
      ["Labels", "positions only: a[1, 2]", "named columns and an index: df.loc[1, \"salary\"]"],
      ["Types", "one type for everything", "a type per column: text, numbers, dates"],
      ["Missing data", "NaN in float arrays only", "NaN handled by isna(), dropna(), fillna()"],
      ["Typical job", "maths on numbers, matrices", "load, clean, filter, group, join"],
    ], 1),
  },
  {
    t: "Install and import",
    lv: 1,
    s: `Install once with {{python -m pip install pandas}} (notebook: {{%pip install pandas}}) into the same environment you run code in. Every script starts with {{import pandas as pd}} — {{pd}} is the universal nickname. pandas builds on NumPy, so it installs that too; you will often import both.`,
    r: `"No module named pandas" means pandas is installed in a different Python from the one running your code — check which interpreter your editor or notebook uses.`,
    i: `Why import pandas as pd, and which package does it depend on?`,
    c: py`
import pandas as pd

print(pd.Series([1, 2, 3]).sum())
print(type(pd.DataFrame()).__name__)`,
    v: flow("Install into the right environment, then import with the standard nickname.", "row",
      ["pip install pandas|once per environment|w", "import pandas as pd|top of every file|g", "pd.Series / pd.DataFrame|the two core objects|g", "pd.read_csv(...)|load real data|g"],
      [[0, 1], [1, 2], [2, 3]], undefined,
      ["Install into the same Python your editor runs, then import under the nickname pd.", "Build a Series (one column) or a DataFrame (a table).", "Or read a file straight into a DataFrame."]),
  },
  {
    t: "Series: one labelled column",
    lv: 1,
    s: `A {{Series}} is a one-dimensional list of values with a label for each — its {{index}}. {{s["Ben"]}} looks a value up by label, {{s.iloc[1]}} by position, and arithmetic works on the whole Series at once: {{s * 2}}, {{s.mean()}}. When two Series are combined, pandas lines them up by label, not by position.`,
    r: `Every column of a DataFrame is a Series, so everything you learn here applies to columns.`,
    i: `What is the difference between a Series' index label and its position?`,
    c: py`
import pandas as pd

s = pd.Series([70, 85, 90], index=["Asha", "Ben", "Chen"])
print(s)
print(s["Ben"], s.iloc[1])
print(s.mean())
print((s + 5).tolist())`,
    v: cells("A Series is values plus a label for each one.", [P("index (labels)", ["Asha", "Ben", "Chen"]), L("values", ["70", "85", "90"], "pos")], [
      ["s holds three values, each with a label (the index) and a position."],
      ["s[\"Ben\"] looks up by LABEL → 85.", [[0, 1, 1], [1, 1, 1]]],
      ["s.iloc[1] looks up by POSITION → also 85 here.", [[1, 1, 1]]],
      ["s + 5 adds to every value at once: 75, 90, 95.", [[1, 0, 2]]],
    ]),
  },
  {
    t: "DataFrame: a table of columns",
    lv: 1,
    s: `A {{DataFrame}} is a table whose columns are Series that share one index. Build it from a dictionary — each key becomes a column name — and inspect it with {{df.shape}} (rows, columns), {{df.columns}} and {{df.index}}. Think of it as a spreadsheet you can program.`,
    r: `Nearly all data work starts by reading a table into a DataFrame and checking its shape.`,
    i: `What are the shape and columns of a DataFrame built from a dictionary of three equal-length lists?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen"],
    "dept": ["Sales", "IT", "IT"],
    "salary": [48000, 72000, 65000],
})
print(df)
print(df.shape)
print(df.columns.tolist())`,
    v: cells("Dictionary keys become column names; the index labels the rows.", table(["name", "dept", "salary"], [["Asha", "Sales", "48000"], ["Ben", "IT", "72000"], ["Chen", "IT", "65000"]]), [
      ["A table: 3 rows and 3 columns."],
      ["The header row holds the column names — the dictionary keys.", [[0, 0, 2]]],
      ["Each column is a Series: here, the whole salary column.", [[1, 2, 2], [2, 2, 2], [3, 2, 2]]],
      ["Each row is one record, labelled 0, 1, 2 by the index. shape = (3, 3).", [[2, 0, 2]]],
    ]),
  },
  {
    t: "Column types (dtypes)",
    lv: 1,
    s: `Each column has one {{dtype}}: {{int64}} and {{float64}} for numbers, {{bool}}, {{datetime64}} for dates, {{category}} for repeated labels and {{object}} for text (newer pandas may show {{str}}). Wrong dtypes cause most surprises: numbers read as text do not add up. Check {{df.dtypes}} early and convert with {{astype}}.`,
    r: `A price column that loaded as text will sort "100" before "9" and fail on arithmetic. Always look at dtypes right after loading.`,
    i: `A numeric column was read as object. What does that usually mean and how do you fix it?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"id": [1, 2], "price": [9.5, 12.0], "name": ["a", "b"], "ok": [True, False]})
print(df.dtypes)
df["id"] = df["id"].astype("float64")
print(df["id"].dtype)`,
    v: compare("What each dtype means and when you see it.", ["Holds", "Typical cause"], [
      ["int64", "whole numbers", "counts, ids"],
      ["float64", "decimals, and NaN for missing", "measurements; any NaN turns ints into floats"],
      ["object", "text (or mixed)", "names; numbers that loaded as text"],
      ["bool", "True / False", "flags, comparison results"],
      ["datetime64", "dates and times", "after pd.to_datetime"],
      ["category", "a few repeated labels", "astype(\"category\") saves memory"],
    ]),
  },
  {
    t: "Reading and writing CSV files",
    lv: 1,
    s: `{{pd.read_csv("file.csv")}} loads a file into a DataFrame; {{df.to_csv("out.csv", index=False)}} writes one ({{index=False}} leaves out the row numbers). Useful options: {{usecols}} to read some columns, {{dtype}} to force types, {{parse_dates}} to read dates, {{na_values}} to mark custom missing markers and {{nrows}} to read a sample of a huge file. The examples read from text in memory so you can run them as they are.`,
    r: `Real files have odd missing markers ("N/A", "-"), leading-zero ids and dates stored as text. Set options on read instead of repairing afterwards.`,
    i: `Why pass index=False to to_csv?`,
    c: py`
import io
import pandas as pd

text = """id,city,score
001,Pune,90
002,Delhi,N/A
003,Pune,75
"""
df = pd.read_csv(io.StringIO(text), dtype={"id": str}, na_values=["N/A"])
print(df)
print(df["score"].mean())
print(df.to_csv(index=False))`,
    v: compare("Read options that save cleaning work later.", ["Effect", "Example"], [
      ["usecols", "load only some columns", "usecols=[\"name\", \"salary\"]"],
      ["dtype", "force a type — keeps leading zeros", "dtype={\"id\": str}"],
      ["parse_dates", "read date columns as datetimes", "parse_dates=[\"date\"]"],
      ["na_values", "extra markers that mean missing", "na_values=[\"N/A\", \"-\"]"],
      ["nrows", "only the first rows — for huge files", "nrows=1000"],
      ["index=False", "(to_csv) don't write row numbers", "df.to_csv(\"out.csv\", index=False)"],
    ]),
  },
  {
    t: "First look at a dataset",
    lv: 1,
    s: `Before any analysis, ask the same five questions: how big ({{df.shape}}), what does it look like ({{df.head()}}), what types ({{df.dtypes}} or {{df.info()}}), what are the numbers like ({{df.describe()}}) and what is missing ({{df.isna().sum()}}). Five lines tell you whether the data can be trusted.`,
    r: `Skipping this step is how a column of ages containing 999 or a half-empty column ends up inside a model.`,
    i: `What five things do you check as soon as you load a new dataset?`,
    c: py`
import io
import pandas as pd

csv = io.StringIO("""name,dept,age,salary
Asha,Sales,29,48000
Ben,IT,41,72000
Chen,IT,35,65000
Dia,Sales,28,51000
Eli,HR,50,58000
Fay,IT,33,70000
""")
df = pd.read_csv(csv)
print(df.shape)
print(df.head(3))
print(df.isna().sum().sum())
print(df.describe().loc[["count", "mean", "max"]])`,
    v: flow("The same five checks for every new dataset.", "row",
      ["df.shape|how many rows and columns|i", "df.head()|what a few rows look like|g", "df.dtypes|are the types right?|g", "df.describe()|min, mean, max per column|g", "df.isna().sum()|what is missing?|w"],
      [[0, 1], [1, 2], [2, 3], [3, 4]], undefined,
      ["Size first, then look at actual rows for obvious oddities — (6, 4) here: six rows, four columns.", "Numbers stored as text show up as object.", "Impossible minimums or maximums reveal bad values.", "Count the gaps in every column."]),
  },
];

/* ------------------------------------------------------------------ */
export const select: ConceptDef[] = [
  {
    t: "Selecting columns",
    lv: 1,
    s: `{{df["salary"]}} returns one column as a Series. {{df[["name", "salary"]]}} — a list inside the brackets — returns a smaller DataFrame. Prefer brackets to the dot form ({{df.salary}}), which fails for names with spaces or names that clash with methods such as {{count}}.`,
    r: `Selecting exactly the columns a model needs is the first step of feature building.`,
    i: `What is the difference between df["a"] and df[["a"]]?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"name": ["Asha", "Ben"], "dept": ["Sales", "IT"], "salary": [48000, 72000]})
print(type(df["salary"]).__name__)
print(type(df[["salary"]]).__name__)
print(df[["name", "salary"]])`,
    v: cells("One name gives a Series, a list of names gives a DataFrame.", table(staffHead, staff.slice(0, 4)), [
      ["The full table: name, dept, age, salary."],
      ["df[\"salary\"] → one column, a Series.", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3]]],
      ["df[[\"name\", \"salary\"]] → two columns, still a DataFrame.", [[1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0], [1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3]]],
    ]),
  },
  {
    t: "loc and iloc: labels versus positions",
    lv: 1,
    s: `{{df.loc[rows, columns]}} selects by label; {{df.iloc[rows, columns]}} selects by position. The big difference: a {{loc}} slice includes the end label ({{loc["a":"c"]}} gives a, b and c), while an {{iloc}} slice excludes the end position like Python ({{iloc[0:2]}} gives two rows). When the index is 0, 1, 2… the two look alike — until you filter or sort and the labels stop matching the positions.`,
    r: `Confusing loc and iloc after a sort or filter silently returns the wrong rows.`,
    i: `How do loc and iloc differ when slicing, and why can the same number mean different rows?`,
    c: py`
import pandas as pd

df = pd.DataFrame({"salary": [48000, 72000, 65000, 51000]}, index=["Asha", "Ben", "Chen", "Dia"])
print(df.loc["Ben":"Chen", "salary"].tolist())
print(df.iloc[1:3, 0].tolist())
print(df.loc["Dia", "salary"], df.iloc[3, 0])`,
    v: compare("Same table, two ways to point at it.", [".loc (labels)", ".iloc (positions)"], [
      ["Selects by", "row and column names", "row and column numbers from 0"],
      ["Slice end", "INCLUDED: loc[\"Ben\":\"Chen\"] is 2 rows", "EXCLUDED: iloc[1:3] is 2 rows"],
      ["Example", "df.loc[\"Dia\", \"salary\"]", "df.iloc[3, 0]"],
      ["Best when", "labels matter and may be reordered", "you want the first/last n rows"],
    ]),
  },
  {
    t: "Boolean filtering: keep the rows that match",
    lv: 1,
    s: `A comparison on a column such as {{df["salary"] > 60000}} gives a True/False value for every row — a mask. Putting it inside brackets, {{df[mask]}}, keeps only the True rows. It is the pandas version of "WHERE" in SQL. Drag the threshold: each dot is one employee's salary, and only dots right of the line survive.`,
    r: `Filtering rows (active customers, orders above a value, valid readings) is part of nearly every analysis.`,
    i: `What does df[df["age"] > 30] do step by step?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
mask = df["salary"] > 60000
print(mask.tolist())
print(df[mask])`,
    v: plot("Each dot is one salary (in thousands). The line is the threshold; dots to its right are kept.", {
      x: [40, 80], y: [-1, 1], labels: ["salary (thousands)", ""],
      params: [par("t", "threshold (thousands)", 40, 80, 1, 60)],
      defs: [["n", "step(48-t)+step(72-t)+step(65-t)+step(51-t)+step(58-t)+step(70-t)"]],
      readout: ["salary > {t}000 keeps {n} of 6 rows"],
      steps: [
        ["salary > 60000: Ben, Chen and Fay are kept — 3 of 6 rows.", { t: 60 }],
        ["Lower the bar to 45000: every row passes.", { t: 45 }],
        ["Raise it to 71000: only Ben (72000) is left.", { t: 71 }],
      ],
    }, [
      vline("t", { c: "warn", label: "threshold {t}" }),
      pt("48", "0.5", { c: "accent", label: "Asha", show: "48-t" }),
      pt("48", "0.5", { c: "muted", label: "Asha", show: "t-48+0.0001" }),
      pt("51", "-0.5", { c: "accent", label: "Dia", show: "51-t" }),
      pt("51", "-0.5", { c: "muted", label: "Dia", show: "t-51+0.0001" }),
      pt("58", "0.5", { c: "accent", label: "Eli", show: "58-t" }),
      pt("58", "0.5", { c: "muted", label: "Eli", show: "t-58+0.0001" }),
      pt("65", "-0.5", { c: "accent", label: "Chen", show: "65-t" }),
      pt("65", "-0.5", { c: "muted", label: "Chen", show: "t-65+0.0001" }),
      pt("70", "0.5", { c: "accent", label: "Fay", show: "70-t" }),
      pt("70", "0.5", { c: "muted", label: "Fay", show: "t-70+0.0001" }),
      pt("72", "-0.5", { c: "accent", label: "Ben", show: "72-t" }),
      pt("72", "-0.5", { c: "muted", label: "Ben", show: "t-72+0.0001" }),
    ]),
  },
  {
    t: "Combining conditions: & | ~",
    lv: 1,
    s: `To combine conditions use {{&}} (and), {{|}} (or) and {{~}} (not) — and wrap each comparison in parentheses: {{df[(df["dept"] == "IT") & (df["age"] > 33)]}}. The Python words {{and}} / {{or}} fail with "truth value of a Series is ambiguous" because a Series holds many True/False values, not one.`,
    r: `The missing-parentheses error is the most common pandas filtering bug. Build complex filters from named masks to keep them readable.`,
    i: `Why does df[df.a > 1 and df.b < 5] raise an error?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
})
it = df["dept"] == "IT"
older = df["age"] > 33
print(df[it & older]["name"].tolist())
print(df[it | older]["name"].tolist())
print(df[~it]["name"].tolist())`,
    v: compare("Three operators, each condition in its own parentheses.", ["Meaning", "Example"], [
      ["&", "AND — both must be true", "(df[\"dept\"] == \"IT\") & (df[\"age\"] > 33)"],
      ["|", "OR — at least one is true", "(df[\"dept\"] == \"HR\") | (df[\"age\"] > 40)"],
      ["~", "NOT — flip True and False", "~(df[\"dept\"] == \"IT\")"],
      ["and / or", "do NOT work on Series", "raises \"truth value of a Series is ambiguous\""],
    ]),
  },
  {
    t: "isin, between, str.contains and query",
    lv: 2,
    s: `Readable helpers replace long chains of {{|}}: {{df["dept"].isin(["IT", "HR"])}} is membership, {{df["age"].between(30, 40)}} is an inclusive range, {{df["name"].str.contains("a", case=False)}} searches text and {{df.query("age > 30 and dept == 'IT'")}} writes the whole filter as a string where {{and}} is allowed.`,
    r: `isin is the idiom for "customers in this list of ids"; between is the idiom for date and value ranges.`,
    i: `How do you select rows whose dept is one of several values?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
})
print(df[df["dept"].isin(["HR", "Sales"])]["name"].tolist())
print(df[df["age"].between(30, 40)]["name"].tolist())
print(df[df["name"].str.contains("a", case=False)]["name"].tolist())
print(df.query("age > 30 and dept == 'IT'")["name"].tolist())`,
    v: compare("Four helpers for common filters.", ["Keeps rows where…", "Example"], [
      ["isin", "the value is in a list", "df[\"dept\"].isin([\"IT\", \"HR\"])"],
      ["between", "the value is in a range (both ends included)", "df[\"age\"].between(30, 40)"],
      ["str.contains", "text contains a pattern", "df[\"name\"].str.contains(\"a\", case=False)"],
      ["query", "a string expression is true", "df.query(\"age > 30 and dept == 'IT'\")"],
    ]),
  },
  {
    t: "Sorting and top-n",
    lv: 1,
    s: `{{df.sort_values("salary", ascending=False)}} orders rows; sort by several columns with a list. {{df.nlargest(2, "salary")}} and {{df.nsmallest}} take the top or bottom rows directly. Sorting returns a new DataFrame, and the old index labels travel with the rows — so {{loc}} still finds the same person while {{iloc[0]}} now means the new first row.`,
    r: `Leaderboards, top customers and worst-performing products are sort_values or nlargest.`,
    i: `After sort_values, why can df.iloc[0] and df.loc[0] be different rows?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
top = df.sort_values("salary", ascending=False)
print(top["name"].tolist())
print(df.nlargest(2, "salary")["name"].tolist())
print(top.iloc[0]["name"], top.loc[0]["name"])`,
    v: cells("The rows move; their original index labels travel with them.", table(["name", "salary"], [["Asha", "48000"], ["Ben", "72000"], ["Chen", "65000"], ["Dia", "51000"], ["Eli", "58000"], ["Fay", "70000"]]), [
      ["Unsorted: the index (left) is 0 to 5."],
      ["sort_values(\"salary\", ascending=False) puts the biggest salary first.", [[2, 1, 1]], table(["name", "salary"], [["Ben", "72000"], ["Fay", "70000"], ["Chen", "65000"], ["Eli", "58000"], ["Dia", "51000"], ["Asha", "48000"]], ["1", "5", "2", "4", "3", "0"])],
      ["nlargest(2, \"salary\") is just these top two rows: Ben and Fay.", [[1, 0, 1], [2, 0, 1]]],
      ["Labels stayed with their rows: loc[0] is still Asha, but iloc[0] is now Ben.", [[1, 0, 1], [6, 0, 1]]],
    ]),
  },
];
