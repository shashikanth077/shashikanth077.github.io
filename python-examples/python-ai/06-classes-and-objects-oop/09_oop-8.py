# -*- coding: utf-8 -*-
# ==========================================================================
# Special (dunder) methods [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# Special "dunder" methods let your objects work with Python's own syntax:
# __str__ for print, __repr__ for debugging, __len__ for len(), __eq__ for ==,
# __getitem__ for obj[i]. Python calls them for you.
#
# WHERE YOU USE IT
# A dataset class with __len__ and __getitem__ is exactly what PyTorch expects
# from a dataset.
#
# RUN IT:  python 09_oop-8.py
#

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
print(repr(p))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Keyboard: 29.90
# Product('Keyboard', 29.9)
