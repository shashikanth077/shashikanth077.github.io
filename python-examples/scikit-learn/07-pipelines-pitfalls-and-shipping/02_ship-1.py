# -*- coding: utf-8 -*-
# ==========================================================================
# Saving and loading a model with joblib [scikit-learn / Pipelines, pitfalls
# and shipping]
# ==========================================================================
# WHAT IT IS
# A trained model is just a Python object; joblib.dump(model, "model.joblib")
# writes it to a file and joblib.load("model.joblib") brings it back, so a web
# service can predict without retraining. Save the whole Pipeline so the
# preprocessing travels with the model. Only load files you trust (they can
# run code), and load with the same scikit-learn version that saved them.
#
# WHERE YOU USE IT
# Record the library versions next to the file; a model saved with one version
# may not load in another.
#
# RUN IT:  python 02_ship-1.py
#

import joblib
from sklearn.linear_model import LinearRegression

model = LinearRegression().fit([[1], [2], [3], [4]], [3, 5, 7, 9])
joblib.dump(model, "model.joblib")
loaded = joblib.load("model.joblib")
print(loaded.predict([[5]]).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [11.0]
