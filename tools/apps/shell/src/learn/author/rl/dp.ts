import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- reinforcement-learning`. */

const GRID = `
import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)`;

const grid = (rows: string[][]) => table(["", "c0", "c1", "c2", "c3"], rows.map((r, i) => [`r${i}`, ...r]));
const G1 = [["0", "−1", "−1", "−1"], ["−1", "−1", "−1", "−1"], ["−1", "−1", "−1", "−1"], ["−1", "−1", "−1", "0"]];
const G2 = [["0", "−1.75", "−2", "−2"], ["−1.75", "−2", "−2", "−2"], ["−2", "−2", "−2", "−1.75"], ["−2", "−2", "−1.75", "0"]];
const G3 = [["0", "−2.44", "−2.94", "−3"], ["−2.44", "−2.88", "−3", "−2.94"], ["−2.94", "−3", "−2.88", "−2.44"], ["−3", "−2.94", "−2.44", "0"]];
const GINF = [["0", "−14", "−20", "−22"], ["−14", "−18", "−20", "−20"], ["−20", "−20", "−18", "−14"], ["−22", "−20", "−14", "0"]];
const GOPT = [["0", "−1", "−2", "−3"], ["−1", "−2", "−3", "−2"], ["−2", "−3", "−2", "−1"], ["−3", "−2", "−1", "0"]];

export const mdp: ConceptDef[] = [
  {
    t: "The Bellman expectation equation",
    lv: 2,
    s: `The recursion Gₜ = Rₜ₊₁ + γGₜ₊₁ turns into an equation for values: {{V_π(s) = Σₐ π(a | s) Σₛ′ P(s′ | s, a) [ r + γ V_π(s′) ]}}. In words: a state is worth the average, over what the policy does and what the world does, of the immediate reward plus the discounted value of where you land. Example: from state s the policy picks a₁ (50%) or a₂ (50%); a₁ gives r = 1 and lands in a state of value 4, a₂ gives r = 0 and lands in a state of value 6; with γ = 0.9: V = 0.5(1 + 3.6) + 0.5(0 + 5.4) = 5.0.`,
    r: `Every dynamic-programming, temporal-difference and Monte Carlo method is a different way of solving or sampling this one equation.`,
    i: `Compute V(s) for the example with γ = 0.9.`,
    c: py`
