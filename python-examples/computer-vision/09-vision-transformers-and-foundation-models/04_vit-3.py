# -*- coding: utf-8 -*-
# ==========================================================================
# Self-supervised learning from unlabelled images [computer-vision / Vision
# transformers and foundation models]
# ==========================================================================
# WHAT IT IS
# Labels are costly, unlabelled images are not. Self-supervised methods invent
# a task from the data itself. Contrastive learning (SimCLR, MoCo): two
# augmented views of the same image should have similar embeddings, views of
# different images dissimilar. Masked image modelling (MAE): hide 75% of the
# patches and reconstruct them. Self-distillation (DINO): a student matches a
# teacher's output on different crops. The pretrained encoder is then
# fine-tuned with few labels. With 1% of the labels a good self-supervised
# encoder often matches a fully supervised model trained from scratch on much
# more.
#
# WHERE YOU USE IT
# Pretrain on images from your own domain when it differs a lot from web
# photos (microscopy, satellite).
#
# RUN IT:  python 04_vit-3.py
#

import numpy as np

rng = np.random.default_rng(0)
patches = np.arange(16)
masked = rng.choice(16, size=12, replace=False)
visible = np.setdiff1d(patches, masked)
print(len(masked), len(masked) / 16, sorted(visible.tolist()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12 0.75 [1, 5, 7, 15]
