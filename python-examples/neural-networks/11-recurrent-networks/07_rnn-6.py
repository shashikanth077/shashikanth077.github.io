# -*- coding: utf-8 -*-
# ==========================================================================
# IMDb sentiment with an LSTM or GRU [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# Pipeline: raw review → token IDs → pad to 200 → Embedding(10000, 128,
# mask_zero) → LSTM(64, return_sequences=True) → LSTM(24) → Dense(1, sigmoid)
# → probability of "positive". Compile with Adam + binary cross-entropy; keep
# the final test set isolated, hold out a validation split, and use
# EarlyStopping(monitor="val_loss", patience=2, restore_best_weights=True).
# Parameter arithmetic for ONE recurrent layer of 64 units on 128 inputs:
# SimpleRNN 12,352; LSTM 4× that = 49,408; GRU (Keras default, reset_after)
# 37,248.
#
# WHERE YOU USE IT
# Compare architectures with the same split, length, embedding size, optimiser
# and training budget.
#
# RUN IT:  python 07_rnn-6.py
#

units, inputs = 64, 128
simple = units * (inputs + units) + units
lstm = 4 * simple
gru = 3 * (units * (inputs + units) + 2 * units)
print(simple, lstm, gru)
print(10000 * 128)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12352 49408 37248
# 1280000
