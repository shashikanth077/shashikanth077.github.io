# -*- coding: utf-8 -*-
# ==========================================================================
# Pie chart: what share of the whole? [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# ax.pie(shares, labels=names, autopct="%1.0f%%") cuts a circle into slices
# whose sizes add up to 100%. It works for two to five clearly different
# parts. Drag the rent slice: the others shrink together and it quickly
# becomes hard to say which of the small slices is biggest — that is why a bar
# chart is usually the better way to compare.
#
# WHERE YOU USE IT
# Use a pie only for a simple "part of a whole" message with few slices. For
# precise comparisons, or similar values, switch to bars.
#
# RUN IT:  python 10_chart-10.py
#

import matplotlib.pyplot as plt

categories = ["Rent", "Food", "Transport", "Other"]
shares = [45, 25, 15, 15]

fig, ax = plt.subplots()
ax.pie(shares, labels=categories, autopct="%1.0f%%", startangle=90)
ax.set_title("Monthly Budget")
plt.show()
