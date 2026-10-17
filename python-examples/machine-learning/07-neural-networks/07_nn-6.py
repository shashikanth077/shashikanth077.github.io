# -*- coding: utf-8 -*-
# ==========================================================================
# Epochs, batches and iterations [machine-learning / Neural networks]
# ==========================================================================
# WHAT IT IS
# One epoch is a full pass over the training set. Data are usually processed
# in mini-batches; one weight update per batch is an iteration. With 1,000
# examples and a batch size of 100 an epoch has 10 iterations; 5 epochs make
# 50 updates. Too few epochs underfit; too many overfit, so watch validation
# loss and stop early when it starts to rise. Normalise inputs first (min–max
# or z-score), fitting the scaler on the training data only.
#
# WHERE YOU USE IT
# Batch size trades speed against noisy-but-useful gradient estimates; the
# learning rate and batch size interact.
#
# RUN IT:  python 07_nn-6.py
#

n, batch, epochs = 1000, 100, 5
per_epoch = -(-n // batch)
print(per_epoch, per_epoch * epochs)
print(-(-1050 // 100))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 50
# 11
