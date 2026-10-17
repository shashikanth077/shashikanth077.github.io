# -*- coding: utf-8 -*-
# ==========================================================================
# Mini-batches, SGD and epochs [maths-ai / Learning: loss and gradient
# descent]
# ==========================================================================
# WHAT IT IS
# Computing the gradient over the whole dataset every step is slow. Stochastic
# gradient descent uses a small random mini-batch instead: a noisier but much
# cheaper estimate. One pass over all the data is an epoch. 1,000 rows in
# batches of 100 give 10 updates per epoch. The noise even helps escape bad
# spots.
#
# WHERE YOU USE IT
# Batch size trades speed, memory and gradient noise; epochs and batch size
# are two of the first hyperparameters you set.
#
# RUN IT:  python 05_learn-4.py
#

n, batch = 1000, 100
updates_per_epoch = n // batch
epochs = 5
print(updates_per_epoch, updates_per_epoch * epochs)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 50
