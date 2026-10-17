# -*- coding: utf-8 -*-
# ==========================================================================
# Built-in datasets: the iris example [scikit-learn / The scikit-learn
# workflow]
# ==========================================================================
# WHAT IT IS
# scikit-learn ships small practice datasets. load_iris() returns an object
# with data (the features X), target (the labels y as 0, 1, 2), feature_names
# and target_names. Iris has 150 flowers, four measurements each, three
# species, 50 of each. Datasets this size let you test an idea in seconds
# before using real data.
#
# WHERE YOU USE IT
# Use a toy dataset to check your pipeline code works end to end, then swap in
# your own data with the same shapes.
#
# RUN IT:  python 03_start-4.py
#

import numpy as np
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target
print(X.shape, y.shape)
print(iris.target_names.tolist())
print(np.bincount(y).tolist())
print(iris.feature_names[0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (150, 4) (150,)
# ['setosa', 'versicolor', 'virginica']
# [50, 50, 50]
# sepal length (cm)
