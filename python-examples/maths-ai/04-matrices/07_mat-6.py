# -*- coding: utf-8 -*-
# ==========================================================================
# Eigenvectors and eigenvalues [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# Most vectors change direction when a matrix acts on them. An eigenvector is
# special: the matrix only stretches it, A v = λ v, and the stretch factor λ
# is the eigenvalue. For A = [[2, 1], [1, 2]] the direction (1, 1) is
# stretched ×3 and (1, −1) ×1.
#
# WHERE YOU USE IT
# PCA directions are eigenvectors of the covariance matrix; their eigenvalues
# say how much variance each carries.
#
# RUN IT:  python 07_mat-6.py
#

A = [[2, 1], [1, 2]]
v = [1, 1]
Av = [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]]
print(Av)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3, 3]
