# -*- coding: utf-8 -*-
# ==========================================================================
# Reproducibility: random_state and versions [scikit-learn / Pipelines,
# pitfalls and shipping]
# ==========================================================================
# WHAT IT IS
# Splits, forests, k-means starts and shuffling all use randomness. Pass
# random_state=42 (any fixed integer) to each so results repeat — with the
# same data, code and library versions. Record the scikit-learn version too,
# because defaults change between releases. When comparing two models, give
# them the same split and the same seed, otherwise you may just be comparing
# luck.
#
# WHERE YOU USE IT
# "I got 91% yesterday" is useless without the seed. Fix it, log it, and
# report the score spread over several seeds for fair comparisons.
#
# RUN IT:  python 05_ship-4.py
#

from sklearn.model_selection import train_test_split

a = train_test_split(range(10), random_state=1)
b = train_test_split(range(10), random_state=1)
print(a == b)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
