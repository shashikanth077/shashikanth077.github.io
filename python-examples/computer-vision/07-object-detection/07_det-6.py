# -*- coding: utf-8 -*-
# ==========================================================================
# Detection in practice: speed, size and small objects [computer-vision /
# Object detection]
# ==========================================================================
# WHAT IT IS
# Practical choices decide success. Resolution: small objects vanish after
# downsampling, so raise the input size or use feature pyramids that detect at
# several scales. Latency: measure frames per second on the real hardware;
# model size, input size and NMS all count. Data: label consistently
# (annotators disagree on box tightness), cover rare conditions (night, rain),
# and include background-only images to reduce false alarms. Thresholds:
# choose the score threshold from the cost of misses versus false alarms, not
# from the default 0.5.
#
# WHERE YOU USE IT
# A model's mAP on a benchmark does not predict its behaviour in your scene:
# build a small, honest test set from your own camera.
#
# RUN IT:  python 07_det-6.py
#

frame, object_px = 1920, 24
for size in (320, 640, 1280):
    print(size, round(object_px * size / frame, 1), "px wide after resizing")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 320 4.0 px wide after resizing
# 640 8.0 px wide after resizing
# 1280 16.0 px wide after resizing
