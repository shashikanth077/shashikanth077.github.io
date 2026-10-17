# -*- coding: utf-8 -*-
# ==========================================================================
# Install and import [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# Install once with python -m pip install pandas (notebook: %pip install
# pandas) into the same environment you run code in. Every script starts with
# import pandas as pd — pd is the universal nickname. pandas builds on NumPy,
# so it installs that too; you will often import both.
#
# WHERE YOU USE IT
# "No module named pandas" means pandas is installed in a different Python
# from the one running your code — check which interpreter your editor or
# notebook uses.
#
# RUN IT:  python 02_start-1.py
#

import pandas as pd

print(pd.Series([1, 2, 3]).sum())
print(type(pd.DataFrame()).__name__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6
# DataFrame
