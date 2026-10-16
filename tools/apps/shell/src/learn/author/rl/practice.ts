import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* basics */
  ["basics", 1, "Name the parts of the agent–environment loop.", "The agent observes a state, takes an action; the environment returns a reward and the next state; the agent learns and repeats."],
  ["basics", 1, "Compute the return of rewards 1, 0, 0, 10 with γ = 0.9.", "1 + 0.9³ × 10 = 8.29."],
  ["basics", 1, "What do a policy, a value function and a model each represent?", "Policy: what to do in each state. Value function: expected return from a state or state–action. Model: predicted next state and reward."],
  ["basics", 2, "What is the Markov property?", "The next state and reward depend only on the current state and action, not on earlier history; the state must contain everything relevant."],
  ["basics", 1, "How are V and Q related?", "V_π(s) = Σ π(a | s) Q_π(s, a); V*(s) = max_a Q*(s, a)."],
  ["basics", 1, "What is the exploration–exploitation trade-off?", "Exploit what you know to earn reward versus explore to learn better options; neither alone is optimal."],
  ["basics", 1, "Give two reasons RL is harder than supervised learning.", "Only delayed evaluative rewards (credit assignment), and the data depend on the agent's own actions, so exploration is needed."],
  /* bandits */
  ["bandit", 1, "Per-pull regret of always pulling an arm of mean 0.5 when the best mean is 0.8?", "0.3."],
  ["bandit", 1, "Update Q incrementally after rewards 1, 0, 1 with step 1/n.", "Q = 1, 0.5, 0.667."],
  ["bandit", 2, "Why use a constant step size α?", "It forgets old rewards exponentially (weight α(1 − α)^k), tracking non-stationary arms; 1/n is for stationary problems."],
  ["bandit", 1, "ε-greedy with 5 arms and ε = 0.1: probability of the greedy arm?", "1 − ε + ε/k = 0.92; each other arm gets 0.02."],
  ["bandit", 2, "UCB at t = 12, Q = (0.5, 0.4), N = (10, 2), c = 2: which arm?", "Scores 1.497 and 2.629 — arm 2, because its bonus is larger."],
  ["bandit", 2, "Posterior mean of an arm with 3 successes and 1 failure under Beta(1, 1)?", "(1 + 3)/(2 + 4) = 0.667."],
  ["bandit", 2, "Which strategies achieve logarithmic regret?", "UCB and Thompson sampling; greedy can have linear regret and constant-ε grows linearly."],
  /* mdp */
  ["mdp", 2, "State the Bellman expectation equation.", "V_π(s) = Σ_a π(a|s) Σ_s′ P(s′|s,a)[r + γV_π(s′)]."],
  ["mdp", 2, "V for a 50/50 policy: a₁ gives r = 1 to a state of value 4, a₂ gives r = 0 to value 6, γ = 0.9.", "0.5(1 + 3.6) + 0.5(0 + 5.4) = 5.0."],
  ["mdp", 1, "In the 4×4 gridworld with step cost −1 and the random policy, why are the values negative?", "Each step costs 1, so V is minus the expected number of steps to a terminal corner (−14 next to a corner)."],
  ["mdp", 2, "What does policy improvement do and why does it work?", "It makes the policy greedy with respect to V_π; the policy improvement theorem guarantees the new policy is at least as good everywhere."],
  ["mdp", 2, "Policy iteration versus value iteration?", "Policy iteration alternates full evaluation and greedy improvement; value iteration folds improvement into one max-based sweep (Bellman optimality)."],
  ["mdp", 2, "State the Bellman optimality equation.", "V*(s) = max_a Σ P(s′|s,a)[r + γV*(s′)]."],
  ["mdp", 1, "What is the effective horizon for γ = 0.9 and γ = 0.99?", "About 1/(1 − γ): 10 and 100 steps."],
  /* mc */
  ["mc", 1, "Monte Carlo: estimate V(A) from returns 8.29 and 8.10.", "The average, 8.195."],
  ["mc", 2, "Monte Carlo versus DP?", "MC needs no model and does not bootstrap but has high variance and needs complete episodes; DP needs the model and bootstraps."],
  ["mc", 2, "Why must MC control keep exploring?", "Otherwise some state–action pairs are never tried and their values never improve; ε-soft policies keep every action possible."],
  ["mc", 2, "Importance ratio for 3 steps with π = 1 and b = 0.5?", "(1/0.5)³ = 8; weights can explode, giving high variance."],
  /* td */
  ["td", 1, "Do one TD(0) update: V(s) = 0.5, r = 0, V(s′) = 0.7, α = 0.1, γ = 1.", "δ = 0.2; V(s) = 0.52."],
  ["td", 2, "TD versus Monte Carlo: bias and variance?", "TD has low variance but is biased while V(s′) is wrong; MC is unbiased but high variance."],
  ["td", 1, "SARSA update with Q = 0, r = 1, γ = 0.9, Q(s′, a′) = 1, α = 0.5?", "0.5 × (1 + 0.9) = 0.95."],
  ["td", 1, "Q-learning update with max Q(s′, ·) = 2 and the same numbers?", "0.5 × (1 + 1.8) = 1.4."],
  ["td", 2, "Why does SARSA take the safer path in cliff walking?", "It learns the value of the ε-greedy policy it executes, which includes occasional random steps off the edge; Q-learning learns the greedy policy's values."],
  ["td", 2, "On-policy versus off-policy?", "On-policy learns about the policy that generates the data; off-policy learns about a different (target) policy, e.g. Q-learning learns greedy while behaving ε-greedy."],
  ["td", 2, "What do the weights of TD(λ) look like?", "(1 − λ)λ^(n−1) on the n-step return; λ = 0 is TD(0) and λ = 1 is Monte Carlo."],
  /* approx */
  ["approx", 1, "Why can't tabular methods handle Atari or chess?", "Astronomically many states, most never visited, and no generalisation between states."],
  ["approx", 2, "Write the semi-gradient TD(0) update for linear V̂ = w·x.", "w ← w + α[r + γ w·x′ − w·x] x."],
  ["approx", 2, "Explain experience replay and the target network.", "Replay samples random past transitions to break correlation and reuse data; the target network is a slowly updated copy that fixes the bootstrap target."],
  ["approx", 2, "DQN target for r = 1, γ = 0.99, target Q-values (2, 3)?", "y = 1 + 0.99 × 3 = 3.97."],
  ["approx", 2, "Why does Q-learning over-estimate and how does Double DQN help?", "The max of noisy estimates is biased upward; Double DQN selects the action with the online network and evaluates it with the target network."],
  ["approx", 2, "What is the deadly triad?", "Function approximation + bootstrapping + off-policy data: together they can make learning diverge."],
  /* policy */
  ["policy", 1, "Why learn a policy directly?", "Handles continuous actions and stochastic policies, and changes probabilities smoothly."],
  ["policy", 2, "REINFORCE gradient for logits (1, 0), action 1 chosen, G = 2?", "G(onehot − π) = 2(1 − 0.731, −0.269) = (0.538, −0.538)."],
  ["policy", 2, "Why subtract a baseline and what is the advantage?", "It reduces variance without changing the expected gradient; advantage A = G − V(s) says how much better than usual an action was."],
  ["policy", 2, "Actor and critic roles?", "The actor is the policy; the critic learns V and supplies the TD error δ = r + γV(s′) − V(s) as the advantage."],
  ["policy", 2, "GAE for rewards (1, 0, 1), V = (0.5, 0.4, 0.6, 0), γ = 0.9, λ = 0.8?", "δ = (0.86, 0.14, 0.40); Â = (1.168, 0.428, 0.400)."],
  ["policy", 2, "PPO objective for A = 2, r = 1.5, ε = 0.2?", "min(3.0, 1.2 × 2) = 2.4."],
  ["policy", 2, "How does a Gaussian policy handle continuous actions?", "It outputs mean and standard deviation, samples a ~ N(μ, σ²) and uses log π = −½((a−μ)/σ)² − log(σ√2π) in the gradient."],
  /* advanced */
  ["adv", 2, "How does Dyna-Q use a model?", "After each real step it updates Q, stores the transition in a model, then performs n planning updates on replayed model transitions."],
  ["adv", 2, "What is potential-based shaping and why is it safe?", "F = γΦ(s′) − Φ(s); it provably leaves the optimal policy unchanged, unlike arbitrary bonuses that can be farmed."],
  ["adv", 2, "Why is multi-agent RL harder?", "Other learners make the environment non-stationary; equilibria such as the prisoner's dilemma Nash can be worse for everyone."],
  ["adv", 2, "How does RLHF work?", "Fit a reward model on human preferences (P = σ(r_A − r_B)), then optimise the policy against it with RL under a KL penalty to a reference model."],
  ["adv", 1, "When would you prefer a bandit or supervised learning to RL?", "When decisions do not change later situations, or when labelled data or demonstrations are plentiful."],
  ["adv", 2, "Recommend an algorithm for continuous robot control.", "PPO for stability, or SAC/TD3 for sample efficiency; start in simulation with many seeds."],
];

