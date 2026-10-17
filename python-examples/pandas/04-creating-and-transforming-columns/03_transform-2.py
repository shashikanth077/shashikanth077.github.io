# -*- coding: utf-8 -*-
# ==========================================================================
# Binning and conditions: cut and np.where [pandas / Creating and transforming
# columns]
# ==========================================================================
# WHAT IT IS
# pd.cut(ages, bins=[0, 30, 50, 100], labels=[…]) sorts numbers into labelled
# ranges — age bands, price tiers. np.where(condition, a, b) is a vectorised
# if/else for two outcomes. Both are far faster and clearer than a row-by-row
# function.
#
# WHERE YOU USE IT
# Turning a continuous variable into bands is a common feature for models and
# reports.
#
# RUN IT:  python 03_transform-2.py
#

import numpy as np
import pandas as pd

ages = pd.Series([22, 35, 47, 61])
print(pd.cut(ages, bins=[0, 30, 50, 100], labels=["young", "mid", "senior"]).tolist())
print(np.where(ages >= 40, "40+", "<40").tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['young', 'mid', 'mid', 'senior']
# ['<40', '<40', '40+', '40+']
