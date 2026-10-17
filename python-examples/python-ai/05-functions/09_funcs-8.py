# -*- coding: utf-8 -*-
# ==========================================================================
# Recursion [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# A recursive function calls itself on a smaller problem until it reaches a
# base case that stops the calls. Each call has its own local variables on the
# call stack. Without a base case Python raises RecursionError.
#
# WHERE YOU USE IT
# Trees — decision trees, nested JSON, folders — are naturally recursive. Most
# numeric loops should still be plain loops.
#
# RUN IT:  python 09_funcs-8.py
#

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 24
