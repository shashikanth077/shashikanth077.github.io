# -*- coding: utf-8 -*-
# ==========================================================================
# Sigmoid: any score to a number between 0 and 1 [neural-networks / Activation
# functions]
# ==========================================================================
# WHAT IT IS
# σ(z) = 1 / (1 + e⁻ᶻ). Calculate it in small steps: negate z, exponentiate,
# add 1, take the reciprocal. For z = 1.5: −z = −1.5, e⁻¹·⁵ = 0.2231, 1 +
# 0.2231 = 1.2231, 1/1.2231 = 0.8176. At z = 0, e⁰ = 1 so σ = 1/2 = 0.5; for
# very positive z the denominator approaches 1 (σ → 1); for very negative z it
# explodes (σ → 0). Drag z.
#
# WHERE YOU USE IT
# Used as the output of a binary classifier. A sigmoid output is
# probability-like, but it is not automatically calibrated, and its slope is
# tiny for large |z|, which slows learning in deep hidden layers.
#
# RUN IT:  python 02_act-1.py
#

import numpy as np

z = 1.5
neg = np.exp(-z)
den = 1 + neg
print(round(float(neg), 4), round(float(den), 4), round(float(1 / den), 4))
print(1 / (1 + np.exp(0)), round(float(1 / (1 + np.exp(-8))), 4), round(float(1 / (1 + np.exp(8))), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2231 1.2231 0.8176
# 0.5 0.9997 0.0003
