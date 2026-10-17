# -*- coding: utf-8 -*-
# ==========================================================================
# Privacy, consent and deepfakes [speech-processing / Codecs, privacy and
# choosing an approach]
# ==========================================================================
# WHAT IT IS
# A voice is personal data: it identifies, reveals health and emotion, and can
# be cloned. Good practice: obtain consent and say what is recorded and why;
# minimise (process on the device, discard raw audio, keep transcripts only if
# needed); protect storage and transmission; allow deletion; evaluate fairness
# across accents, ages and genders (ASR error rates differ widely between
# groups — measure and report them). Synthetic speech enables fraud
# ("vishing"); countermeasures are liveness checks, multi-factor
# authentication, watermarking and anti-spoofing detectors trained on current
# generators — and they are an arms race.
#
# WHERE YOU USE IT
# Treat accuracy gaps between groups as bugs to fix with data, not as
# acceptable noise.
#
# RUN IT:  python 02_app-1.py
#

wer_by_group = {"group A": 0.06, "group B": 0.11, "group C": 0.19}
worst, best = max(wer_by_group.values()), min(wer_by_group.values())
print(wer_by_group, round(worst / best, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'group A': 0.06, 'group B': 0.11, 'group C': 0.19} 3.17
