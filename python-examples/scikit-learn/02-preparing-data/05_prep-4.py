# -*- coding: utf-8 -*-
# ==========================================================================
# Encoding categories: OneHotEncoder [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# Models need numbers, so a text column such as city must be encoded.
# OneHotEncoder makes one 0/1 column per category, in sorted order, so no
# false order like Delhi < Goa < Pune is implied. Learn the categories with
# fit, apply with transform. By default an unseen category at prediction time
# raises an error — set handle_unknown="ignore" to output all zeros instead.
# Pass sparse_output=False to get a normal array.
#
# WHERE YOU USE IT
# New cities will appear after you train. Decide on purpose whether that
# should crash or be ignored.
#
# RUN IT:  python 05_prep-4.py
#

from sklearn.preprocessing import OneHotEncoder

enc = OneHotEncoder(sparse_output=False)
X = [["Pune"], ["Delhi"], ["Pune"], ["Goa"]]
out = enc.fit_transform(X)
print(enc.categories_[0].tolist())
print(out.tolist())
print(enc.transform([["Delhi"]]).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Delhi', 'Goa', 'Pune']
# [[0.0, 0.0, 1.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]]
# [[1.0, 0.0, 0.0]]
