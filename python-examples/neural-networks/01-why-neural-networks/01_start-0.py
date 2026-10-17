# -*- coding: utf-8 -*-
# ==========================================================================
# Why neural networks [neural-networks / Why neural networks]
# ==========================================================================
# WHAT IT IS
# A neural network is a function with thousands or millions of adjustable
# numbers (weights and biases) arranged in layers. You do not write the rules:
# you show it examples, measure how wrong its answers are, and nudge every
# number to be a little less wrong. Repeated many times, the layers learn
# their own features — edges in an image, word patterns in a sentence. Even
# the tiniest network, 2 inputs → 3 hidden neurons → 1 output, already has 13
# learnable numbers.
#
# WHERE YOU USE IT
# Use a network when the input is raw and high-dimensional (pixels, audio,
# text) and you have plenty of labelled examples. For small tables, a tree
# ensemble is often simpler and just as good.
#
# RUN IT:  python 01_start-0.py
#

n_in, n_hidden, n_out = 2, 3, 1
hidden = n_in * n_hidden + n_hidden
output = n_hidden * n_out + n_out
print(hidden, output, hidden + output)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 9 4 13
