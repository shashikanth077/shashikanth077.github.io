# -*- coding: utf-8 -*-
# ==========================================================================
# A softmax classifier from scratch [neural-networks / MNIST and the full
# workflow]
# ==========================================================================
# WHAT IT IS
# A tiny "digit" experiment you can run anywhere: three 5×5 pixel patterns (a
# vertical bar, a horizontal bar, a plus) with random noise are flattened to
# 25 inputs and fed to ONE Dense(3) softmax layer trained with categorical
# cross-entropy and gradient descent. The gradient of cross-entropy with
# softmax is beautifully simple: p − y. The code trains on noisy copies,
# evaluates on fresh noisy copies and prints accuracy and the confusion matrix
# — the same loop Keras runs for MNIST, just smaller.
#
# WHERE YOU USE IT
# The 25-pixel patterns are synthetic and the accuracy reflects this toy task,
# not MNIST.
#
# RUN IT:  python 06_mnist-5.py
#

import numpy as np

rng = np.random.default_rng(0)
base = np.zeros((3, 5, 5))
base[0, :, 2] = 1
base[1, 2, :] = 1
base[2, :, 2] = 1
base[2, 2, :] = 1

def make(n):
    y = rng.integers(0, 3, n)
    x = base[y] + rng.normal(0, 0.35, (n, 5, 5))
    return x.reshape(n, -1), y

Xtr, ytr = make(300)
Xte, yte = make(200)
W, b = np.zeros((25, 3)), np.zeros(3)
Y = np.eye(3)[ytr]
for epoch in range(200):
    z = Xtr @ W + b
    p = np.exp(z - z.max(axis=1, keepdims=True))
    p /= p.sum(axis=1, keepdims=True)
    W -= 0.5 * Xtr.T @ (p - Y) / len(Xtr)
    b -= 0.5 * (p - Y).mean(axis=0)
pred = (Xte @ W + b).argmax(axis=1)
cm = np.zeros((3, 3), int)
for a, q in zip(yte, pred):
    cm[a, q] += 1
print(cm.tolist(), round(float((pred == yte).mean()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[66, 0, 0], [0, 73, 0], [0, 1, 60]] 0.995
