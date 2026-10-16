import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- reinforcement-learning`. */

export const basics: ConceptDef[] = [
  {
    t: "The agent–environment loop",
    lv: 1,
    s: `In {{reinforcement learning}} an {{agent}} learns by interacting with an {{environment}}. At every step the agent observes a {{state}} s, chooses an {{action}} a, and the environment answers with a {{reward}} r and a new state s′. Nobody tells the agent the right action; it only sees how well things went. The goal is to choose actions that maximise the total reward collected over time. A robot vacuum, a game-playing program, a trading bot and a chatbot tuned by human feedback all fit this loop.`,
    r: `The hard parts are not in the loop itself: rewards can arrive long after the action that caused them, and the agent's own choices decide which data it gets to see.`,
    i: `Name the agent, environment, state, action and reward for a robot vacuum.`,
    c: py`
import random

random.seed(0)
state, total = 0, 0
for t in range(5):
    action = random.choice(["left", "right"])
    next_state = state + (1 if action == "right" else -1)
    reward = 1 if next_state == 3 else 0
    print(t, state, action, "->", next_state, reward)
    state, total = next_state, total + reward
print("total reward", total)`,
    v: rowflow("One turn of the interaction loop.", ["Agent", "Action a", "Environment", "Reward r and state s′", "Agent learns"], [
      "The agent picks an action from its policy.",
      "The action is sent to the environment.",
      "The environment changes state.",
      "It returns a reward and the next state.",
      "The agent updates its estimates and acts again.",
    ]),
  },
  {
    t: "Reward and return: what the agent maximises",
    lv: 1,
    s: `The agent does not maximise the next reward but the {{return}}: the discounted sum of future rewards, {{Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + …}} with a discount 0 ≤ γ ≤ 1. A reward stream 1, 0, 0, 10 with γ = 0.9 has return 1 + 0 + 0 + 0.9³ × 10 = 8.29 from the start, 8.10 from the second step, 9.0 from the third and 10 from the last. γ near 0 makes the agent short-sighted; γ near 1 makes it patient. Returns satisfy Gₜ = Rₜ₊₁ + γGₜ₊₁, the recursion behind almost every algorithm.`,
    r: `Design rewards carefully: the agent will optimise exactly what you reward, including loopholes.`,
    i: `Compute the discounted return of the rewards 1, 0, 0, 10 with γ = 0.9.`,
    c: py`
rewards = [1, 0, 0, 10]
gamma = 0.9
G = 0.0
returns = []
for r in reversed(rewards):
    G = r + gamma * G
    returns.append(round(G, 2))
print(returns[::-1])`,
    v: plot("Return of the reward stream 1, 0, 0, 10 against the discount γ.", {
      x: [0, 1], y: [0, 12], labels: ["discount γ", "return from step 1"],
      params: [par("g", "discount γ", 0, 1, 0.05, 0.9)],
      readout: ["G = 1 + γ³·10 = 1 + {pow(g,3)*10:2} = {1+pow(g,3)*10:2}"],
      steps: [["γ = 0: only the first reward counts.", { g: 0 }], ["γ = 0.9: the late prize of 10 is worth 7.29 now.", { g: 0.9 }], ["γ = 1: all rewards count fully.", { g: 1 }]],
    }, [curve("1+pow(x,3)*10", { c: "accent" }), pt("g", "1+pow(g,3)*10", { c: "bad" })]),
  },
  {
    t: "Policy, value function and model",
    lv: 1,
    s: `An RL agent may contain up to three components. A {{policy}} π(a | s) says what to do in each state. A {{value function}} says how good a state is (V) or a state–action pair (Q): the expected return when following the policy. A {{model}} predicts what the environment will do (next state and reward). Methods differ in which they keep: {{value-based}} (learn Q, act greedily), {{policy-based}} (learn π directly), {{actor–critic}} (both) and {{model-based}} (learn or use a model and plan with it). {{Model-free}} methods use none.`,
    r: `Value-based methods suit small discrete action sets; policy-based ones handle continuous actions and stochastic policies.`,
    i: `Give one example of a value-based and one of a policy-based method.`,
    c: py`
policy = {"low": {"charge": 0.9, "work": 0.1}, "high": {"charge": 0.1, "work": 0.9}}
Q = {("low", "charge"): 2.0, ("low", "work"): 0.5, ("high", "charge"): 1.0, ("high", "work"): 3.0}
state = "low"
greedy = max(["charge", "work"], key=lambda a: Q[(state, a)])
print(policy[state], greedy)`,
    v: compare("What each family learns.", ["Learns", "Examples"], [
      ["Value-based", "Q(s, a); acts greedily on it", "Q-learning, DQN"],
      ["Policy-based", "π(a | s) directly", "REINFORCE, PPO"],
      ["Actor–critic", "a policy and a value function", "A2C, SAC"],
      ["Model-based", "environment dynamics, then plans", "Dyna, MuZero"],
    ]),
  },
  {
    t: "Markov decision processes",
    lv: 2,
    s: `The standard mathematical model is a {{Markov decision process}}: states S, actions A, transition probabilities P(s′ | s, a), rewards R(s, a, s′) and discount γ. The {{Markov property}} says the next state depends only on the current state and action, not on the earlier history — so the state must contain everything relevant. Small example: from state "low" the action "work" gives reward 1 and stays low with probability 0.7 or moves to "high" with probability 0.3; the expected immediate reward of an action is Σ P(s′ | s, a) R. Using a stack of 4 game frames instead of one is a way of restoring the Markov property.`,
    r: `If the true state is hidden (a partially observable MDP), give the agent memory — frame stacks or a recurrent network.`,
    i: `What does the Markov property say, and what happens when it is violated?`,
    c: py`
P = {("low", "work"): {"low": 0.7, "high": 0.3}, ("low", "charge"): {"low": 0.2, "high": 0.8}}
R = {("low", "work"): {"low": 1.0, "high": 1.0}, ("low", "charge"): {"low": 0.0, "high": 0.0}}
for sa in P:
    print(sa, round(sum(p * R[sa][s2] for s2, p in P[sa].items()), 2), sum(P[sa].values()))`,
    v: cells("Transition probabilities from state 'low'.", table(["action", "→ low", "→ high", "reward"], [["work", "0.7", "0.3", "1"], ["charge", "0.2", "0.8", "0"]]), [
      ["Each action leads to a distribution over next states; every row sums to 1."],
      ["'work' usually leaves the battery low but pays 1.", [[1, 1, 3]]],
      ["'charge' pays nothing now but usually reaches 'high'.", [[2, 2, 2]]],
    ]),
  },
  {
    t: "State values and action values",
    lv: 1,
    s: `{{V_π(s)}} is the expected return when starting in s and following π; {{Q_π(s, a)}} is the expected return after taking a in s and then following π. They are linked: {{V_π(s) = Σₐ π(a | s) Q_π(s, a)}}. If in some state a policy picks "left" with probability 0.25 (Q = 2) and "right" with probability 0.75 (Q = 6), then V = 0.25×2 + 0.75×6 = 5. The best policy chooses the action with the largest Q in every state: V*(s) = maxₐ Q*(s, a).`,
    r: `Q is what lets a model-free agent act: it can pick the best action without knowing the environment's rules.`,
    i: `Compute V from the policy and Q-values above.`,
    c: py`
pi = {"left": 0.25, "right": 0.75}
Q = {"left": 2.0, "right": 6.0}
V = sum(pi[a] * Q[a] for a in pi)
print(V, max(Q, key=Q.get))`,
    v: bars("V is the policy-weighted average of the Q-values.", [["Q(left)", "2"], ["Q(right)", "6"], ["V = π·Q", "p*2+(1-p)*6"]], {
      max: 7,
      params: [par("p", "probability of 'left'", 0, 1, 0.05, 0.25)],
      readout: ["V = {p}×2 + {1-p}×6 = {p*2+(1-p)*6:2}"],
      steps: [["π(left) = 0.25: V = 5.", { p: 0.25 }], ["Always right (best action): V = 6.", { p: 0 }]],
    }),
  },
  {
    t: "Exploration versus exploitation",
    lv: 1,
    s: `To get reward the agent should {{exploit}} what it already knows; to learn more it must {{explore}} actions it is unsure about. Picking your favourite restaurant every night is safe but you may miss a better one; trying a new one every night wastes dinners. The tension has no free lunch: pure exploitation can lock into a poor choice early, pure exploration never cashes in. Standard remedies are ε-greedy (random action with probability ε), optimism about untried actions, uncertainty bonuses (UCB) and sampling from posteriors (Thompson sampling).`,
    r: `Decay exploration over time, but never to exactly zero when the world can change.`,
    i: `Why can a purely greedy agent get stuck with a bad action?`,
    c: py`
import numpy as np

true_means = np.array([0.3, 0.7])
Q, N = np.zeros(2), np.zeros(2)
rng = np.random.default_rng(1)
for t in range(200):
    a = int(np.argmax(Q))
    r = float(rng.random() < true_means[a])
    N[a] += 1
    Q[a] += (r - Q[a]) / N[a]
print(N.tolist(), Q.round(2).tolist())`,
    v: compare("Two extreme strategies and the compromise.", ["Strength", "Weakness"], [
      ["Always exploit", "collects known reward", "can lock onto a poor action"],
      ["Always explore", "learns everything", "never uses what it learned"],
      ["ε-greedy / UCB", "learns while earning", "needs tuning"],
    ]),
  },
  {
    t: "How RL differs from supervised learning",
    lv: 1,
    s: `Supervised learning gets the correct answer for every example. RL gets only an evaluative signal (a reward), often delayed, and the data depend on the agent's own behaviour: a bad policy visits bad states and learns about nothing else. Other differences: the credit-assignment problem (which of the last 1,000 actions earned this reward?), non-stationary data as the policy changes, and the need to explore. Where an expert supplies correct actions, imitation (supervised) learning is simpler and is often used to start an RL agent.`,
    r: `Use RL when the sequence of decisions matters and you can simulate or safely try actions; otherwise prefer supervised learning or bandits.`,
    i: `Give two reasons RL is harder than supervised learning.`,
    c: py`
supervised = [("image 1", "cat"), ("image 2", "dog")]
rl_episode = [("s0", "a0", 0.0), ("s1", "a1", 0.0), ("s2", "a2", 1.0)]
print(len(supervised), "labelled pairs;", "reward only at the end:", rl_episode[-1][2])`,
    v: compare("Supervised versus reinforcement learning.", ["Supervised", "Reinforcement"], [
      ["Feedback", "the correct answer", "a reward, often delayed"],
      ["Data", "fixed dataset", "depends on the agent's actions"],
      ["Exploration", "not needed", "essential"],
      ["Credit assignment", "none", "which past action earned the reward?"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const bandit: ConceptDef[] = [
  {
    t: "The k-armed bandit",
    lv: 1,
    s: `The simplest RL problem has no states: a slot machine with k levers (arms), each paying a random reward with its own unknown mean. You pull one arm per round and want the largest total reward. It isolates the exploration–exploitation dilemma. The quality of a strategy is measured by {{regret}}: the reward you lost compared with always pulling the best arm. If the means are 0.2, 0.5, 0.8 and you pull the middle arm, you lose 0.3 per pull on average.`,
    r: `Real versions: ad or headline selection, recommendations, clinical-trial dose finding, routing in networks.`,
    i: `Compute the per-pull regret of always choosing the arm with mean 0.5 when the best mean is 0.8.`,
    c: py`
import numpy as np

means = np.array([0.2, 0.5, 0.8])
print(round(float(means.max() - means[1]), 2), round(float(means.max() - means[0]), 2))
rng = np.random.default_rng(0)
print(rng.binomial(1, means, size=(5, 3)).tolist())`,
    v: bars("Mean reward of each arm and the regret of pulling it.", [["arm A mean", "0.2"], ["arm B mean", "0.5"], ["arm C mean (best)", "0.8"]], {
      max: 1,
    }),
  },
  {
    t: "Estimating arm values incrementally",
    lv: 1,
    s: `The value of an arm is its average reward. Storing every reward is wasteful, so update it incrementally: {{Qₙ₊₁ = Qₙ + (Rₙ − Qₙ)/n}} — new estimate = old estimate + step × error. Rewards 1, 0, 1 give Q = 1, 0.5, 0.667. The general pattern {{NewEstimate = OldEstimate + StepSize × (Target − OldEstimate)}} reappears in TD learning, Q-learning and even gradient descent. The error term (Target − OldEstimate) is the surprise.`,
    r: `With step 1/n all rewards are weighted equally; a fixed step weights recent ones more.`,
    i: `Update Q after the rewards 1, 0, 1 with step 1/n.`,
    c: py`
Q, n = 0.0, 0
for r in [1, 0, 1]:
    n += 1
    Q += (r - Q) / n
    print(n, r, round(Q, 3))`,
    v: cells("Incremental average after each reward.", table(["n", "reward", "error R − Q", "new Q"], [["1", "1", "1.00", "1.000"], ["2", "0", "−1.00 × ½", "0.500"], ["3", "1", "0.50 × ⅓", "0.667"]]), [
      ["Each row moves Q towards the newest reward by 1/n of the error."],
      ["First reward: Q jumps to 1.", [[1, 3, 3]]],
      ["Second reward is 0: Q falls to the mean 0.5.", [[2, 3, 3]]],
      ["Third reward 1: Q = 2/3, the plain average.", [[3, 3, 3]]],
    ]),
  },
  {
    t: "Non-stationary problems: a constant step size",
    lv: 2,
    s: `If arm values drift over time, old rewards should fade. A constant step α gives {{Qₙ₊₁ = (1 − α)ⁿQ₁ + Σ α(1 − α)ⁿ⁻ⁱ Rᵢ}}: an exponential moving average where a reward k steps ago has weight α(1 − α)ᵏ. With α = 0.1 the latest reward weighs 0.100, the one before 0.090, then 0.081 — the effective memory is about 1/α = 10 steps. A large α reacts fast but is noisy; a small α is smooth but slow to follow change.`,
    r: `Pick α from how quickly the world changes, not from habit; 1/n is right only for stationary problems.`,
    i: `With α = 0.1, what weight does the reward from 3 steps ago get?`,
    c: py`
alpha = 0.1
print([round(alpha * (1 - alpha) ** k, 4) for k in range(5)])
print(round(sum(alpha * (1 - alpha) ** k for k in range(200)), 4))`,
    v: plot("Weight of a reward k steps ago for the chosen step size α.", {
      x: [0, 20], y: [0, 0.5], labels: ["steps ago k", "weight"],
      params: [par("a", "step size α", 0.05, 0.5, 0.05, 0.1)],
      readout: ["weight(k = 3) = α(1 − α)³ = {a*pow(1-a,3):4}   ·   memory ≈ 1/α = {1/a:1} steps"],
      steps: [["α = 0.1: long, smooth memory.", { a: 0.1 }], ["α = 0.5: forgets quickly.", { a: 0.5 }]],
    }, [curve("a*pow(1-a,x)", { c: "accent" })]),
  },
  {
    t: "ε-greedy action selection",
    lv: 1,
    s: `With probability 1 − ε take the greedy action (largest Q), with probability ε take a uniformly random action. With k arms the greedy arm is therefore chosen with probability {{1 − ε + ε/k}}: for ε = 0.1 and k = 5 that is 0.92, and every other arm gets 0.02. ε = 0 never explores; ε = 1 is pure random. A common schedule starts with ε near 1 and decays it as estimates improve. It is simple and robust, but wastes exploration on obviously bad arms.`,
    r: `A small constant ε (0.05–0.1) is a reasonable default in a changing world.`,
    i: `With 5 arms and ε = 0.1, what is the probability of choosing the greedy arm?`,
    c: py`
eps, k = 0.1, 5
print(round(1 - eps + eps / k, 3), round(eps / k, 3))
import numpy as np
rng = np.random.default_rng(0)
Q = np.array([0.1, 0.9, 0.3, 0.2, 0.0])
picks = [int(np.argmax(Q)) if rng.random() > eps else int(rng.integers(k)) for _ in range(10000)]
print(round(float(np.mean(np.array(picks) == 1)), 2))`,
    v: plot("Probability of choosing the greedy arm against ε (k arms).", {
      x: [0, 1], y: [0, 1.05], labels: ["exploration rate ε", "P(greedy arm)"],
      params: [par("k", "number of arms k", 2, 20, 1, 5), par("e", "ε", 0, 1, 0.05, 0.1)],
      readout: ["P(greedy) = 1 − {e} + {e}/{k} = {1-e+e/k:3}"],
      steps: [["ε = 0.1 with 5 arms: 0.92.", { k: 5, e: 0.1 }], ["ε = 1: uniform, 1/k.", { k: 5, e: 1 }]],
    }, [curve("1-x+x/k", { c: "accent" }), pt("e", "1-e+e/k", { c: "bad" })]),
  },
  {
    t: "Upper confidence bound (UCB)",
    lv: 2,
    s: `UCB explores where the estimate is uncertain: choose {{argmax Qₐ + c√(ln t / Nₐ)}}. The bonus is large for rarely tried arms and shrinks as Nₐ grows. At t = 12 with Q = (0.5, 0.4), counts N = (10, 2) and c = 2: arm 1 scores 0.5 + 2√(2.485/10) = 1.497; arm 2 scores 0.4 + 2√(2.485/2) = 2.629. UCB picks the less-tried arm although its average is lower. Unlike ε-greedy, exploration is directed at uncertainty and fades by itself.`,
    r: `UCB is optimistic in the face of uncertainty; the same idea powers tree search (UCT) and many exploration bonuses in deep RL.`,
    i: `Compute the UCB scores in the example and say which arm is chosen.`,
    c: py`
import numpy as np

Q, N, t, c = np.array([0.5, 0.4]), np.array([10, 2]), 12, 2.0
score = Q + c * np.sqrt(np.log(t) / N)
print(score.round(3).tolist(), int(np.argmax(score)))`,
    v: bars("UCB score of the two arms as the second arm is tried more often.", [["arm 1 (Q = 0.5, N = 10)", "0.5+2*sqrt(ln(12)/10)"], ["arm 2 (Q = 0.4, N = n2)", "0.4+2*sqrt(ln(12)/n2)"]], {
      max: 3,
      params: [par("n2", "pulls of arm 2", 1, 30, 1, 2)],
      readout: ["arm 2 bonus = 2·√(ln 12 / {n2}) = {2*sqrt(ln(12)/n2):3}; it falls below arm 1's score once arm 2 has been pulled enough"],
      steps: [["Arm 2 tried twice: its bonus wins.", { n2: 2 }], ["Arm 2 tried 30 times: arm 1 leads.", { n2: 30 }]],
    }),
  },
  {
    t: "Optimism and Thompson sampling",
    lv: 2,
    s: `Two more ways to explore. {{Optimistic initial values}}: start every Q above any realistic reward (say 5); every pull disappoints, so the agent keeps trying other arms until estimates settle. {{Thompson sampling}} keeps a posterior for each arm — for yes/no rewards a Beta(1 + successes, 1 + failures) — samples one value from each and plays the arm with the largest sample. After 3 successes and 1 failure the posterior mean is 4/6 = 0.667; uncertain arms have wide posteriors and win the sampling often, certain good arms win mostly. Thompson sampling is simple and performs very well in practice.`,
    r: `Both methods explore by uncertainty, not by blind randomness.`,
    i: `What is the posterior mean of an arm with 3 successes and 1 failure under a Beta(1, 1) prior?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
succ, fail = np.array([3, 30]), np.array([1, 10])
print(((1 + succ) / (2 + succ + fail)).round(3).tolist())
wins = np.zeros(2)
for _ in range(2000):
    samples = rng.beta(1 + succ, 1 + fail)
    wins[int(np.argmax(samples))] += 1
print((wins / 2000).round(2).tolist())`,
    v: plot("Beta posterior of an arm's success rate (relative height); more data narrows it.", {
      x: [0, 1], y: [0, 1.1], labels: ["success rate", "relative density"],
      params: [par("s", "successes", 1, 30, 1, 3), par("f", "failures", 1, 30, 1, 1)],
      readout: ["posterior mean = (1 + {s}) / (2 + {s} + {f}) = {(1+s)/(2+s+f):3}"],
      steps: [["Little data: wide and uncertain.", { s: 3, f: 1 }], ["Much more data: narrow around 0.75.", { s: 30, f: 10 }]],
    }, [curve("pow(x,s)*pow(1-x,f)/(pow(s/(s+f),s)*pow(f/(s+f),f))", { c: "accent" })]),
  },
  {
    t: "Regret: comparing bandit strategies",
    lv: 2,
    s: `Cumulative regret after T pulls is T·μ* − Σ rewards (in expectation: the sum of per-pull gaps). Greedy without exploration can suffer linear regret forever if it locks onto a bad arm; ε-greedy with constant ε also grows linearly (it keeps exploring); UCB and Thompson sampling achieve logarithmic growth — regret rises quickly at first and then flattens. The simulation below pits greedy, ε-greedy and UCB against a fixed three-armed problem and reports their average regret.`,
    r: `Always compare exploration strategies over many random seeds; a single run proves nothing.`,
    i: `Which strategies achieve logarithmic regret, and why can greedy have linear regret?`,
    c: py`
import numpy as np

means = np.array([0.2, 0.5, 0.8])
T, runs = 1000, 200

def run(kind, seed):
    rng = np.random.default_rng(seed)
    Q, N, regret = np.zeros(3), np.zeros(3), 0.0
    for t in range(1, T + 1):
        if kind == "greedy":
            a = int(np.argmax(Q + rng.random(3) * 1e-9))
        elif kind == "eps":
            a = int(rng.integers(3)) if rng.random() < 0.1 else int(np.argmax(Q))
        else:
            a = t - 1 if t <= 3 else int(np.argmax(Q + np.sqrt(2 * np.log(t) / N)))
        r = float(rng.random() < means[a])
        N[a] += 1
        Q[a] += (r - Q[a]) / N[a]
        regret += means.max() - means[a]
    return regret

for kind in ("greedy", "eps", "ucb"):
    print(kind, round(float(np.mean([run(kind, s) for s in range(runs)])), 1))`,
    v: plot("Regret curves of the three strategies (shapes fitted to the simulation's averages at 1000 pulls: 203, 49, 39).", {
      x: [0, 1000], y: [0, 220], labels: ["pulls", "cumulative regret"],
    }, [curve("0.2027*x", { c: "bad", label: "greedy (linear)" }), curve("0.049*x", { c: "warn", label: "ε-greedy (linear)" }), curve("8.45*ln(1+x/10)", { c: "good", label: "UCB (logarithmic)" })]),
  },
];

void [P, hline, seg, vline];
