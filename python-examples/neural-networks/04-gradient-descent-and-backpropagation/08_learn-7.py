# -*- coding: utf-8 -*-
# ==========================================================================
# Epoch, batch size and iteration [neural-networks / Gradient descent and
# backpropagation]
# ==========================================================================
# WHAT IT IS
# One epoch is a pass over the whole training set. The batch size is how many
# examples contribute to one gradient. One iteration (optimiser step) uses one
# batch. With 8 records and batch size 2 there are 8 / 2 = 4 updates per
# epoch. In general steps per epoch = ceil(N / batch size): 1,000 examples
# with batch 32 give ceil(31.25) = 32 steps, and 10 epochs make 320 updates;
# the last batch may be smaller. Small batches give noisy, frequent updates;
# large batches give smoother ones but need more memory.
#
# WHERE YOU USE IT
# 100 records, batch size 20, 4 epochs → 5 × 4 = 20 optimizer steps. Do not
# confuse "batch size 32" with "32 epochs".
#
# RUN IT:  python 08_learn-7.py
#

import math

print(math.ceil(8 / 2), math.ceil(1000 / 32), math.ceil(1000 / 32) * 10)
print(math.ceil(100 / 20) * 4, math.ceil(1000 / 100) * 5)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4 32 320
# 20 50
