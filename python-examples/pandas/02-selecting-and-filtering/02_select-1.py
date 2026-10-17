# -*- coding: utf-8 -*-
# ==========================================================================
# loc and iloc: labels versus positions [pandas / Selecting and filtering]
# ==========================================================================
# WHAT IT IS
# df.loc[rows, columns] selects by label; df.iloc[rows, columns] selects by
# position. The big difference: a loc slice includes the end label
# (loc["a":"c"] gives a, b and c), while an iloc slice excludes the end
# position like Python (iloc[0:2] gives two rows). When the index is 0, 1, 2…
# the two look alike — until you filter or sort and the labels stop matching
# the positions.
#
# WHERE YOU USE IT
# Confusing loc and iloc after a sort or filter silently returns the wrong
# rows.
#
# RUN IT:  python 02_select-1.py
#

import pandas as pd

df = pd.DataFrame({"salary": [48000, 72000, 65000, 51000]}, index=["Asha", "Ben", "Chen", "Dia"])
print(df.loc["Ben":"Chen", "salary"].tolist())
print(df.iloc[1:3, 0].tolist())
print(df.loc["Dia", "salary"], df.iloc[3, 0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [72000, 65000]
# [72000, 65000]
# 51000 51000
