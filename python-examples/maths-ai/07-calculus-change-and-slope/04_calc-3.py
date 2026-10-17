# -*- coding: utf-8 -*-
# ==========================================================================
# Product and quotient rules [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# When two functions are multiplied, differentiate one at a time: (u·v)′ = u′v
# + uv′. For a ratio: (u/v)′ = (u′v − uv′) / v². Do not simply multiply or
# divide the derivatives. Check with a number: for x²(x + 1) at x = 2 the
# slope is 16.
#
# WHERE YOU USE IT
# Neurons multiply inputs by weights and then pass them through further
# functions, so product and chain rules appear together.
#
# RUN IT:  python 04_calc-3.py
#

def d(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

print(round(d(lambda x: x**2 * (x + 1), 2), 3))
print(round(d(lambda x: x / (x + 1), 2), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 16.0
# 0.1111
