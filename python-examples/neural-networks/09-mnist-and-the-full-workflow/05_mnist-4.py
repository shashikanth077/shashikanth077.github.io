# -*- coding: utf-8 -*-
# ==========================================================================
# Compile, fit, evaluate, predict [neural-networks / MNIST and the full
# workflow]
# ==========================================================================
# WHAT IT IS
# Four verbs: compile chooses the optimiser, loss and metrics (Adam +
# categorical cross-entropy + accuracy); fit updates parameters from training
# batches (batch_size=32, epochs=6); evaluate reports loss and metrics without
# training; predict returns probabilities with shape (N, 10). Batch counts for
# MNIST: 48,000 / 32 = 1,500 updates per epoch, 9,000 for six epochs (early
# stopping may reduce this). Evaluating 10,000 test images at batch 32 takes
# ceil(10,000/32) = 313 batches (312 full + one of 16). Evaluation never
# updates weights.
#
# WHERE YOU USE IT
# An epoch is a pass over the data; a batch is one group inside that pass.
#
# RUN IT:  python 05_mnist-4.py
#

import math

train, batch, epochs = 48000, 32, 6
per_epoch = math.ceil(train / batch)
print(per_epoch, per_epoch * epochs)
print(math.ceil(10000 / 32), 10000 - 312 * 32)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1500 9000
# 313 16
