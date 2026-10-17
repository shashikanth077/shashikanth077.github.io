# -*- coding: utf-8 -*-
# ==========================================================================
# Intersection over union (IoU) [computer-vision / Object detection]
# ==========================================================================
# WHAT IT IS
# How well does a predicted box match the true one? IoU = area of intersection
# / area of union. Boxes (0, 0, 10, 10) and (5, 5, 15, 15): the overlap is a 5
# × 5 square (25), the union is 100 + 100 − 25 = 175, so IoU = 0.143.
# Identical boxes give 1, disjoint boxes 0. A detection usually counts as
# correct if IoU ≥ 0.5 with a ground-truth box of the same class (stricter:
# 0.75, or averaged over 0.5–0.95 as in COCO). IoU is also used to compare
# duplicate detections and to match tracks between frames.
#
# WHERE YOU USE IT
# IoU ignores where the boxes miss each other when they do not overlap;
# generalised IoU variants fix that for training losses.
#
# RUN IT:  python 02_det-1.py
#

import numpy as np

def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union else 0.0
print(round(iou((0, 0, 10, 10), (5, 5, 15, 15)), 3), iou((0, 0, 10, 10), (0, 0, 10, 10)), iou((0, 0, 10, 10), (20, 20, 30, 30)))
print(round(iou((0, 0, 10, 10), (1, 1, 11, 11)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.143 1.0 0.0
# 0.681
