import { L, P, bars, cells, circle, compare, curve, flow, hline, layers, par, plot, pt, seg } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { delivery, eqX, table } from "./data.js";

/* Every code example is RUN by `npm run outputs -- machine-learning`. */

type Pt = [number, number];
const AF: Pt[] = delivery.slice(0, 6).map(([, x, y]) => [x, y]);
const AH: Pt[] = delivery.map(([, x, y]) => [x, y]);
const names = delivery.map(([n]) => n);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const sq = (a: Pt, b: Pt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const nearest = (p: Pt, c: Pt[]) => (sq(p, c[0] ?? p) <= sq(p, c[1] ?? p) ? 0 : 1);
const meanOf = (pts: Pt[], a: number[], j: number, old: Pt): Pt => {
  const m = pts.filter((_, i) => a[i] === j);
  return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : old;
};
const sse = (pts: Pt[], a: number[], c: Pt[]) => pts.reduce((s, p, i) => s + sq(p, c[a[i] ?? 0] ?? p), 0);

/** Lloyd's algorithm as a list of states: assignment under the current centres, then centre update, … until stable. */
function lloyd(pts: Pt[], init: Pt[]) {
  const states: { c: Pt[]; a: number[]; J: number; what: string }[] = [];
  let c = init;
  let a = pts.map((p) => nearest(p, c));
  states.push({ c, a, J: sse(pts, a, c), what: "Start with the chosen centres and assign every point to its nearest centre." });
  for (let it = 0; it < 10; it++) {
    const next: Pt[] = [meanOf(pts, a, 0, c[0] ?? [0, 0]), meanOf(pts, a, 1, c[1] ?? [0, 0])];
    states.push({ c: next, a, J: sse(pts, a, next), what: "Move each centre to the mean of its points." });
    const na = pts.map((p) => nearest(p, next));
    const changed = na.some((v, i) => v !== a[i]);
    c = next;
    if (!changed) {
      const last = states[states.length - 1];
      if (last) last.what += " Reassigning changes nothing, so the algorithm has converged.";
      break;
    }
    a = na;
    states.push({ c, a, J: sse(pts, a, c), what: "Reassign every point to its nearest (new) centre." });
  }
  return states;
}
const kmStates = lloyd(AF, [[1, 1], [2, 1]]);

/* DBSCAN lab: formulas over eps and min_samples for the eight delivery points. */
const dbDefs: [string, string][] = [
  ...AH.map((p, i) => [`cnt${i}`, AH.map((q) => `step(eps-${dist(p, q)}+0.000001)`).join("+")] as [string, string]),
  ...AH.map((_, i) => [`core${i}`, `step(cnt${i}-minpts+0.5)`] as [string, string]),
  ...AH.map((p, i) => [`nb${i}`, AH.map((q, j) => (j === i ? "0" : `core${j}*step(eps-${dist(p, q)}+0.000001)`)).join("+")] as [string, string]),
  ...AH.map((_, i) => [`bord${i}`, `(1-core${i})*step(nb${i}-0.5)`] as [string, string]),
  ["nCore", AH.map((_, i) => `core${i}`).join("+")],
  ["nBord", AH.map((_, i) => `bord${i}`).join("+")],
];

export const cluster1: ConceptDef[] = [
  {
    t: "What clustering does",
    lv: 1,
    s: `A delivery company has customer locations but no predefined zones. Clustering puts observations into groups using a chosen idea of similarity — no target label is required. A row is a customer; its features are east and north coordinates in km. Cluster numbers are arbitrary (cluster 0 is not "better" than cluster 1) and a group gets a business meaning only after inspection. Clustering is not classification (known labels) and not regression (a numeric target).`,
    r: `All examples are invented. A centroid is a mathematical location; a real pickup station also needs road access, capacity and permission. Clustering alone does not solve routing.`,
    i: `How does clustering differ from classification and regression?`,
    c: py`
import numpy as np

P = {"A": (1, 1), "B": (1, 2), "C": (2, 1), "D": (8, 8), "E": (8, 9), "F": (9, 8)}
names = list(P)
xy = np.array(list(P.values()), dtype=float)
D = np.sqrt(((xy[:, None] - xy[None]) ** 2).sum(2))
np.fill_diagonal(D, np.inf)
for i, n in enumerate(names):
    print(n, "->", names[int(D[i].argmin())], round(float(D[i].min()), 3))`,
    v: plot("Six delivery locations (km). Nearby customers obviously form two groups.", {
      x: eqX(0, 10, 5), y: [0, 10], labels: ["east (km)", "north (km)"],
    }, [
      ...AF.slice(0, 3).map(([x, y], i) => pt(String(x), String(y), { c: "info", label: names[i] ?? "" })),
      ...AF.slice(3).map(([x, y], i) => pt(String(x), String(y), { c: "bad", label: names[i + 3] ?? "" })),
    ]),
  },
  {
    t: "A map of the clustering methods",
    lv: 1,
    s: `There is no finite list of "all" clustering algorithms, but they fall into families. {{Centre / prototype}} methods choose a representative for each group (k-means, k-medoids). {{Hierarchy}} builds a tree of merges or splits. {{Density}} methods connect crowded regions and allow noise (DBSCAN, OPTICS, HDBSCAN, mean shift). {{Soft / model-based}} methods let a point partly belong to several groups (fuzzy c-means, Gaussian mixtures). {{Graph}} methods use who is connected (spectral, affinity propagation). Others summarise or map first (BIRCH, SOM, grid and subspace methods).`,
    r: `A group is a pattern under your chosen features and distance, not a proven customer identity. The same customers can form different groups in a location space versus a shopping-habit space.`,
    i: `Name the main families of clustering methods and one example of each.`,
    v: compare("Idea in everyday words, and the methods in this track.", ["Idea", "Methods"], [
      ["Centre / prototype", "choose a representative for each group", "k-means, MiniBatch, bisecting, k-medoids, k-modes, k-prototypes"],
      ["Hierarchy", "build a family tree of groups", "agglomerative, linkage choices, divisive"],
      ["Density", "connect crowded neighbourhoods, allow noise", "DBSCAN, OPTICS, HDBSCAN, mean shift"],
      ["Soft / model", "partly belonging to several groups", "fuzzy c-means, Gaussian mixtures"],
      ["Graph / messages", "connections and nominated exemplars", "spectral clustering, affinity propagation"],
      ["Summary / map / grid", "compress or organise first", "BIRCH, SOM, grid and subspace clustering"],
    ]),
  },
  {
    t: "K-means: assign, average, repeat",
    lv: 1,
    s: `K is the number of groups you ask for. Choose K and starting centres, then repeat: assign every point to its nearest centre (comparing squared distances avoids square roots) and replace each centre with the mean of its points {{μⱼ = Σ xᵢ / nⱼ}}, until assignments stop changing. It minimises the within-cluster sum of squared errors {{J = Σⱼ Σᵢ ‖xᵢ − μⱼ‖²}} (SSE, "inertia"). To expose the iteration we start both centres on the left: μ₁ = A = (1, 1), μ₂ = C = (2, 1). Step through the states.`,
    r: `The result depends on the starting centres: use k-means++ and several restarts. Convergence does not guarantee the best grouping, and a centre can lie between observations.`,
    i: `Describe the two alternating steps of k-means and what it minimises.`,
    c: py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
centres = np.array([[1.0, 1.0], [2.0, 1.0]])
for step in range(5):
    d2 = ((X[:, None] - centres[None]) ** 2).sum(2)
    labels = d2.argmin(1)
    new = np.array([X[labels == j].mean(axis=0) for j in range(2)])
    print(step, labels.tolist(), round(float(d2.min(1).sum()), 3), new.round(3).tolist())
    if np.allclose(new, centres):
        break
    centres = new`,
    v: plot("Dots are coloured by their group; rings are the centres μ₁ (orange) and μ₂ (green).", {
      x: eqX(0, 10, 5), y: [0, 10], labels: ["east (km)", "north (km)"],
      params: [par("it", "state", 0, kmStates.length - 1, 1, 0)],
      readout: ["state {it} of " + (kmStates.length - 1) + " — see the caption for the SSE J"],
      steps: kmStates.map((s, i) => [`${s.what} (SSE J = ${s.J.toFixed(3)})`, { it: i }] as [string, Record<string, number>]),
    }, kmStates.flatMap((s, i) => [
      ...AF.map(([x, y], k) => pt(String(x), String(y), { c: s.a[k] === 0 ? "warn" : "good", show: `0.5-abs(it-${i})` })),
      ...s.c.map(([x, y], j) => circle(String(x), String(y), "0.45", { c: j === 0 ? "warn" : "good", show: `0.5-abs(it-${i})` })),
    ])),
  },
  {
    t: "K-means by hand: squared distances and SSE",
    lv: 2,
    s: `Carry the six locations through two rounds. Squared distances to the starting centres (1,1) and (2,1): A 0 / 1, B 1 / 2, C 1 / 0, D 98 / 85, E 113 / 100, F 113 / 98, so A, B join group 1 and C, D, E, F group 2; D to centre 2: (8−2)² + (8−1)² = 36 + 49 = 85. J = 0 + 1 + 0 + 85 + 100 + 98 = 284 km². Update: μ₁ = (1, 1.5), μ₂ = (6.75, 6.5). C is now closer to μ₁ (1.25 vs 52.8125), so groups become {A, B, C}, {D, E, F} with centres (4/3, 4/3) and (25/3, 25/3); a further assignment changes nothing. Final J = 4/3 + 4/3 = 8/3 ≈ 2.667 km² (squared kilometres!).`,
    r: `A tie needs a consistent rule. If a cluster ends up empty the mean of zero points is undefined: implementations re-initialise it.`,
    i: `Compute the SSE after the first assignment for the six points above.`,
    c: py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
c = np.array([[1.0, 1.0], [2.0, 1.0]])
d2 = ((X[:, None] - c[None]) ** 2).sum(2)
print(d2.tolist())
print(d2.argmin(1).tolist(), float(d2.min(1).sum()))
c2 = np.array([X[d2.argmin(1) == j].mean(axis=0) for j in range(2)])
print(c2.tolist())
d2b = ((X[:, None] - c2[None]) ** 2).sum(2)
print(d2b[2].round(4).tolist())`,
    v: cells("Squared distance from each point to the two starting centres.", table(["point", "d² to (1,1)", "d² to (2,1)", "first group"], [["A (1,1)", "0", "1", "1"], ["B (1,2)", "1", "2", "1"], ["C (2,1)", "1", "0", "2"], ["D (8,8)", "98", "85", "2"], ["E (8,9)", "113", "100", "2"], ["F (9,8)", "113", "98", "2"]]), [
      ["Each row: which centre is closer in squared distance?"],
      ["A and B are nearest to the first centre; C, D, E, F to the second.", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3], [5, 3, 3], [6, 3, 3]]],
      ["SSE of this assignment: 0 + 1 + 0 + 85 + 100 + 98 = 284.", [[1, 1, 1], [2, 1, 1], [3, 2, 2], [4, 2, 2], [5, 2, 2], [6, 2, 2]]],
    ]),
  },
  {
    t: "Choosing K: the elbow",
    lv: 2,
    s: `SSE always falls as K grows — K = n makes every point its own cluster with SSE 0 — so the smallest SSE cannot choose K. Look for the {{elbow}}: the K after which extra clusters give only small improvements. For the six locations the best SSE is 149.667 for K = 1 and 2.667 for K = 2, then 1.833, 1.0, 0.5 and 0 — a sharp bend at K = 2. Real data may show no clear elbow. Drag K.`,
    r: `Combine the elbow with silhouette scores, stability across random seeds, cluster sizes and business usefulness.`,
    i: `Why can't you choose K by taking the smallest SSE?`,
    c: py`
import numpy as np
from itertools import combinations

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)

def lloyd(c):
    for _ in range(50):
        d2 = ((X[:, None] - c[None]) ** 2).sum(2)
        a = d2.argmin(1)
        new = np.array([X[a == j].mean(axis=0) if (a == j).any() else c[j] for j in range(len(c))])
        if np.allclose(new, c):
            break
        c = new
    return float(((X[:, None] - c[None]) ** 2).sum(2).min(1).sum())

best = [min(lloyd(X[list(i)].copy()) for i in combinations(range(6), k)) for k in range(1, 7)]
print([round(v, 3) for v in best])`,
    v: plot("Best SSE for each K on the six-point example.", {
      x: [0, 7], y: [0, 160], labels: ["K (number of clusters)", "SSE"],
      params: [par("k", "K", 1, 6, 1, 2)],
      defs: [["val", [149.667, 2.667, 1.833, 1, 0.5, 0].map((v, i) => `${v}*step(0.5-abs(k-${i + 1}))`).join("+")]],
      readout: ["K = {k}: SSE = {val:3}"],
      steps: [["K = 1: SSE 149.667.", { k: 1 }], ["K = 2: SSE collapses to 2.667 — the elbow.", { k: 2 }], ["K = 6: SSE is 0, but every point is its own cluster.", { k: 6 }]],
    }, [
      ...[149.667, 2.667, 1.833, 1, 0.5, 0].slice(1).map((v, i) => seg(String(i + 1), String([149.667, 2.667, 1.833, 1, 0.5, 0][i]), String(i + 2), String(v), { c: "accent" })),
      ...[149.667, 2.667, 1.833, 1, 0.5, 0].map((v, i) => pt(String(i + 1), String(v), { c: "info" })),
      pt("k", "val", { c: "bad" }),
    ]),
  },
  {
    t: "Silhouette: how well separated are the groups?",
    lv: 2,
    s: `For a point i, let {{a(i)}} be its mean distance to the other members of its own cluster and {{b(i)}} the smallest mean distance to another cluster. {{s(i) = (b − a) / max(a, b)}}: near +1 is well separated, near 0 on a boundary, negative suggests the point fits another group better. For A: a = (1 + 1)/2 = 1; b = (√98 + √113 + √113)/3 ≈ 10.3866; s(A) = 0.9037. The dataset score is the mean over all points (0.8853 here). It needs 2 to n − 1 clusters; a singleton is scored 0.`,
    r: `Silhouette favours compact, well-separated clusters and can undervalue valid curved density clusters. Inspect sizes, stability and usefulness too.`,
    i: `Compute the silhouette of point A in the six-point example.`,
    c: py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8]], dtype=float)
