# -*- coding: utf-8 -*-
# ==========================================================================
# Train, validation and test sets in numbers [neural-networks / MNIST and the
# full workflow]
# ==========================================================================
# WHAT IT IS
# Practice problems (training), a mock exam (validation) and the final exam
# (test). The optimiser learns from training data; validation chooses the
# architecture, learning rate, stopping epoch and threshold; the test set is
# used once at the end. MNIST: 60,000 development images + 10,000 test images.
# A 20% validation holdout gives 48,000 train and 12,000 validation images.
# Hyper-parameters (learning rate, layers, λ) are chosen by you; parameters
# (weights, biases) are learned. Leakage example: fitting a scaler on all
# 70,000 images lets test statistics shape training.
#
# WHERE YOU USE IT
# Repeatedly tuning to the test set makes the report untrustworthy — it
# quietly becomes a second validation set.
#
# RUN IT:  python 01_mnist-0.py
#

dev, test = 60000, 10000
val = int(dev * 0.2)
train = dev - val
print(train, val, test)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 48000 12000 10000
