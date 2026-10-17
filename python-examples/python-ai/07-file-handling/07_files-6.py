# -*- coding: utf-8 -*-
# ==========================================================================
# pathlib for paths [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# Path objects join with / and have methods like exists(), mkdir(parents=True,
# exist_ok=True), read_text(), write_text() and glob(".txt"), plus properties
# such as name and suffix. They work the same on Windows, macOS and Linux.
#
# WHERE YOU USE IT
# Organising experiments into folders like runs/exp1/metrics.json is a few
# Path operations.
#
# RUN IT:  python 07_files-6.py
#

from pathlib import Path

folder = Path("reports")
folder.mkdir(parents=True, exist_ok=True)
report = folder / "daily.txt"
report.write_text("Sales: 25\n", encoding="utf-8")
print(report.exists(), report.name, report.suffix)
print(report.read_text(encoding="utf-8"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True daily.txt .txt
# Sales: 25
