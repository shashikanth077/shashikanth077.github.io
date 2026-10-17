# fraud-detection — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| Real-time fraud detection in one picture | `01-frame-the-problem/01_frame-0.py` |
| The latency budget | `01-frame-the-problem/02_frame-1.py` |
| Why accuracy is the wrong score | `01-frame-the-problem/03_frame-4.py` |
| The transaction event and what surrounds it | `02-data-and-features/01_data-0.py` |
| A simulator you can run: transactions with hidden fraud | `02-data-and-features/02_data-1.py` |
| Velocity features and time windows | `02-data-and-features/03_data-2.py` |
| Behaviour features: how different from this card's normal? | `02-data-and-features/04_data-3.py` |
| Geography: impossible travel | `02-data-and-features/05_data-4.py` |
| Linking devices, cards and people | `02-data-and-features/06_data-5.py` |
| Point-in-time correctness and label leakage | `02-data-and-features/07_data-7.py` |
| Labels: late, noisy and biased | `02-data-and-features/08_data-8.py` |
| Rules: fast, clear and brittle | `03-models-and-decisions/01_model-0.py` |
| A model from scratch: logistic regression | `03-models-and-decisions/02_model-1.py` |
| Anomaly detection when labels are scarce | `03-models-and-decisions/03_model-2.py` |
| Boosted trees: the workhorse for tabular fraud data | `03-models-and-decisions/04_model-3.py` |
| Class imbalance: weights, sampling and what they distort | `03-models-and-decisions/05_model-4.py` |
| Calibration: is a score of 0.3 really 30 %? | `03-models-and-decisions/06_model-5.py` |
| Choosing the threshold by cost | `03-models-and-decisions/07_model-6.py` |
| More than yes or no: approve, step up, review, decline | `03-models-and-decisions/08_model-7.py` |
| Layering lists, rules and models | `03-models-and-decisions/09_model-8.py` |
| Confusion matrix, precision and recall | `04-evaluation/01_eval-0.py` |
| ROC AUC vs precision–recall: why rare classes need PR | `04-evaluation/02_eval-1.py` |
| Measure in money, not just metrics | `04-evaluation/03_eval-2.py` |
| Time-ordered validation and backtesting | `04-evaluation/04_eval-3.py` |
| Alert budgets: precision at k and reviewer capacity | `04-evaluation/05_eval-4.py` |
| How sure are you? Few frauds, wide uncertainty | `04-evaluation/06_eval-5.py` |
| The decision service: timeouts and fallbacks | `05-real-time-serving/01_serve-1.py` |
| Partitioning and keyed state | `05-real-time-serving/02_serve-2.py` |
| Duplicates, retries and out-of-order events | `05-real-time-serving/03_serve-3.py` |
| Explaining a decision: reason codes | `05-real-time-serving/04_serve-5.py` |
| Drift: when the world moves under the model | `06-operating-it-in-production/01_ops-0.py` |
| Feedback loops and selection bias | `06-operating-it-in-production/02_ops-1.py` |
| Privacy, regulation and fairness | `06-operating-it-in-production/03_ops-3.py` |
| Scale and cost: how many instances for peak traffic? | `06-operating-it-in-production/04_ops-4.py` |
