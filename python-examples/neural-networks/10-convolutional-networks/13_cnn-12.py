# -*- coding: utf-8 -*-
# ==========================================================================
# Transfer learning with a pretrained VGG16 [neural-networks / Convolutional
# networks]
# ==========================================================================
# WHAT IT IS
# Training millions of weights from scratch needs lots of data. Transfer
# learning: load a network pretrained on ImageNet, drop its classifier
# (include_top=False), freeze the convolutional base (trainable=False) and
# train a small new head on your own labelled images: preprocess_input →
# base(x, training=False) → GlobalAveragePooling → Dense(classes, softmax).
# Only the new head's weights change. Trade-offs: VGG16 is large and slow;
# consider ResNet or MobileNet when memory or latency matters. Optionally
# unfreeze the top blocks later with a small learning rate (fine-tuning).
#
# WHERE YOU USE IT
# Always use the pretrained model's own preprocessing; mismatched scaling
# silently ruins accuracy.
#
# RUN IT:  python 13_cnn-12.py
#

base_params = 14714688
head = 512 * 2 + 2
print(head, base_params + head, round(head / (base_params + head) * 100, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1026 14715714 0.007
