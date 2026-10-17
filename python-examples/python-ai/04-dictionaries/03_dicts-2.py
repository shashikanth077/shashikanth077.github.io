# -*- coding: utf-8 -*-
# ==========================================================================
# Looping over keys, values and items [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# Looping over a dict gives its keys. Use .items() for (key, value) pairs,
# .values() for values only and .keys() for keys. Unpacking the pair in the
# for line is the usual pattern.
#
# WHERE YOU USE IT
# Printing every hyperparameter, or summing a metric per class, is a loop over
# .items().
#
# RUN IT:  python 03_dicts-2.py
#

prices = {"apple": 2, "rice": 5}
for product, price in prices.items():
    print(product, "costs", price)
print(list(prices.keys()))
print(list(prices.values()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# apple costs 2
# rice costs 5
# ['apple', 'rice']
# [2, 5]
