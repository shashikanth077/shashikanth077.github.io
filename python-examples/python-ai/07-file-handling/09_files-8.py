# -*- coding: utf-8 -*-
# ==========================================================================
# Text encoding: UTF-8 [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Files store bytes, not letters. An encoding maps characters to bytes
# (encode) and back (decode). UTF-8 handles every language and emoji; always
# pass encoding="utf-8" for text files so your code behaves the same on every
# operating system. The wrong encoding raises UnicodeDecodeError or garbles
# the text.
#
# WHERE YOU USE IT
# Multilingual NLP datasets are where a wrong encoding corrupts text silently
# — and garbage in is garbage out for your model.
#
# RUN IT:  python 09_files-8.py
#

message = "Labas"
data = message.encode("utf-8")
print(data)
print(list(data))
print(data.decode("utf-8"))
print("ą".encode("utf-8"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# b'Labas'
# [76, 97, 98, 97, 115]
# Labas
# b'\xc4\x85'
