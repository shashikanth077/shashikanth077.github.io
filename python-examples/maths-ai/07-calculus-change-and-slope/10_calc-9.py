# -*- coding: utf-8 -*-
# ==========================================================================
# Numerical gradient checking [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# You can test a derivative you derived by hand: nudge the input a tiny amount
# both ways and measure the slope directly, (f(x + h) − f(x − h)) / 2h, then
# compare with your formula. If they agree to several decimals your formula is
# right. This "gradient check" catches almost every backpropagation bug.
#
# WHERE YOU USE IT
# Before trusting a hand-written backward pass or custom layer, deep-learning
# engineers run a gradient check.
#
# RUN IT:  python 10_calc-9.py
#

def f(x):
    return x ** 2

x, h = 3, 1e-5
numeric = (f(x + h) - f(x - h)) / (2 * h)
analytic = 2 * x
print(round(numeric, 6), analytic)
print(abs(numeric - analytic) < 1e-6)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.0 6
# True
