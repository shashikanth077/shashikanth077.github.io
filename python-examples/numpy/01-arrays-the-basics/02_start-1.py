# -*- coding: utf-8 -*-
# ==========================================================================
# Install, import and your first array [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# Install once with python -m pip install numpy (in a terminal, not inside the
# Python prompt; in a notebook use %pip install numpy). Then every script
# starts with import numpy as np — np is the universal nickname.
# np.array([...]) turns a list into an array.
#
# WHERE YOU USE IT
# Almost every AI notebook starts with the same two lines: import numpy as np
# and a data load.
#
# RUN IT:  python 02_start-1.py
#

import numpy as np

a = np.array([10, 20, 30])
print(a)
print(type(a))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10 20 30]
# <class 'numpy.ndarray'>
