# -*- coding: utf-8 -*-
# ==========================================================================
# Why files: memory versus disk [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Variables live in memory (RAM) and disappear when the program ends; files
# live on disk and survive. A program reads a file into memory, works on the
# data there and writes the results back. Read, write and append are the three
# basic actions.
#
# WHERE YOU USE IT
# Datasets, trained weights, logs and metrics are all files. The load →
# process → save loop is the backbone of every ML pipeline.
#
# RUN IT:  python 01_files-0.py
#

with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Learn Python today!\n")

with open("notes.txt", "r", encoding="utf-8") as file:
    print(file.read())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Learn Python today!
