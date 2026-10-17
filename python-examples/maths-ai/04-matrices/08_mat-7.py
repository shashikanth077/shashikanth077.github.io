# -*- coding: utf-8 -*-
# ==========================================================================
# Hyperplanes and decision boundaries [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# In 2D the set of points with w₁x + w₂y + b = 0 is a line; in 3D a plane; in
# n dimensions a hyperplane. The weight vector (w₁, w₂) is perpendicular to
# it. Plug a point in: positive means one side, negative the other. That sign
# is a linear classifier.
#
# WHERE YOU USE IT
# A single neuron with a threshold, logistic regression and a linear SVM all
# draw a hyperplane through feature space.
#
# RUN IT:  python 08_mat-7.py
#

w, b = [1, 1], -2
for p in [(2, 2), (-1, 0)]:
    z = w[0] * p[0] + w[1] * p[1] + b
    print(p, z, "class 1" if z > 0 else "class 0")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2, 2) 2 class 1
# (-1, 0) -3 class 0
