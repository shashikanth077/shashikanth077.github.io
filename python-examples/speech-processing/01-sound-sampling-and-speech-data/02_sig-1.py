# -*- coding: utf-8 -*-
# ==========================================================================
# Sampling and the Nyquist limit [speech-processing / Sound, sampling and
# speech data]
# ==========================================================================
# WHAT IT IS
# A computer stores the wave as numbers measured fs times per second (the
# sampling rate). To capture a frequency f you need more than two samples per
# cycle: the highest representable frequency is the Nyquist frequency fs/2.
# Telephones use fs = 8 kHz (up to 4 kHz — enough for intelligibility, not for
# the "s" and "f" detail), wideband speech 16 kHz (8 kHz), music CDs 44.1 kHz
# (22.05 kHz). Speech recognition models are usually trained at 16 kHz; audio
# recorded at another rate must be resampled first.
#
# WHERE YOU USE IT
# Resample with a low-pass filter before downsampling: simply dropping samples
# causes aliasing.
#
# RUN IT:  python 02_sig-1.py
#

for fs in (8000, 16000, 44100):
    print(fs, "Hz ->", fs / 2, "Hz Nyquist")
print(16000 * 2 * 60 / 1e6, "MB per minute of 16-bit mono at 16 kHz")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8000 Hz -> 4000.0 Hz Nyquist
# 16000 Hz -> 8000.0 Hz Nyquist
# 44100 Hz -> 22050.0 Hz Nyquist
# 1.92 MB per minute of 16-bit mono at 16 kHz
