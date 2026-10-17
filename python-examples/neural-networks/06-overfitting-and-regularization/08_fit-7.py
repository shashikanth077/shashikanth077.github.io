# -*- coding: utf-8 -*-
# ==========================================================================
# Validation methods: who trains and who tests [neural-networks / Overfitting
# and regularization]
# ==========================================================================
# WHAT IT IS
# Training data fits the weights, validation data chooses settings (epochs, λ,
# architecture), and a separate test set gives one honest final number.
# Strategies: hold-out (one split), K-fold (each fold validates once),
# stratified K-fold (keeps class ratios — vital if 90% of reviews are
# positive), ShuffleSplit, leave-one-out and leave-p-out (exhaustive, costly)
# and time-series splits (always train on the past, validate on the future,
# never shuffle). K-fold works for networks but costs K trainings.
#
# WHERE YOU USE IT
# Repeated tuning on validation results slowly overfits the validation set —
# that is why a final test set exists. Keras validation_split takes the LAST
# fraction of the arrays, so shuffle first.
#
# RUN IT:  python 08_fit-7.py
#

import numpy as np

n, k = 10, 5
idx = np.arange(n)
for fold in range(k):
    val = idx[fold * 2:(fold + 1) * 2]
    train = np.setdiff1d(idx, val)
    print(fold + 1, train.tolist(), val.tolist())
print("leave-one-out trainings:", n, "  leave-2-out:", len(list(__import__("itertools").combinations(idx, 2))))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 [2, 3, 4, 5, 6, 7, 8, 9] [0, 1]
# 2 [0, 1, 4, 5, 6, 7, 8, 9] [2, 3]
# 3 [0, 1, 2, 3, 6, 7, 8, 9] [4, 5]
# 4 [0, 1, 2, 3, 4, 5, 8, 9] [6, 7]
# 5 [0, 1, 2, 3, 4, 5, 6, 7] [8, 9]
# leave-one-out trainings: 10   leave-2-out: 45
