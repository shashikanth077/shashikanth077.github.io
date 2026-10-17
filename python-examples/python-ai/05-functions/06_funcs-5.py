# -*- coding: utf-8 -*-
# ==========================================================================
# Scope: local, global and LEGB [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# Python looks a name up in this order: Local, Enclosing, Global, Built-in
# (LEGB). Variables created inside a function are local and vanish when it
# returns. Reading a global is fine; assigning to one needs the global keyword
# — usually a sign you should pass a parameter instead.
#
# WHERE YOU USE IT
# Notebook state leaks: a global DataFrame silently changed in one cell breaks
# the next. Passing data in and returning it keeps experiments reproducible.
#
# RUN IT:  python 06_funcs-5.py
#

tax_rate = 0.10

def total(price):
    fee = price * tax_rate
    return price + fee

print(total(100))
# print(fee)  -> NameError: fee only exists inside total()

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 110.0
