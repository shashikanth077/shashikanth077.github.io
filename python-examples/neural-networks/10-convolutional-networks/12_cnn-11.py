# -*- coding: utf-8 -*-
# ==========================================================================
# LeNet, AlexNet, VGG16 and ResNet [neural-networks / Convolutional networks]
# ==========================================================================
# WHAT IT IS
# LeNet: early CNN for digits (convolution, subsampling, fully connected).
# AlexNet (2012): showed deep CNNs work on large-scale ImageNet recognition.
# VGG16: repeated 3×3 convolutions with 16 learnable weight layers. ResNet:
# adds an identity shortcut so a layer learns a residual F(x) and outputs F(x)
# + x, letting very deep models train because gradients can flow along the
# shortcut. Example: x = 2, F(x) = 1.5 → output 3.5. A skip connection is not
# "skipping training".
#
# WHERE YOU USE IT
# Benchmark scores on ImageNet and human recognition are not the same
# comparison — avoid claims like "AlexNet beat humans".
#
# RUN IT:  python 12_cnn-11.py
#

x, fx = 2.0, 1.5
print(fx + x)
print(0.5 ** 20, 1.0 ** 20)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.5
# 9.5367431640625e-07 1.0
