# -*- coding: utf-8 -*-
# ==========================================================================
# Sequence shapes: batch, time, features [neural-networks / Recurrent
# networks]
# ==========================================================================
# WHAT IT IS
# Recurrent layers take 3-D input: (batch_size, time_steps, features). 32
# reviews × 200 tokens × 128 embedding dimensions → (32, 200, 128).
# SimpleRNN(64) returns (32, 64) when only the final state is wanted
# (many-to-one: a review → sentiment) and (32, 200, 64) with
# return_sequences=True (many-to-many: a label each hour, or feeding a second
# recurrent layer). Encoder–decoder models read a source sequence and generate
# a different target sequence (translation).
#
# WHERE YOU USE IT
# The business question decides the output shape — decide it before choosing
# layers.
#
# RUN IT:  python 03_rnn-2.py
#

import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(32, 200, 128))
Wx, Wh = rng.normal(0, 0.05, (128, 64)), rng.normal(0, 0.05, (64, 64))
h = np.zeros((32, 64))
states = []
for t in range(200):
    h = np.tanh(x[:, t] @ Wx + h @ Wh)
    states.append(h)
print(h.shape, np.stack(states, axis=1).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (32, 64) (32, 200, 64)
