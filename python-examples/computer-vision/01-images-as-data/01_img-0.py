# -*- coding: utf-8 -*-
# ==========================================================================
# What computer vision is [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# Computer vision extracts meaning from images and video: what is in the
# picture (classification), where it is (detection), which pixels belong to it
# (segmentation), how far away it is (depth), how it moves (tracking, optical
# flow) and how to create images (generation). Classical methods use
# hand-designed steps — filters, edges, features — grounded in geometry and
# physics; modern ones learn the steps from data with deep networks. The two
# are complementary: pre-processing, geometry and evaluation still rely on
# classical ideas.
#
# WHERE YOU USE IT
# Most production systems mix both: classical code for cameras, calibration
# and post-processing, neural networks for recognition.
#
# RUN IT:  python 01_img-0.py
#

tasks = {
    "classification": "is this a defect?",
    "detection": "where are the cars?",
    "segmentation": "which pixels are road?",
    "depth": "how far is the obstacle?",
    "tracking": "follow a player across frames",
}
for k, v in tasks.items():
    print(f"{k:15s} {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# classification  is this a defect?
# detection       where are the cars?
# segmentation    which pixels are road?
# depth           how far is the obstacle?
# tracking        follow a player across frames
