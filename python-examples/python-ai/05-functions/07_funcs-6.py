# -*- coding: utf-8 -*-
# ==========================================================================
# lambda, map and filter [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# A lambda is a small anonymous function: lambda x: x 2. map(f, items) applies
# a function to every item and filter(f, items) keeps the items where it is
# true. Both return lazy iterators, so wrap them in list(). A comprehension is
# often clearer.
#
# WHERE YOU USE IT
# sorted(rows, key=lambda r: r["score"]) — the key= lambda — is the most
# common use in data code.
#
# RUN IT:  python 07_funcs-6.py
#

numbers = [1, 2, 3, 4]
double = lambda x: x * 2
print(list(map(double, numbers)))
print(list(filter(lambda x: x % 2 == 0, numbers)))
print([x * 2 for x in numbers])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 4, 6, 8]
# [2, 4]
# [2, 4, 6, 8]
