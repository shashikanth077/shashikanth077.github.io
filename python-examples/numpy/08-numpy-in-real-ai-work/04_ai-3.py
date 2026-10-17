# -*- coding: utf-8 -*-
# ==========================================================================
# A weighted score with @ (mini project) [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# Put the pieces together. Rows are students; columns are study hours,
# practice tests and attendance. Scale each column to 0–1, then take a
# weighted sum with @: hours 40%, tests 40%, attendance 20%. argmax finds the
# best student; a comparison turns scores into a yes/no. This is a hand-made
# rule for learning NumPy — not a trained model.
#
# WHERE YOU USE IT
# It is the skeleton of a real model: features → scaling → weights → score →
# decision. Training would LEARN the weights.
#
# RUN IT:  python 04_ai-3.py
#

import numpy as np

# rows = students; columns = [study_hours, practice_tests, attendance_%]
X = np.array([
    [2, 1, 60],
    [4, 3, 80],
    [6, 4, 90],
    [3, 2, 70],
    [8, 5, 95],
], dtype=float)

print("shape:", X.shape)
print("means:", X.mean(axis=0))
mins, maxs = X.min(axis=0), X.max(axis=0)
X_scaled = (X - mins) / (maxs - mins)
weights = np.array([0.4, 0.4, 0.2])
scores = X_scaled @ weights
print("scores:", np.round(scores, 3))
print("best student row:", int(np.argmax(scores)))
print("high score:", scores >= 0.6)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# shape: (5, 3)
# means: [ 4.6  3.  79. ]
# scores: [0.    0.448 0.738 0.224 1.   ]
# best student row: 4
# high score: [False False  True False  True]
