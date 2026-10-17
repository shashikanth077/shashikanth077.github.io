# -*- coding: utf-8 -*-
# ==========================================================================
# Random forest: a committee of different trees [machine-learning / Decision
# trees and ensembles]
# ==========================================================================
# WHAT IT IS
# A forest trains many trees, each on a bootstrap sample (rows drawn with
# replacement, so some repeat and some are left out) and with only a random
# subset of features at each split, so the trees differ. For a new email each
# tree gives a probability; the forest averages them: (0.9 + 0.4 + 0.8) / 3 =
# 0.7, so at threshold 0.5 it predicts Spam. (Simple majority voting would
# also say Spam, 2 votes to 1; scikit-learn averages probabilities.) Drag the
# three probabilities.
#
# WHERE YOU USE IT
# Out-of-bag rows (those a tree never saw) give a built-in validation
# estimate. More trees steady the result but cost time; a forest is less
# readable than one tree.
#
# RUN IT:  python 05_tree-5.py
#

import numpy as np

rng = np.random.default_rng(0)
probs = np.array([0.9, 0.4, 0.8])
print(round(float(probs.mean()), 2), (probs > 0.5).astype(int).tolist())
fractions = [len(np.unique(rng.integers(0, 8, 8))) / 8 for _ in range(2000)]
print(round(float(np.mean(fractions)), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7 [1, 0, 1]
# 0.66
