# -*- coding: utf-8 -*-
# ==========================================================================
# What slope means [maths-ai / Straight lines and slope]
# ==========================================================================
# WHAT IT IS
# Slope is "change per one": how much y changes when x increases by 1. Pick
# two points, find the rise (change in y) and the run (change in x), then
# divide: m = (y₂ − y₁) / (x₂ − x₁). Always say the units — for a taxi, slope
# is euros per kilometre.
#
# WHERE YOU USE IT
# A weight in a model is a slope: how much the output moves when that input
# moves by one.
#
# RUN IT:  python 01_lin-0.py
#

x1, y1 = 2, 7
x2, y2 = 5, 13
rise = y2 - y1
run = x2 - x1
print(rise, run, rise / run)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6 3 2.0
