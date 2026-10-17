# -*- coding: utf-8 -*-
# ==========================================================================
# Geography: impossible travel [fraud-detection / Data and features]
# ==========================================================================
# WHAT IT IS
# Locations give some of the strongest signals. Compute the distance between
# this transaction and the card's previous one with the haversine formula
# (great-circle distance on a sphere), divide by the time gap, and you get the
# implied speed. A coffee in Paris at 10:00 and a purchase in New York 40
# minutes later implies thousands of km/h: the card (or its details) is in two
# places. Other geo features: distance from home, a new country, mismatch
# between IP country and billing country. Beware legitimate cases —
# travellers, VPN users, cross-border online shops — which is why these are
# features for a model, not blunt rules.
#
# WHERE YOU USE IT
# Handle missing or low-precision locations (many online payments have only an
# IP-derived city); a default of "unknown" is better than a made-up distance.
#
# RUN IT:  python 05_data-4.py
#

import numpy as np

def haversine_km(lat1, lon1, lat2, lon2):
    p = np.pi / 180
    a = np.sin((lat2 - lat1) * p / 2) ** 2 + np.cos(lat1 * p) * np.cos(lat2 * p) * np.sin((lon2 - lon1) * p / 2) ** 2
    return 12742 * np.arcsin(np.sqrt(a))

paris, new_york = (48.8566, 2.3522), (40.7128, -74.0060)
km = haversine_km(*paris, *new_york)
minutes = 40
print("distance km:", round(float(km), 1))
print("implied speed km/h:", round(float(km / (minutes / 60))))
print("a jet flies about 900 km/h ->", "impossible" if km / (minutes / 60) > 1000 else "possible")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# distance km: 5837.2
# implied speed km/h: 8756
# a jet flies about 900 km/h -> impossible
