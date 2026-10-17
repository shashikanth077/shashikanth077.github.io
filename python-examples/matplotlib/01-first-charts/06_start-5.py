# -*- coding: utf-8 -*-
# ==========================================================================
# Reading a plotting script line by line [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# Watch what each line really creates. plt.subplots() makes an empty Figure
# and Axes; ax.plot adds a line artist to the Axes; ax.set fills in text;
# plt.show() renders it. Variables like days and sales are ordinary Python
# lists — Matplotlib only reads them.
#
# WHERE YOU USE IT
# When a chart looks wrong, the cause is nearly always the data you passed in,
# not Matplotlib. Print the lists first.
#
# RUN IT:  python 06_start-5.py
#

import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed"]
sales = [10, 14, 13]
fig, ax = plt.subplots()
ax.plot(days, sales, marker="o")
ax.set(title="Sales", ylabel="Cups")
plt.show()
