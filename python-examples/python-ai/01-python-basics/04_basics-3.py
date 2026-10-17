# -*- coding: utf-8 -*-
# ==========================================================================
# Equality, identity and truthiness [python-ai / Python basics]
# ==========================================================================
# WHAT IT IS
# == asks whether two objects have equal values; is asks whether they are the
# very same object. Use is None for None checks. Empty containers, 0, empty
# strings and None are falsy; almost everything else is truthy.
#
# WHERE YOU USE IT
# Comparing two arrays or models with is instead of == gives surprising
# answers, while if not data: is the quick guard against an empty dataset.
#
# RUN IT:  python 04_basics-3.py
#

a = [1, 2]
b = [1, 2]
c = a
print(a == b)
print(a is b)
print(a is c)
print(bool([]), bool([0]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# False
# True
# False True
