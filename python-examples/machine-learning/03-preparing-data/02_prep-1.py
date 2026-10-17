# -*- coding: utf-8 -*-
# ==========================================================================
# Encoding: label, ordinal and one-hot [machine-learning / Preparing data]
# ==========================================================================
# WHAT IT IS
# Names and ordered quantities are different. If you code Friend = 0, Shop =
# 1, Unknown = 2, a distance-based model thinks Friend is closer to Shop than
# to Unknown — an order you invented. One-hot encoding gives each category its
# own 0/1 column, so every pair is equally far apart. Use an ordinal code only
# for a genuinely ordered level (low, medium, high), remembering that equal
# gaps are an assumption. Target labels (Normal / Spam) may be coded 0/1;
# those numbers name classes and are not distances.
#
# WHERE YOU USE IT
# Fit the encoder on the training rows and decide what happens with an unseen
# category — ignore it (all zeros) or raise an error.
#
# RUN IT:  python 02_prep-1.py
#

import numpy as np

codes = {"Friend": 0, "Shop": 1, "Unknown": 2}
print(abs(codes["Friend"] - codes["Shop"]), abs(codes["Friend"] - codes["Unknown"]))
one_hot = np.eye(3)
d = lambda a, b: round(float(np.linalg.norm(one_hot[a] - one_hot[b])), 3)
print(d(0, 1), d(0, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 2
# 1.414 1.414
