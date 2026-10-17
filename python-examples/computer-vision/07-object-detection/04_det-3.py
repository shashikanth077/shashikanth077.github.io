# -*- coding: utf-8 -*-
# ==========================================================================
# Anchors and grid predictions [computer-vision / Object detection]
# ==========================================================================
# WHAT IT IS
# One-stage detectors divide the image into a grid and let every cell predict
# boxes. Anchor boxes are predefined shapes (a few widths and heights) placed
# at every cell; the network predicts offsets from an anchor: tₓ = (x −
# xₐ)/wₐ, t_w = ln(w / wₐ). A 13 × 13 grid with 3 anchors produces 13 × 13 × 3
# = 507 candidate boxes, each with 4 offsets, an objectness score and C class
# scores: for C = 20 classes the output tensor has 13 × 13 × 3 × (5 + 20) =
# 12,675 numbers. Most candidates are background, which is why focal loss and
# hard-negative mining are used in training.
#
# WHERE YOU USE IT
# Anchor-free detectors (FCOS, CenterNet, YOLOv8) predict points or centres
# directly and drop the anchor design.
#
# RUN IT:  python 04_det-3.py
#

grid, anchors, classes = 13, 3, 20
print(grid * grid * anchors, grid * grid * anchors * (5 + classes))
xa, wa, x, w = 50.0, 40.0, 58.0, 60.0
print((x - xa) / wa, round(__import__("math").log(w / wa), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 507 12675
# 0.2 0.405
