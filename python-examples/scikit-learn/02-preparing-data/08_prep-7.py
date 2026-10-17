# -*- coding: utf-8 -*-
# ==========================================================================
# Pipeline: preprocessing and model as one object [scikit-learn / Preparing
# data]
# ==========================================================================
# WHAT IT IS
# Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
# chains the steps. pipe.fit(X_train, y_train) fits the scaler on the training
# rows, scales them, then fits the model; pipe.predict(X_test) applies the
# same learned scaling automatically. Because the test rows can never reach
# fit of the scaler, leakage becomes impossible. It also lets you save one
# object and tune everything together.
#
# WHERE YOU USE IT
# Teams ship the whole pipeline, not just the model, so production data gets
# exactly the training-time preprocessing.
#
# RUN IT:  python 08_prep-7.py
#

from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X = [[10], [20], [30], [40]]
y = [0, 0, 1, 1]
pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
pipe.fit(X, y)
print(list(pipe.named_steps))
print(pipe.predict([[15], [35]]).tolist())
print(pipe.score(X, y))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['scale', 'model']
# [0, 1]
# 1.0
