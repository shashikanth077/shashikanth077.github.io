# -*- coding: utf-8 -*-
# ==========================================================================
# Backpropagation as a computational graph [maths-ai / Putting it together:
# networks]
# ==========================================================================
# WHAT IT IS
# Draw the calculation as a graph: nodes hold values, edges are operations.
# The forward pass fills in the values left to right. The backward pass starts
# at the loss and, at every node, multiplies the incoming slope by that node's
# local slope — passing a gradient to each earlier input. Every weight ends up
# with its own gradient.
#
# WHERE YOU USE IT
# Autograd systems (PyTorch, JAX, TensorFlow) record exactly this graph while
# the forward pass runs.
#
# RUN IT:  python 06_nn-5.py
#

# slopes multiply along the path  w -> z -> a -> E
local = [2, 0.1966, -0.2689]      # dz/dw, da/dz, dE/da  (from the previous example)
grad = 1
for s in local:
    grad *= s
print(round(grad, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -0.1057
