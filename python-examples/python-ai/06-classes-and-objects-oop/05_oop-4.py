# -*- coding: utf-8 -*-
# ==========================================================================
# Inheritance and super() [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# A child class inherits attributes and methods from its parent and can add or
# override them. super() calls the parent's version — typically
# super().__init__(...) so the parent still sets up its part. Use inheritance
# for a true "is-a" relationship.
#
# WHERE YOU USE IT
# In PyTorch your model inherits from nn.Module, calls super().__init__() and
# overrides forward.
#
# RUN IT:  python 05_oop-4.py
#

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
print(dev.describe())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Maya earns 3500, codes in Python
