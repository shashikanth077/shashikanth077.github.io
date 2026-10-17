# -*- coding: utf-8 -*-
# ==========================================================================
# Comparing candidate splits: Gini and gain side by side [machine-learning /
# Decision trees and ensembles]
# ==========================================================================
# WHAT IT IS
# To choose a root, calculate every candidate split and pick the best.
# Candidate A, "links ≤ 2.5": children 4 Normal and 4 Spam, both pure:
# weighted Gini 0 (reduction 0.5), gain 1 bit. Candidate B, "offer present":
# two children each 3-to-1: Gini 0.375 each (reduction 0.125), gain 0.1887
# bits. A wins under both criteria. Note: the best root is the best split at
# that step, not automatically the most causally important feature.
#
# WHERE YOU USE IT
# Child weights use row counts, not the number of features. Do not assume Gini
# and entropy agree on every dataset; calculate.
#
# RUN IT:  python 04_tree-3.py
#

import numpy as np

def H(p):
    p = np.array([v for v in p if v > 0])
    return float((p * np.log2(1 / p)).sum())

parent = H([0.5, 0.5])
gain_a = parent - (0.5 * H([1.0]) + 0.5 * H([1.0]))
gain_b = parent - (0.5 * H([0.75, 0.25]) + 0.5 * H([0.75, 0.25]))
print(round(parent, 4), round(gain_a, 4), round(gain_b, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 1.0 0.1887
