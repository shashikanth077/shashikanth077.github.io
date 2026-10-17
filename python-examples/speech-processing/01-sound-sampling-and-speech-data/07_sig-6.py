# -*- coding: utf-8 -*-
# ==========================================================================
# The speech chain and its applications [speech-processing / Sound, sampling
# and speech data]
# ==========================================================================
# WHAT IT IS
# Speech technology maps between sound and text, or between sound and sound.
# Automatic speech recognition (ASR): speech → text (dictation, captions,
# voice assistants). Text-to-speech (TTS): text → speech (navigation, screen
# readers). Speaker recognition: who is speaking? Diarization: who spoke when?
# Speech enhancement: make noisy speech cleaner. Speech translation, emotion
# recognition, keyword spotting ("hey assistant") and voice conversion round
# out the field. Almost all share the same front end: a waveform turned into a
# time–frequency picture.
#
# WHERE YOU USE IT
# Choose the task definition carefully: a keyword spotter must run in
# milliseconds on a tiny chip, a transcription service can use a large model
# in the cloud.
#
# RUN IT:  python 07_sig-6.py
#

tasks = {
    "ASR": ("speech", "text"),
    "TTS": ("text", "speech"),
    "speaker verification": ("two utterances", "same person? yes/no"),
    "diarization": ("meeting audio", "speaker label per time segment"),
    "enhancement": ("noisy speech", "clean speech"),
}
for name, (i, o) in tasks.items():
    print(f"{name:20s} {i} -> {o}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ASR                  speech -> text
# TTS                  text -> speech
# speaker verification two utterances -> same person? yes/no
# diarization          meeting audio -> speaker label per time segment
# enhancement          noisy speech -> clean speech
