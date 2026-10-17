# -*- coding: utf-8 -*-
# ==========================================================================
# Count every trainable parameter [neural-networks / MNIST and the full
# workflow]
# ==========================================================================
# WHAT IT IS
# A Dense layer has incoming features × units + units parameters (weights plus
# one bias per unit). Flatten and Input add none. First layer 784 → 100:
# 78,400 weights + 100 biases = 78,500. Second layer 100 → 10: 1,000 + 10 =
# 1,010. Total 79,510. The bias belongs to each output neuron — it is not a
# 785th pixel (the "784 + 1" of the slides is just bookkeeping). Change the
# hidden width and watch the first layer dominate.
#
# WHERE YOU USE IT
# Parameters scale with width × width: doubling a hidden layer more than
# doubles the cost of the next layer.
#
# RUN IT:  python 04_mnist-3.py
#

def dense(n_in, n_out):
    return n_in * n_out + n_out

a, b = dense(784, 100), dense(100, 10)
print(a, b, a + b)
print(dense(784, 200) + dense(200, 10))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 78500 1010 79510
# 159010
