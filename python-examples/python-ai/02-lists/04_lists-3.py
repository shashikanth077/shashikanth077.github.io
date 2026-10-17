# -*- coding: utf-8 -*-
# ==========================================================================
# Loops and list comprehensions [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# A comprehension builds a new list in one expression: [expr for x in items if
# condition]. It replaces the loop-and-append pattern, and the optional if
# filters. Prefer a plain loop when the logic gets long or needs several
# statements.
#
# WHERE YOU USE IT
# Scaling features, filtering rows and applying a function to every sample are
# all comprehension one-liners.
#
# RUN IT:  python 04_lists-3.py
#

prices = [10, 20, 30]
doubled = [p * 2 for p in prices]
large = [p for p in prices if p >= 20]
print(doubled)
print(large)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [20, 40, 60]
# [20, 30]
