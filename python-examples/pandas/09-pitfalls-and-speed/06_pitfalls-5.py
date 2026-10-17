# -*- coding: utf-8 -*-
# ==========================================================================
# read_csv gotchas [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# Type inference is helpful until it is not: a zip code "00501" loads as the
# number 501 and loses its zeros; one stray text value turns a numeric column
# into text; "NA" in a country column becomes a missing value (Namibia is
# "NA"). Protect yourself with dtype=str for identifiers, na_values and
# keep_default_na=False where "NA" is real, and check df.dtypes straight after
# reading.
#
# WHERE YOU USE IT
# Ids and codes should be strings. Numeric-looking identifiers that lose
# leading zeros cause failed joins that are painful to trace.
#
# RUN IT:  python 06_pitfalls-5.py
#

import io
import pandas as pd

text = "zip,country\n00501,NA\n10001,US\n"
default = pd.read_csv(io.StringIO(text))
careful = pd.read_csv(io.StringIO(text), dtype={"zip": str}, keep_default_na=False)
print(default["zip"].tolist(), default["country"].tolist())
print(careful["zip"].tolist(), careful["country"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [501, 10001] [nan, 'US']
# ['00501', '10001'] ['NA', 'US']
