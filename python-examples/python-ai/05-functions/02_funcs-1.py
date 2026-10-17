# -*- coding: utf-8 -*-
# ==========================================================================
# print() versus return [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# print shows something on screen; return hands a value back to the caller so
# other code can use it. A function without a return gives back None.
#
# WHERE YOU USE IT
# A metric function must return its number so you can log, compare and plot
# it. Printing inside it makes the value unusable.
#
# RUN IT:  python 02_funcs-1.py
#

def add_print(a, b):
    print(a + b)

def add_return(a, b):
    return a + b

x = add_print(2, 3)
y = add_return(2, 3)
print(x, y * 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5
# None 10
