# -*- coding: utf-8 -*-
# ==========================================================================
# Partial derivatives and the gradient [maths-ai / Calculus: change and slope]
# ==========================================================================
# WHAT IT IS
# A model has many weights, so the loss depends on many inputs. A partial
# derivative ∂L/∂w asks: "turning only this knob, and freezing the rest, how
# fast does the loss change?" The gradient is the list of all of them. It
# points uphill; stepping the opposite way goes downhill.
#
# WHERE YOU USE IT
# Backpropagation computes a partial derivative for every weight; together
# they form the gradient the optimiser follows.
#
# RUN IT:  python 07_calc-6.py
#

w, b = 3, 1
loss = w**2 + b**2
grad = [2 * w, 2 * b]
print(loss, grad)
print([round(v - 0.1 * g, 2) for v, g in zip([w, b], grad)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 [6, 2]
# [2.4, 0.8]
