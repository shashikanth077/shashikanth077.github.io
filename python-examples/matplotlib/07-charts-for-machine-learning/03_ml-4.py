# -*- coding: utf-8 -*-
# ==========================================================================
# Learning rate and the loss curve [matplotlib / Charts for machine learning]
# ==========================================================================
# WHAT IT IS
# Gradient descent repeats w = w − lr · gradient. For the loss w² each step
# multiplies w by 1 − 2·lr, so the loss is shrunk by that factor squared.
# Small lr: slow steady fall. Good lr: quick fall. lr = 1: bounces forever. lr
# > 1: grows — it diverges. Drag the learning rate and watch the curve.
#
# WHERE YOU USE IT
# A loss curve that explodes or stays flat is usually the learning rate. Plot
# it every time you train.
#
# RUN IT:  python 03_ml-4.py
#

for lr in (0.1, 0.5, 1.1):
    w = 2.0
    losses = []
    for step in range(5):
        losses.append(round(w * w, 3))
        w -= lr * 2 * w
    print(lr, losses)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.1 [4.0, 2.56, 1.638, 1.049, 0.671]
# 0.5 [4.0, 0.0, 0.0, 0.0, 0.0]
# 1.1 [4.0, 5.76, 8.294, 11.944, 17.199]
