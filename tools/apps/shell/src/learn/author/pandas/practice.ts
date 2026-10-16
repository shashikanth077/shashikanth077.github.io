import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["start", 1, "What is a DataFrame, and how does it differ from a NumPy array?", "A labelled table: named columns, a row index and a type per column. A NumPy array has one type and only positions. pandas adds loading, cleaning, grouping and joining on top of NumPy."],
  ["start", 1, "What is a Series?", "One labelled column: values plus an index. Every DataFrame column is a Series, and arithmetic between Series aligns on index labels."],
  ["start", 1, "What do {{df.shape}}, {{df.dtypes}} and {{df.describe()}} tell you?", "{{shape}} is (rows, columns); {{dtypes}} lists each column's type; {{describe()}} gives count, mean, spread and quartiles of the numeric columns. Together they are a first health check."],
  ["start", 1, "A numeric column has dtype object. What happened?", "Some values are text (like \"n/a\" or \"1,200\"), so the whole column became text. Clean the text and use {{pd.to_numeric(col, errors=\"coerce\")}}."],
  ["start", 1, "Why pass {{index=False}} to {{to_csv}}?", "Otherwise the row index is written as an extra unnamed column, which then appears again when you read the file."],
  ["select", 1, "What is the difference between {{df[\"a\"]}} and {{df[[\"a\"]]}}?", "The first returns a Series; the second, with a list inside the brackets, returns a one-column DataFrame."],
  ["select", 1, "{{loc}} versus {{iloc}}?", "{{loc}} selects by label and includes the end of a slice; {{iloc}} selects by position and excludes the end, like Python. After sorting or filtering, labels and positions differ."],
  ["select", 1, "Why does {{df[df.a > 1 and df.b < 5]}} fail?", "{{and}} needs a single True/False but a Series holds many. Use {{&}} with parentheses: {{(df.a > 1) & (df.b < 5)}}."],
  ["select", 2, "How do you keep rows whose value is in a list?", "{{df[df[\"dept\"].isin([\"IT\", \"HR\"])]}}. For ranges use {{between}}; for text, {{str.contains}}."],
  ["select", 1, "How do you get the 3 highest-paid employees?", "{{df.nlargest(3, \"salary\")}} or {{df.sort_values(\"salary\", ascending=False).head(3)}}."],
  ["clean", 1, "How do you count missing values per column?", "{{df.isna().sum()}}; use {{df.isna().mean()}} for the share missing."],
  ["clean", 2, "Compare dropna, fillna and interpolate.", "{{dropna}} deletes rows (fine if few); {{fillna}} inserts a constant, mean or median; {{interpolate}} draws a line between neighbours, good for ordered data. Each changes the statistics, so choose deliberately."],
  ["clean", 1, "How do you remove duplicate rows but keep the latest per id?", "Sort by time, then {{df.drop_duplicates(subset=\"id\", keep=\"last\")}}."],
  ["clean", 2, "Why normalise text before grouping?", "\"Pune \", \"pune\" and \"PUNE\" are different strings. {{strip}} and {{lower}} unify them so the group counts are right."],
  ["clean", 2, "How do you flag outliers with the IQR rule in pandas?", "Compute {{q1, q3 = s.quantile([0.25, 0.75])}}, {{iqr = q3 − q1}}, then select values below {{q1 − 1.5·iqr}} or above {{q3 + 1.5·iqr}}. {{clip}} caps them instead of dropping."],
  ["transform", 1, "How do you add a computed column?", "Assign to a new name: {{df[\"total\"] = df[\"price\"] * df[\"qty\"]}} — the expression runs on whole columns, no loop."],
  ["transform", 2, "{{map}} versus {{apply}}?", "{{map}} translates values through a dict or function; {{apply}} runs any function per value. {{apply}} is flexible but slow; prefer vectorised expressions or {{np.where}}."],
  ["transform", 2, "How do you bin ages into groups?", "{{pd.cut(ages, bins=[0, 30, 50, 100], labels=[…])}}; use {{pd.qcut}} for equal-sized groups by quantile."],
  ["transform", 1, "What does {{value_counts(normalize=True)}} return?", "The share of each distinct value, summing to 1 — a quick look at class balance."],
  ["group", 1, "Explain {{groupby}} in one sentence.", "Split the rows into groups by a key, apply a calculation to each group, and combine the results into one row per group."],
  ["group", 2, "{{agg}} versus {{transform}}?", "{{agg}} reduces each group to one row; {{transform}} returns a result the same length as the input, repeating the group statistic on every row."],
  ["group", 2, "How do you get several statistics per group?", "{{g.agg([\"count\", \"mean\", \"max\"])}} or named aggregation: {{agg(avg=(\"age\", \"mean\"), top=(\"salary\", \"max\"))}}."],
  ["group", 2, "{{size}} versus {{count}} in a groupby?", "{{size}} counts all rows in each group; {{count}} counts non-missing values per column."],
  ["group", 2, "What does {{pivot_table}} do?", "A group-by laid out as a grid: one key becomes the rows, another the columns, with an aggregate in the cells."],
  ["combine", 1, "{{concat}} versus {{merge}}?", "{{concat}} stacks tables (rows or columns) by position or index; {{merge}} joins on key columns like a database join."],
  ["combine", 1, "What do inner, left, right and outer joins keep?", "inner: only keys in both; left: all left rows; right: all right rows; outer: every key. Unmatched columns are NaN."],
  ["combine", 2, "A merge returns more rows than either input. Why?", "Duplicate keys on both sides multiply (many-to-many). Deduplicate first or use {{validate=\"one_to_one\"}} / {{\"many_to_one\"}}."],
  ["combine", 2, "How do you audit which rows did not match?", "{{indicator=True}} adds a {{_merge}} column with both, left_only or right_only; {{value_counts()}} on it summarises the join."],
  ["time", 1, "How do you get the weekday of every date?", "Convert with {{pd.to_datetime}}, then {{df[\"d\"].dt.day_name()}} or {{.dt.dayofweek}}."],
  ["time", 2, "What does {{resample}} do?", "Groups a time-indexed series into periods (day, week, month) and aggregates each — {{groupby}} for time."],
  ["time", 2, "Why does {{rolling(3).mean()}} begin with NaN?", "The first two positions lack three values of history; set {{min_periods}} to allow shorter windows."],
  ["time", 2, "How do you create a lag feature?", "{{df[\"lag1\"] = df[\"sales\"].shift(1)}} gives yesterday's value on today's row; {{pct_change()}} gives the growth rate."],
  ["ml", 1, "How do you build X and y from a DataFrame?", "{{X = df.drop(columns=\"target\")}} and {{y = df[\"target\"]}}. Check no column derived from the target stays in X."],
  ["ml", 1, "Why one-hot encode categories?", "Models need numbers, and mapping cities to 1, 2, 3 invents an order. {{pd.get_dummies}} makes a 0/1 column per category."],
  ["ml", 2, "What is data leakage in preprocessing?", "Using information from the test set when preparing training data, for example scaling or imputing with statistics computed on all rows. Fit on train, apply to both."],
  ["ml", 2, "Why not shuffle a time series before splitting?", "The model would train on the future and be tested on the past. Split by date so training always precedes testing."],
  ["pitfalls", 2, "Why does {{df[mask][\"b\"] = 0}} not change {{df}}?", "Chained indexing assigns into a temporary copy. Use {{df.loc[mask, \"b\"] = 0}} in one step."],
  ["pitfalls", 2, "{{df2 = df}} versus {{df.copy()}}?", "The first creates another name for the same object, so edits show up in both; the second creates an independent table."],
  ["pitfalls", 2, "Why avoid {{iterrows}} for calculations?", "It runs Python once per row. Vectorised column expressions run in compiled code and are orders of magnitude faster."],
  ["pitfalls", 2, "Adding two Series gives NaN. Why?", "pandas aligns on index labels; labels present in only one Series give NaN. Check the indexes, or use {{add(fill_value=0)}}."],
];