labels = np.array([0, 0, 0, 1, 1, 1])
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
s = []
for i in range(6):
    same = [j for j in range(6) if labels[j] == labels[i] and j != i]
    other = [j for j in range(6) if labels[j] != labels[i]]
    a, b = D[i, same].mean(), D[i, other].mean()
    s.append((b - a) / max(a, b))
print(round(float(D[0, [1, 2]].mean()), 4), round(float(D[0, [3, 4, 5]].mean()), 4))
print(np.round(s, 4).tolist(), round(float(np.mean(s)), 4))`,
    v: cells("a is the mean distance inside the group; b the mean distance to the nearest other group.", table(["point", "a", "b", "s"], [["A", "1.0", "10.3866", "0.9037"], ["B", "1.2071", "9.7063", "0.8756"], ["D", "1.0", "9.4462", "0.8941"], ["E", "1.2071", "10.1765", "0.8814"]]), [
      ["Silhouette for a few points of the two-group solution."],
      ["A is far closer to its own group (a = 1) than to the other (b ≈ 10.4): s = 0.9037.", [[1, 0, 3]]],
      ["Every point scores close to 1: the two groups are well separated (mean 0.8853).", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3]]],
    ]),
  },
  {
    t: "Hierarchical clustering: build a tree",
    lv: 1,
    s: `Four stops lie on a road at 1, 2, 7 and 10 km (P, Q, R, S). Agglomerative clustering starts with one cluster per point and repeatedly merges the two closest clusters. With single linkage the distance between clusters is the minimum distance between their members: the closest pair is P, Q (1), then R, S (3), then {P,Q} with {R,S} at min(6, 9, 5, 8) = 5. The tree records every merge; you can cut it afterwards instead of fixing the number of groups up front. Early merges are never undone. (Divisive clustering works top-down instead.)`,
    r: `Full distance matrices and trees get expensive as the number of rows grows.`,
    i: `Perform single-linkage clustering on the points 1, 2, 7, 10 and give the merge heights.`,
    c: py`
