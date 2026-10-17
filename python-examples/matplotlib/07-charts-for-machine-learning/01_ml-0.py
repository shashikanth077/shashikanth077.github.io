# -*- coding: utf-8 -*-
# ==========================================================================
# Learning curves: spotting overfitting [matplotlib / Charts for machine
# learning]
# ==========================================================================
# WHAT IT IS
# Plot training loss and validation loss per epoch. Both should fall at first.
# If training loss keeps falling while validation loss turns upward, the model
# is memorising the training data — overfitting. The best moment to stop is
# the epoch where validation loss is lowest (early stopping). These curves are
# simulated for teaching; drag the severity.
#
# WHERE YOU USE IT
# With Keras, history.history["loss"] and ["val_loss"] are exactly these two
# lists; plotting them is the first diagnostic after every run.
#
# RUN IT:  python 01_ml-0.py
#

import numpy as np
import matplotlib.pyplot as plt

epochs = np.arange(20)
train = 0.85 * np.exp(-epochs * 0.18) + 0.075
val = 0.8 * np.exp(-epochs * 0.20) + 0.16 + 0.65 * np.maximum(0, epochs - 7) ** 1.18 * 0.018

fig, ax = plt.subplots()
ax.plot(epochs, train, label="Training loss")
ax.plot(epochs, val, label="Validation loss")
ax.axvline(val.argmin(), linestyle="--", color="gray")
ax.set(xlabel="Epoch", ylabel="Loss", title="Learning curves")
ax.legend()
plt.show()
print(int(val.argmin()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 11
