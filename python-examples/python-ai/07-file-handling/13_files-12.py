# -*- coding: utf-8 -*-
# ==========================================================================
# Moving, copying and safe replacement [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Create folders with mkdir(parents=True, exist_ok=True), move and copy with
# shutil, and delete with unlink() only when you are certain. To replace an
# important file safely, write a temporary file first and swap it in with
# os.replace: a crash then leaves the old file intact.
#
# WHERE YOU USE IT
# Overwriting a checkpoint in place and crashing mid-write destroys both the
# old and the new model. Write-then-rename protects you.
#
# RUN IT:  python 13_files-12.py
#

import os, tempfile
from pathlib import Path

path = Path("model_meta.json")
with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent,
                                 delete=False, suffix=".tmp") as tmp:
    tmp.write('{"version": 2}')
os.replace(tmp.name, path)
print(path.read_text())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {"version": 2}
