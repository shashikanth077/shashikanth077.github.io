# -*- coding: utf-8 -*-
# ==========================================================================
# Tuples as dictionary keys [python-ai / Tuples]
# ==========================================================================
# WHAT IT IS
# Keys must be hashable, and tuples of hashable items are; lists aren't
# because they can change. That makes tuples ideal compound keys: (row, col)
# for a grid cell or (learning_rate, batch_size) for an experiment.
#
# WHERE YOU USE IT
# Caching or logging results per hyperparameter combination: results[(lr,
# batch)] = score.
#
# RUN IT:  python 04_tuples-3.py
#

scores = {}
scores[(0.01, 32)] = 0.91
scores[(0.1, 64)] = 0.87
print(scores[(0.01, 32)])
# scores[[0.1, 64]] = 0.5   -> TypeError: unhashable type: 'list'

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.91
