import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  ["basics", 1, "What is a variable in Python?", "A name that refers to an object. The type belongs to the object, not the name, and reassigning the name just points it at a different object. Python is dynamically typed."],
  ["basics", 1, "What is the difference between {{==}} and {{is}}?", "{{==}} compares values; {{is}} compares identity (the same object in memory). Use {{is}} for {{None}} checks and {{==}} for everything else."],
  ["basics", 1, "Which values are falsy?", "{{None}}, {{False}}, zero ({{0}}, {{0.0}}) and empty containers or strings ({{\"\"}}, {{[]}}, {{ {} }}, {{()}}, {{set()}}). Almost everything else is truthy."],
  ["basics", 1, "Why does {{range(3)}} give 0, 1, 2?", "{{range(n)}} starts at 0 and stops before n, matching zero-based indexing, so it yields exactly n numbers."],
  ["basics", 2, "Why can't you assign to a character of a string?", "Strings are immutable. Methods like {{replace}} or {{upper}} return a new string; build the result you want and rebind the name."],
  ["lists", 1, "How is a list different from a tuple?", "Both are ordered sequences. Lists are mutable, tuples are immutable. Use a tuple for a fixed record (and as a dict key), a list for a collection that changes."],
  ["lists", 1, "What does {{scores[1:4]}} return?", "A new list with positions 1, 2 and 3 — the start is included and the stop is excluded. Slicing never raises {{IndexError}} for out-of-range bounds."],
  ["lists", 2, "Why doesn't {{b = a}} copy a list?", "Assignment binds a second name to the same object, so changes through {{b}} show up in {{a}}. Use {{a.copy()}}, {{a[:]}} or {{list(a)}} for a shallow copy and {{copy.deepcopy}} for nested data."],
  ["lists", 2, "What does {{list.sort()}} return?", "{{None}} — it sorts in place. {{sorted(items)}} returns a new sorted list and leaves the original untouched."],
  ["lists", 2, "{{append}} versus {{extend}}?", "{{append(x)}} adds x as ONE element (a list argument becomes a nested list). {{extend(items)}} adds every element of an iterable."],
  ["lists", 2, "When is a list comprehension a poor choice?", "When the logic needs several statements, side effects or deep nesting. A normal loop is clearer, and a generator expression is better when you don't need the whole list in memory."],
  ["tuples", 1, "Why isn't {{(5)}} a tuple?", "Parentheses alone just group an expression. The comma creates the tuple, so a one-item tuple is {{(5,)}}."],
  ["tuples", 2, "Is a tuple completely immutable?", "Its references can't be reassigned, but if an item is mutable (like a list) that item can still change. Immutability is shallow."],
  ["tuples", 2, "Why can a tuple be a dict key but a list can't?", "Keys must be hashable. A tuple of hashable items is; a list is mutable, so its hash could change and Python refuses to use it as a key."],
  ["dicts", 1, "What is the difference between {{d[key]}} and {{d.get(key)}}?", "{{d[key]}} raises {{KeyError}} when the key is missing; {{d.get(key)}} returns {{None}} (or the default you pass)."],
  ["dicts", 2, "Are dictionaries ordered?", "Yes. Since Python 3.7 dicts keep insertion order as part of the language guarantee."],
  ["dicts", 2, "How would you count items with a dict?", "{{counts[x] = counts.get(x, 0) + 1}} in a loop — or {{collections.Counter(items)}}."],
  ["dicts", 2, "What is the average cost of a dict lookup?", "O(1) on average, thanks to hashing. In the worst case (many collisions) it degrades towards O(n)."],
  ["funcs", 1, "What is the difference between {{print}} and {{return}}?", "{{print}} displays a value; {{return}} gives it back to the caller. A function without {{return}} returns {{None}}."],
  ["funcs", 1, "Parameters versus arguments?", "Parameters are the names in the function definition; arguments are the values you pass in the call."],
  ["funcs", 2, "What are {{*args}} and {{**kwargs}}?", "{{*args}} collects extra positional arguments into a tuple; {{**kwargs}} collects extra keyword arguments into a dict. The same stars unpack on a call."],
  ["funcs", 2, "What is the mutable default argument bug?", "Default values are evaluated once, when {{def}} runs, so a default list or dict is shared by every call. Use {{None}} as the default and create the object inside."],
  ["funcs", 2, "Explain LEGB.", "The order Python looks up a name: Local, Enclosing, Global, Built-in."],
  ["funcs", 2, "Are type hints enforced at runtime?", "No. They document intent and feed tools such as mypy and your editor; Python itself doesn't check them."],
  ["funcs", 2, "What is a base case?", "The condition at which a recursive function stops calling itself. Without one you get {{RecursionError}}."],
  ["oop", 1, "What is the difference between a class and an object?", "A class is the blueprint; an object (instance) is one thing built from it, with its own attribute values."],
  ["oop", 1, "What is {{self}}?", "The instance the method was called on. Python passes it automatically as the first argument of an instance method."],
  ["oop", 2, "Instance, class and static methods?", "Instance methods get {{self}}; class methods get {{cls}} and are often alternative constructors; static methods get nothing automatically and are plain helper functions."],
  ["oop", 2, "Is {{_balance}} really private?", "No. A leading underscore is a convention meaning 'internal'. {{__balance}} only mangles the name. Use {{@property}} for validation; real security needs other boundaries."],
  ["oop", 2, "What does {{super()}} do?", "It gives access to the next class in the method resolution order — usually the parent — so you can reuse its {{__init__}} or other methods."],
  ["oop", 2, "What is duck typing?", "Code works with any object that has the methods it calls, regardless of its class: 'if it quacks like a duck…'. It enables polymorphism without a shared base class."],
  ["oop", 2, "Inheritance or composition?", "Inheritance for a true is-a relationship, composition for has-a. Composition is usually more flexible because the parts can be swapped."],
  ["oop", 2, "{{__str__}} versus {{__repr__}}?", "{{__str__}} is the friendly text for users ({{print}}); {{__repr__}} is the unambiguous developer view, ideally something you could paste back as code."],
  ["oop", 2, "What does {{@dataclass}} generate?", "{{__init__}}, {{__repr__}} and {{__eq__}} (and optionally ordering and immutability) from the annotated fields."],
  ["oop", 2, "Why is a class-level list dangerous?", "It belongs to the class and is shared by all instances, so one object's changes appear in all the others. Create per-object state in {{__init__}}."],
  ["files", 1, "Why use {{with open(...)}}?", "It guarantees the file is closed, even if an error is raised, which flushes buffers and frees the handle."],
  ["files", 1, "What happens when you open an existing file with mode {{w}}?", "It is truncated immediately — all previous content is erased. Use {{a}} to append, or {{x}} to fail if the file exists."],
  ["files", 1, "How do you read a very large text file?", "Iterate over the file object — {{for line in file}} — so only one line is in memory at a time, or read in fixed-size chunks."],
  ["files", 2, "Why specify {{encoding=\"utf-8\"}}?", "The default depends on the operating system. Being explicit makes text files behave the same everywhere and avoids {{UnicodeDecodeError}} and garbled characters."],
  ["files", 2, "Why use the {{csv}} module instead of {{split(\",\")}}?", "It correctly handles quoted fields, commas and newlines inside values. Remember that every value comes back as a string."],
  ["files", 2, "{{json.load}} versus {{json.loads}}?", "{{load}} reads from a file object; {{loads}} parses a string. Likewise {{dump}} writes to a file and {{dumps}} returns a string."],
  ["files", 2, "When do you use {{rb}} and {{wb}}?", "For non-text data: images, audio, PDFs, model weights. Binary mode reads and writes raw bytes with no encoding."],
  ["files", 3, "Why is {{pickle.load}} on an untrusted file unsafe?", "Unpickling can run arbitrary code embedded in the file. Only load pickle or joblib files you created or fully trust; prefer data-only formats like JSON."],
  ["ai", 1, "How do you compute accuracy from two lists?", "{{sum(p == a for p, a in zip(pred, actual)) / len(actual)}} — booleans count as 1 and 0 when summed."],
  ["ai", 2, "Why are shapes tuples?", "A shape is a fixed description of the data's dimensions, so an immutable, unpackable tuple fits: {{height, width, channels = image.shape}}."],
  ["ai", 2, "Why do ML classes expose {{fit}} and {{predict}}?", "It's a shared convention: construct with settings, {{fit}} learns and stores attributes ending in {{_}}, {{predict}} applies them. Anything following it plugs into the same pipelines."],
];

