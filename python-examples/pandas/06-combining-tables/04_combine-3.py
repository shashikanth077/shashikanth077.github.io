# -*- coding: utf-8 -*-
# ==========================================================================
# Key names, suffixes and indicator [pandas / Combining tables]
# ==========================================================================
# WHAT IT IS
# When the key columns have different names use left_on="user_id",
# right_on="uid". If both tables have a column with the same name, pandas adds
# suffixes (_x, _y); choose clear ones with suffixes=("_user", "_visit").
# indicator=True adds a _merge column saying whether each row came from both
# tables, only the left or only the right — a fast way to audit a join.
#
# WHERE YOU USE IT
# Always look at the _merge counts when joining important tables; they show
# exactly how many rows failed to match.
#
# RUN IT:  python 04_combine-3.py
#

import pandas as pd

users = pd.DataFrame({"user_id": [1, 2, 3], "score": [5, 6, 7]})
visits = pd.DataFrame({"uid": [1, 1, 3], "score": [10, 20, 30]})
m = users.merge(visits, left_on="user_id", right_on="uid", how="left",
                suffixes=("_user", "_visit"), indicator=True)
print(m)
print(m["_merge"].value_counts().to_dict())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    user_id  score_user  uid  score_visit     _merge
# 0        1           5  1.0         10.0       both
# 1        1           5  1.0         20.0       both
# 2        2           6  NaN          NaN  left_only
# 3        3           7  3.0         30.0       both
# {'both': 3, 'left_only': 1, 'right_only': 0}
