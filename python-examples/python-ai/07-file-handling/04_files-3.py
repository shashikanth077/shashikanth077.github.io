# -*- coding: utf-8 -*-
# ==========================================================================
# Reading files [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# read() returns the whole file as one string, readline() the next line,
# readlines() a list of lines, and looping for line in file streams one line
# at a time — best for big files. Lines keep their newline until you strip()
# them. After reading, the file pointer sits at the end; seek(0) rewinds it.
#
# WHERE YOU USE IT
# Large datasets and logs don't fit in memory, so iterating line by line is
# the default streaming approach.
#
# RUN IT:  python 04_files-3.py
#

# orders.txt:  Tea: 2 / Coffee: 1 / Sandwich: 3
with open("orders.txt", encoding="utf-8") as file:
    first = file.readline()
    rest = file.readlines()
print(repr(first))
print(rest)
with open("orders.txt", encoding="utf-8") as file:
    for line in file:
        print(line.strip())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 'Tea: 2\n'
# ['Coffee: 1\n', 'Sandwich: 3\n']
# Tea: 2
# Coffee: 1
# Sandwich: 3
