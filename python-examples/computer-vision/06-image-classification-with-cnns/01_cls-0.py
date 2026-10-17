# -*- coding: utf-8 -*-
# ==========================================================================
# Image classification: from pixels to a label [computer-vision / Image
# classification with CNNs]
# ==========================================================================
# WHAT IT IS
# A classifier maps an image to one of C classes. The deep-learning pipeline:
# resize and normalise the image, pass it through convolutional layers that
# build increasingly abstract features (edges → textures → parts → objects),
# flatten or globally pool, and finish with a softmax that gives C
# probabilities. Trained with cross-entropy on labelled images (ImageNet: 1.28
# million images, 1,000 classes). The reported measures are top-1 accuracy
# (the highest-probability class is right) and top-5 accuracy (the right class
# is among the five highest).
#
# WHERE YOU USE IT
# Always evaluate on images collected like the deployment images: lighting,
# camera and background shift hurt more than model choice.
#
# RUN IT:  python 01_cls-0.py
#

import numpy as np

probs = np.array([[0.1, 0.6, 0.2, 0.05, 0.05], [0.3, 0.1, 0.25, 0.2, 0.15], [0.05, 0.05, 0.1, 0.7, 0.1]])
y = np.array([1, 2, 0])
order = np.argsort(-probs, axis=1)
print(float((order[:, 0] == y).mean()), float(np.mean([y[i] in order[i, :2] for i in range(3)])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.3333333333333333 0.6666666666666666
