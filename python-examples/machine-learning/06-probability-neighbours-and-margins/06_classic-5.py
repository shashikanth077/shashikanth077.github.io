# -*- coding: utf-8 -*-
# ==========================================================================
# SVM: the widest-margin boundary [machine-learning / Probability, neighbours
# and margins]
# ==========================================================================
# WHAT IT IS
# A linear SVM separates classes with a line (plane, hyperplane) chosen to
# have the widest margin. With Normal points (1,1), (2,2) and Spam points
# (4,4), (5,5) the line x + y = 6 works: f(x) = w·x + b with w = (0.5, 0.5), b
# = −3. f > 0 means Spam, f &lt; 0 Normal. The closest points, (2,2) with f =
# −1 and (4,4) with f = +1, are the support vectors; each is 1/‖w‖ = 1.414
# from the line, so the margin is 2/‖w‖ = 2.828. Move Q: Q = (4,3) scores 0.5
# → Spam at distance 0.707. A score is not a probability.
#
# WHERE YOU USE IT
# Only the support vectors fix the boundary. Calibrate separately if you need
# probabilities.
#
# RUN IT:  python 06_classic-5.py
#

import numpy as np

w, b = np.array([0.5, 0.5]), -3
f = lambda x: float(w @ np.array(x) + b)
print(f((2, 2)), f((4, 4)), round(float(np.linalg.norm(w)), 4))
print(round(1 / float(np.linalg.norm(w)), 3), round(2 / float(np.linalg.norm(w)), 3))
print(f((4, 3)), round(f((4, 3)) / float(np.linalg.norm(w)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -1.0 1.0 0.7071
# 1.414 2.828
# 0.5 0.707
