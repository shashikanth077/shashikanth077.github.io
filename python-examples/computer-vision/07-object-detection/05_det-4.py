# -*- coding: utf-8 -*-
# ==========================================================================
# Average precision and mAP [computer-vision / Object detection]
# ==========================================================================
# WHAT IT IS
# Detection quality needs precision and recall together. Rank all detections
# of a class by score, mark each as true positive (IoU ≥ 0.5 with an unmatched
# ground truth) or false positive, and compute precision and recall down the
# list. With 4 ground-truth objects and the ranked outcomes TP, FP, TP, TP,
# FP: precision 1, 0.5, 0.667, 0.75, 0.6; recall 0.25, 0.25, 0.5, 0.75, 0.75.
# Average precision is the area under the precision–recall curve (with the
# precision envelope): 0.25 × 1 + 0.25 × 0.75 + 0.25 × 0.75 = 0.625. mAP is
# the mean AP over classes (and, in COCO, over IoU thresholds 0.5–0.95).
#
# WHERE YOU USE IT
# Always state the IoU threshold: mAP@0.5 is far easier than mAP@[0.5:0.95].
#
# RUN IT:  python 05_det-4.py
#

import numpy as np

tp = np.array([1, 0, 1, 1, 0])
ctp = np.cumsum(tp)
precision = ctp / np.arange(1, 6)
recall = ctp / 4
envelope = np.maximum.accumulate(precision[::-1])[::-1]
ap, prev = 0.0, 0.0
for r, p in zip(recall, envelope):
    if r > prev:
        ap += (r - prev) * p
        prev = r
print(precision.round(3).tolist(), recall.tolist(), round(ap, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.0, 0.5, 0.667, 0.75, 0.6] [0.25, 0.25, 0.5, 0.75, 0.75] 0.625
