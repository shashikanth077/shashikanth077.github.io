# -*- coding: utf-8 -*-
# ==========================================================================
# inner, left, right and outer joins [pandas / Combining tables]
# ==========================================================================
# WHAT IT IS
# The how argument decides what happens to rows without a partner. inner keeps
# only matches; left keeps all left rows; right keeps all right rows; outer
# keeps everything. With the same two tables the result has 2, 3, 3 or 4 rows.
# Check the row count after every merge — an unexpected change means the keys
# are not what you think.
#
# WHERE YOU USE IT
# The usual bug is an inner join that silently drops customers with no orders,
# making a rate look better than it is.
#
# RUN IT:  python 03_combine-2.py
#

import pandas as pd

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Ana", "Bo", "Cy"]})
orders = pd.DataFrame({"id": [2, 3, 4], "amount": [50, 30, 20]})
for how in ["inner", "left", "right", "outer"]:
    print(how, customers.merge(orders, on="id", how=how).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# inner (2, 3)
# left (3, 3)
# right (3, 3)
# outer (4, 3)
