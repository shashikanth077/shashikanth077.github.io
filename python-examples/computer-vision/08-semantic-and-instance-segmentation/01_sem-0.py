# -*- coding: utf-8 -*-
# ==========================================================================
# Semantic, instance and panoptic segmentation [computer-vision / Semantic and
# instance segmentation]
# ==========================================================================
# WHAT IT IS
# Segmentation labels pixels. Semantic segmentation gives every pixel a class
# (road, car, sky) but does not separate individual objects: two touching cars
# share one "car" region. Instance segmentation finds each object separately
# with its own mask (car 1, car 2). Panoptic segmentation combines both:
# countable "things" get instance masks, amorphous "stuff" (road, sky) gets a
# class region. Typical models: FCN and U-Net (semantic), Mask R-CNN
# (instance), Mask2Former (all three).
#
# WHERE YOU USE IT
# Pick the lightest form that answers the question: counting cars needs
# instances, estimating road area needs only semantic.
#
# RUN IT:  python 01_sem-0.py
#

import numpy as np

semantic = np.array([[0, 1, 1, 0, 1, 1]])
instance = np.array([[0, 1, 1, 0, 2, 2]])
print(sorted(set(semantic.ravel().tolist())), sorted(set(instance.ravel().tolist())))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 1] [0, 1, 2]
