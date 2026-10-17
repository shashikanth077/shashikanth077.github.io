# -*- coding: utf-8 -*-
# ==========================================================================
# Self-attention cost and the CNN comparison [computer-vision / Vision
# transformers and foundation models]
# ==========================================================================
# WHAT IT IS
# Attention compares every token with every other: N tokens need N² similarity
# scores. With 196 patches that is 38,416 per head; with 8 × 8 patches (784
# tokens) it is 614,656 — 16 times more for 4 times the tokens. This quadratic
# growth limits ViT resolution, so variants use windows (Swin), hierarchies or
# token pruning. A CNN's cost grows linearly with pixels but sees only a local
# neighbourhood in each layer. In practice: CNNs are strong and efficient with
# modest data; ViTs win with large-scale pretraining and are the backbone of
# modern multimodal models.
#
# WHERE YOU USE IT
# Hybrid designs (convolutional stem, transformer body) combine both
# strengths.
#
# RUN IT:  python 02_vit-1.py
#

for n in (196, 784, 3136):
    print(n, n * n, n * n // 196 ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 196 38416 1
# 784 614656 16
# 3136 9834496 256