export const drills: DrillDef[] = [
  {
    t: "Shape of a DataFrame",
    q: "What does this print?",
    code: py`
import pandas as pd
df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
print(df.shape)`,
    opts: [["(3, 2)", true, "Three rows, two columns."], ["(2, 3)", false, "Rows come first."], ["6", false, "That would be df.size."]],
    path: ["Each list has 3 values → 3 rows.", "Two keys → 2 columns.", "shape = (rows, columns) = (3, 2)."],
    why: "shape is (rows, columns).",
    watch: "df.size is the total cell count.",
    remember: "(rows, columns)",
  },
  {
    t: "loc slices include the end",
    q: "What does this print?",
    code: py`
import pandas as pd
s = pd.Series([10, 20, 30, 40], index=["a", "b", "c", "d"])
print(s.loc["b":"c"].tolist(), s.iloc[1:3].tolist())`,
    opts: [["[20, 30] [20, 30]", true, "loc includes \"c\"; iloc excludes position 3."], ["[20] [20, 30]", false, "loc includes the end label."], ["[20, 30, 40] [20, 30]", false, "loc stops at c, not d."]],
    path: ["loc[\"b\":\"c\"] includes both labels: 20, 30.", "iloc[1:3] takes positions 1 and 2: 20, 30."],
    why: "Label slices include the end, position slices do not.",
    watch: "Both gave two items here but for different reasons.",
    remember: "loc inclusive, iloc exclusive.",
  },
  {
    t: "Boolean filter",
    q: "What remains after this filter?",
    code: py`
import pandas as pd
df = pd.DataFrame({"n": ["a", "b", "c"], "v": [5, 15, 25]})
print(df[df["v"] > 10]["n"].tolist())`,
    opts: [["['b', 'c']", true, "Only 15 and 25 are above 10."], ["['a']", false, "5 fails the condition."], ["[False, True, True]", false, "That is the mask, not the filtered names."]],
    path: ["v > 10 → [False, True, True].", "The mask keeps rows 1 and 2.", "Their names are b and c."],
    why: "A boolean mask selects the True rows.",
    watch: "Combine masks with & and | in parentheses.",
    remember: "Compare, then index with the result.",
  },
  {
    t: "Mean ignores NaN",
    q: "What does this print?",
    code: py`
import numpy as np
import pandas as pd
s = pd.Series([2, np.nan, 4])
print(s.mean(), s.sum(), s.count())`,
    opts: [["3.0 6.0 2", true, "NaN is skipped: mean of 2 and 4, sum 6, two valid values."], ["nan nan 3", false, "pandas skips NaN by default (unlike NumPy)."], ["2.0 6.0 3", false, "The mean divides by the 2 valid values, not 3."]],
    path: ["The valid values are 2 and 4.", "mean = 3.0, sum = 6.0.", "count() counts non-missing values: 2."],
    why: "pandas statistics skip NaN by default.",
    watch: "np.mean on a plain array would return nan.",
    remember: "skipna=True is the default.",
  },
  {
    t: "groupby sum",
    q: "What does this print?",
    code: py`
import pandas as pd
df = pd.DataFrame({"k": ["a", "b", "a"], "v": [1, 2, 3]})
print(df.groupby("k")["v"].sum().to_dict())`,
    opts: [["{'a': 4, 'b': 2}", true, "Group a has 1 + 3 = 4; group b has 2."], ["{'a': 1, 'b': 2}", false, "That ignores the second a row."], ["{'a': 2, 'b': 1}", false, "Those are the counts."]],
    path: ["Group a: rows 0 and 2 → 1 + 3 = 4.", "Group b: row 1 → 2."],
    why: "groupby splits rows by key, then sums each group.",
    watch: "The group key becomes the index of the result.",
    remember: "split → apply → combine",
  },
  {
    t: "transform keeps the length",
    q: "How many rows does the result have?",
    code: py`
import pandas as pd
df = pd.DataFrame({"k": ["a", "b", "a"], "v": [1, 2, 3]})
print(len(df.groupby("k")["v"].transform("mean")), len(df.groupby("k")["v"].mean()))`,
    opts: [["3 2", true, "transform returns one value per original row; mean returns one per group."], ["2 2", false, "transform keeps all rows."], ["3 3", false, "mean has one row per group (2)."]],
    path: ["3 original rows → transform returns 3 values.", "2 groups → mean returns 2 values."],
    why: "transform broadcasts the group statistic back to every row.",
    watch: "Use it to compare rows with their own group.",
    remember: "agg shrinks, transform keeps.",
  },
  {
    t: "Left merge",
    q: "What does this print?",
    code: py`
import pandas as pd
a = pd.DataFrame({"id": [1, 2, 3]})
b = pd.DataFrame({"id": [2, 3, 4], "x": [20, 30, 40]})
print(a.merge(b, on="id", how="left")["x"].isna().sum())`,
    opts: [["1", true, "id 1 has no partner in b, so its x is NaN."], ["0", false, "id 1 is missing from b."], ["2", false, "ids 2 and 3 do match."]],
    path: ["Left keeps ids 1, 2, 3.", "ids 2 and 3 get x = 20, 30.", "id 1 gets NaN."],
    why: "A left join keeps every left row.",
    watch: "id 4 from b is dropped.",
    remember: "left keeps all left rows.",
  },
  {
    t: "Duplicate keys multiply",
    q: "How many rows does the merge return?",
    code: py`
import pandas as pd
a = pd.DataFrame({"k": [1, 1]})
b = pd.DataFrame({"k": [1, 1, 1]})
print(len(a.merge(b, on="k")))`,
    opts: [["6", true, "2 left rows × 3 right rows with the same key."], ["3", false, "Each left row pairs with every right row."], ["2", false, "That would be a one-to-one match."]],
    path: ["Key 1 appears 2 times on the left and 3 on the right.", "Every pair matches: 2 × 3 = 6."],
    why: "A merge produces every combination of matching rows.",
    watch: "Check row counts before and after merging.",
    remember: "many × many = a product.",
  },
  {
    t: "Rolling window",
    q: "What does this print?",
    code: py`
import pandas as pd
s = pd.Series([1, 2, 3, 4])
print(s.rolling(2).mean().tolist())`,
    opts: [["[nan, 1.5, 2.5, 3.5]", true, "The first window is incomplete → NaN; then 1.5, 2.5, 3.5."], ["[1.5, 2.5, 3.5]", false, "The result keeps the original length."], ["[1.0, 1.5, 2.5, 3.5]", false, "min_periods defaults to the window size, so the first value is NaN."]],
    path: ["Window 2 needs two values.", "Position 0 has only one → NaN.", "Then (1+2)/2, (2+3)/2, (3+4)/2."],
    why: "Incomplete windows give NaN by default.",
    watch: "Set min_periods=1 to avoid the NaN.",
    remember: "first window − 1 values are NaN.",
  },
  {
    t: "diff",
    q: "What does this print?",
    code: py`
import pandas as pd
print(pd.Series([100, 110, 99]).diff().tolist())`,
    opts: [["[nan, 10.0, -11.0]", true, "Each value minus the previous one; the first has no predecessor."], ["[10, -11]", false, "diff keeps the original length."], ["[0.0, 0.1, -0.1]", false, "That is pct_change (without the first NaN)."]],
    path: ["110 − 100 = 10.", "99 − 110 = −11.", "The first row has nothing to subtract: NaN."],
    why: "diff = s − s.shift(1).",
    watch: "The result is float because of the NaN.",
    remember: "first value is NaN.",
  },
  {
    t: "Chained assignment",
    q: "What does this print?",
    code: py`
import warnings
import pandas as pd
warnings.simplefilter("ignore")
df = pd.DataFrame({"a": [1, 2], "b": [0, 0]})
df[df["a"] > 1]["b"] = 9
print(df["b"].tolist())`,
    opts: [["[0, 0]", true, "The assignment hit a temporary copy; df is unchanged."], ["[0, 9]", false, "That needs df.loc[df[\"a\"] > 1, \"b\"] = 9."], ["[9, 9]", false, "Only matching rows would change even with loc."]],
    path: ["df[mask] makes a copy.", "['b'] = 9 writes into the copy.", "The copy is discarded; df stays [0, 0]."],
    why: "Chained indexing may assign into a copy.",
    watch: "Use .loc[rows, column] = value.",
    remember: "One .loc call.",
  },
  {
    t: "Alias versus copy",
    q: "What does this print?",
    code: py`
import pandas as pd
df = pd.DataFrame({"x": [1]})
other = df
other["y"] = 2
print(list(df.columns))`,
    opts: [["['x', 'y']", true, "other and df are the same object."], ["['x']", false, "That needs other = df.copy()."], ["['y']", false, "x is not removed."]],
    path: ["other = df points to the same table.", "Adding a column through other changes it.", "df now has x and y."],
    why: "Assignment binds another name; it does not copy.",
    watch: "Use .copy() before experimenting.",
    remember: "= is not a copy.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Salary statistics", "Create a salary column and print its mean, maximum and how many values exceed 60000.", py`
import pandas as pd

df = pd.DataFrame({"salary": [48000, 72000, 65000, 51000, 58000, 70000]})
print(df["salary"].mean(), df["salary"].max(), (df["salary"] > 60000).sum())`],
  ["IT employees over 33", "Filter a staff table for people in IT who are older than 33 and print their names.", py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
})
print(df[(df["dept"] == "IT") & (df["age"] > 33)]["name"].tolist())`],
  ["Clean a messy price column", "Convert \"1,200\", \"950\" and \"n/a\" into numbers, count the bad ones and fill them with the median.", py`
