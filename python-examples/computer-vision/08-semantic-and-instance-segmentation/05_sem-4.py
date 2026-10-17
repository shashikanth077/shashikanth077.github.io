# -*- coding: utf-8 -*-
# ==========================================================================
# Segment anything and foundation models [computer-vision / Semantic and
# instance segmentation]
# ==========================================================================
# WHAT IT IS
# Foundation models are trained on huge datasets and reused. Segment Anything
# (SAM) takes an image and a prompt — a click, a box or text — and returns
# masks for the indicated object without task-specific training.
# Vision–language models pair an image encoder with a text encoder, so you can
# describe what to find ("the red car on the left"). Practical use: speed up
# labelling (click, correct, accept), bootstrap a dataset, or run zero-shot
# where no labels exist. Still verify on your own images: accuracy varies by
# domain, and fine structures and unusual modalities (medical, thermal) can
# fail.
#
# WHERE YOU USE IT
# Treat foundation-model masks as proposals for a human to check when errors
# are costly.
#
# RUN IT:  python 05_sem-4.py
#

import numpy as np

mask = np.zeros((6, 6), int)
mask[1:4, 2:5] = 1
points = [(2, 3)]
print(int(mask.sum()), all(mask[r, c] for r, c in points))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 9 True
