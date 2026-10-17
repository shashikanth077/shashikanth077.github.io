# -*- coding: utf-8 -*-
# ==========================================================================
# Bias, privacy and responsible NLP [nlp / LLMs, responsibility and trends]
# ==========================================================================
# WHAT IT IS
# Models learn the statistics of their text, including stereotypes: an analogy
# test can return "man : doctor :: woman : nurse". Sentiment tools may rate
# sentences about some dialects or names lower. Text can also leak personal
# data (names, e-mails, medical details). Responsible practice: document the
# data and its limits, audit performance across groups, remove or mask
# personal data before training and logging, get consent, restrict use where
# errors cause harm, and give users a way to contest decisions. Fairness
# metrics are choices, not neutral facts — involve the affected people.
#
# WHERE YOU USE IT
# Slice every evaluation by language, dialect and demographic group where it
# is legitimate and lawful to do so.
#
# RUN IT:  python 03_now-2.py
#

scores = {"group A": [0.91, 0.89, 0.93], "group B": [0.78, 0.8, 0.75]}
means = {g: round(sum(v) / len(v), 3) for g, v in scores.items()}
print(means, round(max(means.values()) - min(means.values()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'group A': 0.91, 'group B': 0.777} 0.133
