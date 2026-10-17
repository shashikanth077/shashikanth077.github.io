# -*- coding: utf-8 -*-
# ==========================================================================
# Cleaning and normalising text [nlp / Preprocessing and tokenization]
# ==========================================================================
# WHAT IT IS
# Cleaning decides what counts as "the same" text. Typical steps: fix encoding
# (UTF-8), strip HTML and URLs, lowercase, normalise Unicode and whitespace,
# expand or keep contractions, optionally remove punctuation and numbers. Each
# step trades information for consistency: lowercasing merges "Apple" the
# company with "apple" the fruit; removing "!" can erase sentiment. Apply the
# same recipe to training and live text, and decide per task rather than by
# habit.
#
# WHERE YOU USE IT
# Keep the raw text next to the cleaned text so you can audit mistakes later.
#
# RUN IT:  python 01_prep-0.py
#

import re

raw = "Visit <b>https://x.io</b> NOW!!  It's GREAT :-)"
text = re.sub(r"<[^>]+>", " ", raw)
text = re.sub(r"https?://\S+", "<URL>", text)
text = re.sub(r"\s+", " ", text).strip().lower()
print(text)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# visit <url> now!! it's great :-)
