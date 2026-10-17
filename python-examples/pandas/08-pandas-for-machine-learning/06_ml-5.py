# -*- coding: utf-8 -*-
# ==========================================================================
# A first-look checklist before modelling [pandas / Pandas for machine
# learning]
# ==========================================================================
# WHAT IT IS
# Before training anything, write down what you checked: shape, missing
# values, duplicates, column types, the target's balance and obvious
# impossible values. A small helper that prints these for any DataFrame pays
# for itself on every project. Each item prevents a different failure: crashes
# (types), silent bias (missing, duplicates) and useless models (imbalance).
#
# WHERE YOU USE IT
# Interviewers love "what do you do when you get a new dataset?" — this is the
# answer.
#
# RUN IT:  python 06_ml-5.py
#

import numpy as np
import pandas as pd

df = pd.DataFrame({
    "age": [22, 35, 35, np.nan, 61],
    "city": ["Pune", "Delhi", "Delhi", "Pune", None],
    "bought": [0, 1, 1, 0, 1],
})

def quick_look(df):
    print("shape", df.shape)
    print("missing", int(df.isna().sum().sum()))
    print("duplicates", int(df.duplicated().sum()))
    print("numeric", df.select_dtypes("number").columns.tolist())
    print("target balance", df["bought"].value_counts(normalize=True).round(2).to_dict())

quick_look(df)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# shape (5, 3)
# missing 2
# duplicates 1
# numeric ['age', 'bought']
# target balance {1: 0.6, 0: 0.4}
