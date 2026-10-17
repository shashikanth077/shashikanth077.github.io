# -*- coding: utf-8 -*-
# ==========================================================================
# Training a detector: losses and imbalance [computer-vision / Object
# detection]
# ==========================================================================
# WHAT IT IS
# A detector optimises several losses together: a classification loss
# (cross-entropy per box), a box regression loss (smooth-L1 or IoU-based) on
# matched anchors, and an objectness loss. Each anchor is matched to a
# ground-truth box if IoU > 0.5, to background if < 0.4. Because almost all
# anchors are background (hundreds versus a handful), the classification loss
# is dominated by easy negatives. Focal loss multiplies cross-entropy by (1 −
# p)^γ so confident correct predictions contribute almost nothing: with γ = 2
# and p = 0.9 the loss shrinks by a factor 100; with p = 0.1 by 0.81.
#
# WHERE YOU USE IT
# Evaluate with the same NMS and score threshold you will use in deployment.
#
# RUN IT:  python 06_det-5.py
#

import numpy as np

for p in (0.9, 0.5, 0.1):
    ce = -np.log(p)
    fl = (1 - p) ** 2 * ce
    print(p, round(float(ce), 3), round(float(fl), 4), round((1 - p) ** 2, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.9 0.105 0.0011 0.01
# 0.5 0.693 0.1733 0.25
# 0.1 2.303 1.8651 0.81
