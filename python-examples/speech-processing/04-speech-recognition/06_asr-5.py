# -*- coding: utf-8 -*-
# ==========================================================================
# Attention encoder–decoder and transducers [speech-processing / Speech
# recognition]
# ==========================================================================
# WHAT IT IS
# Two other end-to-end designs avoid CTC's independence assumption. Attention
# encoder–decoder (Listen, Attend and Spell; the transformer ASR family): the
# encoder maps audio to hidden vectors, the decoder emits text token by token,
# attending to the encoder at each step and conditioning on its own previous
# tokens — like machine translation, from sound to text. It is accurate but
# needs the whole utterance, so it is awkward for live captions. The
# RNN-Transducer (RNN-T) adds a prediction network over previous tokens and a
# joint network, emitting tokens as audio arrives — the common choice for
# streaming on devices.
#
# WHERE YOU USE IT
# Streaming needs a small look-ahead (a few hundred ms) trading accuracy for
# latency.
#
# RUN IT:  python 06_asr-5.py
#

latency = {"CTC (streaming encoder)": 0.2, "RNN-T": 0.3, "attention enc-dec (offline)": 2.5}
for k, v in latency.items():
    print(f"{k:30s} ~{v} s after the speaker finishes a word")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# CTC (streaming encoder)        ~0.2 s after the speaker finishes a word
# RNN-T                          ~0.3 s after the speaker finishes a word
# attention enc-dec (offline)    ~2.5 s after the speaker finishes a word
