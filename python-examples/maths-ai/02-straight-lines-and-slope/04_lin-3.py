# -*- coding: utf-8 -*-
# ==========================================================================
# Worked example: a taxi fare [maths-ai / Straight lines and slope]
# ==========================================================================
# WHAT IT IS
# Fare = €3 start + €2 per km. Compute two fares, then their slope — it
# recovers the €2 per km. Once you know w and b you can predict any trip: 6 km
# costs 2 × 6 + 3 = €15. The extra €6 between 2 km and 5 km is the total
# change; €2/km is the change per kilometre.
#
# WHERE YOU USE IT
# Fitting a line to data is the same job in reverse: given many (x, y)
# examples, find the w and b that explain them.
#
# RUN IT:  python 04_lin-3.py
#

w, b = 2, 3
km = [2, 5]
fares = [w * k + b for k in km]
slope = (fares[1] - fares[0]) / (km[1] - km[0])
print(fares, slope)
print("6 km ->", w * 6 + b)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [7, 13] 2.0
# 6 km -> 15
