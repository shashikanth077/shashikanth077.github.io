# -*- coding: utf-8 -*-
# ==========================================================================
# A neural-network layer is a matrix multiply [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# A dense layer computes Z = XW + b: X holds one example per row, W holds one
# column of weights per neuron, and the bias is added to every row. With 3
# examples, 2 features and 2 neurons, X is (3 × 2), W is (2 × 2), and Z is (3
# × 2): every neuron's output for every example at once.
#
# WHERE YOU USE IT
# This is the forward pass of a dense layer — the single most common operation
# in deep learning.
#
# RUN IT:  python 02_mat-1.py
#

X = [[2, 3], [1, 0], [4, 1]]
W = [[1, 2], [3, -1]]
b = [0.5, -1]
Z = [[sum(x * w for x, w in zip(row, col)) + bj for col, bj in zip(zip(*W), b)] for row in X]
print(Z)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[11.5, 0], [1.5, 1], [7.5, 6]]
