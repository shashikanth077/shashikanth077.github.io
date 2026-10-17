# -*- coding: utf-8 -*-
# ==========================================================================
# Cosine similarity: direction, not size [machine-learning / Distance and
# similarity]
# ==========================================================================
# WHAT IT IS
# cos(x, y) = (x · y) / (‖x‖ ‖y‖) compares the DIRECTION of two vectors and
# ignores their length. For x = (1, 0) and y = (0.8, 0.6) both have length 1,
# so the cosine is 1×0.8 + 0×0.6 = 0.8 and the cosine distance (1 − cos) is
# 0.2. Doubling a vector does not change it. It is ideal for text vectors,
# where a long document and a short one on the same topic point the same way.
# Drag the angle and length of the second vector.
#
# WHERE YOU USE IT
# A zero vector has no direction and must be handled separately. Similar
# direction does not guarantee the same meaning: "not" can flip a message.
#
# RUN IT:  python 03_distance-2.py
#

import numpy as np

x, y = np.array([1.0, 0.0]), np.array([0.8, 0.6])
cos = float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))
print(round(cos, 3), round(1 - cos, 3))
y2 = 3 * y
print(round(float(x @ y2 / (np.linalg.norm(x) * np.linalg.norm(y2))), 3), round(float(np.linalg.norm(x - y2)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8 0.2
# 0.8 2.28
