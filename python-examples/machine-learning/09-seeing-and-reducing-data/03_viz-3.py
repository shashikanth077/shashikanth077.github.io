# -*- coding: utf-8 -*-
# ==========================================================================
# PCA geometry: the direction of most variance [machine-learning / Seeing and
# reducing data]
# ==========================================================================
# WHAT IT IS
# Projecting onto an axis keeps the variation along it and discards the
# variation across it. For the eight supermarket customers the points lie
# along a diagonal, so an axis near 45° keeps almost all the variance while
# the perpendicular axis keeps almost none. Projection example: after
# centring, a point x = (2, 2) on the unit direction u = (1/√2, 1/√2) projects
# to z = x·u = 4/√2 ≈ 2.828. Drag the angle of the axis.
#
# WHERE YOU USE IT
# Coordinates are linear mixtures, so a high-variance axis may be driven by
# one large-unit feature. Standardise first when features have different
# units.
#
# RUN IT:  python 03_viz-3.py
#

import numpy as np

x = np.array([2.0, 2.0])
u = np.array([1.0, 1.0]) / np.sqrt(2)
print(round(float(x @ u), 3), round(4 / float(np.sqrt(2)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.828 2.828
