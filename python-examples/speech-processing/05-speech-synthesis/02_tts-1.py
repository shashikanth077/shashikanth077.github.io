# -*- coding: utf-8 -*-
# ==========================================================================
# Text normalisation and phonemes [speech-processing / Speech synthesis]
# ==========================================================================
# WHAT IT IS
# Written text is ambiguous when read aloud. "1984" is a year (nineteen
# eighty-four) or a quantity (one thousand nine hundred eighty-four); "St." is
# Saint or Street; "read" has two pronunciations; "lead" too. Text
# normalisation expands such tokens with rules or learned models. A
# grapheme-to-phoneme (G2P) step then maps spellings to sounds using a
# pronunciation dictionary (CMUdict has ≈ 134,000 words) and a neural fallback
# for unknown words. English has about 40 phonemes; spelling is a poor guide
# ("though", "through", "tough"), so G2P is necessary even for English. Stress
# marks (1 = primary) carry rhythm.
#
# WHERE YOU USE IT
# Maintain a custom lexicon for brand and person names; mispronounced names
# are the commonest user complaint.
#
# RUN IT:  python 02_tts-1.py
#

lexicon = {"cat": "K AE1 T", "read": ["R EH1 D", "R IY1 D"], "though": "DH OW1", "tough": "T AH1 F"}
for w, p in lexicon.items():
    print(f"{w:8s} {p}")
print(sum(isinstance(v, list) for v in lexicon.values()), "ambiguous word(s)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# cat      K AE1 T
# read     ['R EH1 D', 'R IY1 D']
# though   DH OW1
# tough    T AH1 F
# 1 ambiguous word(s)
