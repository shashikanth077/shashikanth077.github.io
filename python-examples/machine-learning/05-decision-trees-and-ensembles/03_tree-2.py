# -*- coding: utf-8 -*-
# ==========================================================================
# Entropy and information gain [machine-learning / Decision trees and
# ensembles]
# ==========================================================================
# WHAT IT IS
# Another measure of mixing: H(node) = −Σ pᵢ log₂ pᵢ in bits. A 50/50 node has
# H = 1 bit (maximum uncertainty); a pure node has H = 0. Information gain =
# H(parent) − Σ (n_child/n_parent) H(child). The split "links ≤ 2.5" creates
# pure children, so the gain is the full 1 bit; "offer present" creates 3-to-1
# children with H ≈ 0.8113 bits, gain ≈ 0.1887. Drag p.
#
# WHERE YOU USE IT
# Gini and entropy usually pick the same split. The convention 0 · log 0 = 0
# makes a pure node contribute no uncertainty.
#
# RUN IT:  python 03_tree-2.py
#

import numpy as np

def entropy(p):
    p = np.array(p)
    p = p[p > 0]
    return float((p * np.log2(1 / p)).sum())

print(entropy([0.5, 0.5]), entropy([1.0]), round(entropy([0.75, 0.25]), 4))
print(round(1 - entropy([0.75, 0.25]), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.0 0.8113
# 0.1887
