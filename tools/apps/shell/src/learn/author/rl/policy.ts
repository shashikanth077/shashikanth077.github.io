import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python/NumPy and is RUN by `npm run outputs -- reinforcement-learning`. */

export const policy: ConceptDef[] = [
  {
    t: "Policy-based methods: learn the policy directly",
    lv: 1,
    s: `Instead of learning values and acting greedily, parametrise the policy π(a | s; θ) and adjust θ to increase expected return. Advantages: it handles {{continuous actions}} (output a mean and a spread), represents {{stochastic}} policies (essential in games with hidden information), and changes action probabilities smoothly rather than flipping when one Q-value overtakes another. For discrete actions a softmax over scores gives the probabilities: logits (1, 0) → π = (0.731, 0.269).`,
    r: `Policy methods usually have high variance and are less sample-efficient than value methods; baselines and critics fix much of that.`,
    i: `Turn the logits (1, 0) into action probabilities.`,
    c: py`
import numpy as np

theta = np.array([1.0, 0.0])
pi = np.exp(theta - theta.max())
pi /= pi.sum()
print(pi.round(3).tolist())
rng = np.random.default_rng(0)
print(np.bincount(rng.choice(2, size=1000, p=pi), minlength=2).tolist())`,
    v: bars("Action probabilities for logits (z, 0).", [["action 1", "exp(z)/(exp(z)+1)"], ["action 2", "1/(exp(z)+1)"]], {
      max: 1,
      params: [par("z", "logit of action 1", -4, 4, 0.5, 1)],
      readout: ["π = ({exp(z)/(exp(z)+1):3}, {1/(exp(z)+1):3})"],
      steps: [["Logit 1: a mildly preferred action.", { z: 1 }], ["Logit 4: nearly deterministic.", { z: 4 }]],
    }),
  },
  {
    t: "The policy gradient and REINFORCE",
    lv: 2,
    s: `The {{policy gradient theorem}} gives ∇J(θ) = E[ Gₜ ∇log π(aₜ | sₜ; θ) ]: make actions that were followed by high returns more likely, in proportion to the return. {{REINFORCE}} samples an episode and does θ ← θ + α Gₜ ∇log π(aₜ | sₜ). For a softmax policy ∇log π(a) = onehot(a) − π. With logits (1, 0) (π = 0.731, 0.269), action 1 taken and return G = 2: the gradient is 2 × (1 − 0.731, 0 − 0.269) = (0.538, −0.538), pushing the logit of the chosen action up and the other down. A negative return would push the other way.`,
    r: `REINFORCE is unbiased but noisy; every practical policy-gradient method adds a baseline.`,
    i: `Compute the REINFORCE gradient for logits (1, 0), chosen action 1 and return 2.`,
    c: py`
import numpy as np

theta = np.array([1.0, 0.0])
pi = np.exp(theta) / np.exp(theta).sum()
a, G = 0, 2.0
grad_logp = np.eye(2)[a] - pi
print(pi.round(3).tolist(), (G * grad_logp).round(3).tolist())
theta = theta + 0.5 * G * grad_logp
print(theta.round(3).tolist(), (np.exp(theta) / np.exp(theta).sum()).round(3).tolist())`,
    v: bars("Gradient on each logit after taking action 1 with return G.", [["logit 1", "G*(1-0.731)"], ["logit 2", "G*(0-0.269)"]], {
      max: 4,
      params: [par("G", "return G", -4, 4, 0.5, 2)],
      readout: ["∇ = G·(1 − π₁, −π₂) = ({G*0.269:3}, {-G*0.269:3}); a negative return reverses it"],
      steps: [["G = 2: raise the chosen action.", { G: 2 }], ["G = −2: lower it.", { G: -2 }]],
    }),
  },
  {
    t: "Baselines: subtract the average",
    lv: 2,
    s: `If every return is positive, REINFORCE raises the probability of every action it sees, only by different amounts — a lot of noise. Subtracting a {{baseline}} b(s) from the return, giving (G − b), leaves the expected gradient unchanged (the baseline does not depend on the action) but can cut the variance dramatically. A natural baseline is the state value V(s), so the weight becomes the {{advantage}} A = G − V(s): "how much better than usual was this?" Returns 10, 12, 11 with baseline 11 become advantages −1, +1, 0 — now only the genuinely better actions are reinforced.`,
    r: `A learned value function as baseline leads directly to actor–critic methods.`,
    i: `Compute advantages for returns 10, 12, 11 with a baseline of 11.`,
    c: py`
import numpy as np

G = np.array([10.0, 12.0, 11.0])
b = 11.0
print((G - b).tolist(), round(float(G.std()), 3), round(float((G - b).std()), 3))
rng = np.random.default_rng(0)
pi0 = 0.5
def grad_estimates(b, n=100000):
    a = rng.random(n) < 0.5
    G = np.where(a, rng.normal(12, 1, n), rng.normal(10, 1, n))
    return (G - b) * np.where(a, 1 - pi0, -pi0)
print(round(float(np.var(grad_estimates(0.0))), 2), round(float(np.var(grad_estimates(11.0))), 2))`,
    v: bars("Return and advantage of three actions (baseline = 11).", [["G₁ = 10", "10"], ["G₂ = 12", "12"], ["G₃ = 11", "11"], ["advantage of G₂", "12-b"]], {
      max: 14,
      params: [par("b", "baseline b", 0, 12, 1, 11)],
      readout: ["advantage = G − b = {10-b}, {12-b}, {11-b}"],
      steps: [["Baseline 11: advantages −1, +1, 0.", { b: 11 }], ["No baseline: all pushed up strongly.", { b: 0 }]],
    }),
  },
  {
    t: "Actor–critic",
    lv: 2,
    s: `Combine both worlds. The {{actor}} is the policy π(a | s; θ); the {{critic}} is a value function V(s; w). The critic's TD error is a one-step estimate of the advantage: {{δ = r + γV(s′) − V(s)}}. Update the critic towards the target (w ← w + α_w δ ∇V) and the actor along the policy gradient weighted by δ (θ ← θ + α_θ δ ∇log π(a | s)). Learning is online and low-variance, and no complete episode is needed. A2C/A3C, PPO, DDPG, TD3 and SAC are all actor–critic algorithms.`,
    r: `The critic's mistakes become the actor's gradient noise, so a good critic matters.`,
    i: `Compute the TD error that serves as advantage for r = 1, γ = 0.9, V(s) = 0.5, V(s′) = 0.6.`,
    c: py`
r, gamma, V_s, V_next = 1.0, 0.9, 0.5, 0.6
delta = r + gamma * V_next - V_s
print(round(delta, 3))`,
    v: rowflow("Actor and critic working together.", ["State s", "Actor picks a", "Environment: r, s′", "Critic: TD error δ", "Update actor and critic"], [
      "Observation.",
      "Sample from π(a | s).",
      "Reward and next state.",
      "δ = r + γV(s′) − V(s): better or worse than expected?",
      "Actor follows δ·∇log π; critic reduces δ².",
    ]),
  },
  {
    t: "Generalised advantage estimation",
    lv: 2,
    s: `How to estimate the advantage? One-step TD is low-variance but biased; Monte Carlo is unbiased but noisy. {{GAE(λ)}} blends them: with δₜ = rₜ + γV(sₜ₊₁) − V(sₜ), {{Âₜ = δₜ + γλ δₜ₊₁ + (γλ)² δₜ₊₂ + …}}. Rewards (1, 0, 1), values (0.5, 0.4, 0.6, 0), γ = 0.9, λ = 0.8: δ = (0.86, 0.14, 0.40) and Â = (1.168, 0.428, 0.400). λ = 0 gives plain δ; λ = 1 gives the Monte Carlo advantage. λ ≈ 0.95 is common in PPO.`,
    r: `Compute it with a backward loop: Â ← δ + γλ Â_next.`,
    i: `Compute GAE for rewards (1, 0, 1), values (0.5, 0.4, 0.6, 0), γ = 0.9, λ = 0.8.`,
    c: py`
rewards = [1.0, 0.0, 1.0]
values = [0.5, 0.4, 0.6, 0.0]
gamma, lam = 0.9, 0.8
deltas = [rewards[t] + gamma * values[t + 1] - values[t] for t in range(3)]
adv, running = [0.0] * 3, 0.0
for t in reversed(range(3)):
    running = deltas[t] + gamma * lam * running
    adv[t] = running
print([round(d, 3) for d in deltas], [round(a, 4) for a in adv])`,
    v: cells("TD errors and GAE advantages for a three-step trajectory.", table(["step", "reward", "δ", "Â (λ = 0.8)"], [["0", "1", "0.86", "1.168"], ["1", "0", "0.14", "0.428"], ["2", "1", "0.40", "0.400"]]), [
      ["Compute δ at every step first."],
      ["The last step's advantage equals its TD error.", [[3, 3, 3]]],
      ["Earlier steps add discounted later errors: Â₀ = 0.86 + 0.72 × 0.428.", [[1, 3, 3]]],
    ]),
  },
  {
    t: "PPO: clip the update",
    lv: 2,
    s: `Big policy updates can wreck performance. {{Proximal Policy Optimisation}} limits them with the ratio r = π_new(a | s) / π_old(a | s) and the clipped objective {{L = min( r·A, clip(r, 1 − ε, 1 + ε)·A )}}, ε ≈ 0.2. If A = 2 and the new policy already makes the action 1.5 times likelier (r = 1.5), the objective is min(3.0, 1.2 × 2) = 2.4: the gain is capped, so there is no incentive to move further. If A = −1 and r = 0.5, the objective is min(−0.5, 0.8 × −1) = −0.8: the pessimistic value is used. PPO is simple, stable and the default policy-gradient method.`,
    r: `PPO is also the optimiser behind most RLHF fine-tuning of language models.`,
    i: `Compute the PPO clipped objective for A = 2 with r = 1.5 and for A = −1 with r = 0.5 (ε = 0.2).`,
    c: py`
import numpy as np

def ppo(ratio, adv, eps=0.2):
    return min(ratio * adv, float(np.clip(ratio, 1 - eps, 1 + eps)) * adv)

print(ppo(1.5, 2.0), ppo(0.5, -1.0), ppo(1.1, 2.0))`,
    v: plot("Clipped PPO objective for a positive advantage A = 2 as the probability ratio grows.", {
      x: [0, 2.5], y: [0, 5], labels: ["ratio r = π_new / π_old", "objective"],
      params: [par("A", "advantage A", 0.5, 3, 0.5, 2), par("e", "clip range ε", 0.05, 0.5, 0.05, 0.2)],
      readout: ["objective at r = 1.5: min({1.5*A:2}, {min(max(1.5,1-e),1+e)*A:2}) = {min(1.5*A,min(max(1.5,1-e),1+e)*A):2}"],
      steps: [["A = 2, ε = 0.2: flat above r = 1.2.", { A: 2, e: 0.2 }], ["Wider clip range: more freedom.", { A: 2, e: 0.5 }]],
    }, [curve("x*A", { c: "muted", dash: true }), curve("min(x*A,min(max(x,1-e),1+e)*A)", { c: "accent" }), vline("1+e", { c: "bad", dash: true })]),
  },
  {
    t: "Continuous actions: Gaussian policies",
    lv: 2,
    s: `For a torque, a steering angle or a price there are infinitely many actions, so a table over actions is impossible. A {{Gaussian policy}} outputs a mean μ(s) and a standard deviation σ(s), samples a ~ N(μ, σ²), and has log-probability log π(a) = −½((a − μ)/σ)² − log(σ√(2π)). With μ = 0, σ = 1, a = 1: log π = −0.5 − 0.919 = −1.419. A policy-gradient step shifts μ towards high-return actions and shrinks σ as the agent becomes confident. Algorithms such as DDPG/TD3 use deterministic actor networks, SAC keeps a stochastic one with an entropy bonus.`,
    r: `Squash actions with tanh and rescale to the allowed range; clip carefully.`,
    i: `Compute the log-probability of a = 1 under N(0, 1).`,
    c: py`
import numpy as np

mu, sigma, a = 0.0, 1.0, 1.0
logp = -0.5 * ((a - mu) / sigma) ** 2 - np.log(sigma * np.sqrt(2 * np.pi))
print(round(float(logp), 3))
rng = np.random.default_rng(0)
print(rng.normal(mu, sigma, 5).round(2).tolist())`,
    v: plot("Log-probability of the action a under a Gaussian policy.", {
      x: [-4, 4], y: [-8, 0], labels: ["action a", "log π(a)"],
      params: [par("mu", "mean μ", -2, 2, 0.25, 0), par("sg", "std σ", 0.25, 2, 0.25, 1)],
      readout: ["log π(1) = {-0.5*pow((1-mu)/sg,2)-ln(sg*sqrt(2*3.14159265))}"],
      steps: [["μ = 0, σ = 1.", { mu: 0, sg: 1 }], ["Smaller σ: sharper peak, harsher for off-centre actions.", { mu: 0, sg: 0.5 }]],
    }, [curve("-0.5*pow((x-mu)/sg,2)-ln(sg*sqrt(2*3.14159265))", { c: "accent" }), vline("1", { c: "muted", dash: true })]),
  },
];

