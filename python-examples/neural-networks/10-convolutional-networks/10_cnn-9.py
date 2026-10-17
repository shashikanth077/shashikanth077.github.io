# -*- coding: utf-8 -*-
# ==========================================================================
# Training a CNN and reading its curves [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# Training repeats forward pass → loss → backpropagation → optimiser update.
# The learning rate sets the step size, an epoch is one pass over the training
# examples, and the batch size is how many examples contribute to one step.
# With 60,000 images and batch 32 there are ceil(60000/32) = 1,875 updates per
# epoch. Watch validation loss, not only training accuracy: a growing gap
# means overfitting; dropout, augmentation and batch normalisation are the
# usual remedies.
#
# WHERE YOU USE IT
# More epochs do not always improve validation accuracy.
#
# RUN IT:  python 10_cnn-9.py
#

import math

print(math.ceil(60000 / 32), math.ceil(48000 / 32))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1875 1500
