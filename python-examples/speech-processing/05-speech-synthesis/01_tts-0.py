# -*- coding: utf-8 -*-
# ==========================================================================
# Text-to-speech: the pipeline [speech-processing / Speech synthesis]
# ==========================================================================
# WHAT IT IS
# A TTS system converts text into a waveform in stages: text analysis
# (normalise "Dr. Smith paid $5" into words, convert to phonemes, mark stress
# and phrase breaks), an acoustic model that predicts a mel spectrogram (and
# pitch, duration) from the phoneme sequence, and a vocoder that turns the
# spectrogram into audio samples. Older systems concatenated recorded units
# (concatenative) or generated parameters with HMMs (parametric); modern ones
# are neural end to end (Tacotron, FastSpeech, VITS) and sound nearly human.
#
# WHERE YOU USE IT
# The hardest part in practice is not the neural network but the text front
# end: numbers, abbreviations, names and foreign words.
#
# RUN IT:  python 01_tts-0.py
#

text = "Dr. Smith paid $5 on 3/4"
normalised = "Doctor Smith paid five dollars on March fourth"
phonemes = "D AA1 K T ER0   S M IH1 TH ..."
print(text, "->", normalised)
print(len(normalised.split()), "words")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Dr. Smith paid $5 on 3/4 -> Doctor Smith paid five dollars on March fourth
# 8 words
