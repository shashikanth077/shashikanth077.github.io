# -*- coding: utf-8 -*-
# ==========================================================================
# Decision trees: a flowchart of questions [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# A DecisionTreeClassifier learns a series of yes/no questions about single
# features, choosing at each step the split that makes the groups purest.
# Prediction just follows the questions down to a leaf. In the example data
# (1, 2, 3 are class 0; 10, 11, 12 class 1) one question — "is x ≤ 6.5?", the
# midpoint between 3 and 10 — separates everything, so the tree has depth 1.
# Trees need no scaling and are easy to read, but a deep tree memorises.
#
# WHERE YOU USE IT
# Trees handle mixed feature types and interactions and are the building block
# of forests and boosting.
#
# RUN IT:  python 05_classify-4.py
#

from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(tree.get_depth(), tree.tree_.threshold[0])
print(tree.predict([[5], [8]]).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 6.5
# [0, 1]
