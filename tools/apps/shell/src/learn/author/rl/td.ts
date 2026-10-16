import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- reinforcement-learning`. */

const CLIFF = `
import numpy as np

H, W = 4, 12
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def step(s, a):
    i, j = s
    i = min(max(i + moves[a][0], 0), H - 1)
    j = min(max(j + moves[a][1], 0), W - 1)
    if i == 3 and 0 < j < 11:
        return (3, 0), -100, False
    if (i, j) == (3, 11):
        return (i, j), -1, True
    return (i, j), -1, False

def train(kind, eps=0.1, alpha=0.1, episodes=2000, seed=0):
    rng = np.random.default_rng(seed)
    Q = np.zeros((H, W, 4))
    pick = lambda s: int(rng.integers(4)) if rng.random() < eps else int(np.argmax(Q[s]))
    totals = []
    for _ in range(episodes):
        s = (3, 0)
        a = pick(s)
        total = 0
        for _ in range(1000):
            s2, r, done = step(s, a)
            total += r
            a2 = pick(s2)
            target = r + (0 if done else (Q[s2][a2] if kind == "sarsa" else Q[s2].max()))
            Q[s + (a,)] += alpha * (target - Q[s + (a,)])
            s, a = s2, a2
            if done:
                break
        totals.append(total)
    s, path = (3, 0), [(3, 0)]
    for _ in range(60):
        s, _, done = step(s, int(np.argmax(Q[s])))
        path.append(s)
        if done:
            break
    return float(np.mean(totals[-200:])), path`;

export const td: ConceptDef[] = [
  {
    t: "TD(0): learn a guess from a guess",
    lv: 2,
    s: `{{Temporal-difference}} learning combines the best of both worlds: like Monte Carlo it learns from experience without a model; like DP it {{bootstraps}} — it updates after every single step using the current estimate of the next state. The update is {{V(s) ← V(s) + α [ r + γV(s′) − V(s) ]}}; the bracket is the {{TD error δ}}, the difference between what you predicted and the better-informed one-step target. Example: V(s) = 0.5, reward 0, V(s′) = 0.7, α = 0.1, γ = 1: δ = 0 + 0.7 − 0.5 = 0.2 and V(s) becomes 0.52.`,
    r: `TD works in continuing tasks and learns online, which is why it is the workhorse of RL.`,
    i: `Do one TD(0) update with V(s) = 0.5, r = 0, V(s′) = 0.7, α = 0.1, γ = 1.`,
    c: py`
V_s, V_next, r, alpha, gamma = 0.5, 0.7, 0.0, 0.1, 1.0
delta = r + gamma * V_next - V_s
print(round(delta, 3), round(V_s + alpha * delta, 3))`,
    v: bars("TD error and the updated value for the chosen step size.", [["TD error δ", "0+1*0.7-0.5"], ["new V(s)", "0.5+a*(0.7-0.5)"]], {
      max: 0.8,
      params: [par("a", "step size α", 0, 1, 0.05, 0.1)],
      readout: ["V(s) ← 0.5 + {a} × 0.2 = {0.5+a*0.2:3}"],
      steps: [["α = 0.1: a cautious move to 0.52.", { a: 0.1 }], ["α = 1: jump straight to the target 0.7.", { a: 1 }]],
    }),
  },
  {
    t: "The random walk: TD learns the values",
    lv: 2,
    s: `Five states A–E in a row, start in the middle C, step left or right with equal probability; stepping off the right end pays 1, off the left end 0. The true value of each state is the probability of ending on the right: 1/6, 2/6, 3/6, 4/6, 5/6. TD(0) starts from V = 0.5 everywhere and, after a couple of thousand episodes with a small α, gets close: about 0.18, 0.35, 0.50, 0.67, 0.86. The estimates keep jittering slightly because α is constant.`,
    r: `With a decaying step size the estimates converge exactly; with a constant one they track a moving average.`,
    i: `What are the true state values of the five-state random walk?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
V = np.full(5, 0.5)
for episode in range(2000):
    s = 2
    while True:
        s2 = s + int(rng.choice([-1, 1]))
        done = s2 < 0 or s2 > 4
        r = 1.0 if s2 > 4 else 0.0
        target = r + (0.0 if done else V[s2])
        V[s] += 0.02 * (target - V[s])
        if done:
            break
        s = s2
