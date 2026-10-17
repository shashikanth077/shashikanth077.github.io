# -*- coding: utf-8 -*-
# ==========================================================================
# Drawing the model: weight tilts the line, bias lifts it [neural-networks /
# Gradient descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# Plot each record as a dot: distance along x, minutes up y. The model ŷ = wx
# + b is a straight line; the weight is its steepness and the bias moves it up
# and down. Worked example: x = 3 km, w = 1, b = 2 → ŷ = 3 × 1 + 2 = 5
# minutes, but the record says 11, so the model is wrong by 6. Drag w and b
# and watch the line chase the dots.
#
# WHERE YOU USE IT
# Training is exactly this fitting, done automatically: change w and b until
# the line passes close to the data.
#
# RUN IT:  python 02_learn-1.py
#

w, b, x, actual = 1.0, 2.0, 3, 11
pred = w * x + b
print(pred, actual - pred)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 6.0
