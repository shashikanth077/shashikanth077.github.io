# -*- coding: utf-8 -*-
# ==========================================================================
# Latent diffusion: work in a compressed space [generative-ai / Image
# generation with diffusion]
# ==========================================================================
# WHAT IT IS
# Denoising a 512 × 512 × 3 image directly means 786,432 numbers per step.
# Latent diffusion first compresses images with an autoencoder (a VAE) into a
# small latent — 64 × 64 × 4 = 16,384 numbers, 48 times fewer — runs the
# diffusion there, and decodes the final latent back to pixels. That is why
# Stable Diffusion runs on a consumer GPU. The pipeline has three networks: a
# text encoder (prompt → embeddings), a U-Net or transformer denoiser (works
# on latents, conditioned through cross-attention) and the VAE decoder. Video
# and 3-D generators extend the latent with a time dimension.
#
# WHERE YOU USE IT
# Fine details such as small text and faces are limited by the autoencoder's
# reconstruction quality.
#
# RUN IT:  python 05_diff-4.py
#

pixels = 512 * 512 * 3
latent = 64 * 64 * 4
print(pixels, latent, pixels / latent)
print(512 / 64, "x downsampling per side")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 786432 16384 48.0
# 8.0 x downsampling per side