import numpy as np

x = np.array([1.0, 2.0, 7.0, 10.0])
clusters = [[0], [1], [2], [3]]
D = np.abs(x[:, None] - x[None])
while len(clusters) > 1:
    best = None
    for i in range(len(clusters)):
        for j in range(i + 1, len(clusters)):
            d = min(D[a, b] for a in clusters[i] for b in clusters[j])
            if best is None or d < best[0]:
                best = (d, i, j)
    d, i, j = best
    print([x[a].tolist() for a in clusters[i]], [x[b].tolist() for b in clusters[j]], float(d))
    clusters[i] = clusters[i] + clusters[j]
    del clusters[j]`,
    v: cells("The distance matrix between the four stops (km).", table(["", "P", "Q", "R", "S"], [["P", "0", "1", "6", "9"], ["Q", "1", "0", "5", "8"], ["R", "6", "5", "0", "3"], ["S", "9", "8", "3", "0"]]), [
      ["Distances along the road: |x₁ − x₂|."],
      ["Smallest distance: P–Q = 1 → merge {P, Q}.", [[1, 2, 2], [2, 1, 1]]],
      ["Next smallest: R–S = 3 → merge {R, S}.", [[3, 4, 4], [4, 3, 3]]],
      ["Finally {P,Q} to {R,S}: min(6, 9, 5, 8) = 5 → one cluster.", [[1, 3, 4], [2, 3, 4]]],
    ]),
  },
  {
    t: "Reading a dendrogram",
    lv: 1,
    s: `Leaves at the bottom are single stops. A horizontal bar joins two branches at the height equal to their merge distance: P, Q at 1 and R, S at 3 (single linkage). Draw a horizontal cut between join heights; the branches it crosses are the clusters. Cut at 0.5 → 4 clusters; at 2 → 3 ({P,Q}, {R}, {S}); at 4 → 2 ({P,Q}, {R,S}); at 6 → 1. Leaf spacing is layout, not a distance scale, and branches can be flipped without changing the result. Drag the cut.`,
    r: `A large vertical gap suggests a cut but does not prove the true number of groups. Avoid cutting exactly at a join when explaining.`,
    i: `With merge heights 1, 3 and 5, how many clusters does a cut at height 2 give?`,
    c: py`
