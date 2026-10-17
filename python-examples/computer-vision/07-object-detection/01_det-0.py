# -*- coding: utf-8 -*-
# ==========================================================================
# Object detection: boxes and labels [computer-vision / Object detection]
# ==========================================================================
# WHAT IT IS
# Detection answers "what and where": for every object the model outputs a
# bounding box (x₁, y₁, x₂, y₂ or centre, width, height), a class and a
# confidence score — and how many objects there are is unknown in advance. Two
# families: two-stage detectors (R-CNN, Faster R-CNN) first propose regions,
# then classify and refine them — accurate; one-stage detectors (YOLO, SSD,
# RetinaNet) predict boxes and classes directly on a grid — fast. Newer
# transformer detectors (DETR) predict a set of objects with no anchor boxes.
#
# WHERE YOU USE IT
# Choose by latency and accuracy needs: real-time video favours one-stage
# detectors.
#
# RUN IT:  python 01_det-0.py
#

detections = [
    {"box": (12, 20, 90, 140), "label": "person", "score": 0.93},
    {"box": (100, 60, 180, 130), "label": "dog", "score": 0.81},
]
for d in detections:
    x1, y1, x2, y2 = d["box"]
    print(d["label"], d["score"], "width", x2 - x1, "height", y2 - y1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# person 0.93 width 78 height 120
# dog 0.81 width 80 height 70
