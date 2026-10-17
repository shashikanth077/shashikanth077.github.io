# -*- coding: utf-8 -*-
# ==========================================================================
# KNN needs scaled features [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# KNN and other distance-based models compare rows with a straight-line
# distance. If one feature is in dollars and another in years, the dollars
# decide everything. Take two people 10 years apart in age and $5,000 apart in
# income: unscaled, income accounts for essentially all of the distance.
# Divide income so both differences are comparable and age counts again. Drag
# the divisor.
#
# WHERE YOU USE IT
# Put a StandardScaler in front of KNN, SVM and logistic regression — in a
# Pipeline so it is fitted on training data only.
#
# RUN IT:  python 04_classify-3.py
#

import numpy as np

a = np.array([30.0, 60000.0])
b = np.array([40.0, 60500.0])
c = np.array([31.0, 90000.0])
print(round(float(np.linalg.norm(a - b)), 1), round(float(np.linalg.norm(a - c)), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 500.1 30000.0
