# -*- coding: utf-8 -*-
# ==========================================================================
# The transaction event and what surrounds it [fraud-detection / Data and
# features]
# ==========================================================================
# WHAT IT IS
# The raw event is small: card id, amount, currency, merchant and its
# category, country and terminal type, time, often a device id and IP address
# for online payments. Alone it says little; a fraud system's power comes from
# context joined to it in milliseconds: the card's past behaviour (typical
# amounts, usual merchants, home location), the merchant's own risk
# (chargeback history, new or old), the device's history across all cards, and
# lists (known-bad devices, allow-listed customers). The art is deciding which
# context is worth fetching within the latency budget, and building it so that
# exactly the same context is available later for training.
#
# WHERE YOU USE IT
# Treat the event schema as a contract: version it, validate it at the edge,
# and never let a field's meaning change silently (a currency or time-zone
# slip corrupts every feature built on it).
#
# RUN IT:  python 01_data-0.py
#

event = {
    "event_id": "e_9f12", "card_id": "c_81f2", "amount": 49.90, "currency": "EUR",
    "merchant_id": "m_0042", "mcc": 5812, "country": "FR", "channel": "online",
    "device_id": "d_44a1", "ip": "203.0.113.7", "ts": "2026-10-17T10:02:11Z",
}
required = {"event_id", "card_id", "amount", "currency", "merchant_id", "ts"}
missing = required - event.keys()
print("valid" if not missing else f"missing: {sorted(missing)}")
print("fields:", len(event))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# valid
# fields: 11
