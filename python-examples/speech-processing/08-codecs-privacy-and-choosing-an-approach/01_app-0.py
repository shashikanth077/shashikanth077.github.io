# -*- coding: utf-8 -*-
# ==========================================================================
# Audio compression and codecs [speech-processing / Codecs, privacy and
# choosing an approach]
# ==========================================================================
# WHAT IT IS
# Raw 16-bit, 16 kHz mono audio is 256 kbit/s (1.92 MB per minute). Codecs
# shrink it. Speech codecs exploit the source–filter model: transmit the
# filter coefficients and a few source parameters instead of samples (AMR-WB:
# 6.6–23 kbit/s, Opus: 6–510 kbit/s, adaptive). Perceptual codecs (MP3, AAC)
# drop what the ear cannot hear (masked components). Lossless codecs (FLAC)
# compress to about half with perfect reconstruction. For ASR training prefer
# uncompressed or lossless data; lossy compression changes features slightly
# and a model trained on clean audio may degrade on heavily compressed calls.
#
# WHERE YOU USE IT
# Match the codec of your training data to the deployment channel, or augment
# with codec simulation.
#
# RUN IT:  python 01_app-0.py
#

bits_per_s = 16000 * 16
print(bits_per_s / 1000, "kbit/s", bits_per_s * 60 / 8 / 1e6, "MB per minute")
for name, kbps in {"AMR-WB": 12.65, "Opus (speech)": 24, "FLAC (approx)": 128}.items():
    print(name, round(bits_per_s / 1000 / kbps, 1), "x smaller")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 256.0 kbit/s 1.92 MB per minute
# AMR-WB 20.2 x smaller
# Opus (speech) 10.7 x smaller
# FLAC (approx) 2.0 x smaller
