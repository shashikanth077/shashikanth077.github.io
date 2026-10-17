# -*- coding: utf-8 -*-
# ==========================================================================
# Class versus object [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# A class is a blueprint; an object (an instance) is one thing built from it.
# Each object has its own data (attributes) and shares the class's behaviour
# (methods). Think cookie cutter and cookies.
#
# WHERE YOU USE IT
# A model class describes how any model behaves. model = LogisticRegression()
# is one configured instance with its own learned weights.
#
# RUN IT:  python 01_oop-0.py
#

class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.balance = balance

asha = BankAccount("Asha", 100)
ben = BankAccount("Ben", 250)
print(asha.balance, ben.balance)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 100 250
