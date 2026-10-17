# -*- coding: utf-8 -*-
# ==========================================================================
# One-item tuples and the nested-list catch [python-ai / Tuples]
# ==========================================================================
# WHAT IT IS
# (5) is just the number 5 in parentheses; (5,) is a one-item tuple — the
# comma matters. A tuple is only shallowly immutable: its references can't be
# reassigned, but if one of them points at a list, that list can still change.
#
# WHERE YOU USE IT
# A config tuple that contains a list (layer sizes, say) can still be mutated
# by accident — know what is and isn't frozen.
#
# RUN IT:  python 03_tuples-2.py
#

single = (42,)
not_tuple = (42)
print(type(single), type(not_tuple))
record = ("student", [80, 90])
record[1].append(100)
print(record)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# <class 'tuple'> <class 'int'>
# ('student', [80, 90, 100])
