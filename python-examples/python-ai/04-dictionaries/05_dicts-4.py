# -*- coding: utf-8 -*-
# ==========================================================================
# Nested data: lists of dictionaries [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# APIs and JSON files usually give a list of dictionaries — one dict per
# record. Loop over the list, read fields by key and compute with them. A dict
# can also hold a list (like marks) as a value, so structures nest to any
# depth.
#
# WHERE YOU USE IT
# A dataset loaded from JSON, or from a CSV with DictReader, has exactly this
# shape; turning it into a table (a DataFrame) is the next step.
#
# RUN IT:  python 05_dicts-4.py
#

students = [
    {"name": "Asha", "marks": [80, 90]},
    {"name": "Ravi", "marks": [70, 85]},
]
for student in students:
    avg = sum(student["marks"]) / len(student["marks"])
    print(student["name"], "average:", avg)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Asha average: 85.0
# Ravi average: 77.5