export const drills: DrillDef[] = [
  {
    t: "Discounted return",
    q: "What does this print?",
    code: py`
rewards, gamma = [1, 0, 0, 10], 0.9
G = 0
for r in reversed(rewards):
    G = r + gamma * G
print(round(G, 2))`,
    opts: [["8.29", true, "1 + 0.9³ × 10."], ["11", false, "That ignores the discount."], ["9.0", false, "That is the return from step 3, not step 1."]],
    path: ["G = 10.", "G = 0 + 0.9 × 10 = 9.", "G = 0 + 0.9 × 9 = 8.1.", "G = 1 + 0.9 × 8.1 = 8.29."],
    why: "Working backwards uses Gₜ = rₜ + γGₜ₊₁.",
    watch: "Loop in reverse.",
    remember: "G = r + γ G_next.",
  },
  {
    t: "Incremental average",
    q: "What does this print?",
    code: py`
Q = 0.0
for n, r in enumerate([1, 0, 1], 1):
    Q += (r - Q) / n
print(round(Q, 3))`,
    opts: [["0.667", true, "The mean of 1, 0, 1."], ["0.5", false, "That is Q after two rewards."], ["1.0", false, "That is Q after the first reward only."]],
    path: ["n = 1: Q = 1.", "n = 2: Q = 1 + (0 − 1)/2 = 0.5.", "n = 3: Q = 0.5 + (1 − 0.5)/3 = 0.667."],
    why: "The incremental form equals the sample average.",
    watch: "Divide by n, not by n − 1.",
    remember: "Q ← Q + (R − Q)/n.",
  },
  {
    t: "ε-greedy probability",
    q: "What does this print?",
    code: py`
eps, k = 0.1, 5
print(round(1 - eps + eps / k, 2), round(eps / k, 2))`,
    opts: [["0.92 0.02", true, "The greedy arm also gets its share of random picks."], ["0.9 0.1", false, "Random choices are spread over all k arms."], ["0.9 0.025", false, "ε/k with k = 5 is 0.02."]],
    path: ["ε/k = 0.02.", "Greedy arm: 1 − 0.1 + 0.02 = 0.92."],
    why: "The random branch may also pick the greedy arm.",
    watch: "Do not forget the ε/k term.",
    remember: "P(greedy) = 1 − ε + ε/k.",
  },
  {
    t: "UCB score",
    q: "What does this print?",
    code: py`
import numpy as np
Q, N, t, c = np.array([0.5, 0.4]), np.array([10, 2]), 12, 2.0
s = Q + c * np.sqrt(np.log(t) / N)
print(s.round(3).tolist(), int(s.argmax()))`,
    opts: [["[1.497, 2.629] 1", true, "The less-tried arm has the larger bonus."], ["[0.5, 0.4] 0", false, "That ignores the exploration bonus."], ["[1.497, 2.629] 0", false, "argmax returns the index 1, the second arm."]],
    path: ["ln 12 = 2.485.", "Arm 1 bonus 2√(2.485/10) = 0.997.", "Arm 2 bonus 2√(2.485/2) = 2.229."],
    why: "Uncertain arms get a large bonus.",
    watch: "Indexing starts at 0 in Python.",
    remember: "Q + c√(ln t / N).",
  },
  {
    t: "TD update",
    q: "What does this print?",
    code: py`
V_s, V_next, r, alpha, gamma = 0.5, 0.7, 0.0, 0.1, 1.0
delta = r + gamma * V_next - V_s
print(round(delta, 2), round(V_s + alpha * delta, 3))`,
    opts: [["0.2 0.52", true, "δ = 0.2 and a step of 0.1 × 0.2."], ["0.7 0.57", false, "δ subtracts the current value."], ["0.2 0.7", false, "α = 0.1, not 1."]],
    path: ["δ = 0 + 0.7 − 0.5 = 0.2.", "V = 0.5 + 0.1 × 0.2 = 0.52."],
    why: "TD moves the estimate a fraction of the error.",
    watch: "The target includes the reward.",
    remember: "V ← V + α(r + γV′ − V).",
  },
  {
    t: "SARSA versus Q-learning",
    q: "What does this print?",
    code: py`
r, gamma, alpha = 1.0, 0.9, 0.5
q_chosen, q_max = 1.0, 2.0
sarsa = alpha * (r + gamma * q_chosen)
qlearn = alpha * (r + gamma * q_max)
print(round(sarsa, 2), round(qlearn, 2))`,
    opts: [["0.95 1.4", true, "SARSA uses the chosen action, Q-learning the best one."], ["1.4 0.95", false, "These are swapped."], ["0.5 0.5", false, "The bootstrapped value must be included."]],
    path: ["SARSA: 0.5 × (1 + 0.9 × 1) = 0.95.", "Q-learning: 0.5 × (1 + 0.9 × 2) = 1.4."],
    why: "Only the bootstrap term differs.",
    watch: "Both start from Q = 0 here.",
    remember: "SARSA: Q(s′, a′). Q-learning: max Q(s′, ·).",
  },
  {
    t: "DQN target",
    q: "What does this print?",
    code: py`
import numpy as np
r, gamma = 1.0, 0.99
q_next = np.array([2.0, 3.0])
print(round(float(r + gamma * q_next.max()), 2))`,
    opts: [["3.97", true, "1 + 0.99 × 3."], ["2.98", false, "That uses the smaller Q-value."], ["4.0", false, "The discount 0.99 matters."]],
    path: ["max Q = 3.", "y = 1 + 0.99 × 3 = 3.97."],
    why: "The target takes the best next action.",
    watch: "Use the target network's values.",
    remember: "y = r + γ max Q_target.",
  },
  {
    t: "REINFORCE gradient",
    q: "What does this print?",
    code: py`
import numpy as np
theta = np.array([1.0, 0.0])
pi = np.exp(theta) / np.exp(theta).sum()
print((2.0 * (np.eye(2)[0] - pi)).round(3).tolist())`,
    opts: [["[0.538, -0.538]", true, "G × (onehot − π)."], ["[2.0, 0.0]", false, "Subtract the policy probabilities."], ["[0.731, 0.269]", false, "That is π itself."]],
    path: ["π = (0.731, 0.269).", "onehot − π = (0.269, −0.269).", "× 2 = (0.538, −0.538)."],
    why: "The gradient of log-softmax is onehot − π.",
    watch: "The sign follows the return.",
    remember: "∇log π(a) = onehot(a) − π.",
  },
  {
    t: "PPO clipping",
    q: "What does this print?",
    code: py`
import numpy as np
f = lambda r, A, e=0.2: min(r * A, float(np.clip(r, 1 - e, 1 + e)) * A)
print(f(1.5, 2.0), f(0.5, -1.0))`,
    opts: [["2.4 -0.8", true, "Positive gain capped; negative one stays pessimistic."], ["3.0 -0.5", false, "That ignores clipping."], ["2.4 -0.5", false, "For A < 0 the min picks the clipped −0.8."]],
    path: ["r = 1.5: min(3.0, 1.2 × 2) = 2.4.", "r = 0.5: min(−0.5, 0.8 × −1) = −0.8."],
    why: "The min removes the incentive to move far.",
    watch: "Mind the sign of the advantage.",
    remember: "min(rA, clip(r, 1 ± ε)A).",
  },
  {
    t: "GAE advantages",
    q: "What does this print?",
    code: py`
r, V, g, l = [1.0, 0.0, 1.0], [0.5, 0.4, 0.6, 0.0], 0.9, 0.8
d = [r[t] + g * V[t + 1] - V[t] for t in range(3)]
A, run = [0.0] * 3, 0.0
for t in reversed(range(3)):
    run = d[t] + g * l * run
    A[t] = run
print([round(x, 3) for x in d], [round(x, 3) for x in A])`,
    opts: [["[0.86, 0.14, 0.4] [1.168, 0.428, 0.4]", true, "Backward accumulation of discounted TD errors."], ["[0.86, 0.14, 0.4] [0.86, 0.14, 0.4]", false, "That is λ = 0."], ["[1.0, 0.0, 1.0] [1.0, 0.0, 1.0]", false, "δ subtracts V and adds γV′."]],
    path: ["δ = 0.86, 0.14, 0.4.", "Â₂ = 0.4.", "Â₁ = 0.14 + 0.72 × 0.4 = 0.428.", "Â₀ = 0.86 + 0.72 × 0.428 = 1.168."],
    why: "GAE sums future TD errors with weight (γλ)ᵏ.",
    watch: "Loop backwards.",
    remember: "Â ← δ + γλ Â_next.",
  },
  {
    t: "Importance ratio",
    q: "What does this print?",
    code: py`
import numpy as np
print(np.cumprod(np.array([1.0, 1.0, 1.0]) / np.array([0.5, 0.5, 0.5])).tolist())`,
    opts: [["[2.0, 4.0, 8.0]", true, "The ratio doubles at each step."], ["[2.0, 2.0, 2.0]", false, "Ratios multiply along the trajectory."], ["[0.5, 0.25, 0.125]", false, "That is b/π, the inverse."]],
    path: ["Step ratio 1/0.5 = 2.", "Running product: 2, 4, 8."],
    why: "Off-policy correction multiplies per-step ratios.",
    watch: "Long trajectories give huge weights.",
    remember: "ρ = Π π/b.",
  },
  {
    t: "Shaping bonus",
    q: "What does this print?",
    code: py`
gamma, phi_far, phi_near = 0.9, 2.0, 3.0
print(round(gamma * phi_near - phi_far, 2))`,
    opts: [["0.7", true, "γΦ(s′) − Φ(s) = 2.7 − 2."], ["1.0", false, "The discount applies to Φ(s′)."], ["0.9", false, "That is γ alone."]],
    path: ["γΦ(s′) = 2.7.", "minus Φ(s) = 2 → 0.7."],
    why: "Potential-based shaping preserves optimal policies.",
    watch: "Going back and forth earns no net bonus.",
    remember: "F = γΦ(s′) − Φ(s).",
  },
];

