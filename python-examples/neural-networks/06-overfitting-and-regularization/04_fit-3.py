# -*- coding: utf-8 -*-
# ==========================================================================
# Early stopping and the best epoch [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# Training longer is not always better. Plot loss against epoch: the training
# loss keeps falling, but the validation loss reaches a minimum and then
# climbs as the network starts memorising noise. Early stopping watches the
# validation loss, saves the weights whenever it improves, stops after
# patience epochs without improvement, and restores the BEST weights, not the
# last. In Keras: EarlyStopping(monitor="val_loss", patience=3,
# restore_best_weights=True). Real curves wiggle, so patience and a minimum
# improvement threshold matter.
#
# WHERE YOU USE IT
# The validation set guides this decision, so the final honest number must
# come from an untouched test set.
#
# RUN IT:  python 04_fit-3.py
#

import numpy as np

epochs = np.arange(1, 21)
train = 1.0 / epochs ** 0.7
val = train + 0.003 * (epochs - 8) ** 2 * (epochs > 8) + 0.05
best = int(epochs[np.argmin(val)])
patience, wait, best_val, stop = 3, 0, 9.9, None
for e, v in zip(epochs, val):
    if v < best_val - 1e-4:
        best_val, wait = v, 0
    else:
        wait += 1
        if wait >= patience:
            stop = int(e)
            break
print(best, stop)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 13
