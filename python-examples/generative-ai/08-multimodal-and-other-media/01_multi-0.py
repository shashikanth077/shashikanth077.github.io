# -*- coding: utf-8 -*-
# ==========================================================================
# Multimodal models [generative-ai / Multimodal and other media]
# ==========================================================================
# WHAT IT IS
# A multimodal model accepts or produces several kinds of data. The common
# design turns each modality into tokens or embeddings in a shared space: an
# image encoder (a vision transformer) cuts an image into patches and maps
# each to a vector that is fed to the language model like words. A 336 × 336
# image with 14 × 14 patches becomes 24 × 24 = 576 visual tokens — comparable
# to several paragraphs of text in the context window. Audio is handled with a
# spectrogram encoder, video as a sequence of frames. Uses: describing images,
# reading charts and documents, answering questions about screenshots,
# transcription and spoken dialogue.
#
# WHERE YOU USE IT
# Count image tokens in your budget: a single high-resolution image can cost
# as much as a page of text.
#
# RUN IT:  python 01_multi-0.py
#

size, patch = 336, 14
n = (size // patch) ** 2
print(n)
for side in (224, 336, 672):
    print(side, (side // patch) ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 576
# 224 256
# 336 576
# 672 2304
