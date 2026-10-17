# -*- coding: utf-8 -*-
# ==========================================================================
# fit and predict: how ML libraries use classes [python-ai / Classes and
# objects (OOP)]
# ==========================================================================
# WHAT IT IS
# ML libraries are object-oriented: construct a model object with its
# settings, call fit(X, y) to learn (the object stores what it learned in
# attributes ending in _), then predict(X) to use it. Write your own
# estimators the same way and they fit into the same tooling.
#
# WHERE YOU USE IT
# Following the fit / predict convention lets your class drop into
# scikit-learn pipelines and cross-validation.
#
# RUN IT:  python 12_oop-11.py
#

class MeanThreshold:
    def fit(self, marks):
        self.threshold_ = sum(marks) / len(marks)
        return self

    def predict(self, marks):
        return [int(m >= self.threshold_) for m in marks]

model = MeanThreshold().fit([40, 60, 80])
print(model.threshold_)
print(model.predict([30, 65, 90]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 60.0
# [0, 1, 1]
