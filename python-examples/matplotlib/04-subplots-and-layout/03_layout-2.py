# -*- coding: utf-8 -*-
# ==========================================================================
# Shared axes and twin axes [matplotlib / Subplots and layout]
# ==========================================================================
# WHAT IT IS
# sharex=True or sharey=True makes panels use the same scale, so they can be
# compared fairly and the repeated numbers disappear. When two series share an
# x-axis but have different units — temperature and rainfall — ax2 =
# ax1.twinx() adds a second y-axis on the right. Colour each axis label like
# its series, and use twin axes sparingly; they can mislead.
#
# WHERE YOU USE IT
# Compare train and test panels with a shared y-axis; otherwise the same loss
# looks very different just because the scale differs.
#
# RUN IT:  python 03_layout-2.py
#

import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr"]
temp = [4, 7, 12, 17]
rain = [80, 60, 55, 40]

fig, ax1 = plt.subplots()
ax1.plot(months, temp, color="tomato", marker="o")
ax1.set_ylabel("Temperature (°C)", color="tomato")
ax2 = ax1.twinx()
ax2.bar(months, rain, alpha=0.3)
ax2.set_ylabel("Rain (mm)")
plt.show()
print(ax1.get_ylabel(), "|", ax2.get_ylabel())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Temperature (°C) | Rain (mm)
