# -*- coding: utf-8 -*-
# ==========================================================================
# Instance, class and static methods [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# An instance method receives self (the object). A class method receives cls
# (the class) and is the usual way to write alternative constructors. A static
# method receives nothing automatically — it's a plain function that lives
# inside the class for organisation.
#
# WHERE YOU USE IT
# Model.from_config(path) and Dataset.from_csv(path) are class methods:
# different ways to build the same kind of object.
#
# RUN IT:  python 03_oop-2.py
#

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
print(Invoice.valid_subtotal(100))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 125.0
# True
