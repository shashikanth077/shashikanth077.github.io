# -*- coding: utf-8 -*-
# ==========================================================================
# args and kwargs [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# args collects extra positional arguments into a tuple; kwargs collects extra
# keyword arguments into a dict. The same stars unpack on a call: f(items)
# spreads a sequence and f(options) spreads a dict as keyword arguments.
#
# WHERE YOU USE IT
# Config dicts become keyword arguments — model = Model(config) — and wrappers
# pass options through to the library underneath with kwargs.
#
# RUN IT:  python 05_funcs-4.py
#

def add_all(*numbers):
    return sum(numbers)

def make_profile(**fields):
    return fields

config = {"epochs": 20, "lr": 0.001}
print(add_all(1, 2, 3, 4))
print(make_profile(name="Ravi", age=30))
print(make_profile(**config))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10
# {'name': 'Ravi', 'age': 30}
# {'epochs': 20, 'lr': 0.001}
