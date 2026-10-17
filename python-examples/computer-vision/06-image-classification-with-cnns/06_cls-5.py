# -*- coding: utf-8 -*-
# ==========================================================================
# Looking inside a classifier: saliency and Grad-CAM [computer-vision / Image
# classification with CNNs]
# ==========================================================================
# WHAT IT IS
# Why did the network say "dog"? Saliency maps use the gradient of the class
# score with respect to the pixels: large magnitudes mark pixels that matter.
# Grad-CAM weights the last convolutional feature maps by the average gradient
# of the class score: heat = ReLU(Σ_k α_k A_k) with α_k = mean of ∂score/∂A_k.
# If map A₁ = [[1, 0], [0, 1]] has α = 2 and A₂ = [[0, 1], [1, 0]] has α = −1,
# the heat map is ReLU(2A₁ − A₂) = [[2, 0], [0, 2]]. Overlaying it on the
# image shows where the model looked — and exposes shortcuts, such as a
# classifier that looks at the background or a watermark.
#
# WHERE YOU USE IT
# Explanations are diagnostics, not proof: confirm with controlled tests
# (remove the region, see if the prediction changes).
#
# RUN IT:  python 06_cls-5.py
#

import numpy as np

A = np.array([[[1, 0], [0, 1]], [[0, 1], [1, 0]]], float)
alpha = np.array([2.0, -1.0])
heat = np.maximum((alpha[:, None, None] * A).sum(axis=0), 0)
print(heat.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[2.0, 0.0], [0.0, 2.0]]
