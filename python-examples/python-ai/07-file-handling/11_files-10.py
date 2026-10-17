# -*- coding: utf-8 -*-
# ==========================================================================
# JSON files [python-ai / File handling]
# ==========================================================================
# WHAT IT IS
# JSON stores nested data as text: objects become dicts, arrays become lists.
# json.dump(data, file) and json.load(file) work on files; dumps and loads
# work on strings. Not everything is serialisable (sets, datetimes), and
# secrets must never go into a JSON file you commit.
#
# WHERE YOU USE IT
# Model configs, evaluation metrics and API responses are JSON. Saving a
# metrics.json next to every run makes experiments comparable.
#
# RUN IT:  python 11_files-10.py
#

import json

config = {"model": "student_predictor", "epochs": 20, "features": ["hours", "attendance"]}
with open("config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2)

with open("config.json", encoding="utf-8") as f:
    restored = json.load(f)
print(restored["epochs"], restored["features"][0])
print(json.dumps({"ok": True, "none": None}))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 20 hours
# {"ok": true, "none": null}
