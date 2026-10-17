# -*- coding: utf-8 -*-
# ==========================================================================
# F1: the harmonic mean of precision and recall [neural-networks / Measuring
# performance]
# ==========================================================================
# WHAT IT IS
# F1 = 2PR/(P+R) = 2TP/(2TP + FP + FN). With P = 2/3 and R = 4/5: 2 × (8/15) /
# (22/15) = 16/22 = 8/11 ≈ 0.7273; the count formula gives 32/(32+8+4) =
# 0.7273. Why not the plain average? With P = 1 and R = 0.1 the average is
# 0.55 but F1 ≈ 0.18: the harmonic mean stays near the smaller value, so one
# good score cannot hide a bad one. F1 ignores TN and treats both error types
# as equally costly, so it is a summary, not the whole story.
#
# WHERE YOU USE IT
# If 2TP + FP + FN = 0 the count formula is undefined; libraries apply a
# chosen zero-division policy.
#
# RUN IT:  python 04_metrics-3.py
#

p, r = 2 / 3, 4 / 5
print(round(2 * p * r / (p + r), 4), round(32 / 44, 4))
p, r = 1.0, 0.1
print((p + r) / 2, round(2 * p * r / (p + r), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7273 0.7273
# 0.55 0.1818
