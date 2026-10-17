# -*- coding: utf-8 -*-
# ==========================================================================
# Text, audio and video generation [generative-ai / Multimodal and other
# media]
# ==========================================================================
# WHAT IT IS
# The same ideas reach other media. Speech: a language model over audio tokens
# (codec tokens) or a diffusion/flow model turns text into voice. Music:
# models predict audio tokens or denoise spectrogram latents. Video: diffusion
# over space-time latents — a 5-second 24 fps clip is 120 frames, so efficient
# compression and temporal consistency are the hard parts. Code: language
# models trained on repositories complete, explain and test programs. 3-D:
# models produce meshes or neural scenes. Quality improves quickly, but cost,
# consistency over long durations and the control of fine detail remain open
# problems.
#
# WHERE YOU USE IT
# Always disclose and label synthetic media in public-facing work.
#
# RUN IT:  python 02_multi-1.py
#

print(5 * 24, "frames")
latent_per_frame = 64 * 64 * 4
print(5 * 24 * latent_per_frame / 1e6, "million latent numbers for the clip")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 120 frames
# 1.96608 million latent numbers for the clip
