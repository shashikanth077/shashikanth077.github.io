# -*- coding: utf-8 -*-
# ==========================================================================
# Unpacking [python-ai / Tuples]
# ==========================================================================
# WHAT IT IS
# Unpacking assigns every item of a tuple (or list) to its own name in one
# line. first, middle, last = items collects the extras in a list. It is also
# how functions return several values and how for key, value in d.items()
# works.
#
# WHERE YOU USE IT
# Shapes unpack as height, width, channels = shape, and train_test_split
# returns four values that you unpack at once.
#
# RUN IT:  python 02_tuples-1.py
#

user = ("Asha", 24, "Vilnius")
name, age, city = user
first, *middle, last = (1, 2, 3, 4)
print(name, age, city)
print(first, middle, last)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Asha 24 Vilnius
# 1 [2, 3] 4