gamma = 0.9
branches = [(0.5, 1.0, 4.0), (0.5, 0.0, 6.0)]
V = sum(p * (r + gamma * v_next) for p, r, v_next in branches)
print(round(V, 3))`,
    v: bars("Contribution of each branch to V(s) (π = 0.5 / 0.5, γ = 0.9).", [["a₁: 0.5·(1 + γ·4)", "0.5*(1+g*4)"], ["a₂: 0.5·(0 + γ·6)", "0.5*(0+g*6)"], ["V(s)", "0.5*(1+g*4)+0.5*(g*6)"]], {
      max: 7,
      params: [par("g", "discount γ", 0, 1, 0.05, 0.9)],
      readout: ["V = 0.5(1 + {g}·4) + 0.5(0 + {g}·6) = {0.5*(1+g*4)+0.5*(g*6):2}"],
      steps: [["γ = 0.9: V = 5.", { g: 0.9 }], ["γ = 0: only immediate reward counts.", { g: 0 }]],
    }),
  },
  {
    t: "A gridworld: random policy, step cost −1",
    lv: 1,
    s: `The classic test bed: a 4 × 4 grid with two terminal corners. Every move costs −1 reward, γ = 1, so a state's value is minus the expected number of steps until the game ends. Moving into a wall leaves you where you are. The random policy picks each of the four moves with probability ¼. What is V(r0,c1), next to a terminal corner? One step from the goal if you move there (¼ chance), otherwise you wander — the exact answer is −14 steps on average. Policy evaluation computes all sixteen numbers.`,
    r: `Gridworlds are tiny but contain every ingredient: states, actions, rewards, terminal states, a policy and a value function.`,
    i: `Why is the value of a state in this gridworld negative, and what does its size mean?`,
    c: py`${GRID}
rng = np.random.default_rng(0)
lengths = []
for _ in range(3000):
    s, steps = (0, 1), 0
    while s not in terminal:
        s = move(s[0], s[1], int(rng.integers(4)))
        steps += 1
    lengths.append(steps)
print(round(float(np.mean(lengths)), 1))`,
    v: cells("The 4×4 gridworld: corners r0c0 and r3c3 are terminal (value 0).", grid([["T", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", "T"]]), [
      ["Sixteen states; the shaded corners end the episode."],
      ["Each move costs −1, so values count (negative) expected steps.", [[1, 1, 1], [2, 2, 2]]],
      ["Bumping into a wall keeps you in place.", [[1, 4, 4]]],
    ]),
  },
  {
    t: "Iterative policy evaluation",
    lv: 2,
    s: `To find V_π for a known model, start from V = 0 and repeatedly apply the Bellman equation to every state ({{sweeps}}). On the gridworld the first sweep gives −1 everywhere (one step costs 1); the second −1.75, −2 …; the third −2.44, −2.94, −3 …; after about a thousand sweeps the numbers stop changing: V(r0,c1) = −14, V(r1,c1) = −18, V(r0,c3) = −22. Convergence is guaranteed because each sweep shrinks the error — and you can stop as soon as the largest change falls below a small θ.`,
    r: `In-place updates (using fresh values immediately) usually converge faster than keeping two copies of V.`,
    i: `After one sweep, what is V(r1,c1)?`,
    c: py`${GRID}
V = np.zeros((n, n))
for sweep in range(1000):
    W = V.copy()
    for i in range(n):
        for j in range(n):
            if (i, j) in terminal:
                continue
            W[i, j] = sum(0.25 * (-1 + V[move(i, j, a)]) for a in range(4))
    delta = float(np.abs(W - V).max())
    V = W
    if sweep < 3:
        print(sweep + 1, V[0].round(2).tolist())
print(V.round(1).tolist())`,
    v: cells("Values after 1, 2, 3 sweeps and at convergence.", grid(G1), [
      ["Sweep 1: every non-terminal state is worth −1."],
      ["Sweep 2: states next to a corner improve to −1.75.", [[1, 2, 2], [2, 1, 1]], grid(G2)],
      ["Sweep 3: the values keep spreading outwards.", [[1, 2, 2]], grid(G3)],
      ["Convergence (≈1000 sweeps): −14, −18, −20, −22 …", [[1, 2, 2]], grid(GINF)],
    ]),
  },
  {
    t: "Policy improvement: act greedily on the values",
    lv: 2,
    s: `Given V_π, improve the policy by choosing in each state the action with the best one-step lookahead: {{π′(s) = argmaxₐ Σ P(s′ | s, a)[ r + γV_π(s′) ]}}. The {{policy improvement theorem}} guarantees π′ is at least as good as π everywhere. On the gridworld with the converged random-policy values, the greedy policy already heads for the nearest terminal corner from every state — even though the values themselves belong to a random walker. One improvement step produced an optimal policy here.`,
    r: `Improvement needs a model (or Q-values): you must be able to compare the actions' outcomes.`,
    i: `From state r1c2 of the gridworld, which action is greedy w.r.t. the random-policy values?`,
    c: py`${GRID}
V = np.array([[0, -14, -20, -22], [-14, -18, -20, -20], [-20, -20, -18, -14], [-22, -20, -14, 0]], float)
names = ["up", "down", "left", "right"]
for state in [(0, 1), (1, 2), (3, 1)]:
    q = [-1 + V[move(state[0], state[1], a)] for a in range(4)]
    best = [names[a] for a in range(4) if q[a] == max(q)]
    print(state, [float(x) for x in q], best)`,
    v: compare("Greedy actions from a few states using the converged random-policy values.", ["Best action(s)", "Lookahead values (up, down, left, right)"], [
      ["r0c1", "left (into the corner)", "−15, −19, −1, −21"],
      ["r1c2", "down or left (tie)", "−21, −19, −19, −21"],
      ["r3c1", "right", "−21, −21, −23, −15"],
    ]),
  },
  {
    t: "Policy iteration",
    lv: 2,
    s: `{{Policy iteration}} alternates two steps until nothing changes: {{evaluate}} the current policy (compute V_π), then {{improve}} it (act greedily). Each loop gives a strictly better policy until the optimal one is reached; because a finite MDP has finitely many policies, it terminates, usually in only a handful of iterations. Cost: every evaluation is itself a series of sweeps over all states, so the method is heavy per iteration but needs few of them.`,
    r: `Generalised policy iteration — evaluation and improvement interleaved, however roughly — is the template for nearly all RL algorithms.`,
    i: `Describe the two steps of policy iteration and why it terminates.`,
    c: py`${GRID}
policy = np.full((n, n, 4), 0.25)
for rnd in range(6):
    V = np.zeros((n, n))
    for _ in range(500):
        W = V.copy()
        for i in range(n):
            for j in range(n):
                if (i, j) not in terminal:
                    W[i, j] = sum(policy[i, j, a] * (-1 + V[move(i, j, a)]) for a in range(4))
        V = W
    new = np.zeros_like(policy)
    for i in range(n):
        for j in range(n):
            q = np.array([-1 + V[move(i, j, a)] for a in range(4)])
            best = np.isclose(q, q.max())
            new[i, j] = best / best.sum()
    changed = not np.allclose(new, policy)
    policy = new
    print(rnd, round(float(V[0, 1]), 2), changed)
    if not changed:
        break`,
    v: rowflow("Policy iteration loop.", ["Start with any policy", "Evaluate V_π", "Improve: act greedily", "Policy changed?", "Optimal policy"], [
      "For example the random policy.",
      "Sweep the Bellman equation until values settle.",
      "Pick the best lookahead action in every state.",
      "If yes, evaluate again; if no, stop.",
      "Stable: it cannot be improved any further.",
    ]),
  },
  {
    t: "Value iteration and the Bellman optimality equation",
    lv: 2,
    s: `Value iteration merges evaluation and improvement into one update using the {{Bellman optimality equation}}: {{V*(s) = maxₐ Σ P(s′ | s, a)[ r + γV*(s′) ]}} — replace the average over the policy's actions by a max. Repeating it from V = 0 converges to V*. On the gridworld the answer is simply minus the Manhattan distance to the nearest corner (−1, −2, −3 …), reached after only a few sweeps; the optimal policy is then read off greedily. Q-learning is the sampled, model-free version of this same update.`,
    r: `Value iteration is the right tool when the model is known and the state space small; its cost per sweep is |S|²|A|.`,
    i: `What is V*(r1,c1) in the gridworld and why?`,
    c: py`${GRID}
V = np.zeros((n, n))
for sweep in range(1, 8):
    W = V.copy()
    for i in range(n):
        for j in range(n):
            if (i, j) not in terminal:
                W[i, j] = max(-1 + V[move(i, j, a)] for a in range(4))
    V = W
    if sweep in (1, 2, 3, 6):
        print(sweep, V.astype(int).tolist())`,
    v: cells("Optimal values: minus the shortest number of steps to a corner.", grid(GOPT), [
      ["Value iteration converges in a few sweeps."],
      ["Cells next to a corner are −1: one step.", [[1, 2, 2], [2, 1, 1], [3, 3, 3], [4, 3, 3]]],
      ["The farthest cells need 3 steps: −3.", [[1, 4, 4], [2, 4, 4], [4, 1, 1], [3, 1, 1]]],
    ]),
  },
  {
    t: "The discount factor and the value of patience",
    lv: 1,
    s: `γ decides how much the future matters. A reward of 1 arriving k steps from now is worth γᵏ today: with γ = 0.9, ten steps away it is worth 0.349; with γ = 0.99 it is worth 0.904. The sum of an endless stream of 1s is 1/(1 − γ): 10 for γ = 0.9, 100 for γ = 0.99 — the {{effective horizon}} is about 1/(1 − γ) steps. A small γ gives greedy, short-sighted behaviour and fast learning; a large γ plans far ahead but makes learning slower and noisier. In episodic tasks γ = 1 is allowed because episodes end.`,
    r: `Choose γ from the timescale of the problem: a game of 10,000 steps needs a γ close to 1.`,
    i: `What is the present value of a reward 10 steps away with γ = 0.9?`,
    c: py`
for gamma in (0.5, 0.9, 0.99):
    print(gamma, round(gamma ** 10, 3), round(1 / (1 - gamma), 1))`,
    v: plot("Present value of a reward k steps in the future.", {
      x: [0, 50], y: [0, 1.05], labels: ["steps k", "γᵏ"],
      params: [par("g", "discount γ", 0.5, 0.99, 0.01, 0.9)],
      readout: ["γ¹⁰ = {pow(g,10):3}   ·   effective horizon 1/(1 − γ) = {1/(1-g):1} steps"],
      steps: [["γ = 0.5: forgets within a few steps.", { g: 0.5 }], ["γ = 0.9: about 10 steps of vision.", { g: 0.9 }], ["γ = 0.99: far-sighted.", { g: 0.99 }]],
    }, [curve("pow(g,x)", { c: "accent" }), pt("10", "pow(g,10)", { c: "bad" })]),
  },
];

