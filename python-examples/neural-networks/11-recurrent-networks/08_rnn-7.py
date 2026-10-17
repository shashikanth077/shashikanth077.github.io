# -*- coding: utf-8 -*-
# ==========================================================================
# SimpleRNN, LSTM or GRU? [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# Choose by data, sequence length, speed and measured validation performance.
# SimpleRNN: one recurrent state — a baseline for short patterns. LSTM:
# forget/input/output gates and a separate cell state — long dependencies.
# GRU: reset and update gates — an efficient gated baseline. Swap the layers
# (layers.GRU(64, return_sequences=True), layers.GRU(24)) and time training
# with time.perf_counter(). Overfitting shows as training accuracy rising
# towards 100% while validation accuracy stalls — read the curves and use
# early stopping.
#
# WHERE YOU USE IT
# Transformers have largely replaced recurrent models for big language tasks,
# but RNNs remain a clear way to learn sequence ideas.
#
# RUN IT:  python 08_rnn-7.py
#

import numpy as np

def keep(step_factor, n):
    return step_factor ** n

print(round(keep(0.65, 20), 6), round(keep(0.98, 20), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.000181 0.668
