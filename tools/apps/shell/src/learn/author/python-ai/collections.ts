import { D, L, T, cells, flow, seq, trace } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

/* ------------------------------------------------------------------ */
export const basics: ConceptDef[] = [
  {
    t: "Variables, types and names",
    lv: 1,
    s: `A variable is a name that points to an object. The object has a type — {{int}}, {{float}}, {{str}}, {{bool}}, {{list}}, {{dict}} — and Python works the type out from the value. Reassigning a name just points it at a different object; nothing is "declared" first.`,
    r: `Every dataset column, hyperparameter and metric is a typed value. Mixing up {{str}} and {{int}} (CSV values always arrive as strings) is the most common first bug in ML scripts.`,
    i: `Explain that a Python variable is a reference to an object rather than a box holding a value, and say what {{type()}} tells you.`,
    c: py`
age = 25
price = 19.99
name = "Ravi"
is_student = True
print(type(name))
age = "twenty-five"
print(type(age))`,
    o: `<class 'str'>\n<class 'str'>`,
    v: trace("A name points at an object; the type belongs to the object, not the name.", py`
age = 25
price = 19.99
name = "Ravi"
is_student = True
print(type(name))
age = "twenty-five"
print(type(age))`, [
      [1, { age: "25   (int)" }, undefined, "The name age now points at the integer object 25."],
      [2, { price: "19.99   (float)" }],
      [3, { name: '"Ravi"   (str)' }],
      [4, { is_student: "True   (bool)" }],
      [5, undefined, "<class 'str'>", "type(name) asks the object what it is."],
      [6, { age: '"twenty-five"   (str)' }, undefined, "Same name, new object. The old 25 is simply forgotten — names are not boxes with a fixed type."],
      [7, undefined, "<class 'str'>"],
    ]),
  },
  {
    t: "Indexing starts at zero",
    lv: 1,
    s: `Positions in lists, tuples and strings start at {{0}}. Negative indexes count from the end: {{-1}} is the last item. Asking for a position that doesn't exist raises {{IndexError}}.`,
    r: `Rows, columns, pixels and token positions are all index-based. An off-by-one mistake silently shifts your features or labels by one.`,
    i: `What does {{x[-1]}} return, and why does {{x[len(x)]}} fail?`,
    c: py`
letters = ["A", "B", "C"]
print(letters[0])
print(letters[-1])
print(letters[3])`,
    o: `A\nC\nIndexError: list index out of range`,
    v: cells("The first item is index 0; the last is always index -1.", [L("letters", ["A", "B", "C"])], [
      ["A list of three items. Each box shows its position, counting from the start (black) and from the end (purple)."],
      ["letters[0] is the first item: 'A'.", [[0, 0, 0]]],
      ["letters[-1] is the last item: 'C'. Negative indexes count backwards.", [[0, 2, 2]]],
      ["letters[3] would be a fourth item — there is none, so Python raises IndexError."],
    ]),
  },
  {
    t: "Conditions and loops",
    lv: 1,
    s: `{{if}} / {{elif}} / {{else}} choose a branch. {{for}} repeats a block for every item of a sequence, {{while}} repeats until a condition fails, and {{range(n)}} counts from 0 to n-1. The indentation is the block — there are no braces.`,
    r: `Training is just loops: for each epoch, for each batch — compute, update, repeat. Filtering rows or labelling by a threshold is an {{if}}.`,
    i: `Why does {{range(3)}} stop at 2? What ends a {{while}} loop?`,
    c: py`
scores = [72, 45, 88]
passed = 0
for s in scores:
    if s >= 50:
        passed += 1
print(passed)`,
    o: `2`,
    v: trace("A for loop runs its body once per item; an if decides what happens inside.", py`
scores = [72, 45, 88]
passed = 0
for s in scores:
    if s >= 50:
        passed += 1
print(passed)`, [
      [1, { scores: "[72, 45, 88]" }],
      [2, { passed: "0" }],
      [3, { s: "72" }, undefined, "The loop takes the first item."],
      [4, undefined, undefined, "72 >= 50 is True, so the body of the if runs."],
      [5, { passed: "1" }],
      [3, { s: "45" }, undefined, "Next item."],
      [4, undefined, undefined, "45 >= 50 is False: line 5 is skipped."],
      [3, { s: "88" }],
      [4, undefined, undefined, "88 >= 50 is True."],
      [5, { passed: "2" }],
      [6, undefined, "2", "The loop is done; print shows how many passed."],
    ]),
  },
  {
    t: "Equality, identity and truthiness",
    lv: 2,
    s: `{{==}} asks whether two objects have equal values; {{is}} asks whether they are the very same object. Use {{is None}} for None checks. Empty containers, {{0}}, empty strings and {{None}} are falsy; almost everything else is truthy.`,
    r: `Comparing two arrays or models with {{is}} instead of {{==}} gives surprising answers, while {{if not data:}} is the quick guard against an empty dataset.`,
    i: `With {{a = [1, 2]}} and {{b = [1, 2]}}, are {{a == b}} and {{a is b}} true?`,
    c: py`
a = [1, 2]
b = [1, 2]
c = a
print(a == b)
print(a is b)
print(a is c)
print(bool([]), bool([0]))`,
    o: `True\nFalse\nTrue\nFalse True`,
    v: flow("== compares contents; is compares whether two names point at the same object.", "row",
      ["a|name|i", "b|name|i", "c|name|i", "list #1|[1, 2]|g", "list #2|[1, 2]|g"],
      [[0, 3, "a →"], [1, 4, "b →"], [2, 3, "c = a →"]],
      undefined,
      ["a points to one list object.", "b points to a different list that happens to hold equal values: a == b is True, but a is b is False.", "c = a does not copy: c points at the SAME object, so a is c is True."]),
  },
  {
    t: "Strings and f-strings",
    lv: 1,
    s: `Strings are ordered sequences of characters. They index and slice like lists but are immutable. f-strings embed values directly, with formatting such as {{:.2f}}. The everyday methods are {{strip()}}, {{lower()}}, {{split()}}, {{join()}} and {{replace()}}.`,
    r: `Cleaning text, building file names like {{model_v2_epoch10.pt}} and formatting metrics in logs all use string handling. NLP starts with {{lower()}}, {{strip()}} and {{split()}}.`,
    i: `Why can't you write {{s[0] = "X"}} on a string?`,
    c: py`
text = "  Hello, AI World  "
clean = text.strip().lower()
words = clean.split()
print(words)
print(clean[0], clean[-5:])
score = 0.87654
print(f"Accuracy: {score:.2f}")`,
    o: `['hello,', 'ai', 'world']\nh world\nAccuracy: 0.88`,
    v: trace("Methods return a NEW string — the original never changes.", py`
text = "  Hello, AI World  "
clean = text.strip().lower()
words = clean.split()
print(words)
print(clean[0], clean[-5:])
score = 0.87654
print(f"Accuracy: {score:.2f}")`, [
      [1, { text: '"  Hello, AI World  "' }],
      [2, { clean: '"hello, ai world"' }, undefined, "strip() removes the outer spaces, lower() lowercases. Each returns a new string; text is untouched."],
      [3, { words: "['hello,', 'ai', 'world']" }, undefined, "split() cuts on whitespace into a list of words."],
      [4, undefined, "['hello,', 'ai', 'world']"],
      [5, undefined, "h world", "clean[0] is the first character; clean[-5:] is a slice of the last five."],
      [6, { score: "0.87654" }],
      [7, undefined, "Accuracy: 0.88", "{score:.2f} rounds to two decimals inside the f-string."],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const lists: ConceptDef[] = [
  {
    t: "Creating, reading and updating lists",
    lv: 1,
    s: `A list is an ordered, mutable collection written with square brackets. Read an item with {{items[i]}}, change it with {{items[i] = x}}. Duplicates are allowed and items can mix types. "Mutable" means the same list object can change after it is created.`,
    r: `A list is the first container for predictions, labels, pixel values or a batch of texts before they become arrays.`,
    i: `Lists are mutable — what happens to every other name that points at the same list when you change it?`,
    c: py`
basket = ["milk", "bread", "apple"]
print(basket[0])
print(basket[-1])
basket[1] = "rice"
print(basket)`,
    o: `milk\napple\n['milk', 'rice', 'apple']`,
    v: cells("Index in, item out — and assigning to an index replaces the item in the same list.", [L("basket", ["milk", "bread", "apple"])], [
      ["A list with three items in order."],
      ["basket[0] reads the first item: 'milk'.", [[0, 0, 0]]],
      ["basket[-1] reads the last item: 'apple'.", [[0, 2, 2]]],
      ["basket[1] = 'rice' replaces 'bread' in place. It's still the same list object.", [[0, 1, 1]], [L("basket", ["milk", "rice", "apple"])]],
    ]),
  },
  {
    t: "Adding and removing items",
    lv: 1,
    s: `{{append(x)}} adds at the end, {{insert(i, x)}} adds before position i, {{extend(items)}} adds many, {{remove(x)}} deletes the first match, and {{pop()}} removes and returns the last item (or the one at position i). They change the list in place and return {{None}} — except {{pop}}, which returns the removed item.`,
    r: `Collecting per-epoch losses with {{append}} and taking batches off a queue with {{pop}} are daily patterns in training code.`,
    i: `What does {{list.append}} return? What is the difference between {{append}} and {{extend}}?`,
    c: py`
basket = ["milk", "bread"]
basket.append("eggs")
basket.insert(1, "rice")
basket.remove("bread")
last = basket.pop()
print(basket, last)`,
    o: `['milk', 'rice'] eggs`,
    v: cells("Each method edits the same list in place.", [L("basket", ["milk", "bread"])], [
      ["Start with two items."],
      ["append('eggs') adds to the end.", [[0, 2, 2]], [L("basket", ["milk", "bread", "eggs"])]],
      ["insert(1, 'rice') puts rice before position 1; everything after shifts right.", [[0, 1, 1]], [L("basket", ["milk", "rice", "bread", "eggs"])]],
      ["remove('bread') deletes the first match.", [[0, 1, 2]], [L("basket", ["milk", "rice", "eggs"])]],
      ["pop() removes and returns the last item ('eggs'). The list is now ['milk', 'rice'].", [[0, 0, 1]], [L("basket", ["milk", "rice"])]],
    ]),
  },
  {
    t: "Slicing",
    lv: 1,
    s: `{{items[start:stop:step]}} returns a new list. Start is included, stop is excluded; leave either blank for "from the beginning" or "to the end". A step of {{-1}} reverses the order. Slicing never raises {{IndexError}} for out-of-range bounds.`,
    r: `Train/test splits are slices — {{data[:80]}} and {{data[80:]}} — and windowing a time series is slicing too.`,
    i: `What is {{scores[1:4]}} for {{[10, 20, 30, 40, 50, 60]}}? Is the result a view or a copy?`,
    c: py`
scores = [10, 20, 30, 40, 50, 60]
print(scores[1:4])
print(scores[:3])
print(scores[-2:])
print(scores[::2])
print(scores[::-1])`,
    o: `[20, 30, 40]\n[10, 20, 30]\n[50, 60]\n[10, 30, 50]\n[60, 50, 40, 30, 20, 10]`,
    v: cells("start:stop — start is included, stop is NOT.", [L("scores", ["10", "20", "30", "40", "50", "60"])], [
      ["Six items at positions 0 to 5."],
      ["scores[1:4] takes positions 1, 2, 3. Position 4 is the stop, so it is excluded → [20, 30, 40].", [[0, 1, 3]]],
      ["scores[:3] is 'from the start up to 3' → [10, 20, 30].", [[0, 0, 2]]],
      ["scores[-2:] is 'the last two' → [50, 60].", [[0, 4, 5]]],
      ["scores[::2] takes every second item → [10, 30, 50].", [[0, 0, 0], [0, 2, 2], [0, 4, 4]]],
      ["scores[::-1] walks backwards → a reversed copy.", [[0, 0, 5]]],
    ]),
  },
  {
    t: "Loops and list comprehensions",
    lv: 1,
    s: `A comprehension builds a new list in one expression: {{[expr for x in items if condition]}}. It replaces the loop-and-append pattern, and the optional {{if}} filters. Prefer a plain loop when the logic gets long or needs several statements.`,
    r: `Scaling features, filtering rows and applying a function to every sample are all comprehension one-liners.`,
    i: `Rewrite a loop that appends doubled values as a comprehension. When is a comprehension a bad idea?`,
    c: py`
prices = [10, 20, 30]
doubled = [p * 2 for p in prices]
large = [p for p in prices if p >= 20]
print(doubled)
print(large)`,
    o: `[20, 40, 60]\n[20, 30]`,
    v: trace("A comprehension is a loop that builds a list — read it as 'give me p*2 for each p'.", py`
prices = [10, 20, 30]
doubled = [p * 2 for p in prices]
large = [p for p in prices if p >= 20]
print(doubled)
print(large)`, [
      [1, { prices: "[10, 20, 30]" }],
      [2, { doubled: "[20, 40, 60]" }, undefined, "For each p: 10→20, 20→40, 30→60. The results are collected into a new list."],
      [3, { large: "[20, 30]" }, undefined, "The if keeps only the items where p >= 20: 10 is dropped."],
      [4, undefined, "[20, 40, 60]"],
      [5, undefined, "[20, 30]"],
    ]),
  },
  {
    t: "Copy versus alias",
    lv: 2,
    s: `{{b = a}} does not copy a list: both names point at the same object, so a change through one shows up through the other. {{a.copy()}} or {{a[:]}} makes a shallow copy (nested lists are still shared); {{copy.deepcopy(a)}} makes a fully independent one.`,
    r: `Mutating a shared list "just to try something" silently corrupts the original data you later evaluate on.`,
    i: `Why does changing {{b}} change {{a}}? How do you copy a list of lists independently?`,
    c: py`
a = [1, 2, 3]
b = a
c = a.copy()
b.append(4)
print(a)
print(c)`,
    o: `[1, 2, 3, 4]\n[1, 2, 3]`,
    v: flow("Assignment shares one object; copy() makes a second one.", "row",
      ["a|name|i", "b|name|i", "c|name|i", "list object|[1, 2, 3] → after b.append(4): [1, 2, 3, 4]|w", "copy|[1, 2, 3] — unchanged|g"],
      [[0, 3, "a →"], [1, 3, "b = a →"], [2, 4, "a.copy() →"]],
      undefined,
      ["a points at a list.", "b = a: a second name for the SAME list. b.append(4) changes it for both a and b.", "c = a.copy() creates a separate list, so c stays [1, 2, 3]."]),
  },
  {
    t: "Nested lists as tables and matrices",
    lv: 2,
    s: `A list of lists models a table or matrix: {{grid[row][col]}}. {{grid[i]}} is row i; a column needs a comprehension, {{[row[j] for row in grid]}}. NumPy later makes this fast, but the idea of rows, columns and shape is identical.`,
    r: `A dataset of 3 samples with 2 features each is a 3×2 list of lists — exactly what scikit-learn calls {{X}}.`,
    i: `How do you get the second column of a list of lists? Why is {{[[0] * 3] * 2}} dangerous?`,
    c: py`
X = [[5.1, 3.5],
     [4.9, 3.0],
     [6.2, 3.4]]
print(X[1])
print(X[1][0])
print([row[1] for row in X])`,
    o: `[4.9, 3.0]\n4.9\n[3.5, 3.0, 3.4]`,
    v: cells("X[row][col] — rows are lists, and a column is one item from every row.", [L("X[0]", ["5.1", "3.5"], "pos"), L("X[1]", ["4.9", "3.0"], "pos"), L("X[2]", ["6.2", "3.4"], "pos")], [
      ["Three rows (samples) with two columns (features)."],
      ["X[1] is the whole second row.", [[1, 0, 1]]],
      ["X[1][0] first picks row 1, then column 0 → 4.9.", [[1, 0, 0]]],
      ["[row[1] for row in X] collects column 1 from every row → [3.5, 3.0, 3.4].", [[0, 1, 1], [1, 1, 1], [2, 1, 1]]],
    ]),
  },
  {
    t: "Sorting and in-place methods",
    lv: 2,
    s: `{{list.sort()}} sorts the list in place and returns {{None}}; {{sorted(items)}} returns a new sorted list and leaves the original alone. Both accept {{key=}} and {{reverse=True}}. The "returns None" rule also holds for {{append}}, {{extend}} and {{reverse}}.`,
    r: `Ranking predictions by confidence is {{sorted(..., key=..., reverse=True)}}. Writing {{x = x.sort()}} wipes your data with {{None}}.`,
    i: `What does {{result = nums.sort()}} give you?`,
    c: py`
scores = [30, 10, 20]
ranked = sorted(scores, reverse=True)
result = scores.sort()
print(ranked)
print(result)
print(scores)`,
    o: `[30, 20, 10]\nNone\n[10, 20, 30]`,
    v: trace("sorted() gives a new list; .sort() changes the old one and returns None.", py`
scores = [30, 10, 20]
ranked = sorted(scores, reverse=True)
result = scores.sort()
print(ranked)
print(result)
print(scores)`, [
      [1, { scores: "[30, 10, 20]" }],
      [2, { ranked: "[30, 20, 10]" }, undefined, "sorted() builds a NEW list; scores is untouched."],
      [3, { scores: "[10, 20, 30]", result: "None" }, undefined, "scores.sort() reorders scores itself and returns None, so result is None."],
      [4, undefined, "[30, 20, 10]"],
      [5, undefined, "None"],
      [6, undefined, "[10, 20, 30]"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const tuples: ConceptDef[] = [
  {
    t: "Tuples: fixed, ordered records",
    lv: 1,
    s: `A tuple is an ordered, immutable sequence. You can read and slice it, but you can't reassign, add or remove items. Commas make the tuple; parentheses just help readability. Use one for a small fixed record such as a coordinate or an image shape.`,
    r: `Array and image shapes like {{(224, 224, 3)}} are tuples. They are fixed facts about the data, so immutability is a feature.`,
    i: `Why would you choose a tuple over a list?`,
    c: py`
location = (54.6872, 25.2797)
print(location[0])
# location[0] = 55.0   -> TypeError
updated = (55.0, location[1])
print(updated)`,
    o: `54.6872\n(55.0, 25.2797)`,
    v: cells("A tuple can't be changed in place — you build a new one instead.", [T("location", ["54.6872", "25.2797"])], [
      ["A tuple holding latitude and longitude. The double border means: locked."],
      ["location[0] reads latitude, just like a list.", [[0, 0, 0]]],
      ["location[0] = 55.0 would raise TypeError: tuples don't support item assignment."],
      ["To 'change' it, build a new tuple from the pieces you keep.", [[1, 1, 1]], [T("location", ["54.6872", "25.2797"]), T("updated", ["55.0", "25.2797"])]],
    ]),
  },
  {
    t: "Unpacking",
    lv: 1,
    s: `Unpacking assigns every item of a tuple (or list) to its own name in one line. {{first, *middle, last = items}} collects the extras in a list. It is also how functions return several values and how {{for key, value in d.items()}} works.`,
    r: `Shapes unpack as {{height, width, channels = shape}}, and {{train_test_split}} returns four values that you unpack at once.`,
    i: `What does {{first, *middle, last = (1, 2, 3, 4)}} give?`,
    c: py`
user = ("Asha", 24, "Vilnius")
name, age, city = user
first, *middle, last = (1, 2, 3, 4)
print(name, age, city)
print(first, middle, last)`,
    o: `Asha 24 Vilnius\n1 [2, 3] 4`,
    v: trace("Unpacking matches names to positions — the star collects whatever is left.", py`
user = ("Asha", 24, "Vilnius")
name, age, city = user
first, *middle, last = (1, 2, 3, 4)
print(name, age, city)
print(first, middle, last)`, [
      [1, { user: '("Asha", 24, "Vilnius")' }],
      [2, { name: '"Asha"', age: "24", city: '"Vilnius"' }, undefined, "Three names, three items: matched left to right."],
      [3, { first: "1", middle: "[2, 3]", last: "4" }, undefined, "first and last take one item each; *middle gets everything in between, as a list."],
      [4, undefined, "Asha 24 Vilnius"],
      [5, undefined, "1 [2, 3] 4"],
    ]),
  },
  {
    t: "One-item tuples and the nested-list catch",
    lv: 2,
    s: `{{(5)}} is just the number 5 in parentheses; {{(5,)}} is a one-item tuple — the comma matters. A tuple is only shallowly immutable: its references can't be reassigned, but if one of them points at a list, that list can still change.`,
    r: `A config tuple that contains a list (layer sizes, say) can still be mutated by accident — know what is and isn't frozen.`,
    i: `Is {{t = ("student", [80, 90]); t[1].append(100)}} legal? Why?`,
    c: py`
single = (42,)
not_tuple = (42)
print(type(single), type(not_tuple))
record = ("student", [80, 90])
record[1].append(100)
print(record)`,
    o: `<class 'tuple'> <class 'int'>\n('student', [80, 90, 100])`,
    v: cells("Immutable means the references are fixed — not what they point at.", [T("record", ["'student'", "[80, 90]"], "pos")], [
      ["The tuple holds two references. Neither can be re-pointed."],
      ["The second reference points at a list — and lists are mutable.", [[0, 1, 1]]],
      ["record[1].append(100) works: the tuple still holds the same two references; the list behind one of them grew.", [[0, 1, 1]], [T("record", ["'student'", "[80, 90, 100]"], "pos")]],
    ]),
  },
  {
    t: "Tuples as dictionary keys",
    lv: 2,
    s: `Keys must be hashable, and tuples of hashable items are; lists aren't because they can change. That makes tuples ideal compound keys: {{(row, col)}} for a grid cell or {{(learning_rate, batch_size)}} for an experiment.`,
    r: `Caching or logging results per hyperparameter combination: {{results[(lr, batch)] = score}}.`,
    i: `Why can a tuple be a dict key but a list can't?`,
    c: py`
scores = {}
scores[(0.01, 32)] = 0.91
scores[(0.1, 64)] = 0.87
print(scores[(0.01, 32)])
# scores[[0.1, 64]] = 0.5   -> TypeError: unhashable type: 'list'`,
    o: `0.91`,
    v: cells("A dictionary key must be hashable — immutable, so its hash can never change.", [D("scores", ["(0.01, 32)|0.91", "(0.1, 64)|0.87"])], [
      ["Two experiments, each keyed by a (learning rate, batch size) tuple."],
      ["scores[(0.01, 32)] hashes the tuple and jumps straight to its value → 0.91.", [[0, 0, 0]]],
      ["A list key would raise TypeError: unhashable type. If it could change, Python could never find it again."],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const dicts: ConceptDef[] = [
  {
    t: "Dictionaries: key → value",
    lv: 1,
    s: `A dictionary stores key–value pairs and finds a value by its key instead of a position. Keys are unique and must be hashable (strings, numbers, tuples of those); values can be anything. Dictionaries are mutable and keep insertion order.`,
    r: `Hyperparameters, one row of a dataset, a model's metrics and every JSON API response are dictionaries.`,
    i: `How is a dict lookup different from a list index, and what is its average cost?`,
    c: py`
patient = {"name": "Asha", "age": 29, "city": "Vilnius"}
print(patient["name"])
patient["age"] = 30
patient["blood_group"] = "O+"
print(patient)`,
    o: `Asha\n{'name': 'Asha', 'age': 30, 'city': 'Vilnius', 'blood_group': 'O+'}`,
    v: cells("Look values up by a meaningful key, not by counting positions.", [D("patient", ["name|'Asha'", "age|29", "city|'Vilnius'"])], [
      ["Three key → value pairs."],
      ["patient['name'] finds the value by its key → 'Asha'.", [[0, 0, 0]]],
      ["patient['age'] = 30 overwrites the value of an existing key.", [[0, 1, 1]], [D("patient", ["name|'Asha'", "age|30", "city|'Vilnius'"])]],
      ["A new key is simply added at the end.", [[0, 3, 3]], [D("patient", ["name|'Asha'", "age|30", "city|'Vilnius'", "blood_group|'O+'"])]],
    ]),
  },
  {
    t: "get() versus [] and KeyError",
    lv: 1,
    s: `{{d[key]}} raises {{KeyError}} when the key is missing. {{d.get(key, default)}} returns the default instead, and {{key in d}} just checks. Use square brackets for required fields (so a bug is loud) and {{get}} for optional ones.`,
    r: `Real data is messy: optional JSON fields and missing columns. {{get}} keeps a pipeline running; {{[]}} makes a required-field bug obvious.`,
    i: `When do you want a {{KeyError}} and when a default?`,
    c: py`
user = {"name": "Asha"}
print(user.get("phone", "Not provided"))
print("phone" in user)
print(user["phone"])`,
    o: `Not provided\nFalse\nKeyError: 'phone'`,
    v: seq("[] fails loudly on a missing key; get() quietly gives you a default.", ["Your code", "user dict"], [
      [0, 1, "user.get('phone', 'Not provided')"],
      [1, 0, "'Not provided'", "No such key, so get returns the default you supplied. No error.", "r"],
      [0, 1, "'phone' in user"],
      [1, 0, "False", "", "r"],
      [0, 1, "user['phone']"],
      [1, 0, "KeyError: 'phone'", "Square brackets raise when the key is missing — good for fields you require.", "rb"],
    ]),
  },
  {
    t: "Looping over keys, values and items",
    lv: 1,
    s: `Looping over a dict gives its keys. Use {{.items()}} for (key, value) pairs, {{.values()}} for values only and {{.keys()}} for keys. Unpacking the pair in the {{for}} line is the usual pattern.`,
    r: `Printing every hyperparameter, or summing a metric per class, is a loop over {{.items()}}.`,
    i: `What does {{for x in my_dict}} iterate over?`,
    c: py`
prices = {"apple": 2, "rice": 5}
for product, price in prices.items():
    print(product, "costs", price)
print(list(prices.keys()))
print(list(prices.values()))`,
    o: `apple costs 2\nrice costs 5\n['apple', 'rice']\n[2, 5]`,
    v: trace(".items() hands you each key and value together.", py`
prices = {"apple": 2, "rice": 5}
for product, price in prices.items():
    print(product, "costs", price)
print(list(prices.keys()))
print(list(prices.values()))`, [
      [1, { prices: "{'apple': 2, 'rice': 5}" }],
      [2, { product: "'apple'", price: "2" }, undefined, "First pair, unpacked into two names."],
      [3, undefined, "apple costs 2"],
      [2, { product: "'rice'", price: "5" }, undefined, "Second pair."],
      [3, undefined, "rice costs 5"],
      [4, undefined, "['apple', 'rice']"],
      [5, undefined, "[2, 5]"],
    ]),
  },
  {
    t: "update, pop and counting",
    lv: 2,
    s: `{{update({...})}} merges entries, overwriting existing keys. {{pop(key)}} removes a key and returns its value. {{setdefault(key, value)}} inserts only when the key is missing. The counting idiom is {{counts[x] = counts.get(x, 0) + 1}} — or use {{collections.Counter}}.`,
    r: `Merging default settings with overrides is {{update}}, and counting label frequencies in a dataset is the counting idiom.`,
    i: `How would you count word frequencies with a plain dict?`,
    c: py`
config = {"epochs": 10, "lr": 0.01}
config.update({"lr": 0.001, "batch": 32})
removed = config.pop("epochs")
counts = {}
for w in ["a", "b", "a"]:
    counts[w] = counts.get(w, 0) + 1
print(config, removed)
print(counts)`,
    o: `{'lr': 0.001, 'batch': 32} 10\n{'a': 2, 'b': 1}`,
    v: trace("update merges, pop removes, get(x, 0) + 1 counts.", py`
config = {"epochs": 10, "lr": 0.01}
config.update({"lr": 0.001, "batch": 32})
removed = config.pop("epochs")
counts = {}
for w in ["a", "b", "a"]:
    counts[w] = counts.get(w, 0) + 1
print(config, removed)
print(counts)`, [
      [1, { config: "{'epochs': 10, 'lr': 0.01}" }],
      [2, { config: "{'epochs': 10, 'lr': 0.001, 'batch': 32}" }, undefined, "update overwrites lr and adds batch."],
      [3, { removed: "10", config: "{'lr': 0.001, 'batch': 32}" }, undefined, "pop removes 'epochs' and hands back its value."],
      [4, { counts: "{}" }],
      [5, { w: "'a'" }],
      [6, { counts: "{'a': 1}" }, undefined, "get returns 0 for a missing key, so it's 0 + 1."],
      [5, { w: "'b'" }],
      [6, { counts: "{'a': 1, 'b': 1}" }],
      [5, { w: "'a'" }],
      [6, { counts: "{'a': 2, 'b': 1}" }, undefined, "'a' exists now, so it's 1 + 1."],
      [7, undefined, "{'lr': 0.001, 'batch': 32} 10"],
      [8, undefined, "{'a': 2, 'b': 1}"],
    ]),
  },
  {
    t: "Nested data: lists of dictionaries",
    lv: 2,
    s: `APIs and JSON files usually give a list of dictionaries — one dict per record. Loop over the list, read fields by key and compute with them. A dict can also hold a list (like marks) as a value, so structures nest to any depth.`,
    r: `A dataset loaded from JSON, or from a CSV with {{DictReader}}, has exactly this shape; turning it into a table (a DataFrame) is the next step.`,
    i: `Given a list of student dicts, how do you print each student's average mark?`,
    c: py`
students = [
    {"name": "Asha", "marks": [80, 90]},
    {"name": "Ravi", "marks": [70, 85]},
]
for student in students:
    avg = sum(student["marks"]) / len(student["marks"])
    print(student["name"], "average:", avg)`,
    o: `Asha average: 85.0\nRavi average: 77.5`,
    v: trace("Each loop turn gives you one record (a dict); read its fields by key.", py`
students = [
    {"name": "Asha", "marks": [80, 90]},
    {"name": "Ravi", "marks": [70, 85]},
]
for student in students:
    avg = sum(student["marks"]) / len(student["marks"])
    print(student["name"], "average:", avg)`, [
      [1, { students: "[{'name': 'Asha', ...}, {'name': 'Ravi', ...}]" }, undefined, "A list of two dictionaries."],
      [5, { student: "{'name': 'Asha', 'marks': [80, 90]}" }, undefined, "First record."],
      [6, { avg: "85.0" }, undefined, "(80 + 90) / 2"],
      [7, undefined, "Asha average: 85.0"],
      [5, { student: "{'name': 'Ravi', 'marks': [70, 85]}" }, undefined, "Second record."],
      [6, { avg: "77.5" }, undefined, "(70 + 85) / 2"],
      [7, undefined, "Ravi average: 77.5"],
    ]),
  },
  {
    t: "Hashable keys and dict comprehensions",
    lv: 2,
    s: `Keys must be hashable: immutable things such as strings, numbers and tuples of those. Lists and dicts can't be keys. A dict comprehension builds a dictionary in one line, and {{enumerate}} pairs each item with its position — together they make label encodings.`,
    r: `Mapping class names to integer ids (label encoding) is one comprehension with {{enumerate}}, and the reverse map gives you names back from predictions.`,
    i: `Why can't a list be a dictionary key?`,
    c: py`
squares = {n: n * n for n in range(1, 4)}
classes = ["cat", "dog", "bird"]
label_id = {name: i for i, name in enumerate(classes)}
print(squares)
print(label_id)`,
    o: `{1: 1, 2: 4, 3: 9}\n{'cat': 0, 'dog': 1, 'bird': 2}`,
    v: cells("enumerate pairs each item with its position; the comprehension turns pairs into key → value.", [L("classes", ["cat", "dog", "bird"], "pos"), D("label_id", [])], [
      ["A list of class names, and an empty dict to fill."],
      ["First pair: i = 0, name = 'cat'.", [[0, 0, 0]], [L("classes", ["cat", "dog", "bird"], "pos"), D("label_id", ["cat|0"])]],
      ["Second pair: i = 1, name = 'dog'.", [[0, 1, 1]], [L("classes", ["cat", "dog", "bird"], "pos"), D("label_id", ["cat|0", "dog|1"])]],
      ["Third pair: i = 2, name = 'bird'. The label encoding is done.", [[0, 2, 2]], [L("classes", ["cat", "dog", "bird"], "pos"), D("label_id", ["cat|0", "dog|1", "bird|2"])]],
    ]),
  },
];
