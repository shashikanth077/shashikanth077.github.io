# -*- coding: utf-8 -*-
# ==========================================================================
# Line chart: how does something change? [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# Use ax.plot(x, y) when the order of the points matters — days, hours,
# epochs. The line joins the points so the eye follows the trend, and
# marker="o" marks each real measurement. Drag Saturday's value and watch the
# whole shape respond; you see the highest and lowest day without reading a
# number.
#
# WHERE YOU USE IT
# Training loss per epoch, daily active users, sensor readings, price history
# — anything measured in sequence is a line chart.
#
# RUN IT:  python 01_chart-1.py
#

import matplotlib.pyplot as plt

days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
steps = [4000, 6000, 5500, 7500, 9000, 11000, 8500]

fig, ax = plt.subplots()
ax.plot(days, steps, color="royalblue", linewidth=2,
        marker="o", label="Daily steps")
ax.set(title="Walking Progress", xlabel="Day", ylabel="Steps")
ax.grid(alpha=0.3)
ax.legend()
plt.show()