export const codeLab: [string, string, string][] = [
  ["Value iteration on a gridworld", "Compute the optimal values of the 4×4 gridworld.", py`
import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
move = lambda i, j, a: (min(max(i + moves[a][0], 0), n - 1), min(max(j + moves[a][1], 0), n - 1))
V = np.zeros((n, n))
for _ in range(10):
    W = V.copy()
    for i in range(n):
        for j in range(n):
            if (i, j) not in terminal:
                W[i, j] = max(-1 + V[move(i, j, a)] for a in range(4))
    V = W
print(V.astype(int).tolist())`],
  ["ε-greedy bandit", "Run an ε-greedy agent on a 3-armed bandit and print the estimates.", py`
import numpy as np

rng = np.random.default_rng(0)
means = np.array([0.2, 0.5, 0.8])
Q, N = np.zeros(3), np.zeros(3)
for t in range(2000):
    a = int(rng.integers(3)) if rng.random() < 0.1 else int(np.argmax(Q))
    r = float(rng.random() < means[a])
    N[a] += 1
    Q[a] += (r - Q[a]) / N[a]
print(Q.round(2).tolist(), N.astype(int).tolist())`],
  ["Q-learning on a corridor", "Learn to walk right along a 6-state corridor.", py`
import numpy as np

rng = np.random.default_rng(0)
Q = np.zeros((6, 2))
for ep in range(300):
    s = 0
    while s < 5:
        a = int(rng.integers(2)) if rng.random() < 0.2 else int(np.argmax(Q[s]))
        s2 = min(s + 1, 5) if a == 1 else max(s - 1, 0)
        r = 1.0 if s2 == 5 else 0.0
        Q[s, a] += 0.5 * (r + 0.9 * Q[s2].max() * (s2 < 5) - Q[s, a])
        s = s2
print(Q.argmax(axis=1).tolist(), Q[:5, 1].round(2).tolist())`],
  ["TD(0) random walk", "Estimate the values of a five-state random walk.", py`
import numpy as np

rng = np.random.default_rng(1)
V = np.full(5, 0.5)
for _ in range(3000):
    s = 2
    while True:
        s2 = s + int(rng.choice([-1, 1]))
        done = s2 < 0 or s2 > 4
        target = (1.0 if s2 > 4 else 0.0) + (0.0 if done else V[s2])
        V[s] += 0.02 * (target - V[s])
        if done:
            break
        s = s2
print(V.round(2).tolist())`],
  ["REINFORCE on a two-armed bandit", "Train a softmax policy with a baseline.", py`
import numpy as np

rng = np.random.default_rng(0)
theta = np.zeros(2)
means = np.array([0.3, 0.7])
baseline = 0.0
for t in range(3000):
    pi = np.exp(theta) / np.exp(theta).sum()
    a = int(rng.choice(2, p=pi))
    r = float(rng.random() < means[a])
    baseline += 0.01 * (r - baseline)
    theta += 0.1 * (r - baseline) * (np.eye(2)[a] - pi)
print((np.exp(theta) / np.exp(theta).sum()).round(2).tolist())`],
  ["Epsilon decay schedule", "Print ε for the first, middle and last episode of a linear decay.", py`
import numpy as np

episodes = 1000
eps = np.linspace(1.0, 0.05, episodes)
print(round(float(eps[0]), 2), round(float(eps[500]), 3), round(float(eps[-1]), 2))`],
  ["Replay buffer sampling", "Store 100 transitions and sample a mini-batch.", py`
import numpy as np
from collections import deque

buffer = deque(maxlen=50)
for i in range(100):
    buffer.append((i, i % 2, float(i % 3), i + 1))
rng = np.random.default_rng(0)
batch = [buffer[i] for i in rng.choice(len(buffer), size=4, replace=False)]
print(len(buffer), [b[0] for b in batch])`],
];

