# -*- coding: utf-8 -*-
# ==========================================================================
# Backpropagation through a hidden neuron [neural-networks / Gradient descent
# and backpropagation]
# ==========================================================================
# WHAT IT IS
# With a hidden layer the chain simply gets longer. Network: x → z₁ = w₁x + b₁
# → a₁ = ReLU(z₁) → ŷ = w₂a₁ + b₂ → L = ½(ŷ − y)². Take x = 2, w₁ = 1, b₁ = 0,
# w₂ = 2, b₂ = 1, y = 7. Forward: z₁ = 2, a₁ = 2, ŷ = 5, L = 2. Backward:
# dL/dŷ = −2; dL/dw₂ = −2 × a₁ = −4; dL/db₂ = −2; dL/da₁ = −2 × w₂ = −4;
# ReLU′(2) = 1; dL/dz₁ = −4; dL/dw₁ = −4 × x = −8; dL/db₁ = −4. If z₁ had been
# negative, ReLU′ = 0 and no gradient would flow to w₁, b₁.
#
# WHERE YOU USE IT
# Every gradient is the product of the slopes along the path. This is why
# vanishing (many small factors) or exploding (many large ones) gradients
# appear in deep networks.
#
# RUN IT:  python 09_learn-8.py
#

x, w1, b1, w2, b2, y = 2.0, 1.0, 0.0, 2.0, 1.0, 7.0
z1 = w1 * x + b1
a1 = max(0.0, z1)
pred = w2 * a1 + b2
loss = 0.5 * (pred - y) ** 2
d_pred = pred - y
d_w2, d_b2 = d_pred * a1, d_pred
d_a1 = d_pred * w2
d_z1 = d_a1 * (1.0 if z1 > 0 else 0.0)
d_w1, d_b1 = d_z1 * x, d_z1
print(z1, a1, pred, loss)
print(d_pred, d_w2, d_b2, d_a1, d_z1, d_w1, d_b1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 2.0 5.0 2.0
# -2.0 -4.0 -2.0 -4.0 -4.0 -8.0 -4.0
