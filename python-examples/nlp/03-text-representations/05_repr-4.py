# -*- coding: utf-8 -*-
# ==========================================================================
# Analogies in embedding space [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# Because directions in the space capture relations, vector arithmetic can
# express analogies: king − man + woman ≈ queen. Toy 2-D vectors (royalty,
# maleness): king = (0.9, 0.8), man = (0.1, 0.8), woman = (0.1, 0.2) → king −
# man + woman = (0.9, 0.2), exactly the vector chosen for queen. In real
# embeddings this works only roughly, the answer must exclude the query words,
# and it also reproduces biases present in the training text.
#
# WHERE YOU USE IT
# Treat analogies as a probe, not a guarantee; audit embeddings for gender and
# other social bias before using them.
#
# RUN IT:  python 05_repr-4.py
#

import numpy as np

E = {"king": [0.9, 0.8], "queen": [0.9, 0.2], "man": [0.1, 0.8], "woman": [0.1, 0.2], "apple": [-0.5, 0.0]}
E = {w: np.array(v) for w, v in E.items()}
v = E["king"] - E["man"] + E["woman"]
dist = {w: round(float(np.linalg.norm(v - e)), 3) for w, e in E.items() if w not in ("king", "man", "woman")}
print(v.tolist(), min(dist, key=dist.get), dist)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.9, 0.2] queen {'queen': 0.0, 'apple': 1.414}
