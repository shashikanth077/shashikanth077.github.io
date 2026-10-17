# -*- coding: utf-8 -*-
# ==========================================================================
# File modes: r, w, a, x [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# The mode in open(path, mode) decides what you may do: r read, w write (which
# erases existing content!), a append, x create-only (fails if the file
# already exists). Add b for binary and + for read and write.
#
# WHERE YOU USE IT
# Opening a precious results file with w by mistake empties it instantly. Use
# a for logs, and x when overwriting would be a bug.
#
# RUN IT:  python 03_files-2.py
#

with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Monday\n")
with open("diary.txt", "a", encoding="utf-8") as f:
    f.write("Tuesday\n")
with open("diary.txt", "w", encoding="utf-8") as f:
    f.write("Wednesday\n")
with open("diary.txt", encoding="utf-8") as f:
    print(f.read())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Wednesday
