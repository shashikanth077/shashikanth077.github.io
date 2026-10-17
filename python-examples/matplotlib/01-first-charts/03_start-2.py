# -*- coding: utf-8 -*-
# ==========================================================================
# Your first plot, command by command [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# A chart is built by a short list of commands, and nothing appears until the
# last one. plt.plot(x, y) puts the data on the chart, plt.title, plt.xlabel
# and plt.ylabel name it, and plt.show() displays the finished picture. Drag
# the slider to run the commands one at a time.
#
# WHERE YOU USE IT
# A chart without a title, axis labels and units is a guess. Build the habit
# of adding all three before you show or save anything.
#
# RUN IT:  python 03_start-2.py
#

import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5]
sales = [10, 14, 13, 20, 26]

plt.plot(days, sales, marker="o")
plt.title("Coffee Sales This Week")
plt.xlabel("Day (1 = Mon … 5 = Fri)")
plt.ylabel("Cups sold")
plt.show()
