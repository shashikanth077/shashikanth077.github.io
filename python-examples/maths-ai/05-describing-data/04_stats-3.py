# -*- coding: utf-8 -*-
# ==========================================================================
# Covariance and correlation [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# Covariance asks whether two features move together: positive when both rise
# together, negative when one rises as the other falls. Correlation rescales
# it to a number between −1 and +1 so it can be compared: r = cov(x, y) / (σₓ
# σᵧ). Correlation measures a straight-line relationship — it is not proof of
# cause.
#
# WHERE YOU USE IT
# Highly correlated features are redundant; the covariance matrix drives PCA
# and Gaussian models.
#
# RUN IT:  python 04_stats-3.py
#

x = [1, 2, 3, 4, 5]
y = [2, 4, 5, 4, 5]
mx, my = sum(x) / 5, sum(y) / 5
cov = sum((a - mx) * (b - my) for a, b in zip(x, y)) / 5
sx = (sum((a - mx) ** 2 for a in x) / 5) ** 0.5
sy = (sum((b - my) ** 2 for b in y) / 5) ** 0.5
print(round(cov, 2), round(cov / (sx * sy), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.2 0.775
