# -*- coding: utf-8 -*-
# ==========================================================================
# Point-in-time correctness and label leakage [fraud-detection / Data and
# features]
# ==========================================================================
# WHAT IT IS
# When you build training rows from history, a feature may only use what was
# known at that moment. Compute "transactions in the last 10 minutes" with a
# window that peeks 10 minutes into the future and the model learns from
# information it will never have in production: offline scores look brilliant,
# live performance collapses. This is label leakage (or temporal leakage) and
# it is easy to cause with joins on the wrong timestamp, aggregates over the
# whole dataset, or features updated after the label is known. The defence is
# a point-in-time join — for every training row, fetch each feature as of that
# row's time — plus a time-based validation split.
#
# WHERE YOU USE IT
# If an offline metric looks too good to be true, suspect leakage first.
# Compare the distribution of each feature offline versus in live logs.
#
# RUN IT:  python 07_data-7.py
#

# one card's events (minutes). The last three are fraud.
times = [0, 300, 600, 601, 602, 603]
fraud = [0, 0, 0, 1, 1, 1]

def correct(i):    # only events BEFORE this one, within 10 minutes
    return sum(1 for j in range(i) if times[i] - times[j] <= 10)

def leaky(i):      # peeks at events up to 10 minutes AFTER this one
    return sum(1 for j in range(len(times)) if j != i and abs(times[i] - times[j]) <= 10)

for i, t in enumerate(times):
    print(f"t={t:>3} fraud={fraud[i]} correct={correct(i)} leaky={leaky(i)}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# t=  0 fraud=0 correct=0 leaky=0
# t=300 fraud=0 correct=0 leaky=0
# t=600 fraud=0 correct=0 leaky=3
# t=601 fraud=1 correct=1 leaky=3
# t=602 fraud=1 correct=2 leaky=3
# t=603 fraud=1 correct=3 leaky=3