export const drills: DrillDef[] = [
  {
    t: "Slicing",
    q: "What does this print?",
    code: py`
scores = [10, 20, 30, 40, 50, 60]
print(scores[1:4])`,
    opts: [
      ["[20, 30, 40]", true, "Positions 1, 2 and 3 are included; the stop index 4 is excluded."],
      ["[20, 30, 40, 50]", false, "That would include the stop index 4, but a slice stops BEFORE it."],
      ["[10, 20, 30, 40]", false, "Index 0 isn't included: the slice starts at position 1."],
    ],
    path: ["scores[1] is 20, scores[2] is 30, scores[3] is 40.", "scores[4] is the stop position, so it is not taken.", "The result is a new list: [20, 30, 40]."],
    why: "A slice includes the start and excludes the stop.",
    watch: "Off-by-one mistakes: for n items starting at i, use items[i:i + n].",
    remember: "stop is exclusive; the result is a copy.",
  },
  {
    t: "Alias or copy?",
    q: "What does this print?",
    code: py`
a = [1, 2]
b = a
b.append(3)
print(a)`,
    opts: [
      ["[1, 2, 3]", true, "b and a are two names for the same list, so appending through b changes what a sees."],
      ["[1, 2]", false, "That would be true if b = a.copy(). Plain assignment shares the object."],
      ["[3]", false, "append adds to the existing list; it doesn't create a new one."],
    ],
    path: ["a points at a list [1, 2].", "b = a makes b point at the SAME list — no copy.", "b.append(3) mutates that one list → [1, 2, 3].", "print(a) shows the same list."],
    why: "Assignment never copies a list; it adds another name for it.",
    watch: "Use a.copy() or a[:] when you need independence (copy.deepcopy for nested lists).",
    remember: "b = a means 'another name', not 'another list'.",
  },
  {
    t: "append returns None",
    q: "What does this print?",
    code: py`
nums = [1, 2]
result = nums.append(3)
print(result, nums)`,
    opts: [
      ["None [1, 2, 3]", true, "append changes the list in place and returns None."],
      ["[1, 2, 3] [1, 2, 3]", false, "append doesn't return the list, so result isn't the list."],
      ["3 [1, 2, 3]", false, "append doesn't return the appended value either."],
    ],
    path: ["nums.append(3) edits nums in place: [1, 2, 3].", "The method's return value is None, stored in result.", "print shows None and the updated list."],
    why: "In-place list methods return None so you don't confuse them with methods that return a new object.",
    watch: "Writing nums = nums.append(3) replaces your list with None.",
    remember: "append, extend, sort, reverse → in place, return None.",
  },
  {
    t: "The mutable default",
    q: "What does the second call print?",
    code: py`
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))`,
    opts: [
      ["['a', 'b']", true, "The default list was created once and is shared, so 'a' is still in it."],
      ["['b']", false, "That is what you'd expect with a fresh list each call — but the default is created only once."],
      ["['a']", false, "The second call appends 'b' to the same list; it doesn't leave it unchanged."],
    ],
    path: ["def runs once and creates the default list [].", "add_item('a') appends to it → ['a'].", "add_item('b') uses the SAME list → ['a', 'b']."],
    why: "Default values are evaluated when the function is defined, not when it is called.",
    watch: "Use items=None and create the list inside the function.",
    remember: "Never use a mutable object as a default value.",
  },
  {
    t: "A list inside a tuple",
    q: "What does this print?",
    code: py`
t = (1, [2])
t[1].append(3)
print(t)`,
    opts: [
      ["(1, [2, 3])", true, "The tuple's references stay the same; the list behind the second one is mutable."],
      ["TypeError", false, "Only reassigning a tuple item (t[1] = ...) raises TypeError. Mutating the list inside doesn't."],
      ["(1, [2])", false, "append does change the list, and the tuple holds that same list."],
    ],
    path: ["t holds two references: the number 1 and a list.", "t[1] is that list; append(3) mutates it in place.", "The tuple still holds the same two references, so it prints (1, [2, 3])."],
    why: "Tuples are shallowly immutable.",
    watch: "Don't rely on a tuple to protect a list inside it.",
    remember: "Immutable container ≠ immutable contents.",
  },
  {
    t: "get with a default",
    q: "What does this print?",
    code: py`
d = {"a": 1}
print(d.get("b"), d.get("b", 0))`,
    opts: [
      ["None 0", true, "get returns None when the key is missing and no default is given, otherwise the default."],
      ["KeyError", false, "KeyError is raised by d['b'], not by get."],
      ["0 0", false, "Without a second argument, get returns None, not 0."],
    ],
    path: ["'b' isn't in the dictionary.", "d.get('b') has no default, so it returns None.", "d.get('b', 0) returns the supplied default 0."],
    why: "get never raises for a missing key.",
    watch: "None can look like a real value — pass an explicit default when you need one.",
    remember: "[] for required keys, get for optional ones.",
  },
  {
    t: "== versus is",
    q: "What does this print?",
    code: py`
a = [1]
b = [1]
print(a == b, a is b)`,
    opts: [
      ["True False", true, "The lists are equal in value but are two separate objects."],
      ["True True", false, "Each list literal creates a new object, so a is b is False."],
      ["False False", false, "== compares contents, which are equal, so it is True."],
    ],
    path: ["a and b each point at their own list object.", "a == b compares contents: [1] == [1] → True.", "a is b compares identity: different objects → False."],
    why: "== checks value, is checks identity.",
    watch: "Use is only for None, True and False.",
    remember: "Equal is not the same as identical.",
  },
  {
    t: "Local versus global",
    q: "What does this print?",
    code: py`
x = 10

def change():
    x = 5

change()
print(x)`,
    opts: [
      ["10", true, "Assigning inside the function creates a new local x; the global x is unchanged."],
      ["5", false, "That would need the global keyword inside change()."],
      ["NameError", false, "x exists at module level, so there is no error."],
    ],
    path: ["The global x is 10.", "change() runs and assigns x = 5 — a new LOCAL variable.", "The function ends; its local x disappears.", "print(x) reads the untouched global: 10."],
    why: "Assignment inside a function makes a name local unless you declare it global.",
    watch: "Prefer parameters and return values over modifying globals.",
    remember: "Local assignment never touches the global.",
  },
  {
    t: "range with a step",
    q: "What does this print?",
    code: py`
print(list(range(2, 10, 3)))`,
    opts: [
      ["[2, 5, 8]", true, "Start at 2, add 3 each time, stop before 10: 2, 5, 8 (the next, 11, is too big)."],
      ["[2, 5, 8, 10]", false, "The stop value 10 is never included."],
      ["[3, 6, 9]", false, "range starts at its first argument, 2, not at the step."],
    ],
    path: ["Start = 2.", "2 + 3 = 5, 5 + 3 = 8.", "8 + 3 = 11 is not below 10, so stop."],
    why: "range(start, stop, step) counts from start in steps, stopping before stop.",
    watch: "The stop value is always exclusive.",
    remember: "range, slices and stops: exclusive at the end.",
  },
  {
    t: "Shared class variable",
    q: "What does this print?",
    code: py`
class Team:
    members = []

a = Team()
b = Team()
a.members.append("Asha")
print(b.members)`,
    opts: [
      ["['Asha']", true, "members belongs to the class, so a and b share the same list."],
      ["[]", false, "That would be true if each instance had its own list created in __init__."],
      ["AttributeError", false, "b finds members on the class, so there is no error."],
    ],
    path: ["members is stored once, on the Team class.", "a.members and b.members both resolve to that one list.", "Appending through a changes the shared list, so b sees 'Asha' too."],
    why: "Class-level mutable data is shared between all instances.",
    watch: "Create per-instance lists in __init__: self.members = [].",
    remember: "Mutable class attributes are shared state.",
  },
];

