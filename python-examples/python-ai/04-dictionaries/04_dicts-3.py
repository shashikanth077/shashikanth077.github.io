# -*- coding: utf-8 -*-
# ==========================================================================
# update, pop and counting [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# update({...}) merges entries, overwriting existing keys. pop(key) removes a
# key and returns its value. setdefault(key, value) inserts only when the key
# is missing. The counting idiom is counts[x] = counts.get(x, 0) + 1 — or use
# collections.Counter.
#
# WHERE YOU USE IT
# Merging default settings with overrides is update, and counting label
# frequencies in a dataset is the counting idiom.
#
# RUN IT:  python 04_dicts-3.py
#

config = {"epochs": 10, "lr": 0.01}
config.update({"lr": 0.001, "batch": 32})
removed = config.pop("epochs")
counts = {}
for w in ["a", "b", "a"]:
    counts[w] = counts.get(w, 0) + 1
print(config, removed)
print(counts)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'lr': 0.001, 'batch': 32} 10
# {'a': 2, 'b': 1}
