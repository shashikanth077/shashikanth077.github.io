# -*- coding: utf-8 -*-
# ==========================================================================
# Mutable default arguments [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# A default value is created once, when def runs — not on every call. If it is
# a mutable object such as a list, every call shares and keeps changing it.
# Use None as the default and create the list inside the function.
#
# WHERE YOU USE IT
# A shared default list used to collect predictions makes results from one run
# leak into the next — a classic hard-to-find bug.
#
# RUN IT:  python 10_funcs-9.py
#

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
print(add_good("eggs"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['milk']
# ['milk', 'eggs']
# ['milk']
# ['eggs']
