# -*- coding: utf-8 -*-
# ==========================================================================
# Fitting a line: least squares [maths-ai / Putting it together: networks]
# ==========================================================================
# WHAT IT IS
# Given many noisy points, which line is best? Measure each point's vertical
# distance to the line (the residual), square them, and average: the mean
# squared error. The best line has the smallest MSE, and for one feature it
# has a closed form: slope = cov(x, y) / var(x). Gradient descent finds the
# same line by taking steps.
#
# WHERE YOU USE IT
# Linear regression is the baseline for every prediction problem, and its loss
# surface is the friendliest bowl in ML.
#
# RUN IT:  python 03_nn-2.py
#

xs = [1, 2, 3, 4, 5, 6, 7, 8, 9]
ys = [2, 2.6, 4.2, 4.0, 6, 6.2, 8.4, 8, 10.5]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
b = my - w * mx
print(round(w, 3), round(b, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.013 0.7