export const codeLab: [string, string, string][] = [
  ["Five cities", "Make a list of five cities. Print the first, the last and the middle three.", py`
cities = ["Vilnius", "Kaunas", "Klaipeda", "Siauliai", "Panevezys"]
print(cities[0], cities[-1], cities[1:4])`],
  ["Marks summary", "Write a function that takes a list of marks and returns the highest mark and the average.", py`
def summarize_marks(marks):
    return max(marks), sum(marks) / len(marks)

high, average = summarize_marks([70, 85, 90])
print(high, average)`],
  ["Unpack an image size", "Create the tuple (1920, 1080) and unpack its width and height.", py`
width, height = (1920, 1080)
print(width, height)`],
  ["Library book", "Create a dictionary for a library book (title, author, copies) and increase the copies by one.", py`
book = {"title": "Python 101", "author": "Asha", "copies": 2}
book["copies"] += 1
print(book)`],
  ["Books with spare copies", "Given a list of book dictionaries, print the titles that have more than two copies.", py`
books = [
    {"title": "Python 101", "copies": 3},
    {"title": "AI Basics", "copies": 1},
    {"title": "Maths", "copies": 4},
]
for book in books:
    if book["copies"] > 2:
        print(book["title"])`],
  ["Pass or fail", "Write is_passed(score, threshold=50) returning True or False.", py`
def is_passed(score, threshold=50):
    return score >= threshold

print(is_passed(67), is_passed(40), is_passed(40, threshold=30))`],
  ["Checkout calculator", "A cart is a list of dicts. Compute the subtotal, add EUR 3 shipping under EUR 20, and return a dict with subtotal, shipping and total.", py`
cart = [
    {"name": "Notebook", "price": 5.0, "qty": 3},
    {"name": "Pen", "price": 2.0, "qty": 2},
]

def line_total(product):
    return product["price"] * product["qty"]

def checkout(products, free_shipping_from=20):
    subtotal = sum(line_total(p) for p in products)
    shipping = 0 if subtotal >= free_shipping_from else 3
    return {"subtotal": subtotal, "shipping": shipping, "total": subtotal + shipping}

print(checkout(cart))`],
  ["Bank account", "Write a BankAccount class with deposit and withdraw that reject invalid amounts.", py`
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount <= 0 or amount > self._balance:
            raise ValueError("Invalid withdrawal")
        self._balance -= amount

account = BankAccount("Asha", 100)
account.deposit(25)
account.withdraw(40)
print(account.balance)`],
  ["Café order logger", "Append orders to a CSV file (writing the header only once) and compute the total sales.", py`
import csv
from pathlib import Path

FILE = Path("orders.csv")

def add_order(item, quantity, unit_price):
    is_new = not FILE.exists() or FILE.stat().st_size == 0
    with FILE.open("a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if is_new:
            writer.writerow(["item", "quantity", "unit_price"])
        writer.writerow([item, quantity, unit_price])

def total_sales():
    if not FILE.exists():
        return 0.0
    with FILE.open(newline="", encoding="utf-8") as file:
        return sum(int(r["quantity"]) * float(r["unit_price"]) for r in csv.DictReader(file))

add_order("Coffee", 2, 3.50)
add_order("Sandwich", 1, 5.00)
print(f"Total sales: {total_sales():.2f}")`],
  ["Word frequencies", "Read a text file and count how often each word appears, then print the three most common.", py`
from collections import Counter
from pathlib import Path

text = Path("article.txt").read_text(encoding="utf-8").lower()
words = [w.strip(".,!?;:") for w in text.split()]
counts = Counter(w for w in words if w)
print(counts.most_common(3))`],
  ["Save metrics as JSON", "Compute accuracy for two label lists and save it, with the model name, to results/metrics.json.", py`
import json
from pathlib import Path

pred = [1, 0, 1, 1]
actual = [1, 0, 0, 1]
accuracy = sum(p == a for p, a in zip(pred, actual)) / len(actual)

out = Path("results")
out.mkdir(exist_ok=True)
with (out / "metrics.json").open("w", encoding="utf-8") as f:
    json.dump({"model": "baseline", "accuracy": accuracy}, f, indent=2)`],
  ["Delivery fees", "Create two classes with a fee(km) method and a function that works with either (polymorphism).", py`
class BikeDelivery:
    def fee(self, km):
        return 2 + km * 0.5

class CarDelivery:
    def fee(self, km):
        return 4 + km * 0.8

def show_fee(delivery, km):
    return delivery.fee(km)

for option in (BikeDelivery(), CarDelivery()):
    print(type(option).__name__, show_fee(option, 5))`],
];

