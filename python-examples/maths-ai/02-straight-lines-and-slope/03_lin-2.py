# -*- coding: utf-8 -*-
# ==========================================================================
# Positive, negative, zero and undefined slope [maths-ai / Straight lines and
# slope]
# ==========================================================================
# WHAT IT IS
# Read a line left to right. Positive slope climbs, negative slope falls, zero
# slope is flat (no change at all). A vertical line has run = 0, so the
# division is by zero: its slope is undefined — not zero. Two identical points
# (0/0) also give no single slope.
#
# WHERE YOU USE IT
# Gradients are slopes: positive means "output rises as this weight rises",
# negative means it falls, zero means a flat spot (maybe a minimum).
#
# RUN IT:  python 03_lin-2.py
#

def slope(p, q):
    (x1, y1), (x2, y2) = p, q
    if x1 == x2:
        return "undefined"
    return (y2 - y1) / (x2 - x1)

print(slope((1, 2), (3, 6)), slope((2, 5), (6, 3)))
print(slope((1, 4), (5, 4)), slope((3, 2), (3, 7)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 -0.5
# 0.0 undefined
