# -*- coding: utf-8 -*-
# ==========================================================================
# Prosody, expressiveness and voice cloning [speech-processing / Speech
# synthesis]
# ==========================================================================
# WHAT IT IS
# Prosody — pitch contour, rhythm, loudness, pauses — carries emphasis,
# questions and emotion. Flat prosody sounds robotic. Models add controls:
# speaker embeddings (voice identity), style tokens, reference audio, or
# explicit pitch and duration. Zero-shot voice cloning conditions on a few
# seconds of a target speaker's audio and generates new text in that voice. It
# enables accessibility tools (restoring a patient's voice) and creative uses,
# but also fraud and impersonation: use consent, watermark generated audio,
# and detect synthetic speech. Rising pitch at the end of a sentence turns "It
# works." into "It works?".
#
# WHERE YOU USE IT
# Clone only with documented consent; disclose synthetic voices in
# public-facing products.
#
# RUN IT:  python 05_tts-4.py
#

import numpy as np

t = np.linspace(0, 1, 5)
statement = 120 - 20 * t
question = 120 + 40 * t
print(statement.round(0).tolist(), question.round(0).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [120.0, 115.0, 110.0, 105.0, 100.0] [120.0, 130.0, 140.0, 150.0, 160.0]
