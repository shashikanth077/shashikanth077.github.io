# -*- coding: utf-8 -*-
# ==========================================================================
# Capstone projects and a study order [neural-networks / Autoencoders, VAEs
# and GANs]
# ==========================================================================
# WHAT IT IS
# Pick one project to implement, evaluate, document and present. A: MNIST
# autoencoder and VAE — load, normalise, hold out validation, build
# encoder/decoder, optimise reconstruction (+KL), plot learning curves,
# compare original vs reconstructed digits, plot the 2-D latent map and sample
# new digits. B: attention for translation — aligned sentence pairs, tokenise,
# split, encoder/decoder, attention weights, teacher forcing, decode, BLEU
# plus human examples. C: GAN digit generator — generator and discriminator on
# MNIST trained alternately, saving an image grid each epoch. Study order:
# autoencoder → VAE → attention maths → Seq2Seq → GAN.
#
# WHERE YOU USE IT
# These are separate research families; study them as connected but different
# ideas.
#
# RUN IT:  python 10_gen-9.py
#

order = ["autoencoder", "VAE", "attention maths", "Seq2Seq", "GAN"]
print(" -> ".join(order), len(order))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# autoencoder -> VAE -> attention maths -> Seq2Seq -> GAN 5
