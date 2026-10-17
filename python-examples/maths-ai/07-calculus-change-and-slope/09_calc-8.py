# -*- coding: utf-8 -*-
# ==========================================================================
# Integrals: area under a curve [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# An integral adds up infinitely many thin slices to find the area under a
# curve. It is the reverse of differentiation: the area under f(x) = x² from 0
# to b is b³/3. Probability works this way — the area under a density curve
# between two values is the probability of landing between them.
#
# WHERE YOU USE IT
# Expected values and probabilities of continuous variables are integrals;
# normalising a distribution means making its area 1.
#
# RUN IT:  python 09_calc-8.py
#

n = 1000
b = 2
area = sum((i * b / n) ** 2 * (b / n) for i in range(n))
print(round(area, 3), round(b ** 3 / 3, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.663 2.667
