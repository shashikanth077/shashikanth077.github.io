# -*- coding: utf-8 -*-
# ==========================================================================
# Why y ÷ x is not the slope [maths-ai / Straight lines and slope]
# ==========================================================================
# WHAT IT IS
# A common mistake: dividing y by x. That is the slope only when the line
# passes through the origin. With a starting fee, 7 ÷ 2 = 3.5 at 2 km is not
# the slope of 2. Slope always uses a difference between two points.
#
# WHERE YOU USE IT
# A bias term exists precisely because real data rarely passes through the
# origin — ignoring it distorts every weight.
#
# RUN IT:  python 06_lin-5.py
#

def fare(x):
    return 2 * x + 3

for km in [1, 2, 4]:
    print(km, fare(km) / km)
print((fare(4) - fare(2)) / (4 - 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 5.0
# 2 3.5
# 4 2.75
# 2.0
