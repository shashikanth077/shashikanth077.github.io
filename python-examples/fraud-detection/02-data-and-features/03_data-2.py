# -*- coding: utf-8 -*-
# ==========================================================================
# Velocity features and time windows [fraud-detection / Data and features]
# ==========================================================================
# WHAT IT IS
# Fraud is often about speed: five purchases in three minutes, fifty cards on
# one device in an hour. Velocity features count or sum events in a window
# ending now. A tumbling window cuts time into fixed, non-overlapping blocks
# (00:00–00:10, 00:10–00:20): cheap, but a burst split across a boundary looks
# small. A sliding window always covers "the last 10 minutes", so it never
# misses a burst, but needs more state. A session window groups events
# separated by gaps. Typical features: count of transactions in 1 min / 10 min
# / 1 h, distinct merchants in the last hour, sum of amounts in the last day,
# each per card, per device and per IP.
#
# WHERE YOU USE IT
# Use several window lengths together: short windows catch bursts, long ones
# define normal. Keep window state small with counters and expiry, not raw
# event lists.
#
# RUN IT:  python 03_data-2.py
#

from collections import deque

def sliding_counts(times, window=600):
    """For each event, how many events (including itself) happened in the last window seconds."""
    q, out = deque(), []
    for t in times:
        q.append(t)
        while q and t - q[0] > window:
            q.popleft()
        out.append(len(q))
    return out

times = [0, 100, 200, 590, 605, 610, 900, 2000]
print("sliding 10 min :", sliding_counts(times))
print("tumbling 10 min:", [sum(1 for u in times if u // 600 == t // 600 and u <= t) for t in times])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# sliding 10 min : [1, 2, 3, 4, 4, 5, 4, 1]
# tumbling 10 min: [1, 2, 3, 4, 1, 2, 3, 1]
