# -*- coding: utf-8 -*-
# ==========================================================================
# Template matching and normalised cross-correlation [computer-vision /
# Features and matching]
# ==========================================================================
# WHAT IT IS
# To find a known small image (the template) inside a larger one, slide it
# over every position and measure the similarity. Raw correlation is fooled by
# brightness, so use normalised cross-correlation: subtract each patch's mean,
# divide by its norm, take the dot product; the result lies in [−1, 1] and
# ignores brightness and contrast changes. A patch (2, 4, 6) matches the
# template (1, 2, 3) perfectly: NCC = 1.0. It is simple and exact for fixed
# appearance, but fails under rotation, scale change or occlusion.
#
# WHERE YOU USE IT
# Good for UI testing and fixed-camera inspection; use features or learning
# for general objects.
#
# RUN IT:  python 02_feat-1.py
#

import numpy as np

def ncc(a, b):
    a, b = a - a.mean(), b - b.mean()
    return float((a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum()))

t = np.array([1.0, 2.0, 3.0])
print(round(ncc(t, 2 * t), 3), round(ncc(t, t[::-1]), 3), round(ncc(t, t + 50), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 -1.0 1.0
