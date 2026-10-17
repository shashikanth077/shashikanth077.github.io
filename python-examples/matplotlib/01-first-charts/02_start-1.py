# -*- coding: utf-8 -*-
# ==========================================================================
# Install, import and the plt nickname [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# Install once in a terminal with python -m pip install matplotlib (in a
# notebook: %pip install matplotlib). Then every script starts with import
# matplotlib.pyplot as plt — pyplot is the module with the plotting commands
# and plt is the universal nickname. For maths and tables you will also import
# numpy as np and pandas as pd.
#
# WHERE YOU USE IT
# Install into the same environment your editor or notebook runs; "No module
# named matplotlib" almost always means a mismatch between the two.
#
# RUN IT:  python 02_start-1.py
#

import matplotlib.pyplot as plt

print(plt.__name__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# matplotlib.pyplot
