# -*- coding: utf-8 -*-
# ==========================================================================
# Saving and loading arrays [numpy / Missing data, randomness and files]
# ==========================================================================
# WHAT IT IS
# np.savetxt / np.loadtxt write and read CSV text (readable in Excel, but
# numbers come back as floats). np.save / np.load use the binary .npy format,
# which keeps dtype and shape exactly. np.savez bundles several arrays in one
# .npz archive. Keep allow_pickle=False (the default) when loading files you
# did not create.
#
# WHERE YOU USE IT
# Features, trained weights and intermediate results are saved as .npy/.npz;
# CSV is for sharing with humans.
#
# RUN IT:  python 05_data-4.py
#

import numpy as np

marks = np.array([[70, 80, 90], [60, 75, 85]])
np.savetxt("marks.csv", marks, delimiter=",", fmt="%d")
print(np.loadtxt("marks.csv", delimiter=","))
np.save("marks.npy", marks)
print(np.load("marks.npy").shape)
np.savez("experiment.npz", features=marks, labels=np.array([1, 0]))
with np.load("experiment.npz") as f:
    print(f["features"])
    print(f["labels"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[70. 80. 90.]
#  [60. 75. 85.]]
# (2, 3)
# [[70 80 90]
#  [60 75 85]]
# [1 0]
