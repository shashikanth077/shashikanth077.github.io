# -*- coding: utf-8 -*-
# ==========================================================================
# Loading CSV data [numpy / Missing data, randomness and files]
# ==========================================================================
# WHAT IT IS
# np.loadtxt("file.csv", delimiter=",", skiprows=1) reads a purely numeric CSV
# into a 2D array (skip a header row with skiprows). Slice columns to split
# features from the label. np.genfromtxt is more forgiving: it turns empty
# cells into NaN. For mixed text and numbers use pandas.
#
# WHERE YOU USE IT
# A numeric CSV becomes the feature matrix X and target y in three lines.
#
# RUN IT:  python 06_data-5.py
#

import numpy as np

with open("data.csv", "w") as f:
    f.write("hours,score\n5,80\n2,55\n8,92\n")
data = np.loadtxt("data.csv", delimiter=",", skiprows=1)
print(data)
X, y = data[:, 0], data[:, 1]
print(X, y)
with open("gaps.csv", "w") as f:
    f.write("1,2\n3,\n5,6\n")
print(np.genfromtxt("gaps.csv", delimiter=","))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[ 5. 80.]
#  [ 2. 55.]
#  [ 8. 92.]]
# [5. 2. 8.] [80. 55. 92.]
# [[ 1.  2.]
#  [ 3. nan]
#  [ 5.  6.]]