export const glance: [string, string][] = [
  ["Return", "Gₜ = Rₜ₊₁ + γGₜ₊₁ · horizon ≈ 1/(1 − γ)"],
  ["Value functions", "V_π(s) = Σ π(a|s) Q_π(s,a) · V* = max_a Q*"],
  ["Bellman", "V_π = Σπ Σ P[r + γV_π(s′)] · optimality: V* = max_a Σ P[r + γV*(s′)]"],
  ["Bandits", "Q ← Q + (R − Q)/n · ε-greedy P = 1 − ε + ε/k · UCB = Q + c√(ln t / N)"],
  ["Monte Carlo", "V(s) = mean of returns · importance ratio ρ = Π π/b"],
  ["TD / SARSA / Q-learning", "V ← V + α(r + γV′ − V) · SARSA Q(s′,a′) · Q-learning max Q(s′,·)"],
  ["TD(λ)", "weights (1 − λ)λ^(n−1) · trace e ← γλe"],
  ["Linear / deep", "V̂ = w·x · w ← w + αδx · DQN y = r + γ max Q_target(s′,·) · Double DQN: online selects, target evaluates"],
  ["Policy gradient", "∇J = E[G ∇log π] · softmax ∇log π = onehot − π · advantage A = G − V"],
  ["GAE / PPO", "Â = δ + γλ Â_next · L = min(rA, clip(r, 1 ± ε)A)"],
  ["Shaping / RLHF", "F = γΦ(s′) − Φ(s) · P(A ≻ B) = σ(r_A − r_B) · reward − β KL"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable RL experiments", ["Solve a tiny version of the task exactly first", "Use several random seeds and plot mean with intervals", "Compare with random and heuristic baselines", "Normalise observations and scale rewards", "Log returns, episode lengths and exploration rate", "Watch the agent's behaviour, not just the score"]],
  ["Debugging an agent that does not learn", ["Check that rewards are what you expect and not shifted or clipped wrongly", "Verify the environment resets and terminates correctly", "Lower the learning rate and check for exploding values", "Make sure exploration does not decay too early", "Test the update rule on a toy problem with a known answer", "Check shapes: terminal flags and discount handling at episode end"]],
  ["Explaining your answer in an exam", ["Write the update rule, substitute the numbers, compute, interpret", "State whether the method is on- or off-policy, model-based or free", "Say what is being bootstrapped", "Mention the bias–variance trade-off"]],
];

export const materials: [string, [string, string][]][] = [
  ["Free books and courses", [["Reinforcement Learning: An Introduction — Sutton and Barto", "http://incompleteideas.net/book/the-book-2nd.html"], ["Spinning Up in Deep RL — OpenAI", "https://spinningup.openai.com/"], ["Hugging Face Deep RL course", "https://huggingface.co/learn/deep-rl-course"]]],
  ["Libraries", [["Gymnasium (environments)", "https://gymnasium.farama.org/"], ["Stable-Baselines3", "https://stable-baselines3.readthedocs.io/"], ["CleanRL (single-file implementations)", "https://docs.cleanrl.dev/"]]],
];
