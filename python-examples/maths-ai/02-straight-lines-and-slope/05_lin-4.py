# -*- coding: utf-8 -*-
# ==========================================================================
# Slope depends on units [maths-ai / Straight lines and slope]
# ==========================================================================
# WHAT IT IS
# Slope is a ratio of units, so changing the units changes the number but not
# the relationship: €2 per km is €0.002 per metre. A fare of €2/km over 5000 m
# still costs €10. Always read a slope together with its units, and never
# compare slopes with different units directly.
#
# WHERE YOU USE IT
# Feature scaling exists because weights for a feature measured in millimetres
# and one in kilometres differ by a factor of a million.
#
# RUN IT:  python 05_lin-4.py
#

per_km = 2
per_m = per_km / 1000
print(per_m)
print(per_km * 5, per_m * 5000)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.002
# 10 10.0