print(V.round(2).tolist(), (np.arange(1, 6) / 6).round(2).tolist())`,
    v: bars("True values (1/6 … 5/6) of the five states A–E.", [["A", "1/6"], ["B", "2/6"], ["C", "3/6"], ["D", "4/6"], ["E", "5/6"]], {
      max: 1,
    }),
  },
  {
    t: "TD versus Monte Carlo: bias and variance",
    lv: 2,
    s: `Monte Carlo's target (the full return Gₜ) is an {{unbiased}} but high-variance estimate of V — it sums many random steps. TD's target (r + γV(s′)) depends on only one random step, so it has {{low variance}}, but it is {{biased}} while V(s′) is still wrong. In practice TD usually learns faster and is the better default, especially in long episodes; Monte Carlo can win when the state is poorly observed. {{n-step TD}} and {{TD(λ)}} blend the two, as the next concepts show.`,
    r: `A useful picture: Monte Carlo waits for the end of the game before learning; TD updates after every move.`,
    i: `Why does TD have lower variance but some bias compared with Monte Carlo?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
returns = rng.normal(0.5, 1.0, 1000)
td_targets = 0.5 + rng.normal(0, 0.1, 1000) + 0.05
print(round(float(returns.std()), 2), round(float(td_targets.std()), 2), round(float(td_targets.mean() - 0.5), 2))`,
    v: compare("Targets of Monte Carlo and TD.", ["Monte Carlo", "TD(0)"], [
      ["Target", "full return Gₜ", "r + γV(s′)"],
      ["Bias", "none", "yes, while V(s′) is wrong"],
      ["Variance", "high", "low"],
      ["Updates", "end of episode", "every step"],
    ]),
  },
  {
    t: "SARSA: on-policy TD control",
    lv: 2,
    s: `Learn action values with the quintuple (s, a, r, s′, a′): {{Q(s, a) ← Q(s, a) + α [ r + γ Q(s′, a′) − Q(s, a) ]}} where a′ is the action the agent will actually take next (chosen ε-greedily). The agent learns the value of the policy it is really following, exploration included. Example: Q(s, a) = 0, r = 1, γ = 0.9, Q(s′, a′) = 1, α = 0.5: target 1 + 0.9 = 1.9, new Q = 0.95. SARSA is {{on-policy}}: if it explores, it learns to avoid risky states.`,
    r: `SARSA is the safer choice when mistakes during learning are costly.`,
    i: `Do one SARSA update with the numbers above.`,
    c: py`
