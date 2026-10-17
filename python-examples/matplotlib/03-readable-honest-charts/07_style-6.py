# -*- coding: utf-8 -*-
# ==========================================================================
# Styles and rcParams [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# plt.style.use("ggplot") switches the look of every later chart in one line;
# plt.style.available lists the options. For one setting, change plt.rcParams
# — the dictionary of defaults — for example plt.rcParams["lines.linewidth"] =
# 3. Set them once at the top of a notebook so every chart in a report
# matches.
#
# WHERE YOU USE IT
# Consistent fonts, sizes and colours make a report look professional; style
# sheets give you that without editing every chart.
#
# RUN IT:  python 07_style-6.py
#

import matplotlib.pyplot as plt

plt.style.use("ggplot")
plt.rcParams["lines.linewidth"] = 3
print("ggplot" in plt.style.available)
print(plt.rcParams["lines.linewidth"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# 3.0