/* ------------------------------------------------------------------ */
export const mc: ConceptDef[] = [
  {
    t: "Monte Carlo prediction: learn from complete episodes",
    lv: 1,
    s: `If the model is unknown, learn from experience. {{Monte Carlo}} methods run complete episodes and estimate V(s) as the average of the returns observed after visiting s. No model, no bootstrapping — just averaging. Two episodes visit state A: the return afterwards was 8.29 in one and 8.10 in the other, so V(A) ≈ 8.195. The {{first-visit}} variant averages the return after the first visit in each episode; {{every-visit}} uses all visits. Updates happen only when an episode ends, so it needs episodic tasks.`,
    r: `Estimates are unbiased but noisy, because a whole random trajectory contributes to every return.`,
    i: `Estimate V(A) from the two returns above.`,
    c: py`
import numpy as np

returns = {"A": [8.29, 8.10]}
print({s: round(float(np.mean(v)), 3) for s, v in returns.items()})
episode = [("A", 1.0), ("B", 0.0), ("A", 0.0), ("T", 10.0)]
gamma = 0.9
G, first = 0.0, {}
for t in range(len(episode) - 1, -1, -1):
    s, r = episode[t]
    G = r + gamma * G
    first[s] = round(G, 3)
print(first)`,
    v: cells("Returns from each time step of one episode (γ = 0.9).", table(["step", "state", "reward", "return Gₜ"], [["0", "A", "1", "8.29"], ["1", "B", "0", "8.1"], ["2", "A", "0", "9"], ["3", "T", "10", "10"]]), [
      ["Work backwards: Gₜ = rₜ + γGₜ₊₁."],
      ["A is visited at steps 0 and 2: first-visit uses step 0, every-visit uses both.", [[1, 1, 3], [3, 1, 3]]],
    ]),
  },
  {
    t: "Monte Carlo versus dynamic programming",
    lv: 2,
    s: `DP needs the full model and bootstraps: it updates a state's value from the values of successor states. Monte Carlo needs no model, does not bootstrap, and can focus on the states that actually occur — useful when the state space is huge but only a small part is visited. Because each state's estimate is independent of the others, errors do not propagate. The trade-off is variance: a return depends on many random steps, so many episodes are needed, and nothing is learned until an episode finishes.`,
    r: `Think of DP as planning with the rules in hand, Monte Carlo as learning from playing whole games.`,
    i: `Why does Monte Carlo not bootstrap, and what does that cost?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
true_value = 0.5
for episodes in (10, 100, 10000):
    estimates = [rng.binomial(1, true_value, episodes).mean() for _ in range(200)]
    print(episodes, round(float(np.std(estimates)), 3))`,
    v: compare("Dynamic programming versus Monte Carlo.", ["Dynamic programming", "Monte Carlo"], [
      ["Needs a model", "yes", "no"],
      ["Bootstraps (uses estimates)", "yes", "no"],
      ["Updates", "every state each sweep", "after each complete episode"],
      ["Variance", "low", "high"],
    ]),
  },
  {
    t: "Monte Carlo control with ε-soft policies",
    lv: 2,
    s: `To control (find a good policy) from samples we estimate action values Q(s, a): after each episode, update each visited pair towards its observed return, Q ← Q + α(G − Q), and act ε-greedily with respect to Q. Because every action keeps probability at least ε/|A|, all state–action pairs continue to be tried (the "exploring starts" requirement is replaced by a soft policy). The loop — play with the current ε-greedy policy, update Q from returns — is again generalised policy iteration, now model-free.`,
    r: `The final policy is ε-greedy, not truly greedy; decay ε or evaluate the greedy policy separately.`,
    i: `Why must a Monte Carlo control agent keep exploring?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
Q, N = np.zeros((3, 2)), np.zeros((3, 2))
for ep in range(3000):
    s, traj = 0, []
    while s < 2:
        a = int(rng.integers(2)) if rng.random() < 0.2 else int(np.argmax(Q[s]))
        s2 = s + 1 if a == 1 else s
        r = 1.0 if (s2 == 2) else -0.1
        traj.append((s, a, r))
        s = s2 if a == 1 else s
        if len(traj) > 20:
            break
    G = 0.0
    for s_, a_, r_ in reversed(traj):
        G = r_ + 0.9 * G
        N[s_, a_] += 1
        Q[s_, a_] += (G - Q[s_, a_]) / N[s_, a_]
print(Q.round(2).tolist(), Q.argmax(axis=1).tolist())`,
    v: rowflow("Monte Carlo control loop.", ["Play an episode with ε-greedy π", "Compute returns", "Update Q(s, a) towards G", "Improve π (ε-greedy on Q)", "Repeat"], [
      "Actions come from the current policy.",
      "Work backwards through the episode.",
      "Average returns into Q.",
      "Better Q gives a better policy.",
      "Until Q stops changing.",
    ]),
  },
  {
    t: "Off-policy learning and importance sampling",
    lv: 2,
    s: `{{On-policy}} methods learn about the policy that generates the data; {{off-policy}} methods learn about a target policy π while following a different behaviour policy b — for example learning the greedy policy while exploring. Returns from b must be reweighted by the {{importance-sampling ratio}} ρ = Π π(aₜ | sₜ) / b(aₜ | sₜ). If the target always takes action a (π = 1) but the behaviour takes it with probability 0.5, an episode containing it is weighted ρ = 2; two such steps give 4. Weights can become huge, making estimates high-variance, so practical methods clip or avoid them (Q-learning does).`,
    r: `Off-policy learning lets an agent reuse old data and learn from other agents or humans.`,
    i: `Compute the importance ratio for 3 steps where π = 1 and b = 0.5 each time.`,
    c: py`
import numpy as np

pi = np.array([1.0, 1.0, 1.0])
b = np.array([0.5, 0.5, 0.5])
rho = np.cumprod(pi / b)
print(rho.tolist())
returns = np.array([10.0, 0.0, 0.0, 0.0])
weights = np.array([8.0, 1.0, 1.0, 1.0])
print(round(float(np.average(returns, weights=weights)), 3), round(float(returns.mean()), 3))`,
    v: plot("Importance ratio after n steps when π(a) = 1 and b(a) = p.", {
      x: [1, 10], y: [0, 100], labels: ["steps n", "ratio ρ"],
      params: [par("p", "behaviour probability b(a)", 0.3, 1, 0.1, 0.5)],
      readout: ["ρ after 3 steps = (1/{p})³ = {pow(1/p,3):2}   ·   after 10 steps = {pow(1/p,10):1}"],
      steps: [["b = 0.5: the ratio doubles every step.", { p: 0.5 }], ["b = 1: on-policy, ratio stays 1.", { p: 1 }]],
    }, [curve("pow(1/p,x)", { c: "bad" })]),
  },
];

void [P, hline, seg, vline];
