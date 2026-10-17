# -*- coding: utf-8 -*-
# ==========================================================================
# Adam: direction memory plus adaptive scaling [neural-networks / Optimisers]
# ==========================================================================
# WHAT IT IS
# Adam combines momentum and RMSprop. It keeps m ← β₁m + (1 − β₁)g (average
# gradient) and v ← β₂v + (1 − β₂)g² (average squared gradient), corrects
# their start-up bias m̂ = m/(1 − β₁ᵗ), v̂ = v/(1 − β₂ᵗ), and updates w ← w −
# η m̂ / (√v̂ + ε). First step with g = 4, η = 0.1, m₀ = v₀ = 0: m = 0.4, v =
# 0.016, m̂ = 4, v̂ = 16, update = 0.1 × 4/√16 = 0.1. Typical defaults: β₁ =
# 0.9, β₂ = 0.999, ε = 10⁻⁸. Adam is a convenient default but not always the
# best.
#
# WHERE YOU USE IT
# Evaluate Adam against SGD with momentum on validation metrics; SGD can
# generalise better in some settings.
#
# RUN IT:  python 04_opt-3.py
#

import numpy as np

g, eta, b1, b2 = 4.0, 0.1, 0.9, 0.999
m = v = 0.0
for t in range(1, 4):
    m = b1 * m + (1 - b1) * g
    v = b2 * v + (1 - b2) * g * g
    m_hat, v_hat = m / (1 - b1 ** t), v / (1 - b2 ** t)
    print(t, round(m, 4), round(v, 4), round(m_hat, 3), round(v_hat, 3), round(float(eta * m_hat / (np.sqrt(v_hat) + 1e-8)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.4 0.016 4.0 16.0 0.1
# 2 0.76 0.032 4.0 16.0 0.1
# 3 1.084 0.048 4.0 16.0 0.1
