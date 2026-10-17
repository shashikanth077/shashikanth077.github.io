# -*- coding: utf-8 -*-
# ==========================================================================
# Tree depth controls overfitting [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# An unlimited tree keeps splitting until every training row is classified
# correctly — including noise — so its training score is 1.0 but its score on
# new data drops. max_depth, min_samples_leaf and min_samples_split limit
# growth. On the six points below (the labels have one noisy case) a depth-1
# tree gets 5 of 6 right; an unlimited tree gets all 6 by building extra
# questions for the noise.
#
# WHERE YOU USE IT
# Tune max_depth with cross-validation; compare train and test scores to see
# overfitting directly.
#
# RUN IT:  python 06_classify-5.py
#

from sklearn.tree import DecisionTreeClassifier

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 1, 0, 1, 1]
shallow = DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)
deep = DecisionTreeClassifier(random_state=0).fit(X, y)
print(round(shallow.score(X, y), 2), deep.score(X, y))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.83 1.0