import pandas as pd

s = pd.Series(["1,200", "950", "n/a", "1,050"])
price = pd.to_numeric(s.str.replace(",", ""), errors="coerce")
print(price.isna().sum())
print(price.fillna(price.median()).tolist())`],
  ["Remove duplicates", "Drop repeated customer ids, keeping the last record, and print how many rows remain.", py`
import pandas as pd

df = pd.DataFrame({"id": [1, 2, 2, 3, 3], "score": [5, 6, 7, 8, 9]})
out = df.drop_duplicates(subset="id", keep="last")
print(len(out), out["score"].tolist())`],
  ["Average salary per department", "Group a staff table by department and print the mean salary, highest first.", py`
import pandas as pd

df = pd.DataFrame({
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
print(df.groupby("dept")["salary"].mean().sort_values(ascending=False))`],
  ["Salary versus department average", "Add each person's difference from their department's average salary.", py`
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia"],
    "dept": ["Sales", "IT", "IT", "Sales"],
    "salary": [48000, 72000, 65000, 51000],
})
df["diff"] = df["salary"] - df.groupby("dept")["salary"].transform("mean")
print(df[["name", "diff"]])`],
  ["Age bands", "Put ages into young, mid and senior bands and count each band.", py`
import pandas as pd

ages = pd.Series([22, 35, 47, 61, 29, 52])
band = pd.cut(ages, bins=[0, 30, 50, 100], labels=["young", "mid", "senior"])
print(band.value_counts().to_dict())`],
  ["Join customers and orders", "Left-merge customers with orders, then total the amount per customer name (missing counts as 0).", py`
