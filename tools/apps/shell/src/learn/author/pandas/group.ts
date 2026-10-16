import { P, bars, cells, compare, par } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { staff, staffHead, table } from "./basics.js";

const staffDf = py`
df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})`;

/* ------------------------------------------------------------------ */
export const group: ConceptDef[] = [
  {
    t: "groupby: split, apply, combine",
    lv: 1,
    s: `{{df.groupby("dept")["salary"].mean()}} answers "what is the average salary in each department?". pandas splits the rows into one group per department, applies the calculation to each group, then combines the results into a new table with one row per group. This is the pandas version of SQL {{GROUP BY}} and it is the most useful idea in the library.`,
    r: `Revenue per region, average rating per product, error rate per day, accuracy per class — all groupby.`,
    i: `Explain split-apply-combine with an example.`,
    c: py`
import pandas as pd
` + staffDf + py`

print(df.groupby("dept")["salary"].mean())`,
    v: cells("Rows are sorted into groups, each group is summarised, and the summaries become the result.", table(staffHead, staff), [
      ["Six employees in three departments."],
      ["SPLIT: the Sales rows form one group (Asha, Dia).", [[1, 1, 1], [4, 1, 1]]],
      ["…the IT rows form another (Ben, Chen, Fay).", [[2, 1, 1], [3, 1, 1], [6, 1, 1]]],
      ["…and HR has a single row (Eli).", [[5, 1, 1]]],
      ["APPLY + COMBINE: the mean salary of each group becomes one row of the result.", [], [P("dept", ["HR", "IT", "Sales"]), P("mean salary", ["58000.0", "69000.0", "49500.0"])]],
    ]),
  },
  {
    t: "A group mean you can move",
    lv: 1,
    s: `A group's average depends on every row in it. IT's mean is {{(Ben + Chen + Fay) / 3}}. Drag Ben's salary and only the IT bar moves — Sales and HR are separate groups and never see his number. Remember this when one extreme row sits in a small group: it can dominate that group's mean.`,
    r: `Group sizes matter. A mean from 3 rows is far less reliable than one from 3,000; always look at {{size()}} next to the average.`,
    i: `Why can the mean of a small group be misleading, and what would you show alongside it?`,
    v: bars("Mean salary per department (thousands). Only the group containing Ben reacts to his salary.", [["Sales", "49.5"], ["IT", "(b+135)/3"], ["HR", "58"]], {
      max: 110,
      params: [par("b", "Ben's salary (thousands)", 40, 110, 1, 72)],
      readout: ["IT mean = ({b} + 65 + 70) / 3 = {(b+135)/3:1} thousand"],
      steps: [["Ben at 72: IT averages 69.", { b: 72 }], ["Ben at 110: the IT average jumps to 81.7.", { b: 110 }], ["Ben at 40: IT falls below HR.", { b: 40 }]],
    }),
  },
  {
    t: "Several summaries at once with agg",
    lv: 2,
    s: `{{.agg([...])}} computes several statistics in one call: {{g.agg(["count", "mean", "max"])}}. For readable column names use named aggregation: {{df.groupby("dept").agg(avg_age=("age", "mean"), top_pay=("salary", "max"))}} — each keyword is a new column, each tuple is (column, function).`,
    r: `A single groupby with a named agg builds a whole summary table; no loops, no merges.`,
    i: `How do you get the count, mean and max of salary per department in one call?`,
    c: py`
import pandas as pd
` + staffDf + py`

g = df.groupby("dept")["salary"]
print(g.agg(["count", "mean", "max"]))
print(df.groupby("dept").agg(avg_age=("age", "mean"), top_pay=("salary", "max")))`,
    v: compare("Two styles of aggregation.", ["agg([...])", "named aggregation"], [
      ["Syntax", "g.agg([\"count\", \"mean\", \"max\"])", "agg(avg_age=(\"age\", \"mean\"), top_pay=(\"salary\", \"max\"))"],
      ["Columns come from", "the function names", "the keywords you choose"],
      ["Different columns", "one source column", "each output can use a different source column"],
      ["Best for", "quick exploration", "tidy summary tables with clear names"],
    ], 1),
  },
  {
    t: "Several keys, sizes and counts",
    lv: 2,
    s: `Group by more than one column with a list: {{df.groupby(["region", "product"])["units"].sum()}} gives one row for each combination. {{size()}} counts rows per group (including missing values) while {{count()}} counts non-missing values per column. {{reset_index()}} turns the group labels back into ordinary columns.`,
    r: `Most business questions have two keys: product by month, class by fold, user by day.`,
    i: `What is the difference between size() and count() in a groupby?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "region": ["N", "N", "S", "S", "N", "S"],
    "product": ["A", "B", "A", "A", "A", "B"],
    "units": [10, 5, 8, 12, 6, 4],
})
print(df.groupby(["region", "product"])["units"].sum())
print(df.groupby("region").size())`,
    v: cells("Each (region, product) pair is its own group; their units are added.", table(["region", "product", "units"], [["N", "A", "10"], ["N", "B", "5"], ["S", "A", "8"], ["S", "A", "12"], ["N", "A", "6"], ["S", "B", "4"]]), [
      ["Six sales rows with two keys."],
      ["(N, A) has rows 0 and 4: 10 + 6 = 16.", [[1, 0, 2], [5, 0, 2]]],
      ["(S, A) has rows 2 and 3: 8 + 12 = 20.", [[3, 0, 2], [4, 0, 2]]],
      ["(N, B) is row 1 alone (5) and (S, B) is row 5 alone (4).", [[2, 0, 2], [6, 0, 2]]],
      ["Result: one row per combination.", [], table(["region", "product", "units"], [["N", "A", "16"], ["N", "B", "5"], ["S", "A", "20"], ["S", "B", "4"]])],
    ]),
  },
  {
    t: "transform: a group statistic on every row",
    lv: 2,
    s: `{{agg}} shrinks each group to one row. {{transform}} instead returns a result with the same length as the original, repeating the group statistic on every row: {{df.groupby("dept")["salary"].transform("mean")}}. That lets you compare each row to its own group — for example salary minus the department average — or fill missing values with the group mean.`,
    r: `Per-group normalisation and per-group imputation (fill each missing age with its class average) are transform use cases.`,
    i: `When would you use transform instead of agg?`,
    c: py`
import pandas as pd
` + staffDf + py`

df["dept_avg"] = df.groupby("dept")["salary"].transform("mean")
df["vs_dept"] = df["salary"] - df["dept_avg"]
print(df[["name", "dept_avg", "vs_dept"]])`,
    v: cells("transform keeps all six rows and adds each group's average next to them.", table(["name", "dept", "salary"], staff.map((r) => [r[0] ?? "", r[1] ?? "", r[3] ?? ""])), [
      ["The original six rows."],
      ["transform(\"mean\") adds the department average to EVERY row — the table keeps its length.", [[1, 1, 1]], table(["name", "dept", "salary", "dept_avg"], [["Asha", "Sales", "48000", "49500.0"], ["Ben", "IT", "72000", "69000.0"], ["Chen", "IT", "65000", "69000.0"], ["Dia", "Sales", "51000", "49500.0"], ["Eli", "HR", "58000", "58000.0"], ["Fay", "IT", "70000", "69000.0"]])],
      ["Now each person can be compared with their own department: Ben is +3000, Chen −4000.", [[2, 3, 3], [3, 3, 3]]],
    ]),
  },
  {
    t: "pivot_table and crosstab",
    lv: 2,
    s: `A pivot table turns one column's values into column headings: {{df.pivot_table(index="region", columns="product", values="units", aggfunc="sum")}} gives a compact grid of totals. {{pd.crosstab(df["region"], df["product"])}} is the same idea for counting rows. They are group-bys laid out as a table, ready to read — or to draw as a heatmap.`,
    r: `Reports and dashboards are mostly pivot tables: sales by region and month, errors by service and day.`,
    i: `What is the difference between groupby and pivot_table?`,
    c: py`
import pandas as pd

df = pd.DataFrame({
    "region": ["N", "N", "S", "S", "N", "S"],
    "product": ["A", "B", "A", "A", "A", "B"],
    "units": [10, 5, 8, 12, 6, 4],
})
print(df.pivot_table(index="region", columns="product", values="units", aggfunc="sum"))
print(pd.crosstab(df["region"], df["product"]))`,
    v: cells("The values of 'product' become the column headings; the cells hold the totals.", table(["region", "A", "B"], [["N", "16", "5"], ["S", "20", "4"]]), [
      ["pivot_table: regions down the side, products across the top."],
      ["North sold 16 units of A and 5 of B.", [[1, 1, 2]]],
      ["South sold 20 units of A and 4 of B.", [[2, 1, 2]]],
      ["Same numbers as the groupby — just laid out as a grid.", [[1, 1, 2], [2, 1, 2]]],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const combine: ConceptDef[] = [
  {
    t: "concat: stacking tables",
    lv: 1,
    s: `{{pd.concat([a, b])}} stacks DataFrames on top of each other (rows, the default {{axis=0}}) and matches columns by name; {{axis=1}} places them side by side and matches rows by index. Add {{ignore_index=True}} to renumber the rows. Use it to combine files with the same layout, such as one CSV per month.`,
    r: `Reading twelve monthly files and concatenating them is the usual start of a yearly analysis.`,
    i: `What is the difference between concat with axis=0 and axis=1?`,
    c: py`
import pandas as pd

a = pd.DataFrame({"id": [1, 2], "x": [10, 20]})
b = pd.DataFrame({"id": [3], "x": [30]})
c = pd.DataFrame({"y": [5, 6]})
print(pd.concat([a, b], ignore_index=True))
print(pd.concat([a, c], axis=1))`,
    v: compare("Same function, two directions.", ["axis=0 (default)", "axis=1"], [
      ["Joins", "tables on top of each other", "tables side by side"],
      ["Matches by", "column names", "row index"],
      ["Result", "more rows", "more columns"],
      ["Typical use", "monthly files with the same layout", "adding new columns computed elsewhere"],
    ]),
  },
  {
    t: "merge: joining on a key",
    lv: 1,
    s: `{{customers.merge(orders, on="id", how="left")}} is a database join: rows from the two tables are paired when their key columns match. {{how="left"}} keeps every customer, even those with no order (their order columns are NaN). Step through it to see which rows match and what happens to unmatched ones.`,
    r: `Features almost always live in several tables (users, orders, products). Joining them is how you build the training table.`,
    i: `What does a left merge keep, and what appears where there is no match?`,
    c: py`
import pandas as pd

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Ana", "Bo", "Cy"]})
orders = pd.DataFrame({"id": [2, 3, 4], "amount": [50, 30, 20]})
print(customers.merge(orders, on="id", how="left"))
print(customers.merge(orders, on="id", how="inner").shape)`,
    v: cells("Keys 2 and 3 match; customer 1 has no order and order 4 has no customer.", [
      P("customers.id", ["1", "2", "3"]), P("customers.name", ["Ana", "Bo", "Cy"]),
      P("orders.id", ["2", "3", "4"]), P("orders.amount", ["50", "30", "20"]),
    ], [
      ["Two tables sharing the key column id."],
      ["id 2 appears in both tables — a match.", [[0, 1, 1], [2, 0, 0]]],
      ["id 3 matches as well.", [[0, 2, 2], [2, 1, 1]]],
      ["id 1 (Ana) has no order, and id 4 has no customer.", [[0, 0, 0], [2, 2, 2]]],
      ["how=\"left\": all three customers stay; Ana's amount is NaN.", [], [P("id", ["1", "2", "3"]), P("name", ["Ana", "Bo", "Cy"]), P("amount", ["NaN", "50.0", "30.0"])]],
    ]),
  },
  {
    t: "inner, left, right and outer joins",
    lv: 1,
    s: `The {{how}} argument decides what happens to rows without a partner. {{inner}} keeps only matches; {{left}} keeps all left rows; {{right}} keeps all right rows; {{outer}} keeps everything. With the same two tables the result has 2, 3, 3 or 4 rows. Check the row count after every merge — an unexpected change means the keys are not what you think.`,
    r: `The usual bug is an inner join that silently drops customers with no orders, making a rate look better than it is.`,
    i: `You merge customers with orders and customers disappear. What went wrong?`,
    c: py`
import pandas as pd

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Ana", "Bo", "Cy"]})
orders = pd.DataFrame({"id": [2, 3, 4], "amount": [50, 30, 20]})
for how in ["inner", "left", "right", "outer"]:
    print(how, customers.merge(orders, on="id", how=how).shape)`,
    v: compare("Which ids survive each join? (customers 1, 2, 3 · orders 2, 3, 4)", ["inner", "left", "right", "outer"], [
      ["Keeps", "only ids in both", "all customers", "all orders", "every id"],
      ["Ids in result", "2, 3", "1, 2, 3", "2, 3, 4", "1, 2, 3, 4"],
      ["Rows", "2", "3", "3", "4"],
      ["Gets NaN", "nothing", "amount for id 1", "name for id 4", "both kinds"],
    ], 1),
  },
  {
    t: "Key names, suffixes and indicator",
    lv: 2,
    s: `When the key columns have different names use {{left_on="user_id", right_on="uid"}}. If both tables have a column with the same name, pandas adds suffixes ({{_x}}, {{_y}}); choose clear ones with {{suffixes=("_user", "_visit")}}. {{indicator=True}} adds a {{_merge}} column saying whether each row came from both tables, only the left or only the right — a fast way to audit a join.`,
    r: `Always look at the {{_merge}} counts when joining important tables; they show exactly how many rows failed to match.`,
    i: `How do you find which rows had no match after a merge?`,
    c: py`
import pandas as pd

users = pd.DataFrame({"user_id": [1, 2, 3], "score": [5, 6, 7]})
visits = pd.DataFrame({"uid": [1, 1, 3], "score": [10, 20, 30]})
m = users.merge(visits, left_on="user_id", right_on="uid", how="left",
                suffixes=("_user", "_visit"), indicator=True)
print(m)
print(m["_merge"].value_counts().to_dict())`,
    v: compare("Three options that make joins safer.", ["Use when", "Example"], [
      ["left_on / right_on", "key columns have different names", "left_on=\"user_id\", right_on=\"uid\""],
      ["suffixes", "both tables share a column name", "suffixes=(\"_user\", \"_visit\")"],
      ["indicator=True", "you want to audit the join", "adds _merge: both, left_only, right_only"],
      ["validate", "you expect unique keys", "validate=\"one_to_one\" raises if not"],
    ]),
  },
  {
    t: "Duplicate keys multiply rows",
    lv: 2,
    s: `If a key value appears twice on each side, a merge pairs every left row with every right row: 2 × 2 = 4 rows. This many-to-many explosion silently inflates sums and counts. Remove duplicates first or ask pandas to check with {{validate="one_to_one"}} (or {{"many_to_one"}}), which raises a {{MergeError}} if the assumption is false.`,
    r: `A join that suddenly makes revenue double is nearly always duplicate keys. Compare row counts before and after.`,
    i: `A merge returns far more rows than either input. What happened, and how do you prevent it?`,
    c: py`
import pandas as pd

a = pd.DataFrame({"k": [1, 1], "x": ["a1", "a2"]})
b = pd.DataFrame({"k": [1, 1], "y": ["b1", "b2"]})
print(a.merge(b, on="k").shape)
try:
    a.merge(b, on="k", validate="one_to_one")
except Exception as e:
    print(type(e).__name__)`,
    v: cells("Key 1 appears twice on each side, so every left row pairs with every right row.", [P("a.x", ["a1", "a2"]), P("b.y", ["b1", "b2"])], [
      ["Two rows on each side, all with key k = 1."],
      ["a1 pairs with b1 and b2 …", [[0, 0, 0], [1, 0, 1]]],
      ["… and a2 pairs with b1 and b2.", [[0, 1, 1], [1, 0, 1]]],
      ["Result: 2 × 2 = 4 rows. validate=\"one_to_one\" would have raised an error instead.", [], [P("x", ["a1", "a1", "a2", "a2"]), P("y", ["b1", "b2", "b1", "b2"])]],
    ]),
  },
];
