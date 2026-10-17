# -*- coding: utf-8 -*-
# ==========================================================================
# CSV files [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# CSV is a plain-text table. Use the csv module rather than line.split(","),
# so quoted commas and newlines are handled. csv.DictReader gives each row as
# a dict keyed by the header; every value arrives as a string, so convert with
# int() or float(). Open with newline="".
#
# WHERE YOU USE IT
# Each row is a training example and each column a feature or label — the way
# most ML datasets arrive, before pandas takes over.
#
# RUN IT:  python 10_files-9.py
#

import csv

rows = [{"name": "Asha", "hours": 5, "passed": "yes"},
        {"name": "Ravi", "hours": 2, "passed": "no"}]
with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "hours", "passed"])
    writer.writeheader()
    writer.writerows(rows)

with open("students.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["hours"]) * 2, row["passed"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Asha 10 yes
# Ravi 4 no
