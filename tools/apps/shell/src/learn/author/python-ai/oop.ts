import { compare, flow, layers, seq, trace } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";

export const oop: ConceptDef[] = [
  {
    t: "Class versus object",
    lv: 1,
    s: `A class is a blueprint; an object (an instance) is one thing built from it. Each object has its own data (attributes) and shares the class's behaviour (methods). Think cookie cutter and cookies.`,
    r: `A model class describes how any model behaves. {{model = LogisticRegression()}} is one configured instance with its own learned weights.`,
    i: `What is the difference between a class and an instance?`,
    c: py`
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

asha = BankAccount("Asha", 100)
ben = BankAccount("Ben", 250)
print(asha.balance, ben.balance)`,
    o: `100 250`,
    v: flow("One class, many independent objects — each with its own data.", "row",
      ["BankAccount|the blueprint (class)|i", "asha|owner 'Asha', balance 100|g", "ben|owner 'Ben', balance 250|g"],
      [[0, 1, "BankAccount('Asha', 100)"], [0, 2, "BankAccount('Ben', 250)"]],
      undefined,
      ["Calling the class builds an object from the blueprint.", "Calling it again builds a second, separate object. Changing asha never touches ben."]),
  },
  {
    t: "__init__ and self",
    lv: 1,
    s: `When you call {{Student("Maya", 90)}} Python creates an empty object, runs {{__init__}} on it and hands it back. {{self}} is that new object: {{self.name = name}} stores data on it. Every instance method receives {{self}} automatically — that is why you don't pass it yourself.`,
    r: `{{self.weights}} and {{self.learning_rate}}, set up in {{__init__}}, are how a model keeps its state between {{fit}} and {{predict}}.`,
    i: `What is {{self}}, and why isn't it passed explicitly when you call a method?`,
    c: py`
class Student:
    def __init__(self, name, mark):
        self.name = name
        self.mark = mark

    def passed(self):
        return self.mark >= 50

student = Student("Maya", 90)
print(student.name)
print(student.passed())`,
    o: `Maya\nTrue`,
    v: trace("Calling a class creates an object, runs __init__ on it, and self is that object.", py`
class Student:
    def __init__(self, name, mark):
        self.name = name
        self.mark = mark

    def passed(self):
        return self.mark >= 50

student = Student("Maya", 90)
print(student.name)
print(student.passed())`, [
      [9, { student: "an empty Student object" }, undefined, "Student(...) first allocates an empty object."],
      [2, { self: "that new object", name: "'Maya'", mark: "90" }, undefined, "__init__ runs with self = the new object and your arguments."],
      [3, { "self.name": "'Maya'" }],
      [4, { "self.mark": "90" }],
      [9, { student: "Student(name='Maya', mark=90)" }, undefined, "The finished object is bound to the name student."],
      [10, undefined, "Maya"],
      [11, undefined, undefined, "student.passed() — Python passes student as self automatically."],
      [7, undefined, "True", "self.mark >= 50 → 90 >= 50 → True."],
    ]),
  },
  {
    t: "Instance, class and static methods",
    lv: 2,
    s: `An instance method receives {{self}} (the object). A class method receives {{cls}} (the class) and is the usual way to write alternative constructors. A static method receives nothing automatically — it's a plain function that lives inside the class for organisation.`,
    r: `{{Model.from_config(path)}} and {{Dataset.from_csv(path)}} are class methods: different ways to build the same kind of object.`,
    i: `When would you use {{@classmethod}} instead of {{__init__}}?`,
    c: py`
class Invoice:
    tax_rate = 0.25

    def __init__(self, subtotal):
        self.subtotal = subtotal

    def total(self):
        return self.subtotal * (1 + self.tax_rate)

    @classmethod
    def from_string(cls, value):
        return cls(float(value))

    @staticmethod
    def valid_subtotal(amount):
        return amount >= 0

bill = Invoice.from_string("100")
print(bill.total())
print(Invoice.valid_subtotal(100))`,
    o: `125.0\nTrue`,
    v: compare("The first parameter tells you what the method works on.", ["Instance method", "Class method", "Static method"], [
      ["First parameter", "self (the object)", "cls (the class)", "none"],
      ["Decorator", "none", "@classmethod", "@staticmethod"],
      ["Typical job", "read or change one object", "alternative constructors", "helper that needs neither"],
      ["Example call", "bill.total()", "Invoice.from_string('100')", "Invoice.valid_subtotal(5)"],
    ]),
  },
  {
    t: "Encapsulation and @property",
    lv: 2,
    s: `Encapsulation keeps data behind methods that enforce the rules, so objects can't easily be put in an invalid state. Python uses conventions: {{_name}} means "internal", {{__name}} mangles the name, and {{@property}} gives controlled attribute-style access with validation. None of this is real security.`,
    r: `A learning-rate or temperature property that rejects invalid values stops a misconfigured experiment before it wastes GPU hours.`,
    i: `Is {{_balance}} private in Python?`,
    c: py`
class Thermostat:
    def __init__(self, temperature):
        self.temperature = temperature

    @property
    def temperature(self):
        return self._temperature

    @temperature.setter
    def temperature(self, value):
        if not 16 <= value <= 30:
            raise ValueError("Use 16 to 30")
        self._temperature = value

t = Thermostat(22)
t.temperature = 24
print(t.temperature)
t.temperature = 45`,
    o: `24\nValueError: Use 16 to 30`,
    v: seq("The setter checks the rule before touching the stored value, so state stays valid.", ["Your code", "temperature setter", "_temperature"], [
      [0, 1, "t.temperature = 24"],
      [1, 1, "check 16 <= 24 <= 30", "The rule passes."],
      [1, 2, "store 24"],
      [0, 1, "t.temperature = 45"],
      [1, 1, "check 16 <= 45 <= 30", "The rule fails.", "b"],
      [1, 0, "ValueError", "The stored value is never corrupted.", "rb"],
    ]),
  },
  {
    t: "Inheritance and super()",
    lv: 2,
    s: `A child class inherits attributes and methods from its parent and can add or override them. {{super()}} calls the parent's version — typically {{super().__init__(...)}} so the parent still sets up its part. Use inheritance for a true "is-a" relationship.`,
    r: `In PyTorch your model inherits from {{nn.Module}}, calls {{super().__init__()}} and overrides {{forward}}.`,
    i: `What does {{super()}} do, and what is the method resolution order (MRO)?`,
    c: py`
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name} earns {self.salary}"

class Developer(Employee):
    def __init__(self, name, salary, language):
        super().__init__(name, salary)
        self.language = language

    def describe(self):
        return f"{super().describe()}, codes in {self.language}"

dev = Developer("Maya", 3500, "Python")
print(dev.describe())`,
    o: `Maya earns 3500, codes in Python`,
    v: seq("The child reuses the parent's code through super() and adds its own part.", ["Developer", "Employee"], [
      [0, 0, "Developer('Maya', 3500, 'Python')"],
      [0, 1, "super().__init__(name, salary)", "The parent sets up name and salary."],
      [1, 0, "returns", "", "r"],
      [0, 0, "self.language = 'Python'", "The child adds its own attribute."],
      [0, 0, "dev.describe()", "Python finds Developer's version first."],
      [0, 1, "super().describe()"],
      [1, 0, "'Maya earns 3500'", "", "r"],
      [0, 0, "adds ', codes in Python'"],
    ]),
  },
  {
    t: "Polymorphism and duck typing",
    lv: 2,
    s: `Polymorphism means one call, different behaviour depending on the object. In Python you don't need a shared parent: if an object has the method you call, it works ("if it quacks like a duck"). Callers stay free of {{if type == ...}} chains.`,
    r: `A training loop calls {{model.predict(x)}} on any model — scikit-learn, a neural network, a rule-based baseline — because each provides {{predict}}.`,
    i: `What is duck typing?`,
    c: py`
class BikeDelivery:
    def fee(self, km):
        return 2 + km * 0.5

class CarDelivery:
    def fee(self, km):
        return 4 + km * 0.8

def show_fee(delivery, distance):
    return delivery.fee(distance)

print(show_fee(BikeDelivery(), 5))
print(show_fee(CarDelivery(), 5))`,
    o: `4.5\n8.0`,
    v: seq("The caller uses one method name; each object supplies its own behaviour.", ["Checkout", "BikeDelivery", "CarDelivery"], [
      [0, 1, "fee(5)"],
      [1, 0, "4.5", "2 + 5 × 0.5", "r"],
      [0, 2, "fee(5)", "Exactly the same call — a different object."],
      [2, 0, "8.0", "4 + 5 × 0.8", "r"],
    ]),
  },
  {
    t: "Abstraction with abstract base classes",
    lv: 2,
    s: `An abstract base class defines the methods every subclass must provide, without saying how. A subclass that skips an {{@abstractmethod}} can't be instantiated. The rest of the code then depends on one simple interface.`,
    r: `Define a {{Metric}} or {{Model}} interface once — {{fit}}, {{predict}} — and every implementation plugs into the same pipeline.`,
    i: `What happens if a subclass doesn't implement an abstract method?`,
    c: py`
from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount):
        ...

class CardPayment(PaymentGateway):
    def pay(self, amount):
        return f"Charged {amount} to card"

class Broken(PaymentGateway):
    pass

print(CardPayment().pay(25))
Broken()`,
    o: `Charged 25 to card\nTypeError: Can't instantiate abstract class Broken ...`,
    v: layers("Code depends on the interface; each class fills in the how.", [
      "Checkout code|only knows pay(amount)|g",
      "PaymentGateway (abstract)|declares pay() — no implementation|i",
      "CardPayment|implements pay() ✓|g",
      "WalletPayment|implements pay() ✓|g",
      "Broken|forgot pay() → cannot even be created|b",
    ]),
  },
  {
    t: "Composition: has-a",
    lv: 2,
    s: `Composition builds an object out of other objects ("has-a") instead of extending a class ("is-a"). It is more flexible because you can swap the parts. A good rule: inheritance for true subtypes, composition for everything else.`,
    r: `A {{Pipeline}} has a scaler and a model; it doesn't inherit from either. Swap the model and nothing else changes.`,
    i: `Why "favour composition over inheritance"?`,
    c: py`
from dataclasses import dataclass, field

@dataclass
class CartItem:
    name: str
    price: float
    quantity: int = 1

@dataclass
class ShoppingCart:
    items: list[CartItem] = field(default_factory=list)

    def add(self, item):
        self.items.append(item)

    def total(self):
        return sum(i.price * i.quantity for i in self.items)

cart = ShoppingCart()
cart.add(CartItem("Notebook", 4.50, 2))
cart.add(CartItem("Pen", 1.20, 3))
print(round(cart.total(), 2))`,
    o: `12.6`,
    v: compare("Is-a ties a child to its parent; has-a lets you swap the parts.", ["Inheritance (is-a)", "Composition (has-a)"], [
      ["Relationship", "a Dog IS an Animal", "an Order HAS OrderItems"],
      ["Coupling", "tight: child depends on parent", "loose: parts can be swapped"],
      ["Use when", "the child truly satisfies the parent's contract", "you assemble behaviour from parts"],
      ["In code", "class Developer(Employee)", "self.items = []"],
    ], 1),
  },
  {
    t: "Special (dunder) methods",
    lv: 2,
    s: `Special "dunder" methods let your objects work with Python's own syntax: {{__str__}} for {{print}}, {{__repr__}} for debugging, {{__len__}} for {{len()}}, {{__eq__}} for {{==}}, {{__getitem__}} for {{obj[i]}}. Python calls them for you.`,
    r: `A dataset class with {{__len__}} and {{__getitem__}} is exactly what PyTorch expects from a dataset.`,
    i: `What is the difference between {{__str__}} and {{__repr__}}?`,
    c: py`
class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name}: {self.price:.2f}"

    def __repr__(self):
        return f"Product({self.name!r}, {self.price!r})"

p = Product("Keyboard", 29.9)
print(p)
print(repr(p))`,
    o: `Keyboard: 29.90\nProduct('Keyboard', 29.9)`,
    v: compare("You write ordinary syntax; Python calls the matching dunder method.", ["Python calls"], [
      ["print(p)", "p.__str__()"],
      ["repr(p) / debugger", "p.__repr__()"],
      ["len(p)", "p.__len__()"],
      ["p == q", "p.__eq__(q)"],
      ["p[0]", "p.__getitem__(0)"],
      ["for x in p", "p.__iter__()"],
    ]),
  },
  {
    t: "Dataclasses",
    lv: 2,
    s: `{{@dataclass}} writes {{__init__}}, {{__repr__}} and {{__eq__}} for you from annotated fields. Use {{field(default_factory=list)}} for mutable defaults and {{frozen=True}} for immutable records.`,
    r: `Configs such as {{TrainConfig(epochs=20, lr=0.001)}} are perfect dataclasses: typed, printable and comparable.`,
    i: `Why does a dataclass need {{default_factory}} for a list field?`,
    c: py`
from dataclasses import dataclass, field

@dataclass
class TrainConfig:
    epochs: int = 20
    lr: float = 0.001
    layers: list[int] = field(default_factory=lambda: [64, 32])

a = TrainConfig()
b = TrainConfig(lr=0.01)
print(a)
print(a == b)`,
    o: `TrainConfig(epochs=20, lr=0.001, layers=[64, 32])\nFalse`,
    v: compare("A dataclass is a plain class with the boring methods written for you.", ["Plain class", "@dataclass"], [
      ["__init__", "you write it", "generated from the fields"],
      ["print(obj)", "<Cfg object at 0x…>", "TrainConfig(epochs=20, lr=0.001, …)"],
      ["a == b", "compares identity", "compares every field"],
      ["Lines of code", "many", "few"],
    ], 1),
  },
  {
    t: "The shared class-variable trap",
    lv: 2,
    s: `A variable defined in the class body belongs to the class and is shared by every instance. A mutable one — a list — therefore leaks between objects. Create per-object state in {{__init__}} with {{self.members = []}}.`,
    r: `A model class with a shared list of losses would mix up the results of two models trained side by side.`,
    i: `Why do two instances share the same list?`,
    c: py`
class Team:
    members = []          # shared by ALL instances

a = Team()
b = Team()
a.members.append("Asha")
print(b.members)`,
    o: `['Asha']`,
    v: flow("Class-level data is one object that every instance finds — put per-object state in __init__.", "row",
      ["Team.members|ONE list stored on the class|b", "a|instance|i", "b|instance|i"],
      [[1, 0, "a.members finds"], [2, 0, "b.members finds"]],
      undefined,
      ["a.members isn't on a itself, so Python looks on the class and finds the list there. append puts 'Asha' in it.", "b.members finds the very same list, so 'Asha' shows up for b too."]),
  },
  {
    t: "fit and predict: how ML libraries use classes",
    lv: 2,
    s: `ML libraries are object-oriented: construct a model object with its settings, call {{fit(X, y)}} to learn (the object stores what it learned in attributes ending in {{_}}), then {{predict(X)}} to use it. Write your own estimators the same way and they fit into the same tooling.`,
    r: `Following the {{fit}} / {{predict}} convention lets your class drop into scikit-learn pipelines and cross-validation.`,
    i: `Where do learned parameters live after {{fit()}}?`,
    c: py`
class MeanThreshold:
    def fit(self, marks):
        self.threshold_ = sum(marks) / len(marks)
        return self

    def predict(self, marks):
        return [int(m >= self.threshold_) for m in marks]

model = MeanThreshold().fit([40, 60, 80])
print(model.threshold_)
print(model.predict([30, 65, 90]))`,
    o: `60.0\n[0, 1, 1]`,
    v: seq("fit stores what was learned on the object; predict uses it.", ["Your script", "MeanThreshold object"], [
      [0, 1, "MeanThreshold()", "A new object with nothing learned yet."],
      [0, 1, "fit([40, 60, 80])"],
      [1, 1, "threshold_ = 60.0", "The learned value is stored on the object, with a trailing underscore by convention."],
      [1, 0, "returns self", "So calls can be chained: MeanThreshold().fit(...)", "r"],
      [0, 1, "predict([30, 65, 90])"],
      [1, 0, "[0, 1, 1]", "30 < 60 → 0, 65 ≥ 60 → 1, 90 ≥ 60 → 1.", "r"],
    ]),
  },
];
