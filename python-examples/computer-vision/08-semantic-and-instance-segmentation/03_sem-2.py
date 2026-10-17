# -*- coding: utf-8 -*-
# ==========================================================================
# Segmentation metrics: pixel accuracy, IoU and Dice [computer-vision /
# Semantic and instance segmentation]
# ==========================================================================
# WHAT IT IS
# Pixel accuracy is misleading: if 95% of pixels are background, predicting
# "background" everywhere scores 95%. Use overlap measures per class. IoU
# (Jaccard) = |A ∩ B| / |A ∪ B|; Dice (F1) = 2|A ∩ B| / (|A| + |B|).
# Prediction mask A has 4 pixels, ground truth B has 4, they share 2: IoU =
# 2/6 = 0.333, Dice = 4/8 = 0.5. Dice is always at least IoU (Dice = 2·IoU /
# (1 + IoU)). Report mean IoU over classes (mIoU) and look at each class: a
# rare class can be at zero while the mean looks fine.
#
# WHERE YOU USE IT
# Dice is also the loss in many medical segmentation networks because it
# handles class imbalance better than cross-entropy.
#
# RUN IT:  python 03_sem-2.py
#

import numpy as np

a = np.array([[1, 1, 0], [1, 1, 0], [0, 0, 0]])
b = np.array([[0, 1, 1], [0, 1, 1], [0, 0, 0]])
inter = int((a & b).sum())
print(inter, round(inter / (a.sum() + b.sum() - inter), 3), round(2 * inter / (a.sum() + b.sum()), 3))
print(float((np.zeros((10, 10)) == np.zeros((10, 10))).mean()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 0.333 0.5
# 1.0
