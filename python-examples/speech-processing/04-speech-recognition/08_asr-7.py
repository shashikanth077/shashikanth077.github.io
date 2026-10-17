# -*- coding: utf-8 -*-
# ==========================================================================
# Large multilingual models such as Whisper [speech-processing / Speech
# recognition]
# ==========================================================================
# WHAT IT IS
# Whisper-style models are transformers trained on hundreds of thousands of
# hours of weakly labelled web audio in about a hundred languages. The encoder
# reads a 30-second log-mel spectrogram (80 × 3,000 frames); the decoder
# produces tokens conditioned on special task tokens — language, transcribe or
# translate, timestamps. Strengths: robust to accents and noise with no
# fine-tuning, punctuation and casing included, one model for many languages.
# Weaknesses: can hallucinate fluent text on silence or music, slower than
# small streaming models, limited vocabulary control. Always check on your own
# audio and add a VAD in front.
#
# WHERE YOU USE IT
# Chunking long audio into 30 s windows needs overlap handling or timestamps
# will drift.
#
# RUN IT:  python 08_asr-7.py
#

print(30 * 100, (80, 30 * 100))
chunks = [(s, min(s + 30, 100)) for s in range(0, 100, 30)]
print(chunks)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3000 (80, 3000)
# [(0, 30), (30, 60), (60, 90), (90, 100)]
