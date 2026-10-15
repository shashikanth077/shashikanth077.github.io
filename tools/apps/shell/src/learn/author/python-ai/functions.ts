import { compare, flow, layers, seq, trace } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

export const funcs: ConceptDef[] = [
  {
    t: "Defining and calling functions",
    lv: 1,
    s: `{{def}} names a reusable block of code. Parameters are its inputs; {{return}} sends a result back to the caller and ends the function. Defining a function does not run it — calling {{name(args)}} does.`,
    r: `Metrics, preprocessing steps and training loops are functions you write once and reuse across experiments.`,
    i: `What is the difference between a parameter and an argument?`,
    c: py`
def apply_discount(price, discount_percent):
    discount_amount = price * discount_percent / 100
    return price - discount_amount

amount = apply_discount(100, 20)
print(amount)
print(apply_discount(200, 10))`,
    o: `80.0\n180.0`,
    v: trace("def stores the recipe; a call runs it with fresh inputs and hands back the result.", py`
def apply_discount(price, discount_percent):
    discount_amount = price * discount_percent / 100
    return price - discount_amount

amount = apply_discount(100, 20)
print(amount)
print(apply_discount(200, 10))`, [
      [1, { apply_discount: "<function>" }, undefined, "def only stores the function. Nothing inside it runs yet."],
      [5, { price: "100", discount_percent: "20" }, undefined, "The call fills the parameters: price = 100, discount_percent = 20."],
      [2, { discount_amount: "20.0" }, undefined, "100 * 20 / 100"],
      [3, { amount: "80.0" }, undefined, "return sends 80.0 back to the caller, which stores it in amount."],
      [6, undefined, "80.0"],
      [7, { price: "200", discount_percent: "10" }, undefined, "Second call, new inputs."],
      [2, { discount_amount: "20.0" }],
      [3, undefined, "180.0", "The returned value goes straight into print."],
    ]),
  },
  {
    t: "print() versus return",
    lv: 1,
    s: `{{print}} shows something on screen; {{return}} hands a value back to the caller so other code can use it. A function without a {{return}} gives back {{None}}.`,
    r: `A metric function must {{return}} its number so you can log, compare and plot it. Printing inside it makes the value unusable.`,
    i: `What does a function return when it has no {{return}} statement?`,
    c: py`
def add_print(a, b):
    print(a + b)

def add_return(a, b):
    return a + b

x = add_print(2, 3)
y = add_return(2, 3)
print(x, y * 2)`,
    o: `5\nNone 10`,
    v: compare("Print is for people; return is for code.", ["print(a + b)", "return a + b"], [
      ["What it does", "displays a value on screen", "hands a value back to the caller"],
      ["x = add(2, 3) gives", "None  (and 5 is printed)", "5  (nothing printed)"],
      ["Can other code use the result?", "no", "yes: add(2, 3) * 2 → 10"],
      ["Use it for", "messages, debugging", "results you compute with"],
    ], 1),
  },
  {
    t: "Parameters: positional, keyword and default",
    lv: 1,
    s: `Positional arguments match by order, keyword arguments by name, and defaults fill in whatever the caller leaves out. Put required parameters first. Keyword arguments make calls self-documenting.`,
    r: `Almost every ML API is keyword-heavy: {{train(epochs=20, lr=0.001)}}. Defaults give sensible behaviour while you tune only what matters.`,
    i: `What happens if a parameter without a default follows one with a default?`,
    c: py`
def greet(name, language="English"):
    if language == "Lithuanian":
        return f"Labas, {name}!"
    return f"Hello, {name}!"

print(greet("Ravi"))
print(greet("Asha", language="Lithuanian"))`,
    o: `Hello, Ravi!\nLabas, Asha!`,
    v: trace("Positional by order, keyword by name, default when omitted.", py`
def greet(name, language="English"):
    if language == "Lithuanian":
        return f"Labas, {name}!"
    return f"Hello, {name}!"

print(greet("Ravi"))
print(greet("Asha", language="Lithuanian"))`, [
      [6, { name: "'Ravi'", language: "'English'   (default)" }, undefined, "language wasn't passed, so the default is used."],
      [2, undefined, undefined, "'English' == 'Lithuanian' is False: skip the branch."],
      [4, undefined, "Hello, Ravi!"],
      [7, { name: "'Asha'", language: "'Lithuanian'   (keyword)" }, undefined, "language is passed by name."],
      [2, undefined, undefined, "True: take the branch."],
      [3, undefined, "Labas, Asha!"],
    ]),
  },
  {
    t: "Returning several values",
    lv: 1,
    s: `A function can return several values separated by commas. Python packs them into a tuple, and you unpack it on the other side. Document the order, because callers rely on position.`,
    r: `{{X_train, X_test, y_train, y_test = train_test_split(...)}} is exactly this: four returned values unpacked at once.`,
    i: `What type is returned by {{return a, b}}?`,
    c: py`
def summary(scores):
    return min(scores), max(scores), sum(scores) / len(scores)

low, high, average = summary([70, 80, 90])
print(low, high, average)
print(summary([70, 80, 90]))`,
    o: `70 90 80.0\n(70, 90, 80.0)`,
    v: flow("Many return values are really one tuple that you unpack.", "row",
      ["summary([70, 80, 90])|the call|i", "(70, 90, 80.0)|one tuple|g", "low = 70|unpacked|g", "high = 90|unpacked|g", "average = 80.0|unpacked|g"],
      [[0, 1, "return packs"], [1, 2], [1, 3], [1, 4]],
      [0, 1, 2],
      ["The function returns min, max and mean...", "...Python packs them into a single tuple...", "...and unpacking gives each value its own name."]),
  },
  {
    t: "*args and **kwargs",
    lv: 2,
    s: `{{*args}} collects extra positional arguments into a tuple; {{**kwargs}} collects extra keyword arguments into a dict. The same stars unpack on a call: {{f(*items)}} spreads a sequence and {{f(**options)}} spreads a dict as keyword arguments.`,
    r: `Config dicts become keyword arguments — {{model = Model(**config)}} — and wrappers pass options through to the library underneath with {{**kwargs}}.`,
    i: `What are the types of {{args}} and {{kwargs}} inside the function?`,
    c: py`
def add_all(*numbers):
    return sum(numbers)

def make_profile(**fields):
    return fields

config = {"epochs": 20, "lr": 0.001}
print(add_all(1, 2, 3, 4))
print(make_profile(name="Ravi", age=30))
print(make_profile(**config))`,
    o: `10\n{'name': 'Ravi', 'age': 30}\n{'epochs': 20, 'lr': 0.001}`,
    v: compare("One star collects positionals into a tuple; two stars collect keywords into a dict.", ["*args", "**kwargs"], [
      ["Collects", "extra positional arguments", "extra keyword arguments"],
      ["Inside the function it is", "a tuple", "a dict"],
      ["Example call", "add_all(1, 2, 3)", "make_profile(name='Ravi')"],
      ["Unpack on a call", "f(*items)", "f(**options)"],
    ]),
  },
  {
    t: "Scope: local, global and LEGB",
    lv: 2,
    s: `Python looks a name up in this order: Local, Enclosing, Global, Built-in (LEGB). Variables created inside a function are local and vanish when it returns. Reading a global is fine; assigning to one needs the {{global}} keyword — usually a sign you should pass a parameter instead.`,
    r: `Notebook state leaks: a global DataFrame silently changed in one cell breaks the next. Passing data in and returning it keeps experiments reproducible.`,
    i: `What does {{UnboundLocalError}} mean?`,
    c: py`
tax_rate = 0.10

def total(price):
    fee = price * tax_rate
    return price + fee

print(total(100))
# print(fee)  -> NameError: fee only exists inside total()`,
    o: `110.0`,
    v: layers("Python searches inside-out: Local, Enclosing, Global, Built-in.", [
      "Local|names created inside the current function (price, fee)|g",
      "Enclosing|names in outer functions around it (closures)|i",
      "Global|names at module level (tax_rate)|w",
      "Built-in|names Python provides: len, print, sum, range|p",
    ], "lookup order"),
  },
  {
    t: "lambda, map and filter",
    lv: 2,
    s: `A lambda is a small anonymous function: {{lambda x: x * 2}}. {{map(f, items)}} applies a function to every item and {{filter(f, items)}} keeps the items where it is true. Both return lazy iterators, so wrap them in {{list()}}. A comprehension is often clearer.`,
    r: `{{sorted(rows, key=lambda r: r["score"])}} — the {{key=}} lambda — is the most common use in data code.`,
    i: `Rewrite {{map(lambda x: x * 2, nums)}} as a comprehension.`,
    c: py`
numbers = [1, 2, 3, 4]
double = lambda x: x * 2
print(list(map(double, numbers)))
print(list(filter(lambda x: x % 2 == 0, numbers)))
print([x * 2 for x in numbers])`,
    o: `[2, 4, 6, 8]\n[2, 4]\n[2, 4, 6, 8]`,
    v: flow("map transforms every item; filter keeps some of them.", "row",
      ["numbers|[1, 2, 3, 4]|i", "map(double)|x * 2 for each|w", "[2, 4, 6, 8]|same length|g", "filter(even)|keep x % 2 == 0|w", "[2, 4]|fewer items|g"],
      [[0, 1], [1, 2], [0, 3], [3, 4]],
      undefined,
      ["numbers goes into map...", "...every item is doubled...", "...and filter starts again from the same numbers...", "...keeping only the even ones."]),
  },
  {
    t: "Type hints and docstrings",
    lv: 2,
    s: `Type hints — {{scores: list[float]}}, {{-> float}} — document what a function expects and returns. Editors and checkers such as mypy use them, but Python does not enforce them at runtime. A docstring is a triple-quoted first line that explains the function and appears in {{help()}}.`,
    r: `ML codebases are big and collaborative. Hints and docstrings tell the next person what type and shape {{X}} should have.`,
    i: `Does Python raise an error if you pass a {{str}} to a parameter hinted as {{float}}?`,
    c: py`
def average(scores: list[float]) -> float:
    """Return the average of a non-empty list of scores."""
    return sum(scores) / len(scores)

print(average([70, 80, 90]))
print(average.__doc__)`,
    o: `80.0\nReturn the average of a non-empty list of scores.`,
    v: layers("Hints and docstrings are for people and tools — Python doesn't enforce them.", [
      "Name|average — what the function is called|g",
      "Parameter hint|scores: list[float] — what goes in|i",
      "Return hint|-> float — what comes out|i",
      "Docstring|a triple-quoted sentence shown by help()|g",
      "At runtime|hints are not checked: use a type checker like mypy|w",
    ]),
  },
  {
    t: "Recursion",
    lv: 2,
    s: `A recursive function calls itself on a smaller problem until it reaches a base case that stops the calls. Each call has its own local variables on the call stack. Without a base case Python raises {{RecursionError}}.`,
    r: `Trees — decision trees, nested JSON, folders — are naturally recursive. Most numeric loops should still be plain loops.`,
    i: `What is the base case in {{factorial}}, and what happens without it?`,
    c: py`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))`,
    o: `24`,
    v: seq("Calls stack up until the base case, then the answers unwind back down.", ["factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"], [
      [0, 1, "calls factorial(3)", "4 * factorial(3) — it has to wait for the answer."],
      [1, 2, "calls factorial(2)"],
      [2, 3, "calls factorial(1)"],
      [3, 2, "returns 1", "Base case: n <= 1 stops the recursion.", "r"],
      [2, 1, "returns 2 × 1 = 2", "", "r"],
      [1, 0, "returns 3 × 2 = 6", "", "r"],
      [0, 0, "4 × 6 = 24", "The final answer."],
    ]),
  },
  {
    t: "Mutable default arguments",
    lv: 2,
    s: `A default value is created once, when {{def}} runs — not on every call. If it is a mutable object such as a list, every call shares and keeps changing it. Use {{None}} as the default and create the list inside the function.`,
    r: `A shared default list used to collect predictions makes results from one run leak into the next — a classic hard-to-find bug.`,
    i: `What is wrong with {{def f(x, items=[])}}?`,
    c: py`
def add_bad(item, basket=[]):
    basket.append(item)
    return basket

def add_good(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_bad("milk"))
print(add_bad("eggs"))
print(add_good("milk"))
print(add_good("eggs"))`,
    o: `['milk']\n['milk', 'eggs']\n['milk']\n['eggs']`,
    v: trace("The default list is built once and shared — None plus a fresh list inside is the fix.", py`
def add_bad(item, basket=[]):
    basket.append(item)
    return basket

def add_good(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_bad("milk"))
print(add_bad("eggs"))
print(add_good("milk"))
print(add_good("eggs"))`, [
      [1, { "shared default": "[]   (created once)" }, undefined, "The default list is created when def runs — one object for all calls."],
      [11, { item: "'milk'" }],
      [2, { "shared default": "['milk']" }, undefined, "append changes the shared default itself."],
      [3, undefined, "['milk']"],
      [12, { item: "'eggs'" }, undefined, "A new call... but the SAME default list."],
      [2, { "shared default": "['milk', 'eggs']" }, undefined, "milk is still there!"],
      [3, undefined, "['milk', 'eggs']"],
      [13, { item: "'milk'" }],
      [7, { basket: "[]   (new list)" }, undefined, "None was the default, so a brand-new list is created inside."],
      [9, undefined, "['milk']"],
      [14, { item: "'eggs'" }],
      [7, { basket: "[]   (new list)" }, undefined, "Another fresh list: no sharing."],
      [9, undefined, "['eggs']"],
    ]),
  },
];
