# -*- coding: utf-8 -*-
# ==========================================================================
# Famous CNN architectures [computer-vision / Image classification with CNNs]
# ==========================================================================
# WHAT IT IS
# LeNet (1998): the first practical CNN for digits. AlexNet (2012): deeper,
# ReLU, dropout and GPUs — won ImageNet by a wide margin and started the
# deep-learning era. VGG: only 3×3 convolutions stacked deeply (16–19 layers),
# simple but with 138 million parameters. Inception/GoogLeNet: parallel filter
# sizes in one block. ResNet: skip connections let networks reach 50–152
# layers by learning residuals F(x) + x. EfficientNet scales depth, width and
# resolution together; MobileNet uses depthwise-separable convolutions to run
# on phones.
#
# WHERE YOU USE IT
# For a new project start from a pretrained ResNet or EfficientNet rather than
# designing a network.
#
# RUN IT:  python 03_cls-2.py
#

def conv_params(k, cin, cout):
    return k * k * cin * cout + cout

def separable(k, cin, cout):
    return k * k * cin + cin * cout

print(conv_params(3, 128, 128), separable(3, 128, 128))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 147584 17536
