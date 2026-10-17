# -*- coding: utf-8 -*-
# ==========================================================================
# Mean shift: move toward the crowd [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Place a window of half-width h (the bandwidth) on the road, move its centre
# to the average of the stops inside, and repeat: m_new = Σ xᵢ / |W| over W =
# {i : |xᵢ − m| ≤ h}. Starting from many places the windows climb to local
# density peaks; peaks that converge together are merged into one group. Stops
# [1, 2, 3, 8, 9]: start at 1 with h = 2: window [−1, 3] holds 1, 2, 3, mean
# 2, and it stays there. Start at 9: window holds 8, 9 → 8.5. With h = 8 from
# 1, everything fits and the mean is 4.6: a broad window merges groups. You do
# not choose K, but the bandwidth matters a lot.
#
# WHERE YOU USE IT
# Mean shift finds the number of modes automatically but is sensitive to the
# bandwidth and slow for large samples.
#
# RUN IT:  python 14_cluster-18.py
#

import numpy as np

stops = np.array([1, 2, 3, 8, 9], dtype=float)

def shift(m, h):
    window = stops[np.abs(stops - m) <= h]
    return float(window.mean())

print(shift(1, 2), shift(shift(1, 2), 2), shift(9, 2), round(shift(1, 8), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 2.0 8.5 4.6
