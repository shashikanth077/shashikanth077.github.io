# -*- coding: utf-8 -*-
# ==========================================================================
# Connected components and labelling [computer-vision / Segmentation by
# classical methods]
# ==========================================================================
# WHAT IT IS
# After thresholding, which foreground pixels belong to the same object?
# Connected-component labelling gives every group of touching foreground
# pixels its own number. Touching can mean 4-connected (up, down, left, right)
# or 8-connected (also diagonals): two pixels that meet only at a corner are
# separate objects under 4-connectivity but one object under 8-connectivity.
# Once labelled, each component can be measured: area (pixel count), bounding
# box, centroid. The usual algorithm is a flood fill or a two-pass union–find.
#
# WHERE YOU USE IT
# Pick the connectivity to match the object: 8-connectivity for thin lines, 4
# for blobs that should stay separate.
#
# RUN IT:  python 02_seg-1.py
#

import numpy as np

img = np.array([[1, 1, 0, 0, 0],
                [1, 0, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 1],
                [1, 0, 0, 1, 1]])

def label(img, diag):
    steps = [(-1, 0), (1, 0), (0, -1), (0, 1)] + ([(-1, -1), (-1, 1), (1, -1), (1, 1)] if diag else [])
    lab, n = np.zeros(img.shape, int), 0
    for r in range(img.shape[0]):
        for c in range(img.shape[1]):
            if img[r, c] and not lab[r, c]:
                n += 1
                stack = [(r, c)]
                while stack:
                    y, x = stack.pop()
                    if 0 <= y < img.shape[0] and 0 <= x < img.shape[1] and img[y, x] and not lab[y, x]:
                        lab[y, x] = n
                        stack += [(y + dy, x + dx) for dy, dx in steps]
    return n, lab

print(label(img, False)[0], label(img, True)[0])
print(label(img, True)[1].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 4
# [[1, 1, 0, 0, 0], [1, 0, 0, 2, 0], [0, 0, 2, 0, 0], [0, 0, 0, 0, 3], [4, 0, 0, 3, 3]]
