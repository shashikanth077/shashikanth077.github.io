# -*- coding: utf-8 -*-
# ==========================================================================
# What is an RNN? A network with memory [neural-networks / Recurrent networks]
# ==========================================================================
# WHAT IT IS
# Order matters: in "The delivery was slow but the food was excellent" the
# word "but" flips the mood. A recurrent neural network reads one element at a
# time and carries a hidden state — its running memory — to the next step. A
# feedforward network has a direct path, a CNN shares filters over
# neighbouring positions, an RNN feeds its own previous state back in. A
# bag-of-words model cannot represent the order at all.
#
# WHERE YOU USE IT
# The same weights process word 1, word 2 and every later word: parameters do
# not grow with sequence length.
#
# RUN IT:  python 01_rnn-0.py
#

a = "dog bites man".split()
b = "man bites dog".split()
print(sorted(a) == sorted(b), a == b)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True False
