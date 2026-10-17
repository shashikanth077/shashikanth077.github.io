# -*- coding: utf-8 -*-
# ==========================================================================
# k-nearest neighbours [maths-ai / Maths inside ML algorithms]
# ==========================================================================
# WHAT IT IS
# To classify a new point, find its k closest training points (by distance)
# and let them vote. No training at all — the data is the model. It works well
# in low dimensions and breaks down when features are on different scales or
# there are too many of them, which is why scaling matters.
#
# WHERE YOU USE IT
# Retrieval and embedding search ("find the most similar items") are
# nearest-neighbour search at scale.
#
# RUN IT:  python 01_ml-0.py
#

import math
data = [((1, 1), "A"), ((2, 1.5), "A"), ((1.5, 2.5), "A"), ((4, 4), "B"), ((4.5, 3), "B"), ((3.5, 4.5), "B")]
q = (2.5, 2.0)
nearest = sorted(data, key=lambda item: math.dist(q, item[0]))[:3]
labels = [label for _, label in nearest]
print(labels, max(set(labels), key=labels.count))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['A', 'A', 'A'] A