import pandas as pd

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Ana", "Bo", "Cy"]})
orders = pd.DataFrame({"id": [2, 3, 3], "amount": [50, 30, 20]})
m = customers.merge(orders, on="id", how="left")
print(m.groupby("name")["amount"].sum().to_dict())`],
  ["Monthly totals", "Resample daily sales into monthly totals.", py`
import pandas as pd

s = pd.Series([5, 10, 15, 20], index=pd.to_datetime(["2026-01-10", "2026-01-25", "2026-02-05", "2026-02-20"]))
print(s.resample("MS").sum().tolist())`],
  ["Lag feature", "Create yesterday's sales as a feature and the day-on-day change.", py`
import pandas as pd

df = pd.DataFrame({"sales": [100, 110, 99, 120]})
df["lag1"] = df["sales"].shift(1)
df["change"] = df["sales"].diff()
print(df)`],
  ["One-hot and a split", "One-hot encode a city column, then split 5 rows 80/20 and print the shapes.", py`
import pandas as pd

df = pd.DataFrame({"city": ["Pune", "Delhi", "Pune", "Goa", "Delhi"], "y": [1, 0, 1, 0, 1]})
X = pd.get_dummies(df.drop(columns="y"), dtype=int)
y = df["y"]
cut = int(len(df) * 0.8)
print(X.shape, X.iloc[:cut].shape, X.iloc[cut:].shape)
print(sorted(X.columns))`],
  ["Dataset health report", "Print rows, missing cells, duplicate rows and the share of the majority class.", py`
