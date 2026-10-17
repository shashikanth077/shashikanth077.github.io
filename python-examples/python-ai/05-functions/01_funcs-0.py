# -*- coding: utf-8 -*-
# ==========================================================================
# Defining and calling functions [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# def names a reusable block of code. Parameters are its inputs; return sends
# a result back to the caller and ends the function. Defining a function does
# not run it — calling name(args) does.
#
# WHERE YOU USE IT
# Metrics, preprocessing steps and training loops are functions you write once
# and reuse across experiments.
#
# RUN IT:  python 01_funcs-0.py
#

def apply_discount(price, discount_percent):
    discount_amount = price * discount_percent / 100
    return price - discount_amount

amount = apply_discount(100, 20)
print(amount)
print(apply_discount(200, 10))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80.0
# 180.0
