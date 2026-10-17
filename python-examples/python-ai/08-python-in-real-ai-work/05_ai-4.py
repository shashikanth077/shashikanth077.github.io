# -*- coding: utf-8 -*-
# ==========================================================================
# A tiny ML pipeline, end to end [python-ai / Python in real AI work]
# ==========================================================================
# WHAT IT IS
# Real projects chain what you've learned: load a CSV into a list of dicts,
# build features and labels as lists, "fit" something simple, predict, score
# with a metric function and save the results as JSON. Swap the toy rule for a
# real model and the shape stays the same.
#
# WHERE YOU USE IT
# This load → transform → fit → evaluate → save loop is the shape of every ML
# script, from a threshold rule to a neural network.
#
# RUN IT:  python 05_ai-4.py
#

import csv, json

with open("students.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))                   # list of dicts

X = [float(r["hours"]) for r in rows]                # features: a list
y = [1 if r["passed"] == "yes" else 0 for r in rows] # labels: a list

threshold = sum(X) / len(X)                          # "fit": learn a number
pred = [int(x >= threshold) for x in X]              # predict
accuracy = sum(p == t for p, t in zip(pred, y)) / len(y)
print(round(threshold, 2), accuracy)

with open("metrics.json", "w", encoding="utf-8") as f:
    json.dump({"threshold": threshold, "accuracy": accuracy}, f)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4.67 1.0
