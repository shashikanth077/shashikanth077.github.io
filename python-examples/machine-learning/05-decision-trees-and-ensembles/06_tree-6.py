# -*- coding: utf-8 -*-
# ==========================================================================
# Gradient boosting: add small corrections [machine-learning / Decision trees
# and ensembles]
# ==========================================================================
# WHAT IT IS
# Boosting builds the model in stages. Keep a log-odds score F and convert it
# with the sigmoid p = 1/(1 + e⁻ᶠ). Start from the base rate: if 40% of emails
# are Spam, F₀ = ln(0.4/0.6) ≈ −0.4055, p₀ = 0.4. Each new small tree is
# fitted to the direction that reduces the loss (for logistic loss the signal
# is y − p) and added with a learning rate η: F_new = F_old + η·h(x). With the
# supplied corrections 0.8 and 0.6 and η = 0.5 the probability climbs 0.40 →
# 0.4986 → 0.5731 and crosses the 0.5 threshold. Drag the stage.
#
# WHERE YOU USE IT
# The corrections 0.8 and 0.6 are teaching values; real trees learn leaf
# values from gradients. Smaller η needs more trees; depth, η, stages and
# early stopping interact. AdaBoost, not gradient boosting, "re-weights wrong
# rows".
#
# RUN IT:  python 06_tree-6.py
#

import numpy as np

sigmoid = lambda f: 1 / (1 + np.exp(-f))
F0 = np.log(0.4 / 0.6)
F1 = F0 + 0.5 * 0.8
F2 = F1 + 0.5 * 0.6
for F in (F0, F1, F2):
    print(round(float(F), 4), round(float(sigmoid(F)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -0.4055 0.4
# -0.0055 0.4986
# 0.2945 0.5731
