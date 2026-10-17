# -*- coding: utf-8 -*-
# ==========================================================================
# Tracking: association and the Kalman filter [computer-vision / Motion, video
# and tracking]
# ==========================================================================
# WHAT IT IS
# Tracking links detections across frames to give each object a persistent
# identity. Typical recipe (tracking-by-detection): predict where each track
# should be now (constant-velocity motion model), associate predictions with
# new detections (highest IoU, solved with the Hungarian algorithm), update
# the matched tracks, start tracks for unmatched detections and delete tracks
# that stay unmatched. A one-dimensional Kalman filter blends prediction and
# measurement: position 10, velocity 2 → predicted 12; the detector says 13;
# with gain K = 0.5 the new estimate is 12 + 0.5 × (13 − 12) = 12.5.
# Re-identification features help when objects cross or leave and return.
#
# WHERE YOU USE IT
# Tracker quality depends on detector quality: most identity switches begin
# with a missed or merged detection.
#
# RUN IT:  python 03_video-2.py
#

import numpy as np

x, v, z, K = 10.0, 2.0, 13.0, 0.5
pred = x + v
est = pred + K * (z - pred)
print(pred, est)
def iou(a, b):
    ix = max(0, min(a[2], b[2]) - max(a[0], b[0])); iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    i = ix * iy
    return i / ((a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - i)
tracks = [(0, 0, 10, 10), (50, 50, 60, 60)]
dets = [(52, 51, 62, 61), (1, 1, 11, 11)]
print([max(range(2), key=lambda j: iou(t, dets[j])) for t in tracks])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12.0 12.5
# [1, 0]
