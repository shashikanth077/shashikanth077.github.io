# -*- coding: utf-8 -*-
# ==========================================================================
# Tuning a Pipeline: step__parameter names [scikit-learn / Pipelines, pitfalls
# and shipping]
# ==========================================================================
# WHAT IT IS
# Inside a Pipeline each step is named, and you reach its settings with the
# name, two underscores, and the parameter: knn__n_neighbors. That works in
# set_params and as grid keys — the key "knn__n_neighbors" with a list of
# values to try. Tuning the whole pipeline inside cross-validation means the
# scaler is refit on each training fold only — no leakage even during the
# search.
#
# WHERE YOU USE IT
# Tune the pipeline, not the bare model, whenever preprocessing has learned
# numbers.
#
# RUN IT:  python 01_ship-0.py
#

from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])
print("knn__n_neighbors" in pipe.get_params())
pipe.set_params(knn__n_neighbors=7)
print(pipe.named_steps["knn"].n_neighbors)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# 7
