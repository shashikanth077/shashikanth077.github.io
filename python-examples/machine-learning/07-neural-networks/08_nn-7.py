# -*- coding: utf-8 -*-
# ==========================================================================
# PNN: classify by local class density (extension) [machine-learning / Neural
# networks]
# ==========================================================================
# WHAT IT IS
# A probabilistic neural network is not trained by backpropagation. It stores
# the labelled examples and estimates each class's density by adding a
# Gaussian bump around every example; the class with the higher
# (prior-weighted) density wins. In a 1D illustration with σ = 1, a Normal
# example at 0, a Spam example at 3 and query x = 1: the unnormalised
# similarities are e⁻⁰·⁵ ≈ 0.6065 and e⁻² ≈ 0.1353, so Normal gets
# 0.6065/(0.6065 + 0.1353) ≈ 0.8176. The bandwidth σ sets the smoothness;
# priors and per-class normalisation must be handled deliberately.
#
# WHERE YOU USE IT
# A PNN is a kernel-density classifier, closer to kNN or Naive Bayes in spirit
# than to an MLP.
#
# RUN IT:  python 08_nn-7.py
#

import numpy as np

x = 1.0
normal, spam = np.exp(-0.5 * (x - 0) ** 2), np.exp(-0.5 * (x - 3) ** 2)
print(round(float(normal), 4), round(float(spam), 4), round(float(normal / (normal + spam)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.6065 0.1353 0.8176
