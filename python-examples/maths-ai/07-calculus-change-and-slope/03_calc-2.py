# -*- coding: utf-8 -*-
# ==========================================================================
# Derivative rules: power, constant and sum [maths-ai / Calculus: change and
# slope]
# ==========================================================================
# WHAT IT IS
# You rarely compute limits by hand. Learn a few rules. Power rule: (xⁿ)′ =
# n·xⁿ⁻¹. Constant: (c)′ = 0 and (c·f)′ = c·f′. Sum: differentiate term by
# term. So (3x² + 2x − 5)′ = 6x + 2.
#
# WHERE YOU USE IT
# Backpropagation applies these rules to every operation in the network.
#
# RUN IT:  python 03_calc-2.py
#

def d(f, x, h=1e-6):
    return (f(x + h) - f(x - h)) / (2 * h)

f = lambda x: 3 * x**2 + 2 * x - 5
print(round(d(f, 3), 3), 6 * 3 + 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 20.0 20
