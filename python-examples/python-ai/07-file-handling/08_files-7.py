# -*- coding: utf-8 -*-
# ==========================================================================
# Handling file errors with try / except [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Catch the specific errors you expect — FileNotFoundError, PermissionError,
# UnicodeDecodeError — and handle each one sensibly. A bare except: hides real
# bugs. else runs when nothing failed, and finally always runs.
#
# WHERE YOU USE IT
# A pipeline that processes 10,000 files shouldn't die on one missing file:
# catch it, log it, continue — but never silently.
#
# RUN IT:  python 08_files-7.py
#

from pathlib import Path

path = Path("customers.txt")
try:
    text = path.read_text(encoding="utf-8")
except FileNotFoundError:
    print("File missing. Check the path.")
except PermissionError:
    print("No permission to read this file.")
else:
    print("Read", len(text), "characters")
finally:
    print("done")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# File missing. Check the path.
# done
