# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing the model family from the goal [neural-networks / Translation and
# attention]
# ==========================================================================
# WHAT IT IS
# Match the tool to the business goal. Detect defects (normal vs defective
# photo) → a discriminative classifier. Learn compact features (compress
# MNIST) → an autoencoder. Generate images (synthetic digits) → a VAE or GAN.
# Translate a sentence → Seq2Seq with attention or a Transformer. Classify
# review sentiment → embedding + dense/CNN/RNN. The mixed lecture covers
# distinct research families: study them as connected but separate ideas.
#
# WHERE YOU USE IT
# Order that works well: autoencoder → VAE → attention maths → Seq2Seq → GAN.
#
# RUN IT:  python 05_text-4.py
#

goal_to_family = {
    "detect defects": "discriminative classifier",
    "compress features": "autoencoder",
    "generate images": "VAE or GAN",
    "translate": "seq2seq attention / transformer",
}
for g, f in goal_to_family.items():
    print(g, "->", f)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# detect defects -> discriminative classifier
# compress features -> autoencoder
# generate images -> VAE or GAN
# translate -> seq2seq attention / transformer
