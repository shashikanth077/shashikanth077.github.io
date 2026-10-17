# -*- coding: utf-8 -*-
# ==========================================================================
# SettingWithCopyWarning and chained assignment [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# df[df["a"] > 1]["b"] = 0 does two steps: the filter makes a new DataFrame,
# then the assignment writes into that temporary copy — so the original never
# changes (pandas warns with SettingWithCopyWarning). Do the selection and the
# assignment in one .loc call: df.loc[df["a"] > 1, "b"] = 0. When you really
# want a separate table, say so with .copy().
#
# WHERE YOU USE IT
# This is the most notorious pandas bug: the code runs, the warning is easy to
# ignore, and the data is silently unchanged.
#
# RUN IT:  python 01_pitfalls-0.py
#

import warnings
import pandas as pd

warnings.simplefilter("ignore")
df = pd.DataFrame({"a": [1, 2, 3], "b": [10, 20, 30]})
df[df["a"] > 1]["b"] = 0
print(df["b"].tolist())
df.loc[df["a"] > 1, "b"] = 0
print(df["b"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10, 20, 30]
# [10, 0, 0]
