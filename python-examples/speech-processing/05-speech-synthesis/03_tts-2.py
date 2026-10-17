# -*- coding: utf-8 -*-
# ==========================================================================
# Acoustic models: Tacotron and FastSpeech [speech-processing / Speech
# synthesis]
# ==========================================================================
# WHAT IT IS
# Tacotron is an attention-based encoder–decoder: phonemes in, mel frames out,
# one step at a time, with attention learning the alignment. It sounds natural
# but can skip or repeat words and is slow. FastSpeech removes attention: a
# duration predictor says how many frames each phoneme lasts, the phoneme
# representations are repeated accordingly (a "length regulator") and all mel
# frames are generated in parallel. For phonemes with durations (3, 5, 2)
# frames the output has 3 + 5 + 2 = 10 frames. Predicted pitch and energy are
# added for prosody; changing durations speeds the voice up or down without
# changing its pitch.
#
# WHERE YOU USE IT
# Non-autoregressive models are robust (no skipped words) and fast enough for
# real-time synthesis on a CPU.
#
# RUN IT:  python 03_tts-2.py
#

import numpy as np

phonemes = ["A", "B", "C"]
durations = [3, 5, 2]
expanded = np.repeat(phonemes, durations)
print(expanded.tolist(), len(expanded))
print(len(np.repeat(phonemes, [int(round(d * 1.5)) for d in durations])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'C', 'C'] 10
# 15
