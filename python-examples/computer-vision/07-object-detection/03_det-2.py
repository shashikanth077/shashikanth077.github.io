# -*- coding: utf-8 -*-
# ==========================================================================
# Non-maximum suppression [computer-vision / Object detection]
# ==========================================================================
# WHAT IT IS
# Detectors fire several times around one object. NMS keeps the best box and
# deletes the near-duplicates: sort by score; take the top box; remove every
# remaining box of the same class whose IoU with it exceeds a threshold
# (typically 0.5); repeat. Boxes A = (0,0,10,10) score 0.9, B = (1,1,11,11)
# score 0.8, C = (20,20,30,30) score 0.7: IoU(A, B) = 81/119 = 0.68 > 0.5, so
# B is removed; C does not overlap and stays. Output: A and C. Too low a
# threshold deletes genuinely separate neighbouring objects (crowds); soft-NMS
# lowers scores instead of deleting.
#
# WHERE YOU USE IT
# Tune the threshold on your scene type: crowded scenes need a higher one.
#
# RUN IT:  python 03_det-2.py
#

import numpy as np

def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union if union else 0.0
boxes = [(0, 0, 10, 10), (1, 1, 11, 11), (20, 20, 30, 30)]
scores = [0.9, 0.8, 0.7]
order = np.argsort(scores)[::-1].tolist()
keep = []
while order:
    best = order.pop(0)
    keep.append(best)
    order = [i for i in order if iou(boxes[best], boxes[i]) <= 0.5]
print(keep, round(iou(boxes[0], boxes[1]), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 2] 0.681