export const glance: [string, string][] = [
  ["List, tuple, dict", "List: ordered and changeable. Tuple: ordered and fixed. Dict: look up by key."],
  ["Slicing", "items[start:stop]: start included, stop excluded. [::-1] reverses."],
  ["Alias vs copy", "b = a shares one object. Use copy() for a shallow copy, deepcopy() for nested."],
  ["In-place returns None", "append, extend, sort, reverse change the list and return None."],
  ["[] vs get", "d[key] raises KeyError. d.get(key, default) gives a fallback."],
  ["print vs return", "print shows it. return gives it back. No return means None."],
  ["Mutable default", "Never def f(x, items=[]). Use None and create the list inside."],
  ["self", "The object the method was called on — passed automatically."],
  ["super()", "Calls the parent's version; use super().__init__(...) in a child."],
  ["with open", "Always closes the file, even on errors. Add encoding='utf-8'."],
  ["File modes", "r read, w write (ERASES), a append, x create-only, b binary."],
  ["Load → process → save", "Every ML script: read data, transform lists/dicts, compute metrics, write results."],
];

export const lists: [string, string[]][] = [
  ["Habits that prevent bugs", ["Copy a list before changing it if anything else uses it", "Use get() for optional dictionary fields", "Return values from functions instead of printing them", "Use None as a default, never an empty list", "Open every file with with and encoding='utf-8'"]],
  ["Before you run a script", ["Check the working directory and relative paths", "Confirm which file mode you are using (w erases)", "Convert CSV strings to numbers explicitly", "Validate shapes and lengths before computing", "Never load untrusted pickle files"]],
  ["Explaining your answer in an interview", ["Say what the object is and whether it is mutable", "Trace the code line by line out loud", "Name the edge case you are guarding against", "Mention the time or memory cost if it matters", "Offer the simpler alternative (comprehension, get, with)"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation", [["The Python tutorial", "https://docs.python.org/3/tutorial/"], ["pathlib", "https://docs.python.org/3/library/pathlib.html"], ["csv", "https://docs.python.org/3/library/csv.html"], ["json", "https://docs.python.org/3/library/json.html"], ["dataclasses", "https://docs.python.org/3/library/dataclasses.html"]]],
  ["Practise and visualise", [["Python Tutor — step through code visually", "https://pythontutor.com/"], ["Exercism Python track", "https://exercism.org/tracks/python"]]],
  ["Books worth owning", [["Fluent Python — Luciano Ramalho", "book"], ["Python Crash Course — Eric Matthes", "book"], ["Automate the Boring Stuff with Python — Al Sweigart", "book"]]],
];
