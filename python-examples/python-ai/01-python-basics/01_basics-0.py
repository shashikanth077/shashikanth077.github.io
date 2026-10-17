# -*- coding: utf-8 -*-
# ==========================================================================
# Variables, types and names [python-ai / Python basics]
# ==========================================================================
# WHAT IT IS
# A variable is a name that points to an object. The object has a type — int,
# float, str, bool, list, dict — and Python works the type out from the value.
# Reassigning a name just points it at a different object; nothing is
# "declared" first.
#
# WHERE YOU USE IT
# Every dataset column, hyperparameter and metric is a typed value. Mixing up
# str and int (CSV values always arrive as strings) is the most common first
# bug in ML scripts.
#
# RUN IT:  python 01_basics-0.py
#

age = 25
price = 19.99
name = "Ravi"
is_student = True
print(type(name))
age = "twenty-five"
print(type(age))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# <class 'str'>
# <class 'str'>
