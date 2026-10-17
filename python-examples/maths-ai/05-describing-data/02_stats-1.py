# -*- coding: utf-8 -*-
# ==========================================================================
# Variance and standard deviation [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# The mean says where the data is centred; variance says how spread out it is.
# Subtract the mean from each value, square the differences, and average them:
# σ² = (1/n) Σ (xᵢ − x̄)². The standard deviation σ is the square root, in the
# original units. Two players with the same average can have very different σ.
#
# WHERE YOU USE IT
# Standardising features, initialising weights, and judging noise all use
# variance and standard deviation.
#
# RUN IT:  python 02_stats-1.py
#

marks = [2, 4, 4, 4, 5, 5, 7, 9]
mean = sum(marks) / len(marks)
diffs = [m - mean for m in marks]
variance = sum(d * d for d in diffs) / len(marks)
std = variance ** 0.5
print(mean, variance, std)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 4.0 2.0
