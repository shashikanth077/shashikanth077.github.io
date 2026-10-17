# -*- coding: utf-8 -*-
# ==========================================================================
# Context managers: with open(...) [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# with open(...) as f: opens the file, runs the block and always closes it —
# even when an error is raised. Closing flushes buffered writes and frees the
# file handle. Manual open() and close() is easy to get wrong.
#
# WHERE YOU USE IT
# Unclosed files in a long training script leak handles and can leave
# half-written checkpoints.
#
# RUN IT:  python 06_files-5.py
#

# Manual: easy to forget the close
file = open("log.txt", "r", encoding="utf-8")
content = file.read()
file.close()

# Recommended: closes automatically, even on errors
with open("log.txt", "r", encoding="utf-8") as file:
    content = file.read()
print(file.closed)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