import numpy as np

heights = np.array([1.0, 3.0, 5.0])
for cut in (0.5, 2, 4, 6):
    print(cut, int(len(heights) + 1 - (heights <= cut).sum()))`,
    v: plot("Single-linkage dendrogram of P, Q, R, S. The horizontal line is the cut.", {
      x: [0, 5], y: [0, 6.5], labels: ["stops P, Q, R, S (layout only)", "merge distance (km)"],
      params: [par("h", "cut height", 0.5, 6, 0.5, 4)],
      defs: [["groups", "4-step(h-1)-step(h-3)-step(h-5)"]],
      readout: ["cut at {h} km → {groups} cluster(s)"],
      steps: [["Cut at 0.5: four singletons.", { h: 0.5 }], ["Cut at 2: three clusters — only P, Q have joined.", { h: 2 }], ["Cut at 4: {P,Q} and {R,S}.", { h: 4 }], ["Cut at 6: everything is one cluster.", { h: 6 }]],
    }, [
      seg("1", "0", "1", "1", { c: "accent" }), seg("2", "0", "2", "1", { c: "accent" }), seg("1", "1", "2", "1", { c: "accent" }),
      seg("3", "0", "3", "3", { c: "accent" }), seg("4", "0", "4", "3", { c: "accent" }), seg("3", "3", "4", "3", { c: "accent" }),
      seg("1.5", "1", "1.5", "5", { c: "accent" }), seg("3.5", "3", "3.5", "5", { c: "accent" }), seg("1.5", "5", "3.5", "5", { c: "accent" }),
      hline("h", { c: "bad", dash: true, label: "cut" }),
    ]),
  },
  {
    t: "Linkage changes the answer",
    lv: 2,
    s: `"Distance between clusters" needs a rule. {{Single}}: the smallest cross-pair distance (can chain through thin bridges). {{Complete}}: the largest (prefers compact clusters). {{Average}}: the mean over all cross pairs. For U = {P,Q}, V = {R,S}: single min(6, 9, 5, 8) = 5, complete max = 9, average (6 + 9 + 5 + 8)/4 = 7: same first merges (1 and 3), different final height. {{Ward}} merges the pair with the smallest increase in within-cluster SSE: ΔJ = nᵤnᵥ/(nᵤ+nᵥ) × ‖μᵤ − μᵥ‖² = 49 here; SciPy reports √(2ΔJ) ≈ 9.899.`,
    r: `Always state the linkage when interpreting a tree. Ward needs Euclidean geometry; plot heights depend on the library's convention.`,
    i: `Compute single, complete and average linkage between {1, 2} and {7, 10}.`,
    c: py`
import numpy as np

U, V = np.array([1.0, 2.0]), np.array([7.0, 10.0])
cross = np.abs(U[:, None] - V[None]).ravel()
print(cross.min(), cross.max(), cross.mean())
delta = len(U) * len(V) / (len(U) + len(V)) * (U.mean() - V.mean()) ** 2
print(delta, round(float(np.sqrt(2 * delta)), 3))`,
    v: plot("The final merge height of the same four stops under the three rules.", {
      x: [0, 5], y: [0, 10], labels: ["stops P, Q, R, S", "merge distance (km)"],
      params: [par("m", "linkage: 1 single · 2 average · 3 complete", 1, 3, 1, 1)],
      defs: [["H", "5*step(1.5-m)+7*step(m-1.5)*step(2.5-m)+9*step(m-2.5)"]],
      readout: ["final merge at {H} km (first merges stay at 1 and 3)"],
      steps: [["Single: 5.", { m: 1 }], ["Average: 7.", { m: 2 }], ["Complete: 9.", { m: 3 }]],
    }, [
      seg("1", "0", "1", "1", { c: "accent" }), seg("2", "0", "2", "1", { c: "accent" }), seg("1", "1", "2", "1", { c: "accent" }),
      seg("3", "0", "3", "3", { c: "accent" }), seg("4", "0", "4", "3", { c: "accent" }), seg("3", "3", "4", "3", { c: "accent" }),
      seg("1.5", "1", "1.5", "H", { c: "warn" }), seg("3.5", "3", "3.5", "H", { c: "warn" }), seg("1.5", "H", "3.5", "H", { c: "warn" }),
    ]),
  },
  {
    t: "DBSCAN: groups defined by density",
    lv: 1,
    s: `DBSCAN (Density-Based Spatial Clustering of Applications with Noise) needs no K. You give a neighbourhood radius {{ε (eps)}} and a minimum count {{min_samples}} (including the point itself). The neighbourhood is {{N_ε(p) = {q : d(p, q) ≤ ε}}}. A {{core}} point has at least min_samples points in it; a {{border}} point is not core but lies within ε of a core point; everything else is {{noise}} (label −1). Clusters grow outward through connected core points. Keep A–F and add G = (5, 1), isolated, and H = (2.8, 1), at the edge of the left group; drag ε to see how many points fall inside C's neighbourhood.`,
    r: `The result can be zero, one or many clusters. Noise is an algorithmic label under the chosen settings; it does not prove a customer is erroneous or unimportant.`,
    i: `Define core, border and noise points.`,
    v: plot("The ring is the ε-neighbourhood of point C. Points inside it are C's neighbours (C counts itself).", {
      x: eqX(-0.5, 9.5, 4.5), y: [-0.5, 9.5], labels: ["east (km)", "north (km)"],
      params: [par("eps", "ε (km)", 0.5, 4, 0.1, 1.5)],
      defs: [["inside", AH.map((p) => `step(eps-${dist(p, [2, 1])}+0.000001)`).join("+")]],
      readout: ["ε = {eps}: C has {inside} point(s) in its neighbourhood (itself included) → core if at least 3"],
      steps: [["ε = 1.5: A, B, C and H are inside — 4 points, so C is core.", { eps: 1.5 }], ["ε = 0.7: only C itself: not core.", { eps: 0.7 }], ["ε = 3: G (isolated) is still outside.", { eps: 3 }]],
    }, [
      circle("2", "1", "eps", { c: "warn" }),
      ...AH.map(([x, y], i) => pt(String(x), String(y), { c: i === 6 ? "bad" : i >= 3 && i <= 5 ? "good" : "info", label: names[i] ?? "" })),
    ]),
  },
  {
    t: "DBSCAN calculations: count, then expand",
    lv: 2,
    s: `With ε = 1.5 km and min_samples = 3, count each point's neighbours (itself included): A, B: {A,B,C} = 3, core. C: {A,B,C,H} = 4, core (d(C,H) = 0.8). D, E, F: 3 each, core. G: only itself = 1, noise (its nearest point is H at 2.2 km). H: {C, H} = 2, so not core — but C is core and 0.8 away, so H is a border point (d(A,H) = 1.8 and d(B,H) ≈ 2.059 are outside ε). Expanding from core A reaches B, C, then H joins as a border and cannot expand further; D starts a second cluster. Result: {A, B, C, H}, {D, E, F}, noise {G}.`,
    r: `min_samples is a local density test, not a desired cluster size. A noise point later found within ε of a core point becomes a border point. In scikit-learn noise is −1 and the point counts toward min_samples.`,
    i: `Why is H a border point and G noise?`,
    c: py`
import numpy as np

X = np.array([[1, 1], [1, 2], [2, 1], [8, 8], [8, 9], [9, 8], [5, 1], [2.8, 1]])
eps, min_samples = 1.5, 3
D = np.sqrt(((X[:, None] - X[None]) ** 2).sum(2))
neighbours = [np.flatnonzero(D[i] <= eps) for i in range(len(X))]
core = [len(n) >= min_samples for n in neighbours]
print([len(n) for n in neighbours], core)
labels = np.full(len(X), -1)
cluster = 0
for i in range(len(X)):
    if labels[i] != -1 or not core[i]:
        continue
    stack = [i]
    labels[i] = cluster
    while stack:
        p = stack.pop()
        if core[p]:
            for q in neighbours[p]:
                if labels[q] == -1:
                    labels[q] = cluster
                    stack.append(q)
    cluster += 1
print(labels.tolist(), float(np.mean(labels == -1)))`,
    v: cells("Neighbours within 1.5 km (including the point itself).", table(["point", "neighbours", "count", "role"], [["A", "A, B, C", "3", "core"], ["B", "A, B, C", "3", "core"], ["C", "A, B, C, H", "4", "core"], ["D", "D, E, F", "3", "core"], ["E", "D, E, F", "3", "core"], ["F", "D, E, F", "3", "core"], ["G", "G", "1", "noise"], ["H", "C, H", "2", "border"]]), [
      ["Count every point's ε-neighbourhood."],
      ["Six points have at least 3 neighbours: core.", [[1, 3, 3], [2, 3, 3], [3, 3, 3], [4, 3, 3], [5, 3, 3], [6, 3, 3]]],
      ["H has only 2 but touches core C: border. It joins the cluster but cannot expand it.", [[8, 3, 3]]],
      ["G has no neighbours: noise. Result: {A,B,C,H}, {D,E,F}, noise {G}.", [[7, 3, 3]]],
    ]),
  },
  {
    t: "Choose eps and min_samples",
    lv: 2,
    s: `A single setting can split, join or erase apparent groups. With min_samples = 3: ε = 0.7 makes every point noise; ε = 1.5 gives two clusters, H border and G noise; with min_samples = 4 and ε = 1.5, C is the only core, {A, B, C, H} is one cluster and D, E, F, G become noise. Inspect the sorted distances to the second-nearest OTHER point (≈ 1, 1, 1, 1.414, 1.414, 1.414, 1.8, 3 km): a bend between dense and isolated points suggests candidate ε values. Drag both settings below: filled = core, ring = border, small grey = noise.`,
    r: `Choose features, units and the metric first. Very different densities are hard for one global ε (try OPTICS or HDBSCAN). In high dimensions distances lose contrast. Do not copy ε = 1.5 to another scale.`,
    i: `What happens to D, E, F if min_samples rises from 3 to 4 at ε = 1.5?`,
    v: plot("Move ε and min_samples and watch every point change role.", {
      x: eqX(-0.5, 9.5, 4.5), y: [-0.5, 9.5], labels: ["east (km)", "north (km)"],
      params: [par("eps", "ε (km)", 0.5, 3.5, 0.1, 1.5), par("minpts", "min_samples", 2, 5, 1, 3)],
      defs: dbDefs,
      readout: ["core points: {nCore} · border points: {nBord} · noise: {8-nCore-nBord}"],
      steps: [["ε = 1.5, min = 3: six core points (A–F), H border, G noise.", { eps: 1.5, minpts: 3 }], ["ε = 0.7: every point is noise.", { eps: 0.7, minpts: 3 }], ["ε = 1.5, min = 4: only C is core; D, E, F become noise.", { eps: 1.5, minpts: 4 }]],
    }, AH.flatMap(([x, y], i) => [
      pt(String(x), String(y), { c: "accent", label: names[i] ?? "", show: `core${i}-0.5` }),
      pt(String(x), String(y), { c: "warn", label: names[i] ?? "", show: `bord${i}-0.5` }),
      pt(String(x), String(y), { c: "muted", label: names[i] ?? "", show: `0.5-core${i}-bord${i}` }),
    ])),
  },
  {
    t: "Which method fits which shape?",
    lv: 2,
    s: `There is no universally best method. K-means (nearest mean) needs K, assigns every point and suits compact groups; it struggles with outliers and curved shapes. Hierarchical clustering needs a metric, linkage and cut, shows nested structure and costs more with many rows. DBSCAN (connected density) needs ε and min_samples, marks noise and follows irregular dense shapes, but a single ε struggles when densities differ. K-means does not enforce equal sizes or capacity limits. DBSCAN and agglomerative clustering have no natural predict for new points like k-means does.`,
    r: `For compact delivery zones start with k-means; for several resolutions use a tree; for hotspots plus isolated customers use DBSCAN.`,
    i: `Which clustering method would you use for crescent-shaped dense groups, and why not k-means?`,
    v: compare("Three methods compared.", ["K-means", "Hierarchical", "DBSCAN"], [
      ["Main idea", "nearest mean", "repeated merge or split", "connected density"],
      ["Choose K first?", "yes", "no — cut the tree later", "no"],
      ["Marks noise?", "no, assigns all", "usually no", "yes"],
      ["Strong use", "compact groups", "nested structure", "irregular dense shapes"],
      ["Key choices", "K, scaling, seeds", "metric, linkage, cut", "metric, ε, min_samples"],
      ["Common difficulty", "outliers, curved groups", "cost, early merges", "varying density"],
    ]),
  },
  {
    t: "An end-to-end clustering project",
    lv: 1,
    s: `Turn a plot into a defensible result. Define the decision (hotspots? zones? behaviour summary?) and what a useful group would change. Define one row and its features (if rows are deliveries, frequent locations carry more weight). Check missing values, impossible coordinates, duplicates, extremes; choose transformations and a metric before comparing algorithms. Plot first (pair plots or PCA in many dimensions). Try a small justified set of settings and record preprocessing with each result. Evaluate compactness, stability, sizes, noise share and usefulness; profile groups in original units; document everything.`,
    r: `There is no automatic "clustering accuracy" without a reference. Report DBSCAN noise separately (here 1/8 = 12.5%).`,
    i: `Outline the steps of a clustering project and how you would know the result is useful.`,
    v: layers("From a question to a documented result.", [
      "Define|the decision, the row, the features|i",
      "Prepare|missing, duplicates, units, scale, metric|w",
      "Look|plot, pair plots, PCA for inspection|g",
      "Cluster|2–3 justified algorithms and settings|g",
      "Evaluate|silhouette, stability, sizes, noise, usefulness|g",
      "Profile and document|original-unit summaries, parameters, seeds, versions|b",
    ], "question → result"),
  },
];

void [L, P, bars, curve, flow, hline];
