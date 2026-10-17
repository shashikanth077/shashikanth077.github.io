# -*- coding: utf-8 -*-
# ==========================================================================
# Logistic regression: score → probability [machine-learning / Probability,
# neighbours and margins]
# ==========================================================================
# WHAT IT IS
# Logistic regression computes a linear score z = w·x + b and turns it into a
# probability with the sigmoid p = 1 / (1 + e⁻ᶻ). If the weight on the word
# "refund" is 2 and the bias −1, a message containing "refund" has z = −1 + 2
# = 1 and p = σ(1) ≈ 0.731. The decision boundary (p = 0.5) is where z = 0,
# i.e. x = −b/w. Drag w and b: w sets how sharp the transition is, b slides
# the whole curve.
#
# WHERE YOU USE IT
# A strong baseline for text and tabular data. These weights are illustrative;
# a real model learns them by minimising log loss.
#
# RUN IT:  python 09_classic-8.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
z = -1 + 2 * 1
print(z, round(float(sigmoid(z)), 3))
print(round(float(sigmoid(0)), 3), round(float(sigmoid(-4)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.731
# 0.5 0.018
