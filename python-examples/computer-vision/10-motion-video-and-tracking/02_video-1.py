# -*- coding: utf-8 -*-
# ==========================================================================
# Background subtraction and frame differencing [computer-vision / Motion,
# video and tracking]
# ==========================================================================
# WHAT IT IS
# With a fixed camera, moving objects are what changes. Frame differencing
# thresholds |frame_t − frame_{t−1}|; it finds edges of motion but misses slow
# or stopped objects. Background subtraction keeps a model of the empty scene
# — a running average B ← (1 − α)B + αI with a small α like 0.05 — and flags
# pixels where |I − B| exceeds a threshold. Static pixels at 100 with a moving
# object at 200: difference 100 → foreground. Shadows, lighting changes and
# swaying trees cause false foreground; Gaussian-mixture models and learned
# models handle them better.
#
# WHERE YOU USE IT
# Clean the mask with morphological opening, then label connected components
# to get moving objects.
#
# RUN IT:  python 02_video-1.py
#

import numpy as np

B = np.full(5, 100.0)
frames = [np.array([100, 100, 200, 100, 100.0])] * 3
for I in frames:
    mask = np.abs(I - B) > 30
    B = np.where(mask, B, 0.95 * B + 0.05 * I)
    print(mask.astype(int).tolist(), B.round(1).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 0, 1, 0, 0] [100.0, 100.0, 100.0, 100.0, 100.0]
# [0, 0, 1, 0, 0] [100.0, 100.0, 100.0, 100.0, 100.0]
# [0, 0, 1, 0, 0] [100.0, 100.0, 100.0, 100.0, 100.0]
