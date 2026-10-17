# -*- coding: utf-8 -*-
# ==========================================================================
# Dictionaries: key → value [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# A dictionary stores key–value pairs and finds a value by its key instead of
# a position. Keys are unique and must be hashable (strings, numbers, tuples
# of those); values can be anything. Dictionaries are mutable and keep
# insertion order.
#
# WHERE YOU USE IT
# Hyperparameters, one row of a dataset, a model's metrics and every JSON API
# response are dictionaries.
#
# RUN IT:  python 01_dicts-0.py
#

patient = {"name": "Asha", "age": 29, "city": "Vilnius"}
print(patient["name"])
patient["age"] = 30
patient["blood_group"] = "O+"
print(patient)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Asha
# {'name': 'Asha', 'age': 30, 'city': 'Vilnius', 'blood_group': 'O+'}
