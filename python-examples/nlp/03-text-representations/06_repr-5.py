# -*- coding: utf-8 -*-
# ==========================================================================
# Sentence and document vectors [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# To classify or compare a whole text you need one vector. The simplest recipe
# averages the word vectors, optionally weighted by idf: for "cat sat" with
# cat = (0.9, 0.8) and sat = (0.1, 0.4) the mean is (0.5, 0.6). Averaging
# ignores order and dilutes long texts. Better: sentence encoders (such as
# those built on transformers) give a single vector per sentence trained so
# that paraphrases are close; these power semantic search and clustering.
#
# WHERE YOU USE IT
# Evaluate on your own task: a good general encoder can still be poor on a
# narrow domain.
#
# RUN IT:  python 06_repr-5.py
#

import numpy as np

E = {"cat": [0.9, 0.8], "sat": [0.1, 0.4], "good": [0.8, 0.1], "not": [-0.1, 0.0]}
mean = lambda ws: np.mean([E[w] for w in ws], axis=0)
print(mean(["cat", "sat"]).round(2).tolist())
print(mean(["good"]).round(3).tolist(), mean(["not", "good"]).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.5, 0.6]
# [0.8, 0.1] [0.35, 0.05]
