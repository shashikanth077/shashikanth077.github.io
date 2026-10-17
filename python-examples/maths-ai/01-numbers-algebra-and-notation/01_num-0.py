# -*- coding: utf-8 -*-
# ==========================================================================
# Reading mathematical notation [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# Maths notation is shorthand. A subscript picks an item (xᵢ is "the i-th x"),
# Σ means "add them all up", ∏ means "multiply them all", a hat marks a
# prediction (ŷ is "y-hat") and |x| is the size of x. Read every symbol as a
# short sentence and the formulas stop looking scary.
#
# WHERE YOU USE IT
# Every ML paper, loss function and library doc is written in this notation. Σ
# (ŷᵢ − yᵢ)² is simply a loop that adds up squared errors.
#
# RUN IT:  python 01_num-0.py
#

x = [2, 4, 6]
print(sum(x))
mean = sum(x) / len(x)
print(mean)
y = [1, 2, 3]
print(sum((p - a) ** 2 for p, a in zip(x, y)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12
# 4.0
# 14
