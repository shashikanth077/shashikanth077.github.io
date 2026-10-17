# -*- coding: utf-8 -*-
# ==========================================================================
# What Matplotlib does: numbers become pictures [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# Matplotlib is Python's drawing library for data. You give it numbers, it
# draws a chart — and the chart shows a pattern that a table of numbers hides.
# Five days of coffee sales [10, 14, 13, 20, 26] are just digits until a line
# chart shows them climbing. It is the base that pandas, seaborn and most AI
# notebooks build their charts on.
#
# WHERE YOU USE IT
# Every training run, data check and model report ends in a chart: loss
# curves, feature distributions, confusion matrices. If you can read and write
# Matplotlib you can see what your model and data are doing.
#
# RUN IT:  python 01_start-0.py
#

import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
sales = [10, 14, 13, 20, 26]

plt.plot(days, sales, marker="o")
plt.title("Coffee Sales This Week")
plt.xlabel("Day")
plt.ylabel("Cups Sold")
plt.show()
