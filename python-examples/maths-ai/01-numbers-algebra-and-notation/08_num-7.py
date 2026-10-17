# -*- coding: utf-8 -*-
# ==========================================================================
# Function composition: chains of functions [maths-ai / Numbers, algebra and
# notation]
# ==========================================================================
# WHAT IT IS
# Composition feeds one function's output into the next: f(g(x)). If u = 3x +
# 1 and y = u², then y = (3x + 1)². A neural network is a long chain — layer
# after layer — and the chain rule later tells you how a change at the start
# ripples to the end.
#
# WHERE YOU USE IT
# Input → layer 1 → layer 2 → … → loss is one composed function.
# Backpropagation is the chain rule applied to it.
#
# RUN IT:  python 08_num-7.py
#

def u(x):
    return 3 * x + 1

def y(u_value):
    return u_value ** 2

x = 3
print(u(x), y(u(x)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 100
