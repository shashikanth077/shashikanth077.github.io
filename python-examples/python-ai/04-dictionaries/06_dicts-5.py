# -*- coding: utf-8 -*-
# ==========================================================================
# Hashable keys and dict comprehensions [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# Keys must be hashable: immutable things such as strings, numbers and tuples
# of those. Lists and dicts can't be keys. A dict comprehension builds a
# dictionary in one line, and enumerate pairs each item with its position —
# together they make label encodings.
#
# WHERE YOU USE IT
# Mapping class names to integer ids (label encoding) is one comprehension
# with enumerate, and the reverse map gives you names back from predictions.
#
# RUN IT:  python 06_dicts-5.py
#

squares = {n: n * n for n in range(1, 4)}
classes = ["cat", "dog", "bird"]
label_id = {name: i for i, name in enumerate(classes)}
print(squares)
print(label_id)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {1: 1, 2: 4, 3: 9}
# {'cat': 0, 'dog': 1, 'bird': 2}