/* ------------------------------------------------------------------ */
export const adv: ConceptDef[] = [
  {
    t: "Model-based RL and Dyna",
    lv: 2,
    s: `A {{model}} predicts the next state and reward. With one, the agent can {{plan}}: simulate experience internally instead of acting. {{Dyna-Q}} interleaves three things at every real step: (1) direct RL update from the real transition, (2) learn the model (store what happened), (3) n planning updates on transitions replayed from the model. With n = 10 planning steps, each real step triggers ten extra Q-updates, so values propagate far faster — at the cost of memory and of trusting a possibly wrong model. AlphaZero and MuZero are model-based systems combining search with learned networks.`,
    r: `Model-based methods are much more sample-efficient but suffer when the model is inaccurate; real experience stays the ground truth.`,
    i: `How many value updates does one real step trigger in Dyna-Q with n = 10?`,
    c: py`
import numpy as np

rng = np.random.default_rng(0)
Q = np.zeros((6, 2))
model = {}
def update(s, a, r, s2, alpha=0.5, gamma=0.9):
    Q[s, a] += alpha * (r + gamma * Q[s2].max() - Q[s, a])

updates = 0
for step in range(30):
    s, a = int(rng.integers(5)), int(rng.integers(2))
    s2 = s + 1 if a == 1 else max(s - 1, 0)
    r = 1.0 if s2 == 5 else 0.0
    update(s, a, r, s2)
    model[(s, a)] = (r, s2)
    updates += 1
    for _ in range(10):
        (ps, pa), (pr, ps2) = list(model.items())[int(rng.integers(len(model)))]
        update(ps, pa, pr, ps2)
        updates += 1
print(updates, Q.round(2).tolist()[3:5])`,
    v: rowflow("One Dyna-Q step.", ["Real transition", "Direct Q update", "Update the model", "n planning updates", "Act again"], [
      "Observe (s, a, r, s′) in the world.",
      "Learn from it immediately.",
      "Remember what happened.",
      "Replay simulated transitions from the model.",
      "Values have spread further with the same real data.",
    ]),
  },
  {
    t: "Reward design and shaping",
    lv: 2,
    s: `Sparse rewards (only at the goal) make exploration hard; dense hints help but can backfire. {{Potential-based shaping}} adds F(s, s′) = γΦ(s′) − Φ(s) to the reward, with Φ a "progress" function such as minus the distance to the goal; it is the only form of shaping guaranteed to leave the optimal policy unchanged. Moving from a state with Φ = 2 to Φ = 3 at γ = 0.9 adds 0.9 × 3 − 2 = 0.7. Arbitrary bonuses ("+1 for moving toward the goal") can create loops that farm reward — {{reward hacking}}: the agent satisfies the letter of the reward, not your intent.`,
    r: `Always watch what the agent actually does; a rising return with absurd behaviour means the reward is wrong.`,
    i: `Compute the shaping bonus for moving from Φ = 2 to Φ = 3 with γ = 0.9.`,
    c: py`
gamma = 0.9
phi = {"far": 2.0, "near": 3.0}
print(round(gamma * phi["near"] - phi["far"], 3))
loop = gamma * phi["far"] - phi["near"]
print(round(loop + (gamma * phi["near"] - phi["far"]), 3))`,
    v: compare("Helpful versus harmful reward bonuses.", ["Effect"], [
      ["Potential-based γΦ(s′) − Φ(s)", "guides exploration, optimal policy unchanged"],
      ["+1 for every step towards the goal", "agent can loop back and forth farming reward"],
      ["Reward for a proxy metric", "agent optimises the proxy, not the goal"],
    ]),
  },
  {
    t: "Multi-agent reinforcement learning",
    lv: 2,
    s: `When several agents learn together, each one's environment includes the others, so it is non-stationary. Games capture the issue. In the {{prisoner's dilemma}} (payoffs: both cooperate 3,3; both defect 1,1; defect against a cooperator 5,0) defecting is the best reply whatever the other does, so (defect, defect) is the Nash equilibrium although (cooperate, cooperate) pays more for both. Settings: cooperative (shared reward), competitive (zero-sum, as in self-play for Go) and mixed. Techniques: centralised training with decentralised execution, communication, and population-based self-play.`,
    r: `Evaluate against a range of opponents, not only the one you trained with, to avoid brittle strategies.`,
    i: `Show that defecting is the best reply in the prisoner's dilemma payoffs above.`,
    c: py`
import numpy as np

payoff = {("C", "C"): (3, 3), ("C", "D"): (0, 5), ("D", "C"): (5, 0), ("D", "D"): (1, 1)}
for other in ("C", "D"):
    best = max("CD", key=lambda mine: payoff[(mine, other)][0])
    print("other plays", other, "-> best reply", best)`,
    v: cells("Payoffs (row player, column player).", table(["", "column C", "column D"], [["row C", "3, 3", "0, 5"], ["row D", "5, 0", "1, 1"]]), [
      ["Each cell lists the row player's and then the column player's payoff."],
      ["Against C the row player does better with D (5 > 3).", [[1, 1, 1], [2, 1, 1]]],
      ["Against D, D is again better (1 > 0): defection dominates.", [[1, 2, 2], [2, 2, 2]]],
    ]),
  },
  {
    t: "Learning from human feedback (RLHF)",
    lv: 2,
    s: `When the goal cannot be written as a formula ("be helpful"), learn the reward from people. Collect pairs of answers and which one a human preferred; fit a {{reward model}} r(x) with the Bradley–Terry model {{P(A preferred) = σ(r_A − r_B)}}: scores 2 and 0 give P = 0.881. Then fine-tune the language model with an RL algorithm (usually PPO) to maximise the reward model's score, with a {{KL penalty}} β·KL(π ‖ π_ref) that keeps it close to the original model so it cannot drift into reward-hacking gibberish. Variants (DPO and others) skip the explicit RL loop.`,
    r: `The reward model is a proxy: optimise it too hard and quality degrades. Human preferences also carry the labelers' biases.`,
    i: `Compute the preference probability for reward scores 2 and 0.`,
    c: py`
import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
print(round(float(sigmoid(2.0 - 0.0)), 3), round(float(sigmoid(0.5 - 0.0)), 3))
reward, kl, beta = 1.2, 0.8, 0.5
print(round(reward - beta * kl, 2))`,
    v: plot("Probability that answer A is preferred as its reward lead grows.", {
      x: [-6, 6], y: [0, 1.05], labels: ["reward difference r_A − r_B", "P(A preferred)"],
      params: [par("d", "reward difference", -6, 6, 0.5, 2)],
      readout: ["P = σ({d}) = {sigmoid(d):3}"],
      steps: [["Equal scores: a coin flip.", { d: 0 }], ["Lead of 2: 88%.", { d: 2 }]],
    }, [curve("sigmoid(x)", { c: "accent" }), pt("d", "sigmoid(d)", { c: "bad" }), hline("0.5", { c: "muted", dash: true })]),
  },
  {
    t: "Where RL works, and where it does not",
    lv: 1,
    s: `RL shines in games and simulation (Atari, Go, StarCraft), robotics in simulation, data-centre and network control, recommendation with long-term effects, chip layout, and fine-tuning language models. It struggles when mistakes are costly or irreversible, when no safe simulator exists, when feedback is rare, or when you already have plenty of labelled demonstrations. A good rule: try supervised learning or a bandit first; reach for full RL only if actions change future situations and you can afford many trials.`,
    r: `Real deployments add safety constraints, offline (batch) RL from logged data, and careful off-policy evaluation before any live test.`,
    i: `When would you choose a bandit over full RL?`,
    c: py`
cases = {
    "pick today's headline": "bandit (no state change)",
    "play Go": "RL with self-play",
    "predict house prices": "supervised learning",
    "tune a robot gait in simulation": "RL",
}
for k, v in cases.items():
    print(f"{k:32s} -> {v}")`,
    v: compare("Choosing the right framework.", ["Use"], [
      ["One decision, no lasting effect", "bandit or supervised learning"],
      ["Decisions change future states", "reinforcement learning"],
      ["Plenty of expert demonstrations", "imitation learning first"],
      ["Risky real-world actions", "simulate, or use offline RL with care"],
    ]),
  },
  {
    t: "Choosing an RL algorithm",
    lv: 2,
    s: `A decision guide. Small discrete problem with a known model → value iteration. Small discrete, unknown model → Q-learning or SARSA. Large discrete actions with pixels → DQN variants. Continuous control → SAC or TD3 (off-policy, sample-efficient) or PPO (stable, parallelisable). Need very high sample efficiency → model-based methods. Learning from fixed logs → offline RL. Language-model alignment → RLHF with PPO, or preference-optimisation methods. Whatever you pick, start with the simplest environment, a baseline, many seeds and learning curves.`,
    r: `Libraries (Gymnasium for environments, Stable-Baselines3, CleanRL) provide reference implementations: read them to see the details the papers omit.`,
    i: `Which algorithm would you try first for a robot arm with continuous joint torques?`,
    c: py`
guide = {
    "small, model known": "value iteration",
    "small, model unknown": "Q-learning / SARSA",
    "pixels, discrete actions": "DQN family",
    "continuous control": "SAC / TD3 / PPO",
    "very few samples": "model-based RL",
    "fixed logged data": "offline RL",
}
for k, v in guide.items():
    print(f"{k:24s} -> {v}")`,
    v: compare("Situation → first algorithm to try.", ["First choice"], [
      ["Small problem, known model", "value iteration"],
      ["Small problem, unknown model", "Q-learning or SARSA"],
      ["Images and discrete actions", "DQN with replay and target network"],
      ["Continuous control", "PPO, SAC or TD3"],
      ["Expensive samples", "model-based methods"],
    ]),
  },
];

void [P, bars, hline, par, plot, pt, seg, vline];
