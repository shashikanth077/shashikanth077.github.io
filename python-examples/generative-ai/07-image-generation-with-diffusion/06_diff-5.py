# -*- coding: utf-8 -*-
# ==========================================================================
# Controlling image generation [generative-ai / Image generation with
# diffusion]
# ==========================================================================
# WHAT IT IS
# Beyond the prompt, generators accept further controls. Image-to-image: start
# from a noised version of an input image instead of pure noise; the amount of
# noise (strength) decides how much changes. Inpainting: regenerate a masked
# region only. ControlNet-style conditioning: guide with edges, depth or pose.
# LoRA adapters: a few MB teach a style or a character. Seeds: fixing the
# random seed reproduces an image. Responsible use: filter prompts and
# outputs, label synthetic images (watermarks, provenance metadata), respect
# the rights of artists and the likeness of people.
#
# WHERE YOU USE IT
# Record the seed, sampler, steps, scale and model version of every generated
# asset: otherwise it cannot be reproduced.
#
# RUN IT:  python 06_diff-5.py
#

steps, strength = 50, 0.6
print(int(steps * strength), "denoising steps run on the noised input image")
for s in (0.2, 0.6, 1.0):
    print(s, "keeps", round(1 - s, 1), "of the original structure (roughly)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 30 denoising steps run on the noised input image
# 0.2 keeps 0.8 of the original structure (roughly)
# 0.6 keeps 0.4 of the original structure (roughly)
# 1.0 keeps 0.0 of the original structure (roughly)
