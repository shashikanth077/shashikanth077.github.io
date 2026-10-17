# -*- coding: utf-8 -*-
# ==========================================================================
# Shuffling and train/test splits [pandas / Pandas for machine learning]
# ==========================================================================
# WHAT IT IS
# A simple split: shuffle with df.sample(frac=1, random_state=42), then take
# the first 80% as training and the rest as test with iloc. random_state makes
# the shuffle repeatable. Keep features and target together (one DataFrame)
# until after the shuffle so the rows cannot get out of step. For time series
# do NOT shuffle — split by date so the model never sees the future.
#
# WHERE YOU USE IT
# scikit-learn's train_test_split does exactly this; knowing the pandas
# version helps you debug it and handle time-ordered data.
#
# RUN IT:  python 04_ml-3.py
#

import pandas as pd

df = pd.DataFrame({"x": range(10), "y": range(10)})
shuffled = df.sample(frac=1, random_state=42).reset_index(drop=True)
cut = int(len(df) * 0.8)
train, test = shuffled.iloc[:cut], shuffled.iloc[cut:]
print(len(train), len(test))
print(sorted(train["x"].tolist() + test["x"].tolist()) == list(range(10)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8 2
# True
