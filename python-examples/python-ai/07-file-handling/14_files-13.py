# -*- coding: utf-8 -*-
# ==========================================================================
# File safety: validation and pickle [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Treat file contents and paths from outside as untrusted: validate formats,
# never build paths from raw user input, and never load unknown pickle or
# joblib files — deserialising them can execute arbitrary code. Prefer JSON,
# CSV or other data-only formats for sharing.
#
# WHERE YOU USE IT
# Downloading a "pretrained model" pickle from an unknown source is one of the
# easiest ways to be compromised in ML work.
#
# RUN IT:  python 14_files-13.py
#

from pathlib import Path

BASE = Path("uploads").resolve()
name = "../secrets.txt"              # untrusted input
target = (BASE / name).resolve()
print(target.is_relative_to(BASE))   # False -> reject it

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# False
