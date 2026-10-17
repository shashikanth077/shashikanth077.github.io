# -*- coding: utf-8 -*-
# ==========================================================================
# Matching features: nearest neighbour and the ratio test [computer-vision /
# Features and matching]
# ==========================================================================
# WHAT IT IS
# To find the same point in two images, match each descriptor to its nearest
# neighbour in the other image by Euclidean (or Hamming) distance. Some
# matches are wrong because the feature is ambiguous. Lowe's ratio test keeps
# a match only if the best distance is clearly smaller than the second-best:
# d₁/d₂ < 0.75. d₁ = 0.3, d₂ = 0.9 → ratio 0.33: accept. d₁ = 0.6, d₂ = 0.7 →
# 0.86: reject (the second candidate is almost as good, so the choice is
# unreliable). Cross-checking (the match must be mutual) removes more errors.
#
# WHERE YOU USE IT
# After matching, still expect outliers: robust fitting (RANSAC) is the next
# step.
#
# RUN IT:  python 04_feat-3.py
#

import numpy as np

pairs = [(0.3, 0.9), (0.6, 0.7), (0.2, 0.25)]
for d1, d2 in pairs:
    print(d1, d2, round(d1 / d2, 2), "accept" if d1 / d2 < 0.75 else "reject")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.3 0.9 0.33 accept
# 0.6 0.7 0.86 reject
# 0.2 0.25 0.8 reject
