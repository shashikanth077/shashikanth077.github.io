# -*- coding: utf-8 -*-
# ==========================================================================
# An autoencoder in Keras terms: 784 → 32 → 784 [neural-networks /
# Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# Lecture architecture: Input(784) → Dense(32, relu) → Dense(784, sigmoid),
# compiled with Adam and MSE, trained for 20 epochs at batch 256 on x_train as
# both input and target, with a validation subset (never the final test set).
# Parameters: encoder 784×32 + 32 = 25,120; decoder 32×784 + 784 = 25,872;
# total 50,992. The sigmoid output matches pixels scaled to 0–1. Check
# reconstructions with autoencoder.predict(x_test[:10]) → shape (10, 784).
#
# WHERE YOU USE IT
# Use a separate validation subset to choose hyper-parameters.
#
# RUN IT:  python 03_gen-2.py
#

dense = lambda a, b: a * b + b
enc, dec = dense(784, 32), dense(32, 784)
print(enc, dec, enc + dec)
print(784 / 32)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 25120 25872 50992
# 24.5
