# -*- coding: utf-8 -*-
# ==========================================================================
# Writing and appending [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# write(text) writes a string — it does not add a newline and doesn't accept
# numbers, so convert with str() or an f-string. writelines() writes a list of
# strings. Use w for a fresh file and a to add to the end.
#
# WHERE YOU USE IT
# Logging per-epoch metrics one line at a time in append mode means a crash
# still leaves everything written so far.
#
# RUN IT:  python 05_files-4.py
#

items = ["Bread", "Milk", "Eggs"]
with open("receipt.txt", "w", encoding="utf-8") as f:
    for item in items:
        f.write(item + "\n")
price = 12.50
with open("receipt.txt", "a", encoding="utf-8") as f:
    f.write(f"Total: {price:.2f}\n")
print(open("receipt.txt", encoding="utf-8").read())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Bread
# Milk
# Eggs
# Total: 12.50
