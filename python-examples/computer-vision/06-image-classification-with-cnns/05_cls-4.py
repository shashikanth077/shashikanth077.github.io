# -*- coding: utf-8 -*-
# ==========================================================================
# Transfer learning for images [computer-vision / Image classification with
# CNNs]
# ==========================================================================
# WHAT IT IS
# A network trained on ImageNet has learned general features — edges,
# textures, shapes — that help almost any image task. Transfer learning: reuse
# it. Option 1, feature extraction: freeze the convolutional base and train a
# new classifier head on your classes (for VGG16 with a 512-feature output and
# 10 classes: 512 × 10 + 10 = 5,130 trainable parameters instead of 14.7
# million). Option 2, fine-tuning: also unfreeze the last blocks with a small
# learning rate. Few images (hundreds) → extract; more images or a very
# different domain → fine-tune more layers.
#
# WHERE YOU USE IT
# Use the same preprocessing (mean/std, size) that the pretrained model
# expects.
#
# RUN IT:  python 05_cls-4.py
#

base = 14714688
head = 512 * 10 + 10
print(head, round(head / (base + head) * 100, 3))
for n_images in (200, 5000, 100000):
    plan = "feature extraction" if n_images < 1000 else "fine-tune last blocks" if n_images < 20000 else "fine-tune the whole model"
    print(n_images, plan)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5130 0.035
# 200 feature extraction
# 5000 fine-tune last blocks
# 100000 fine-tune the whole model
