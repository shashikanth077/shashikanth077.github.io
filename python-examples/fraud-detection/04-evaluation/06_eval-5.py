# -*- coding: utf-8 -*-
# ==========================================================================
# How sure are you? Few frauds, wide uncertainty [fraud-detection /
# Evaluation]
# ==========================================================================
# WHAT IT IS
# A fraud test set often holds only a few dozen cases, so any metric computed
# from it is a noisy estimate. "We caught 25 of 29 frauds" is 86 % recall, but
# the plausible range is wide. The Wilson interval gives a stable 95 % range
# for a proportion: centre = (p + z²/2n) / (1 + z²/n), half-width =
# z·√(p(1−p)/n + z²/4n²) / (1 + z²/n) with z = 1.96. With 29 cases the range
# runs from about 69 % to 95 %. Two models whose recalls differ by a few
# points are probably indistinguishable on that data. Use more history,
# bootstrap resampling, or paired comparisons on the same transactions before
# claiming a win.
#
# WHERE YOU USE IT
# Put an interval on every headline number and only call a difference real if
# the intervals (or a paired test) separate.
#
# RUN IT:  python 06_eval-5.py
#

import numpy as np

def wilson(successes, n, z=1.96):
    p = successes / n
    centre = (p + z * z / (2 * n)) / (1 + z * z / n)
    half = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return centre - half, centre + half

for caught, total in [(25, 29), (27, 29), (250, 290), (2500, 2900)]:
    lo, hi = wilson(caught, total)
    print(f"{caught}/{total}: recall {caught / total:.2f}, 95% interval {lo:.2f} - {hi:.2f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 25/29: recall 0.86, 95% interval 0.69 - 0.95
# 27/29: recall 0.93, 95% interval 0.78 - 0.98
# 250/290: recall 0.86, 95% interval 0.82 - 0.90
# 2500/2900: recall 0.86, 95% interval 0.85 - 0.87
