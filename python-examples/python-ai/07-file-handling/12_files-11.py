# -*- coding: utf-8 -*-
# ==========================================================================
# Binary files and chunked reading [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Images, audio, PDFs and model weights are bytes, not text: open them with rb
# / wb and no encoding. Read big files in fixed-size chunks so memory stays
# flat. shutil.copy2 copies a whole file and keeps its metadata.
#
# WHERE YOU USE IT
# Loading images for a vision model means reading binary files, and
# checkpoints are binary too. Chunking avoids loading gigabytes at once.
#
# RUN IT:  python 12_files-11.py
#

with open("photo.jpg", "rb") as source, open("photo_copy.jpg", "wb") as target:
    while True:
        chunk = source.read(64 * 1024)
        if not chunk:
            break
        target.write(chunk)