Q_sa, r, gamma, q_next_chosen, alpha = 0.0, 1.0, 0.9, 1.0, 0.5
target = r + gamma * q_next_chosen
print(round(target, 2), round(Q_sa + alpha * (target - Q_sa), 3))`,
    v: rowflow("One SARSA step.", ["Be in s, chose a", "Take a, see r and s′", "Choose a′ with the policy", "Update Q(s, a)", "Move on: s ← s′, a ← a′"], [
      "The action was chosen earlier.",
      "Environment responds.",
      "The next action also comes from the ε-greedy policy.",
      "Move Q(s, a) towards r + γQ(s′, a′).",
      "Continue with a′ — what you updated with is what you do.",
    ]),
  },
  {
    t: "Q-learning: off-policy TD control",
    lv: 2,
    s: `{{Q(s, a) ← Q(s, a) + α [ r + γ maxₐ′ Q(s′, a′) − Q(s, a) ]}}. The target uses the best next action, whatever the agent will actually do, so Q-learning learns the value of the {{greedy}} policy while behaving ε-greedily ({{off-policy}}). Same numbers as SARSA but with max Q(s′, ·) = 2: target 1 + 0.9 × 2 = 2.8, new Q = 0.5 × 2.8 = 1.4. It is the sampled form of the Bellman optimality equation and converges to Q* if every pair is visited often enough and α decays suitably.`,
    r: `Q-learning's max also causes over-estimation with noisy values — the reason for Double Q-learning later.`,
    i: `Do one Q-learning update with Q = 0, r = 1, γ = 0.9, max Q(s′, ·) = 2, α = 0.5.`,
    c: py`
Q_sa, r, gamma, max_next, alpha = 0.0, 1.0, 0.9, 2.0, 0.5
target = r + gamma * max_next
print(round(target, 2), round(Q_sa + alpha * (target - Q_sa), 3))`,
    v: compare("SARSA versus Q-learning on the same transition.", ["SARSA", "Q-learning"], [
      ["Target uses", "Q(s′, a′) of the action actually chosen", "max over a′ of Q(s′, a′)"],
      ["Learns the value of", "the behaviour policy", "the greedy policy"],
      ["Example target (r = 1, γ = 0.9)", "1 + 0.9 × 1 = 1.9", "1 + 0.9 × 2 = 2.8"],
      ["Type", "on-policy", "off-policy"],
    ]),
  },
  {
    t: "Cliff walking: the difference you can see",
    lv: 2,
    s: `A 4 × 12 grid: start bottom-left, goal bottom-right, the bottom row between them is a cliff (−100 and back to the start); every other step costs −1. Run both algorithms with ε = 0.1. Q-learning learns the values of the shortest path hugging the cliff edge (13 steps), but because it explores while acting, it occasionally steps off — its online return is poor, about −55. SARSA learns the values of the ε-greedy policy it follows, so it prefers a longer, safer route along the top (17 steps) with a better online return of about −22. Neither is "wrong": they optimise different things.`,
    r: `If you will deploy the greedy policy, Q-learning's path is better; if you care about reward during learning, SARSA's is.`,
    i: `Why does SARSA choose a safer path than Q-learning on the cliff?`,
    c: py`${CLIFF}
for kind in ("q", "sarsa"):
    online, path = train(kind)
    print(kind, round(online, 1), len(path) - 1, "steps; highest row", min(p[0] for p in path))`,
    v: compare("Cliff walking results (ε = 0.1, 2000 episodes).", ["Q-learning", "SARSA"], [
      ["Greedy path", "13 steps along the cliff edge", "17 steps along the top"],
      ["Online return (last 200 episodes)", "≈ −55", "≈ −22"],
      ["Learns the value of", "the greedy policy", "the ε-greedy policy it follows"],
    ]),
  },
  {
    t: "n-step returns and eligibility traces",
    lv: 2,
    s: `Between TD(0) (look one step ahead) and Monte Carlo (look to the end) lie {{n-step returns}}: Gₜ⁽ⁿ⁾ = Rₜ₊₁ + … + γⁿ⁻¹Rₜ₊ₙ + γⁿV(Sₜ₊ₙ). {{TD(λ)}} averages all of them with weights (1 − λ)λⁿ⁻¹: with λ = 0.8 the 1-, 2-, 3-, 4-, 5-step returns get 0.200, 0.160, 0.128, 0.102, 0.082. λ = 0 is TD(0), λ = 1 is Monte Carlo. {{Eligibility traces}} implement this efficiently: each visited state keeps a decaying trace e ← γλe that determines how much of the current TD error it receives, spreading credit backwards to recent states.`,
    r: `Intermediate λ (0.8–0.95) often beats both extremes.`,
    i: `Which weights does TD(0.8) give to the 1-step and 2-step returns?`,
    c: py`
lam = 0.8
print([round((1 - lam) * lam ** (n - 1), 3) for n in range(1, 6)])
e, gamma = 1.0, 0.9
trace = []
for k in range(5):
    trace.append(round(e, 3))
    e *= gamma * lam
print(trace)`,
    v: plot("Weight of the n-step return in TD(λ).", {
      x: [1, 15], y: [0, 1], labels: ["n (steps)", "weight (1 − λ)λⁿ⁻¹"],
      params: [par("l", "λ", 0, 0.95, 0.05, 0.8)],
      readout: ["weights: n = 1 → {(1-l):3}, n = 2 → {(1-l)*l:3}, n = 3 → {(1-l)*l*l:3}"],
      steps: [["λ = 0: all weight on the 1-step return (TD(0)).", { l: 0 }], ["λ = 0.8: spread over about 5 steps.", { l: 0.8 }], ["λ = 0.95: close to Monte Carlo.", { l: 0.95 }]],
    }, [curve("(1-l)*pow(l,x-1)", { c: "accent" })]),
  },
];

