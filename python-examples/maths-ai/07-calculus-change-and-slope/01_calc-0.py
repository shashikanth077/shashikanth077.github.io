# -*- coding: utf-8 -*-
# ==========================================================================
# Limits: from the secant to the tangent [maths-ai / Calculus: change and
# slope]
# ==========================================================================
# WHAT IT IS
# The slope between two points on a curve (a secant) is an average rate of
# change. Bring the second point closer — h smaller and smaller — and the
# secant settles on the slope at one point: the tangent. That value the slopes
# approach is the limit. We never put h = 0 in the fraction; we ask what it
# approaches.
#
# WHERE YOU USE IT
# The derivative that powers backpropagation is exactly this limit, computed
# by formula instead of by shrinking h.
#
# RUN IT:  python 01_calc-0.py
#

def s(t):
    return t ** 2

t0 = 2
for h in [1, 0.5, 0.1, 0.01]:
    print(h, round((s(t0 + h) - s(t0)) / h, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 5.0
# 0.5 4.5
# 0.1 4.1
# 0.01 4.01
