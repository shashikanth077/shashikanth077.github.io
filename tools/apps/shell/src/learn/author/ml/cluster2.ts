import { L, P, bars, cells, compare, curve, flow, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "./data.js";

/* Every code example is RUN by `npm run outputs -- machine-learning`. */

const road = [1, 2, 3, 4];
const costs = (cand: string) => `${road.map((x) => `abs(${x}-${cand})`).join("+")}+abs(r-${cand})`;

export const cluster2: ConceptDef[] = [
  {
    t: "K-medoids: a real example as the centre",
    lv: 2,
    s: `K-means can put a centre between houses. {{K-medoids}} chooses an actual data point as each representative (the medoid) and uses ordinary rather than squared distance, so a far-away order has less pull. One cluster on a road with stops at 1, 2, 3, 4 and 30 km: the mean is 8 km, but the stop minimising the total distance is 3 km (totals 35, 32, 31, 32, 110). PAM swaps medoids to improve; CLARA runs the search on samples. K-medoids still needs K and a meaningful distance and is not immune to bad data. Drag the remote stop.`,
    r: `Use it when a representative must be a real record (a pickup address, a typical support ticket) or when you have a custom distance.`,
    i: `Why can a medoid be better than a mean when there is an outlier?`,
    c: py`
import numpy as np

x = np.array([1, 2, 3, 4, 30], dtype=float)
totals = [float(np.abs(x - c).sum()) for c in x]
print(x.mean(), totals, float(x[int(np.argmin(totals))]))`,
    v: plot("The mean (red) is dragged toward the remote stop; the medoid (green ring) stays at a real stop.", {
      x: [0, 62], y: [-1, 1], labels: ["road position (km)", ""],
      params: [par("r", "remote stop (km)", 5, 60, 1, 30)],
      defs: [["c1", costs("1")], ["c2", costs("2")], ["c3", costs("3")], ["c4", costs("4")], ["c5", costs("r")], ["m", "min(c1,min(c2,min(c3,min(c4,c5))))"]],
      readout: ["mean = {(10+r)/5:1} km   ·   total distances to each stop: {round(c1)}, {round(c2)}, {round(c3)}, {round(c4)}, {round(c5)}"],
      steps: [["Remote stop at 30: mean 8, medoid 3.", { r: 30 }], ["Remote stop at 60: the mean moves to 14 but the medoid does not.", { r: 60 }], ["Remote stop at 5: now the data are all close together.", { r: 5 }]],
    }, [
      ...road.map((x) => pt(String(x), "0", { c: "info" })),
      pt("r", "0", { c: "warn" }),
      vline("(10+r)/5", { c: "bad", label: "mean" }),
      ...road.map((x, i) => pt(String(x), "0.4", { c: "good", label: "medoid", show: `step(m-c${i + 1}+0.000001)` })),
      pt("r", "0.4", { c: "good", label: "medoid", show: "step(m-c5+0.000001)" }),
    ]),
  },
  {
    t: "MiniBatch and bisecting k-means",
    lv: 2,
    s: `{{MiniBatch k-means}} updates the centres from small random batches instead of the whole dataset — faster, slightly worse. It keeps a running mean: μ_new = (n·μ_old + Σ new points) / (n + batch count). A centre summarising 4 orders with mean 5 (sum 20) receives a batch of 7 and 9 (sum 16): (20 + 16)/(4 + 2) = 6. {{Bisecting k-means}} is top-down: start with all points, split one group into two with k-means, choose a group to split next, stop at the requested leaf count. For stops [1, 2, 3, 8, 9, 10] the first split gives {1,2,3} and {8,9,10}, means 2 and 9, SSE 2 each.`,
    r: `A bisecting split tree records your sequence of splits; its heights are not agglomerative dendrogram distances. Both methods still need K and scaling.`,
    i: `How does MiniBatch k-means update a centre?`,
    c: py`
import numpy as np

n, mu, batch_sum, batch_n = 4, 5.0, 16.0, 2
print((n * mu + batch_sum) / (n + batch_n))
x = np.array([1, 2, 3, 8, 9, 10], dtype=float)
left, right = x[x < 5], x[x >= 5]
print(left.mean(), right.mean(), float(((left - left.mean()) ** 2).sum()), float(((right - right.mean()) ** 2).sum()))`,
    v: cells("Running mean update and the first bisecting split.", [P("centre so far", ["4 orders", "mean 5", "sum 20"]), P("new batch", ["orders 7, 9", "sum 16", "count 2"]), P("updated", ["6 orders", "mean 6", "sum 36"])], [
      ["A centre has absorbed 4 orders (sum 20, mean 5)."],
      ["A new batch of two orders (7 and 9) is assigned to it.", [[1, 0, 2]]],
      ["Updated mean = (20 + 16) / (4 + 2) = 6.", [[2, 0, 2]]],
    ]),
  },
  {
    t: "Fuzzy c-means: partly in both groups",
    lv: 2,
    s: `Hard clustering gives one group per point. {{Fuzzy c-means}} gives each point a membership in every group, summing to 1 (degrees of fit under the algorithm, not calibrated probabilities). {{uᵢⱼ = 1 / Σₖ (dᵢⱼ / dᵢₖ)^(2/(m−1))}} with fuzziness m > 1; centres use squared memberships: {{cⱼ = Σ uᵢⱼᵐ xᵢ / Σ uᵢⱼᵐ}}. Centres 2 and 8, customer 4 (distances 2 and 4), m = 2: u₁ = 1/[1 + (2/4)²] = 0.8, u₂ = 0.2. Drag the customer and m.`,
    r: `If a point equals a centre its distance is 0: give it full membership of that centre. A larger m makes memberships softer. You still choose the number of groups.`,
    i: `Compute the fuzzy memberships of x = 4 for centres 2 and 8 with m = 2.`,
    c: py`
import numpy as np

def memberships(x, centres, m):
    d = np.abs(x - np.array(centres, dtype=float))
    inv = (1 / d) ** (2 / (m - 1))
    return inv / inv.sum()

print(memberships(4, [2, 8], 2).round(2).tolist(), memberships(4, [3, 7], 2).round(2).tolist())
x, u = np.array([3.0, 4.0]), np.array([0.9, 0.8])
print(round(float((u ** 2 * x).sum() / (u ** 2).sum()), 3))`,
    v: plot("Membership in group A (centre 2) and B (centre 8) as the customer moves along the line.", {
      x: [0, 10], y: [0, 1.05], labels: ["customer position x", "membership"],
      params: [par("q", "customer x", 0.5, 9.5, 0.25, 4), par("m", "fuzziness m", 1.2, 4, 0.2, 2)],
      readout: ["x = {q}: membership in A = {1/(1+(abs(q-2)/abs(q-8))^(2/(m-1))):2}, in B = {1-1/(1+(abs(q-2)/abs(q-8))^(2/(m-1))):2}"],
      steps: [["x = 4, m = 2: 0.8 / 0.2.", { q: 4, m: 2 }], ["At the midpoint 5: 0.5 / 0.5 — fully ambiguous.", { q: 5, m: 2 }], ["A bigger m makes the memberships softer.", { q: 4, m: 4 }]],
    }, [curve("1/(1+(abs(x-2)/abs(x-8))^(2/(m-1)))", { c: "info", label: "A" }), curve("1-1/(1+(abs(x-2)/abs(x-8))^(2/(m-1)))", { c: "bad", label: "B" }), vline("q", { c: "muted", dash: true })]),
  },
  {
    t: "Gaussian mixtures: probability-based groups",
    lv: 3,
    s: `A Gaussian mixture model (GMM) describes the data as a weighted mixture of bell curves — say quick orders and complex orders — and in several dimensions the components can be ellipses. The E-step computes each point's responsibility {{rᵢⱼ = πⱼ φⱼ(xᵢ) / Σₖ πₖ φₖ(xᵢ)}}; the M-step updates {{Nⱼ = Σ rᵢⱼ}}, {{πⱼ = Nⱼ/n}}, {{μⱼ}} and {{σⱼ²}}; repeat until the log-likelihood barely improves. With μ = 0, 3, σ = 1 and equal shares, at x = 1 the densities are 0.24197 and 0.05399, so r₁ ≈ 0.8176, r₂ ≈ 0.1824. Choose the number of components with BIC or AIC, not just the likelihood.`,
    r: `A GMM assigns probabilities even to unusual points: there is no DBSCAN-style noise label. Watch for tiny components and regularise covariances.`,
    i: `Compute the responsibilities at x = 1 for two unit-variance components centred at 0 and 3.`,
    c: py`
import numpy as np

pdf = lambda x, m, s: np.exp(-(x - m) ** 2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi))
f1, f2 = pdf(1, 0, 1), pdf(1, 3, 1)
r1 = 0.5 * f1 / (0.5 * f1 + 0.5 * f2)
print(round(float(f1), 5), round(float(f2), 5), round(float(r1), 4), round(float(1 - r1), 4))
x, r = np.array([0, 1, 3.0]), np.array([0.9, 0.8, 0.1])
N = r.sum()
print(round(float(N), 2), round(float(N / 3), 2), round(float((r * x).sum() / N), 4))`,
    v: plot("Two weighted bell curves; the dashed line marks the point whose responsibility is read below.", {
      x: [-3, 6], y: [0, 0.6], labels: ["x", "density"],
      params: [par("q", "point x", -2, 5, 0.25, 1)],
      readout: ["x = {q}: responsibility of component 1 = {norm(q,0,1)/(norm(q,0,1)+norm(q,3,1)):3}, component 2 = {norm(q,3,1)/(norm(q,0,1)+norm(q,3,1)):3}"],
      steps: [["x = 1: 0.818 vs 0.182 (the worked example).", { q: 1 }], ["x = 1.5: exactly 0.5 / 0.5 for equal components.", { q: 1.5 }], ["x = 3: component 2 clearly wins.", { q: 3 }]],
    }, [curve("norm(x,0,1)", { c: "info", label: "component 1" }), curve("norm(x,3,1)", { c: "bad", label: "component 2" }), vline("q", { c: "muted", dash: true })]),
  },
  {
    t: "Mean shift: move toward the crowd",
    lv: 3,
    s: `Place a window of half-width h (the bandwidth) on the road, move its centre to the average of the stops inside, and repeat: {{m_new = Σ xᵢ / |W|}} over W = {i : |xᵢ − m| ≤ h}. Starting from many places the windows climb to local density peaks; peaks that converge together are merged into one group. Stops [1, 2, 3, 8, 9]: start at 1 with h = 2: window [−1, 3] holds 1, 2, 3, mean 2, and it stays there. Start at 9: window holds 8, 9 → 8.5. With h = 8 from 1, everything fits and the mean is 4.6: a broad window merges groups. You do not choose K, but the bandwidth matters a lot.`,
    r: `Mean shift finds the number of modes automatically but is sensitive to the bandwidth and slow for large samples.`,
    i: `What does the bandwidth control in mean shift?`,
    c: py`
import numpy as np

stops = np.array([1, 2, 3, 8, 9], dtype=float)

def shift(m, h):
    window = stops[np.abs(stops - m) <= h]
    return float(window.mean())

print(shift(1, 2), shift(shift(1, 2), 2), shift(9, 2), round(shift(1, 8), 1))`,
    v: plot("The shaded window moves to the mean of the stops inside it.", {
      x: [-2, 12], y: [-1, 1], labels: ["road position (km)", ""],
      params: [par("m", "window centre", 0, 10, 0.5, 1), par("h", "bandwidth h", 1, 8, 0.5, 2)],
      defs: [["n", [1, 2, 3, 8, 9].map((x) => `step(h-abs(${x}-m)+0.000001)`).join("+")], ["nm", `(${[1, 2, 3, 8, 9].map((x) => `${x}*step(h-abs(${x}-m)+0.000001)`).join("+")})/max(1,n)`]],
      readout: ["{n} stop(s) in the window → the window moves to {nm:2}"],
      steps: [["Start 1, h = 2: the window holds 1, 2, 3 and moves to 2.", { m: 1, h: 2 }], ["At 2 it stays: converged on the left peak.", { m: 2, h: 2 }], ["Start 1 with h = 8: everything is inside, mean 4.6.", { m: 1, h: 8 }]],
    }, [
      ...[1, 2, 3, 8, 9].map((x) => pt(String(x), "0", { c: "info" })),
      vline("m-h", { c: "warn", dash: true }), vline("m+h", { c: "warn", dash: true }),
      pt("m", "0.5", { c: "bad", label: "window" }), pt("nm", "-0.5", { c: "good", label: "next" }),
    ]),
  },
  {
    t: "Spectral clustering: connected neighbours",
    lv: 3,
    s: `Two winding delivery routes can be close in space but separate along their paths, and a straight centre boundary would cut them apart. Spectral clustering builds a graph (points are nodes, near points get strong edges {{wᵢⱼ = exp(−‖xᵢ−xⱼ‖² / 2σ²)}}), forms the Laplacian {{L = D − W}} (D is the diagonal of row sums), takes eigenvectors for the smallest eigenvalues as new coordinates and clusters those. A tiny graph you can compute: A–B and C–D joined with weight 1, no links between the pairs. L has eigenvalue 0 twice; v = [1, 1, −1, −1] gives Lv = 0, and its signs separate {A,B} from {C,D}.`,
    r: `You must choose the graph (neighbour count or σ) and the number of clusters. Dense similarity matrices are expensive. Too many neighbours can link separate groups.`,
    i: `What does the Laplacian eigenvector with eigenvalue 0 tell you?`,
    c: py`
import numpy as np

W = np.array([[0, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=float)
D = np.diag(W.sum(axis=1))
L = D - W
v = np.array([1, 1, -1, -1], dtype=float)
print(L.tolist())
print((L @ v).tolist(), (np.linalg.eigvalsh(L) + 0.0).round(3).tolist())`,
    v: cells("W (edges), D (row sums) and L = D − W for the two disconnected pairs.", table(["", "A", "B", "C", "D"], [["W: A", "0", "1", "0", "0"], ["W: B", "1", "0", "0", "0"], ["L: A", "1", "−1", "0", "0"], ["L: B", "−1", "1", "0", "0"], ["L: C", "0", "0", "1", "−1"], ["L: D", "0", "0", "−1", "1"]]), [
      ["The graph has two separate components."],
      ["L = D − W: each row sums to 0.", [[3, 1, 2], [4, 1, 2], [5, 3, 4], [6, 3, 4]]],
      ["v = [1, 1, −1, −1] satisfies L v = 0: its sign pattern splits the two components.", [[3, 1, 2], [5, 3, 4]]],
    ]),
  },
  {
    t: "OPTICS: density at several scales",
    lv: 3,
    s: `One DBSCAN radius cannot describe neighbourhoods of different density. OPTICS orders the points and records the {{reachability distance}} of each from an earlier core point: {{reach(q from p) = max(core_k(p), d(p, q))}}, keeping the smallest candidate. A plot of reachability along the ordering shows valleys for dense regions and peaks for gaps. Points [0, 0.2, 0.4, 3, 3.2, 3.4] with min_samples = 3 give reachabilities 0.4, 0.2, 2.6 (the jump across the gap), 0.4, 0.2. Extract clusters by cutting at an ε′ (DBSCAN-like) or by steepness (xi). Drag the cut.`,
    r: `The horizontal axis is the algorithm's ordering, not road position or time. A valley is a clue to inspect, not proof of a segment.`,
    i: `Why does the reachability plot rise sharply between two dense groups?`,
    c: py`
import numpy as np

pts = np.array([0, 0.2, 0.4, 3, 3.2, 3.4])
min_samples = 3
D = np.abs(pts[:, None] - pts[None])
core = np.sort(D, axis=1)[:, min_samples - 1]
reach = np.full(len(pts), np.inf)
done = np.zeros(len(pts), dtype=bool)
order = []
seeds = {0: np.inf}
while seeds:
    p = min(seeds, key=lambda i: (seeds[i], i))
    reach[p] = seeds.pop(p)
    done[p] = True
    order.append(p)
    for q in range(len(pts)):
        if not done[q]:
            new = max(core[p], D[p, q])
            if q not in seeds or new < seeds[q]:
                seeds[q] = new
print(order, core.round(2).tolist())
print([None if np.isinf(r) else round(float(r), 2) for r in reach])`,
    v: bars("Reachability distance of each point in the processing order (the first has none).", [["0.2", "0.4"], ["0.4", "0.2"], ["3", "2.6"], ["3.2", "0.4"], ["3.4", "0.2"]], {
      max: 3,
      params: [par("e", "cut ε′", 0.1, 3, 0.1, 1)],
      defs: [["g", "step(0.4-e)+step(0.2-e)+step(2.6-e)+step(0.4-e)+step(0.2-e)"]],
      readout: ["cut at {e}: {1+g} cluster(s) — every bar above the cut starts a new group"],
      steps: [["Cut at 1: the tall bar (the gap) separates two clusters.", { e: 1 }], ["Cut at 0.3: the 0.4 bars also break — more, smaller groups.", { e: 0.3 }], ["Cut at 3: one big cluster.", { e: 3 }]],
    }),
  },
  {
    t: "HDBSCAN: persistent density groups",
    lv: 3,
    s: `HDBSCAN removes DBSCAN's single global ε. It builds a hierarchy from {{mutual reachability}} {{d_m(p, q) = max(core_k(p), core_k(q), d(p, q))}}, prunes tiny branches and keeps the groups that persist across density levels (λ = 1/distance, higher λ = denser); it can still label noise. Example: core distances 1 and 2 and physical distance 1.5 give d_m = 2 and λ = 0.5. A branch born at λ = 0.5 whose three points leave at 1.2, 1.4, 1.4 has stability 0.7 + 0.9 + 0.9 = 2.5. Key parameters: min_cluster_size and min_samples (larger → more noise); selection by excess of mass or leaves.`,
    r: `Membership strength is not a probability of a real customer class. scikit-learn counts the point itself in min_samples; other packages do not, so check conventions before copying values.`,
    i: `Compute the mutual reachability of two points with core distances 0.4 and 0.8 at distance 0.6.`,
    c: py`
core_p, core_q, d = 1.0, 2.0, 1.5
mr = max(core_p, core_q, d)
print(mr, 1 / mr, 1 / core_p)
birth, leave = 0.5, [1.2, 1.4, 1.4]
print(round(sum(l - birth for l in leave), 1), max(0.4, 0.8, 0.6))`,
    v: compare("The ideas, in order.", ["What it does"], [
      ["Core distances", "distance to the k-th neighbour: small in dense areas"],
      ["Mutual reachability", "max(core p, core q, distance): sparse ends push points apart"],
      ["Hierarchy + condensing", "build the tree, discard branches smaller than min_cluster_size"],
      ["Stability", "Σ (λ_leave − λ_birth): keep persistent branches"],
      ["Output", "clusters + noise (−1) + membership strengths"],
    ]),
  },
  {
    t: "BIRCH: summarise before clustering",
    lv: 3,
    s: `BIRCH keeps compact summaries of a large stream in a clustering-feature (CF) tree. Each subcluster stores {{CF = (N, LS, SS)}}: the count, the linear sum Σx and the squared sum Σ‖x‖². From it: centre = LS/N and radius² = SS/N − ‖LS/N‖². For [1, 2, 3]: N = 3, LS = 6, SS = 14, centre 2, radius √(2/3) ≈ 0.816. Insert 4: N = 4, LS = 10, SS = 30, centre 2.5, radius √1.25 ≈ 1.118. With a radius threshold of 1 the summary cannot absorb it (a new entry is needed); with 1.2 it can. Drag the threshold.`,
    r: `The radius is a root-mean-square spread, not the farthest-point distance. Scale features; summaries can hide fine structure.`,
    i: `Compute the centre and radius of the CF (N = 2, LS = 6, SS = 20).`,
    c: py`
import numpy as np

def cf(points):
    p = np.array(points, dtype=float)
    return len(p), float(p.sum()), float((p ** 2).sum())

def radius(N, LS, SS):
    return float(np.sqrt(SS / N - (LS / N) ** 2))

print(cf([1, 2, 3]), round(radius(*cf([1, 2, 3])), 3))
print(cf([1, 2, 3, 4]), round(radius(*cf([1, 2, 3, 4])), 3))
print(6 / 2, radius(2, 6, 20))`,
    v: bars("Radius of the summary after adding the point 4, versus your threshold.", [["radius after adding 4", "1.118"], ["threshold T", "T"]], {
      max: 2,
      params: [par("T", "radius threshold T", 0.5, 2, 0.1, 1)],
      readout: ["radius 1.118 vs T = {T}: " + "absorbed when the radius is at most T ({step(T-1.118)} = 1 means yes)"],
      steps: [["T = 1: radius 1.118 is too big — a new entry is needed.", { T: 1 }], ["T = 1.2: the point is absorbed.", { T: 1.2 }]],
    }),
  },
  {
    t: "Affinity propagation: exemplars by message passing",
    lv: 3,
    s: `Affinity propagation picks real points as exemplars by exchanging two messages: responsibility r(i, k) ("how much do I want you as my exemplar?") and availability a(i, k) ("how appropriate is it for me to choose you?"). Similarity s(i, k) = −‖xᵢ − xₖ‖²; the diagonal "preference" s(k, k) controls how willing points are to be exemplars (higher → more exemplars). Example: orders at 1, 2, 8: s(1,2) = −1, s(1,8) = −49, preference −10, availabilities 0. For point 1 considering exemplar 2 the best alternative is max(−10, −49) = −10, so r(1, 2) = −1 − (−10) = 9. This is one message, not a result; damping blends old and new messages to reduce oscillation.`,
    r: `You do not enter K, but the preference acts like it. Full message matrices are expensive and convergence must be checked.`,
    i: `Compute r(1, 2) for the three orders above.`,
    c: py`
import numpy as np

x = np.array([1.0, 2.0, 8.0])
S = -((x[:, None] - x[None]) ** 2)
np.fill_diagonal(S, -10)
A = np.zeros((3, 3))
i, k = 0, 1
alternatives = [A[i, kk] + S[i, kk] for kk in range(3) if kk != k]
print(S.tolist())
print(S[i, k] - max(alternatives))`,
    v: cells("Similarities (negative squared distance) with preference −10 on the diagonal.", table(["s(i, k)", "1", "2", "8"], [["1", "−10", "−1", "−49"], ["2", "−1", "−10", "−36"], ["8", "−49", "−36", "−10"]]), [
      ["Less negative means more similar."],
      ["For point 1 and candidate exemplar 2: s(1, 2) = −1.", [[1, 2, 2]]],
      ["The best alternative exemplar is max(−10, −49) = −10, so r(1, 2) = −1 − (−10) = 9: point 2 is attractive.", [[1, 1, 3]]],
    ]),
  },
  {
    t: "K-modes and K-prototypes: beyond numbers",
    lv: 2,
    s: `"Card", "cash" and "wallet" are names: coding them 0, 1, 2 tells Euclidean distance that card is nearer cash than wallet. {{K-modes}} uses the mismatch distance {{d(x, z) = Σ 1[xᵣ ≠ zᵣ]}} and represents a group by its MODE (the most frequent category per feature, which need not be a real row). Customers A (Card, Morning), B (Card, Evening), C (Cash, Evening): d(A, B) = 1, d(A, C) = 2. {{K-prototypes}} mixes both: {{d = Σ numeric (xᵣ − μᵣ)² + γ Σ categorical 1[xᵣ ≠ modeᵣ]}}. Scaled spending 0.6 vs prototype 0.4 with a different payment and γ = 0.5: 0.04 + 0.5 = 0.54; with a matching payment only 0.04.`,
    r: `γ balances numeric against categorical features. Gower distance (with medoids or a suitable linkage) is another option for mixed data; Ward linkage needs Euclidean geometry.`,
    i: `Compute the K-prototypes distance when spending differs by 0.2 and the payment type does not match, with γ = 0.5.`,
    c: py`
mismatch = lambda a, b: sum(x != y for x, y in zip(a, b))
A, B, C = ("Card", "Morning"), ("Card", "Evening"), ("Cash", "Evening")
print(mismatch(A, B), mismatch(A, C))
print(round((0.6 - 0.4) ** 2 + 0.5 * 1, 2), round((0.6 - 0.4) ** 2, 2))`,
    v: bars("K-prototypes distance to a prototype (spending gap 0.2). Drag γ, the weight of a category mismatch.", [["payment differs", "0.04+g"], ["payment matches", "0.04"]], {
      max: 2,
      params: [par("g", "category weight γ", 0, 2, 0.1, 0.5)],
      readout: ["γ = {g}: mismatch adds {g} to the distance"],
      steps: [["γ = 0.5: 0.54 versus 0.04.", { g: 0.5 }], ["γ = 0: categories are ignored.", { g: 0 }], ["γ = 2: a mismatch dominates.", { g: 2 }]],
    }),
  },
  {
    t: "SOM, grid and subspace clustering",
    lv: 3,
    s: `A {{self-organising map}} learns a grid of prototype vectors so similar customers land on nearby cells: find the best-matching unit, pull it toward the customer, pull its grid neighbours less: {{w_new = w_old + η · h(b, j) · (x − w_old)}}. For x = (4, 2), winner w = (2, 2), η = 0.5, h = 1: (2, 2) + 0.5 × (2, 0) = (3, 2); a neighbour with h = 0.2 moves to (2.2, 2). The grid is a visualisation; you still need a step that groups the prototypes. {{Grid-based}} clustering counts points per cell and joins adjacent dense cells (counts [8, 7, 1] with threshold 5 → the first two form a region). {{Subspace}} methods such as CLIQUE look for groups visible in only some features.`,
    r: `Grid resolution, dimensionality and topology change the story. PCA changes coordinates; it does not assign groups.`,
    i: `Perform one SOM update for x = (4, 2), w = (2, 2), η = 0.5 and h = 1.`,
    c: py`
import numpy as np

x, w, eta = np.array([4.0, 2.0]), np.array([2.0, 2.0]), 0.5
print((w + eta * 1.0 * (x - w)).tolist(), (w + eta * 0.2 * (x - w)).tolist())
counts, threshold = np.array([8, 7, 1]), 5
print((counts >= threshold).tolist())`,
    v: cells("The winning prototype moves a lot; its neighbours move a little.", [P("customer x", ["4", "2"]), P("winner w", ["2", "2"]), P("winner after", ["3", "2"]), P("neighbour after (h = 0.2)", ["2.2", "2"])], [
      ["Customer (4, 2); the best-matching prototype is (2, 2)."],
      ["Winner moves half-way (η = 0.5, h = 1): (3, 2).", [[1, 0, 1], [2, 0, 1]]],
      ["A neighbour moves only 0.2 of that: (2.2, 2).", [[1, 0, 1], [3, 0, 1]]],
    ]),
  },
  {
    t: "Choose the method from the question",
    lv: 2,
    s: `A practical decision table, not a ranking: start from what you need, try the listed method first, then check what could mislead you. Compact numeric groups with roughly known K: k-means (MiniBatch for volume). A real representative or custom distance: k-medoids. Nested groups: hierarchical. Irregular groups with noise: DBSCAN; varying densities: OPTICS or HDBSCAN. Overlapping elliptical groups: GMM. Graded memberships: fuzzy c-means. Curved or graph-connected groups: spectral. For text and images first obtain numeric features or embeddings; normalise vectors if you want angular similarity (cosine; for unit vectors squared Euclidean distance = 2(1 − cosine)).`,
    r: `Do not mix kilometres, euros and text embeddings without deciding what "similar" means. A pretty 2D projection can distort the distances the algorithm actually used.`,
    i: `Which method for clusters of very different densities?`,
    v: compare("Situation → try first → check before trusting.", ["Try first", "Check"], [
      ["Compact numeric groups, known K", "k-means; MiniBatch for volume", "scale, seeds, outliers, separation"],
      ["Real representative / custom distance", "k-medoids / CLARA", "distance meaning, sampling, memory"],
      ["Inspectable nested groups", "agglomerative / divisive", "linkage, distance, cut level"],
      ["Irregular groups with noise", "DBSCAN", "ε, min_samples, differing densities"],
      ["Different densities", "OPTICS / HDBSCAN", "extraction, stability, noise fraction"],
      ["Overlapping elliptical components", "GMM", "covariance assumptions, BIC, tiny components"],
      ["Graded memberships", "fuzzy c-means", "m and K; not class probabilities"],
      ["Curved / graph-connected groups", "spectral", "graph construction and memory"],
      ["Categorical / mixed profiles", "k-modes / k-prototypes / Gower + medoids", "feature weights, category meaning"],
      ["Stream or compress many rows", "BIRCH", "threshold and summary distortion"],
    ]),
  },
  {
    t: "Evaluating clusters without fooling yourself",
    lv: 2,
    s: `A good score is evidence, not the business answer. {{Internal}} measures use only the data: silhouette (higher is better), Davies–Bouldin (lower), Calinski–Harabasz (higher), and inertia at a fixed K. {{Stability}}: do similar groups appear after changing seeds or resampling? Cluster numbers are arbitrary: labels [0, 0, 1, 1] and [7, 7, 3, 3] are the same partition, so compare co-membership or use the {{adjusted Rand index}}. With trusted external labels, ARI = (I − E)/(M − E): true grouping {A,B}/{C,D} against predicted {A,C}/{B,D} gives I = 0, E = 2/3, M = 2, ARI = −0.5; a perfect match up to relabelling gives 1. Finally, business validity: are the groups usable?`,
    r: `For DBSCAN/HDBSCAN report noise separately — silhouette over only the retained points can mislead. Never tune on external test labels, and learn any cluster-to-class mapping on training data.`,
    i: `Why can't you compare cluster labels from two runs directly?`,
    c: py`
from math import comb
import numpy as np

true, pred = [0, 0, 1, 1], [0, 1, 0, 1]
cont = np.zeros((2, 2), dtype=int)
for t, p in zip(true, pred):
    cont[t, p] += 1
I = sum(comb(int(v), 2) for v in cont.ravel())
a, b = cont.sum(axis=1), cont.sum(axis=0)
E = sum(comb(int(v), 2) for v in a) * sum(comb(int(v), 2) for v in b) / comb(4, 2)
M = (sum(comb(int(v), 2) for v in a) + sum(comb(int(v), 2) for v in b)) / 2
print(I, round(E, 4), M, round((I - E) / (M - E), 4))`,
    v: compare("Four kinds of evidence.", ["Measure", "Caution"], [
      ["Internal quality", "silhouette ↑, Davies–Bouldin ↓, Calinski–Harabasz ↑", "favour compact groups; compare only on the same representation"],
      ["Inertia", "↓ at fixed K", "falls as K grows — never minimise blindly"],
      ["Stability", "co-membership / ARI across seeds and resamples", "unstable small groups need inspection"],
      ["External labels", "ARI (chance-adjusted, label-invariant)", "only if the labels are trusted; do not tune on them"],
      ["Business validity", "profiles, examples, action and outcome", "the final judge"],
    ]),
  },
];

void [L, curve, flow, seg];
