# -*- coding: utf-8 -*-
# ==========================================================================
# What NLP is, and where text comes from [nlp / Text sources and retrieval]
# ==========================================================================
# WHAT IT IS
# Natural language processing turns human language into something a program
# can search, classify, label, translate or generate. Text arrives from many
# sources: web pages and news, social media, reviews, e-mail, chat and support
# tickets, documents (PDF, Word), transcribed speech and code. Each source has
# its own problems — noise and spelling in tweets, boilerplate in web pages,
# layout in PDFs, recognition errors in transcripts. The first job of any NLP
# system is therefore to collect, clean and measure the text, not to train a
# model.
#
# WHERE YOU USE IT
# In production most NLP failures are data failures: wrong encoding,
# duplicated pages, leaked labels, a domain shift between training text and
# live text.
#
# RUN IT:  python 01_src-0.py
#

sources = {
    "tweets": "noisy spelling, emoji, hashtags",
    "web pages": "menus, ads and other boilerplate",
    "PDF reports": "broken line order, tables",
    "call transcripts": "speech-recognition errors",
}
for name, issue in sources.items():
    print(f"{name:17s} -> {issue}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# tweets            -> noisy spelling, emoji, hashtags
# web pages         -> menus, ads and other boilerplate
# PDF reports       -> broken line order, tables
# call transcripts  -> speech-recognition errors
