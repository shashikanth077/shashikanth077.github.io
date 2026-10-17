# -*- coding: utf-8 -*-
# ==========================================================================
# Overfitting and the bias–variance trade-off [maths-ai / Learning: loss and
# gradient descent]
# ==========================================================================
# WHAT IT IS
# Early in training both the training and validation loss fall. Later the
# model starts memorising the training set: training loss keeps falling while
# validation loss rises — overfitting. Too simple a model has high bias
# (underfits); too flexible has high variance (overfits). Early stopping halts
# training at the validation minimum.
#
# WHERE YOU USE IT
# Always evaluate on data the model never trained on; the gap between training
# and validation loss is your overfitting alarm.
#
# RUN IT:  python 08_learn-7.py
#

val = [0.9, 0.6, 0.45, 0.4, 0.42, 0.47]
best = min(range(len(val)), key=val.__getitem__)
print(best, val[best])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 0.4
