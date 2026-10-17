# -*- coding: utf-8 -*-
# ==========================================================================
# Min–max normalisation [machine-learning / Preparing data]
# ==========================================================================
# WHAT IT IS
# Min–max scaling squeezes a feature into a fixed range: x′ = (x − min) / (max
# − min) gives 0 to 1. To reach any range [a, b] use x′ = a + (x − min)(b − a)
# / (max − min). With training min 2 and max 10, the value 6 becomes (6 −
# 2)/(10 − 2) = 0.5, or 0 on [−1, 1]. Take min and max from the TRAINING data;
# later values outside that range will fall outside [0, 1]. A constant feature
# (max = min) would divide by zero and must be handled.
#
# WHERE YOU USE IT
# Exam shortcut: normalise 30 from [10, 50] into [0, 100]: 0 + (30 − 10) × 100
# / 40 = 50. Always show the formula, substitute, calculate, then say what it
# means.
#
# RUN IT:  python 03_prep-2.py
#

x, lo, hi = 6, 2, 10
print((x - lo) / (hi - lo))
a, b = -1, 1
print(a + (x - lo) * (b - a) / (hi - lo))
print(0 + (30 - 10) * 100 / (50 - 10))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5
# 0.0
# 50.0
