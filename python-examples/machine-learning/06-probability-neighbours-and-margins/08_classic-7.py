# -*- coding: utf-8 -*-
# ==========================================================================
# Kernels: curved boundaries from straight lines [machine-learning /
# Probability, neighbours and margins]
# ==========================================================================
# WHAT IT IS
# One class in a central disk and another in a surrounding ring cannot be
# split by a straight line in the original coordinates. Add the feature r² =
# x₁² + x₂²: (1, 0) gives 1 and (3, 0) gives 9, so one threshold on r²
# separates them. A kernel computes similarities in such an implied feature
# space without listing the new coordinates. The RBF kernel K(x, z) = exp(−γ‖x
# − z‖²): with ‖x − z‖² = 4 and γ = 0.5, K = e⁻² ≈ 0.1353. Large γ makes
# influence very local.
#
# WHERE YOU USE IT
# Tune C and γ together, after scaling. A kernel does not guarantee better
# accuracy and costs more to train than a linear model.
#
# RUN IT:  python 08_classic-7.py
#

import numpy as np

print(round(float(np.exp(-0.5 * 4)), 4))
print(1 ** 2 + 0 ** 2, 3 ** 2 + 0 ** 2)
for gamma in (0.1, 1, 10):
    print(gamma, round(float(np.exp(-gamma * 1.0)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.1353
# 1 9
# 0.1 0.9048
# 1 0.3679
# 10 0.0
