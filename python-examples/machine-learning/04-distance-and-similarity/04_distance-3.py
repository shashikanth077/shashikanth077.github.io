# -*- coding: utf-8 -*-
# ==========================================================================
# Why scaling changes what "near" means [machine-learning / Distance and
# similarity]
# ==========================================================================
# WHAT IT IS
# Suppose two customers differ by € 10,000 in income and by 2 in weekly
# orders. Unscaled, the squared distance is 100,000,000 + 4: income is
# 99.999996% of it and orders are ignored. Divide income by a scale (or
# standardise both features) and the balance changes. Choose the
# transformation on purpose: scaling changes the meaning of distance, it does
# not guarantee a better answer. Do NOT standardise coordinates that already
# share one physical unit, such as a map in kilometres.
#
# WHERE YOU USE IT
# For a latitude / longitude over large areas use a geographic distance or a
# map projection, not raw degrees.
#
# RUN IT:  python 04_distance-3.py
#

import numpy as np

gap = np.array([10000.0, 2.0])
print(round(float((gap ** 2)[0] / (gap ** 2).sum()), 8))
scaled = gap / np.array([5000.0, 1.0])
print(scaled.tolist(), round(float((scaled ** 2)[0] / (scaled ** 2).sum()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.99999996
# [2.0, 2.0] 0.5