/* ------------------------------------------------------------------ */
export const approx: ConceptDef[] = [
  {
    t: "Why tables stop working",
    lv: 1,
    s: `A table holds one number per state (or state–action). That is fine for a 4 × 12 grid (48 states) but hopeless for chess (≈ 10⁴⁴ positions), for Atari frames (256^(84×84) possible images) or for any continuous state. Even if memory were free, most states are never visited, and learning about one tells the table nothing about its neighbours. {{Function approximation}} replaces the table by a parametrised function V̂(s; w) or Q̂(s, a; w) — linear features or a neural network — that generalises: similar states get similar values and the number of parameters is far smaller than the number of states.`,
    r: `Generalisation is the gain, and the source of new problems: updating one state changes the values of many others.`,
    i: `Why can't Q-learning use a table for an Atari game?`,
    c: py`
print(4 * 12, 2 ** 100)
states_visited = 10 ** 6
print(states_visited / 2 ** 100)`,
    v: compare("Table versus function approximation.", ["Table", "Function approximator"], [
      ["Memory", "one entry per state", "a few parameters"],
      ["Generalises to new states", "no", "yes"],
      ["Convergence guarantees", "strong", "weaker"],
      ["Used for", "small problems", "images, continuous states"],
    ]),
  },
  {
    t: "Linear value approximation and semi-gradient TD",
    lv: 2,
    s: `Describe each state by a feature vector x(s) and set {{V̂(s) = w·x(s)}}. The weights are adjusted by gradient steps on the prediction error, treating the target as a constant ({{semi-gradient}}): {{w ← w + α δ x(s)}} with the TD error δ = r + γ V̂(s′) − V̂(s). Example: w = (0.5, 0.5), x(s) = (1, 0), x(s′) = (0, 1), r = 1, γ = 0.9, α = 0.1: V̂(s) = 0.5, V̂(s′) = 0.5, δ = 1 + 0.45 − 0.5 = 0.95, so w becomes (0.595, 0.5). With one-hot features this is exactly the tabular update.`,
    r: `Linear TD has convergence guarantees on-policy; with non-linear networks you get power but fewer guarantees.`,
    i: `Do the semi-gradient update from the numbers above.`,
    c: py`
import numpy as np

w = np.array([0.5, 0.5])
x, x_next = np.array([1.0, 0.0]), np.array([0.0, 1.0])
r, gamma, alpha = 1.0, 0.9, 0.1
delta = r + gamma * (w @ x_next) - w @ x
w = w + alpha * delta * x
print(round(float(delta), 3), w.round(3).tolist())`,
    v: bars("Weights before and after the update (feature 1 was active).", [["w₁ before", "0.5"], ["w₁ after", "0.5+a*0.95"], ["w₂ (inactive, unchanged)", "0.5"]], {
      max: 1.5,
      params: [par("a", "step size α", 0, 0.5, 0.05, 0.1)],
      readout: ["δ = 0.95, so w₁ ← 0.5 + {a} × 0.95 = {0.5+a*0.95:3}"],
      steps: [["α = 0.1: w₁ = 0.595.", { a: 0.1 }], ["α = 0.5: a large correction.", { a: 0.5 }]],
    }),
  },
  {
    t: "Choosing features: coarse coding and tiles",
    lv: 2,
    s: `With a linear approximator the features decide what can be learned. One-hot over a grid reproduces a table. {{Tile coding}} overlays several offset grids ("tilings"); a continuous state activates exactly one tile in each tiling, so with 4 tilings each state activates 4 binary features and nearby states share tiles — wide generalisation, still fast. Polynomial and Fourier features and radial-basis functions are other options. Deep networks learn features automatically, which is why they dominate for images.`,
    r: `Tile coding is cheap and reliable for low-dimensional control problems; use networks for pixels.`,
    i: `With 4 tilings, how many features are active for any one state?`,
    c: py`
import numpy as np

def tiles(x, tilings=4, width=1.0, size=10):
    out = []
    for t in range(tilings):
        offset = t * width / tilings
        out.append(t * size + int((x + offset) // width))
    return out

print(tiles(2.3), tiles(2.6), len(tiles(2.3)))`,
    v: cells("Two nearby points activate overlapping tiles.", [P("tiling", ["1", "2", "3", "4"]), P("x = 2.3", ["tile 2", "tile 2", "tile 2", "tile 3"]), P("x = 2.6", ["tile 2", "tile 2", "tile 3", "tile 3"])], [
      ["Four offset grids; exactly one tile per grid is active."],
      ["x = 2.3 and x = 2.6 share three of their four tiles (tilings 1, 2 and 4).", [[1, 0, 1], [2, 0, 1], [1, 3, 3], [2, 3, 3]]],
      ["Only tiling 3 differs, so whatever is learned at 2.3 mostly transfers to 2.6.", [[1, 2, 2], [2, 2, 2]]],
    ]),
  },
  {
    t: "Deep Q-networks: replay and target networks",
    lv: 2,
    s: `{{DQN}} approximates Q(s, a) with a neural network trained on the Q-learning target y = r + γ maxₐ′ Q_target(s′, a′), minimising (y − Q(s, a))². Two ideas make this stable. {{Experience replay}}: store transitions in a buffer and train on random mini-batches, which breaks the correlation between consecutive steps and reuses data. A {{target network}}: a slowly updated (or periodically copied) frozen copy used to compute y, so the target does not move with every gradient step. Example: r = 1, γ = 0.99, target-network Q-values (2, 3): y = 1 + 0.99 × 3 = 3.97.`,
    r: `Typical settings: replay buffer 10⁵–10⁶, batch 32, target copy every 1,000–10,000 steps, ε annealed from 1 to 0.1.`,
    i: `Compute the DQN target for r = 1, γ = 0.99, target-network values (2, 3), and the squared error if Q(s, a) = 3.`,
    c: py`
import numpy as np

r, gamma = 1.0, 0.99
q_target_next = np.array([2.0, 3.0])
y = r + gamma * q_target_next.max()
q_sa = 3.0
print(round(float(y), 2), round(float((y - q_sa) ** 2), 4))
buffer = [(i, i % 2, float(i), i + 1, False) for i in range(100)]
rng = np.random.default_rng(0)
batch = [buffer[i] for i in rng.choice(len(buffer), size=4, replace=False)]
print([b[0] for b in batch])`,
    v: rowflow("The DQN training loop.", ["Act ε-greedily with Q", "Store (s, a, r, s′) in replay", "Sample a random mini-batch", "Targets from the frozen network", "Gradient step on (y − Q)²"], [
      "Explore while exploiting the network.",
      "Keep a large buffer of past experience.",
      "Random sampling decorrelates the data.",
      "y = r + γ max Q_target(s′, ·).",
      "Occasionally copy the weights into the target network.",
    ]),
  },
  {
    t: "Over-estimation and Double DQN",
    lv: 2,
    s: `Taking a max over noisy estimates is biased upwards: even if every true value is 0, the maximum of ten noisy estimates is positive — about 1.54 on average for standard-normal noise. Q-learning bootstraps from exactly such maxima, so values drift too high and can destabilise learning. {{Double Q-learning / Double DQN}} decouples selection from evaluation: pick the best action with the online network, evaluate it with the target network, y = r + γ Q_target(s′, argmaxₐ Q_online(s′, a)). Together with the {{deadly triad}} (function approximation + bootstrapping + off-policy data), this explains many instabilities in deep RL.`,
    r: `Double DQN costs almost nothing and is part of most modern value-based agents.`,
    i: `Why is the maximum of several noisy estimates a biased estimate of the maximum true value?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
single = np.mean([rng.normal(0, 1, 10).max() for _ in range(10000)])
a, b = rng.normal(0, 1, (10000, 10)), rng.normal(0, 1, (10000, 10))
double = np.mean(b[np.arange(10000), a.argmax(axis=1)])
print(round(float(single), 2), round(float(double), 2))`,
    v: plot("Expected maximum of k standard-normal noise values (all true values are 0).", {
      x: [0, 22], y: [0, 2.2], labels: ["number of actions k", "expected max of the noisy estimates"],
    }, [hline("0", { c: "good", label: "true value" }), ...([[1, 0], [2, 0.564], [5, 1.163], [10, 1.539], [20, 1.867]] as const).map(([k, m]) => pt(String(k), String(m), { c: "bad", label: `k = ${k}` }))]),
  },
  {
    t: "Deep RL in practice",
    lv: 1,
    s: `Deep RL is sensitive. Habits that matter: {{normalise}} observations and scale or clip rewards; {{seed}} and average over many runs (results vary a lot between seeds); log learning curves and episode returns, not just loss; start with a tiny environment you can solve exactly; check the reward function for loopholes (reward hacking); and keep a simple baseline (random, heuristic, tabular) to compare against. Reproducibility is poor in the field, so report seeds, hyper-parameters and confidence intervals.`,
    r: `A learning curve that is not clearly above a random policy usually means a bug, not a hard problem.`,
    i: `Why must RL results be averaged over several random seeds?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
final_scores = rng.normal(100, 30, 10)
print(final_scores.round(0).tolist())
print(round(float(final_scores.mean()), 1), round(float(1.96 * final_scores.std(ddof=1) / np.sqrt(10)), 1))`,
    v: compare("Checklist for trustworthy deep RL experiments.", ["Why"], [
      ["Several seeds", "single runs vary hugely"],
      ["Reward and observation scaling", "keeps gradients stable"],
      ["Random and heuristic baselines", "shows the agent really learned"],
      ["Learning curves with intervals", "reveals instability"],
      ["Inspect the behaviour", "catches reward hacking"],
    ]),
  },
];

void [bars, curve, hline, par, plot, pt, seg, vline];