import numpy as np
import pandas as pd

df = pd.DataFrame({"age": [22, 35, 35, np.nan], "y": [0, 1, 1, 1]})
print(len(df), int(df.isna().sum().sum()), int(df.duplicated().sum()))
print(df["y"].value_counts(normalize=True).max())`],
];

export const glance: [string, string][] = [
  ["Load / save", "pd.read_csv(path, dtype=…, parse_dates=…, na_values=…) · df.to_csv(path, index=False)"],
  ["First look", "df.shape · df.head() · df.dtypes · df.describe() · df.isna().sum()"],
  ["Select", "df[\"a\"] (Series) · df[[\"a\", \"b\"]] (DataFrame) · df.loc[rows, cols] · df.iloc[rows, cols]"],
  ["Filter", "df[(df.a > 1) & (df.b == \"x\")] · isin · between · str.contains · query"],
  ["Sort", "sort_values(\"a\", ascending=False) · nlargest(n, \"a\")"],
  ["Missing", "isna() · dropna() · fillna(value) · ffill() · interpolate()"],
  ["Clean", "drop_duplicates() · astype() · pd.to_numeric(errors=\"coerce\") · .str.strip().str.lower()"],
  ["New columns", "df[\"c\"] = df.a * df.b · map(dict) · np.where · pd.cut"],
  ["Group", "df.groupby(\"k\")[\"v\"].agg([…]) · transform(\"mean\") · pivot_table(…)"],
  ["Combine", "pd.concat([a, b]) · a.merge(b, on=\"k\", how=\"left\", indicator=True)"],
  ["Time", "pd.to_datetime · .dt.month · resample(\"MS\").sum() · rolling(3).mean() · shift() · pct_change()"],
  ["For ML", "X = df.drop(columns=\"y\") · pd.get_dummies · fit scalers on train only"],
];

export const lists: [string, string[]][] = [
  ["Habits that prevent pandas bugs", ["Print .shape before and after every merge or filter", "Check .dtypes right after loading", "Use .loc[rows, col] = value, never chained assignment", "Use .copy() before changing a slice or an alias", "Parenthesise every condition and use & | ~", "Prefer column expressions to loops and apply"]],
  ["Before you train a model", ["No target-derived column left in X", "Missing values handled with training statistics only", "Categories encoded; no invented order", "Duplicate rows removed before splitting", "Split first (by date for time series), then fit scalers", "Class balance checked with value_counts(normalize=True)"]],
  ["Explaining your answer in an interview", ["State the shape of each table in the problem", "Name the key and the join type, and expected row count", "Say whether you aggregate (agg) or keep every row (transform)", "Mention how you treat missing values and why", "Offer the vectorised version"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["10 minutes to pandas", "https://pandas.pydata.org/docs/user_guide/10min.html"], ["User guide", "https://pandas.pydata.org/docs/user_guide/index.html"], ["Merge, join, concatenate", "https://pandas.pydata.org/docs/user_guide/merging.html"], ["Group by: split-apply-combine", "https://pandas.pydata.org/docs/user_guide/groupby.html"]]],
  ["Practise and explore", [["pandas getting started tutorials", "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html"], ["Kaggle Learn: Pandas", "https://www.kaggle.com/learn/pandas"]]],
  ["Books worth owning", [["Python for Data Analysis — Wes McKinney (free online)", "https://wesmckinney.com/book/"], ["Python Data Science Handbook — Jake VanderPlas (free online)", "https://jakevdp.github.io/PythonDataScienceHandbook/"]]],
];
