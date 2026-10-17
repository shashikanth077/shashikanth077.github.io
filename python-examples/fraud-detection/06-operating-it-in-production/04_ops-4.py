# -*- coding: utf-8 -*-
# ==========================================================================
# Scale and cost: how many instances for peak traffic? [fraud-detection /
# Operating it in production]
# ==========================================================================
# WHAT IT IS
# Traffic is bursty — Black Friday can be several times a normal day — and the
# system must be sized for the peak, not the average. A rough capacity
# estimate: instances = peak requests per second ÷ (capacity of one instance ×
# target utilisation), rounded up, plus spare capacity so losing a node or a
# zone does not tip the service over. Keep utilisation well below 100 % (a
# common target is 50–60 %) because latency rises sharply as a server
# approaches saturation, and the p99 is what customers feel. Run load tests
# with realistic bursts, scale the feature store and the stream partitions
# with the same traffic, and watch the cost per million decisions as a
# first-class metric.
#
# WHERE YOU USE IT
# Autoscale on request rate and latency, pre-scale for known events, and keep
# enough partitions that you can add workers without re-keying.
#
# RUN IT:  python 04_ops-4.py
#

import math
peak_rps, per_instance_rps, target_utilisation, spare = 6000, 800, 0.6, 2
needed = math.ceil(peak_rps / (per_instance_rps * target_utilisation))
print("instances at 60% utilisation:", needed)
print("with 2 spare (lose a zone safely):", needed + spare)
print("instances if run at 100% (no headroom):", math.ceil(peak_rps / per_instance_rps))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# instances at 60% utilisation: 13
# with 2 spare (lose a zone safely): 15
# instances if run at 100% (no headroom): 8
