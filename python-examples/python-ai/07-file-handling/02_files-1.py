# -*- coding: utf-8 -*-
# ==========================================================================
# File paths: relative and absolute [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# A path says where a file lives. An absolute path starts at the root of the
# drive; a relative path starts at the current working directory — which is
# not always the folder of your script. pathlib.Path builds and inspects both
# safely across operating systems.
#
# WHERE YOU USE IT
# "File not found" on a teammate's machine is nearly always a relative path
# resolved against a different working directory. Build paths from the
# script's own location instead.
#
# RUN IT:  python 02_files-1.py
#

from pathlib import Path

print(Path.cwd())
print(Path("data/students.csv"))
print(Path(__file__).resolve().parent)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# /home/user/my_project
# data/students.csv
# /home/user/my_project
