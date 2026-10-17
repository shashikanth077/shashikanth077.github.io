# -*- coding: utf-8 -*-
# ==========================================================================
# Keyword spotting and wake words [speech-processing / Speech recognition]
# ==========================================================================
# WHAT IT IS
# A wake word ("hey assistant") must be detected continuously, on a battery,
# with almost no false alarms. A tiny network (20–500 KB, a few million
# operations per frame) listens to log-mel features of a sliding one-second
# window and outputs P(keyword). Two numbers matter: false rejects (the user
# spoke and nothing happened) and false accepts (it woke up on the TV). One
# false accept per 24 hours of audio is a typical requirement. Triggering lets
# a bigger recogniser start only when needed — privacy and power savings.
# Train with many speakers, accents and noise, and with lots of hard negatives
# (similar-sounding words).
#
# WHERE YOU USE IT
# Report the false-accept rate per hour at a fixed false-reject rate, not
# accuracy.
#
# RUN IT:  python 09_asr-8.py
#

fa, hours = 5, 100
print(fa / hours * 24, "false accepts per 24 h")
window, hop = 1.0, 0.1
print(int((60 - window) / hop) + 1, "windows per minute")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.2000000000000002 false accepts per 24 h
# 591 windows per minute
